"""
OCR 認識率向上のための画像前処理。

- EXIF の Orientation タグに基づく回転補正（スマホ縦横撮影のズレ対策）
- Tesseract の OSD（Orientation and Script Detection）による90度単位の傾き再補正
- グレースケール化 + 解像度の正規化（リサイズ）
"""

import re

import pytesseract
from PIL import Image, ImageOps

TARGET_WIDTH = 1600


def correct_exif_orientation(image: Image.Image) -> Image.Image:
    """EXIFのOrientationタグに基づいて画像を正立させる。"""
    return ImageOps.exif_transpose(image) or image


def correct_skew_with_osd(image: Image.Image) -> Image.Image:
    """Tesseract の OSD 機能で90度単位の回転ズレを検出し補正する。"""
    try:
        osd = pytesseract.image_to_osd(image)
    except pytesseract.TesseractError:
        return image

    match = re.search(r"Rotate: (\d+)", osd)
    angle = int(match.group(1)) if match else 0
    if angle:
        return image.rotate(-angle, expand=True, fillcolor="white")
    return image


def resize_for_ocr(image: Image.Image, target_width: int = TARGET_WIDTH) -> Image.Image:
    """画像幅を一定サイズに正規化する（小さすぎる画像は拡大、大きすぎる画像は縮小）。"""
    width, height = image.size
    if width == 0 or height == 0:
        return image

    scale = target_width / width
    if abs(scale - 1.0) < 0.05:
        return image

    new_size = (target_width, max(1, round(height * scale)))
    return image.resize(new_size, Image.LANCZOS)


def preprocess_for_ocr(image: Image.Image) -> Image.Image:
    """OCR にかける直前の画像を作る。元画像（保存用）には影響を与えない。"""
    processed = correct_exif_orientation(image)
    processed = correct_skew_with_osd(processed)
    processed = processed.convert("L")
    processed = resize_for_ocr(processed)
    return processed
