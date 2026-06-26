# ANAYA SOLAR SOLUTIONS - Solar CRM

A comprehensive Customer Relationship Management system for solar installation businesses.

## Features

- **Dashboard** - Real-time business metrics and KPIs
- **Agent Management** - Manage sales and technical staff
- **Lead Management** - Track prospects from inquiry to conversion
- **Customer Management** - Customer database with system details
- **Payment Tracking** - Monitor payments, dues, and overdues
- **Installation Tracking** - Track projects from survey to handover
- **Reports & Analytics** - Business insights and performance data
- **WhatsApp Integration** - Quick messaging to leads and customers

## Tech Stack

- React 18 + TypeScript
- Tailwind CSS
- Vite
- LocalStorage (no external database required)

---

## Deployment Instructions

### Option 1: Development Mode (VS Code / Local)

1. Extract `anaya-solar-crm.zip` to a folder
2. Open terminal in that folder
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start development server:
   ```bash
   npm run dev
   ```
5. Open browser to `http://localhost:5173`

---

### Option 2: Production Build (For Web Server)

1. Follow steps 1-3 above to install dependencies
2. Build for production:
   ```bash
   npm run build
   ```
3. Copy everything from the `dist/` folder to your web server

**For Apache/Nginx/IIS:**
- Copy `dist/` contents to your web root (e.g., `/var/www/html/`, `htdocs/`)
- Ensure the server is configured to serve `index.html` for all routes

**For Windows IIS:**
- Create a new website pointing to the `dist` folder
- Enable URL Rewrite if needed

**For shared hosting (cPanel, etc.):**
- Upload `dist/` contents via File Manager to `public_html/`

---

### Option 3: Static Hosting (Netlify, Vercel, GitHub Pages)

**Netlify:**
1. Drag and drop the `dist/` folder to netlify.com/drop

**Vercel:**
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in project folder

**GitHub Pages:**
1. Push project to GitHub
2. Enable GitHub Pages in repo settings
3. Set build output to `dist` folder

---

## Project Structure

```
project/
├── src/
│   ├── components/
│   │   ├── Agents/        # Agent management
│   │   ├── Customers/     # Customer management
│   │   ├── Dashboard/     # Dashboard view
│   │   ├── Installations/ # Installation tracking
│   │   ├── Layout/        # Sidebar & Header
│   │   ├── Leads/         # Lead management
│   │   ├── Payments/      # Payment tracking
│   │   ├── Reports/       # Reports & analytics
│   │   ├── ui/            # Reusable UI components
│   │   └── WhatsApp/      # WhatsApp integration
│   ├── lib/
│   │   └── db.ts          # LocalStorage database
│   ├── types/
│   │   └── index.ts       # TypeScript types
│   ├── App.tsx            # Main application
│   └── main.tsx           # Entry point
├── dist/                   # Production build output
└── package.json
```

---

## Sample Data

The app comes pre-loaded with:
- 3 Agents (Sales & Technicians)
- 3 Leads (Various stages)
- 2 Customers
- 4 Payments
- 2 Installations

Data is stored in browser LocalStorage and will persist across sessions.

---

## Customization

**Branding:** Edit colors in `tailwind.config.js` and `src/components/Layout/Sidebar.tsx`

**Logo/Name:** Update `index.html` and sidebar component

**Sample Data:** Modify `initializeSampleData()` in `src/lib/db.ts`

---

## Requirements

- Node.js 18+ (for development/build)
- Any modern web browser (Chrome, Firefox, Edge, Safari)
- No database server required

---

## Support

For issues or customization requests, contact the development team.

© 2024 ANAYA SOLAR SOLUTIONS
