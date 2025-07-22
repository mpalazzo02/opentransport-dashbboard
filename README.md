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


## 👥 Demo Accounts

The application includes four demo accounts with specific UUIDs:

1. **Alex Thompson** - `cd89d17b-44be-4e2a-8e2d-1a2b3c4d5e6f`
2. **Maria Rossi**   - `a1b2c3d4-e5f6-7890-abcd-1234567890ef`
3. **Sophie Dubois** - `b2c3d4e5-f6a1-2345-bcde-2345678901fa`
4. **Liam O'Connor** - `c3d4e5f6-a1b2-3456-cdef-3456789012ab`

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
