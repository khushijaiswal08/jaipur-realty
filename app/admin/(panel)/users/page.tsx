import type { Metadata } from "next";
import { ActionForm } from "@/components/admin/action-form";
import { PageHeader, Panel, Pill } from "@/components/admin/admin-ui";
import { Checkbox, Input, Label, Select } from "@/components/ui/form-controls";
import { createAdminAction, resetAdminPasswordAction, updateAdminAction } from "@/lib/actions/admin/users";
import { requireAdmin } from "@/lib/auth/session";
import { ADMIN_ROLE_LABELS } from "@/lib/constants/enums";
import { formatDateTime } from "@/lib/format/date";
import { listAdmins } from "@/services/admin/admin-users.service";

export const metadata: Metadata = { title: "Admin users" };

const ROLE_HELP = {
  SUPER_ADMIN: "Everything, including admin users and demo purge",
  ADMIN: "Listings, projects, leads and content",
  EDITOR: "Blog, FAQs and testimonials; read-only listings",
} as const;

export default async function AdminUsersPage() {
  const me = await requireAdmin("manageAdmins");
  const admins = await listAdmins();
  return (
    <>
      <PageHeader title="Admin users" description="Who can sign in to this panel (SPEC §43)." />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="space-y-4">
          {admins.map((a) => (
            <Panel key={a.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-ink-950">
                    {a.name} {a.id === me.id ? <span className="text-sm font-normal text-ink-500">(you)</span> : null}
                  </p>
                  <p className="text-sm text-ink-500">{a.email}</p>
                  <p className="mt-1 text-xs text-ink-500">
                    Last sign-in: {a.lastLoginAt ? formatDateTime(a.lastLoginAt) : "never"} · {a._count.sessions} active session(s)
                  </p>
                </div>
                <div className="flex gap-1">
                  <Pill tone={a.isActive ? "green" : "gray"}>{a.isActive ? "Active" : "Deactivated"}</Pill>
                  <Pill tone="brand">{ADMIN_ROLE_LABELS[a.role]}</Pill>
                </div>
              </div>
              <div className="mt-4 grid gap-4 border-t border-ink-100 pt-4 md:grid-cols-2">
                <ActionForm action={updateAdminAction.bind(null, a.id)} submitLabel="Save access" size="sm" variant="outline">
                  <div>
                    <Label htmlFor={`role-${a.id}`}>Role</Label>
                    <Select id={`role-${a.id}`} name="role" defaultValue={a.role} className="h-10">
                      {Object.entries(ADMIN_ROLE_LABELS).map(([k, l]) => (
                        <option key={k} value={k}>
                          {l}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <label className="flex items-center gap-2 text-sm text-ink-700">
                    <Checkbox name="isActive" defaultChecked={a.isActive} /> Can sign in
                  </label>
                </ActionForm>
                <ActionForm action={resetAdminPasswordAction.bind(null, a.id)} submitLabel="Set new password" size="sm" variant="outline" resetOnSuccess>
                  <div>
                    <Label htmlFor={`pw-${a.id}`}>New password</Label>
                    <Input id={`pw-${a.id}`} name="password" type="password" autoComplete="new-password" minLength={10} className="h-10" />
                  </div>
                </ActionForm>
              </div>
            </Panel>
          ))}
        </div>
        <Panel title="Add an admin">
          <ActionForm action={createAdminAction} submitLabel="Create admin" resetOnSuccess>
            <div>
              <Label htmlFor="na-name">Name</Label>
              <Input id="na-name" name="name" required className="h-10" />
            </div>
            <div>
              <Label htmlFor="na-email">Email</Label>
              <Input id="na-email" name="email" type="email" required className="h-10" />
            </div>
            <div>
              <Label htmlFor="na-role">Role</Label>
              <Select id="na-role" name="role" defaultValue="EDITOR" className="h-10">
                {Object.entries(ADMIN_ROLE_LABELS).map(([k, l]) => (
                  <option key={k} value={k}>
                    {l}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="na-pw">Temporary password</Label>
              <Input id="na-pw" name="password" type="password" autoComplete="new-password" required minLength={10} className="h-10" />
              <p className="mt-1 text-xs text-ink-500">10+ characters with letters and numbers. Ask them to change it after signing in.</p>
            </div>
          </ActionForm>
          <ul className="mt-5 space-y-1 border-t border-ink-100 pt-4 text-xs text-ink-500">
            {Object.entries(ROLE_HELP).map(([k, v]) => (
              <li key={k}>
                <strong className="text-ink-700">{ADMIN_ROLE_LABELS[k as keyof typeof ADMIN_ROLE_LABELS]}:</strong> {v}
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  );
}
