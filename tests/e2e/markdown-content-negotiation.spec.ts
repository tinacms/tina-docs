import { middleware } from "@/src/middleware";
import { expect, test } from "@playwright/test";
import { NextRequest } from "next/server";

for (const { accept, type } of [
  { accept: "text/html;q=1, text/markdown;q=0.1", type: "text/html" },
  { accept: "text/html;q=0.1, text/markdown;q=1", type: "text/markdown" },
  { accept: "*/*", type: "text/html" },
  { accept: "text/*", type: "text/html" },
  { accept: "Text/Markdown", type: "text/markdown" },
  { accept: "text/html, text/markdown;q=0", type: "text/html" },
  { accept: "text/markdown;q=0.000, text/html", type: "text/html" },
  { accept: "text/markdown; charset=utf-8; q=0, text/html", type: "text/html" },
  { accept: "text/markdown;q=0.5", type: "text/markdown" },
  { accept: "text/html;q=0, text/markdown", type: "text/markdown" },
]) {
  test(`respects Markdown quality: ${accept}`, async ({ request }) => {
    for (const path of ["/docs", "/docs/introduction/showcase"]) {
      const response = await request.get(
        `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${path}`,
        { headers: { Accept: accept } }
      );
      expect(response.ok()).toBe(true);
      expect(response.headers()["content-type"]).toContain(type);
    }
  });
}

test("serves source Markdown when requested", async ({ request }) => {
  const pages = [
    { path: "/docs", title: "Welcome to TinaDocs" },
    { path: "/docs/introduction/showcase", title: "Showcase" },
  ];

  for (const page of pages) {
    const response = await request.get(
      `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${page.path}`,
      { headers: { Accept: "text/markdown" } }
    );

    expect(response.ok()).toBe(true);
    expect(response.headers()["content-type"]).toContain("text/markdown");
    expect(await response.text()).toContain(`title: ${page.title}`);
  }
});

test("continues serving HTML by default", async ({ request }) => {
  const response = await request.get(
    `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/docs`
  );

  expect(response.ok()).toBe(true);
  expect(response.headers()["content-type"]).toContain("text/html");
});

// Vercel replaces Vary on prerendered responses and keys its cache on Accept.
// Check our header before hosting-specific response processing.
test("middleware varies both formats by Accept", () => {
  for (const accept of ["text/html", "text/markdown"]) {
    const response = middleware(
      new NextRequest("http://localhost/docs", { headers: { Accept: accept } })
    );
    expect(response.headers.get("vary")).toBe("Accept");
  }
});

test("keeps HTML and Markdown separate across repeated requests", async ({
  request,
}) => {
  for (const path of ["/docs", "/docs/introduction/showcase"]) {
    for (const type of [
      "text/html",
      "text/markdown",
      "text/html",
      "text/markdown",
    ]) {
      const response = await request.get(
        `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${path}`,
        { headers: { Accept: type } }
      );
      expect(response.ok()).toBe(true);
      expect(response.headers()["content-type"]).toContain(type);
      expect(await response.text()).toMatch(
        type === "text/html" ? /<!doctype html>/i : /^---\s*\n/
      );
    }
  }
});
