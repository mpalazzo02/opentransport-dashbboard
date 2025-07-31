# Open Transport Dashboard

A proof-of-concept web application that provides a unified view of transport journeys and purchases from multiple providers.

## 🚀 Features

- **Unified Dashboard**: View all transport data in one place
- **Multiple Providers**: Connect various transport services (TfL, Trainline, etc.)
- **Journey Analytics**: Track distances, CO₂ emissions, and spending
- **Demo Mode**: Four demo accounts with realistic data
- **Responsive Design**: Works on desktop and mobile devices
- **Accessibility**: WCAG AA compliant with keyboard navigation
- **Data Export**: CSV export for journeys and transactions

## 🛠 Tech Stack

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS with custom design tokens
- **Components**: shadcn/ui components + Radix primitives
- **Tables**: TanStack Table v8 with sorting, filtering, pagination
- **TypeScript**: Full type safety throughout
- **Data**: Mock API integration with real-world data structures

## 🏃‍♂️ Getting Started

1. **Install dependencies**:

   ```bash
   pnpm install
   ```

2. **Run the development server**:

   ```bash
   pnpm dev
   ```

3. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
app/
├── page.tsx                         # Landing page with demo accounts
├── setup/page.tsx                   # Provider connection (single step)
├── dashboard/
│   ├── layout.tsx                  # Dashboard shell with sidebar
│   ├── page.tsx                    # Overview with KPIs
│   ├── journeys/page.tsx           # Journeys data table
│   ├── transactions/page.tsx       # Transactions data table
│   └── accounts/page.tsx           # Provider management
components/
├── ui/                             # shadcn/ui components
├── stat-card.tsx                   # KPI display component
├── provider-card.tsx               # Transport provider connection card
├── error-banner.tsx                # Error display component
├── debug-panel.tsx                 # Dev-only debug information
└── ...
lib/
├── types.ts                        # TypeScript type definitions
├── api-client.ts                   # API integration utilities
├── demo-data.ts                    # Mock accounts and providers
├── storage.ts                      # LocalStorage utilities
└── utils.ts                        # Utility functions
```

## 🌐 API Overview

This project integrates with a private AWS API Gateway backend for live journey and purchase data. The API is not public; an API key is required for all requests.

### API Base URL

```
https://4pvoe7tuw9.execute-api.eu-west-2.amazonaws.com/dev
```

### Authentication

All requests must include an `x-api-key` header. The API key is not public. If you need access, please contact the maintainer.

**Example header:**

```
x-api-key: <your-api-key>
```

### Endpoints

- **GET `/journeys`**: Fetch journeys for an account and month
  - **Query params:** `account_id`, `year`, `month`
  - **Example:** `/journeys?account_id=cd89d17b-44be-4e2a-8e2d-1a2b3c4d5e6f&year=2023&month=12`
  - **Response:** Array of journey objects (see schema below)

- **GET `/purchases`**: Fetch purchases for an account and month
  - **Query params:** `account_id`, `year`, `month`
  - **Example:** `/purchases?account_id=cd89d17b-44be-4e2a-8e2d-1a2b3c4d5e6f&year=2023&month=12`
  - **Response:** Array of purchase objects (see schema below)

#### Request Example

```
GET /journeys?account_id=cd89d17b-44be-4e2a-8e2d-1a2b3c4d5e6f&year=2023&month=12
Host: 4pvoe7tuw9.execute-api.eu-west-2.amazonaws.com
x-api-key: <your-api-key>
```

#### Journey Response Schema (partial)

```
{
  "account_id": "string",
  "id": "string",
  "mode": { "id": "string", "short-desc": "string", ... },
  "operator": { "id": "string", "name": "string" },
  "travel-from": { ... },
  "travel-to": { ... },
  "ticket": { ... },
  ...
}
```

#### Purchase Response Schema (partial)

```
{
  "account_id": "string",
  "id": "string",
  "amount": 0,
  "currency": "string",
  "date": "string",
  ...
}
```

See `/lib/types.ts` for full TypeScript types.

### API Key & Security

- The API key is required for all requests. Do not share it publicly.
- If you need access, request an API key from the maintainer.
- The `.env.local` file should contain:
  - `NEXT_PUBLIC_API_BASE_URL`
  - `API_GATEWAY_KEY`

### Deployment

The app will be deployed on AWS Amplify, but you can run it locally with the dev API endpoint and your API key.

---

## 👥 Demo Accounts

The application includes four demo accounts with specific UUIDs:

1. **Alex Thompson** - `cd89d17b-44be-4da6-9f54-d025373e163f`
2. **Farah Khan**    - `66ca7e6b-3972-418e-94c1-08bc93fa1d2`
3. **Gina Rosetti**  - `62482e11-3c8e-4ee0-87cf-65cfa26eebf8`
4. **Jordan Chen**   - `23638779-4dc5-4fa9-a63f-d41d4b15e134`

Use these to explore the dashboard in demo mode.

## 🧹 Linting & Formatting

This project uses ESLint (with Flat Config) and Prettier for code quality and consistency.

**Lint your code:**

```bash
pnpm lint
```

**Format your code:**

```bash
pnpm format
```

Linting and formatting config files are ignored from version control for flexibility per developer.

## 🤝 Contributing

1. Fork and clone the repo
2. Install dependencies: `pnpm install`
3. Create a new branch for your feature or fix
4. Use `pnpm lint` and `pnpm format` before committing
5. Open a pull request with a clear description

---

For questions or feedback, open an issue or contact the maintainer.
