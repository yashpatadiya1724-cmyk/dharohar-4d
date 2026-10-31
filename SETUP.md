# Dharohar 4D Frontend - Setup Guide

## ✅ Project Status

**All systems operational!** ✨

- ✅ Next.js 14 with TypeScript configured
- ✅ Tailwind CSS with custom heritage color palette
- ✅ Three.js & React Three Fiber for 3D graphics
- ✅ API client aligned with backend contracts
- ✅ 6 fully functional pages
- ✅ TypeScript: 0 errors
- ✅ Production build: Success

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- Backend API running at `http://localhost:8000/api/v1`

### Installation & Run

```bash
# Install dependencies (already done)
npm install

# Run development server
npm run dev
```

Open http://localhost:3000 in your browser.

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 📁 Project Structure

```
dharohar-4d-frontend/
├── src/
│   ├── app/                    # Next.js 14 App Router
│   │   ├── page.tsx           # Home page with feature cards
│   │   ├── layout.tsx         # Root layout with Navigation
│   │   ├── globals.css        # Tailwind & custom styles
│   │   ├── twin/              # 3D Digital Twin with VFX
│   │   ├── corridor/          # Heritage GIS Explorer
│   │   ├── epigrapher/        # AI Inscription Analysis
│   │   ├── expedition/        # Field Journal Ingestion
│   │   ├── studio/            # Twin Generator
│   │   └── monument4d/        # Condition Tracker
│   ├── components/
│   │   ├── Navigation.tsx     # Top navigation bar
│   │   ├── LoadingSpinner.tsx # Loading indicator
│   │   ├── ErrorMessage.tsx   # Error display
│   │   └── 3d/
│   │       └── VFXEngine.tsx  # Three.js 3D engine
│   └── lib/
│       ├── api.ts             # Backend API client
│       └── utils.ts           # Helper functions
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.mjs
```

## 🎨 Pages Overview

### Home (`/`)
Landing page with feature cards and project overview

### 3D Twin (`/twin`)
**Features:**
- Interactive 3D stepwell with procedural geometry
- Time of day slider (6 AM - 6 PM)
- Epoch selector (1063, 1498, 1890, 2026 CE)
- VFX post-processing (bloom, vignette)
- Animated water, particles, dynamic lighting

**Backend Endpoints:**
- `GET /stepwell/metadata`
- `GET /stepwell/epochs`
- `GET /stepwell/solar_tracking?date={date}`

### Heritage Corridor (`/corridor`)
**Features:**
- GIS explorer for 6 Gujarat heritage loci
- Interactive site selection
- Detailed site information
- Images, coordinates, condition status
- Links to 3D twin and inscriptions

**Backend Endpoint:**
- `GET /loci`

### AI Epigrapher (`/epigrapher`)
**Features:**
- Curated stele catalog (Adalaj, Rani Ki Vav, Modhera)
- Image upload for AI analysis
- Glyph candidate recovery
- Export to TEI-XML, Markdown, JSON

**Backend Endpoints:**
- `GET /epigraphy/steles`
- `GET /epigraphy/stele/{id}`
- `POST /epigraphy/analyze` (form data: site_name, script_hint, image)
- `POST /epigraphy/export` (JSON body)

### Field Expedition (`/expedition`)
**Features:**
- Upload field journals (TXT, MD, PDF)
- NLP-powered asset tagging
- GIS route visualization with waypoints
- Heritage asset catalog with dynasty/date/elements

**Backend Endpoints:**
- `POST /expedition/ingest` (form data: journal_file)
- `GET /expedition/routes`

### Twin Studio (`/studio`)
**Features:**
- Site name query for twin suggestions
- Architectural style analysis
- Polygon budget estimation
- Research job submission

**Backend Endpoints:**
- `POST /studio/suggest_twin` (JSON: {site_name})
- `POST /studio/research_job` (JSON: job data)

### Monument 4D (`/monument4d`)
**Features:**
- Search monuments by name
- Timeline view of historical epochs
- Condition estimation per epoch
- Structural evidence catalog

**Backend Endpoint:**
- `GET /monument4d/{monument_name}`

## 🎨 Custom Theme

Heritage-inspired color palette defined in `tailwind.config.ts`:

```js
colors: {
  heritage: {
    sandstone: "#D4A574",
    terracotta: "#C84630",
    jade: "#00A86B",
    indigo: "#4B0082",
    gold: "#FFD700",
    bronze: "#CD7F32",
  }
}
```

## 🔧 Environment Variables

Create `.env.local` (already exists):

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

## 📦 Key Dependencies

- **next** 14.2.3 - React framework
- **react** 18.3.1 - UI library
- **three** 0.163.0 - 3D graphics
- **@react-three/fiber** 8.16.2 - React renderer for Three.js
- **@react-three/drei** 9.105.4 - Three.js helpers
- **@react-three/postprocessing** 2.16.0 - Post-processing effects
- **framer-motion** 11.1.7 - Animation library
- **lucide-react** 0.376.0 - Icon library
- **tailwindcss** 3.4.3 - CSS framework

## 🛠️ Available Scripts

```bash
npm run dev         # Start development server (port 3000)
npm run build       # Build for production
npm start           # Start production server
npm run lint        # Run ESLint
npm run type-check  # TypeScript type checking
```

## 🎯 API Client Usage

All backend endpoints are typed and available through the `api` object:

```typescript
import { api } from '@/lib/api';

// Stepwell endpoints
const metadata = await api.getStepwellMetadata();
const epochs = await api.getStepwellEpochs();
const solar = await api.getSolarTracking('2026-10-31');

// Epigraphy endpoints
const steles = await api.getEpigraphySteles();
const analysis = await api.analyzeEpigraphy({
  site_name: 'Adalaj',
  image: fileObject
});

// And so on...
```

## 🏗️ Build Output

Production build generates:
- **10 static pages** (all pre-rendered)
- **87.2 KB** shared JS bundle
- **~3-4 KB** per page bundle
- Total first load: **~90-97 KB** per route

## 🐛 Troubleshooting

### TypeScript Errors
```bash
npm run type-check
```

### Build Fails
```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

### Legacy Frontend Folder
If you see errors from `frontend/` directory, it's excluded in `tsconfig.json`. To fully remove:
```bash
# Close any running processes first
rm -rf frontend
```

## 🎓 Development Tips

1. **Hot Reload:** Dev server auto-reloads on file changes
2. **Component Isolation:** Test components individually in their pages
3. **API Mocking:** If backend is down, add mock data in pages
4. **3D Performance:** VFX engine uses dynamic imports for optimal loading
5. **TypeScript:** Strict mode enabled - fix all type errors before build

## 📚 Next Steps

1. **Start Backend:** Ensure FastAPI backend is running
2. **Run Frontend:** `npm run dev`
3. **Test Pages:** Visit each route and verify functionality
4. **Custom Styling:** Modify Tailwind theme in `tailwind.config.ts`
5. **Add Features:** Extend API client and create new pages

## 🎉 Success!

Your Dharohar 4D frontend is ready! All pages are functional and aligned with backend contracts.

**Frontend:** http://localhost:3000  
**Backend:** http://localhost:8000/api/v1

Enjoy exploring Gujarat's heritage through time! 🏛️✨
