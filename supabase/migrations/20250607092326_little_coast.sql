-- SQL Query to Identify and Fix Recursive Dependencies in Users Table Authentication Policies
-- This query analyzes policy definitions, dependency chains, and circular references

WITH RECURSIVE policy_info AS (
  -- Base query to get all policies for the users table
  SELECT 
    p.oid as policy_id,
    p.polname as policy_name,
    p.polcmd as policy_command,
    p.polpermissive as is_permissive,
    p.polroles as policy_roles,
    pg_get_expr(p.polqual, p.polrelid) as policy_qual,
    pg_get_expr(p.polwithcheck, p.polrelid) as policy_with_check,
    c.relname as table_name,
    n.nspname as schema_name,
    p.polcreated as created_date
  FROM pg_policy p
  JOIN pg_class c ON p.polrelid = c.oid
  JOIN pg_namespace n ON c.relnamespace = n.oid
  WHERE c.relname = 'users'
    AND n.nspname = 'public'
    AND p.polcreated >= CURRENT_DATE - INTERVAL '90 days'
),

policy_references AS (
  -- Extract policy references from policy expressions
  SELECT 
    pi.policy_id,
    pi.policy_name,
    pi.policy_command,
    pi.created_date,
    -- Extract table references from policy expressions
    CASE 
      WHEN pi.policy_qual ~ 'public\.users' OR pi.policy_with_check ~ 'public\.users' THEN 'users'
      WHEN pi.policy_qual ~ 'public\.accounts' OR pi.policy_with_check ~ 'public\.accounts' THEN 'accounts'
      WHEN pi.policy_qual ~ 'public\.opportunities' OR pi.policy_with_check ~ 'public\.opportunities' THEN 'opportunities'
      WHEN pi.policy_qual ~ 'public\.jobs' OR pi.policy_with_check ~ 'public\.jobs' THEN 'jobs'
      ELSE NULL
    END as referenced_table,
    -- Extract specific policy patterns that might cause recursion
    CASE 
      WHEN pi.policy_qual ~ 'auth\.uid\(\)\s*=\s*id' THEN 'self_reference'
      WHEN pi.policy_qual ~ 'EXISTS\s*\(\s*SELECT.*FROM\s+public\.users' THEN 'users_subquery'
      WHEN pi.policy_qual ~ 'role\s*=\s*''admin''' THEN 'admin_check'
      ELSE 'other'
    END as reference_type,
    pi.policy_qual as full_expression
  FROM policy_info pi
),

dependency_chain AS (
  -- Recursive CTE to build dependency chains
  SELECT 
    pr.policy_id,
    pr.policy_name,
    pr.referenced_table,
    pr.reference_type,
    1 as dependency_level,
    ARRAY[pr.policy_name] as policy_chain,
    false as has_circular_ref
  FROM policy_references pr
  WHERE pr.reference_type = 'self_reference'
  
  UNION ALL
  
  SELECT 
    pr.policy_id,
    pr.policy_name,
    pr.referenced_table,
    pr.reference_type,
    dc.dependency_level + 1,
    dc.policy_chain || pr.policy_name,
    pr.policy_name = ANY(dc.policy_chain) as has_circular_ref
  FROM policy_references pr
  JOIN dependency_chain dc ON pr.referenced_table = 'users'
  WHERE dc.dependency_level < 10 -- Prevent infinite recursion
    AND NOT dc.has_circular_ref
),

circular_analysis AS (
  -- Identify circular references
  SELECT 
    policy_id,
    policy_name,
    dependency_level,
    policy_chain,
    has_circular_ref,
    CASE 
      WHEN has_circular_ref THEN 
        'CIRCULAR: ' || array_to_string(policy_chain, ' -> ')
      ELSE 
        array_to_string(policy_chain, ' -> ')
    END as dependency_path
  FROM dependency_chain
),

policy_status AS (
  -- Check if policies are currently enabled (active)
  SELECT 
    pi.policy_id,
    pi.policy_name,
    pi.policy_command,
    pi.created_date,
    -- In PostgreSQL, policies are enabled by default unless explicitly disabled
    -- We'll assume they're enabled unless we can check pg_policy system catalogs
    true as is_enabled,
    COALESCE(ca.dependency_level, 0) as dependency_level,
    COALESCE(ca.policy_chain, ARRAY[pi.policy_name]) as referenced_policies,
    COALESCE(ca.has_circular_ref, false) as is_circular,
    ca.dependency_path
  FROM policy_info pi
  LEFT JOIN circular_analysis ca ON pi.policy_id = ca.policy_id
)

-- Final result set
SELECT 
  ps.policy_id,
  ps.policy_name,
  ps.dependency_level,
  array_to_string(ps.referenced_policies, ', ') as referenced_policies,
  ps.is_circular,
  ps.dependency_path,
  ps.policy_command as command_type,
  ps.created_date,
  ps.is_enabled as status,
  -- Additional analysis columns
  CASE 
    WHEN ps.is_circular THEN 'HIGH'
    WHEN ps.dependency_level > 3 THEN 'MEDIUM'
    ELSE 'LOW'
  END as risk_level,
  -- Recommendations for fixing circular dependencies
  CASE 
    WHEN ps.is_circular THEN 
      'URGENT: Break circular dependency by simplifying policy logic or using different approach'
    WHEN ps.dependency_level > 3 THEN 
      'REVIEW: Consider simplifying complex dependency chain'
    ELSE 
      'OK: No issues detected'
  END as recommendation
FROM policy_status ps
WHERE ps.is_enabled = true
ORDER BY 
  ps.is_circular DESC,  -- Show circular references first
  ps.dependency_level DESC,  -- Then by complexity
  ps.policy_id ASC;

-- Additional query to show policy definitions for manual review
SELECT 
  '--- POLICY DEFINITIONS FOR MANUAL REVIEW ---' as section;

SELECT 
  pi.policy_name,
  pi.policy_command,
  pi.policy_qual as policy_expression,
  pi.policy_with_check as with_check_expression,
  pi.created_date
FROM policy_info pi
ORDER BY pi.policy_name;

-- Query to identify specific problematic patterns
SELECT 
  '--- PROBLEMATIC PATTERNS DETECTED ---' as section;

SELECT 
  pi.policy_name,
  CASE 
    WHEN pi.policy_qual ~ 'EXISTS\s*\(\s*SELECT.*FROM\s+public\.users.*WHERE.*id\s*=\s*auth\.uid\(\).*AND.*role\s*=.*admin' 
      THEN 'Potential recursion in admin check'
    WHEN pi.policy_qual ~ 'industry_groups\s*&&\s*users\.industry_groups' 
      THEN 'Self-referential industry group check'
    WHEN pi.policy_qual ~ 'current_user' 
      THEN 'Invalid current_user reference (should use auth.uid())'
    ELSE 'Other pattern'
  END as issue_type,
  pi.policy_qual as problematic_expression
FROM policy_info pi
WHERE pi.policy_qual ~ 'current_user|EXISTS.*users.*users\.|industry_groups.*users\.industry_groups'
ORDER BY pi.policy_name;