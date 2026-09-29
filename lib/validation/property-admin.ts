import { z } from "zod";
import {
  AreaUnit,
  ConstructionStatus,
  Facing,
  Furnishing,
  ListedBy,
  ListingStatus,
  OwnershipType,
  PropertyType,
  TenantPreference,
  TransactionType,
} from "@/generated/prisma/enums";
import {
  checkbox,
  idList,
  optionalDate,
  optionalFloat,
  optionalId,
  optionalInt,
  optionalMoney,
  optionalString,
  optionalUrl,
  requiredString,
  triState,
} from "./form-helpers";

const optionalEnum = <T extends Record<string, string>>(e: T) =>
  z
    .union([z.literal(""), z.enum(e)])
    .optional()
    .transform((v) => (v ? (v as T[keyof T]) : null));

/** Admin property form (SPEC §13, §44). Areas are entered in sq ft except plot area (any unit). */
export const propertyAdminSchema = z
  .object({
    title: requiredString(5, 120, "Title"),
    description: requiredString(20, 5000, "Description"),
    transactionType: z.enum(TransactionType),
    propertyType: z.enum(PropertyType),
    status: z.enum(ListingStatus),
    constructionStatus: optionalEnum(ConstructionStatus),
    listedBy: z.enum(ListedBy),
    price: optionalMoney,
    priceOnRequest: checkbox,
    isNegotiable: checkbox,
    maintenanceMonthly: optionalInt(0, 10_000_000),
    securityDeposit: optionalMoney,
    bookingAmount: optionalMoney,
    bedrooms: optionalInt(0, 20),
    bathrooms: optionalInt(0, 20),
    balconies: optionalInt(0, 20),
    carpetArea: optionalFloat(1, 10_000_000),
    builtUpArea: optionalFloat(1, 10_000_000),
    superBuiltUpArea: optionalFloat(1, 10_000_000),
    plotAreaValue: optionalFloat(0.0001, 100_000_000),
    plotAreaUnit: z.enum(AreaUnit).default("SQYD"),
    plotWidthFt: optionalFloat(1, 100_000),
    plotLengthFt: optionalFloat(1, 100_000),
    floorNumber: optionalInt(-2, 200),
    totalFloors: optionalInt(1, 200),
    facing: optionalEnum(Facing),
    furnishing: optionalEnum(Furnishing),
    ownershipType: optionalEnum(OwnershipType),
    ageYears: optionalInt(0, 200),
    possessionDate: optionalDate,
    availableFrom: optionalDate,
    preferredTenants: z.array(z.enum(TenantPreference)).default([]),
    coveredParking: optionalInt(0, 50),
    openParking: optionalInt(0, 50),
    roadWidthFt: optionalInt(1, 500),
    isCornerPlot: checkbox,
    isGatedCommunity: checkbox,
    jdaApproved: triState,
    reraNumber: optionalString(80),
    localityId: z.string().regex(/^[a-z0-9]{20,32}$/, "Choose a locality"),
    projectId: optionalId,
    agentId: optionalId,
    address: optionalString(300),
    landmark: optionalString(120),
    pincode: z
      .string()
      .trim()
      .optional()
      .transform((v, ctx) => {
        if (!v) return null;
        if (!/^[1-9]\d{5}$/.test(v)) {
          ctx.addIssue({ code: "custom", message: "Enter a 6-digit pincode" });
          return z.NEVER;
        }
        return v;
      }),
    latitude: optionalFloat(-90, 90),
    longitude: optionalFloat(-180, 180),
    hideExactLocation: checkbox,
    amenityIds: idList,
    videoUrl: optionalUrl,
    virtualTourUrl: optionalUrl,
    isFeatured: checkbox,
    isVerified: checkbox,
    seoTitle: optionalString(70),
    seoDescription: optionalString(170),
  })
  .superRefine((v, ctx) => {
    if (!v.priceOnRequest && v.price === null) {
      ctx.addIssue({ code: "custom", path: ["price"], message: "Enter a price or tick “Price on request”" });
    }
    if ((v.latitude === null) !== (v.longitude === null)) {
      ctx.addIssue({ code: "custom", path: ["latitude"], message: "Enter both latitude and longitude, or neither" });
    }
    if (v.floorNumber !== null && v.totalFloors !== null && v.floorNumber > v.totalFloors) {
      ctx.addIssue({ code: "custom", path: ["floorNumber"], message: "Floor can't be above the total floors" });
    }
  });

export type PropertyAdminInput = z.infer<typeof propertyAdminSchema>;

export const PROPERTY_MULTI_FIELDS = ["amenityIds", "preferredTenants"] as const;
