# FireAlert

A Next.js campus safety application for fire monitoring, alerts, emergency coordination, and role-based access for students, faculty, and rescue teams.

## Project structure

- src/app - route-based screens and app pages
- src/components - reusable UI components
- src/lib - shared types and Supabase helpers
- src/app/actions - server actions for auth and alert updates
- supabase/functions - edge functions such as email notifications
- public - static frontend assets

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Required environment variables

Copy the example file and add your local values:

```bash
cp .env.example .env.local
```

Example values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password
```

## Production build

```bash
npm run build
```

## Notes

- The app uses Next.js App Router.
- The Supabase Edge function under supabase/functions is intentionally excluded from the app TypeScript build so Deno-specific code can be handled by Supabase tooling without blocking the web app build.
- This repository is prepared for manual GitHub push and does not include generated local artifacts.
