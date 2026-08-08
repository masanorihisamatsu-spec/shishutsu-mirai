import logging
import uuid
from datetime import date, datetime
from io import BytesIO
from pathlib import Path

from PIL import Image, ImageOps, UnidentifiedImageError

from app.core.config import settings
from app.services.ocr.engine import OcrEngine, TesseractOcrEngine
from app.services.ocr.parser import (
    find_amount_candidates,
    find_date_candidates,
    find_store_name_candidates,
    parse_receipt_text,
)
from app.services.ocr.payment_method import (
    find_payment_method_candidate,
    find_payment_method_candidates,
)
from app.services.ocr.preprocessing import preprocess_for_ocr
from app.services.ocr.store_name import crop_store_name_region, extract_store_name

logger = logging.getLogger(__name__)


class OcrProcessingError(Exception):
    """画像の読み込みやOCR処理に失敗した場合に送出する。HTTPへの変換はAPI層の責務。"""


class OcrResult:
    def __init__(
        self,
        store_name: str | None,
        transaction_date: date | None,
        amount: int | None,
        payment_method: str | None,
        receipt_image: str,
        raw_text: str,
    ) -> None:
        self.store_name = store_name
        self.date = transaction_date
        self.amount = amount
        self.payment_method = payment_method
        self.receipt_image = receipt_image
        self.raw_text = raw_text


class OcrService:
    """
    レシート画像1枚を受け取り、
      1. 元画像を保存する（保存用画像は加工しない。回転補正のみ行う）
      2. OCR向けに前処理した画像でテキストを抽出する
      3. テキストから店舗名・日付・金額を抜き出す
    までを担当する。
    """

    def __init__(self, engine: OcrEngine | None = None) -> None:
        self.engine = engine or TesseractOcrEngine(lang=settings.ocr_lang, psm=settings.ocr_psm)

    def process_receipt(self, filename: str, content: bytes) -> OcrResult:
        original_image = self._load_image(content)

        # 保存する画像は向きだけ補正し、それ以外は加工しない（人が見返すための記録用のため）。
        # exif_transposeは向き補正が不要な場合は同じオブジェクトを返すため、
        # 新しいオブジェクトが作られた場合のみ元画像を明示的に解放する。
        upright_image = ImageOps.exif_transpose(original_image) or original_image
        if upright_image is not original_image:
            original_image.close()

        ocr_ready_image: Image.Image | None = None
        store_name_region: Image.Image | None = None
        try:
            # 「画像保存」と「前処理+OCR実行」を分けて捕捉することで、422のdetailだけで
            # どちらの段階（ディスク書き込み起因か、Tesseract起因か）で失敗したか切り分けられるようにする。
            try:
                receipt_image_path = self._save_image(upright_image, filename)
            except Exception as exc:  # noqa: BLE001 - 画像保存起因の例外を一律ドメイン例外に変換する
                logger.exception("レシート画像の保存に失敗しました（filename=%s）", filename)
                raise OcrProcessingError("画像の保存に失敗しました") from exc

            try:
                ocr_ready_image = preprocess_for_ocr(upright_image)
                if settings.ocr_debug_save_preprocessed:
                    self._save_debug_preprocessed_image(ocr_ready_image, receipt_image_path)

                raw_text = self.engine.extract_text(ocr_ready_image)
            except Exception as exc:  # noqa: BLE001 - 前処理/OCR実行起因の例外を一律ドメイン例外に変換する
                logger.exception(
                    "OCR処理に失敗しました（filename=%s, size=%s）", filename, upright_image.size
                )
                raise OcrProcessingError("OCR処理に失敗しました") from exc

            # 生OCR結果と、各項目の候補一覧・最終採用値を必ずログに残す（診断用）。
            # カテゴリは店舗名に加えてユーザーが実際に登録しているカテゴリ一覧を参照して
            # 推定するため、そのデータを持たないバックエンドではなくフロントエンド側でログする
            # （frontend/src/services/ocr/mapper.ts を参照）。
            logger.info(
                "OCR生テキスト（filename=%s, lang=%s, psm=%s）: %r",
                filename,
                getattr(self.engine, "lang", "?"),
                getattr(self.engine, "psm", "?"),
                raw_text,
            )

            parsed = parse_receipt_text(raw_text)
            payment_method = find_payment_method_candidate(raw_text)

            logger.info(
                "日付抽出（filename=%s）: 候補一覧=%s 採用=%s",
                filename,
                find_date_candidates(raw_text),
                parsed.date,
            )
            logger.info(
                "金額抽出（filename=%s）: 候補一覧=%s 採用=%s",
                filename,
                find_amount_candidates(raw_text),
                parsed.amount,
            )
            logger.info(
                "支払方法抽出（filename=%s）: 候補一覧=%s 採用=%s",
                filename,
                find_payment_method_candidates(raw_text),
                payment_method,
            )
            logger.info(
                "店舗名抽出_全体OCR（filename=%s）: 候補一覧=%s 採用=%s",
                filename,
                find_store_name_candidates(raw_text),
                parsed.store_name,
            )

            # 店舗名はレシート上部だけを切り出して専用のOCRを追加で試みた方が精度が良いことが
            # 多いため、ここで別途試す。失敗しても金額・日付（parsedとして確定済み）や
            # 全体テキストからの店舗名候補には一切影響させない（フォールバックするだけ）。
            store_name = parsed.store_name
            try:
                store_name_region = crop_store_name_region(upright_image)
                cropped_store_name = extract_store_name(
                    store_name_region, lang=getattr(self.engine, "lang", settings.ocr_lang)
                )
                if cropped_store_name:
                    store_name = cropped_store_name
                logger.info(
                    "店舗名抽出結果（filename=%s）: 全体OCR候補=%r 領域専用OCR候補=%r 採用=%r",
                    filename,
                    parsed.store_name,
                    cropped_store_name,
                    store_name,
                )
            except Exception:  # noqa: BLE001 - 店舗名専用OCRの失敗でOCR処理全体を失敗させない
                logger.exception(
                    "店舗名専用OCRに失敗しました。全体OCRからの候補にフォールバックします（filename=%s）",
                    filename,
                )
        finally:
            upright_image.close()
            if ocr_ready_image is not None:
                ocr_ready_image.close()
            if store_name_region is not None:
                store_name_region.close()

        return OcrResult(
            store_name=store_name,
            transaction_date=parsed.date,
            amount=parsed.amount,
            payment_method=payment_method,
            receipt_image=receipt_image_path,
            raw_text=raw_text,
        )

    def _load_image(self, content: bytes) -> Image.Image:
        try:
            image = Image.open(BytesIO(content))
            image.load()
        except UnidentifiedImageError as exc:
            logger.exception("レシート画像の読み込みに失敗しました（size=%d bytes）", len(content))
            raise OcrProcessingError("画像を読み込めませんでした") from exc
        return image

    def _save_image(self, image: Image.Image, original_filename: str) -> str:
        uploads_dir = Path(settings.uploads_dir)
        uploads_dir.mkdir(parents=True, exist_ok=True)

        suffix = Path(original_filename).suffix.lower()
        is_png = suffix == ".png"

        filename = f"{datetime.now():%Y%m%d_%H%M%S}_{uuid.uuid4().hex[:8]}{'.png' if is_png else '.jpg'}"
        path = uploads_dir / filename

        if is_png:
            image.save(path, format="PNG")
        else:
            image.convert("RGB").save(path, format="JPEG", quality=90)

        return (Path(settings.uploads_dir) / filename).as_posix()

    def _save_debug_preprocessed_image(self, image: Image.Image, receipt_image_path: str) -> None:
        """
        OCR直前（前処理後）の画像を保存版と並べて確認できるようにするデバッグ用途。
        settings.ocr_debug_save_preprocessed が True の場合のみ呼ばれる。
        保存失敗はOCR本処理の成否に影響させない。
        """
        debug_path = Path(receipt_image_path).with_name(
            f"{Path(receipt_image_path).stem}_preprocessed.png"
        )
        try:
            image.save(debug_path, format="PNG")
        except Exception:  # noqa: BLE001 - デバッグ用保存の失敗でOCR自体を失敗させない
            logger.exception("前処理後画像のデバッグ保存に失敗しました（path=%s）", debug_path)
