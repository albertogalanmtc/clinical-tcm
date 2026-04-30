# Clinical Applications System

## Overview

The Clinical Applications system replaces the previous Clinical Index, providing a unified filtering mechanism for both herbs and formulas based on clinical conditions and patterns.

## Data Structure

Both herbs and formulas now use a standardized `clinical_applications` field:

```typescript
interface ClinicalApplication {
  condition: string;
  pattern: string | null;
}
```

### Example (in Formula):
```json
{
  "pinyin_name": "Xiao Yao San",
  "clinical_applications": [
    { "condition": "Anxiety", "pattern": "Liver Qi Stagnation" },
    { "condition": "Depression", "pattern": "Liver Qi Stagnation" },
    { "condition": "IBS", "pattern": "Liver Qi Stagnation" }
  ]
}
```

### Example (in Herb):
```json
{
  "pinyin_name": "Chai Hu",
  "clinical_applications": [
    { "condition": "Depression", "pattern": "Liver Qi Stagnation" },
    { "condition": "Anxiety", "pattern": "Liver Qi Stagnation" }
  ]
}
```

## Features

### 1. Unified Filtering
- Both herbs and formulas can be filtered by the same condition/pattern criteria
- Search results show combined counts: "X items: Yh, Zf" (herbs and formulas)

### 2. Dynamic Condition Discovery
- The modal automatically discovers all conditions and patterns from actual data
- No need to manually maintain a separate condition list
- Fallback to `CLINICAL_CONDITIONS` if no data is loaded

### 3. Pattern Hierarchy
- Conditions can have multiple patterns
- Users can select:
  - A condition without patterns (shows all items for that condition)
  - A condition with specific patterns (shows only items matching those patterns)
  - Multiple patterns within a condition

### 4. Real-time Counts
- Each pattern shows live counts of matching herbs and formulas
- Format: "(5 items: 2h, 3f)" = 5 total items, 2 herbs, 3 formulas

## User Interface

### Clinical Applications Modal

**Location**: Builder → Settings → Clinical Applications

**Features**:
- Search bar for filtering conditions
- Expandable condition groups
- Pattern selection with checkboxes
- Live item counts per pattern
- Clear and Apply buttons

**Workflow**:
1. Click "Clinical Applications" button
2. Search or browse conditions
3. Expand a condition to see patterns
4. Select condition (all patterns) or specific patterns
5. Click Apply to filter results

### Active Filters Display

When a clinical filter is active:
- Shows in blue chip: "Condition → Pattern1, Pattern2"
- Click X to remove filter
- Visible in both desktop and mobile layouts

## Implementation

### Files Modified

1. **Builder.tsx**
   - Updated `filteredHerbs` to check `clinical_applications`
   - Updated `filteredFormulas` to check `clinical_applications`
   - Passes `allHerbs` and `allFormulas` to modal

2. **ClinicalApplicationsModals.tsx**
   - Added dynamic condition generation from data
   - Added real-time item counting
   - Updated pattern display to show herb/formula counts

3. **formulas.ts**
   - Updated multiple formulas with clinical_applications:
     - Xiao Yao San
     - Gui Pi Tang
     - Liu Wei Di Huang Wan

## Reference Conditions

See `/src/app/data/clinicalConditions.ts` for the complete list of catalogued conditions and patterns. This serves as a reference but the system works dynamically from actual data.

## Adding Clinical Applications

### To a Formula:
```typescript
{
  "formula_id": "F999",
  "pinyin_name": "Example Formula",
  // ... other fields ...
  "clinical_applications": [
    { "condition": "Anxiety", "pattern": "Heart Blood Deficiency" },
    { "condition": "Insomnia", "pattern": "Heart Blood Deficiency" }
  ]
}
```

### To a Herb:
```typescript
{
  "herb_id": "H999",
  "pinyin_name": "Example Herb",
  // ... other fields ...
  "clinical_applications": [
    { "condition": "Headache", "pattern": "Liver Yang Rising" },
    { "condition": "Hypertension", "pattern": "Liver Yang Rising" }
  ]
}
```

## Best Practices

1. **Use Standardized Names**: Match condition and pattern names to those in `CLINICAL_CONDITIONS` for consistency
2. **Be Specific**: Include the pattern when applicable for more precise filtering
3. **Multiple Applications**: One herb/formula can have multiple clinical applications
4. **Pattern Null**: Use `"pattern": null` for general applications without specific pattern differentiation

## Future Enhancements

- [ ] Export/import clinical applications
- [ ] Bulk editing of clinical applications
- [ ] Clinical applications analytics
- [ ] Suggested clinical applications based on TCM actions
- [ ] Clinical applications from research citations
