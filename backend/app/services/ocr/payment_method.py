"""
OCR生テキストから支払方法の候補を推定する。

ここで返すのはOCRテキストから読み取れる「生の候補」（正規化した名称）であり、
ユーザーが実際に登録している支払方法一覧（フロントエンドのマスタデータ、
frontend/src/hooks/use-payment-methods.ts 等）とは連携しない。
その一覧に存在するかどうかの判断・フォームへの反映は
frontend/src/services/ocr/mapper.ts が行う（店舗名からのカテゴリ推定と同じ役割分担）。
"""

import re

# 上から順に判定し、最初にマッチしたものを採用する
# （例えば「PayPay」と「現金」の両方が印字されるケースは通常ないが、あればより明確な
#  決済サービス名を優先する）。
_PAYMENT_METHOD_RULES: tuple[tuple[re.Pattern[str], str], ...] = (
    (re.compile("PayPay", re.IGNORECASE), "PayPay"),
    (re.compile("楽天カード|楽天ペイ"), "楽天カード"),
    (re.compile("JCB", re.IGNORECASE), "JCB"),
    (re.compile("現金売上|現金"), "現金"),
)


def find_payment_method_candidates(text: str) -> list[str]:
    """テキスト中にマッチした支払方法名の一覧（ルールの判定順）を返す。診断ログ用。"""
    return [method for pattern, method in _PAYMENT_METHOD_RULES if pattern.search(text)]


def find_payment_method_candidate(text: str) -> str | None:
    for pattern, method in _PAYMENT_METHOD_RULES:
        if pattern.search(text):
            return method
    return None
