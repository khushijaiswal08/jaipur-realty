import type { ReactNode } from "react";
import { Checkbox, Input, Label, Select, Textarea } from "@/components/ui/form-controls";
import { cn } from "@/lib/utils";

// Compact field primitives for admin forms. Values are uncontrolled (defaultValue) so forms
// work with Server Actions and remount (via key) with echoed values after validation errors.

export function FormSection({ title, description, children, className }: { title: string; description?: string; children: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-card border border-ink-100 bg-white p-5", className)}>
      <h2 className="font-semibold text-ink-950">{title}</h2>
      {description ? <p className="mt-0.5 text-sm text-ink-500">{description}</p> : null}
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </section>
  );
}

interface BaseProps {
  name: string;
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
}

function Wrap({ name, label, error, hint, required, className, children }: BaseProps & { children: ReactNode }) {
  return (
    <div className={className}>
      <Label htmlFor={`f-${name}`}>
        {label}
        {required ? <span className="text-danger-600"> *</span> : null}
      </Label>
      {children}
      {error ? (
        <p role="alert" className="mt-1 text-sm text-danger-700">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1 text-xs text-ink-500">{hint}</p>
      ) : null}
    </div>
  );
}

export function TextField({ defaultValue, type = "text", placeholder, inputMode, ...p }: BaseProps & { defaultValue?: string | number | null; type?: string; placeholder?: string; inputMode?: "text" | "numeric" | "decimal" | "tel" | "email" | "url" }) {
  return (
    <Wrap {...p}>
      <Input
        id={`f-${p.name}`}
        name={p.name}
        type={type}
        inputMode={inputMode}
        placeholder={placeholder}
        defaultValue={defaultValue ?? ""}
        required={p.required}
        aria-invalid={Boolean(p.error)}
        className="h-10"
      />
    </Wrap>
  );
}

export function TextAreaField({ defaultValue, rows = 5, placeholder, ...p }: BaseProps & { defaultValue?: string | null; rows?: number; placeholder?: string }) {
  return (
    <Wrap {...p}>
      <Textarea id={`f-${p.name}`} name={p.name} rows={rows} placeholder={placeholder} defaultValue={defaultValue ?? ""} required={p.required} aria-invalid={Boolean(p.error)} />
    </Wrap>
  );
}

export function SelectField({
  defaultValue,
  options,
  placeholder,
  onChange,
  ...p
}: BaseProps & { defaultValue?: string | null; options: Array<{ value: string; label: string }>; placeholder?: string; onChange?: (value: string) => void }) {
  return (
    <Wrap {...p}>
      <Select
        id={`f-${p.name}`}
        name={p.name}
        defaultValue={defaultValue ?? ""}
        required={p.required}
        aria-invalid={Boolean(p.error)}
        className="h-10"
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      >
        {placeholder !== undefined ? <option value="">{placeholder}</option> : null}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </Select>
    </Wrap>
  );
}

export function CheckboxField({ name, label, defaultChecked, hint, value = "on" }: { name: string; label: string; defaultChecked?: boolean; hint?: string; value?: string }) {
  return (
    <label className="flex cursor-pointer items-start gap-2.5 self-end rounded-xl border border-ink-100 px-3 py-2.5 text-sm text-ink-800 hover:bg-ink-50">
      <Checkbox name={name} value={value} defaultChecked={defaultChecked} className="mt-0.5" />
      <span>
        {label}
        {hint ? <span className="block text-xs text-ink-500">{hint}</span> : null}
      </span>
    </label>
  );
}

export function CheckboxGroup({ name, label, options, selected, columns = 3 }: { name: string; label: string; options: Array<{ value: string; label: string }>; selected: string[]; columns?: 2 | 3 | 4 }) {
  return (
    <fieldset className="sm:col-span-2 lg:col-span-3">
      <legend className="mb-2 text-sm font-medium text-ink-800">{label}</legend>
      <div className={cn("grid gap-x-4 gap-y-1.5", columns === 2 ? "sm:grid-cols-2" : columns === 4 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-2 sm:grid-cols-3")}>
        {options.map((o) => (
          <label key={o.value} className="flex cursor-pointer items-center gap-2 text-sm text-ink-700">
            <Checkbox name={name} value={o.value} defaultChecked={selected.includes(o.value)} />
            {o.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function FormMessage({ status, message }: { status: "idle" | "success" | "error"; message?: string }) {
  if (!message || status === "idle") return null;
  return (
    <p
      role={status === "error" ? "alert" : "status"}
      className={cn("rounded-xl px-4 py-3 text-sm", status === "error" ? "bg-danger-50 text-danger-700" : "bg-success-50 text-success-700")}
    >
      {message}
    </p>
  );
}
