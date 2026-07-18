/**
 * バックエンドの ImportResultResponse スキーマ（backend/app/schemas/import_result.py）
 * に対応するレスポンス型。
 */
export interface ImportResultResponse {
  source_format: string;
  registered_count: number;
  duplicate_count: number;
  error_count: number;
  errors: string[];
}
