# CLAUDE.md - AI Agent Context for TinaDocs

## Project Overview

TinaDocs is a documentation site built with Next.js (App Router) and TinaCMS. Content is authored in MDX files under `content/docs/`, managed via TinaCMS's rich-text editor, and rendered as statically generated pages.

## Key Commands

- `pnpm dev` - Start dev server (runs TinaCMS + Next.js with Turbopack)
- `pnpm build` - Production build (TinaCMS build + Next.js build)
- `pnpm lint` - Biome linter for `src/` and `tina/`
- `npx tsc --noEmit` - TypeScript type check
- `pnpm test` - Playwright tests

## Architecture

### Image Strategy

Images use the `imageEmbed` TinaCMS embed template — a first-class structured content block with explicit fields:

```mdx
<imageEmbed image={{ src: "/img/example.png", alt: "Alt text" }} caption="Caption text" />
```

The `ImageWithMetadataField` custom field auto-captures `width`/`height` when an image is uploaded in the CMS editor. The component renders with explicit dimensions (no CLS) or falls back to `fill` mode when dimensions aren't available.

Key files:
- `tina/templates/markdown-embeds/image-embed.template.tsx` - Embed template definition
- `src/components/tina-markdown/embedded-elements/image-embed.tsx` - Image renderer
- `tina/collections/image-metadata.tsx` - Reusable `ImageWithMetadataFields` schema
- `tina/customFields/image-with-metadata.tsx` - Auto-captures dimensions on upload
- `src/components/ui/image-overlay-wrapper.tsx` - Lightbox overlay

**TinaCloud URL coupling:** TinaCMS may rewrite image URLs to TinaCloud CDN paths (`https://assets.tina.io/{project-id}/...`) in production. The image-embed component extracts the local path via regex. If TinaCloud changes their URL format, update `TINA_CLOUD_ASSET_REGEX` in `image-embed.tsx`.

Accordion components also use `ImageWithMetadataFields` for structured image data with auto-dimension capture.

### TinaCMS Content Model

- Collections defined in `tina/collections/`
- Rich-text body templates (embeds) defined in `tina/templates/markdown-embeds/`
- Component mapping in `src/components/tina-markdown/markdown-component-mapping.tsx`
- Navigation structure in `content/navigation-bar/docs-navigation-bar.json`

### Path Aliases (tsconfig.json)

- `@/utils/*` → `./src/utils/*`
- `@/components/*` → `./src/components/*`
- `@/app/*` → `./src/app/*`
- `@/tina/*` → `./tina/*`
- `@/content/*` → `./content/*`
- `@/*` → `./*` (catch-all)

## Conventions

- Use Biome for linting (not ESLint)
- Use `pnpm` as package manager
- Images stored in `public/img/`
- Content in `content/docs/` as `.mdx` files
