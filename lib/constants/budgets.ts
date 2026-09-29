import type { TransactionType } from "@/generated/prisma/enums";
import { CRORE, LAKH } from "@/lib/format/price";

export interface BudgetPreset {
  key: string;
  label: string;
  min?: number;
  max?: number;
}

/** SPEC §8 budget presets. `key` is what appears in the URL (?budget=50l-75l). */
export const BUDGET_PRESETS: Record<TransactionType, BudgetPreset[]> = {
  SALE: [
    { key: "under-25l", label: "Under ₹25 Lakh", max: 25 * LAKH },
    { key: "25l-50l", label: "₹25 – 50 Lakh", min: 25 * LAKH, max: 50 * LAKH },
    { key: "50l-75l", label: "₹50 – 75 Lakh", min: 50 * LAKH, max: 75 * LAKH },
    { key: "75l-1cr", label: "₹75 Lakh – ₹1 Cr", min: 75 * LAKH, max: CRORE },
    { key: "1cr-2cr", label: "₹1 – 2 Cr", min: CRORE, max: 2 * CRORE },
    { key: "above-2cr", label: "Above ₹2 Cr", min: 2 * CRORE },
  ],
  RENT: [
    { key: "under-10k", label: "Under ₹10,000", max: 10_000 },
    { key: "10k-20k", label: "₹10,000 – 20,000", min: 10_000, max: 20_000 },
    { key: "20k-35k", label: "₹20,000 – 35,000", min: 20_000, max: 35_000 },
    { key: "35k-50k", label: "₹35,000 – 50,000", min: 35_000, max: 50_000 },
    { key: "above-50k", label: "Above ₹50,000", min: 50_000 },
  ],
};

export function findBudgetPreset(transaction: TransactionType, key: string | undefined): BudgetPreset | undefined {
  if (!key) return undefined;
  return BUDGET_PRESETS[transaction].find((p) => p.key === key);
}

export const BHK_OPTIONS = [
  { value: 1, label: "1 BHK" },
  { value: 2, label: "2 BHK" },
  { value: 3, label: "3 BHK" },
  { value: 4, label: "4 BHK" },
  { value: 5, label: "5+ BHK" },
] as const;
