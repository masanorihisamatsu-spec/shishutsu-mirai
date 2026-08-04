"use client";

import { FabMenu } from "@/components/common/fab-menu";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { Header } from "@/components/layout/header";
import { HeaderDefaultActions } from "@/components/layout/header-actions";
import { useCategories } from "@/hooks/use-categories";
import { useCreateCategory } from "@/hooks/use-create-category";
import { useCreatePaymentMethod } from "@/hooks/use-create-payment-method";
import { useDeleteCategory } from "@/hooks/use-delete-category";
import { useDeletePaymentMethod } from "@/hooks/use-delete-payment-method";
import { usePaymentMethods } from "@/hooks/use-payment-methods";
import { useUpdateCategory } from "@/hooks/use-update-category";
import { useUpdatePaymentMethod } from "@/hooks/use-update-payment-method";
import { BOTTOM_NAV_ITEMS } from "@/lib/navigation";

import { OptionListManager } from "./option-list-manager";

export function SettingsScreen() {
  const categoriesQuery = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const paymentMethodsQuery = usePaymentMethods();
  const createPaymentMethod = useCreatePaymentMethod();
  const updatePaymentMethod = useUpdatePaymentMethod();
  const deletePaymentMethod = useDeletePaymentMethod();

  return (
    <div className="min-h-screen bg-background pb-28">
      <Header actions={<HeaderDefaultActions />} />

      <main className="mx-auto flex max-w-2xl flex-col gap-6 px-5 py-7 sm:px-8 sm:py-9">
        <div>
          <h1 className="text-xl font-semibold text-foreground sm:text-2xl">設定</h1>
          <p className="mt-1 text-sm text-muted-foreground">カテゴリ・支払方法を管理できます</p>
        </div>

        <OptionListManager
          title="カテゴリ"
          emptyMessage="カテゴリがまだありません"
          options={categoriesQuery.data ?? []}
          isPending={categoriesQuery.isPending}
          isError={categoriesQuery.isError}
          onCreate={(name) => createCategory.mutateAsync({ name })}
          onUpdate={(id, name) => updateCategory.mutateAsync({ id, payload: { name } })}
          onDelete={(id) => deleteCategory.mutateAsync(id)}
        />

        <OptionListManager
          title="支払方法"
          emptyMessage="支払方法がまだありません"
          options={paymentMethodsQuery.data ?? []}
          isPending={paymentMethodsQuery.isPending}
          isError={paymentMethodsQuery.isError}
          onCreate={(name) => createPaymentMethod.mutateAsync({ name })}
          onUpdate={(id, name) => updatePaymentMethod.mutateAsync({ id, payload: { name } })}
          onDelete={(id) => deletePaymentMethod.mutateAsync(id)}
        />
      </main>

      <FabMenu />

      <BottomNavigation items={BOTTOM_NAV_ITEMS} />
    </div>
  );
}
