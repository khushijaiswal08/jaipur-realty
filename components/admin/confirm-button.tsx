"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { Button, type ButtonVariant } from "@/components/ui/button";

/** Submit button for destructive/one-off Server Action forms, with a confirmation prompt. */
export function ConfirmSubmit({ children, confirm, variant = "outline", className }: { children: ReactNode; confirm?: string; variant?: ButtonVariant; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant={variant}
      className={className}
      disabled={pending}
      onClick={(e) => {
        if (confirm && !window.confirm(confirm)) e.preventDefault();
      }}
    >
      {pending ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
      {children}
    </Button>
  );
}
