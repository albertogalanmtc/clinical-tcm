-- ====================================================================
-- UPDATE PLANS TABLE - Add Detail Permissions
-- ====================================================================
-- This adds herbDetailPermissions and formulaDetailPermissions to existing plans
-- Run this AFTER you already have the plans table created
-- ====================================================================

-- Update Free plan with detail permissions
UPDATE plans
SET features = features || '{
  "herbDetailPermissions": {
    "properties": true,
    "clinicalUse": {
      "actions": true,
      "indications": true,
      "duiYao": true,
      "clinicalApplications": true
    },
    "safety": {
      "contraindications": true,
      "cautions": true,
      "drugInteractions": true,
      "herbInteractions": true,
      "allergens": true,
      "antagonisms": true,
      "incompatibilities": true
    },
    "research": {
      "pharmacologicalEffects": true,
      "biologicalMechanisms": true,
      "bioactiveCompounds": true,
      "clinicalStudies": true
    },
    "foundIn": true,
    "referencesNotes": {
      "references": true,
      "notes": true
    }
  },
  "formulaDetailPermissions": {
    "composition": true,
    "clinicalUse": {
      "tcmActions": true,
      "clinicalManifestations": true,
      "clinicalApplications": true
    },
    "modifications": true,
    "safety": {
      "contraindications": true,
      "cautions": true,
      "drugInteractions": true,
      "herbInteractions": true,
      "allergens": true,
      "toxicology": true
    },
    "research": {
      "pharmacologicalEffects": true,
      "biologicalMechanisms": true,
      "bioactiveCompounds": true,
      "clinicalStudies": true
    },
    "referencesNotes": {
      "references": true,
      "notes": true
    }
  }
}'::jsonb
WHERE plan_type = 'free';

-- Update Practitioner plan with detail permissions
UPDATE plans
SET features = features || '{
  "herbDetailPermissions": {
    "properties": true,
    "clinicalUse": {
      "actions": true,
      "indications": true,
      "duiYao": true,
      "clinicalApplications": true
    },
    "safety": {
      "contraindications": true,
      "cautions": true,
      "drugInteractions": true,
      "herbInteractions": true,
      "allergens": true,
      "antagonisms": true,
      "incompatibilities": true
    },
    "research": {
      "pharmacologicalEffects": true,
      "biologicalMechanisms": true,
      "bioactiveCompounds": true,
      "clinicalStudies": true
    },
    "foundIn": true,
    "referencesNotes": {
      "references": true,
      "notes": true
    }
  },
  "formulaDetailPermissions": {
    "composition": true,
    "clinicalUse": {
      "tcmActions": true,
      "clinicalManifestations": true,
      "clinicalApplications": true
    },
    "modifications": true,
    "safety": {
      "contraindications": true,
      "cautions": true,
      "drugInteractions": true,
      "herbInteractions": true,
      "allergens": true,
      "toxicology": true
    },
    "research": {
      "pharmacologicalEffects": true,
      "biologicalMechanisms": true,
      "bioactiveCompounds": true,
      "clinicalStudies": true
    },
    "referencesNotes": {
      "references": true,
      "notes": true
    }
  }
}'::jsonb
WHERE plan_type = 'practitioner';

-- Update Advanced plan with detail permissions
UPDATE plans
SET features = features || '{
  "herbDetailPermissions": {
    "properties": true,
    "clinicalUse": {
      "actions": true,
      "indications": true,
      "duiYao": true,
      "clinicalApplications": true
    },
    "safety": {
      "contraindications": true,
      "cautions": true,
      "drugInteractions": true,
      "herbInteractions": true,
      "allergens": true,
      "antagonisms": true,
      "incompatibilities": true
    },
    "research": {
      "pharmacologicalEffects": true,
      "biologicalMechanisms": true,
      "bioactiveCompounds": true,
      "clinicalStudies": true
    },
    "foundIn": true,
    "referencesNotes": {
      "references": true,
      "notes": true
    }
  },
  "formulaDetailPermissions": {
    "composition": true,
    "clinicalUse": {
      "tcmActions": true,
      "clinicalManifestations": true,
      "clinicalApplications": true
    },
    "modifications": true,
    "safety": {
      "contraindications": true,
      "cautions": true,
      "drugInteractions": true,
      "herbInteractions": true,
      "allergens": true,
      "toxicology": true
    },
    "research": {
      "pharmacologicalEffects": true,
      "biologicalMechanisms": true,
      "bioactiveCompounds": true,
      "clinicalStudies": true
    },
    "referencesNotes": {
      "references": true,
      "notes": true
    }
  }
}'::jsonb
WHERE plan_type = 'advanced';

-- ====================================================================
-- DONE! ✅
-- ====================================================================
-- Now all plans have herbDetailPermissions and formulaDetailPermissions
-- You can edit these in Admin Panel and they will be saved to Supabase
-- ====================================================================
