-- Add 'order' column to dashboard_messages and banners tables
-- This allows positioning these items in Dashboard Organization

-- Add order column to dashboard_messages
ALTER TABLE dashboard_messages
ADD COLUMN IF NOT EXISTS "order" INTEGER DEFAULT 0;

-- Add order column to banners
ALTER TABLE banners
ADD COLUMN IF NOT EXISTS "order" INTEGER DEFAULT 0;

-- Create indexes for better performance when sorting
CREATE INDEX IF NOT EXISTS idx_dashboard_messages_order ON dashboard_messages("order");
CREATE INDEX IF NOT EXISTS idx_banners_order ON banners("order");

-- Update existing rows to have sequential order values
WITH ordered_messages AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) - 1 AS row_num
  FROM dashboard_messages
)
UPDATE dashboard_messages
SET "order" = ordered_messages.row_num
FROM ordered_messages
WHERE dashboard_messages.id = ordered_messages.id;

WITH ordered_banners AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) - 1 AS row_num
  FROM banners
)
UPDATE banners
SET "order" = ordered_banners.row_num
FROM ordered_banners
WHERE banners.id = ordered_banners.id;

-- Add comments
COMMENT ON COLUMN dashboard_messages."order" IS 'Display order position in dashboard (0 = first)';
COMMENT ON COLUMN banners."order" IS 'Display order position in dashboard (0 = first)';
