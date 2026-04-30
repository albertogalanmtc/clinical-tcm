#!/usr/bin/env python3
import sys

# Read all lines from file
with open('/src/app/pages/PrescriptionDetail.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Remove lines 999-1874 (0-indexed: 998-1873)
# Keep lines 0-998 and lines 1875 onwards
fixed_lines = lines[:999] + lines[1875:]

# Write back
with open('/src/app/pages/PrescriptionDetail.tsx', 'w', encoding='utf-8') as f:
    f.writelines(fixed_lines)

print(f'Fixed! Removed {1875 - 999 + 1} lines')
print(f'Original: {len(lines)} lines')
print(f'Fixed: {len(fixed_lines)} lines')
