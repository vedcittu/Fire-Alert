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

## Real-time sensor ingestion

The project now includes a Supabase Edge function for ESP32 telemetry ingestion and automatic alert creation.

1. Deploy the Edge function from `supabase/functions/fire-alert-ingest`.
2. Update the ESP32 sketch in `esp32/esp32_fire_alert.ino` with your Wi-Fi credentials and your Supabase function URL.
3. Send POST requests from the device to the Edge function.

Example payload:

```json
{
  "code": "SN-01",
  "location": "Chemistry Lab",
  "building_id": null,
  "status": "online",
  "temperature_c": 56.4,
  "humidity_pct": 48,
  "smoke_level": "high",
  "flame_detected": true,
  "load_pct": 82
}
```

The function will:

- upsert the node into `sensor_nodes` using `code` as the conflict key
- update the node's live telemetry
- automatically create an alert if the node reports flame, high smoke, or a critical temperature threshold

## ESP32 sketch

A complete Arduino sketch is provided in `esp32/esp32_fire_alert.ino`.

Before uploading:

- replace `YOUR_WIFI_SSID`, `YOUR_WIFI_PASSWORD`, and `YOUR_INGEST_URL`
- configure the GPIO pins for your actual hardware
- adapt the sensor helper functions to your temperature, humidity, and smoke/flame inputs

## Notes

- The app uses Next.js App Router.
- The Supabase Edge function under `supabase/functions` is intentionally excluded from the app TypeScript build so Deno-specific code can be handled by Supabase tooling without blocking the web app build.
- This repository is prepared for manual GitHub push and does not include generated local artifacts.
