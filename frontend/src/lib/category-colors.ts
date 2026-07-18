/** カテゴリ名 → グラフ表示色（hex）。ホーム画面のダミーデータと同じ配色に揃える */
export const CATEGORY_COLORS: Record<string, string> = {
  食費: "#C98A8E",
  日用品: "#B9A38C",
  交通費: "#8C9BA6",
  趣味: "#C9A96E",
  医療費: "#8FA377",
  その他: "#9B8EA6",
};

const FALLBACK_COLOR = "#9CA3AF";

export function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category] ?? FALLBACK_COLOR;
}
