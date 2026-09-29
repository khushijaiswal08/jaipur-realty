// Calculator defaults (SPEC §18). Stamp duty values are INDICATIVE PLACEHOLDERS — verify the
// current Rajasthan rates with the registration department or a legal professional and update
// `effectiveFrom` whenever you change them (docs/ASSUMPTIONS.md).

export const EMI_DEFAULTS = {
  amount: 50_00_000,
  ratePercent: 8.5,
  tenureYears: 20,
  minRate: 5,
  maxRate: 18,
  maxTenure: 30,
} as const;

export const STAMP_DUTY = {
  state: "Rajasthan",
  effectiveFrom: "2026-01-01",
  verified: false,
  buyerRates: [
    { key: "male", label: "Male buyer", stampDutyPercent: 6 },
    { key: "female", label: "Female buyer", stampDutyPercent: 5 },
    { key: "joint", label: "Joint (male + female)", stampDutyPercent: 5.5 },
  ],
  registrationFeePercent: 1,
} as const;
