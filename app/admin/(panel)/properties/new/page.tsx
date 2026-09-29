import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/admin-ui";
import { PropertyForm } from "@/components/admin/property-form";
import { savePropertyAction } from "@/lib/actions/admin/properties";
import { requireAdmin } from "@/lib/auth/session";
import { getPropertyFormOptions } from "@/services/admin/property-admin.service";

export const metadata: Metadata = { title: "New property" };

export default async function NewPropertyPage() {
  await requireAdmin("manageListings");
  const options = await getPropertyFormOptions();
  return (
    <>
      <PageHeader title="New property" description="Save first, then add photos." back={{ href: "/admin/properties", label: "Properties" }} />
      <PropertyForm options={options} action={savePropertyAction.bind(null, "")} />
    </>
  );
}
