"use client";

import { useState } from "react";

export default function ErrorButton() {
  const [shouldError, setShouldError] = useState(false);

  if (shouldError) {
    const UndefinedComponent = undefined as any;
    return <UndefinedComponent />;
  }

  return (
    <button
      type="button"
      onClick={() => setShouldError(true)}
      className="text-slate-500 shadow-sm hover:shadow-md outline outline-slate-200 hover:text-slate-700 rounded-md p-2 bg-white/50 hover:bg-white/90"
    >
      Test Global Error
    </button>
  );
}
