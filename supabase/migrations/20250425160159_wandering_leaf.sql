/*
  # Set up storage for profile images
  
  1. Create storage bucket
    - Enable public access
    - Set up security policies
*/

-- Create storage bucket for profile images
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-images', 'profile-images', true);

-- Allow authenticated users to upload images
CREATE POLICY "Users can upload profile images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-images' AND
  (LOWER(storage.filename(name)) LIKE '%.jpg' OR
   LOWER(storage.filename(name)) LIKE '%.jpeg' OR
   LOWER(storage.filename(name)) LIKE '%.png' OR
   LOWER(storage.filename(name)) LIKE '%.webp')
);

-- Allow public access to profile images
CREATE POLICY "Public can view profile images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'profile-images');

-- Allow users to delete their own images
CREATE POLICY "Users can delete their own images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'profile-images');