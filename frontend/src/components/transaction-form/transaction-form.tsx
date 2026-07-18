"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { Trash2 } from "lucide-react";

import { BackHeader } from "@/components/common/back-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Toast, type ToastState } from "@/components/ui/toast";
import { CATEGORY_OPTIONS, PAYMENT_METHOD_OPTIONS } from "@/data/expense-options-dummy-data";
import { useCreateTransaction } from "@/hooks/use-create-transaction";
import { useDeleteTransaction } from "@/hooks/use-delete-transaction";
import { useScanReceipt } from "@/hooks/use-scan-receipt";
import { useUpdateTransaction } from "@/hooks/use-update-transaction";
import { ApiError } from "@/lib/api-client";
import { CATEGORY_ICONS, PAYMENT_METHOD_ICONS } from "@/lib/option-icons";
import { applyOcrResultToFormValues, consumeOcrPrefill } from "@/services/ocr";
import type { TransactionFormValues } from "@/types/transaction-form";

import { FormField } from "./form-field";
import { OptionTileGrid } from "./option-tile-grid";
import { ReceiptImagePicker } from "./receipt-image-picker";

const CATEGORY_TILE_OPTIONS = CATEGORY_OPTIONS.map((value) => ({
  value,
  icon: CATEGORY_ICONS[value],
}));

const PAYMENT_METHOD_TILE_OPTIONS = PAYMENT_METHOD_OPTIONS.map((value) => ({
  value,
  icon: PAYMENT_METHOD_ICONS[value],
}));

interface FormErrors {
  date?: string;
  storeName?: string;
  amount?: string;
  category?: string;
  paymentMethod?: string;
}

type TransactionFormProps =
  | { mode: "create"; initialValues: TransactionFormValues }
  | { mode: "edit"; transactionId: number; initialValues: TransactionFormValues };

export function TransactionForm(props: TransactionFormProps) {
  const { mode, initialValues } = props;
  const router = useRouter();
  const createTransaction = useCreateTransaction();
  const updateTransaction = useUpdateTransaction();
  const deleteTransaction = useDeleteTransaction();
  const scanReceipt = useScanReceipt();

  const [values, setValues] = useState<TransactionFormValues>(initialValues);
  const [receiptImage, setReceiptImage] = useState<File | null>(null);
  const [receiptImagePath, setReceiptImagePath] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [toast, setToast] = useState<ToastState | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // データ取込センターでOCRした結果を、この画面に来た直後だけ一度反映する
  useEffect(() => {
    if (mode !== "create") return;
    const prefill = consumeOcrPrefill();
    if (!prefill) return;

    setValues((prev) => applyOcrResultToFormValues(prev, prefill));
    setReceiptImagePath(prefill.receipt_image);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isSubmitting =
    mode === "create" ? createTransaction.isPending : updateTransaction.isPending;

  const updateField = <K extends keyof TransactionFormValues>(
    key: K,
    value: TransactionFormValues[K]
  ) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleReceiptImageChange = (file: File | null) => {
    setReceiptImage(file);

    if (!file) {
      setReceiptImagePath(null);
      return;
    }

    scanReceipt.mutate(file, {
      onSuccess: (result) => {
        setValues((prev) => applyOcrResultToFormValues(prev, result));
        setReceiptImagePath(result.receipt_image);
      },
      onError: (error) => {
        setToast({
          message:
            error instanceof ApiError
              ? error.message
              : "レシートの読み取りに失敗しました。手動で入力してください。",
          variant: "error",
        });
      },
    });
  };

  const validate = (): boolean => {
    const nextErrors: FormErrors = {};
    if (!values.date) nextErrors.date = "日付を入力してください";
    if (!values.storeName.trim()) nextErrors.storeName = "店舗名を入力してください";
    if (!values.amount || Number(values.amount) <= 0) {
      nextErrors.amount = "金額を入力してください";
    }
    if (!values.category) nextErrors.category = "カテゴリを選択してください";
    if (!values.paymentMethod) nextErrors.paymentMethod = "支払方法を選択してください";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleCancel = () => {
    router.back();
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;

    const payload = {
      date: values.date,
      store_name: values.storeName.trim(),
      amount: Number(values.amount),
      category: values.category as string,
      payment_method: values.paymentMethod as string,
      memo: values.memo.trim() ? values.memo.trim() : null,
      receipt_image: receiptImagePath,
    };

    const mutationCallbacks = {
      onSuccess: () => {
        router.push("/transactions");
      },
      onError: (error: unknown) => {
        setToast({
          message:
            error instanceof ApiError
              ? error.message
              : `取引の${mode === "create" ? "登録" : "更新"}に失敗しました。もう一度お試しください。`,
          variant: "error" as const,
        });
      },
    };

    if (mode === "create") {
      createTransaction.mutate(payload, mutationCallbacks);
    } else {
      updateTransaction.mutate({ id: props.transactionId, payload }, mutationCallbacks);
    }
  };

  const handleDelete = () => {
    if (mode !== "edit") return;

    deleteTransaction.mutate(props.transactionId, {
      onSuccess: () => {
        router.push("/transactions");
      },
      onError: (error) => {
        setDeleteDialogOpen(false);
        setToast({
          message:
            error instanceof ApiError
              ? error.message
              : "取引の削除に失敗しました。もう一度お試しください。",
          variant: "error",
        });
      },
    });
  };

  return (
    <div className="min-h-screen bg-background pb-10">
      <BackHeader
        title={mode === "create" ? "取引登録" : "取引編集"}
        onBack={handleCancel}
        action={
          mode === "edit" ? (
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="削除"
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="size-5" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>この取引を削除しますか？</DialogTitle>
                  <DialogDescription>
                    {values.storeName || "この取引"}を削除します。この操作は取り消せません。
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDeleteDialogOpen(false)}
                    disabled={deleteTransaction.isPending}
                  >
                    キャンセル
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={deleteTransaction.isPending}
                  >
                    {deleteTransaction.isPending ? "削除中..." : "削除する"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ) : undefined
        }
      />

      <form
        onSubmit={handleSubmit}
        className="mx-auto flex max-w-2xl flex-col gap-6 px-5 py-7 sm:px-8 sm:py-9"
      >
        <Card>
          <CardContent className="flex flex-col gap-6 p-6">
            <FormField label="日付" htmlFor="date" error={errors.date}>
              <Input
                id="date"
                type="date"
                value={values.date}
                onChange={(event) => updateField("date", event.target.value)}
              />
            </FormField>

            <FormField label="店舗名" htmlFor="storeName" error={errors.storeName}>
              <Input
                id="storeName"
                placeholder="例: スーパーマルエツ"
                value={values.storeName}
                onChange={(event) => updateField("storeName", event.target.value)}
              />
            </FormField>

            <FormField label="金額" htmlFor="amount" error={errors.amount}>
              <div className="flex items-center gap-2">
                <Input
                  id="amount"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  placeholder="1000"
                  value={values.amount}
                  onChange={(event) => updateField("amount", event.target.value)}
                />
                <span className="shrink-0 text-sm text-muted-foreground">円</span>
              </div>
            </FormField>

            <div className="space-y-1.5">
              <p className="text-sm font-medium text-foreground">カテゴリ</p>
              <OptionTileGrid
                options={CATEGORY_TILE_OPTIONS}
                value={values.category}
                onChange={(next) => updateField("category", next)}
              />
              {errors.category && <p className="text-xs text-destructive">{errors.category}</p>}
            </div>

            <div className="space-y-1.5">
              <p className="text-sm font-medium text-foreground">支払方法</p>
              <OptionTileGrid
                options={PAYMENT_METHOD_TILE_OPTIONS}
                value={values.paymentMethod}
                onChange={(next) => updateField("paymentMethod", next)}
              />
              {errors.paymentMethod && (
                <p className="text-xs text-destructive">{errors.paymentMethod}</p>
              )}
            </div>

            <FormField label="メモ" htmlFor="memo">
              <Textarea
                id="memo"
                placeholder="任意でメモを入力できます"
                value={values.memo}
                onChange={(event) => updateField("memo", event.target.value)}
              />
            </FormField>

            <div className="space-y-1.5">
              <p className="text-sm font-medium text-foreground">レシート画像</p>
              <ReceiptImagePicker
                value={receiptImage}
                onChange={handleReceiptImageChange}
                isScanning={scanReceipt.isPending}
              />
              <p className="text-xs text-muted-foreground">
                画像を選択すると、店舗名・日付・金額をAIが自動入力します（認識できなかった項目は手入力してください）。
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="flex-1"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            キャンセル
          </Button>
          <Button type="submit" size="lg" className="flex-1" disabled={isSubmitting}>
            {isSubmitting
              ? mode === "create"
                ? "保存中..."
                : "更新中..."
              : mode === "create"
                ? "保存"
                : "更新"}
          </Button>
        </div>
      </form>

      {toast && <Toast {...toast} onDismiss={() => setToast(null)} />}
    </div>
  );
}
