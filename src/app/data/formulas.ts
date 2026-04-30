export interface ClinicalApplication {
  condition: string;
  pattern: string | null;
}

export interface Formula {
  formula_id: string;
  pinyin_name: string;
  hanzi_name?: string;
  translated_name?: string;
  alternative_names?: string[];

  category?: string;
  subcategory?: string;

  source?: string;
  thermal_action?: string; // very hot, hot, warm, slightly warm, neutral, slightly cool, cool, cold, very cold

  composition?: Array<{
    herb_pinyin: string;
    pharmaceutical_name: string;
    dosage: string;
    role?: string;
    function_in_formula?: string;
  }>;
  dosage?: string[];
  preparation?: string[];
  administration?: string[];

  tcm_actions?: string[];
  clinical_manifestations?: string[];
  clinical_applications?: ClinicalApplication[];
  modifications?: Array<{
    pattern: string;
    add: string[];
    remove: string[];
  }>;

  pharmacological_effects?: string[];
  biological_mechanisms?: Array<{
    system: string;
    target_action: string;
  }>;
  clinical_studies_and_research?: string[];

  drug_interactions?: string[];
  herb_interactions?: string[];
  allergens?: string[];

  cautions?: string[];
  contraindications?: string[];
  toxicology?: string[];

  notes?: string[];
  reference?: string[];

  // Metadata for user-created formulas
  isSystemItem?: boolean;
  createdBy?: {
    userId: string;
    userName: string;
    userEmail: string;
  };
  createdAt?: string; // ISO date
  updatedAt?: string; // ISO date
}

export const formulasData: Formula[] = [
  {
    "formula_id": "F001",
    "pinyin_name": "Ma Huang Tang",
    "hanzi_name": "麻黄汤",
    "translated_name": "Ephedra Decoction",
    "alternative_names": ["Ephedra Formula", "Ma Huang Decoction"],

    "category": "Exterior-Releasing",
    "subcategory": "Wind-Cold Excess",

    "source": "Shang Han Lun",
    "thermal_action": "warm",

    "composition": [
      {
        "herb_pinyin": "Ma Huang",
        "pharmaceutical_name": "Herba Ephedrae",
        "dosage": "9g"
      },
      {
        "herb_pinyin": "Gui Zhi",
        "pharmaceutical_name": "Ramulus Cinnamomi",
        "dosage": "6g"
      },
      {
        "herb_pinyin": "Xing Ren",
        "pharmaceutical_name": "Semen Armeniacae",
        "dosage": "9g"
      },
      {
        "herb_pinyin": "Zhi Gan Cao",
        "pharmaceutical_name": "Radix et Rhizoma Glycyrrhizae Praeparata cum Melle",
        "dosage": "3g"
      }
    ],
    "dosage": [
      "1 dose per day",
      "Short-term use for acute conditions"
    ],
    "preparation": [
      "Decoction"
    ],
    "administration": [
      "Oral, taken warm"
    ],

    "tcm_actions": [
      "Releases the exterior",
      "Disperses Wind-Cold",
      "Facilitates Lung Qi",
      "Stops wheezing"
    ],
    "clinical_manifestations": [
      "Chills and fever",
      "Absence of sweating",
      "Wheezing",
      "Body aches"
    ],
    "clinical_applications": [
      { "condition": "Wind-Cold exterior excess", "pattern": null }
    ],
    "modifications": [
      {
        "pattern": "For internal heat signs",
        "add": ["Shi Gao"],
        "remove": []
      },
      {
        "pattern": "For phlegm accumulation",
        "add": ["Ban Xia"],
        "remove": []
      }
    ],

    "pharmacological_effects": [
      "Diaphoretic",
      "Bronchodilator"
    ],
    "biological_mechanisms": [
      {
        "system": "Adrenergic",
        "target_action": "Stimulation"
      }
    ],
    "clinical_studies_and_research": [
      "Explored in acute respiratory symptom models"
    ],

    "drug_interactions": [
      "Beta-blockers",
      "MAO inhibitors",
      "Stimulants"
    ],
    "herb_interactions": [
      "Other warming stimulant herbs"
    ],
    "allergens": [],

    "cautions": [
      "Hypertension",
      "Insomnia",
      "Cardiac sensitivity"
    ],
    "contraindications": [
      "Yin deficiency",
      "Excess heat"
    ],
    "toxicology": [
      "High doses may cause agitation and palpitations"
    ],

    "notes": [
      "Classic formula for Wind-Cold excess without sweating"
    ],
    "reference": [
      "Shang Han Lun"
    ]
  },

  {
    "formula_id": "F002",
    "pinyin_name": "Liu Wei Di Huang Wan",
    "hanzi_name": "六味地黄丸",
    "translated_name": "Six-Ingredient Pill with Rehmannia",
    "alternative_names": ["Six Flavor Rehmannia Pill"],

    "category": "Tonic",
    "subcategory": "Yin Tonic",

    "source": "Xiao Er Yao Zheng Zhi Jue",
    "thermal_action": "slightly cold",

    "composition": [
      {
        "herb_pinyin": "Shu Di Huang",
        "pharmaceutical_name": "Radix Rehmanniae Preparata",
        "dosage": "24g"
      },
      {
        "herb_pinyin": "Shan Zhu Yu",
        "pharmaceutical_name": "Fructus Corni",
        "dosage": "12g"
      },
      {
        "herb_pinyin": "Shan Yao",
        "pharmaceutical_name": "Rhizoma Dioscoreae",
        "dosage": "12g"
      },
      {
        "herb_pinyin": "Fu Ling",
        "pharmaceutical_name": "Poria",
        "dosage": "9g"
      },
      {
        "herb_pinyin": "Mu Dan Pi",
        "pharmaceutical_name": "Cortex Moutan",
        "dosage": "9g"
      },
      {
        "herb_pinyin": "Ze Xie",
        "pharmaceutical_name": "Rhizoma Alismatis",
        "dosage": "9g"
      }
    ],
    "dosage": [
      "Divided daily doses"
    ],
    "preparation": [
      "Pill preparation"
    ],
    "administration": [
      "Oral"
    ],

    "tcm_actions": [
      "Nourishes Kidney Yin",
      "Tonifies Liver Yin"
    ],
    "clinical_manifestations": [
      "Night sweats",
      "Lower back weakness",
      "Dry mouth"
    ],
    "clinical_applications": [
      { "condition": "Kidney Yin deficiency", "pattern": null },
      { "condition": "Hypertension", "pattern": "Kidney Yin Deficiency" },
      { "condition": "Menopausal Symptoms", "pattern": "Kidney Yin Deficiency" },
      { "condition": "Xiao Ke (Wasting-Thirst)", "pattern": "Kidney Yin Deficiency" }
    ],
    "modifications": [
      "Add Zhi Mu and Huang Bai for empty heat"
    ],

    "pharmacological_effects": [
      "Antioxidant activity"
    ],
    "biological_mechanisms": [
      {
        "system": "Endocrine",
        "target_action": "Modulation"
      }
    ],
    "clinical_studies_and_research": [
      "Studied in aging and metabolic research contexts"
    ],

    "drug_interactions": [],
    "herb_interactions": [],
    "allergens": [],

    "cautions": [
      "Weak digestion"
    ],
    "contraindications": [
      "Spleen Qi deficiency with dampness"
    ],
    "toxicology": [],

    "notes": [
      "Foundational Yin-tonifying formula"
    ],
    "reference": [
      "Xiao Er Yao Zheng Zhi Jue"
    ]
  },

  {
    "formula_id": "F003",
    "pinyin_name": "Xiao Yao San",
    "hanzi_name": "逍遥散",
    "translated_name": "Free and Easy Wanderer Powder",
    "alternative_names": ["Rambling Powder"],

    "category": "Harmonizing",
    "subcategory": "Liver–Spleen Harmonization",

    "source": "Tai Ping Hui Min He Ji Ju Fang",
    "thermal_action": "neutral",

    "composition": [
      {
        "herb_pinyin": "Chai Hu",
        "pharmaceutical_name": "Radix Bupleuri",
        "dosage": "6g"
      },
      {
        "herb_pinyin": "Dang Gui",
        "pharmaceutical_name": "Radix Angelicae Sinensis",
        "dosage": "6g"
      },
      {
        "herb_pinyin": "Bai Shao",
        "pharmaceutical_name": "Radix Paeoniae Alba",
        "dosage": "6g"
      },
      {
        "herb_pinyin": "Bai Zhu",
        "pharmaceutical_name": "Rhizoma Atractylodis Macrocephalae",
        "dosage": "6g"
      },
      {
        "herb_pinyin": "Fu Ling",
        "pharmaceutical_name": "Poria",
        "dosage": "6g"
      },
      {
        "herb_pinyin": "Gan Cao",
        "pharmaceutical_name": "Radix Glycyrrhizae",
        "dosage": "3g"
      },
      {
        "herb_pinyin": "Bo He",
        "pharmaceutical_name": "Herba Menthae Haplocalycis",
        "dosage": "3g"
      },
      {
        "herb_pinyin": "Sheng Jiang",
        "pharmaceutical_name": "Rhizoma Zingiberis Recens",
        "dosage": "3 slices"
      }
    ],
    "dosage": [
      "Single daily dose"
    ],
    "preparation": [
      "Powder or decoction"
    ],
    "administration": [
      "Oral"
    ],

    "tcm_actions": [
      "Soothes Liver Qi",
      "Strengthens the Spleen",
      "Nourishes Blood"
    ],
    "clinical_manifestations": [
      "Emotional constraint",
      "Fatigue",
      "Irregular menstruation"
    ],
    "clinical_applications": [
      { "condition": "Liver Qi stagnation with Spleen deficiency", "pattern": null },
      { "condition": "Anxiety", "pattern": "Liver Qi Stagnation" },
      { "condition": "Depression", "pattern": "Liver Qi Stagnation" },
      { "condition": "IBS", "pattern": "Liver Qi Stagnation" },
      { "condition": "Menopausal Symptoms", "pattern": "Liver Qi Stagnation" },
      { "condition": "Yu Zheng (Depression)", "pattern": "Liver Qi Stagnation" }
    ],
    "modifications": [
      "Add Mu Dan Pi and Zhi Zi for heat"
    ],

    "pharmacological_effects": [
      "Anxiolytic"
    ],
    "biological_mechanisms": [
      {
        "system": "Stress Response",
        "target_action": "Modulation"
      }
    ],
    "clinical_studies_and_research": [
      "Used in mood-related research"
    ],

    "drug_interactions": [],
    "herb_interactions": [],
    "allergens": [],

    "cautions": [],
    "contraindications": [
      "Excess heat without deficiency"
    ],
    "toxicology": [],

    "notes": [
      "Widely used harmonizing formula"
    ],
    "reference": [
      "Tai Ping Hui Min He Ji Ju Fang"
    ]
  },

  {
    "formula_id": "F004",
    "pinyin_name": "Gui Zhi Tang",
    "hanzi_name": "桂枝汤",
    "translated_name": "Cinnamon Twig Decoction",
    "alternative_names": ["Cinnamon Decoction"],

    "category": "Exterior-Releasing",
    "subcategory": "Wind-Cold Deficiency",

    "source": "Shang Han Lun",
    "thermal_action": "warm",

    "composition": [
      {
        "herb_pinyin": "Gui Zhi",
        "pharmaceutical_name": "Ramulus Cinnamomi",
        "dosage": "9g"
      },
      {
        "herb_pinyin": "Bai Shao",
        "pharmaceutical_name": "Radix Paeoniae Alba",
        "dosage": "9g"
      },
      {
        "herb_pinyin": "Sheng Jiang",
        "pharmaceutical_name": "Rhizoma Zingiberis Recens",
        "dosage": "9g"
      },
      {
        "herb_pinyin": "Da Zao",
        "pharmaceutical_name": "Fructus Jujubae",
        "dosage": "3 pieces"
      },
      {
        "herb_pinyin": "Zhi Gan Cao",
        "pharmaceutical_name": "Radix et Rhizoma Glycyrrhizae Praeparata cum Melle",
        "dosage": "6g"
      }
    ],
    "dosage": [
      "1 daily dose"
    ],
    "preparation": [
      "Decoction"
    ],
    "administration": [
      "Oral, taken warm"
    ],

    "tcm_actions": [
      "Releases the exterior",
      "Harmonizes Ying and Wei"
    ],
    "clinical_manifestations": [
      "Fever and chills",
      "Spontaneous sweating",
      "Aversion to wind"
    ],
    "clinical_applications": [
      { "condition": "Wind-Cold exterior deficiency", "pattern": null }
    ],
    "modifications": [
      "Add Ge Gen for neck stiffness"
    ],

    "pharmacological_effects": [
      "Mild antipyretic"
    ],
    "biological_mechanisms": [
      {
        "system": "Peripheral Circulation",
        "target_action": "Modulation"
      }
    ],
    "clinical_studies_and_research": [
      "Studied in early-stage febrile illness"
    ],

    "drug_interactions": [
      "Antipyretics"
    ],
    "herb_interactions": [],
    "allergens": [],

    "cautions": [
      "Yin deficiency"
    ],
    "contraindications": [
      "Exterior excess without sweating"
    ],
    "toxicology": [],

    "notes": [
      "Key formula for Ying–Wei disharmony"
    ],
    "reference": [
      "Shang Han Lun"
    ]
  },

  {
    "formula_id": "F005",
    "pinyin_name": "Bao He Wan",
    "hanzi_name": "保和丸",
    "translated_name": "Preserve Harmony Pill",
    "alternative_names": ["Harmony Preserving Pill"],

    "category": "Reducing, Guiding, and Dissolving",
    "subcategory": "Food Retention",

    "source": "Dan Xi Xin Fa",
    "thermal_action": "slightly warm",

    "composition": [
      {
        "herb_pinyin": "Shan Zha",
        "pharmaceutical_name": "Fructus Crataegi",
        "dosage": "12g"
      },
      {
        "herb_pinyin": "Shen Qu",
        "pharmaceutical_name": "Fermentum Medlarum",
        "dosage": "6g"
      },
      {
        "herb_pinyin": "Lai Fu Zi",
        "pharmaceutical_name": "Fructus Amomi Semen",
        "dosage": "6g"
      },
      {
        "herb_pinyin": "Ban Xia",
        "pharmaceutical_name": "Rhizoma Pinelliae",
        "dosage": "6g"
      },
      {
        "herb_pinyin": "Chen Pi",
        "pharmaceutical_name": "Pericarpium Citri Reticulatae",
        "dosage": "6g"
      },
      {
        "herb_pinyin": "Fu Ling",
        "pharmaceutical_name": "Poria",
        "dosage": "6g"
      },
      {
        "herb_pinyin": "Lian Qiao",
        "pharmaceutical_name": "Fructus Forsythiae",
        "dosage": "6g"
      }
    ],
    "dosage": [
      "6–12g/day in divided doses"
    ],
    "preparation": [
      "Pill or decoction"
    ],
    "administration": [
      "Oral"
    ],

    "tcm_actions": [
      "Reduces food stagnation",
      "Harmonizes the Stomach"
    ],
    "clinical_manifestations": [
      "Abdominal fullness",
      "Sour regurgitation",
      "Foul breath"
    ],
    "clinical_applications": [
      { "condition": "Food retention", "pattern": null }
    ],
    "modifications": [
      "Add Zhi Shi for severe distension"
    ],

    "pharmacological_effects": [
      "Digestive support"
    ],
    "biological_mechanisms": [
      {
        "system": "Gastrointestinal",
        "target_action": "Increased motility"
      }
    ],
    "clinical_studies_and_research": [
      "Used in dyspepsia research contexts"
    ],

    "drug_interactions": [
      "Prokinetics"
    ],
    "herb_interactions": [],
    "allergens": [],

    "cautions": [
      "Qi deficiency"
    ],
    "contraindications": [
      "No food stagnation pattern"
    ],
    "toxicology": [],

    "notes": [
      "Classic formula for acute food stagnation"
    ],
    "reference": [
      "Dan Xi Xin Fa"
    ]
  },

  {
    "formula_id": "F006",
    "pinyin_name": "Da Qing Long Tang",
    "hanzi_name": "大青龙汤",
    "translated_name": "Major Bluegreen Dragon Decoction",
    "alternative_names": ["Major Blue Dragon Combination"],

    "category": "",
    "subcategory": "",

    "source": "Shang Han Lun (Discussion of Cold-Induced Disorders) by Zhang Zhong-Jing in the Eastern Han Dynasty",
    "thermal_action": "",

    "composition": [
      {
        "herb_pinyin": "Ma Huang",
        "pharmaceutical_name": "Herba Ephedrae",
        "dosage": "12g"
      },
      {
        "herb_pinyin": "Gui Zhi",
        "pharmaceutical_name": "Ramulus Cinnamomi",
        "dosage": "4g"
      },
      {
        "herb_pinyin": "Ku Xing Ren",
        "pharmaceutical_name": "Semen Armeniacae Amarum",
        "dosage": "6g"
      },
      {
        "herb_pinyin": "Shi Gao",
        "pharmaceutical_name": "Gypsum Fibrosum",
        "dosage": "12g"
      },
      {
        "herb_pinyin": "Zhi Gan Cao",
        "pharmaceutical_name": "Radix et Rhizoma Glycyrrhizae Praeparata cum Melle",
        "dosage": "5g"
      },
      {
        "herb_pinyin": "Sheng Jiang",
        "pharmaceutical_name": "Rhizoma Zingiberis Recens",
        "dosage": "9g"
      },
      {
        "herb_pinyin": "Da Zao",
        "pharmaceutical_name": "Fructus Jujubae",
        "dosage": "3 pieces"
      }
    ],
    "dosage": [],
    "preparation": [],
    "administration": [],

    "tcm_actions": [
      "Induces diaphoresis and releases the exterior",
      "Clears heat and relieves irritability"
    ],
    "clinical_manifestations": [
      "Fever and aversion to cold of equal severity",
      "A superficial and tight pulse",
      "Body aches",
      "Absence of perspiration",
      "Irritability",
      "Restlessness"
    ],
    "clinical_applications": [
      { "condition": "Common cold", "pattern": null },
      { "condition": "Influenza", "pattern": null },
      { "condition": "Asthma", "pattern": null },
      { "condition": "Wheezing", "pattern": null },
      { "condition": "Dyspnea", "pattern": null },
      { "condition": "Fever", "pattern": null },
      { "condition": "Bronchitis", "pattern": null },
      { "condition": "Pneumonia", "pattern": null },
      { "condition": "Meningitis", "pattern": null },
      { "condition": "Measles", "pattern": null },
      { "condition": "Urticaria", "pattern": null },
      { "condition": "Erysipelas", "pattern": null },
      { "condition": "Arthritis", "pattern": null },
      { "condition": "Anhidrosis", "pattern": null },
      { "condition": "Allergic rhinitis", "pattern": null },
      { "condition": "Acute nephritis", "pattern": null },
      { "condition": "Edema caused by nephritis", "pattern": null }
    ],
    "modifications": [],

    "pharmacological_effects": [],
    "biological_mechanisms": [],
    "clinical_studies_and_research": [],

    "drug_interactions": [],
    "herb_interactions": [],
    "allergens": [],

    "cautions": [],
    "contraindications": [],
    "toxicology": [],

    "notes": [],
    "reference": []
  },

  {
    "formula_id": "F007",
    "pinyin_name": "Hua Gai San",
    "hanzi_name": "华盖散",
    "translated_name": "Flower Canopy Powder",
    "alternative_names": [],

    "category": "",
    "subcategory": "",

    "source": "Tai Ping Hui Min He Ji Ju Fang (Formulary of the Pharmacy Service for Benefiting the People in the Taiping Era)",
    "thermal_action": "",

    "composition": [
      {
        "herb_pinyin": "Ma Huang",
        "pharmaceutical_name": "Herba Ephedrae",
        "dosage": "6g"
      },
      {
        "herb_pinyin": "Zi Su Ye",
        "pharmaceutical_name": "Folium Perillae",
        "dosage": "6g"
      },
      {
        "herb_pinyin": "Xing Ren",
        "pharmaceutical_name": "Semen Armeniacae",
        "dosage": "6g"
      },
      {
        "herb_pinyin": "Chen Pi",
        "pharmaceutical_name": "Pericarpium Citri Reticulatae",
        "dosage": "6g"
      },
      {
        "herb_pinyin": "Sang Bai Pi",
        "pharmaceutical_name": "Cortex Mori",
        "dosage": "6g"
      },
      {
        "herb_pinyin": "Fu Ling",
        "pharmaceutical_name": "Poria",
        "dosage": "6g"
      },
      {
        "herb_pinyin": "Zhi Gan Cao",
        "pharmaceutical_name": "Radix Glycyrrhizae Preparata",
        "dosage": "3g"
      }
    ],
    "dosage": [],
    "preparation": [],
    "administration": [],

    "tcm_actions": [
      "Releases the exterior",
      "Disseminates the Lung qi",
      "Relieves cough and wheezing",
      "Transforms phlegm"
    ],
    "clinical_manifestations": [
      "Cough",
      "Wheezing",
      "Fever",
      "Chills",
      "Absence of sweating",
      "Thin white tongue coating",
      "Floating tight pulse"
    ],
    "clinical_applications": [
      { "condition": "Common cold", "pattern": null },
      { "condition": "Influenza", "pattern": null },
      { "condition": "Bronchitis", "pattern": null },
      { "condition": "Asthma", "pattern": null },
      { "condition": "Cough", "pattern": null },
      { "condition": "Upper respiratory tract infection", "pattern": null }
    ],
    "modifications": [],

    "pharmacological_effects": [],
    "biological_mechanisms": [],
    "clinical_studies_and_research": [],

    "drug_interactions": [],
    "herb_interactions": [],
    "allergens": [],

    "cautions": [],
    "contraindications": [],
    "toxicology": [],

    "notes": [],
    "reference": []
  },

  {
    "formula_id": "F008",
    "pinyin_name": "Jin Fei Cao San",
    "hanzi_name": "金沸草散",
    "translated_name": "Inula Powder",
    "alternative_names": [],

    "category": "",
    "subcategory": "",

    "source": "Tai Ping Hui Min He Ji Ju Fang (Formulary of the Pharmacy Service for Benefiting the People in the Taiping Era)",
    "thermal_action": "",

    "composition": [
      {
        "herb_pinyin": "Jin Fei Cao",
        "pharmaceutical_name": "Herba Inulae",
        "dosage": "9g"
      },
      {
        "herb_pinyin": "Ma Huang",
        "pharmaceutical_name": "Herba Ephedrae",
        "dosage": "6g"
      },
      {
        "herb_pinyin": "Qian Hu",
        "pharmaceutical_name": "Radix Peucedani",
        "dosage": "6g"
      },
      {
        "herb_pinyin": "Xi Xin",
        "pharmaceutical_name": "Herba Asari",
        "dosage": "3g"
      },
      {
        "herb_pinyin": "Zhi Ban Xia",
        "pharmaceutical_name": "Rhizoma Pinelliae Preparatum",
        "dosage": "6g"
      },
      {
        "herb_pinyin": "Chi Shao",
        "pharmaceutical_name": "Radix Paeoniae Rubra",
        "dosage": "6g"
      },
      {
        "herb_pinyin": "Gan Cao",
        "pharmaceutical_name": "Radix Glycyrrhizae",
        "dosage": "3g"
      },
      {
        "herb_pinyin": "Sheng Jiang",
        "pharmaceutical_name": "Rhizoma Zingiberis Recens",
        "dosage": "3 slices"
      },
      {
        "herb_pinyin": "Da Zao",
        "pharmaceutical_name": "Fructus Jujubae",
        "dosage": "3 pieces"
      }
    ],
    "dosage": [],
    "preparation": [],
    "administration": [],

    "tcm_actions": [
      "Releases the exterior",
      "Disseminates the Lung qi",
      "Transforms phlegm",
      "Relieves cough"
    ],
    "clinical_manifestations": [
      "Cough",
      "Copious thin sputum",
      "Aversion to cold",
      "Fever",
      "Headache",
      "Absence of sweating",
      "Thin white tongue coating",
      "Floating tight pulse"
    ],
    "clinical_applications": [
      { "condition": "Common cold", "pattern": null },
      { "condition": "Influenza", "pattern": null },
      { "condition": "Bronchitis", "pattern": null },
      { "condition": "Asthma", "pattern": null },
      { "condition": "Cough", "pattern": null },
      { "condition": "Upper respiratory tract infection", "pattern": null }
    ],
    "modifications": [],

    "pharmacological_effects": [],
    "biological_mechanisms": [],
    "clinical_studies_and_research": [],

    "drug_interactions": [],
    "herb_interactions": [],
    "allergens": [],

    "cautions": [],
    "contraindications": [],
    "toxicology": [],

    "notes": [],
    "reference": []
  },

  {
    "formula_id": "F009",
    "pinyin_name": "Jiu Wei Qiang Huo Tang",
    "hanzi_name": "九味羌活汤",
    "translated_name": "Nine-Ingredient Notopterygium Decoction",
    "alternative_names": [],

    "category": "",
    "subcategory": "",

    "source": "Ci Shi Nan Zhi (An Easy-to-Read Manual) by Zhang Yuan-Su in the Jin-Yuan Dynasty",
    "thermal_action": "",

    "composition": [
      {
        "herb_pinyin": "Qiang Huo",
        "pharmaceutical_name": "Rhizoma et Radix Notopterygii",
        "dosage": "9g"
      },
      {
        "herb_pinyin": "Fang Feng",
        "pharmaceutical_name": "Radix Saposhnikoviae",
        "dosage": "9g"
      },
      {
        "herb_pinyin": "Cang Zhu",
        "pharmaceutical_name": "Rhizoma Atractylodis",
        "dosage": "9g"
      },
      {
        "herb_pinyin": "Xi Xin",
        "pharmaceutical_name": "Herba Asari",
        "dosage": "3g"
      },
      {
        "herb_pinyin": "Chuan Xiong",
        "pharmaceutical_name": "Rhizoma Chuanxiong",
        "dosage": "6g"
      },
      {
        "herb_pinyin": "Bai Zhi",
        "pharmaceutical_name": "Radix Angelicae Dahuricae",
        "dosage": "6g"
      },
      {
        "herb_pinyin": "Sheng Di Huang",
        "pharmaceutical_name": "Radix Rehmanniae",
        "dosage": "6g"
      },
      {
        "herb_pinyin": "Huang Qin",
        "pharmaceutical_name": "Radix Scutellariae",
        "dosage": "6g"
      },
      {
        "herb_pinyin": "Gan Cao",
        "pharmaceutical_name": "Radix Glycyrrhizae",
        "dosage": "3g"
      }
    ],
    "dosage": [],
    "preparation": [],
    "administration": [],

    "tcm_actions": [
      "Releases the exterior",
      "Disperses wind-cold",
      "Eliminates dampness",
      "Clears interior heat"
    ],
    "clinical_manifestations": [
      "Aversion to cold",
      "Fever",
      "Headache",
      "Body aches",
      "Absence of sweating",
      "Bitter taste in the mouth",
      "Thirst",
      "Thin white or slightly yellow tongue coating",
      "Floating pulse"
    ],
    "clinical_applications": [
      { "condition": "Common cold", "pattern": null },
      { "condition": "Influenza", "pattern": null },
      { "condition": "Upper respiratory tract infection", "pattern": null },
      { "condition": "Headache", "pattern": null },
      { "condition": "Arthralgia", "pattern": null }
    ],
    "modifications": [],

    "pharmacological_effects": [],
    "biological_mechanisms": [],
    "clinical_studies_and_research": [],

    "drug_interactions": [],
    "herb_interactions": [],
    "allergens": [],

    "cautions": [],
    "contraindications": [],
    "toxicology": [],

    "notes": [],
    "reference": []
  },

  {
    "formula_id": "F010",
    "pinyin_name": "Xiang Su San",
    "hanzi_name": "香苏散",
    "translated_name": "Cyperus and Perilla Leaf Powder",
    "alternative_names": [],

    "category": "",
    "subcategory": "",

    "source": "Tai Ping Hui Min He Ji Ju Fang (Formulary of the Pharmacy Service for Benefiting the People in the Taiping Era)",
    "thermal_action": "",

    "composition": [
      {
        "herb_pinyin": "Xiang Fu",
        "pharmaceutical_name": "Rhizoma Cyperi",
        "dosage": "9g"
      },
      {
        "herb_pinyin": "Zi Su Ye",
        "pharmaceutical_name": "Folium Perillae",
        "dosage": "9g"
      },
      {
        "herb_pinyin": "Chen Pi",
        "pharmaceutical_name": "Pericarpium Citri Reticulatae",
        "dosage": "6g"
      },
      {
        "herb_pinyin": "Gan Cao",
        "pharmaceutical_name": "Radix Glycyrrhizae",
        "dosage": "3g"
      }
    ],
    "dosage": [],
    "preparation": [],
    "administration": [],

    "tcm_actions": [
      "Releases the exterior",
      "Disperses wind-cold",
      "Regulates qi",
      "Harmonizes the middle burner"
    ],
    "clinical_manifestations": [
      "Fever",
      "Aversion to cold",
      "Headache",
      "Chest and epigastric fullness",
      "Nausea",
      "Vomiting",
      "Poor appetite",
      "Thin white tongue coating",
      "Floating pulse"
    ],
    "clinical_applications": [
      { "condition": "Common cold", "pattern": null },
      { "condition": "Influenza", "pattern": null },
      { "condition": "Upper respiratory tract infection", "pattern": null },
      { "condition": "Gastroenteritis", "pattern": null },
      { "condition": "Indigestion", "pattern": null }
    ],
    "modifications": [],

    "pharmacological_effects": [],
    "biological_mechanisms": [],
    "clinical_studies_and_research": [],

    "drug_interactions": [],
    "herb_interactions": [],
    "allergens": [],

    "cautions": [],
    "contraindications": [],
    "toxicology": [],

    "notes": [],
    "reference": []
  },

  {
    "formula_id": "F999",
    "pinyin_name": "Gui Zhi Tang Jia Jian",
    "hanzi_name": "桂枝汤加减",
    "translated_name": "Cinnamon Twig Decoction with Modifications",
    "alternative_names": ["Modified Gui Zhi Tang"],

    "category": "Exterior-Releasing",
    "subcategory": "Wind-Cold Deficiency",

    "source": "Demonstration Formula for Modified Applications",
    "thermal_action": "warm",

    "composition": [
      {
        "herb_pinyin": "Gui Zhi",
        "pharmaceutical_name": "Ramulus Cinnamomi",
        "dosage": "9g"
      },
      {
        "herb_pinyin": "Bai Shao",
        "pharmaceutical_name": "Radix Paeoniae Alba",
        "dosage": "9g"
      },
      {
        "herb_pinyin": "Sheng Jiang",
        "pharmaceutical_name": "Rhizoma Zingiberis Recens",
        "dosage": "9g"
      },
      {
        "herb_pinyin": "Da Zao",
        "pharmaceutical_name": "Fructus Jujubae",
        "dosage": "3 pieces"
      },
      {
        "herb_pinyin": "Zhi Gan Cao",
        "pharmaceutical_name": "Radix et Rhizoma Glycyrrhizae Praeparata cum Melle",
        "dosage": "6g"
      }
    ],
    "dosage": [
      "1 daily dose"
    ],
    "preparation": [
      "Decoction"
    ],
    "administration": [
      "Oral, taken warm"
    ],

    "tcm_actions": [
      "Releases the exterior",
      "Harmonizes Ying and Wei",
      "Adjusts the nutritive and defensive qi"
    ],
    "clinical_manifestations": [
      "Fever and chills",
      "Spontaneous sweating",
      "Aversion to wind"
    ],
    "clinical_applications": [
      { "condition": "Wind-Cold exterior deficiency with various complications", "pattern": null }
    ],
    "modifications": [
      {
        "explanation": "For internal heat signs add cooling herbs",
        "add_herbs": ["Shi Gao", "Zhi Mu"],
        "remove_herbs": []
      },
      {
        "explanation": "For blood deficiency with pale complexion and dizziness",
        "add_herbs": ["Dang Gui", "Chuan Xiong"],
        "remove_herbs": []
      },
      {
        "explanation": "For excess phlegm with productive cough",
        "add_herbs": ["Ban Xia", "Chen Pi"],
        "remove_herbs": ["Da Zao"]
      },
      {
        "explanation": "For qi stagnation with chest oppression",
        "add_herbs": ["Chai Hu", "Zhi Ke"],
        "remove_herbs": []
      }
    ],

    "pharmacological_effects": [
      "Mild antipyretic",
      "Immune modulation"
    ],
    "biological_mechanisms": [
      {
        "system": "Peripheral Circulation",
        "target_action": "Modulation"
      }
    ],
    "clinical_studies_and_research": [
      "Extensively studied for modified applications in various patterns"
    ],

    "drug_interactions": [
      "Antipyretics"
    ],
    "herb_interactions": [],
    "allergens": [],

    "cautions": [
      "Adjust modifications based on individual constitution"
    ],
    "contraindications": [
      "Exterior excess without sweating"
    ],
    "toxicology": [],

    "notes": [
      "This formula demonstrates the new modification system with clickable herb chips"
    ],
    "reference": [
      "Modern clinical practice demonstration"
    ],
    "isSystemItem": true
  },
  {
    "formula_id": "F011",
    "pinyin_name": "Long Dan Xie Gan Tang",
    "hanzi_name": "龙胆泻肝汤",
    "translated_name": "Gentiana Drain Liver Decoction",
    "alternative_names": ["Gentiana Longdancao Decoction"],

    "category": "Heat-Clearing",
    "subcategory": "Damp-Heat in Liver and Gallbladder",

    "source": "Yi Zong Jin Jian",
    "thermal_action": "cold",

    "composition": [
      {
        "herb_pinyin": "Long Dan Cao",
        "pharmaceutical_name": "Radix Gentianae",
        "dosage": "6g"
      },
      {
        "herb_pinyin": "Huang Qin",
        "pharmaceutical_name": "Radix Scutellariae",
        "dosage": "9g"
      },
      {
        "herb_pinyin": "Zhi Zi",
        "pharmaceutical_name": "Fructus Gardeniae",
        "dosage": "9g"
      },
      {
        "herb_pinyin": "Ze Xie",
        "pharmaceutical_name": "Rhizoma Alismatis",
        "dosage": "12g"
      },
      {
        "herb_pinyin": "Chai Hu",
        "pharmaceutical_name": "Radix Bupleuri",
        "dosage": "6g"
      }
    ],
    "dosage": ["Decoct in water, take twice daily"],
    "preparation": ["Standard decoction"],
    "administration": ["Take on empty stomach for best results"],

    "tcm_actions": [
      "Drains damp-heat from the Liver and Gallbladder",
      "Purges Liver fire"
    ],
    "clinical_manifestations": [
      "Headache and red eyes",
      "Hypochondriac pain",
      "Bitter taste in mouth",
      "Irritability",
      "Difficulty urinating or painful urination"
    ],
    "clinical_applications": [
      { "condition": "Acute conjunctivitis", "pattern": "Liver fire" },
      { "condition": "Hypertension", "pattern": "Liver yang rising" },
      { "condition": "Urinary tract infection", "pattern": "Damp-heat in lower jiao" }
    ],
    "modifications": [],

    "pharmacological_effects": [],
    "biological_mechanisms": [],
    "clinical_studies_and_research": [],

    "drug_interactions": [],
    "herb_interactions": [],
    "allergens": [],

    "cautions": ["Use with caution in patients with weak digestion"],
    "contraindications": ["Pregnancy", "Spleen deficiency"],
    "toxicology": [],

    "notes": [],
    "reference": [],
    "isSystemItem": true
  },
  {
    "formula_id": "F012",
    "pinyin_name": "Bu Zhong Yi Qi Tang",
    "hanzi_name": "补中益气汤",
    "translated_name": "Tonify the Middle and Augment Qi Decoction",
    "alternative_names": ["Central Qi Pills"],

    "category": "Tonic",
    "subcategory": "Qi Deficiency",

    "source": "Pi Wei Lun",
    "thermal_action": "warm",

    "composition": [
      {
        "herb_pinyin": "Huang Qi",
        "pharmaceutical_name": "Radix Astragali",
        "dosage": "15g"
      },
      {
        "herb_pinyin": "Ren Shen",
        "pharmaceutical_name": "Radix Ginseng",
        "dosage": "6g"
      },
      {
        "herb_pinyin": "Bai Zhu",
        "pharmaceutical_name": "Rhizoma Atractylodis Macrocephalae",
        "dosage": "9g"
      },
      {
        "herb_pinyin": "Dang Gui",
        "pharmaceutical_name": "Radix Angelicae Sinensis",
        "dosage": "6g"
      },
      {
        "herb_pinyin": "Chen Pi",
        "pharmaceutical_name": "Pericarpium Citri Reticulatae",
        "dosage": "6g"
      }
    ],
    "dosage": ["Take twice daily after meals"],
    "preparation": ["Standard decoction"],
    "administration": ["Warm administration recommended"],

    "tcm_actions": [
      "Tonifies the Middle Jiao and augments Qi",
      "Raises yang and lifts sunken Qi"
    ],
    "clinical_manifestations": [
      "Chronic fatigue",
      "Poor appetite",
      "Shortness of breath",
      "Spontaneous sweating",
      "Prolapse of organs"
    ],
    "clinical_applications": [
      { "condition": "Chronic fatigue syndrome", "pattern": "Spleen qi deficiency" },
      { "condition": "Gastroptosis", "pattern": "Middle qi sinking" },
      { "condition": "Uterine prolapse", "pattern": "Qi sinking" }
    ],
    "modifications": [],

    "pharmacological_effects": [],
    "biological_mechanisms": [],
    "clinical_studies_and_research": [],

    "drug_interactions": [],
    "herb_interactions": [],
    "allergens": [],

    "cautions": [],
    "contraindications": ["Excess heat patterns", "Yin deficiency with heat"],
    "toxicology": [],

    "notes": [],
    "reference": [],
    "isSystemItem": true
  },
  {
    "formula_id": "F013",
    "pinyin_name": "Tao Hong Si Wu Tang",
    "hanzi_name": "桃红四物汤",
    "translated_name": "Persica and Carthamus Four Substances Decoction",
    "alternative_names": ["Peach Kernel and Safflower Four Materials Decoction"],

    "category": "Blood-Regulating",
    "subcategory": "Blood Stasis",

    "source": "Yi Zong Jin Jian",
    "thermal_action": "neutral",

    "composition": [
      {
        "herb_pinyin": "Tao Ren",
        "pharmaceutical_name": "Semen Persicae",
        "dosage": "9g"
      },
      {
        "herb_pinyin": "Hong Hua",
        "pharmaceutical_name": "Flos Carthami",
        "dosage": "6g"
      },
      {
        "herb_pinyin": "Dang Gui",
        "pharmaceutical_name": "Radix Angelicae Sinensis",
        "dosage": "12g"
      },
      {
        "herb_pinyin": "Chuan Xiong",
        "pharmaceutical_name": "Rhizoma Chuanxiong",
        "dosage": "6g"
      },
      {
        "herb_pinyin": "Bai Shao",
        "pharmaceutical_name": "Radix Paeoniae Alba",
        "dosage": "9g"
      }
    ],
    "dosage": ["Decoct and take twice daily"],
    "preparation": ["Standard decoction"],
    "administration": ["Best taken before meals"],

    "tcm_actions": [
      "Invigorates blood and dispels blood stasis",
      "Nourishes blood and regulates menstruation"
    ],
    "clinical_manifestations": [
      "Irregular menstruation",
      "Amenorrhea",
      "Painful menstruation",
      "Dark purple menstrual blood with clots",
      "Abdominal masses"
    ],
    "clinical_applications": [
      { "condition": "Dysmenorrhea", "pattern": "Blood stasis" },
      { "condition": "Amenorrhea", "pattern": "Blood stasis obstructing menses" },
      { "condition": "Endometriosis", "pattern": "Blood stasis" }
    ],
    "modifications": [],

    "pharmacological_effects": [],
    "biological_mechanisms": [],
    "clinical_studies_and_research": [],

    "drug_interactions": [],
    "herb_interactions": [],
    "allergens": [],

    "cautions": ["Use with caution during menstruation"],
    "contraindications": ["Pregnancy", "Excessive menstrual bleeding"],
    "toxicology": [],

    "notes": [],
    "reference": [],
    "isSystemItem": true
  },
  {
    "formula_id": "F014",
    "pinyin_name": "Wen Dan Tang",
    "hanzi_name": "温胆汤",
    "translated_name": "Warm the Gallbladder Decoction",
    "alternative_names": ["Gallbladder-Warming Decoction"],

    "category": "Qi-Regulating",
    "subcategory": "Phlegm-Heat Disturbing the Heart",

    "source": "San Yin Ji Yi Bing Zheng Fang Lun",
    "thermal_action": "slightly warm",

    "composition": [
      {
        "herb_pinyin": "Ban Xia",
        "pharmaceutical_name": "Rhizoma Pinelliae",
        "dosage": "9g"
      },
      {
        "herb_pinyin": "Zhu Ru",
        "pharmaceutical_name": "Caulis Bambusae in Taenia",
        "dosage": "6g"
      },
      {
        "herb_pinyin": "Zhi Shi",
        "pharmaceutical_name": "Fructus Aurantii Immaturus",
        "dosage": "6g"
      },
      {
        "herb_pinyin": "Chen Pi",
        "pharmaceutical_name": "Pericarpium Citri Reticulatae",
        "dosage": "9g"
      },
      {
        "herb_pinyin": "Fu Ling",
        "pharmaceutical_name": "Poria",
        "dosage": "12g"
      }
    ],
    "dosage": ["Take twice daily"],
    "preparation": ["Standard decoction"],
    "administration": ["Take warm"],

    "tcm_actions": [
      "Regulates Qi and transforms phlegm",
      "Clears Gallbladder and harmonizes the Stomach"
    ],
    "clinical_manifestations": [
      "Insomnia with vivid dreams",
      "Palpitations",
      "Anxiety and restlessness",
      "Nausea and vomiting",
      "Bitter taste in mouth"
    ],
    "clinical_applications": [
      { "condition": "Insomnia", "pattern": "Phlegm-heat disturbing the heart" },
      { "condition": "Anxiety disorder", "pattern": "Gallbladder qi disharmony" },
      { "condition": "Morning sickness", "pattern": "Phlegm and heat" }
    ],
    "modifications": [],

    "pharmacological_effects": [],
    "biological_mechanisms": [],
    "clinical_studies_and_research": [],

    "drug_interactions": [],
    "herb_interactions": [],
    "allergens": [],

    "cautions": [],
    "contraindications": ["Yin deficiency patterns"],
    "toxicology": [],

    "notes": [],
    "reference": [],
    "isSystemItem": true
  },
  {
    "formula_id": "F015",
    "pinyin_name": "Xue Fu Zhu Yu Tang",
    "hanzi_name": "血府逐瘀汤",
    "translated_name": "Drive Out Blood Stasis from Mansion of Blood Decoction",
    "alternative_names": ["Blood Palace Stasis-Expelling Decoction"],

    "category": "Blood-Regulating",
    "subcategory": "Chest Blood Stasis",

    "source": "Yi Lin Gai Cuo",
    "thermal_action": "neutral",

    "composition": [
      {
        "herb_pinyin": "Tao Ren",
        "pharmaceutical_name": "Semen Persicae",
        "dosage": "12g"
      },
      {
        "herb_pinyin": "Hong Hua",
        "pharmaceutical_name": "Flos Carthami",
        "dosage": "9g"
      },
      {
        "herb_pinyin": "Dang Gui",
        "pharmaceutical_name": "Radix Angelicae Sinensis",
        "dosage": "9g"
      },
      {
        "herb_pinyin": "Chuan Xiong",
        "pharmaceutical_name": "Rhizoma Chuanxiong",
        "dosage": "6g"
      },
      {
        "herb_pinyin": "Chi Shao",
        "pharmaceutical_name": "Radix Paeoniae Rubra",
        "dosage": "6g"
      },
      {
        "herb_pinyin": "Chai Hu",
        "pharmaceutical_name": "Radix Bupleuri",
        "dosage": "6g"
      }
    ],
    "dosage": ["Decoct and take twice daily"],
    "preparation": ["Standard decoction"],
    "administration": ["Take after meals"],

    "tcm_actions": [
      "Invigorates blood and dispels blood stasis",
      "Spreads Liver qi and unblocks the channels"
    ],
    "clinical_manifestations": [
      "Chest pain",
      "Chronic headaches",
      "Palpitations",
      "Insomnia",
      "Dark complexion"
    ],
    "clinical_applications": [
      { "condition": "Angina pectoris", "pattern": "Blood stasis in chest" },
      { "condition": "Chronic headache", "pattern": "Blood stasis" },
      { "condition": "Depression", "pattern": "Qi stagnation with blood stasis" }
    ],
    "modifications": [],

    "pharmacological_effects": [],
    "biological_mechanisms": [],
    "clinical_studies_and_research": [],

    "drug_interactions": [],
    "herb_interactions": [],
    "allergens": [],

    "cautions": [],
    "contraindications": ["Pregnancy", "Heavy menstrual bleeding"],
    "toxicology": [],

    "notes": [],
    "reference": [],
    "isSystemItem": true
  },
  {
    "formula_id": "F016",
    "pinyin_name": "Zhi Bai Di Huang Wan",
    "hanzi_name": "知柏地黄丸",
    "translated_name": "Anemarrhena, Phellodendron, and Rehmannia Pill",
    "alternative_names": ["Eight-Ingredient Rehmannia Pill with Anemarrhena and Phellodendron"],

    "category": "Tonic",
    "subcategory": "Yin Deficiency with Heat",

    "source": "Yi Zong Jin Jian",
    "thermal_action": "cool",

    "composition": [
      {
        "herb_pinyin": "Shu Di Huang",
        "pharmaceutical_name": "Radix Rehmanniae Preparata",
        "dosage": "24g"
      },
      {
        "herb_pinyin": "Shan Zhu Yu",
        "pharmaceutical_name": "Fructus Corni",
        "dosage": "12g"
      },
      {
        "herb_pinyin": "Shan Yao",
        "pharmaceutical_name": "Rhizoma Dioscoreae",
        "dosage": "12g"
      },
      {
        "herb_pinyin": "Zhi Mu",
        "pharmaceutical_name": "Rhizoma Anemarrhenae",
        "dosage": "9g"
      },
      {
        "herb_pinyin": "Huang Bai",
        "pharmaceutical_name": "Cortex Phellodendri",
        "dosage": "9g"
      }
    ],
    "dosage": ["Take as pills, 9g twice daily"],
    "preparation": ["Ground into pills with honey"],
    "administration": ["Take with warm water"],

    "tcm_actions": [
      "Nourishes Kidney yin",
      "Drains deficiency fire"
    ],
    "clinical_manifestations": [
      "Night sweats",
      "Hot flashes",
      "Steaming bone sensation",
      "Tinnitus",
      "Sore and weak lower back and knees"
    ],
    "clinical_applications": [
      { "condition": "Chronic nephritis", "pattern": "Kidney yin deficiency with heat" },
      { "condition": "Menopause syndrome", "pattern": "Yin deficiency with heat" },
      { "condition": "Diabetes", "pattern": "Kidney yin deficiency" }
    ],
    "modifications": [],

    "pharmacological_effects": [],
    "biological_mechanisms": [],
    "clinical_studies_and_research": [],

    "drug_interactions": [],
    "herb_interactions": [],
    "allergens": [],

    "cautions": [],
    "contraindications": ["Spleen deficiency with diarrhea", "Yang deficiency"],
    "toxicology": [],

    "notes": [],
    "reference": [],
    "isSystemItem": true
  },
  {
    "formula_id": "F017",
    "pinyin_name": "Ping Wei San",
    "hanzi_name": "平胃散",
    "translated_name": "Calm the Stomach Powder",
    "alternative_names": ["Magnolia and Ginger Formula"],

    "category": "Damp-Dispelling",
    "subcategory": "Aromatic Transform Dampness",

    "source": "Tai Ping Hui Min He Ji Ju Fang",
    "thermal_action": "warm",

    "composition": [
      {
        "herb_pinyin": "Cang Zhu",
        "pharmaceutical_name": "Rhizoma Atractylodis",
        "dosage": "12g"
      },
      {
        "herb_pinyin": "Hou Po",
        "pharmaceutical_name": "Cortex Magnoliae Officinalis",
        "dosage": "9g"
      },
      {
        "herb_pinyin": "Chen Pi",
        "pharmaceutical_name": "Pericarpium Citri Reticulatae",
        "dosage": "9g"
      },
      {
        "herb_pinyin": "Gan Cao",
        "pharmaceutical_name": "Radix Glycyrrhizae",
        "dosage": "6g"
      },
      {
        "herb_pinyin": "Sheng Jiang",
        "pharmaceutical_name": "Rhizoma Zingiberis Recens",
        "dosage": "6g"
      }
    ],
    "dosage": ["Decoct and take twice daily"],
    "preparation": ["Standard decoction"],
    "administration": ["Take warm before meals"],

    "tcm_actions": [
      "Dries dampness and strengthens the Spleen",
      "Moves Qi and harmonizes the Stomach"
    ],
    "clinical_manifestations": [
      "Epigastric and abdominal distention and fullness",
      "Loss of appetite",
      "Nausea",
      "Heavy sensation in the body",
      "Fatigue"
    ],
    "clinical_applications": [
      { "condition": "Chronic gastritis", "pattern": "Dampness in spleen and stomach" },
      { "condition": "Indigestion", "pattern": "Dampness accumulation" },
      { "condition": "Irritable bowel syndrome", "pattern": "Spleen dampness" }
    ],
    "modifications": [],

    "pharmacological_effects": [],
    "biological_mechanisms": [],
    "clinical_studies_and_research": [],

    "drug_interactions": [],
    "herb_interactions": [],
    "allergens": [],

    "cautions": [],
    "contraindications": ["Yin deficiency", "Blood deficiency"],
    "toxicology": [],

    "notes": [],
    "reference": [],
    "isSystemItem": true
  },
  {
    "formula_id": "F018",
    "pinyin_name": "Tian Wang Bu Xin Dan",
    "hanzi_name": "天王补心丹",
    "translated_name": "Emperor of Heaven's Special Pill to Tonify the Heart",
    "alternative_names": ["Heavenly Emperor Heart-Supplementing Elixir"],

    "category": "Shen-Calming",
    "subcategory": "Nourish Heart and Calm Spirit",

    "source": "She Sheng Mi Pou",
    "thermal_action": "slightly cool",

    "composition": [
      {
        "herb_pinyin": "Sheng Di Huang",
        "pharmaceutical_name": "Radix Rehmanniae",
        "dosage": "15g"
      },
      {
        "herb_pinyin": "Ren Shen",
        "pharmaceutical_name": "Radix Ginseng",
        "dosage": "6g"
      },
      {
        "herb_pinyin": "Xuan Shen",
        "pharmaceutical_name": "Radix Scrophulariae",
        "dosage": "9g"
      },
      {
        "herb_pinyin": "Tian Men Dong",
        "pharmaceutical_name": "Radix Asparagi",
        "dosage": "9g"
      },
      {
        "herb_pinyin": "Mai Men Dong",
        "pharmaceutical_name": "Radix Ophiopogonis",
        "dosage": "9g"
      }
    ],
    "dosage": ["Take as pills, 9g twice daily"],
    "preparation": ["Ground into pills"],
    "administration": ["Take with warm water before bed"],

    "tcm_actions": [
      "Nourishes yin and clears heat",
      "Nourishes the Heart and calms the spirit"
    ],
    "clinical_manifestations": [
      "Insomnia with dream-disturbed sleep",
      "Palpitations",
      "Restlessness and anxiety",
      "Poor memory",
      "Night sweats"
    ],
    "clinical_applications": [
      { "condition": "Insomnia", "pattern": "Heart yin deficiency" },
      { "condition": "Anxiety disorder", "pattern": "Heart and Kidney yin deficiency" },
      { "condition": "Palpitations", "pattern": "Heart blood and yin deficiency" }
    ],
    "modifications": [],

    "pharmacological_effects": [],
    "biological_mechanisms": [],
    "clinical_studies_and_research": [],

    "drug_interactions": [],
    "herb_interactions": [],
    "allergens": [],

    "cautions": [],
    "contraindications": ["Spleen deficiency with loose stools"],
    "toxicology": [],

    "notes": [],
    "reference": [],
    "isSystemItem": true
  },
  {
    "formula_id": "F019",
    "pinyin_name": "Xiao Chai Hu Tang",
    "hanzi_name": "小柴胡汤",
    "translated_name": "Minor Bupleurum Decoction",
    "alternative_names": ["Small Bupleurum Combination"],

    "category": "Harmonizing",
    "subcategory": "Shao Yang Stage Disorders",

    "source": "Shang Han Lun",
    "thermal_action": "neutral",

    "composition": [
      {
        "herb_pinyin": "Chai Hu",
        "pharmaceutical_name": "Radix Bupleuri",
        "dosage": "12g"
      },
      {
        "herb_pinyin": "Huang Qin",
        "pharmaceutical_name": "Radix Scutellariae",
        "dosage": "9g"
      },
      {
        "herb_pinyin": "Ban Xia",
        "pharmaceutical_name": "Rhizoma Pinelliae",
        "dosage": "9g"
      },
      {
        "herb_pinyin": "Ren Shen",
        "pharmaceutical_name": "Radix Ginseng",
        "dosage": "6g"
      },
      {
        "herb_pinyin": "Gan Cao",
        "pharmaceutical_name": "Radix Glycyrrhizae",
        "dosage": "6g"
      }
    ],
    "dosage": ["Decoct and take twice daily"],
    "preparation": ["Standard decoction"],
    "administration": ["Take warm"],

    "tcm_actions": [
      "Harmonizes Shao Yang",
      "Releases the exterior and clears interior heat"
    ],
    "clinical_manifestations": [
      "Alternating fever and chills",
      "Bitter taste in mouth",
      "Dry throat",
      "Dizziness",
      "Hypochondriac pain"
    ],
    "clinical_applications": [
      { "condition": "Chronic hepatitis", "pattern": "Shao yang disorder" },
      { "condition": "Cholecystitis", "pattern": "Liver and Gallbladder damp-heat" },
      { "condition": "Malaria", "pattern": "Shao yang stage" }
    ],
    "modifications": [],

    "pharmacological_effects": [],
    "biological_mechanisms": [],
    "clinical_studies_and_research": [],

    "drug_interactions": [],
    "herb_interactions": [],
    "allergens": [],

    "cautions": [],
    "contraindications": ["True yin deficiency"],
    "toxicology": [],

    "notes": [],
    "reference": [],
    "isSystemItem": true
  },
  {
    "formula_id": "F020",
    "pinyin_name": "Jin Gui Shen Qi Wan",
    "hanzi_name": "金匮肾气丸",
    "translated_name": "Golden Cabinet Kidney Qi Pill",
    "alternative_names": ["Rehmannia Eight Formula"],

    "category": "Tonic",
    "subcategory": "Yang Deficiency",

    "source": "Jin Gui Yao Lue",
    "thermal_action": "warm",

    "composition": [
      {
        "herb_pinyin": "Shu Di Huang",
        "pharmaceutical_name": "Radix Rehmanniae Preparata",
        "dosage": "24g"
      },
      {
        "herb_pinyin": "Shan Zhu Yu",
        "pharmaceutical_name": "Fructus Corni",
        "dosage": "12g"
      },
      {
        "herb_pinyin": "Shan Yao",
        "pharmaceutical_name": "Rhizoma Dioscoreae",
        "dosage": "12g"
      },
      {
        "herb_pinyin": "Fu Zi",
        "pharmaceutical_name": "Radix Aconiti Lateralis Praeparata",
        "dosage": "9g"
      },
      {
        "herb_pinyin": "Gui Zhi",
        "pharmaceutical_name": "Ramulus Cinnamomi",
        "dosage": "6g"
      }
    ],
    "dosage": ["Take as pills, 9g twice daily"],
    "preparation": ["Ground into pills"],
    "administration": ["Take with warm water"],

    "tcm_actions": [
      "Warms and tonifies Kidney yang",
      "Transforms qi and promotes urination"
    ],
    "clinical_manifestations": [
      "Lower back pain and weakness",
      "Cold sensation in lower limbs",
      "Frequent urination",
      "Impotence",
      "Edema of lower limbs"
    ],
    "clinical_applications": [
      { "condition": "Chronic nephritis", "pattern": "Kidney yang deficiency" },
      { "condition": "Benign prostatic hyperplasia", "pattern": "Kidney yang deficiency" },
      { "condition": "Hypothyroidism", "pattern": "Yang deficiency" }
    ],
    "modifications": [],

    "pharmacological_effects": [],
    "biological_mechanisms": [],
    "clinical_studies_and_research": [],

    "drug_interactions": [],
    "herb_interactions": [],
    "allergens": [],

    "cautions": ["Monitor for signs of over-heating"],
    "contraindications": ["Yin deficiency with heat signs"],
    "toxicology": [],

    "notes": [],
    "reference": [],
    "isSystemItem": true
  },
  {
    "formula_id": "F021",
    "pinyin_name": "Shen Ling Bai Zhu San",
    "hanzi_name": "参苓白术散",
    "translated_name": "Ginseng, Poria, and Atractylodes Powder",
    "alternative_names": ["Ginseng and Atractylodes Formula"],

    "category": "Tonic",
    "subcategory": "Spleen Qi Deficiency with Dampness",

    "source": "Tai Ping Hui Min He Ji Ju Fang",
    "thermal_action": "neutral",

    "composition": [
      {
        "herb_pinyin": "Ren Shen",
        "pharmaceutical_name": "Radix Ginseng",
        "dosage": "9g"
      },
      {
        "herb_pinyin": "Fu Ling",
        "pharmaceutical_name": "Poria",
        "dosage": "12g"
      },
      {
        "herb_pinyin": "Bai Zhu",
        "pharmaceutical_name": "Rhizoma Atractylodis Macrocephalae",
        "dosage": "9g"
      },
      {
        "herb_pinyin": "Shan Yao",
        "pharmaceutical_name": "Rhizoma Dioscoreae",
        "dosage": "9g"
      },
      {
        "herb_pinyin": "Yi Yi Ren",
        "pharmaceutical_name": "Semen Coicis",
        "dosage": "15g"
      }
    ],
    "dosage": ["Take as powder, 6-9g twice daily"],
    "preparation": ["Ground into fine powder"],
    "administration": ["Mix with warm water or congee"],

    "tcm_actions": [
      "Tonifies the Spleen and augments Qi",
      "Dispels dampness and stops diarrhea"
    ],
    "clinical_manifestations": [
      "Chronic diarrhea or loose stools",
      "Poor appetite",
      "Fatigue and weakness",
      "Sensation of fullness in chest and abdomen",
      "Sallow complexion"
    ],
    "clinical_applications": [
      { "condition": "Chronic diarrhea", "pattern": "Spleen qi deficiency with dampness" },
      { "condition": "Malabsorption syndrome", "pattern": "Spleen deficiency" },
      { "condition": "Chronic enteritis", "pattern": "Spleen qi deficiency" }
    ],
    "modifications": [],

    "pharmacological_effects": [],
    "biological_mechanisms": [],
    "clinical_studies_and_research": [],

    "drug_interactions": [],
    "herb_interactions": [],
    "allergens": [],

    "cautions": [],
    "contraindications": ["Damp-heat diarrhea"],
    "toxicology": [],

    "notes": [],
    "reference": [],
    "isSystemItem": true
  },
  {
    "formula_id": "F022",
    "pinyin_name": "Huang Lian Jie Du Tang",
    "hanzi_name": "黄连解毒汤",
    "translated_name": "Coptis Decoction to Relieve Toxicity",
    "alternative_names": ["Coptis and Scutellaria Combination"],

    "category": "Heat-Clearing",
    "subcategory": "Fire Toxin",

    "source": "Wai Tai Mi Yao",
    "thermal_action": "very cold",

    "composition": [
      {
        "herb_pinyin": "Huang Lian",
        "pharmaceutical_name": "Rhizoma Coptidis",
        "dosage": "9g"
      },
      {
        "herb_pinyin": "Huang Qin",
        "pharmaceutical_name": "Radix Scutellariae",
        "dosage": "9g"
      },
      {
        "herb_pinyin": "Huang Bai",
        "pharmaceutical_name": "Cortex Phellodendri",
        "dosage": "6g"
      },
      {
        "herb_pinyin": "Zhi Zi",
        "pharmaceutical_name": "Fructus Gardeniae",
        "dosage": "9g"
      }
    ],
    "dosage": ["Decoct and take twice daily"],
    "preparation": ["Brief decoction"],
    "administration": ["Take cool for best effect"],

    "tcm_actions": [
      "Drains fire and resolves toxicity",
      "Clears heat from all three burners"
    ],
    "clinical_manifestations": [
      "High fever",
      "Irritability and restlessness",
      "Dry mouth and throat",
      "Insomnia",
      "Dark scanty urine",
      "Delirium"
    ],
    "clinical_applications": [
      { "condition": "Septicemia", "pattern": "Fire toxin" },
      { "condition": "Acute infection", "pattern": "Excess heat in three burners" },
      { "condition": "Skin infections", "pattern": "Fire toxin" }
    ],
    "modifications": [],

    "pharmacological_effects": [],
    "biological_mechanisms": [],
    "clinical_studies_and_research": [],

    "drug_interactions": [],
    "herb_interactions": [],
    "allergens": [],

    "cautions": ["Very cold in nature, use short-term only"],
    "contraindications": ["Spleen and Stomach deficiency cold", "Pregnancy"],
    "toxicology": [],

    "notes": [],
    "reference": [],
    "isSystemItem": true
  },
  {
    "formula_id": "F023",
    "pinyin_name": "Si Ni San",
    "hanzi_name": "四逆散",
    "translated_name": "Frigid Extremities Powder",
    "alternative_names": ["Four Reversed Powder"],

    "category": "Harmonizing",
    "subcategory": "Liver Qi Stagnation",

    "source": "Shang Han Lun",
    "thermal_action": "neutral",

    "composition": [
      {
        "herb_pinyin": "Chai Hu",
        "pharmaceutical_name": "Radix Bupleuri",
        "dosage": "9g"
      },
      {
        "herb_pinyin": "Bai Shao",
        "pharmaceutical_name": "Radix Paeoniae Alba",
        "dosage": "9g"
      },
      {
        "herb_pinyin": "Zhi Shi",
        "pharmaceutical_name": "Fructus Aurantii Immaturus",
        "dosage": "6g"
      },
      {
        "herb_pinyin": "Gan Cao",
        "pharmaceutical_name": "Radix Glycyrrhizae",
        "dosage": "6g"
      }
    ],
    "dosage": ["Decoct and take twice daily"],
    "preparation": ["Standard decoction"],
    "administration": ["Take warm"],

    "tcm_actions": [
      "Spreads Liver qi",
      "Harmonizes the Interior"
    ],
    "clinical_manifestations": [
      "Cold hands and feet despite interior heat",
      "Irritability",
      "Hypochondriac pain",
      "Abdominal pain",
      "Sighing"
    ],
    "clinical_applications": [
      { "condition": "Depression", "pattern": "Liver qi stagnation" },
      { "condition": "Chronic cholecystitis", "pattern": "Liver qi stagnation" },
      { "condition": "Irritable bowel syndrome", "pattern": "Liver invading Spleen" }
    ],
    "modifications": [],

    "pharmacological_effects": [],
    "biological_mechanisms": [],
    "clinical_studies_and_research": [],

    "drug_interactions": [],
    "herb_interactions": [],
    "allergens": [],

    "cautions": [],
    "contraindications": ["True cold pattern with yang deficiency"],
    "toxicology": [],

    "notes": [],
    "reference": [],
    "isSystemItem": true
  },
  {
    "formula_id": "F024",
    "pinyin_name": "Xiao Qing Long Tang",
    "hanzi_name": "小青龙汤",
    "translated_name": "Minor Blue-Green Dragon Decoction",
    "alternative_names": ["Small Green Dragon Combination"],

    "category": "Exterior-Releasing",
    "subcategory": "Wind-Cold with Internal Phlegm-Fluid",

    "source": "Shang Han Lun",
    "thermal_action": "warm",

    "composition": [
      {
        "herb_pinyin": "Ma Huang",
        "pharmaceutical_name": "Herba Ephedrae",
        "dosage": "9g"
      },
      {
        "herb_pinyin": "Gui Zhi",
        "pharmaceutical_name": "Ramulus Cinnamomi",
        "dosage": "6g"
      },
      {
        "herb_pinyin": "Ban Xia",
        "pharmaceutical_name": "Rhizoma Pinelliae",
        "dosage": "9g"
      },
      {
        "herb_pinyin": "Xi Xin",
        "pharmaceutical_name": "Herba Asari",
        "dosage": "3g"
      },
      {
        "herb_pinyin": "Wu Wei Zi",
        "pharmaceutical_name": "Fructus Schisandrae",
        "dosage": "6g"
      }
    ],
    "dosage": ["Decoct and take twice daily"],
    "preparation": ["Standard decoction"],
    "administration": ["Take warm"],

    "tcm_actions": [
      "Releases the exterior and transforms thin mucus",
      "Warms the Lungs and stops cough"
    ],
    "clinical_manifestations": [
      "Cough with copious watery white sputum",
      "Wheezing",
      "Chills and fever",
      "Absence of thirst",
      "Edema"
    ],
    "clinical_applications": [
      { "condition": "Acute bronchitis", "pattern": "Wind-cold with fluid retention" },
      { "condition": "Allergic rhinitis", "pattern": "Lung cold with phlegm-fluid" },
      { "condition": "Asthma", "pattern": "Cold phlegm" }
    ],
    "modifications": [],

    "pharmacological_effects": [],
    "biological_mechanisms": [],
    "clinical_studies_and_research": [],

    "drug_interactions": [],
    "herb_interactions": [],
    "allergens": [],

    "cautions": ["Use with caution in patients with hypertension"],
    "contraindications": ["Yin deficiency", "Heat patterns"],
    "toxicology": [],

    "notes": [],
    "reference": [],
    "isSystemItem": true
  },
  {
    "formula_id": "F025",
    "pinyin_name": "Du Huo Ji Sheng Tang",
    "hanzi_name": "独活寄生汤",
    "translated_name": "Angelica Pubescens and Sangjisheng Decoction",
    "alternative_names": ["Pubescent Angelica and Mistletoe Combination"],

    "category": "Wind-Damp",
    "subcategory": "Chronic Bi Syndrome with Deficiency",

    "source": "Qian Jin Yao Fang",
    "thermal_action": "warm",

    "composition": [
      {
        "herb_pinyin": "Du Huo",
        "pharmaceutical_name": "Radix Angelicae Pubescentis",
        "dosage": "9g"
      },
      {
        "herb_pinyin": "Sang Ji Sheng",
        "pharmaceutical_name": "Herba Taxilli",
        "dosage": "15g"
      },
      {
        "herb_pinyin": "Du Zhong",
        "pharmaceutical_name": "Cortex Eucommiae",
        "dosage": "12g"
      },
      {
        "herb_pinyin": "Niu Xi",
        "pharmaceutical_name": "Radix Achyranthis Bidentatae",
        "dosage": "9g"
      },
      {
        "herb_pinyin": "Dang Gui",
        "pharmaceutical_name": "Radix Angelicae Sinensis",
        "dosage": "9g"
      }
    ],
    "dosage": ["Decoct and take twice daily"],
    "preparation": ["Standard decoction"],
    "administration": ["Take warm"],

    "tcm_actions": [
      "Dispels wind-dampness and stops pain",
      "Tonifies Liver and Kidney",
      "Strengthens sinews and bones"
    ],
    "clinical_manifestations": [
      "Chronic joint pain",
      "Lower back and knee weakness",
      "Difficulty walking",
      "Numbness in limbs",
      "Aversion to cold"
    ],
    "clinical_applications": [
      { "condition": "Chronic arthritis", "pattern": "Bi syndrome with Liver-Kidney deficiency" },
      { "condition": "Sciatica", "pattern": "Wind-dampness with deficiency" },
      { "condition": "Chronic lower back pain", "pattern": "Kidney deficiency with cold-dampness" }
    ],
    "modifications": [],

    "pharmacological_effects": [],
    "biological_mechanisms": [],
    "clinical_studies_and_research": [],

    "drug_interactions": [],
    "herb_interactions": [],
    "allergens": [],

    "cautions": [],
    "contraindications": ["Yin deficiency with heat"],
    "toxicology": [],

    "notes": [],
    "reference": [],
    "isSystemItem": true
  },
  {
    "formula_id": "F026",
    "pinyin_name": "Gan Mao Ling",
    "hanzi_name": "感冒灵",
    "translated_name": "Common Cold Effective Remedy",
    "alternative_names": ["Cold Relief Formula"],

    "category": "Exterior-Releasing",
    "subcategory": "Wind-Heat with Toxin",

    "source": "Modern Formula",
    "thermal_action": "cool",

    "composition": [
      {
        "herb_pinyin": "Jin Yin Hua",
        "pharmaceutical_name": "Flos Lonicerae",
        "dosage": "15g"
      },
      {
        "herb_pinyin": "Lian Qiao",
        "pharmaceutical_name": "Fructus Forsythiae",
        "dosage": "12g"
      },
      {
        "herb_pinyin": "Ban Lan Gen",
        "pharmaceutical_name": "Radix Isatidis",
        "dosage": "15g"
      },
      {
        "herb_pinyin": "Bo He",
        "pharmaceutical_name": "Herba Menthae",
        "dosage": "6g"
      },
      {
        "herb_pinyin": "Jing Jie",
        "pharmaceutical_name": "Herba Schizonepetae",
        "dosage": "9g"
      }
    ],
    "dosage": ["Take as granules or decoction, 3 times daily"],
    "preparation": ["Granules or decoction"],
    "administration": ["Take with warm water"],

    "tcm_actions": [
      "Releases the exterior and clears heat",
      "Resolves toxicity and relieves sore throat"
    ],
    "clinical_manifestations": [
      "Fever with slight aversion to cold",
      "Sore throat",
      "Headache",
      "Cough with yellow phlegm",
      "Thirst"
    ],
    "clinical_applications": [
      { "condition": "Common cold", "pattern": "Wind-heat" },
      { "condition": "Influenza", "pattern": "Wind-heat with toxin" },
      { "condition": "Acute tonsillitis", "pattern": "Wind-heat" }
    ],
    "modifications": [],

    "pharmacological_effects": [],
    "biological_mechanisms": [],
    "clinical_studies_and_research": [],

    "drug_interactions": [],
    "herb_interactions": [],
    "allergens": [],

    "cautions": [],
    "contraindications": ["Wind-cold patterns"],
    "toxicology": [],

    "notes": [],
    "reference": [],
    "isSystemItem": true
  },
  {
    "formula_id": "F027",
    "pinyin_name": "Gui Pi Tang",
    "hanzi_name": "归脾汤",
    "translated_name": "Restore the Spleen Decoction",
    "alternative_names": ["Ginseng and Longan Combination"],

    "category": "Tonic",
    "subcategory": "Heart and Spleen Deficiency",

    "source": "Ji Sheng Fang",
    "thermal_action": "warm",

    "composition": [
      {
        "herb_pinyin": "Ren Shen",
        "pharmaceutical_name": "Radix Ginseng",
        "dosage": "9g"
      },
      {
        "herb_pinyin": "Huang Qi",
        "pharmaceutical_name": "Radix Astragali",
        "dosage": "12g"
      },
      {
        "herb_pinyin": "Bai Zhu",
        "pharmaceutical_name": "Rhizoma Atractylodis Macrocephalae",
        "dosage": "9g"
      },
      {
        "herb_pinyin": "Long Yan Rou",
        "pharmaceutical_name": "Arillus Longan",
        "dosage": "12g"
      },
      {
        "herb_pinyin": "Suan Zao Ren",
        "pharmaceutical_name": "Semen Ziziphi Spinosae",
        "dosage": "12g"
      }
    ],
    "dosage": ["Decoct and take twice daily"],
    "preparation": ["Standard decoction"],
    "administration": ["Take warm"],

    "tcm_actions": [
      "Tonifies Heart and Spleen",
      "Augments Qi and nourishes Blood"
    ],
    "clinical_manifestations": [
      "Palpitations",
      "Insomnia",
      "Poor memory",
      "Anxiety",
      "Irregular menstruation with scanty flow",
      "Loss of appetite"
    ],
    "clinical_applications": [
      { "condition": "Anemia", "pattern": "Heart and Spleen blood deficiency" },
      { "condition": "Chronic bleeding disorders", "pattern": "Spleen not controlling blood" },
      { "condition": "Anxiety with poor memory", "pattern": "Heart and Spleen deficiency" },
      { "condition": "Anxiety", "pattern": "Heart Blood Deficiency" },
      { "condition": "Insomnia", "pattern": "Heart Blood Deficiency" },
      { "condition": "Depression", "pattern": "Heart Blood Deficiency" },
      { "condition": "Yu Zheng (Depression)", "pattern": "Heart Blood Deficiency" },
      { "condition": "Beng Lou (Uterine Bleeding)", "pattern": "Spleen Qi Deficiency" }
    ],
    "modifications": [],

    "pharmacological_effects": [],
    "biological_mechanisms": [],
    "clinical_studies_and_research": [],

    "drug_interactions": [],
    "herb_interactions": [],
    "allergens": [],

    "cautions": [],
    "contraindications": ["Excess patterns", "Yin deficiency with heat"],
    "toxicology": [],

    "notes": [],
    "reference": [],
    "isSystemItem": true
  },
  {
    "formula_id": "F028",
    "pinyin_name": "Ban Xia Hou Po Tang",
    "hanzi_name": "半夏厚朴汤",
    "translated_name": "Pinellia and Magnolia Bark Decoction",
    "alternative_names": ["Pinellia-Magnolia Combination"],

    "category": "Qi-Regulating",
    "subcategory": "Plum-Pit Qi",

    "source": "Jin Gui Yao Lue",
    "thermal_action": "warm",

    "composition": [
      {
        "herb_pinyin": "Ban Xia",
        "pharmaceutical_name": "Rhizoma Pinelliae",
        "dosage": "12g"
      },
      {
        "herb_pinyin": "Hou Po",
        "pharmaceutical_name": "Cortex Magnoliae Officinalis",
        "dosage": "9g"
      },
      {
        "herb_pinyin": "Fu Ling",
        "pharmaceutical_name": "Poria",
        "dosage": "12g"
      },
      {
        "herb_pinyin": "Sheng Jiang",
        "pharmaceutical_name": "Rhizoma Zingiberis Recens",
        "dosage": "9g"
      },
      {
        "herb_pinyin": "Zi Su Ye",
        "pharmaceutical_name": "Folium Perillae",
        "dosage": "6g"
      }
    ],
    "dosage": ["Decoct and take twice daily"],
    "preparation": ["Standard decoction"],
    "administration": ["Take warm"],

    "tcm_actions": [
      "Moves Qi and dissipates clumps",
      "Descends rebellious Qi and transforms phlegm"
    ],
    "clinical_manifestations": [
      "Sensation of something stuck in the throat",
      "Difficulty swallowing",
      "Chest and hypochondriac fullness",
      "Nausea",
      "Cough with white phlegm"
    ],
    "clinical_applications": [
      { "condition": "Globus hystericus", "pattern": "Phlegm and qi stagnation" },
      { "condition": "Anxiety disorder", "pattern": "Qi stagnation with phlegm" },
      { "condition": "Chronic pharyngitis", "pattern": "Phlegm-qi stagnation" }
    ],
    "modifications": [],

    "pharmacological_effects": [],
    "biological_mechanisms": [],
    "clinical_studies_and_research": [],

    "drug_interactions": [],
    "herb_interactions": [],
    "allergens": [],

    "cautions": [],
    "contraindications": ["Yin deficiency with dry throat"],
    "toxicology": [],

    "notes": [],
    "reference": [],
    "isSystemItem": true
  },
  {
    "formula_id": "F029",
    "pinyin_name": "Zuo Gui Wan",
    "hanzi_name": "左归丸",
    "translated_name": "Restore the Left [Kidney] Pill",
    "alternative_names": ["Left-Restoring Pill"],

    "category": "Tonic",
    "subcategory": "Kidney Yin Deficiency",

    "source": "Jing Yue Quan Shu",
    "thermal_action": "neutral",

    "composition": [
      {
        "herb_pinyin": "Shu Di Huang",
        "pharmaceutical_name": "Radix Rehmanniae Preparata",
        "dosage": "24g"
      },
      {
        "herb_pinyin": "Shan Zhu Yu",
        "pharmaceutical_name": "Fructus Corni",
        "dosage": "12g"
      },
      {
        "herb_pinyin": "Shan Yao",
        "pharmaceutical_name": "Rhizoma Dioscoreae",
        "dosage": "12g"
      },
      {
        "herb_pinyin": "Gou Qi Zi",
        "pharmaceutical_name": "Fructus Lycii",
        "dosage": "12g"
      },
      {
        "herb_pinyin": "Tu Si Zi",
        "pharmaceutical_name": "Semen Cuscutae",
        "dosage": "12g"
      }
    ],
    "dosage": ["Take as pills, 9g twice daily"],
    "preparation": ["Ground into pills with honey"],
    "administration": ["Take with warm water"],

    "tcm_actions": [
      "Nourishes Kidney yin",
      "Fills the essence"
    ],
    "clinical_manifestations": [
      "Dizziness and tinnitus",
      "Sore and weak lower back and knees",
      "Night sweats",
      "Spontaneous seminal emission",
      "Dry mouth and throat"
    ],
    "clinical_applications": [
      { "condition": "Premature aging", "pattern": "Kidney yin and essence deficiency" },
      { "condition": "Infertility", "pattern": "Kidney essence deficiency" },
      { "condition": "Diabetes", "pattern": "Kidney yin deficiency" }
    ],
    "modifications": [],

    "pharmacological_effects": [],
    "biological_mechanisms": [],
    "clinical_studies_and_research": [],

    "drug_interactions": [],
    "herb_interactions": [],
    "allergens": [],

    "cautions": [],
    "contraindications": ["Spleen deficiency with loose stools", "Yang deficiency"],
    "toxicology": [],

    "notes": [],
    "reference": [],
    "isSystemItem": true
  },
  {
    "formula_id": "F030",
    "pinyin_name": "Sang Ju Yin",
    "hanzi_name": "桑菊饮",
    "translated_name": "Mulberry Leaf and Chrysanthemum Beverage",
    "alternative_names": ["Morus and Chrysanthemum Drink"],

    "category": "Exterior-Releasing",
    "subcategory": "Wind-Heat Affecting the Lungs",

    "source": "Wen Bing Tiao Bian",
    "thermal_action": "cool",

    "composition": [
      {
        "herb_pinyin": "Sang Ye",
        "pharmaceutical_name": "Folium Mori",
        "dosage": "9g"
      },
      {
        "herb_pinyin": "Ju Hua",
        "pharmaceutical_name": "Flos Chrysanthemi",
        "dosage": "6g"
      },
      {
        "herb_pinyin": "Lian Qiao",
        "pharmaceutical_name": "Fructus Forsythiae",
        "dosage": "9g"
      },
      {
        "herb_pinyin": "Bo He",
        "pharmaceutical_name": "Herba Menthae",
        "dosage": "6g"
      },
      {
        "herb_pinyin": "Xing Ren",
        "pharmaceutical_name": "Semen Armeniacae",
        "dosage": "6g"
      }
    ],
    "dosage": ["Decoct lightly and take twice daily"],
    "preparation": ["Brief decoction to preserve aromatic oils"],
    "administration": ["Take warm"],

    "tcm_actions": [
      "Disperses wind-heat",
      "Ventilates the Lungs and stops cough"
    ],
    "clinical_manifestations": [
      "Slight fever with slight aversion to wind-cold",
      "Cough",
      "Slight thirst",
      "Sore throat",
      "Headache"
    ],
    "clinical_applications": [
      { "condition": "Common cold", "pattern": "Wind-heat affecting Lungs" },
      { "condition": "Acute bronchitis", "pattern": "Wind-heat" },
      { "condition": "Allergic rhinitis", "pattern": "Wind-heat" }
    ],
    "modifications": [],

    "pharmacological_effects": [],
    "biological_mechanisms": [],
    "clinical_studies_and_research": [],

    "drug_interactions": [],
    "herb_interactions": [],
    "allergens": [],

    "cautions": [],
    "contraindications": ["Wind-cold patterns"],
    "toxicology": [],

    "notes": [],
    "reference": [],
    "isSystemItem": true
  }
];