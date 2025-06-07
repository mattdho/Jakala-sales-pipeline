/*
  # Row Level Security Policies

  1. Security
    - Enable RLS on all tables
    - Add policies for role-based access control
    - Secure data access based on user permissions and industry groups

  2. Access Control
    - Users can only access data in their industry groups
    - Admins have full access
    - Client leaders can manage their own opportunities/jobs
    - Account owners can manage their accounts
*/

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can manage all users" ON public.users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can read other users in same industry groups" ON public.users
  FOR SELECT USING (
    auth.uid() = id OR
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() 
      AND (
        u.role = 'admin' OR
        u.industry_groups && users.industry_groups
      )
    )
  );

-- Accounts policies
CREATE POLICY "Users can read accounts in their industry groups" ON public.accounts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND (
        role = 'admin' OR
        industry_group = ANY(industry_groups) OR
        id = account_owner_id
      )
    )
  );

CREATE POLICY "Account owners and admins can manage accounts" ON public.accounts
  FOR ALL USING (
    account_owner_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Opportunities policies
CREATE POLICY "Users can read opportunities they manage or in their groups" ON public.opportunities
  FOR SELECT USING (
    client_leader_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.users u
      JOIN public.accounts a ON a.industry_group = ANY(u.industry_groups)
      WHERE u.id = auth.uid() AND a.id = opportunities.account_id
    ) OR
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Client leaders can manage their opportunities" ON public.opportunities
  FOR ALL USING (
    client_leader_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can create opportunities in their industry groups" ON public.opportunities
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users u
      JOIN public.accounts a ON a.industry_group = ANY(u.industry_groups)
      WHERE u.id = auth.uid() AND a.id = opportunities.account_id
    ) OR
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Jobs policies
CREATE POLICY "Users can read jobs they manage or in their groups" ON public.jobs
  FOR SELECT USING (
    client_leader_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.users u
      JOIN public.accounts a ON a.industry_group = ANY(u.industry_groups)
      WHERE u.id = auth.uid() AND a.id = jobs.account_id
    ) OR
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Client leaders can manage their jobs" ON public.jobs
  FOR ALL USING (
    client_leader_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can create jobs in their industry groups" ON public.jobs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users u
      JOIN public.accounts a ON a.industry_group = ANY(u.industry_groups)
      WHERE u.id = auth.uid() AND a.id = jobs.account_id
    ) OR
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Documents policies
CREATE POLICY "Users can read documents for jobs they can access" ON public.documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.jobs j
      WHERE j.id = documents.job_id
      AND (
        j.client_leader_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.users u
          JOIN public.accounts a ON a.industry_group = ANY(u.industry_groups)
          WHERE u.id = auth.uid() AND a.id = j.account_id
        ) OR
        EXISTS (
          SELECT 1 FROM public.users 
          WHERE id = auth.uid() AND role = 'admin'
        )
      )
    )
  );

CREATE POLICY "Users can upload documents for their jobs" ON public.documents
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.jobs j
      WHERE j.id = documents.job_id
      AND (
        j.client_leader_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.users 
          WHERE id = auth.uid() AND role = 'admin'
        )
      )
    )
  );

CREATE POLICY "Users can update documents they uploaded" ON public.documents
  FOR UPDATE USING (
    uploaded_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Activity logs policies
CREATE POLICY "Users can read activity logs for entities they can access" ON public.activity_logs
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Authenticated users can create activity logs" ON public.activity_logs
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);