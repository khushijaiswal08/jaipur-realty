"use client";

import { startTransition, useActionState, useEffect, useRef, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { Button, type ButtonVariant } from "@/components/ui/button";
import { initialActionState, type ActionState } from "@/lib/actions/types";
import { cn } from "@/lib/utils";

/**
 * Wraps server-rendered fields in a form bound to a Server Action with inline status.
 * Submits via onSubmit + transition (not the `action` prop) so React doesn't auto-reset the
 * fields when the action returns a validation error; `resetOnSuccess` clears them explicitly.
 */
export function ActionForm({
  action,
  children,
  submitLabel = "Save",
  variant = "primary",
  size = "md",
  className,
  resetOnSuccess = false,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  children: ReactNode;
  submitLabel?: string;
  variant?: ButtonVariant;
  size?: "sm" | "md";
  className?: string;
  resetOnSuccess?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, initialActionState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (resetOnSuccess && state.status === "success") formRef.current?.reset();
  }, [state, resetOnSuccess]);

  return (
    <form
      ref={formRef}
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => formAction(data));
      }}
      className={cn("space-y-3", className)}
    >
      {children}
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" variant={variant} size={size} disabled={pending}>
          {pending ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
          {submitLabel}
        </Button>
        {state.message ? (
          <p role={state.status === "error" ? "alert" : "status"} className={cn("text-sm", state.status === "error" ? "text-danger-700" : "text-success-700")}>
            {state.message}
            {state.fieldErrors ? ` ${Object.values(state.fieldErrors).join(" ")}` : ""}
          </p>
        ) : null}
      </div>
    </form>
  );
}
