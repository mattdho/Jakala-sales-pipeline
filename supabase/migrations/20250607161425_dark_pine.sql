/*
  # Sample Data for Jakala Sales Pipeline

  1. Sample Users
    - Creates test users for each role type
    - Assigns appropriate industry groups
    - Provides default login credentials for testing

  2. Sample Accounts
    - Creates test client accounts across different industries
    - Assigns account owners

  3. Sample Opportunities & Jobs
    - Creates realistic pipeline data
    - Shows different stages and values
    - Demonstrates the opportunity-to-job flow

  4. Test Credentials
    - admin@jakala.com / password123 (Admin)
    - leader@jakala.com / password123 (Industry Leader)
    - owner@jakala.com / password123 (Account Owner)
    - client@jakala.com / password123 (Client Leader)
*/

-- Insert sample users (these will be linked to auth.users via triggers)
INSERT INTO users (id, email, name, role, industry_groups) VALUES
  ('11111111-1111-1111-1111-111111111111', 'admin@jakala.com', 'Admin User', 'admin', ARRAY['FSI', 'Consumer', 'TMT', 'Services', 'Industrial', 'Pharma', 'Government']),
  ('22222222-2222-2222-2222-222222222222', 'leader@jakala.com', 'Industry Leader', 'industry_leader', ARRAY['FSI', 'Consumer']),
  ('33333333-3333-3333-3333-333333333333', 'owner@jakala.com', 'Account Owner', 'account_owner', ARRAY['TMT', 'Services']),
  ('44444444-4444-4444-4444-444444444444', 'client@jakala.com', 'Client Leader', 'client_leader', ARRAY['Industrial', 'Pharma'])
ON CONFLICT (id) DO NOTHING;

-- Insert sample accounts
INSERT INTO accounts (id, name, legal_name, billing_address, payment_terms, industry, industry_group, account_owner_id) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'TechCorp Solutions', 'TechCorp Solutions Inc.', '123 Tech Street, San Francisco, CA 94105', 'Net 30', 'Technology', 'TMT', '33333333-3333-3333-3333-333333333333'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Global Bank Ltd', 'Global Bank Limited', '456 Finance Ave, New York, NY 10001', 'Net 45', 'Banking', 'FSI', '22222222-2222-2222-2222-222222222222'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'RetailMax Corp', 'RetailMax Corporation', '789 Retail Blvd, Chicago, IL 60601', 'Net 30', 'Retail', 'Consumer', '22222222-2222-2222-2222-222222222222'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'AutoMotive Inc', 'AutoMotive Industries Inc.', '321 Auto Lane, Detroit, MI 48201', 'Net 60', 'Automotive', 'Industrial', '44444444-4444-4444-4444-444444444444'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'PharmaCare Ltd', 'PharmaCare Limited', '654 Health St, Boston, MA 02101', 'Net 30', 'Pharmaceuticals', 'Pharma', '44444444-4444-4444-4444-444444444444')
ON CONFLICT (id) DO NOTHING;

-- Insert sample opportunities
INSERT INTO opportunities (id, name, account_id, value, stage, probability, client_leader_id, expected_confirmation_date, notes, source) VALUES
  ('o1111111-1111-1111-1111-111111111111', 'Digital Transformation Initiative', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 250000.00, 'exploration', 25, '33333333-3333-3333-3333-333333333333', '2024-03-15', 'Large scale digital transformation project', 'Referral'),
  ('o2222222-2222-2222-2222-222222222222', 'Customer Analytics Platform', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 180000.00, 'ready_for_proposal', 75, '22222222-2222-2222-2222-222222222222', '2024-02-28', 'Advanced analytics and reporting solution', 'Cold Outreach'),
  ('o3333333-3333-3333-3333-333333333333', 'E-commerce Optimization', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 120000.00, 'closed_won', 100, '22222222-2222-2222-2222-222222222222', '2024-01-20', 'Website performance and conversion optimization', 'Existing Client'),
  ('o4444444-4444-4444-4444-444444444444', 'Supply Chain Analytics', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 300000.00, 'exploration', 40, '44444444-4444-4444-4444-444444444444', '2024-04-10', 'End-to-end supply chain visibility', 'Trade Show'),
  ('o5555555-5555-5555-5555-555555555555', 'Clinical Trial Management', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 450000.00, 'ready_for_proposal', 60, '44444444-4444-4444-4444-444444444444', '2024-03-05', 'Digital platform for clinical trial management', 'Partner Referral')
ON CONFLICT (id) DO NOTHING;

-- Insert sample jobs (some created from opportunities)
INSERT INTO jobs (id, job_code, name, opportunity_id, account_id, value, stage, project_status, client_leader_id, expected_confirmation_date, project_start_date, project_end_date, notes, priority) VALUES
  ('j1111111-1111-1111-1111-111111111111', 'JAK-2024-001', 'E-commerce Optimization Project', 'o3333333-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 120000.00, 'backlog', 'to_be_started', '22222222-2222-2222-2222-222222222222', '2024-01-20', '2024-02-01', '2024-04-30', 'Won opportunity, ready to start project', 'high'),
  ('j2222222-2222-2222-2222-222222222222', 'JAK-2024-002', 'Customer Analytics Platform', 'o2222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 180000.00, 'proposal_sent', 'to_be_started', '22222222-2222-2222-2222-222222222222', '2024-02-28', '2024-03-15', '2024-08-15', 'Proposal submitted, awaiting client response', 'high'),
  ('j3333333-3333-3333-3333-333333333333', 'JAK-2024-003', 'Clinical Trial Management Platform', 'o5555555-5555-5555-5555-555555555555', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 450000.00, 'proposal_preparation', 'to_be_started', '44444444-4444-4444-4444-444444444444', '2024-03-05', '2024-04-01', '2024-12-31', 'Large project, preparing comprehensive proposal', 'high'),
  ('j4444444-4444-4444-4444-444444444444', 'JAK-2023-015', 'Legacy System Migration', NULL, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 85000.00, 'closed', 'finished', '33333333-3333-3333-3333-333333333333', '2023-11-15', '2023-12-01', '2024-01-15', 'Successfully completed legacy system migration', 'medium'),
  ('j5555555-5555-5555-5555-555555555555', 'JAK-2024-004', 'Data Warehouse Modernization', NULL, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 200000.00, 'final_negotiation', 'to_be_started', '22222222-2222-2222-2222-222222222222', '2024-02-15', '2024-03-01', '2024-07-31', 'In final contract negotiations', 'medium')
ON CONFLICT (id) DO NOTHING;

-- Insert sample activity logs
INSERT INTO activity_logs (entity_type, entity_id, action, details, user_id) VALUES
  ('opportunity', 'o3333333-3333-3333-3333-333333333333', 'stage_changed', '{"from": "ready_for_proposal", "to": "closed_won"}', '22222222-2222-2222-2222-222222222222'),
  ('job', 'j1111111-1111-1111-1111-111111111111', 'created', '{"created_from_opportunity": "o3333333-3333-3333-3333-333333333333"}', '22222222-2222-2222-2222-222222222222'),
  ('job', 'j2222222-2222-2222-2222-222222222222', 'stage_changed', '{"from": "proposal_preparation", "to": "proposal_sent"}', '22222222-2222-2222-2222-222222222222'),
  ('account', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'created', '{"name": "TechCorp Solutions"}', '33333333-3333-3333-3333-333333333333'),
  ('opportunity', 'o2222222-2222-2222-2222-222222222222', 'probability_updated', '{"from": 50, "to": 75}', '22222222-2222-2222-2222-222222222222')
ON CONFLICT (id) DO NOTHING;

-- Note: The actual auth.users records need to be created through Supabase Auth
-- These can be created by:
-- 1. Using the sign-up form in the application
-- 2. Using the Supabase dashboard
-- 3. Using the Supabase CLI or API

-- For testing purposes, you can create these users manually in the Supabase Auth dashboard:
-- Email: admin@jakala.com, Password: password123
-- Email: leader@jakala.com, Password: password123  
-- Email: owner@jakala.com, Password: password123
-- Email: client@jakala.com, Password: password123