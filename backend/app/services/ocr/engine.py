"""
OCR エンジンの抽象化。

現状は Tesseract（ローカルOSS）を使うが、将来 Google Cloud Vision や
マルチモーダルLLM（Claude / GPT-4V 等）による高精度なAI OCRに置き換える際は、
OcrEngine を実装する新しいクラスを追加し、OcrService の生成時に差し替えるだけでよい。
呼び出し側（service.py 以降）は一切変更不要。
"""

from abc import ABC, abstractmethod

import pytesseract
from PIL import Image


class OcrEngine(ABC):
    """画像からテキストを抽出するエンジンのインターフェース。"""

    @abstractmethod
    def extract_text(self, image: Image.Image) -> str:
        """前処理済みの画像からテキストを抽出して返す。"""


class TesseractOcrEngine(OcrEngine):
    """
    OSS の Tesseract OCR を使った実装。日本語のみを認識対象とする。

    Render無料プラン等のメモリ制約下で安定動作させるため、英語のtraineddataは
    同時ロードしない（数字はjpnのtraineddataでも認識できるため実用上の影響は小さい）。
    lang/psm は app.core.config.settings 経由で環境変数からも変更できる
    （例: レシートによっては jpn+eng の方が精度が良いケースの比較検証用）。

    PSM（Page Segmentation Mode）はレシートのような「縦に並んだ短い行の集まり」の
    レイアウトに合わせて既定値を 6（単一の均一なテキストブロックとして扱う）にしている。
    レシートによっては 4（可変サイズの単一カラムとして扱う）の方が精度が良いこともあるため、
    backend/scripts/ocr_compare.py で比較できるようにしてある。
    """

    def __init__(self, lang: str = "jpn", psm: int = 6) -> None:
        self.lang = lang
        self.psm = psm

    def extract_text(self, image: Image.Image) -> str:
        config = f"--oem 3 --psm {self.psm}"
        return pytesseract.image_to_string(image, lang=self.lang, config=config)
