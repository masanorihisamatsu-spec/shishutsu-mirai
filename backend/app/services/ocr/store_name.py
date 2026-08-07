"""
店舗名だけを対象にした専用OCR。

店舗名は通常レシート上部（ヘッダー部分）にしか出てこないため、レシート全体を
1回でOCRするより「上部だけを切り出して」「店舗名向けに前処理・PSMを変えて」
別途OCRした方が、下部の明細行のノイズに引っ張られず精度が上がりやすい。

ここでの処理はあくまで店舗名の精度改善が目的であり、失敗しても金額・日付の
抽出（service.py が最初に行う全体OCR）には一切影響しない設計にしている
（呼び出し側で try/except し、失敗時は全体テキストからの候補にフォールバックする）。
"""

import logging

from PIL import Image

from app.services.ocr.engine import TesseractOcrEngine
from app.services.ocr.parser import find_store_name_candidate
from app.services.ocr.preprocessing import preprocess_for_ocr

logger = logging.getLogger(__name__)

# 店舗名はレシート上部（ヘッダー〜数行目）に収まることが多いため、上から3割程度を切り出す。
# 対象を絞ることで、明細行の数字の並び等に引っ張られた誤爆を減らす。
STORE_NAME_REGION_HEIGHT_FRACTION = 0.32

# (PSM, 二値化するか) の組み合わせを順に試し、最初に「もっともらしい」候補が
# 見つかった時点で採用する。二値化は薄い印字を消してしまうことがある一方で
# ノイズには強いため、あり/なし両方を試す。
# psm=6: 複数行の均一なテキストブロックとして扱う（ヘッダー全体を切り出した場合向け）
# psm=7: 1行のテキストとして扱う（店舗名がはっきり1行に収まっている場合向け）
_STORE_NAME_ATTEMPTS: tuple[dict, ...] = (
    {"psm": 6, "apply_binarize": True},
    {"psm": 7, "apply_binarize": False},
    {"psm": 6, "apply_binarize": False},
)


def crop_store_name_region(
    image: Image.Image, height_fraction: float = STORE_NAME_REGION_HEIGHT_FRACTION
) -> Image.Image:
    """レシート上部（店舗名がある想定の領域）だけを切り出す。"""
    width, height = image.size
    crop_height = max(1, min(height, round(height * height_fraction)))
    return image.crop((0, 0, width, crop_height))


def extract_store_name(region_image: Image.Image, *, lang: str) -> str | None:
    """
    店舗名領域の画像から、前処理・PSMの組み合わせを変えつつ店舗名候補を抽出する。
    見つからなければ None を返す（呼び出し側で全体テキストの候補にフォールバックする）。
    """
    for attempt in _STORE_NAME_ATTEMPTS:
        processed = preprocess_for_ocr(
            region_image,
            apply_denoise=True,
            apply_sharpen=True,
            apply_binarize=attempt["apply_binarize"],
        )
        try:
            engine = TesseractOcrEngine(lang=lang, psm=attempt["psm"])
            text = engine.extract_text(processed)
        finally:
            processed.close()

        candidate = find_store_name_candidate(text)

        logger.info(
            "店舗名専用OCR（psm=%s, binarize=%s）: raw=%r candidate=%r",
            attempt["psm"],
            attempt["apply_binarize"],
            text,
            candidate,
        )

        if candidate:
            return candidate

    return None
