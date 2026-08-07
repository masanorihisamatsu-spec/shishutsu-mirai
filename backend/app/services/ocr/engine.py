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
    """

    def __init__(self, lang: str = "jpn") -> None:
        self.lang = lang

    def extract_text(self, image: Image.Image) -> str:
        return pytesseract.image_to_string(image, lang=self.lang)
