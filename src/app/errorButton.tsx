export default function ErrorButton() {
  return (
    <button
      type="button"
      onClick={() => {
        // This will trigger the global error boundary
        throw new Error("Global Error Test - This should show the error page");
      }}
      className="text-slate-500 shadow-sm hover:shadow-md outline outline-slate-200 hover:text-slate-700 rounded-md p-2 bg-white/50 hover:bg-white/90"
    >
      Test Global Error
    </button>
  );
}
