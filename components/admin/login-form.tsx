"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form-controls";
import { login } from "@/lib/actions/auth";
import { initialActionState } from "@/lib/actions/types";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? <Loader2 className="animate-spin" aria-hidden="true" /> : <LogIn aria-hidden="true" />}
      {pending ? "Signing in…" : "Sign in"}
    </Button>
  );
}

export function LoginForm({ next }: { next?: string }) {
  const [state, action] = useActionState(login, initialActionState);
  return (
    <form key={state.submissionId ?? 0} action={action} className="space-y-4">
      {next ? <input type="hidden" name="next" value={next} /> : null}
      {state.status === "error" ? (
        <p role="alert" className="rounded-xl bg-danger-50 px-3 py-2.5 text-sm text-danger-700">
          {state.message}
        </p>
      ) : null}
      <Field id="email" label="Email">
        <Input id="email" name="email" type="email" autoComplete="username" required defaultValue={state.values?.email} autoFocus />
      </Field>
      <Field id="password" label="Password">
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </Field>
      <Submit />
    </form>
  );
}
