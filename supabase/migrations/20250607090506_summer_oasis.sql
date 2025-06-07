/*
  # Sample Data for Development

  1. Sample Users
    - Admin user
    - Industry leaders
    - Client leaders

  2. Sample Accounts
    - Various industry groups
    - Different company types

  3. Sample Opportunities and Jobs
    - Different stages
    - Various values and priorities
*/

-- Insert sample users (these will be created when users sign up)
-- This is just for reference - actual users are created through auth

-- Insert sample accounts
INSERT INTO public.accounts (id, name, legal_name, billing_address, industry, industry_group, created_at) VALUES
  (uuid_generate_v4(), 'TechCorp Solutions', 'TechCorp Solutions Inc.', '123 Tech Street, San Francisco, CA 94105', 'Technology Services', 'TMT', NOW() - INTERVAL '30 days'),
  (uuid_generate_v4(), 'Global Bank', 'Global Bank Corporation', '456 Finance Ave, New York, NY 10001', 'Banking', 'FSI', NOW() - INTERVAL '25 days'),
  (uuid_generate_v4(), 'Luxury Fashion Co', 'Luxury Fashion Company Ltd.', '789 Fashion Blvd, Milan, Italy', 'Fashion & Luxury', 'Consumer', NOW() - INTERVAL '20 days'),
  (uuid_generate_v4(), 'Manufacturing Corp', 'Manufacturing Corporation', '321 Industrial Way, Detroit, MI 48201', 'Manufacturing', 'Industrial', NOW() - INTERVAL '15 days'),
  (uuid_generate_v4(), 'Pharma Innovations', 'Pharma Innovations LLC', '654 Research Dr, Boston, MA 02101', 'Pharmaceuticals', 'Pharma', NOW() - INTERVAL '10 days'),
  (uuid_generate_v4(), 'City Government', 'City of Springfield', '987 Municipal Plaza, Springfield, IL 62701', 'Government', 'Government', NOW() - INTERVAL '5 days')
ON CONFLICT DO NOTHING;

-- Function to create sample opportunities and jobs
-- This will be populated when users start using the system