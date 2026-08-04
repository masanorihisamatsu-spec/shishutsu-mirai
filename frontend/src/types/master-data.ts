/**
 * カテゴリ・支払方法のマスタデータ。
 * バックエンドのスキーマ（backend/app/schemas/category.py, payment_method.py）が
 * 同じ形（id・name・created_at・updated_at）のため、型を共通化する。
 */
export interface MasterDataOption {
  id: number;
  name: string;
}

export interface MasterDataUpsertPayload {
  name: string;
}

export interface MasterDataApiResponse {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}
