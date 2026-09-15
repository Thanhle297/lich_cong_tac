# Repository Guidelines

## Project Structure & Module Organization

This is a Vinext/React TypeScript application for the public work-schedule portal. Keep route-level UI in `app/`: `app/page.tsx` is the public schedule view, `app/layout.tsx` holds shared document metadata, and `app/globals.css` defines global and print styles. Reusable presentational primitives live in `components/ui/`; shared helpers belong in `lib/`, and reusable client hooks in `hooks/`.

Static files belong in `public/`. Build and local-runtime helpers are in `scripts/` and `build/`. Database schema artifacts are currently in `db/` and `drizzle/`, while the live application data source is Supabase. Never commit `.env.local`; copy `.env.example` when configuring a local environment.

## Build, Test, and Development Commands

- `pnpm run dev` — starts the local development server.
- `pnpm run build` — creates a production build; run it before opening a pull request.
- `pnpm run start` — serves the production build locally.
- `pnpm run lint` — runs the configured lint checks.
- `pnpm run db:generate` — regenerates Drizzle migration output when those schema files change.

Use the repository's existing `pnpm-lock.yaml`; install dependencies with `pnpm install` instead of changing package managers.

## Coding Style & Naming Conventions

Use TypeScript and functional React components. Match the existing two-space indentation, single quotes, semicolons, and Tailwind utility ordering where practical. Name React components in `PascalCase`, hooks as `useThing`, utility files in `kebab-case` or established local style, and route files according to the `app/` convention. Keep Supabase access explicit, validate loading/error/empty states, and avoid placing service-role credentials in browser code.

## Testing Guidelines

There is no automated test framework configured yet. At minimum, run `pnpm run lint` and `pnpm run build` for each change. For schedule-related UI work, manually verify loading, empty, populated, and print views using local development data. Add tests alongside the feature once a test runner is introduced; use descriptive names such as `schedule-table.test.tsx`.

## Commit & Pull Request Guidelines

This workspace has no Git history yet, so no commit convention can be inferred. Use concise Conventional Commit-style messages, for example `feat: add published-week selector` or `fix: preserve local schedule dates`. Keep commits focused.

Pull requests should explain the user-visible change, list verification commands, link the relevant issue or requirement, and include screenshots for visual changes. Call out Supabase schema, RLS, or environment-variable changes explicitly; never include secrets or `.env.local`.

# Fast, token-efficient workflow

These instructions apply to all work in this repository unless the user says otherwise.

- Prioritize speed and low token usage for routine, reversible changes.
- Never spawn subagents or delegate work unless the user explicitly asks for agents in the current request.
- The user will test application behavior. Do not run automated tests, builds, linters, app launches, screenshots, UI smoke tests, or manual feature checks unless the user explicitly asks for testing or verification.
- For bounded changes, inspect only the relevant files and line ranges, then implement directly. Do not create plans, specs, design documents, or approval checkpoints unless a missing decision would materially change the result.
- Avoid broad repository scans, full-file dumps, repeated diffs, repeated verification, and unrelated investigation.
- Do not browse the web or load extra documentation unless the user asks or a higher-priority instruction requires it.
- Do not use optional review workflows or optional skills that add process without being necessary to complete the requested edit.
- Preserve existing user changes and keep edits strictly within the requested scope.
- Make reasonable assumptions from the current code and conversation. Mention important assumptions briefly in the final response instead of stopping for minor clarification.
- Keep progress updates and the final response concise. State which files changed and leave functional testing to the user.

Higher-priority system, developer, safety, and explicit user instructions still take precedence over this file.
