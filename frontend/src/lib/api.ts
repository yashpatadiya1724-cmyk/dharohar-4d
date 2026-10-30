const BASE_URL = "/api/v1";

function getAuthHeader(): Record<string, string> {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("lifepulse_token");
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
  }
  return {};
}

async function fetcher<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    "Content-Type": "application/json",
    ...getAuthHeader(),
    ...(options.headers || {}),
  };

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Network request failed" }));
      throw new Error(err.detail || "An error occurred");
    }

    return await res.json();
  } catch (err: any) {
    console.warn(`API call ${endpoint} error:`, err.message);
    throw err;
  }
}

export const api = {
  // Auth
  requestOTP: (phone: string) =>
    fetcher<{ message: string; demo_otp: string }>("/auth/otp/request", {
      method: "POST",
      body: JSON.stringify({ phone }),
    }),

  verifyOTP: (phone: string, otp: string) =>
    fetcher<any>("/auth/otp/verify", {
      method: "POST",
      body: JSON.stringify({ phone, otp }),
    }),

  // Onboarding
  completeOnboarding: (data: any) =>
    fetcher<any>("/onboarding", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Score
  getScore: () => fetcher<any>("/score/me"),

  // Actions
  getTodayActions: (lang: string = "en") =>
    fetcher<any[]>("/actions/today", {
      headers: { "Accept-Language": lang },
    }),

  completeAction: (actionId: string, verificationType: string, proofUrl?: string) =>
    fetcher<any>(`/actions/${actionId}/complete`, {
      method: "POST",
      body: JSON.stringify({
        verification_type: verificationType,
        proof_url: proofUrl,
        idempotency_key: `${actionId}-${Date.now()}`,
      }),
    }),

  skipAction: (actionId: string) =>
    fetcher<any>(`/actions/${actionId}/skip`, { method: "POST" }),

  // Peak Shifting
  getPeakPlan: () => fetcher<any>("/peak/plan"),
  schedulePeakShift: (appliance: string, targetTime: string) =>
    fetcher<any>("/peak/schedule", {
      method: "POST",
      body: JSON.stringify({ appliance, target_time: targetTime }),
    }),

  // Solar Engine
  estimateSolar: (data: {
    monthly_bill_rs?: number;
    roof_area_sqm: number;
    shading: string;
    pincode?: string;
  }) =>
    fetcher<any>("/solar/estimate", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // What-If Simulator
  simulateWhatIf: (data: {
    ac_temp_celsius: number;
    ac_daily_hours: number;
    geyser_minutes_daily: number;
    led_bulb_percentage: number;
    standby_power_cut: boolean;
  }) =>
    fetcher<any>("/simulate", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Quests & Leaderboard
  getQuests: () => fetcher<any[]>("/quests"),
  joinQuest: (questId: string) =>
    fetcher<any>(`/quests/${questId}/join`, { method: "POST" }),
  getLeaderboard: (scope: string = "society") =>
    fetcher<any[]>(`/leaderboard?scope=${scope}`),

  // AI Coach
  askCoach: (question: string, lang: string = "en") =>
    fetcher<any>("/coach/ask", {
      method: "POST",
      body: JSON.stringify({ question, lang }),
    }),

  // Places
  getPlaces: (type?: string) =>
    fetcher<any[]>(type ? `/places?type=${type}` : "/places"),

  // Smart Meter & Anomaly
  getLiveSmartMeter: () => fetcher<any>("/meter/live"),
  simulateMeterSpike: (spike_kw: number = 38.5) =>
    fetcher<any>("/meter/simulate-spike", {
      method: "POST",
      body: JSON.stringify({ spike_kw }),
    }),

  // Water Tracker
  getWaterSummary: () => fetcher<any>("/water/summary"),
  logWaterActivity: (activity_type: string, litres_saved: number) =>
    fetcher<any>("/water/log", {
      method: "POST",
      body: JSON.stringify({ activity_type, litres_saved }),
    }),
  submitLeakAudit: (meter_moved: boolean, duration_hours: number = 2) =>
    fetcher<any>("/water/leak-audit", {
      method: "POST",
      body: JSON.stringify({ meter_moved, duration_hours }),
    }),

  // Microgrid P2P Energy Trading
  getMicrogridState: (hour?: number) =>
    fetcher<any>(hour !== undefined ? `/microgrid/state?hour=${hour}` : "/microgrid/state"),
  placeMicrogridTrade: (data: {
    trader_name: string;
    trade_type: string;
    units_kwh: number;
    bid_price: number;
  }) =>
    fetcher<any>("/microgrid/trade", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Dharohar 4D (IIT Gandhinagar Heritage Digital Twin)
  getStepwellData: () => fetcher<any>("/dharohar/stepwell"),
  getStepwellEpochs: () => fetcher<any>("/stepwell/epochs"),
  getStepwellSun: (hour: number, doy: number = 172, lat: number = 23.1667, lon: number = 72.5800) =>
    fetcher<any>(`/stepwell/sun?hour=${hour}&day_of_year=${doy}&lat=${lat}&lon=${lon}`),
  getLoci: (type?: string, district?: string) => {
    const params = new URLSearchParams();
    if (type) params.append("type", type);
    if (district) params.append("district", district);
    const qs = params.toString() ? `?${params.toString()}` : "";
    return fetcher<any>(`/loci${qs}`);
  },
  getLocus: (id: string) => fetcher<any>(`/loci/${id}`),
  getInscriptions: () => fetcher<any[]>("/dharohar/inscriptions"),
  getEpigraphySteles: () => fetcher<any[]>("/epigraphy/steles"),
  getEpigraphyStele: (id: string) => fetcher<any>(`/epigraphy/steles/${id}`),
  decipherInscription: (data: {
    inscription_id?: string;
    user_notes?: string;
    enhance_resolution?: boolean;
  }) =>
    fetcher<any>("/dharohar/decipher", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  analyzeEpigraphy: (data: any) =>
    fetcher<any>("/epigraphy/analyze", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getGlyphCandidates: (data: { glyph_id: string; query_context?: string }) =>
    fetcher<any>("/epigraphy/glyph/candidates", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  exportEpigraphy: (data: { stele_id: string; format: string }) =>
    fetcher<any>("/epigraphy/export", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getExpeditions: () => fetcher<any[]>("/dharohar/expeditions"),
  getExpeditionAssets: (tag?: string, dynasty?: string) => {
    const params = new URLSearchParams();
    if (tag) params.append("tag", tag);
    if (dynasty) params.append("dynasty", dynasty);
    const qs = params.toString() ? `?${params.toString()}` : "";
    return fetcher<any[]>(`/expedition/assets${qs}`);
  },
  getExpeditionRoute: () => fetcher<any>("/expedition/route"),
  ingestExpedition: (data: { journal: string; photos?: string[]; title?: string }) =>
    fetcher<any>("/expedition/ingest", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getStudioSuggestions: (q: string = "") => fetcher<any[]>(`/studio/suggest?q=${encodeURIComponent(q)}`),
  createStudioJob: (data: { query: string; quality?: string }) =>
    fetcher<any>("/studio/jobs", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getMonument4D: (id: string = "adalaj") => fetcher<any>(`/monument4d/${id}`),
  estimateMonumentCondition: (id: string = "adalaj") =>
    fetcher<any>(`/monument4d/${id}/estimate-condition`, { method: "POST" }),
  getMonumentEvidence: (id: string = "adalaj") => fetcher<any>(`/monument4d/${id}/evidence`),
  uploadInscriptionImage: async (formData: FormData) => {
    const res = await fetch(`${BASE_URL}/dharohar/upload-inscription`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) throw new Error("Failed to upload and segment inscription image");
    return await res.json();
  },
  reconstructExpedition: (data: {
    title: string;
    monument_name: string;
    location_str: string;
    raw_field_notes: string;
    latitude?: number;
    longitude?: number;
    images_count?: number;
  }) =>
    fetcher<any>("/dharohar/reconstruct-expedition", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  generateCustomTwin: (data: {
    monument_name: string;
    location: string;
    dynasty?: string;
    architectural_style?: string;
    depth_meters?: number;
    tiers_count?: number;
    geometry_type?: string;
    stone_material?: string;
    water_state?: string;
    photo_urls?: string[];
    manual_notes?: string;
    latitude?: number;
    longitude?: number;
  }) =>
    fetcher<any>("/dharohar/generate-twin", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  autonomousResearchAndGenerate: (query: string) =>
    fetcher<any>("/dharohar/autonomous-research", {
      method: "POST",
      body: JSON.stringify({ query }),
    }),

  // GEDA Admin
  getAdminOverview: () => fetcher<any>("/admin/overview"),
  getAdminReviewQueue: () => fetcher<any[]>("/admin/review-queue"),
  decideReview: (actionId: string, approved: boolean) =>
    fetcher<any>(`/admin/review/${actionId}`, {
      method: "POST",
      body: JSON.stringify({ approved }),
    }),
};
