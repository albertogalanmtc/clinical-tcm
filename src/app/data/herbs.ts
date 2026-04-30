export interface SubPattern {
  name: string;
  combination?: string[];
  formula_example?: string;
}

export interface HerbActionBranch {
  pattern: string;
  sub_patterns?: SubPattern[]; // Array of sub-pattern objects
  combination?: string[]; // Only used if no sub_patterns
  formula_example?: string; // Only used if no sub_patterns
}

export interface HerbAction {
  title: string;
  branches: HerbActionBranch[];
}

export interface ClinicalApplication {
  condition: string;
  pattern: string | null;
}

export interface DuiYao {
  pair: string[]; // Array of 2 herb names
  functions: string[];
  notes: string;
}

export interface Herb {
  herb_id: string;
  pinyin_name: string;
  hanzi_name?: string;
  pharmaceutical_name?: string;
  english_name?: string;
  category?: string;
  subcategory?: string;
  nature?: string;
  flavor?: string[];
  channels?: string[];
  banned_countries?: string[];
  actions?: (string | HerbAction)[]; // Support both old string[] and new object structure
  indications?: string[];
  dui_yao?: DuiYao[]; // Herb pairs and their synergistic functions
  clinical_applications?: ClinicalApplication[]; // New structure for clinical applications
  cautions?: string[];
  contraindications?: string[];
  dose?: string;
  toxicology?: string[];
  pregnancy_warning?: {
    icon: boolean;
    details: string[];
  };
  antagonisms?: string[]; // List of herb names that are antagonists
  incompatibilities?: string[]; // List of herb names that are incompatible
  pharmacological_effects?: string[]; // Migrated to simple string array
  biological_mechanisms?: Array<{ system: string; target_action: string | string[] }>; // target_action can be string or array
  bioactive_compounds?: string[] | Array<{ chemical_class: string; compounds: string[] }>; // Flexible: simple array or grouped by chemical class
  detoxification?: Array<{ toxin_group: string; agents: string[] }>;
  clinical_studies_and_research?: string[];
  herb_drug_interactions?: string[];
  herb_herb_interactions?: string[];
  allergens?: string[];
  notes?: string[];
  references?: string[];
  // Metadata for user-created herbs
  isSystemItem?: boolean;
  createdBy?: {
    userId: string;
    userName: string;
    userEmail: string;
  };
  createdAt?: string; // ISO date
  updatedAt?: string; // ISO date
}

// Herb data array - populated dynamically by users
export const herbsData: Herb[] = [
  {
    herb_id: "h1_001_MH",
    pinyin_name: "Ma Huang",
    hanzi_name: "麻黄",
    pharmaceutical_name: "Herba Ephedrae",
    english_name: "ephedra",
    category: "Exterior-Releasing",
    subcategory: "Wind-Cold Releasing",
    nature: "Warm",
    flavor: ["Acrid", "Bitter"],
    channels: ["LU", "UB"],
    toxicology: [],
    dose: "2~9g",
    banned_countries: [],
    actions: [
      {
        title: "Releases the exterior through diaphoresis",
        branches: [
          {
            pattern: "Exterior-excess wind-cold condition",
            combination: ["Gui Zhi"],
            formula_example: "Ma Huang Tang"
          }
        ]
      },
      {
        title: "Relieves wheezing and dyspnea, stops cough",
        branches: [
          {
            pattern: "Wind-cold constriction of the Lung leading to Lung qi reversal",
            sub_patterns: [
              {
                name: "Cough from wind-cold attacking the exterior and constricting Lung qi",
                combination: ["Xing Ren"]
              }
            ]
          },
          {
            pattern: "Lung heat",
            sub_patterns: [
              {
                name: "Wheezing or cough caused by Lung heat",
                combination: ["Shi Gao", "Xing Ren"],
                formula_example: "Ma Xing Gan Shi Tang"
              }
            ]
          },
          {
            pattern: "Wind-cold attack at the exterior with cold stagnation in the interior",
            sub_patterns: [
              {
                name: "Wheezing or cough from wind-cold attack with interior cold stagnation",
                combination: ["Gan Jiang", "Xi Xin", "Ban Xia"],
                formula_example: "Xiao Qing Long Tang"
              }
            ]
          },
          {
            pattern: "Qi and phlegm stagnation",
            sub_patterns: [
              {
                name: "Wheezing and dyspnea caused by stagnation of qi and phlegm",
                combination: ["Xing Ren", "Chen Pi", "Hou Po"],
                formula_example: "Shen Mi Tang"
              }
            ]
          }
        ]
      },
      {
        title: "Regulates water circulation and relieves edema",
        branches: [
          {
            pattern: "Edema with exterior syndrome",
            combination: ["Sheng Jiang", "Bai Zhu", "Gan Cao"],
            formula_example: "Yue Bi Jia Zhu Tang"
          }
        ]
      },
      {
        title: "Disperses cold",
        branches: [
          {
            pattern: "Bi Zheng (painful obstruction syndrome)",
            sub_patterns: [
              {
                name: "Bi Zheng caused by wind-damp",
                combination: ["Yi Yi Ren", "Xing Ren", "Gan Cao"]
              }
            ]
          },
          {
            pattern: "Yin sores",
            sub_patterns: [
              {
                name: "Yin sores",
                combination: ["Shu Di Huang", "Bai Jie Zi", "Lu Jiao Jiao"]
              }
            ]
          },
          {
            pattern: "Arteritis obliterans / obliterating phlebitis / Raynaud's disease",
            combination: ["Shu Di Huang", "Bai Jie Zi", "Lu Jiao Jiao", "Rou Gui", "Gan Cao"]
          }
        ]
      }
    ],
    indications: [],
    dui_yao: [],
    clinical_applications: [],
    cautions: [
      "Pregnancy.",
      "Liver yang rising.",
      "Yin deficiency fire."
    ],
    contraindications: [
      "Insomnia.",
      "Convulsions.",
      "Epilepsy or seizure disorders.",
      "Hypertension.",
      "Liver yang rising.",
      "Yin deficiency fire."
    ],
    antagonisms: [],
    incompatibilities: [],
    pharmacological_effects: [
      "Contains ephedrine.",
      "Diaphoretic.",
      "Antipyretic.",
      "Respiratory stimulant.",
      "Diuretic.",
      "Cardiovascular stimulant.",
      "CNS stimulant.",
      "Antibiotic activity reported."
    ],
    biological_mechanisms: [],
    bioactive_compounds: [],
    detoxification: [],
    clinical_studies_and_research: [],
    herb_drug_interactions: [
      "Cardiac glycosides.",
      "Beta-blockers.",
      "Diuretics."
    ],
    herb_herb_interactions: [],
    allergens: [],
    notes: [],
    references: [],
    pregnancy_warning: { icon: false, details: [] },
    isSystemItem: true
  },
  {
    herb_id: "h9_001_LHF",
    pinyin_name: "Lóng Huǒ Fēng",
    hanzi_name: "龙火风",
    pharmaceutical_name: "Folium Dracoignis",
    english_name: "dragon fire leaf",
    category: "Heat-Clearing",
    subcategory: "Fire-Purging",
    nature: "Cold",
    flavor: ["Bitter", "Acrid"],
    channels: ["HT", "LV"],
    toxicology: [],
    dose: "3~9g",
    banned_countries: [],
    actions: [
      {
        title: "Clears blazing heart fire",
        branches: [
          {
            pattern: "Heart fire blazing",
            sub_patterns: [
              {
                name: "Restlessness and mouth ulcers",
                combination: ["Qīng Lián Gēn"],
                formula_example: "Lóng Huǒ Tāng"
              }
            ]
          }
        ]
      }
    ],
    indications: [],
    dui_yao: [],
    clinical_applications: [],
    cautions: [],
    contraindications: [],
    antagonisms: ["Qīng Lián Gēn"],
    incompatibilities: [],
    pharmacological_effects: [],
    biological_mechanisms: [],
    bioactive_compounds: [],
    detoxification: [],
    clinical_studies_and_research: [],
    herb_drug_interactions: [],
    herb_herb_interactions: [],
    allergens: [],
    notes: [],
    references: [],
    pregnancy_warning: { icon: false, details: [] },
    isSystemItem: true
  },
  {
    herb_id: "h9_002_QLG",
    pinyin_name: "Qīng Lián Gēn",
    hanzi_name: "清莲根",
    pharmaceutical_name: "Radix Nelumbinis Purificata",
    english_name: "pure lotus root",
    category: "Heat-Clearing",
    subcategory: "Toxin-Eliminating",
    nature: "Cold",
    flavor: ["Sweet", "Bitter"],
    channels: ["HT", "ST"],
    toxicology: [],
    dose: "6~12g",
    banned_countries: [],
    actions: [
      {
        title: "Clears toxin heat from the blood",
        branches: [
          {
            pattern: "Toxic heat in the blood",
            sub_patterns: [
              {
                name: "Red eruptions and fever",
                combination: ["Shí Yán Zhī"],
                formula_example: "Lián Dú Tāng"
              }
            ]
          }
        ]
      }
    ],
    indications: [],
    dui_yao: [],
    clinical_applications: [],
    cautions: [],
    contraindications: [],
    antagonisms: ["Lóng Huǒ Fēng"],
    incompatibilities: ["Shí Yán Zhī"],
    pharmacological_effects: [],
    biological_mechanisms: [],
    bioactive_compounds: [],
    detoxification: [],
    clinical_studies_and_research: [],
    herb_drug_interactions: [],
    herb_herb_interactions: [],
    allergens: [],
    notes: [],
    references: [],
    pregnancy_warning: { icon: false, details: [] },
    isSystemItem: true
  },
  {
    herb_id: "h9_003_SYZ",
    pinyin_name: "Shí Yán Zhī",
    hanzi_name: "石炎枝",
    pharmaceutical_name: "Ramulus Pyrocalcis",
    english_name: "stone flame twig",
    category: "Interior-Warming",
    subcategory: "Cold-Dispelling",
    nature: "Hot",
    flavor: ["Acrid", "Salty"],
    channels: ["KI", "SP"],
    toxicology: [],
    dose: "1~6g",
    banned_countries: [],
    actions: [
      {
        title: "Warms kidney yang and disperses cold",
        branches: [
          {
            pattern: "Kidney yang deficiency with cold limbs",
            combination: ["Ròu Guì"],
            formula_example: "Yán Huǒ Wán"
          }
        ]
      }
    ],
    indications: [],
    dui_yao: [],
    clinical_applications: [],
    cautions: [],
    contraindications: [],
    antagonisms: [],
    incompatibilities: ["Qīng Lián Gēn"],
    pharmacological_effects: [],
    biological_mechanisms: [],
    bioactive_compounds: [],
    detoxification: [],
    clinical_studies_and_research: [],
    herb_drug_interactions: [],
    herb_herb_interactions: [],
    allergens: [],
    notes: [],
    references: [],
    pregnancy_warning: { icon: false, details: [] },
    isSystemItem: true
  },
  {
    herb_id: "h9_010_QYL",
    pinyin_name: "Qīng Yún Lán",
    hanzi_name: "青云兰",
    pharmaceutical_name: "Radix Orchidalis Caelestis",
    english_name: "azure cloud orchid root",
    category: "Heat-Clearing",
    subcategory: "Heat-Clearing and Damp-Drying",
    nature: "Cool",
    flavor: ["Bitter", "Sweet"],
    channels: ["LV", "GB"],
    toxicology: ["Toxic when used in high doses", "Mild hepatotoxic potential"],
    dose: "6~12g",
    banned_countries: ["USA", "Canada"],
    actions: [
      {
        title: "Clears damp heat from the liver and gallbladder",
        branches: [
          {
            pattern: "Damp heat in the liver channel",
            sub_patterns: [
              {
                name: "Hypochondriac pain and bitter taste in the mouth",
                combination: ["Long Dan Cao", "Huang Qin"],
                formula_example: "Qing Yun San"
              }
            ]
          },
          {
            pattern: "Damp heat obstructing the gallbladder",
            sub_patterns: [
              {
                name: "Jaundice with dark urine",
                combination: ["Yin Chen Hao", "Zhi Zi"],
                formula_example: "Yun Lan Tang"
              }
            ]
          }
        ]
      },
      {
        title: "Invigorates blood and relieves pain",
        branches: [
          {
            pattern: "Blood stasis in the chest",
            sub_patterns: [
              {
                name: "Stabbing chest pain",
                combination: ["Dan Shen", "Chuan Xiong"],
                formula_example: "Lan Xiong Tang"
              }
            ]
          },
          {
            pattern: "Blood stasis in the lower abdomen",
            sub_patterns: [
              {
                name: "Irregular menstruation with clots",
                combination: ["Yi Mu Cao", "Chi Shao"],
                formula_example: "Yun Hua Wan"
              }
            ]
          }
        ]
      }
    ],
    indications: [
      "Hypochondriac pain due to liver heat",
      "Jaundice with damp heat",
      "Menstrual pain due to blood stasis",
      "Chest pain from qi and blood stagnation"
    ],
    dui_yao: [],
    clinical_applications: [],
    cautions: [
      "Use with caution during pregnancy",
      "Use with caution in patients with weak spleen qi"
    ],
    contraindications: [
      "Severe liver deficiency",
      "Cold deficiency in the spleen and stomach"
    ],
    antagonisms: ["Wu Ling Zhi", "Hai Zao"],
    incompatibilities: ["Gan Sui", "Da Ji"],
    pharmacological_effects: [
      "Anti-inflammatory",
      "Hepatoprotective",
      "Antioxidant",
      "Choleretic"
    ],
    biological_mechanisms: [
      {
        system: "Hepatic",
        target_action: "Reduces inflammatory cytokine production in hepatocytes"
      },
      {
        system: "Cardiovascular",
        target_action: "Improves microcirculation by inhibiting platelet aggregation"
      }
    ],
    bioactive_compounds: [],
    detoxification: [],
    clinical_studies_and_research: [
      "Animal study showing hepatoprotective activity",
      "Pilot clinical study on jaundice symptoms"
    ],
    herb_drug_interactions: [
      "May potentiate anticoagulant drugs",
      "May interact with hepatotoxic medications"
    ],
    herb_herb_interactions: [
      "Synergistic with Yin Chen Hao",
      "Enhances effects of Dan Shen"
    ],
    allergens: [
      "Possible allergic reaction in orchid-sensitive individuals",
      "Rare contact dermatitis reported"
    ],
    notes: [
      "Traditionally harvested in high mountain regions",
      "Often processed by drying in shade"
    ],
    references: [
      "Traditional Materia Medica Compendium",
      "Journal of Herbal Pharmacology 2022"
    ],
    pregnancy_warning: { icon: false, details: [] },
    isSystemItem: true
  },
  {
    herb_id: "h9_011_BSL",
    pinyin_name: "Bái Shān Lán",
    hanzi_name: "白山兰",
    pharmaceutical_name: "Radix Orchidalis Alba",
    english_name: "white mountain orchid root",
    category: "Qi-Regulating",
    subcategory: "Qi-Moving",
    nature: "Neutral",
    flavor: ["Sweet", "Acrid"],
    channels: ["SP", "ST"],
    toxicology: ["Mild toxicity reported", "Toxic in very high doses"],
    dose: "6~10g",
    banned_countries: ["Germany", "Australia"],
    actions: [
      "Regulates middle jiao qi",
      "Harmonizes stomach and relieves distention"
    ],
    indications: [
      "Abdominal distention",
      "Poor appetite"
    ],
    dui_yao: [],
    clinical_applications: [],
    cautions: [
      "Use with caution during pregnancy",
      "Use with caution in severe qi deficiency"
    ],
    contraindications: [
      "Severe stomach cold",
      "Chronic diarrhea due to spleen deficiency"
    ],
    antagonisms: ["Wu Ling Zhi", "Hai Zao"],
    incompatibilities: ["Gan Sui", "Da Ji"],
    pharmacological_effects: [
      "Digestive stimulant",
      "Anti-inflammatory",
      "Antispasmodic",
      "Mild sedative"
    ],
    biological_mechanisms: [
      {
        system: "Digestive",
        target_action: "Stimulates gastric motility"
      },
      {
        system: "Nervous",
        target_action: "Reduces visceral pain signaling"
      }
    ],
    bioactive_compounds: [],
    detoxification: [],
    clinical_studies_and_research: [
      "Small pilot study on functional dyspepsia",
      "Animal study showing antispasmodic effects"
    ],
    herb_drug_interactions: [
      "May enhance effects of prokinetic drugs",
      "May interact with antispasmodic medications"
    ],
    herb_herb_interactions: [
      "Synergistic with Chen Pi",
      "Enhances digestive effects of Sha Ren"
    ],
    allergens: [
      "Rare allergic skin reactions",
      "Possible gastrointestinal sensitivity"
    ],
    notes: [
      "Traditionally harvested in spring",
      "Often used in digestive formulas"
    ],
    references: [
      "Materia Medica of the Southern Mountains",
      "Journal of Herbal Digestive Research"
    ],
    pregnancy_warning: { icon: false, details: [] },
    isSystemItem: true
  }
];