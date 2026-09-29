// Pure calculator maths (SPEC §18) — shared by the client widgets and unit tests.

export interface EmiResult {
  emi: number;
  totalInterest: number;
  totalPayment: number;
}

/** EMI = P·r·(1+r)^n / ((1+r)^n − 1), with r monthly and n months. Rounded to whole rupees. */
export function calculateEmi(principal: number, annualRatePercent: number, tenureYears: number): EmiResult | null {
  if (!(principal > 0) || !(tenureYears > 0) || annualRatePercent < 0) return null;
  const n = Math.round(tenureYears * 12);
  const r = annualRatePercent / 12 / 100;
  const emi = r === 0 ? principal / n : (principal * r * (1 + r) ** n) / ((1 + r) ** n - 1);
  const totalPayment = emi * n;
  return { emi: Math.round(emi), totalInterest: Math.round(totalPayment - principal), totalPayment: Math.round(totalPayment) };
}

export interface StampDutyResult {
  stampDuty: number;
  registrationFee: number;
  total: number;
}

export function calculateStampDuty(value: number, stampDutyPercent: number, registrationFeePercent: number): StampDutyResult | null {
  if (!(value > 0)) return null;
  const stampDuty = Math.round((value * stampDutyPercent) / 100);
  const registrationFee = Math.round((value * registrationFeePercent) / 100);
  return { stampDuty, registrationFee, total: stampDuty + registrationFee };
}
