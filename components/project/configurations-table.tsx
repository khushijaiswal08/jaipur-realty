import { FileText } from "lucide-react";
import type { AreaUnit } from "@/generated/prisma/enums";
import { PROPERTY_TYPE_CATEGORY } from "@/lib/constants/enums";
import { formatAreaRange } from "@/lib/format/area";
import { formatPriceRange } from "@/lib/format/price";
import type { ConfigurationDTO } from "@/services/project-detail.service";

/** Unit mix with areas and prices (SPEC §10.4). Plots show areas in sq yd, the Jaipur convention. */
export function ConfigurationsTable({ configurations }: { configurations: ConfigurationDTO[] }) {
  const hasCarpet = configurations.some((c) => c.carpetAreaMin || c.carpetAreaMax);
  const hasSuper = configurations.some((c) => c.superAreaMin || c.superAreaMax);
  const hasUnits = configurations.some((c) => c.unitsAvailable !== null);
  const unitFor = (c: ConfigurationDTO): AreaUnit => (PROPERTY_TYPE_CATEGORY[c.propertyType] === "LAND" ? "SQYD" : "SQFT");

  return (
    <div className="relative overflow-x-auto rounded-card border border-ink-100 bg-white">
      <table className="w-full min-w-[34rem] text-sm">
        <caption className="sr-only">Unit configurations, areas and prices</caption>
        <thead className="bg-surface-100 text-left text-xs uppercase tracking-wider text-ink-500">
          <tr>
            <th scope="col" className="px-4 py-3 font-semibold">
              Configuration
            </th>
            {hasCarpet ? (
              <th scope="col" className="px-4 py-3 font-semibold">
                Carpet area
              </th>
            ) : null}
            {hasSuper ? (
              <th scope="col" className="px-4 py-3 font-semibold">
                Super / plot area
              </th>
            ) : null}
            <th scope="col" className="px-4 py-3 font-semibold">
              Price
            </th>
            {hasUnits ? (
              <th scope="col" className="px-4 py-3 font-semibold">
                Available
              </th>
            ) : null}
            <th scope="col" className="px-4 py-3">
              <span className="sr-only">Floor plan</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-100">
          {configurations.map((c) => (
            <tr key={c.id}>
              <th scope="row" className="px-4 py-3 text-left font-semibold text-ink-950">
                {c.label}
              </th>
              {hasCarpet ? <td className="px-4 py-3 text-ink-700">{formatAreaRange(c.carpetAreaMin, c.carpetAreaMax)}</td> : null}
              {hasSuper ? <td className="px-4 py-3 text-ink-700">{formatAreaRange(c.superAreaMin, c.superAreaMax, unitFor(c))}</td> : null}
              <td className="px-4 py-3 font-semibold text-ink-950">{formatPriceRange(c.priceMin, c.priceMax)}</td>
              {hasUnits ? <td className="px-4 py-3 text-ink-700">{c.unitsAvailable ?? "—"}</td> : null}
              <td className="px-4 py-3 text-right">
                {c.floorPlanUrl ? (
                  <a href={c.floorPlanUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:text-brand-800">
                    <FileText className="size-4" aria-hidden="true" />
                    Plan
                  </a>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
