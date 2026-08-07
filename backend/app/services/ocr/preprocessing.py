"""
OCR 認識率向上・Render無料プラン等のリソース制約下での安定動作のための画像前処理。

- EXIF回転補正は呼び出し側（OcrService）が行う前提（ここでは二重に行わない）
- 長辺が上限を超える画像はOCRにかける前に縮小する（小さい画像は拡大しない）。
  スマホ写真は数千px四方になることがあり、Tesseractのメモリ・CPU消費を大きく左右するため、
  OCRの精度に大きく影響しない範囲まで先に縮小してから以降の処理にかける。
- グレースケール化

Tesseract の OSD（Orientation and Script Detection）による90度単位の傾き補正は、
Tesseractをもう1回余分に呼び出すことになりメモリ・CPU消費が大きいため実施しない。
EXIF回転補正で大半のケースはカバーできる想定。
"""

from PIL import Image

MAX_LONG_EDGE = 1500


def resize_for_ocr(image: Image.Image, max_long_edge: int = MAX_LONG_EDGE) -> Image.Image:
    """長辺が max_long_edge を超える場合のみ縮小する（小さい画像を拡大することはしない）。"""
    width, height = image.size
    if width == 0 or height == 0:
        return image

    long_edge = max(width, height)
    if long_edge <= max_long_edge:
        return image

    scale = max_long_edge / long_edge
    new_size = (max(1, round(width * scale)), max(1, round(height * scale)))
    return image.resize(new_size, Image.LANCZOS)


def preprocess_for_ocr(image: Image.Image) -> Image.Image:
    """
    OCR にかける直前の画像を作る。呼び出し側で既にEXIF補正済みの画像を渡す前提。
    先に縮小してから以降の処理にかけることで、グレースケール化・OCR実行の負荷を抑える。
    """
    processed = resize_for_ocr(image)
    processed = processed.convert("L")
    return processed
