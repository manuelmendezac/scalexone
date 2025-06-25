-- Agregar columna order a la tabla video_slides
ALTER TABLE video_slides
ADD COLUMN IF NOT EXISTS "order" INTEGER;

-- Actualizar los registros existentes con un orden basado en created_at
WITH ordered_videos AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as row_num
  FROM video_slides
)
UPDATE video_slides
SET "order" = ordered_videos.row_num
FROM ordered_videos
WHERE video_slides.id = ordered_videos.id; 