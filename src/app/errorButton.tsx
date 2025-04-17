"use client";

export default function ErrorButton() {
  return (
    <button onClick={() => {
      throw new Error("Test error");
    }}>
      Test Error
    </button>
  );
}
