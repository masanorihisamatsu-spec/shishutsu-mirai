/** コンビニ利用回数の集計に使う店舗名キーワード（部分一致） */
const CONVENIENCE_STORE_KEYWORDS = [
  "セブンイレブン",
  "ファミリーマート",
  "ローソン",
  "ミニストップ",
  "デイリーヤマザキ",
  "セイコーマート",
];

export function isConvenienceStore(storeName: string): boolean {
  return CONVENIENCE_STORE_KEYWORDS.some((keyword) => storeName.includes(keyword));
}
