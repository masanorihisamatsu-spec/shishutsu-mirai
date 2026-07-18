export interface Insight {
  id: string;
  message: string;
  /** 数値が大きいほど優先度が高い（表示順のソートに使用） */
  priority: number;
}
