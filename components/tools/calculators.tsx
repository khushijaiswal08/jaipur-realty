"use client";

import { useId, useMemo, useState } from "react";
import type { AreaUnit } from "@/generated/prisma/enums";
import { Input, Label, Select } from "@/components/ui/form-controls";
import { EMI_DEFAULTS, STAMP_DUTY } from "@/lib/constants/tools";
import { AREA_UNIT_NAMES, convertArea, formatAreaValue } from "@/lib/format/area";
import { formatNumberIN } from "@/lib/format/number";
import { formatPrice, parsePrice } from "@/lib/format/price";
import { calculateEmi, calculateStampDuty } from "@/lib/tools";

function Stat({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={strong ? "rounded-xl bg-brand-600 p-4 text-white" : "rounded-xl bg-surface-100 p-4"}>
      <p className={strong ? "text-sm text-brand-100" : "text-sm text-ink-500"}>{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}

/** EMI calculator (SPEC §18). Amount accepts 45L / 1.2Cr shorthand. */
export function EmiCalculator() {
  const id = useId();
  const [amount, setAmount] = useState(String(EMI_DEFAULTS.amount));
  const [rate, setRate] = useState(String(EMI_DEFAULTS.ratePercent));
  const [years, setYears] = useState(String(EMI_DEFAULTS.tenureYears));
  const principal = parsePrice(amount) ?? 0;
  const result = calculateEmi(principal, Number(rate), Number(years));
  const interestShare = result ? Math.round((result.totalInterest / result.totalPayment) * 100) : 0;

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-5">
        <div>
          <Label htmlFor={`${id}-amt`}>Loan amount (₹)</Label>
          <Input id={`${id}-amt`} inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g. 50L" />
          <p className="mt-1 text-xs text-ink-500">{principal ? formatPrice(principal, { style: "full" }) : "Enter an amount, e.g. 45L or 1.2Cr"}</p>
        </div>
        <div>
          <Label htmlFor={`${id}-rate`}>Interest rate: {rate}% p.a.</Label>
          <input
            id={`${id}-rate`}
            type="range"
            min={EMI_DEFAULTS.minRate}
            max={EMI_DEFAULTS.maxRate}
            step={0.05}
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            className="w-full accent-brand-600"
          />
        </div>
        <div>
          <Label htmlFor={`${id}-yrs`}>Tenure: {years} years</Label>
          <input id={`${id}-yrs`} type="range" min={1} max={EMI_DEFAULTS.maxTenure} step={1} value={years} onChange={(e) => setYears(e.target.value)} className="w-full accent-brand-600" />
        </div>
      </div>
      <div aria-live="polite" className="space-y-3">
        {result ? (
          <>
            <Stat label="Monthly EMI" value={`₹${formatNumberIN(result.emi)}`} strong />
            <div className="grid grid-cols-2 gap-3">
              <Stat label="Total interest" value={formatPrice(result.totalInterest)} />
              <Stat label="Total payment" value={formatPrice(result.totalPayment)} />
            </div>
            <div>
              <div className="flex h-3 overflow-hidden rounded-full bg-ink-100" role="img" aria-label={`Principal ${100 - interestShare}%, interest ${interestShare}%`}>
                <div className="bg-ink-800" style={{ width: `${100 - interestShare}%` }} />
                <div className="bg-brand-500" style={{ width: `${interestShare}%` }} />
              </div>
              <p className="mt-2 flex justify-between text-xs text-ink-500">
                <span>■ Principal {100 - interestShare}%</span>
                <span className="text-brand-700">■ Interest {interestShare}%</span>
              </p>
            </div>
          </>
        ) : (
          <p className="rounded-xl bg-surface-100 p-4 text-sm text-ink-600">Enter a loan amount to see your EMI.</p>
        )}
        <p className="text-xs text-ink-500">Indicative only. Your lender&apos;s rate, fees and schedule determine the actual EMI.</p>
      </div>
    </div>
  );
}

/** Converts between sq ft, sq yd (Gaj), sq m, acre, hectare and bigha (SPEC §53). */
export function AreaConverter() {
  const id = useId();
  const [value, setValue] = useState("200");
  const [unit, setUnit] = useState<AreaUnit>("SQYD");
  const n = Number(value.replace(/,/g, ""));
  const rows = useMemo(
    () => (Number.isFinite(n) && n > 0 ? (Object.keys(AREA_UNIT_NAMES) as AreaUnit[]).map((u) => ({ unit: u, text: formatAreaValue(convertArea(n, unit, u), u) })) : []),
    [n, unit],
  );
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="grid grid-cols-[1fr_auto] gap-3">
        <div>
          <Label htmlFor={`${id}-v`}>Area</Label>
          <Input id={`${id}-v`} inputMode="decimal" value={value} onChange={(e) => setValue(e.target.value)} />
        </div>
        <div>
          <Label htmlFor={`${id}-u`}>Unit</Label>
          <Select id={`${id}-u`} value={unit} onChange={(e) => setUnit(e.target.value as AreaUnit)} className="w-48">
            {(Object.keys(AREA_UNIT_NAMES) as AreaUnit[]).map((u) => (
              <option key={u} value={u}>
                {AREA_UNIT_NAMES[u]}
              </option>
            ))}
          </Select>
        </div>
        <p className="col-span-2 text-xs text-ink-500">1 bigha is taken as the Rajasthan “pucca” bigha (27,225 sq ft); local usage varies.</p>
      </div>
      <dl aria-live="polite" className="divide-y divide-ink-100 rounded-xl border border-ink-100 bg-white">
        {rows.map((r) => (
          <div key={r.unit} className="flex items-center justify-between px-4 py-3">
            <dt className="text-sm text-ink-500">{AREA_UNIT_NAMES[r.unit]}</dt>
            <dd className="font-semibold text-ink-950">{r.text}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/** Indicative stamp duty + registration estimate for Rajasthan (SPEC §18). */
export function StampDutyCalculator() {
  const id = useId();
  const [value, setValue] = useState("75L");
  const [buyer, setBuyer] = useState<string>(STAMP_DUTY.buyerRates[0].key);
  const rate = STAMP_DUTY.buyerRates.find((b) => b.key === buyer) ?? STAMP_DUTY.buyerRates[0];
  const amount = parsePrice(value) ?? 0;
  const result = calculateStampDuty(amount, rate.stampDutyPercent, STAMP_DUTY.registrationFeePercent);
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-5">
        <div>
          <Label htmlFor={`${id}-val`}>Property value (₹)</Label>
          <Input id={`${id}-val`} inputMode="decimal" value={value} onChange={(e) => setValue(e.target.value)} />
          <p className="mt-1 text-xs text-ink-500">{amount ? formatPrice(amount, { style: "full" }) : "e.g. 75L or 1.2Cr"}</p>
        </div>
        <fieldset>
          <legend className="mb-2 text-sm font-medium text-ink-800">Buyer</legend>
          <div className="space-y-2">
            {STAMP_DUTY.buyerRates.map((b) => (
              <label key={b.key} className="flex cursor-pointer items-center gap-2 text-sm text-ink-700">
                <input type="radio" name="buyer" value={b.key} checked={buyer === b.key} onChange={() => setBuyer(b.key)} className="accent-brand-600" />
                {b.label} — {b.stampDutyPercent}% stamp duty
              </label>
            ))}
          </div>
        </fieldset>
      </div>
      <div aria-live="polite" className="space-y-3">
        {result ? (
          <>
            <Stat label="Estimated total" value={formatPrice(result.total)} strong />
            <div className="grid grid-cols-2 gap-3">
              <Stat label={`Stamp duty (${rate.stampDutyPercent}%)`} value={formatPrice(result.stampDuty)} />
              <Stat label={`Registration (${STAMP_DUTY.registrationFeePercent}%)`} value={formatPrice(result.registrationFee)} />
            </div>
          </>
        ) : null}
        <p className="rounded-xl bg-warning-50 p-3 text-xs text-warning-600">
          Indicative {STAMP_DUTY.state} rates{STAMP_DUTY.verified ? "" : " (to be verified)"}, effective {STAMP_DUTY.effectiveFrom}. Actual duty depends on the
          DLC rate, property type, concessions and surcharges — confirm with the sub-registrar or a legal professional.
        </p>
      </div>
    </div>
  );
}
