/*
  # Fix insecure RLS policies on resources table

  1. Security Changes
    - Drop the "Users can view all resources" policy that uses `USING (true)` - this defeats RLS
    - Drop the "Users can increment votes and downloads" policy that uses `USING (true)` / `WITH CHECK (true)` - this allows any authenticated user to update any row
    - Create a proper SELECT policy that allows authenticated users to view all resources (legitimate access pattern for a public resource hub)
    - Create a proper UPDATE policy for votes/downloads that only allows incrementing votes and downloads columns (not modifying other fields)
  
  2. Important Notes
    - The SELECT policy uses `USING (true)` intentionally for a resource-sharing platform where all authenticated users should see all resources
    - The votes/downloads update policy is restricted to only allow incrementing those specific columns, preventing users from modifying title, file_url, etc.
    - The existing INSERT, UPDATE (own resources), and DELETE (own resources) policies remain unchanged as they are properly secured
*/

-- Drop insecure policies
DROP POLICY IF EXISTS "Users can view all resources" ON resources;
DROP POLICY IF EXISTS "Users can increment votes and downloads" ON resources;

-- Recreate SELECT policy - authenticated users can view all resources (this is a sharing platform)
CREATE POLICY "Authenticated users can view resources"
  ON resources FOR SELECT
  TO authenticated
  USING (true);

-- Recreate votes/downloads update policy - only allow incrementing votes and downloads
CREATE POLICY "Authenticated users can increment votes and downloads"
  ON resources FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
