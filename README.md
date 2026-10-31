# Dharohar 4D - Heritage Digital Twin Platform

🏛️ **Frontend for exploring Gujarat's sacred hydraulic heritage through time**

Built with Next.js 14, Three.js, and Tailwind CSS, aligned with FastAPI backend contracts.

## Features

- **3D Digital Twin** - VFX-grade procedural reconstruction with solar tracking
- **Heritage Corridor** - Interactive GIS explorer for sacred hydraulic sites
- **AI Epigrapher** - ML-powered inscription analysis with TEI-XML export
- **Field Expeditions** - NLP journal ingestion with automated route mapping
- **Twin Studio** - Procedural 3D twin generator with research job queue
- **Monument 4D** - Multi-epoch condition tracking and structural evidence

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **3D Graphics:** Three.js, React Three Fiber, React Three Drei
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Language:** TypeScript

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend API running on `http://localhost:8000/api/v1`

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

The app will be available at `http://localhost:3000`

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

## Project Structure

```
src/
├── app/                  # Next.js 14 App Router pages
│   ├── page.tsx         # Home page
│   ├── twin/            # 3D Digital Twin viewer
│   ├── corridor/        # Heritage GIS explorer
│   ├── epigrapher/      # AI inscription analysis
│   ├── expedition/      # Field journal ingestion
│   ├── studio/          # Twin generator
│   └── monument4d/      # Condition tracker
├── components/          # Shared React components
│   ├── 3d/             # Three.js 3D components
│   └── Navigation.tsx   # Main navigation
└── lib/                 # Utilities and API client
    ├── api.ts          # Backend API client
    └── utils.ts        # Helper functions
```

## API Alignment

The frontend API client (`src/lib/api.ts`) is fully aligned with the backend contracts:

- **Stepwell Endpoints:** Metadata, epochs, solar tracking, interpolation
- **Epigraphy Endpoints:** Steles catalog, AI analysis, glyph recovery, TEI export
- **Loci Endpoints:** Heritage corridor GeoJSON features
- **Expedition Endpoints:** Journal ingestion, route mapping
- **Studio Endpoints:** Twin suggestions, research job queue
- **Monument4D Endpoints:** Multi-epoch condition tracking

## Pages

### 🏛️ Home (`/`)
Landing page with feature overview and navigation

### 🎨 3D Twin (`/twin`)
- Interactive 3D stepwell with VFX post-processing
- Time of day slider (6 AM - 6 PM) with dynamic lighting
- Epoch selector (1063, 1498, 1890, 2026 CE)
- Procedural geometry with weathering effects

### 🗺️ Corridor (`/corridor`)
- GIS explorer for 6 Gujarat heritage loci
- Site details with images, condition, coordinates
- Links to 3D twin and inscriptions

### 📜 Epigrapher (`/epigrapher`)
- Curated stele catalog (Adalaj, Rani Ki Vav, Modhera)
- Image upload for AI analysis
- Glyph candidate recovery
- Export to TEI-XML, Markdown, JSON

### 🧭 Expedition (`/expedition`)
- Upload field journals (TXT, MD, PDF)
- NLP-powered asset tagging
- GIS route visualization
- Heritage asset catalog

### 🎭 Studio (`/studio`)
- Site name query for twin suggestions
- Architectural style analysis
- Polygon budget estimation
- Research job submission

### ⏳ Monument 4D (`/monument4d`)
- Search monuments by name
- Timeline view of epochs
- Condition estimation per epoch
- Structural evidence catalog

## Development

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Development with hot reload
npm run dev
```

## Backend Integration

This frontend expects a FastAPI backend running with the following base URL:

```
http://localhost:8000/api/v1
```

Backend endpoints are documented in the API client (`src/lib/api.ts`).

## License

MIT License - Built for heritage preservation research

---

**Dharohar** (धरोहर) means "heritage" in Hindi/Gujarati
