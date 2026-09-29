import type { Metadata } from "next";
import { ActionForm } from "@/components/admin/action-form";
import { PageHeader, Panel } from "@/components/admin/admin-ui";
import { TrustMetricsEditor } from "@/components/admin/trust-metrics-editor";
import { saveTrustMetricsAction } from "@/lib/actions/admin/settings";
import { requireAdmin } from "@/lib/auth/session";
import { formattedAddress, siteConfig } from "@/lib/config";
import { formatPhone } from "@/lib/format/phone";
import { getTrustMetrics, getTrustMetricSettings } from "@/services/settings.service";

export const metadata: Metadata = { title: "Site settings" };

export default async function SiteSettingsPage() {
  await requireAdmin("manageSettings");
  const [settings, shown] = await Promise.all([getTrustMetricSettings(), getTrustMetrics()]);

  return (
    <>
      <PageHeader title="Site settings" description="Content that appears across the public website." />
      <div className="space-y-5">
        <Panel title="Home page trust metrics">
          <p className="mb-4 max-w-3xl text-sm text-ink-600">
            Shown under the home page search. Live counts come straight from the database. Only enter a fixed number you can back up
            (for example years in business). Live counts of zero are hidden automatically.
          </p>
          <ActionForm action={saveTrustMetricsAction} submitLabel="Save metrics">
            <TrustMetricsEditor initial={settings} />
          </ActionForm>
          {shown.length ? (
            <div className="mt-5 border-t border-ink-100 pt-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">Currently shown</p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {shown.map((m) => (
                  <li key={m.label} className="rounded-lg bg-surface-100 px-3 py-1.5 text-sm text-ink-800">
                    <strong className="text-brand-900">{m.value}</strong> {m.label}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </Panel>

        <Panel title="Business contact details">
          <p className="mb-4 max-w-3xl text-sm text-ink-600">
            Every Call, WhatsApp and email button on the site uses these. They are set in the server&apos;s <code>.env</code> file
            (<code>NEXT_PUBLIC_BUSINESS_*</code>) and need a rebuild to change — see docs/DEPLOYMENT.md.
          </p>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            {[
              ["Business name", siteConfig.name],
              ["Phone", formatPhone(siteConfig.phone)],
              ["WhatsApp", formatPhone(siteConfig.whatsapp)],
              ["Email", siteConfig.email],
              ["Address", formattedAddress()],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs font-semibold uppercase tracking-wider text-ink-500">{label}</dt>
                <dd className="mt-0.5 text-ink-900">{value}</dd>
              </div>
            ))}
          </dl>
        </Panel>
      </div>
    </>
  );
}
