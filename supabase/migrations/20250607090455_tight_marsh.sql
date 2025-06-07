/*
  # Storage Setup

  1. Storage Buckets
    - documents: Private bucket for job documents
    - media: Public bucket for media assets
    - exports: Private bucket for data exports

  2. Storage Policies
    - Secure access based on user permissions
    - File organization by user/job
*/

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('documents', 'documents', false),
  ('media', 'media', true),
  ('exports', 'exports', false)
ON CONFLICT (id) DO NOTHING;

-- Documents bucket policies
CREATE POLICY "Users can upload documents to their jobs" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'documents' AND
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] IN (
      SELECT j.id::text FROM public.jobs j
      WHERE j.client_leader_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.users u
        WHERE u.id = auth.uid() AND u.role = 'admin'
      )
    )
  );

CREATE POLICY "Users can read documents from jobs they can access" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'documents' AND
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] IN (
      SELECT j.id::text FROM public.jobs j
      WHERE j.client_leader_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.users u
        JOIN public.accounts a ON a.industry_group = ANY(u.industry_groups)
        WHERE u.id = auth.uid() AND a.id = j.account_id
      )
      OR EXISTS (
        SELECT 1 FROM public.users u
        WHERE u.id = auth.uid() AND u.role = 'admin'
      )
    )
  );

CREATE POLICY "Users can update their uploaded documents" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'documents' AND
    auth.uid() IS NOT NULL AND
    (
      (storage.foldername(name))[2] = auth.uid()::text OR
      EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role = 'admin'
      )
    )
  );

CREATE POLICY "Users can delete their uploaded documents" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'documents' AND
    auth.uid() IS NOT NULL AND
    (
      (storage.foldername(name))[2] = auth.uid()::text OR
      EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role = 'admin'
      )
    )
  );

-- Media bucket policies (public read, authenticated write)
CREATE POLICY "Public media access" ON storage.objects
  FOR SELECT USING (bucket_id = 'media');

CREATE POLICY "Authenticated users can upload media" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'media' AND
    auth.uid() IS NOT NULL
  );

CREATE POLICY "Users can update their media" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'media' AND
    auth.uid() IS NOT NULL AND
    (
      (storage.foldername(name))[1] = auth.uid()::text OR
      EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role = 'admin'
      )
    )
  );

-- Exports bucket policies
CREATE POLICY "Users can create exports" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'exports' AND
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can read their exports" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'exports' AND
    auth.uid() IS NOT NULL AND
    (
      (storage.foldername(name))[1] = auth.uid()::text OR
      EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role = 'admin'
      )
    )
  );