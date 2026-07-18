"use client";

import { useState } from "react";
import { SlidersHorizontal, Square, SquareCheck, X } from "lucide-react";

import { SearchBar } from "@/components/common/search-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CATEGORY_OPTIONS } from "@/data/expense-options-dummy-data";
import { formatMonthLabel } from "@/lib/format";

import { EMPTY_TRANSACTION_FILTERS, type TransactionFilters } from "./filter-transactions";

interface TransactionFilterBarProps {
  filters: TransactionFilters;
  onFiltersChange: (filters: TransactionFilters) => void;
}

export function TransactionFilterBar({ filters, onFiltersChange }: TransactionFilterBarProps) {
  const [panelOpen, setPanelOpen] = useState(false);

  const toggleCategory = (category: string) => {
    const next = filters.categories.includes(category)
      ? filters.categories.filter((item) => item !== category)
      : [...filters.categories, category];
    onFiltersChange({ ...filters, categories: next });
  };

  const chips = [
    ...(filters.keyword
      ? [
          {
            id: "keyword",
            label: filters.keyword,
            onRemove: () => onFiltersChange({ ...filters, keyword: "" }),
          },
        ]
      : []),
    ...filters.categories.map((category) => ({
      id: `category-${category}`,
      label: category,
      onRemove: () => toggleCategory(category),
    })),
    ...(filters.period
      ? [
          {
            id: "period",
            label: formatMonthLabel(filters.period),
            onRemove: () => onFiltersChange({ ...filters, period: "" }),
          },
        ]
      : []),
    ...(filters.minAmount !== null
      ? [
          {
            id: "minAmount",
            label: `${filters.minAmount.toLocaleString("ja-JP")}円以上`,
            onRemove: () => onFiltersChange({ ...filters, minAmount: null }),
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <SearchBar
          value={filters.keyword}
          onChange={(event) => onFiltersChange({ ...filters, keyword: event.target.value })}
          placeholder="店舗名で検索"
          containerClassName="flex-1"
        />
        <Button
          type="button"
          variant={panelOpen ? "default" : "outline"}
          size="icon"
          onClick={() => setPanelOpen((prev) => !prev)}
          aria-label="絞り込み条件を開く"
        >
          <SlidersHorizontal className="size-4" />
        </Button>
      </div>

      {panelOpen && (
        <div className="space-y-4 rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">期間</p>
            <Input
              type="month"
              value={filters.period}
              onChange={(event) => onFiltersChange({ ...filters, period: event.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">カテゴリ（複数選択可）</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_OPTIONS.map((item) => {
                const checked = filters.categories.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleCategory(item)}
                    aria-pressed={checked}
                    className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <Badge
                      variant={checked ? "default" : "outline"}
                      className="pointer-events-none gap-1.5"
                    >
                      {checked ? (
                        <SquareCheck className="size-3.5" />
                      ) : (
                        <Square className="size-3.5" />
                      )}
                      {item}
                    </Badge>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">金額</p>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                inputMode="numeric"
                min={0}
                placeholder="3000"
                value={filters.minAmount === null ? "" : String(filters.minAmount)}
                onChange={(event) => {
                  const raw = event.target.value;
                  onFiltersChange({ ...filters, minAmount: raw === "" ? null : Number(raw) });
                }}
              />
              <span className="shrink-0 text-sm text-muted-foreground">円以上</span>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-full"
            onClick={() => onFiltersChange(EMPTY_TRANSACTION_FILTERS)}
          >
            リセット
          </Button>
        </div>
      )}

      {chips.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {chips.map((chip) => (
            <Badge key={chip.id} variant="secondary" className="gap-1 py-1 pl-3 pr-1.5">
              {chip.label}
              <button
                type="button"
                onClick={chip.onRemove}
                aria-label={`${chip.label}の絞り込みを削除`}
                className="rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground"
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
