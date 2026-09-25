import { expect, test } from "@playwright/test";

for (const { accept, type } of [
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
