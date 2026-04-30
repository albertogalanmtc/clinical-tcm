#!/bin/bash

# Script to replace latin_name with pharmaceutical_name in all TSX files

# List of files to update
FILES=(
  "src/app/pages/Herbs.tsx"
  "src/app/pages/Builder.tsx"
  "src/app/pages/PrescriptionDetail.tsx"
  "src/app/pages/FormulaDetail.tsx"
  "src/app/pages/AdminContent.tsx"
  "src/app/pages/AdminEditHerb.tsx"
  "src/app/pages/EditHerb.tsx"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "Updating $file..."
    sed -i 's/\.latin_name/.pharmaceutical_name/g' "$file"
    sed -i 's/setLatinName(herb\.latin_name/setLatinName(herb.pharmaceutical_name/g' "$file"
  fi
done

echo "Done!"
