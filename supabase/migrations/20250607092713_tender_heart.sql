/*
  # Policy Dependency Analysis for Users Table
  
  This migration analyzes authentication policies on the users table to identify:
  1. Circular dependencies
  2. Problematic patterns (like current_user usage)
  3. Self-referential issues
  4. Complex dependency chains
*/

-- First, let's create a simple analysis of current policies
WITH policy_info AS (
  SELECT 
    p.oid as policy_id,
    p.polname as policy_name,
    CASE p.polcmd
      WHEN 'r' THEN 'SELECT'
      WHEN 'a' THEN 'INSERT'
      WHEN 'w' THEN 'UPDATE'
      WHEN 'd' THEN 'DELETE'
      WHEN '*' THEN 'ALL'
      ELSE p.polcmd::text
    END as policy_command,
    p.polpermissive as is_permissive,
    pg_get_expr(p.polqual, p.polrelid) as policy_qual,
    pg_get_expr(p.polwithcheck, p.polrelid) as policy_with_check,
    c.relname as table_name,
    n.nspname as schema_name
  FROM pg_policy p
  JOIN pg_class c ON p.polrelid = c.oid
  JOIN pg_namespace n ON c.relnamespace = n.oid
  WHERE c.relname = 'users'
    AND n.nspname = 'public'
),

policy_analysis AS (
  SELECT 
    pi.*,
    -- Analyze policy patterns
    CASE 
      WHEN pi.policy_qual ~ 'current_user' OR pi.policy_with_check ~ 'current_user' THEN 'invalid_current_user'
      WHEN pi.policy_qual ~ 'auth\.uid\(\)\s*=\s*id' THEN 'self_reference'
      WHEN pi.policy_qual ~ 'EXISTS\s*\(\s*SELECT.*FROM\s+(public\.)?users' THEN 'users_subquery'
      WHEN pi.policy_qual ~ 'role\s*=\s*''admin''' THEN 'admin_check'
      WHEN pi.policy_qual ~ 'industry_groups.*&&.*industry_groups' THEN 'industry_groups_check'
      ELSE 'other'
    END as pattern_type,
    
    -- Check for potential issues
    CASE 
      WHEN pi.policy_qual ~ 'current_user' THEN true
      WHEN pi.policy_qual ~ 'users.*users\.' THEN true
      WHEN pi.policy_qual ~ 'industry_groups.*users\.industry_groups' THEN true
      ELSE false
    END as has_issues,
    
    -- Count subquery complexity
    (LENGTH(pi.policy_qual) - LENGTH(REPLACE(pi.policy_qual, 'EXISTS', ''))) / 6 as subquery_count,
    
    -- Check for self-references
    CASE 
      WHEN pi.policy_qual ~ 'FROM\s+(public\.)?users.*WHERE.*auth\.uid.*EXISTS.*FROM\s+(public\.)?users' THEN true
      ELSE false
    END as potential_circular
  FROM policy_info pi
)

-- Main results query
SELECT 
  pa.policy_id,
  pa.policy_name,
  pa.policy_command,
  pa.pattern_type,
  pa.subquery_count as dependency_level,
  CASE 
    WHEN pa.pattern_type = 'users_subquery' THEN 
      ARRAY[pa.policy_name, 'users_table_reference']
    ELSE 
      ARRAY[pa.policy_name]
  END as referenced_policies,
  pa.potential_circular as is_circular,
  
  -- Risk assessment
  CASE 
    WHEN pa.potential_circular THEN 'HIGH'
    WHEN pa.pattern_type = 'invalid_current_user' THEN 'HIGH'
    WHEN pa.has_issues THEN 'MEDIUM'
    WHEN pa.subquery_count > 2 THEN 'MEDIUM'
    ELSE 'LOW'
  END as risk_level,
  
  -- Recommendations
  CASE 
    WHEN pa.potential_circular THEN 
      'URGENT: Potential circular dependency detected'
    WHEN pa.pattern_type = 'invalid_current_user' THEN 
      'URGENT: Replace current_user with auth.uid()'
    WHEN pa.has_issues THEN 
      'REVIEW: Policy contains problematic patterns'
    WHEN pa.subquery_count > 2 THEN 
      'REVIEW: Complex policy with multiple subqueries'
    ELSE 
      'OK: No critical issues detected'
  END as recommendation,
  
  -- Show the actual policy expression for review
  pa.policy_qual as policy_expression

FROM policy_analysis pa
ORDER BY 
  pa.potential_circular DESC,
  CASE pa.pattern_type 
    WHEN 'invalid_current_user' THEN 1
    WHEN 'users_subquery' THEN 2
    WHEN 'industry_groups_check' THEN 3
    ELSE 4
  END,
  pa.subquery_count DESC,
  pa.policy_name;

-- Show detailed policy definitions
SELECT '=== DETAILED POLICY DEFINITIONS ===' as section;

SELECT 
  pi.policy_name,
  pi.policy_command,
  pi.policy_qual as policy_expression,
  COALESCE(pi.policy_with_check, 'N/A') as with_check_expression
FROM policy_info pi
ORDER BY pi.policy_name;

-- Identify specific problematic patterns
SELECT '=== SPECIFIC ISSUES FOUND ===' as section;

SELECT 
  pi.policy_name,
  CASE 
    WHEN pi.policy_qual ~ 'current_user' THEN 
      'CRITICAL: Uses current_user instead of auth.uid()'
    WHEN pi.policy_qual ~ 'users.*current_user' THEN 
      'CRITICAL: current_user reference in users table context'
    WHEN pi.policy_qual ~ 'industry_groups.*&&.*users\.industry_groups' THEN 
      'WARNING: Self-referential industry_groups comparison'
    WHEN pi.policy_qual ~ 'EXISTS.*users.*users\.' THEN 
      'WARNING: Potential table alias conflict in subquery'
    WHEN pi.policy_qual ~ 'auth\.uid.*=.*id.*AND.*EXISTS.*SELECT.*FROM.*users.*role.*admin' THEN
      'INFO: Complex admin check pattern'
    ELSE 'INFO: Other pattern'
  END as issue_type,
  
  CASE 
    WHEN pi.policy_qual ~ 'current_user' THEN 
      'Replace all instances of current_user with auth.uid()'
    WHEN pi.policy_qual ~ 'industry_groups.*&&.*users\.industry_groups' THEN 
      'Use proper table alias: current_user.industry_groups && users.industry_groups'
    WHEN pi.policy_qual ~ 'EXISTS.*users.*users\.' THEN 
      'Add table aliases to distinguish between table references'
    ELSE 'Review policy logic for potential improvements'
  END as suggested_fix,
  
  pi.policy_qual as problematic_expression

FROM policy_info pi
WHERE pi.policy_qual ~ 'current_user|users.*users\.|industry_groups.*&&.*users\.industry_groups|EXISTS.*users.*EXISTS.*users'
ORDER BY 
  CASE 
    WHEN pi.policy_qual ~ 'current_user' THEN 1
    WHEN pi.policy_qual ~ 'industry_groups.*users\.industry_groups' THEN 2
    ELSE 3
  END,
  pi.policy_name;

-- Summary statistics
SELECT '=== ANALYSIS SUMMARY ===' as section;

SELECT 
  COUNT(*) as total_policies,
  COUNT(*) FILTER (WHERE policy_qual ~ 'current_user') as current_user_issues,
  COUNT(*) FILTER (WHERE policy_qual ~ 'industry_groups.*&&.*users\.industry_groups') as self_ref_issues,
  COUNT(*) FILTER (WHERE policy_qual ~ 'EXISTS.*users.*EXISTS.*users') as potential_circular_refs,
  COUNT(*) FILTER (WHERE (LENGTH(policy_qual) - LENGTH(REPLACE(policy_qual, 'EXISTS', ''))) / 6 > 2) as complex_policies
FROM policy_info;

-- Show recommended fixes for current_user issues
SELECT '=== RECOMMENDED POLICY FIXES ===' as section;

SELECT 
  pi.policy_name,
  'DROP POLICY "' || pi.policy_name || '" ON public.users;' as drop_statement,
  'CREATE POLICY "' || pi.policy_name || '" ON public.users FOR ' || 
  CASE pi.policy_command
    WHEN 'r' THEN 'SELECT'
    WHEN 'a' THEN 'INSERT'
    WHEN 'w' THEN 'UPDATE'
    WHEN 'd' THEN 'DELETE'
    WHEN '*' THEN 'ALL'
    ELSE pi.policy_command::text
  END || 
  ' USING (' || 
  REPLACE(pi.policy_qual, 'current_user', 'auth.uid()') || 
  ');' as fixed_create_statement
FROM policy_info pi
WHERE pi.policy_qual ~ 'current_user'
ORDER BY pi.policy_name;