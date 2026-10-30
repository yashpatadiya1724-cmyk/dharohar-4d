// Dharohar 4D Historical Epochs & Monument4D Configuration
// Conforms to PRD Section 5.3, Section 31 & Section 32

export interface EpochMaterialParams {
  tint: string;
  roughness: number;
  normalStrength: number;
  patina: number;   // 0.0 to 1.0
  algae: number;    // 0.0 to 1.0
  silt: number;     // 0.0 to 1.0
  crack: number;    // 0.0 to 1.0
}

export interface EpochEvidence {
  type: "inscription" | "survey_report" | "gazette" | "excavation";
  ref: string;
  archive: string;
  link?: string;
}

export interface EpochConfig {
  id: string;
  year: number;
  name: string;
  dynasty: string;
  patron: string;
  status: "documented" | "inferred" | "conjectural";
  confidence: number;
  material: EpochMaterialParams;
  waterLevel: number; // 0.0 (empty) to 1.0 (overflow)
  waterClarity: number; // 0.0 (murky) to 1.0 (crystal)
  props: string[];
  lighting: string;
  description: string;
  evidence: EpochEvidence[];
}

export const DHAROHAR_EPOCHS: EpochConfig[] = [
  {
    id: "solanki-1063",
    year: 1063,
    name: "Solanki Golden Age",
    dynasty: "Chaulukya / Solanki Dynasty",
    patron: "King Bhimadeva I & Queen Udayamati",
    status: "documented",
    confidence: 0.95,
    material: {
      tint: "#E0B774",
      roughness: 0.82,
      normalStrength: 1.0,
      patina: 0.03,
      algae: 0.0,
      silt: 0.0,
      crack: 0.01,
    },
    waterLevel: 0.9,
    waterClarity: 0.98,
    props: ["ceremonial_braziers", "gilded_torana_drapes", "earthen_diyas"],
    lighting: "Direct sunlight through open shafts with flickering ceremonial fires.",
    description: "Peak subterranean architecture during the Solanki golden age. Freshly cut Dhrangadhra golden sandstone, vibrant vermilion mineral frescoes, and sacred crystal aquifers.",
    evidence: [
      {
        type: "inscription",
        ref: "Epigraphia Indica Vol. IX: Chaulukya Copper Plates",
        archive: "Archaeological Survey of India Archive",
      },
      {
        type: "survey_report",
        ref: "Burgess: The Architectural Antiquities of Northern Gujarat",
        archive: "Digital Library of India (Public Domain)",
      },
    ],
  },
  {
    id: "vaghela-1498",
    year: 1498,
    name: "Vaghela & Sultanate Synthesis",
    dynasty: "Vaghela Dynasty & Gujarat Sultanate",
    patron: "Queen Rudabai (Consort of Rana Veer Singh) & Mahmud Begada",
    status: "documented",
    confidence: 0.98,
    material: {
      tint: "#D4A968",
      roughness: 0.88,
      normalStrength: 1.0,
      patina: 0.12,
      algae: 0.04,
      silt: 0.05,
      crack: 0.03,
    },
    waterLevel: 0.78,
    waterClarity: 0.88,
    props: ["brass_hanging_lamps", "floral_arch_inlays", "rest_carpets"],
    lighting: "Filtered sunbeams and brass oil lamps along pavilion balustrades.",
    description: "Built by Queen Rudabai in memory of Rana Veer Singh. Rare synthesis of Solanki sculptural iconography (Ami Khumbor, Kalpavriksha) with ornate Indo-Islamic geometric arches.",
    evidence: [
      {
        type: "inscription",
        ref: "Adalaj Marble Foundation Edict (Vikram Samvat 1555)",
        archive: "Preserved in Tier 1 marble niche at Adalaj Ni Vav",
      },
    ],
  },
  {
    id: "colonial-1890",
    year: 1890,
    name: "Colonial Survey Era",
    dynasty: "British Raj / Archaeological Survey of Western India",
    patron: "James Burgess (Archaeological Surveyor)",
    status: "inferred",
    confidence: 0.82,
    material: {
      tint: "#B89665",
      roughness: 0.95,
      normalStrength: 1.15,
      patina: 0.48,
      algae: 0.38,
      silt: 0.42,
      crack: 0.15,
    },
    waterLevel: 0.45,
    waterClarity: 0.38,
    props: ["theodolite_tripods", "survey_plumb_lines", "silt_mounds", "kerosene_lanterns"],
    lighting: "Overcast ambient daylight with field kerosene lamps casting long shadows.",
    description: "Period of rediscovery and documentation. Centuries of monsoon silt accumulated in lower tiers; natural sandstone weathering, lichens, and initial architectural drawings.",
    evidence: [
      {
        type: "survey_report",
        ref: "Archaeological Survey of Western India Reports (Burgess, 1890-1903)",
        archive: "British Library India Office Records",
      },
      {
        type: "excavation",
        ref: "Photographic Plates of Northern Gujarat Monuments (Curzon Collection)",
        archive: "ASI Central Archaeological Library",
      },
    ],
  },
  {
    id: "modern-2026",
    year: 2026,
    name: "Modern ASI Conservation",
    dynasty: "Republic of India",
    patron: "Archaeological Survey of India (ASI) & IIT Gandhinagar",
    status: "documented",
    confidence: 0.99,
    material: {
      tint: "#CDAA72",
      roughness: 0.86,
      normalStrength: 1.0,
      patina: 0.22,
      algae: 0.08,
      silt: 0.02,
      crack: 0.06,
    },
    waterLevel: 0.65,
    waterClarity: 0.92,
    props: ["led_heritage_uplights", "visitor_brass_railings", "qr_audio_plaques", "digital_twin_sensors"],
    lighting: "Solar raytracer plus warm 2700K museum-grade LED uplights.",
    description: "National Monument of Protected Heritage. Continuous microclimate humidity monitoring, conserved ashlar stone facades, laser-scanned structural models, and visitor pathways.",
    evidence: [
      {
        type: "gazette",
        ref: "ASI Monument Notification N-GJ-2: Adalaj Stepwell Protected Status",
        archive: "Gazette of India",
      },
      {
        type: "survey_report",
        ref: "IIT Gandhinagar Explorer Fellowship Heritage Mapping Protocol",
        archive: "IITGN Cultural Heritage Lab",
      },
    ],
  },
];
