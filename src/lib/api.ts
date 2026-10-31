// API Client aligned with Dharohar 4D Backend Contracts

const API_BASE_URL = typeof window !== 'undefined' ? '/api/v1' : (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8001/api/v1');

// ============== TYPES (Backend Response Structures) ==============

export interface HeritageEpoch {
  year: number;
  label?: string;
  era_label?: string;
  dynasty?: string;
  description?: string;
  architectural_state?: string;
  cultural_context?: string;
  materials?: {
    tint?: string;
    roughness?: number;
    patina?: number;
    algae?: number;
    silt?: number;
    crack?: number;
  };
  props?: string[];
  water?: {
    level?: number;
    clarity?: number;
    color?: string;
  };
  sources?: Array<{ type?: string; ref?: string }>;
}

export interface SolarEvent {
  date: string;
  azimuth_deg: number;
  elevation_deg: number;
  lit_tier: number;
  description: string;
}

export interface StepwellData {
  monument_id?: string;
  name: string;
  english_title?: string;
  location: string;
  construction_year: number;
  patron?: string;
  architectural_style?: string;
  latitude?: number;
  longitude?: number;
  coordinates?: { lat: number; lng: number };
  total_depth_m?: number;
  dimensions?: {
    depth_meters?: number;
    stories?: number;
    length_meters?: number;
    width_meters?: number;
    octagonal_shaft_diameter?: number;
  };
  epochs?: HeritageEpoch[];
  solar_events?: SolarEvent[];
  layers?: Array<{
    id: string;
    name: string;
    elevation: string;
    pillars_count: number;
    description: string;
  }>;
}

export interface EpigraphyStele {
  id: string;
  title: string;
  location: string;
  dating?: { vs?: number; ce?: number; note?: string } | any;
  confidence?: number | { overall: number; calibrated?: boolean; ece_score?: number };
  mode?: string;
  thumbnail?: string;
  script?: string;
  language?: string;
  patron?: string;
  degraded?: string;
  restored?: string;
  iast?: string;
  hindi?: string;
  english?: string;
  lines?: Array<{
    idx: number;
    box: number[];
    glyphs: Array<{
      i: number;
      read: string;
      conf: number;
      damaged: boolean;
      candidates?: Array<{ g: string; p: number }>;
    }>;
  }>;
  warnings?: string[];
  // Legacy aliases
  site?: string;
  estimated_date?: string;
  inscription_text?: string;
  translation?: string;
  description?: string;
}

export interface GlyphCandidate {
  glyph: string;
  confidence: number;
  unicode_block?: string;
}

export interface AnalysisResult {
  id?: string;
  mode?: string;
  title?: string;
  location?: string;
  script?: string;
  language?: string;
  degraded?: string;
  restored?: string;
  iast?: string;
  hindi?: string;
  english?: string;
  dating?: { vs?: number; ce?: number; note?: string };
  confidence?: { overall: number; calibrated?: boolean; ece_score?: number } | number;
  lines?: Array<{
    idx: number;
    box: number[];
    glyphs: Array<{
      i: number;
      read: string;
      conf: number;
      damaged: boolean;
      candidates?: Array<{ g: string; p: number }>;
    }>;
  }>;
  warnings?: string[];
  // Legacy aliases
  detected_script?: string;
  language_guess?: string;
  glyph_candidates?: GlyphCandidate[];
  ocr_raw_text?: string;
  confidence_score?: number;
}

export interface HeritageLocus {
  type: string;
  geometry: {
    type: string;
    coordinates: [number, number];
  };
  properties: {
    id: string;
    name: string;
    type: string;
    description: string;
    construction_period?: string;
    architectural_style?: string;
    era?: string;
    dynasty?: string;
    built_by?: string;
    district?: string;
    unesco_status?: string | null;
    asi_status?: string | null;
    condition?: string;
    images?: string[];
    lat?: number;
    lon?: number;
    links?: {
      twin_url?: string;
      inscription_url?: string;
    };
  };
}

export interface LocusCollection {
  type: string;
  features: HeritageLocus[];
}

export interface ExpeditionAsset {
  assetId: string;
  title: string;
  places: Array<{ name: string; lat: number; lon: number; conf: number }>;
  dynasties: string[];
  architecture: string[];
  tags: string[];
  dates: Array<{ text: string; ce?: number; vs?: number }>;
  photos?: Array<{ url: string; caption: string }>;
  links?: { twin?: string; inscription?: string };
  expedition_id?: string;
  summary?: string;
}

export interface Monument4DData {
  id?: string;
  name?: string;
  monument_name?: string;
  location?: string;
  timeline?: { min: number; max: number };
  condition_today?: {
    age_score: number;
    source: string;
    n_photos?: number;
    confidence: number;
  };
  base?: {
    spec?: {
      archetype?: string;
      counts?: { tiers?: number; pillars_per_tier?: number };
      dimensions?: { length_m?: number; width_m?: number; depth_m?: number };
    };
  };
  epochs: Array<{
    year: number;
    label?: string;
    era_label?: string;
    status?: string;
    confidence?: number;
    condition_estimate?: string;
    material?: any;
    water?: any;
    props?: string[];
    evidence?: Array<{ type?: string; ref?: string } | string>;
    structural_evidence?: string[];
  }>;
}

// ============== API CLIENT ==============

class DharoharAPI {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  // ---------- STEPWELL ENDPOINTS ----------
  async getStepwellMetadata(): Promise<StepwellData> {
    const res = await fetch(`${this.baseURL}/stepwell/metadata`);
    if (!res.ok) throw new Error('Failed to fetch stepwell metadata');
    return res.json();
  }

  async getStepwellEpochs(): Promise<HeritageEpoch[]> {
    const res = await fetch(`${this.baseURL}/stepwell/epochs`);
    if (!res.ok) throw new Error('Failed to fetch epochs');
    return res.json();
  }

  async getSolarTracking(date: string): Promise<SolarEvent[]> {
    const res = await fetch(`${this.baseURL}/stepwell/solar_tracking?date=${date}`);
    if (!res.ok) throw new Error('Failed to fetch solar tracking');
    return res.json();
  }

  async interpolateEpoch(t: number): Promise<any> {
    const res = await fetch(`${this.baseURL}/stepwell/interpolate?t=${t}`);
    if (!res.ok) throw new Error('Failed to interpolate epoch');
    return res.json();
  }

  // ---------- EPIGRAPHY ENDPOINTS ----------
  async getEpigraphySteles(): Promise<EpigraphyStele[]> {
    const res = await fetch(`${this.baseURL}/epigraphy/steles`);
    if (!res.ok) throw new Error('Failed to fetch steles');
    return res.json();
  }

  async getEpigraphyStele(id: string): Promise<EpigraphyStele> {
    const res = await fetch(`${this.baseURL}/epigraphy/steles/${id}`);
    if (!res.ok) throw new Error('Failed to fetch stele');
    return res.json();
  }

  async analyzeEpigraphy(params: {
    stele_id?: string;
    site_name?: string;
    script_hint?: string;
    enhance?: boolean;
    image?: File;
  }): Promise<AnalysisResult> {
    const query = new URLSearchParams();
    if (params.stele_id) query.append('stele_id', params.stele_id);
    if (params.script_hint) query.append('script_hint', params.script_hint);
    if (params.enhance !== undefined) query.append('enhance', String(params.enhance));

    const url = `${this.baseURL}/epigraphy/analyze?${query.toString()}`;

    let res: Response;
    if (params.image) {
      const formData = new FormData();
      formData.append('file', params.image);
      res = await fetch(url, { method: 'POST', body: formData });
    } else {
      res = await fetch(url, { method: 'POST' });
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail?.message || `Analysis failed: ${res.statusText}`);
    }
    return res.json();
  }

  async getGlyphCandidates(glyphId: string, context: string = 'वापीं धर्मार्थं'): Promise<any> {
    const res = await fetch(`${this.baseURL}/epigraphy/glyph/candidates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ glyph_id: glyphId, query_context: context }),
    });
    if (!res.ok) throw new Error('Failed to fetch glyph candidates');
    return res.json();
  }

  async exportEpigraphy(steleId: string, format: 'tei' | 'markdown' | 'json'): Promise<any> {
    const backendFormat = format === 'tei' ? 'tei_xml' : format;
    const res = await fetch(`${this.baseURL}/epigraphy/export`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stele_id: steleId, format: backendFormat }),
    });
    if (!res.ok) throw new Error('Failed to export epigraphy');
    const json = await res.json();
    return json.content !== undefined ? json.content : json;
  }

  // ---------- LOCI ENDPOINTS ----------
  async getLoci(): Promise<LocusCollection> {
    const res = await fetch(`${this.baseURL}/loci`);
    if (!res.ok) throw new Error('Failed to fetch loci');
    return res.json();
  }

  // ---------- EXPEDITION ENDPOINTS ----------
  async getExpeditions(): Promise<ExpeditionAsset[]> {
    const res = await fetch(`${this.baseURL}/expedition/assets`);
    if (!res.ok) throw new Error('Failed to fetch expeditions');
    return res.json();
  }

  async ingestJournal(payload: { journal: string; title?: string; photos?: string[] }): Promise<ExpeditionAsset> {
    const res = await fetch(`${this.baseURL}/expedition/ingest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        journal: payload.journal,
        title: payload.title || 'Field Observation Record',
        photos: payload.photos || [],
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to ingest journal');
    }
    return res.json();
  }

  async getExpeditionRoute(startId?: string, endId?: string): Promise<any> {
    const query = new URLSearchParams();
    if (startId) query.append('start_id', startId);
    if (endId) query.append('end_id', endId);
    const res = await fetch(`${this.baseURL}/expedition/route?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch expedition route');
    return res.json();
  }

  // ---------- STUDIO ENDPOINTS ----------
  async suggestTwin(query: string = ''): Promise<any[]> {
    const res = await fetch(`${this.baseURL}/studio/suggest?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error('Failed to get suggestions');
    return res.json();
  }

  async submitResearchJob(query: string, quality: string = 'high'): Promise<any> {
    const res = await fetch(`${this.baseURL}/studio/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, quality }),
    });
    if (!res.ok) throw new Error('Failed to submit studio job');
    return res.json();
  }

  async getStudioJob(jobId: string): Promise<any> {
    const res = await fetch(`${this.baseURL}/studio/jobs/${jobId}`);
    if (!res.ok) throw new Error('Failed to fetch studio job');
    return res.json();
  }

  // ---------- MONUMENT4D ENDPOINTS ----------
  async getMonument4D(monumentName: string): Promise<Monument4DData> {
    const res = await fetch(`${this.baseURL}/monument4d/${encodeURIComponent(monumentName)}`);
    if (!res.ok) throw new Error('Failed to fetch monument 4D data');
    return res.json();
  }

  async estimateCondition(monumentId: string): Promise<any> {
    const res = await fetch(`${this.baseURL}/monument4d/${encodeURIComponent(monumentId)}/estimate-condition`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to estimate condition');
    return res.json();
  }

  async getMonumentEvidence(monumentId: string): Promise<any> {
    const res = await fetch(`${this.baseURL}/monument4d/${encodeURIComponent(monumentId)}/evidence`);
    if (!res.ok) throw new Error('Failed to fetch monument evidence');
    return res.json();
  }

  // ---------- PLACE EXPLORER 4D (STUDENT FREE EDITION - PRD V1.0) ----------
  async getExploreSuggestions(query: string): Promise<any[]> {
    const res = await fetch(`${this.baseURL}/explore/suggest?q=${encodeURIComponent(query)}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.suggestions || [];
  }

  async startExploreJob(query: string, language: string = 'en', quality: string = 'high'): Promise<any> {
    const res = await fetch(`${this.baseURL}/explore/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, language, quality }),
    });
    if (!res.ok) throw new Error('Failed to start research job');
    return res.json();
  }

  async getExploreJobEvents(jobId: string): Promise<any> {
    const res = await fetch(`${this.baseURL}/explore/jobs/${encodeURIComponent(jobId)}/events`);
    if (!res.ok) throw new Error('Failed to fetch research events');
    return res.json();
  }

  async getExplorePlace(qidOrSlug: string): Promise<any> {
    const res = await fetch(`${this.baseURL}/explore/places/${encodeURIComponent(qidOrSlug)}`);
    if (!res.ok) throw new Error('Failed to fetch 4D place dossier');
    return res.json();
  }

  async getExploreStory(qidOrSlug: string, lang: string = 'en'): Promise<any> {
    const res = await fetch(`${this.baseURL}/explore/places/${encodeURIComponent(qidOrSlug)}/story?lang=${encodeURIComponent(lang)}`);
    if (!res.ok) throw new Error('Failed to fetch place story');
    return res.json();
  }

  async getExploreTerrain(qidOrSlug: string): Promise<any> {
    const res = await fetch(`${this.baseURL}/explore/places/${encodeURIComponent(qidOrSlug)}/terrain`);
    if (!res.ok) throw new Error('Failed to fetch terrain metadata');
    return res.json();
  }
}

export const api = new DharoharAPI();
