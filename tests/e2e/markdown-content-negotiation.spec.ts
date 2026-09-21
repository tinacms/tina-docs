import { expect, test } from "@playwright/test";

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
    expect(response.headers().vary).toContain("Accept");
    expect(await response.text()).toContain(`title: ${page.title}`);
  }
});

test("continues serving HTML by default", async ({ request }) => {
  const response = await request.get(
    `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/docs`
  );

  expect(response.ok()).toBe(true);
  expect(response.headers()["content-type"]).toContain("text/html");
  expect(response.headers().vary).toContain("Accept");
});
