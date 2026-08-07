"""
OCR認識精度の比較検証用スクリプト。

本番のリクエストパス（OcrService）には組み込まない。Tesseractを何度も呼び出すため、
1リクエストあたりの処理コストを増やしたくない（Render無料プラン等のリソース制約）という
理由で、前処理バリエーション × PSM × 言語の比較は開発者がローカルで手動実行する
ツールとして切り出している。

使い方:
    cd backend
    python scripts/ocr_compare.py <画像パス> [--out-dir out] [--psm 4,6] [--langs jpn,jpn+eng]

指定した画像に対して「前処理バリエーション × PSM × 言語」の組み合わせごとにOCRを実行し、
- 前処理後の画像を --out-dir に保存（目視比較用）
- 各組み合わせの認識結果テキストを標準出力に一覧表示
する。実際に文字化けした本番の写真を使って、どの組み合わせが一番読み取れるかを
比較・検証するために使う。
"""

import argparse
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent.parent))

import pytesseract  # noqa: E402
from PIL import Image, ImageOps  # noqa: E402

from app.services.ocr.preprocessing import preprocess_for_ocr  # noqa: E402

PREPROCESS_VARIANTS: dict[str, dict[str, bool]] = {
    # 縮小+グレースケールのみ（改善前の前処理相当。比較のベースライン）
    "gray_only": {"apply_denoise": False, "apply_sharpen": False, "apply_binarize": False},
    # ノイズ除去+コントラスト補正まで（二値化なし）
    "denoise_contrast": {"apply_denoise": True, "apply_sharpen": False, "apply_binarize": False},
    # 今回追加した全ステップ（本番の既定値）
    "full": {"apply_denoise": True, "apply_sharpen": True, "apply_binarize": True},
}


def load_upright_image(path: Path) -> Image.Image:
    image = Image.open(path)
    image.load()
    return ImageOps.exif_transpose(image) or image


def run_comparison(image_path: Path, out_dir: Path, psm_values: list[int], langs: list[str]) -> None:
    out_dir.mkdir(parents=True, exist_ok=True)
    original = load_upright_image(image_path)

    print(f"入力画像: {image_path}（size={original.size}）")
    print("-" * 60)

    for variant_name, variant_kwargs in PREPROCESS_VARIANTS.items():
        processed = preprocess_for_ocr(original, **variant_kwargs)

        debug_path = out_dir / f"{image_path.stem}_{variant_name}.png"
        processed.save(debug_path, format="PNG")
        print(f"[前処理: {variant_name}] 画像保存先: {debug_path}")

        for lang in langs:
            for psm in psm_values:
                config = f"--oem 3 --psm {psm}"
                text = pytesseract.image_to_string(processed, lang=lang, config=config)
                print(f"  lang={lang} psm={psm}:")
                print("    " + text.replace("\n", "\n    ").strip())
        print()


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("image", type=Path, help="比較したいレシート画像のパス")
    parser.add_argument("--out-dir", type=Path, default=Path("scripts/ocr_compare_out"))
    parser.add_argument("--psm", default="4,6", help="カンマ区切りのPSM値（既定: 4,6）")
    parser.add_argument("--langs", default="jpn,jpn+eng", help="カンマ区切りの言語（既定: jpn,jpn+eng）")
    args = parser.parse_args()

    psm_values = [int(v) for v in args.psm.split(",")]
    langs = [v.strip() for v in args.langs.split(",")]

    run_comparison(args.image, args.out_dir, psm_values, langs)


if __name__ == "__main__":
    main()
