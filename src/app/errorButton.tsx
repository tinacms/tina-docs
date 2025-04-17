"use client";

export default function ErrorButton() {
  return (
    <button
      type="button"
      onClick={() => {
        // Force a rendering error by trying to render an undefined component
        const UndefinedComponent = undefined as any;
        return <UndefinedComponent />;
      }}
      className="text-slate-500 shadow-sm hover:shadow-md outline outline-slate-200 hover:text-slate-700 rounded-md p-2 bg-white/50 hover:bg-white/90"
    >
      Test Global Error
    </button>
  );
} 