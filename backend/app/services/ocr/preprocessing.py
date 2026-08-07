"""
OCR 認識率向上・Render無料プラン等のリソース制約下での安定動作のための画像前処理。

- EXIF回転補正は呼び出し側（OcrService）が行う前提（ここでは二重に行わない）
- 長辺が上限を超える画像はOCRにかける前に縮小する（小さい画像は拡大しない）。
  スマホ写真は数千px四方になることがあり、Tesseractのメモリ・CPU消費を大きく左右するため、
  OCRの精度に大きく影響しない範囲まで先に縮小してから以降の処理にかける。
- グレースケール化 → ノイズ除去 → コントラスト補正 → シャープ化 → 二値化 の順で処理する
  （新規に加えたコントラスト/二値化の効果を、まずスマホ写真特有の粒状ノイズを均してから
  適用するため）。

Tesseract の OSD（Orientation and Script Detection）による90度単位の傾き補正は、
Tesseractをもう1回余分に呼び出すことになりメモリ・CPU消費が大きいため実施しない。
EXIF回転補正で大半のケースはカバーできる想定。
"""

from PIL import Image, ImageFilter, ImageOps

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


def denoise(image: Image.Image) -> Image.Image:
    """スマホカメラのJPEG圧縮・低照度撮影で生じる粒状ノイズを軽減する（中央値フィルタ）。"""
    return image.filter(ImageFilter.MedianFilter(size=3))


def enhance_contrast(image: Image.Image) -> Image.Image:
    """
    ヒストグラムの上下1%を切り捨てつつ0-255にストレッチし、レシートの薄い印字と
    背景（紙の陰影・感熱紙の褪色）のコントラストを強調する。
    """
    return ImageOps.autocontrast(image, cutoff=1)


def sharpen(image: Image.Image) -> Image.Image:
    """縮小・ノイズ除去でわずかに失われた輪郭を軽く強調する（強すぎるとノイズも強調するため控えめに）。"""
    return image.filter(ImageFilter.UnsharpMask(radius=2, percent=120, threshold=3))


def _otsu_threshold(image: Image.Image) -> int:
    """
    大津の二値化法。グレースケール画像のヒストグラム（256階調）だけで計算できるため、
    numpy 等の追加依存なしに実装できる。
    """
    histogram = image.histogram()
    total_pixels = sum(histogram)
    sum_all = sum(level * count for level, count in enumerate(histogram))

    sum_background = 0
    weight_background = 0
    best_threshold = 0
    best_variance = -1.0

    for level, count in enumerate(histogram):
        weight_background += count
        if weight_background == 0:
            continue
        weight_foreground = total_pixels - weight_background
        if weight_foreground == 0:
            break

        sum_background += level * count
        mean_background = sum_background / weight_background
        mean_foreground = (sum_all - sum_background) / weight_foreground

        between_class_variance = (
            weight_background * weight_foreground * (mean_background - mean_foreground) ** 2
        )
        if between_class_variance > best_variance:
            best_variance = between_class_variance
            best_threshold = level

    return best_threshold


def binarize(image: Image.Image) -> Image.Image:
    """大津の二値化法で求めた閾値で白黒化する。"""
    threshold = _otsu_threshold(image)
    return image.point(lambda pixel: 255 if pixel > threshold else 0)


def preprocess_for_ocr(
    image: Image.Image,
    *,
    apply_denoise: bool = True,
    apply_sharpen: bool = True,
    apply_binarize: bool = True,
) -> Image.Image:
    """
    OCR にかける直前の画像を作る。呼び出し側で既にEXIF補正済みの画像を渡す前提。
    先に縮小してから以降の処理にかけることで、各処理の負荷を抑える。

    各ステップを引数で無効化できるようにしているのは、レシートのレイアウトや
    撮影条件によって二値化が逆効果になるケース（薄い印字が閾値で消える等）が
    あり得るため、backend/scripts/ocr_compare.py での比較検証を可能にする目的。
    本番の既定値はすべて有効。
    """
    processed = resize_for_ocr(image)
    processed = processed.convert("L")
    if apply_denoise:
        processed = denoise(processed)
    processed = enhance_contrast(processed)
    if apply_sharpen:
        processed = sharpen(processed)
    if apply_binarize:
        processed = binarize(processed)
    return processed
