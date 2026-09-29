// Shared Server Action result shape (importable from client components).

export interface ActionState {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
  /** Submitted values echoed back on error so the form can re-fill itself. */
  values?: Record<string, string>;
  /** Changes on every submission — used as a React key to remount fields with new defaults. */
  submissionId?: number;
  /** Optional payload for success screens (e.g. a brochure URL). */
  data?: Record<string, string>;
}

export const initialActionState: ActionState = { status: "idle" };
