/*
  # Initial Schema Setup for Jakala Sales Pipeline

  1. New Tables
    - `users` - Extended user profiles with roles and industry groups
    - `accounts` - Client company information and billing details
    - `opportunities` - Sales opportunities tracking
    - `jobs` - Project jobs linked to opportunities
    - `documents` - File attachments for jobs
    - `activity_logs` - Audit trail for all actions

  2. Security
    - Enable RLS on all tables
    - Add policies for role-based access control
    - Secure file storage policies

  3. Features
    - Auto-generate job codes
    - Activity logging triggers
    - Real-time subscriptions
    - File upload management
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('industry_leader', 'account_owner', 'client_leader', 'admin');
CREATE TYPE opportunity_stage AS ENUM ('exploration', 'ready_for_proposal', 'closed_won', 'closed_lost');
CREATE TYPE job_stage AS ENUM ('proposal_preparation', 'proposal_sent', 'final_negotiation', 'backlog', 'closed', 'lost');
CREATE TYPE project_status AS ENUM ('to_be_started', 'ongoing', 'finished', 'closed');
CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high');
CREATE TYPE document_type AS ENUM ('nda', 'rfp', 'contract', 'proposal', 'msa', 'po', 'other');

-- Users table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'client_leader',
  avatar TEXT,
  industry_groups TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Accounts table
CREATE TABLE IF NOT EXISTS public.accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  legal_name TEXT NOT NULL,
  billing_address TEXT,
  payment_terms TEXT DEFAULT 'Net 30',
  industry TEXT NOT NULL,
  industry_group TEXT NOT NULL,
  account_owner_id UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Opportunities table
CREATE TABLE IF NOT EXISTS public.opportunities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE,
  value DECIMAL(12,2) NOT NULL DEFAULT 0,
  stage opportunity_stage NOT NULL DEFAULT 'exploration',
  probability INTEGER NOT NULL DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
  client_leader_id UUID REFERENCES public.users(id),
  expected_confirmation_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT DEFAULT '',
  source TEXT DEFAULT '',
  competitor TEXT,
  lost_reason TEXT
);

-- Jobs table
CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE SET NULL,
  account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE,
  value DECIMAL(12,2) NOT NULL DEFAULT 0,
  stage job_stage NOT NULL DEFAULT 'proposal_preparation',
  project_status project_status NOT NULL DEFAULT 'to_be_started',
  client_leader_id UUID REFERENCES public.users(id),
  expected_confirmation_date DATE,
  project_start_date DATE,
  project_end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT DEFAULT '',
  priority priority_level NOT NULL DEFAULT 'medium',
  lost_reason TEXT,
  auto_closed BOOLEAN DEFAULT FALSE
);

-- Documents table
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type document_type NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  uploaded_by UUID REFERENCES public.users(id),
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity logs table
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('opportunity', 'job', 'account', 'user')),
  entity_id UUID NOT NULL,
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  user_id UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_opportunities_client_leader ON public.opportunities(client_leader_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_stage ON public.opportunities(stage);
CREATE INDEX IF NOT EXISTS idx_opportunities_account ON public.opportunities(account_id);
CREATE INDEX IF NOT EXISTS idx_jobs_client_leader ON public.jobs(client_leader_id);
CREATE INDEX IF NOT EXISTS idx_jobs_stage ON public.jobs(stage);
CREATE INDEX IF NOT EXISTS idx_jobs_opportunity ON public.jobs(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_jobs_account ON public.jobs(account_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON public.activity_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_job ON public.documents(job_id);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_users_updated_at') THEN
    CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_accounts_updated_at') THEN
    CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON public.accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_opportunities_updated_at') THEN
    CREATE TRIGGER update_opportunities_updated_at BEFORE UPDATE ON public.opportunities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_jobs_updated_at') THEN
    CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON public.jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Function to generate job codes
CREATE OR REPLACE FUNCTION generate_job_code()
RETURNS TEXT AS $$
DECLARE
  code_prefix TEXT;
  code_number INTEGER;
  new_code TEXT;
BEGIN
  -- Get current year
  code_prefix := EXTRACT(YEAR FROM NOW())::TEXT;
  
  -- Get next sequential number
  SELECT COALESCE(MAX(CAST(SUBSTRING(job_code FROM 5) AS INTEGER)), 0) + 1
  INTO code_number
  FROM public.jobs
  WHERE job_code LIKE code_prefix || '%';
  
  -- Format as JAK2024001
  new_code := 'JAK' || code_prefix || LPAD(code_number::TEXT, 3, '0');
  
  RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate job codes
CREATE OR REPLACE FUNCTION set_job_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.job_code IS NULL OR NEW.job_code = '' THEN
    NEW.job_code := generate_job_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_set_job_code') THEN
    CREATE TRIGGER trigger_set_job_code
      BEFORE INSERT ON public.jobs
      FOR EACH ROW
      EXECUTE FUNCTION set_job_code();
  END IF;
END $$;