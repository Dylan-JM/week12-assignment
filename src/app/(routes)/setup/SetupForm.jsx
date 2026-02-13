"use client";

import { useActionState, useEffect } from "react";

export default function SetupForm({ saveRole }) {
  const [state, formAction] = useActionState(async (prev, formData) => {
    return await saveRole(formData);
  }, null);

  useEffect(() => {
    if (state?.success && state?.role) {
      const path =
        state.role === "freelancer"
          ? "/freelancer/dashboard"
          : "/client/dashboard";
      window.location.href = path;
    }
  }, [state]);

  return (
    <form action={formAction} className="flex flex-col items-center gap-6">
      <div className="flex flex-col gap-2">
        <label htmlFor="role" className="text-sm font-medium">
          Role
        </label>
        <select
          name="role"
          id="role"
          required
          className="min-w-[200px] rounded border border-gray-300 px-4 py-2 text-base"
        >
          <option value="">Select a role</option>
          <option value="client">Client</option>
          <option value="freelancer">Freelancer</option>
        </select>
      </div>
      {state?.error && (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        className="rounded bg-[rgb(0,153,255)] px-6 py-2 font-semibold text-white hover:opacity-90"
      >
        Save
      </button>
    </form>
  );
}
