# CONVOY EV

CONVOY EV is a responsive web application that creates one shared charging plan for a group of electric vehicles. A user selects each EV, enters the starting battery level, and supplies a starting location and destination. The planner then identifies the most constrained vehicle, selects shared charging stops, checks connector compatibility, and estimates group charging time.

This repository is the IST 440W capstone implementation. It includes a demonstration vehicle catalog, demonstration charging stations, an optional OpenRouteService routing integration, automated tests, and a clearly labeled demo-route fallback.

## Important data notice

- Vehicle specifications, charging stations, energy assumptions, and charge-time estimates are **Demo Data**.
- Real road distance, estimated driving time, and route geometry are available only when `OPENROUTESERVICE_API_KEY` is configured.
- Without an API key, the application still runs and offers a clearly labeled 355-mile demo route.
- Do not use the prototype as the only source for a real trip.

## Technology

- TypeScript
- React 19
- Next.js-compatible App Router through Vinext
- Vite and Cloudflare Workers for local and hosted execution
- Tailwind CSS
- Node.js assertion-based automated tests
- OpenRouteService for optional geocoding and road routing

## Prerequisites

Install these before downloading the project:

- [Git](https://git-scm.com/downloads)
- Node.js 22 LTS, version 22.13.0 or newer within the Node 22 release line
- npm 10 or newer

Node 24 is also supported. Do not use Node 23 because several development dependencies do not support odd-numbered Node releases.

Check the installed versions:

```bash
node --version
npm --version
git --version
```

If `nvm` is installed, the included `.nvmrc` selects Node 22:

```bash
nvm install
nvm use
```

## Download from GitHub

1. Open the CONVOY EV repository on GitHub.
2. Select **Code**, choose **HTTPS**, and copy the repository URL.
3. Open Terminal, PowerShell, or the VS Code terminal.
4. Run the following commands:

```bash
git clone https://github.com/MJiovan/CONVOY-EV.git
cd CONVOY-EV
```

GitHub ZIP downloads also work: select **Code → Download ZIP**, extract the archive, and open a terminal in the extracted project folder.

## Install dependencies

From the project root, run:

```bash
npm run install:ci
```

This performs a clean install from `package-lock.json`. Do not copy an old `node_modules` folder from another computer.

## Routing configuration

### Option A: Demo mode

No configuration is required. If real routing is unavailable, create the trip and select **Use 355-mile Demo Route**. The results page will identify the route and charging information as demonstration data.

### Option B: Real road routing

An OpenRouteService API key is optional. Never paste a real key into source code or commit it to GitHub.

1. Copy the example file:

macOS or Linux:

```bash
cp .dev.vars.example .dev.vars
```

Windows PowerShell:

```powershell
Copy-Item .dev.vars.example .dev.vars
```

2. Add the key to the local `.dev.vars` file:

```text
OPENROUTESERVICE_API_KEY=your_key_here
```

`.dev.vars` is ignored by Git. The API key remains on the server side and is not sent to browser code.

## Run the application

Start the development server:

```bash
npm run dev
```

Open the local URL printed in the terminal. The default portable-development URL is:

```text
http://127.0.0.1:5173
```

Stop the server with `Ctrl+C`.

If port 5173 is already in use:

```bash
npm run dev -- --port 5174
```

## Verify the project

Run the complete automated verification:

```bash
npm run check
```

This command runs:

1. Vehicle catalog tests
2. Group planner tests
3. Routing-provider tests
4. Failure-handling tests
5. Additional stress and boundary tests
6. TypeScript type checking
7. ESLint
8. A production build

Individual commands are also available:

```bash
npm test
npm run test:planner
npm run test:routing
npm run test:failure
npm run typecheck
npm run lint
npm run build
```

To preview the production build locally after `npm run build`:

```bash
npm start
```

Use the URL printed by Wrangler, then stop it with `Ctrl+C`.

## Verified baseline scenario

The automated planner test uses **Desert Weekend Convoy**:

- Phoenix, Arizona to San Diego, California
- 355 miles
- Three EVs driven by Jio, Alex, and Chris
- Alex starts at 64% battery
- Two shared charging stops
- 34 minutes of group charging
- Alex is the initial constraint

The selected demonstration stops are Crossroads Energy Hub and Common Ground Charging. These names and station details are prototype data, not verified live stations.

## Project structure

```text
app/
  api/route-plan/route.ts       Server-only routing API endpoint
  trip/new/page.tsx             Trip form, vehicle selection, and fallback UI
  trip/page.tsx                 Results, charging stops, warnings, and recalculation
components/                     Shared interface components
data/
  demo-route.ts                 Baseline trip and demo charging-station templates
  ev-catalog.ts                 Local demonstration EV catalog
lib/
  group-planner.ts              Core shared charging algorithm
  openrouteservice.ts           Geocoding and directions adapter
  route-validation.ts           Location validation
  trip-storage.ts               Browser draft and saved-trip persistence
  vehicle-specs.ts              Safe effective vehicle specifications
providers/
  contracts.ts                  Provider interfaces
  demo/                         Demo route, station, vehicle, and energy providers
  live/                         OpenRouteService client provider
tests/                          Automated catalog, planner, routing, and failure tests
types/index.ts                  Shared domain types
```

## How the planner works

1. `app/trip/new/page.tsx` collects locations, selected EVs, battery levels, and any planning overrides.
2. The provider registry in `providers/index.ts` supplies route, station, vehicle, and energy data.
3. `calculateGroupPlan()` in `lib/group-planner.ts` calculates the route for every EV as a group.
4. The planner preserves a 12% battery reserve and a 5% planning buffer in demo mode.
5. A station is a shared stop only if every EV has a compatible connector and can reach it.
6. Each EV receives its own required departure battery and charging time.
7. The group remains at a stop for the longest individual charging session.
8. `app/trip/page.tsx` displays the constraint vehicle, shared stops, compatibility warnings, and recalculation results.

## Demo data and live data

The provider interfaces make the data source replaceable:

- `RoutePlanningProvider`
- `ChargingStationProvider`
- `VehicleSpecificationProvider`
- `EnergyCalculationProvider`

The live provider set currently replaces only route planning. Charging stations, vehicle specifications, and energy calculations remain demo providers even when a real road route is loaded. The results page explains this distinction.

## Security and credentials

- No API key is required to run the demo.
- Keep real keys only in `.dev.vars` or the hosting platform's environment-variable settings.
- `.env*`, `.dev.vars*`, private keys, dependencies, build output, caches, and local Wrangler state are ignored by Git.
- `.openai/hosting.json` contains a Sites project identifier, not an API secret.
- Do not display `.dev.vars`, environment-variable dashboards, browser developer storage, or terminal history containing keys during a recording.

## Known limitations

- Charging stations and availability are simulated.
- EV specifications and charging curves are demonstration estimates.
- Local trip data is stored in browser storage rather than a user account or database.
- A valid OpenRouteService key and internet access are required for live routing.
- The repository does not contain the research paper. Use the exact wording and citations from the submitted paper when discussing research findings.

## Troubleshooting

### `npm` reports an unsupported Node version

Install Node 22 LTS, reopen the terminal, confirm `node --version`, remove any locally generated `node_modules` folder, and run `npm run install:ci` again.

### The routing service is not configured

This is expected when `.dev.vars` is absent or the key is blank. Continue with the clearly labeled demo route, or configure the optional key and restart the development server.

### Installation fails or dependencies appear corrupted

Confirm that the terminal is in the folder containing `package.json`, then run:

```bash
npm run install:ci
```

### The page does not open

Use the exact URL printed by `npm run dev`. If the port is occupied, start on another port with `npm run dev -- --port 5174`.

