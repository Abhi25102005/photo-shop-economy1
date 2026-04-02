/*
  # Create Resources Management System

  1. New Tables
    - `resources`
      - `id` (uuid, primary key) - Unique identifier for each resource
      - `title` (text) - Title of the resource
      - `subject` (text) - Subject name (e.g., Mathematics, Physics)
      - `semester` (integer) - Semester number (1-8)
      - `branch` (text) - Branch/Department (e.g., CSE, ECE, ME)
      - `college` (text) - College name
      - `type` (text) - Resource type (e.g., Notes, Papers, Books)
      - `year` (integer) - Academic year
      - `file_url` (text) - URL to the uploaded file in storage
      - `user_id` (uuid) - Reference to the user who uploaded
      - `votes` (integer) - Number of upvotes, defaults to 0
      - `downloads` (integer) - Download count, defaults to 0
      - `created_at` (timestamptz) - Timestamp of creation

  2. Security
    - Enable RLS on `resources` table
    - Add policy for authenticated users to read all resources
    - Add policy for authenticated users to insert their own resources
    - Add policy for authenticated users to update their own resources
    - Add policy for authenticated users to delete their own resources
    - Add policy for authenticated users to increment votes/downloads

  3. Storage
    - Create a public storage bucket named "resources" for file uploads
*/

CREATE TABLE IF NOT EXISTS resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subject text NOT NULL,
  semester integer NOT NULL,
  branch text NOT NULL,
  college text NOT NULL,
  type text NOT NULL,
  year integer NOT NULL,
  file_url text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  votes integer DEFAULT 0,
  downloads integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all resources"
  ON resources FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own resources"
  ON resources FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own resources"
  ON resources FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own resources"
  ON resources FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can increment votes and downloads"
  ON resources FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

INSERT INTO storage.buckets (id, name, public) 
VALUES ('resources', 'resources', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'resources');

CREATE POLICY "Anyone can view files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'resources');

CREATE POLICY "Users can update their own files"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'resources' AND auth.uid()::text = (storage.foldername(name))[1])
  WITH CHECK (bucket_id = 'resources' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'resources' AND auth.uid()::text = (storage.foldername(name))[1]);
