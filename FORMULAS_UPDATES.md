# Critical Updates Needed for Formulas.tsx

Due to token limits and file complexity, here are the critical sections that need updating in Formulas.tsx to match the pattern from Herbs.tsx:

## 1. Replace toggle functions (lines ~299-324)

Replace the old array-based toggle functions with Record-based ones following the same pattern as Herbs.tsx

## 2. Add data extraction (after line ~200)

Add extraction of:
- Pharmacological effects by section (from formulas)
- Biological mechanisms by system (from formulas)
- Bioactive compounds by chemical_class (from formulas)
- Detoxification by toxin_group (from formulas)

## 3. Update filter logic

Update formulas filtering to check all 4 advanced filter types

## 4. Update/create modals

Update Pharmacological and Biological modals with the clean Builder design
Add new Bioactive and Detoxification modals

## 5. Update sidebar and mobile buttons

Add buttons for Bioactive and Detoxification
Fix counters to use flat().length

The pattern is identical to Herbs.tsx which is now complete and working.
