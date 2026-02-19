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

**Do NOT create special image embed components.** Standard markdown images are used everywhere:

```markdown
![Alt text](/img/example.png "Optional caption")
```

Image dimensions are injected at build time via AST augmentation in the server component, not at runtime. The flow:

1. `page.tsx` (server component) fetches TinaCMS data
2. `augmentBodyImageDimensions()` walks the AST, reads image files from `public/`, injects `width`/`height`
3. `ImageComponent` receives dimensions as props and renders with explicit sizing (no CLS)
4. During live CMS editing, dimensions aren't available - `ImageComponent` falls back to `fill` mode

Key files:
- `src/utils/docs/navigation/imageAugmentation.ts` - Build-time dimension injection
- `src/components/tina-markdown/standard-elements/image.tsx` - Image renderer (no runtime detection)
- `src/app/docs/[...slug]/page.tsx` - Calls augmentation

**TinaCloud URL coupling:** TinaCMS rewrites inline rich-text image URLs to TinaCloud CDN paths (`https://assets.tina.io/{project-id}/...`) in production. The augmentation utility extracts the local path from these URLs via regex. If TinaCloud changes their URL format, update the regex in `imageAugmentation.ts`. Object-type image fields (accordion, showcase) keep local paths and are unaffected.

**Exception:** Accordion and scroll-showcase components use `ImageMetadata` objects (with `src`, `width`, `height`, `alt`) because TinaCMS auto-captures dimensions via the custom field on upload. See `tina/customFields/image-with-metadata.tsx`.

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
