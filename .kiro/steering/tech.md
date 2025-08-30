# Steering — Tech
- TypeScript **strict**; no `any` without comment.
- Next.js App Router; client components only where needed.
- Zod for all form inputs; pure utils are framework-free.
- ESLint + Prettier; Tailwind for styling (dark-mode OK).
- No external services; persist to localStorage only.
- File size limit 10MB; accept images/pdf/file/text; use URL.createObjectURL for previews.
