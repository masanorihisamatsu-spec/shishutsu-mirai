import { apiFetch } from "@/lib/api-client";
import type {
  MasterDataApiResponse,
  MasterDataOption,
  MasterDataUpsertPayload,
} from "@/types/master-data";

export async function listCategories(): Promise<MasterDataOption[]> {
  const response = await apiFetch<MasterDataApiResponse[]>("/categories");
  return response.map((item) => ({ id: item.id, name: item.name }));
}

export function createCategory(
  payload: MasterDataUpsertPayload
): Promise<MasterDataApiResponse> {
  return apiFetch<MasterDataApiResponse>("/categories", {
    method: "POST",
    body: payload,
  });
}

export function updateCategory(
  id: number,
  payload: MasterDataUpsertPayload
): Promise<MasterDataApiResponse> {
  return apiFetch<MasterDataApiResponse>(`/categories/${id}`, {
    method: "PUT",
    body: payload,
  });
}

export function deleteCategory(id: number): Promise<void> {
  return apiFetch<void>(`/categories/${id}`, { method: "DELETE" });
}
