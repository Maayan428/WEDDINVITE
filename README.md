# 💍 WeddInvite — Wedding RSVP Management System

## Description
A responsive web application for managing wedding RSVPs.
Allows the event manager to manage guests, send personal invitations, and track attendance statuses in real time.

## Features
- Guest list management (add, edit, delete)
- Import and export guests from Excel
- Personal invitation link for each guest
- Beautifully designed RSVP page for guests — confirm/decline, number of attendees, dietary needs, and personal blessing
- Live dashboard with statistics and group breakdown chart
- Dynamic group management
- Fully responsive design — optimized for mobile and desktop

## Tech Stack
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Firebase (Firestore + Authentication)
- Recharts
- SheetJS (xlsx)
- MVVM Architecture

## Getting Started

### Step 1 — Clone the repository
```bash
git clone https://github.com/Maayan428/weddinvite.git
cd weddinvite
```

### Step 2 — Install dependencies
```bash
npm install
```

### Step 3 — Configure Firebase
Create a `.env.local` file in the project root with your Firebase credentials:
```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

### Step 4 — Run locally
```bash
npm run dev
```
Open in browser: **http://localhost:3000**

## Project Structure
```
src/
├── app/              # Next.js App Router pages
│   ├── admin/        # Protected admin pages (dashboard, guests)
│   ├── invite/       # Public guest invitation page
│   └── login/        # Admin login page
├── components/       # UI components
│   ├── admin/        # Admin-specific components
│   ├── invite/       # Guest invitation components
│   └── ui/           # Shared UI primitives
├── viewmodels/       # MVVM ViewModels (business logic hooks)
├── services/         # Firebase & data services
├── models/           # TypeScript interfaces & types
└── lib/              # Constants, utils, helpers
```

---
Made with 💙 for Gil & Maayan
