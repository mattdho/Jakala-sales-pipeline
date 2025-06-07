/*
  # Policy Dependency Analysis for Users Table
  
  This migration provides a comprehensive analysis of authentication policies
  for the users table to identify recursive dependencies and circular references.
  
  ## Analysis Includes:
  1. Policy definitions and their expressions
  2. Dependency chain analysis
  3. Circular reference detection
  4. Risk assessment and recommendations
*/

-- SQL Query to Identify and Fix Recursive Dependencies in Users Table Authentication Policies
-- This query analyzes policy definitions, dependency chains, and circular references

WITH policy_info AS (
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
    -- Use current timestamp as created_date since polcreated doesn't exist
    CURRENT_TIMESTAMP as created_date
  FROM pg_policy p
  JOIN pg_class c ON p.polrelid = c.oid
  JOIN pg_namespace n ON c.relnamespace = n.oid
  WHERE c.relname = 'users'
    AND n.nspname = 'public'
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
      WHEN pi.policy_qual ~ 'current_user' THEN 'invalid_current_user'
      WHEN pi.policy_qual ~ 'industry_groups.*users\.industry_groups' THEN 'self_referential_groups'
      ELSE 'other'
    END as reference_type,
    pi.policy_qual as full_expression,
    pi.policy_with_check as with_check_expression
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
  WHERE pr.reference_type IN ('self_reference', 'users_subquery', 'self_referential_groups')
  
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
  WHERE dc.dependency_level < 5 -- Prevent infinite recursion
    AND NOT dc.has_circular_ref
),

circular_analysis AS (
  -- Identify circular references and complex dependencies
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
  -- Combine policy information with dependency analysis
  SELECT 
    pi.policy_id,
    pi.policy_name,
    pi.policy_command,
    pi.created_date,
    -- Policies are enabled by default in PostgreSQL
    true as is_enabled,
    COALESCE(ca.dependency_level, 0) as dependency_level,
    COALESCE(ca.policy_chain, ARRAY[pi.policy_name]) as referenced_policies,
    COALESCE(ca.has_circular_ref, false) as is_circular,
    ca.dependency_path,
    pr.reference_type,
    pr.full_expression,
    pr.with_check_expression
  FROM policy_info pi
  LEFT JOIN circular_analysis ca ON pi.policy_id = ca.policy_id
  LEFT JOIN policy_references pr ON pi.policy_id = pr.policy_id
)

-- Main analysis results
SELECT 
  ps.policy_id,
  ps.policy_name,
  ps.dependency_level,
  array_to_string(ps.referenced_policies, ', ') as referenced_policies,
  ps.is_circular,
  COALESCE(ps.dependency_path, ps.policy_name) as dependency_path,
  ps.policy_command as command_type,
  ps.is_enabled as status,
  ps.reference_type,
  -- Risk assessment
  CASE 
    WHEN ps.is_circular THEN 'HIGH'
    WHEN ps.reference_type = 'invalid_current_user' THEN 'HIGH'
    WHEN ps.reference_type = 'self_referential_groups' THEN 'MEDIUM'
    WHEN ps.dependency_level > 2 THEN 'MEDIUM'
    ELSE 'LOW'
  END as risk_level,
  -- Specific recommendations
  CASE 
    WHEN ps.is_circular THEN 
      'URGENT: Break circular dependency - policy references itself'
    WHEN ps.reference_type = 'invalid_current_user' THEN 
      'URGENT: Replace current_user with auth.uid()'
    WHEN ps.reference_type = 'self_referential_groups' THEN 
      'REVIEW: Industry groups comparison may cause recursion'
    WHEN ps.dependency_level > 2 THEN 
      'REVIEW: Simplify complex dependency chain'
    ELSE 
      'OK: No critical issues detected'
  END as recommendation
FROM policy_status ps
WHERE ps.is_enabled = true
ORDER BY 
  ps.is_circular DESC,
  CASE ps.reference_type 
    WHEN 'invalid_current_user' THEN 1
    WHEN 'self_referential_groups' THEN 2
    ELSE 3
  END,
  ps.dependency_level DESC,
  ps.policy_id ASC;

-- Additional analysis: Show all policy definitions
DO $$
BEGIN
  RAISE NOTICE '=== POLICY DEFINITIONS FOR MANUAL REVIEW ===';
END $$;

SELECT 
  pi.policy_name,
  CASE pi.policy_command
    WHEN 'r' THEN 'SELECT'
    WHEN 'a' THEN 'INSERT'
    WHEN 'w' THEN 'UPDATE'
    WHEN 'd' THEN 'DELETE'
    WHEN '*' THEN 'ALL'
    ELSE pi.policy_command::text
  END as command_type,
  pi.policy_qual as policy_expression,
  pi.policy_with_check as with_check_expression
FROM policy_info pi
ORDER BY pi.policy_name;

-- Identify specific problematic patterns
DO $$
BEGIN
  RAISE NOTICE '=== PROBLEMATIC PATTERNS DETECTED ===';
END $$;

SELECT 
  pi.policy_name,
  CASE 
    WHEN pi.policy_qual ~ 'current_user' THEN 
      'CRITICAL: Uses current_user instead of auth.uid()'
    WHEN pi.policy_qual ~ 'EXISTS\s*\(\s*SELECT.*FROM\s+public\.users.*current_user' THEN 
      'CRITICAL: current_user in subquery'
    WHEN pi.policy_qual ~ 'industry_groups\s*&&\s*users\.industry_groups' THEN 
      'WARNING: Self-referential industry group check'
    WHEN pi.policy_qual ~ 'EXISTS.*users.*users\.' THEN 
      'WARNING: Potential table alias conflict'
    WHEN pi.policy_qual ~ 'auth\.uid\(\).*=.*id.*AND.*EXISTS.*users' THEN
      'INFO: Complex user validation pattern'
    ELSE 'INFO: Other pattern detected'
  END as issue_type,
  pi.policy_qual as problematic_expression,
  -- Suggested fix
  CASE 
    WHEN pi.policy_qual ~ 'current_user' THEN 
      'Replace current_user with auth.uid()'
    WHEN pi.policy_qual ~ 'industry_groups\s*&&\s*users\.industry_groups' THEN 
      'Use table alias: u.industry_groups && users.industry_groups'
    WHEN pi.policy_qual ~ 'EXISTS.*users.*users\.' THEN 
      'Add table alias to avoid conflicts'
    ELSE 'Review and test policy logic'
  END as suggested_fix
FROM policy_info pi
WHERE pi.policy_qual ~ 'current_user|EXISTS.*users.*users\.|industry_groups.*users\.industry_groups|auth\.uid.*EXISTS.*users'
ORDER BY 
  CASE 
    WHEN pi.policy_qual ~ 'current_user' THEN 1
    WHEN pi.policy_qual ~ 'industry_groups.*users\.industry_groups' THEN 2
    ELSE 3
  END,
  pi.policy_name;

-- Summary statistics
DO $$
BEGIN
  RAISE NOTICE '=== ANALYSIS SUMMARY ===';
END $$;

SELECT 
  COUNT(*) as total_policies,
  COUNT(*) FILTER (WHERE pr.reference_type = 'invalid_current_user') as current_user_issues,
  COUNT(*) FILTER (WHERE pr.reference_type = 'self_referential_groups') as self_ref_group_issues,
  COUNT(*) FILTER (WHERE pr.reference_type = 'users_subquery') as complex_subqueries,
  COUNT(*) FILTER (WHERE ca.has_circular_ref = true) as circular_references
FROM policy_info pi
LEFT JOIN policy_references pr ON pi.policy_id = pr.policy_id
LEFT JOIN circular_analysis ca ON pi.policy_id = ca.policy_id;