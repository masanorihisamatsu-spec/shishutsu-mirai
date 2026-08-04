import { apiFetch } from "@/lib/api-client";
import type {
  MasterDataApiResponse,
  MasterDataOption,
  MasterDataUpsertPayload,
} from "@/types/master-data";

export async function listPaymentMethods(): Promise<MasterDataOption[]> {
  const response = await apiFetch<MasterDataApiResponse[]>("/payment-methods");
  return response.map((item) => ({ id: item.id, name: item.name }));
}

export function createPaymentMethod(
  payload: MasterDataUpsertPayload
): Promise<MasterDataApiResponse> {
  return apiFetch<MasterDataApiResponse>("/payment-methods", {
    method: "POST",
    body: payload,
  });
}

export function updatePaymentMethod(
  id: number,
  payload: MasterDataUpsertPayload
): Promise<MasterDataApiResponse> {
  return apiFetch<MasterDataApiResponse>(`/payment-methods/${id}`, {
    method: "PUT",
    body: payload,
  });
}

export function deletePaymentMethod(id: number): Promise<void> {
  return apiFetch<void>(`/payment-methods/${id}`, { method: "DELETE" });
}
