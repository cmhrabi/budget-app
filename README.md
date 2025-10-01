# Budget App

A simple web application for displaying recent purchases built with Next.js and TypeScript.

## What's Currently Working

### ✅ Features
- **Purchase Display**: Shows a list of recent purchases with merchant, amount, date, and category
- **Filtering**: Filter purchases by category, date range, amount, and payment method
- **Search**: Real-time search through purchase descriptions and merchants
- **Purchase Details**: Click any purchase to see full details in a modal
- **Responsive Design**: Works on desktop and mobile devices

### 🛠 Tech Stack
- **Next.js 14** with TypeScript and App Router
- **shadcn/ui** for UI components
- **Tailwind CSS** for styling
- **TanStack Query** for state management
- **Jest** for testing

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

Visit http://localhost:3000 to see the app.

## Current Data

The app currently uses mock data with sample Canadian purchases. All purchase data is stored in `src/lib/mock-data.ts`.

## Project Structure

```
src/
├── app/                    # Next.js pages
├── components/
│   ├── features/purchases/ # Purchase-related components
│   └── ui/                # Reusable UI components
├── hooks/                  # Custom React hooks
├── lib/                   # Utilities and mock data
├── services/              # Data service layer
└── types/                 # TypeScript type definitions
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production  
- `npm run start` - Start production server
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run type-check` - Check TypeScript types