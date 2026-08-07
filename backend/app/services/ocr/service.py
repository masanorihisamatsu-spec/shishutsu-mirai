import logging
import uuid
from datetime import date, datetime
from io import BytesIO
from pathlib import Path

from PIL import Image, ImageOps, UnidentifiedImageError

from app.core.config import settings
from app.services.ocr.engine import OcrEngine, TesseractOcrEngine
from app.services.ocr.parser import parse_receipt_text
from app.services.ocr.preprocessing import preprocess_for_ocr

logger = logging.getLogger(__name__)


class OcrProcessingError(Exception):
    """画像の読み込みやOCR処理に失敗した場合に送出する。HTTPへの変換はAPI層の責務。"""


class OcrResult:
    def __init__(
        self,
        store_name: str | None,
        transaction_date: date | None,
        amount: int | None,
        receipt_image: str,
        raw_text: str,
    ) -> None:
        self.store_name = store_name
        self.date = transaction_date
        self.amount = amount
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
        self.engine = engine or TesseractOcrEngine()

    def process_receipt(self, filename: str, content: bytes) -> OcrResult:
        original_image = self._load_image(content)

        # 保存する画像は向きだけ補正し、それ以外は加工しない（人が見返すための記録用のため）。
        # exif_transposeは向き補正が不要な場合は同じオブジェクトを返すため、
        # 新しいオブジェクトが作られた場合のみ元画像を明示的に解放する。
        upright_image = ImageOps.exif_transpose(original_image) or original_image
        if upright_image is not original_image:
            original_image.close()

        ocr_ready_image: Image.Image | None = None
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
                raw_text = self.engine.extract_text(ocr_ready_image)
            except Exception as exc:  # noqa: BLE001 - 前処理/OCR実行起因の例外を一律ドメイン例外に変換する
                logger.exception(
                    "OCR処理に失敗しました（filename=%s, size=%s）", filename, upright_image.size
                )
                raise OcrProcessingError("OCR処理に失敗しました") from exc
        finally:
            upright_image.close()
            if ocr_ready_image is not None:
                ocr_ready_image.close()

        parsed = parse_receipt_text(raw_text)
        return OcrResult(
            store_name=parsed.store_name,
            transaction_date=parsed.date,
            amount=parsed.amount,
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
