# Filter System Structure - Technical Documentation

## ✅ Updated Plan Features (AdminPlanManagement.tsx)

```typescript
features: {
  herbLibraryAccess: 'none' | 'sample' | 'full';
  formulaLibraryAccess: 'none' | 'sample' | 'full';
  builder: boolean;
  prescriptionLibrary: boolean;
  statistics: boolean;
  tcmPropertyFilters: boolean;          // NEW
  clinicalUseFilters: boolean;          // NEW  
  patientSafetyProfile: boolean;        // NEW
  advancedFilters: boolean;             // NEW
}
```

## 📋 Filter Categories in Builder.tsx

### 1. **TCM Property Filters** (Herb & Formula Properties)
- **Purpose**: Find herbs/formulas by TCM properties
- **Components**:
  - **Herb Filters**: Categories, Natures, Flavors, Channels
  - **Formula Filters**: Categories, Subcategories

### 2. **Clinical Use Filters** (Indications + TCM Patterns)
- **Purpose**: Find BENEFICIAL herbs/formulas for treating conditions
- **Shows**: GREEN alerts when adding beneficial herbs
- **Components**:
  - **Indications**: Epilepsy, Insomnia, Bleeding disorders, Liver disease, Kidney disease, etc.
  - **TCM Patterns**: Qi deficiency, Blood deficiency, Blood stasis, Yin deficiency, Yang deficiency, Dampness, Heat, Liver yang rising, Phlegm damp, Damp heat, Internal wind, etc.

### 3. **Patient Safety Profile** (Safety Alerts)
- **Purpose**: Configure patient profile to generate automatic safety alerts
- **Shows**: RED/YELLOW/AMBER alerts for precautions, contraindications
- **Does NOT show**: Green "safe" alerts
- **Components**:
  - **General Conditions**: Pregnancy, Breastfeeding, Insomnia, Epilepsy, Bleeding disorders, Liver disease, Kidney disease
  - **Medications**: Anticoagulants, Antihypertensives, Hypoglycemics, Immunosuppressants, Antidepressants, Antiplatelets, Beta blockers, Diuretics, Corticosteroids, Sedatives
  - **Allergies**: Shellfish, Gluten, Nuts, Dairy, Soy, Asteraceae, Apiaceae
  - **TCM Risk Patterns**: (same as Clinical Use, but for RISK not benefit)

### 4. **Advanced Filters** (Pharmacological & Biological Effects)
- **Purpose**: Advanced scientific filtering
- **Components**:
  - **Pharmacological Effects**: (modal with checkboxes)
  - **Biological Effects**: (modal with checkboxes)

## 🎯 Plan Defaults

### Free Plan:
- tcmPropertyFilters: ❌ OFF
- clinicalUseFilters: ❌ OFF
- patientSafetyProfile: ❌ OFF
- advancedFilters: ❌ OFF
- safetyEngineMode: 'disabled'

### Pro Plan:
- tcmPropertyFilters: ✅ ON
- clinicalUseFilters: ✅ ON
- patientSafetyProfile: ✅ ON
- advancedFilters: ❌ OFF
- safetyEngineMode: 'basic'

### Clinic Plan:
- tcmPropertyFilters: ✅ ON
- clinicalUseFilters: ✅ ON
- patientSafetyProfile: ✅ ON
- advancedFilters: ✅ ON
- safetyEngineMode: 'advanced'

## 🔄 Alert Behavior

### Clinical Use Filters → GREEN Alerts
- When you add an herb that matches active Clinical Use filters
- Shows: "✅ Beneficial for [condition/pattern]"
- Color: Green/Teal

### Patient Safety Profile → RED/YELLOW Alerts
- When you add an herb that has precautions/contraindications for patient profile
- Shows: "⚠️ Contraindicated in pregnancy", "⚠️ May interact with anticoagulants"
- Color: Red/Amber/Yellow
- Does NOT show green "safe" alerts

## 📝 Implementation Checklist

- [x] Update Plan interface in AdminPlanManagement.tsx
- [x] Update initial plan data with correct defaults
- [x] Add 4 toggles in Search & Filtering section
- [ ] Restructure Builder.tsx sidebar filters
- [ ] Rename safety state variables
- [ ] Implement green alert logic for Clinical Use
- [ ] Implement red/yellow alert logic for Patient Safety Profile
- [ ] Hide filter sections based on plan features
