-- Policy Analysis for Users Table - Fixed Union Version
-- This migration analyzes RLS policies to identify potential issues

-- Create a comprehensive analysis using a single query approach
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
    (LENGTH(COALESCE(pi.policy_qual, '')) - LENGTH(REPLACE(COALESCE(pi.policy_qual, ''), 'EXISTS', ''))) / 6 as subquery_count,
    
    -- Check for self-references
    CASE 
      WHEN pi.policy_qual ~ 'FROM\s+(public\.)?users.*WHERE.*auth\.uid.*EXISTS.*FROM\s+(public\.)?users' THEN true
      ELSE false
    END as potential_circular,
    
    -- Risk level calculation
    CASE 
      WHEN pi.policy_qual ~ 'current_user' THEN 1
      WHEN pi.policy_qual ~ 'FROM\s+(public\.)?users.*WHERE.*auth\.uid.*EXISTS.*FROM\s+(public\.)?users' THEN 1
      WHEN pi.policy_qual ~ 'users.*users\.' THEN 2
      WHEN (LENGTH(COALESCE(pi.policy_qual, '')) - LENGTH(REPLACE(COALESCE(pi.policy_qual, ''), 'EXISTS', ''))) / 6 > 2 THEN 2
      ELSE 3
    END as risk_priority
  FROM policy_info pi
),

all_results AS (
  -- Main analysis results
  SELECT 
    'MAIN_ANALYSIS' as query_section,
    1 as section_order,
    pa.risk_priority,
    pa.policy_id,
    pa.policy_name,
    pa.policy_command,
    pa.pattern_type,
    pa.subquery_count as dependency_level,
    CASE 
      WHEN pa.pattern_type = 'users_subquery' THEN 
        pa.policy_name || ', users_table_reference'
      ELSE 
        pa.policy_name
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
    COALESCE(pa.policy_qual, 'N/A') as policy_expression

  FROM policy_analysis pa

  UNION ALL

  -- Policy definitions section
  SELECT 
    'POLICY_DEFINITIONS' as query_section,
    2 as section_order,
    3 as risk_priority,
    pi.policy_id,
    pi.policy_name,
    pi.policy_command,
    'definition' as pattern_type,
    0 as dependency_level,
    'N/A' as referenced_policies,
    false as is_circular,
    'INFO' as risk_level,
    'Policy definition for review' as recommendation,
    COALESCE(pi.policy_qual, 'N/A') as policy_expression
  FROM policy_info pi

  UNION ALL

  -- Issues section
  SELECT 
    'SPECIFIC_ISSUES' as query_section,
    3 as section_order,
    CASE 
      WHEN pi.policy_qual ~ 'current_user' THEN 1
      WHEN pi.policy_qual ~ 'industry_groups.*&&.*users\.industry_groups' THEN 2
      ELSE 3
    END as risk_priority,
    pi.policy_id,
    pi.policy_name,
    pi.policy_command,
    CASE 
      WHEN pi.policy_qual ~ 'current_user' THEN 'current_user_issue'
      WHEN pi.policy_qual ~ 'industry_groups.*&&.*users\.industry_groups' THEN 'self_ref_groups'
      WHEN pi.policy_qual ~ 'EXISTS.*users.*users\.' THEN 'table_alias_conflict'
      ELSE 'other_issue'
    END as pattern_type,
    0 as dependency_level,
    CASE 
      WHEN pi.policy_qual ~ 'current_user' THEN 
        'Replace all instances of current_user with auth.uid()'
      WHEN pi.policy_qual ~ 'industry_groups.*&&.*users\.industry_groups' THEN 
        'Use proper table alias: u.industry_groups && users.industry_groups'
      WHEN pi.policy_qual ~ 'EXISTS.*users.*users\.' THEN 
        'Add table aliases to distinguish between table references'
      ELSE 'Review policy logic for potential improvements'
    END as referenced_policies,
    false as is_circular,
    CASE 
      WHEN pi.policy_qual ~ 'current_user' THEN 'HIGH'
      WHEN pi.policy_qual ~ 'industry_groups.*&&.*users\.industry_groups' THEN 'MEDIUM'
      ELSE 'LOW'
    END as risk_level,
    CASE 
      WHEN pi.policy_qual ~ 'current_user' THEN 
        'CRITICAL: Uses current_user instead of auth.uid()'
      WHEN pi.policy_qual ~ 'industry_groups.*&&.*users\.industry_groups' THEN 
        'WARNING: Self-referential industry_groups comparison'
      WHEN pi.policy_qual ~ 'EXISTS.*users.*users\.' THEN 
        'WARNING: Potential table alias conflict in subquery'
      ELSE 'INFO: Other pattern'
    END as recommendation,
    COALESCE(pi.policy_qual, 'N/A') as policy_expression
  FROM policy_info pi
  WHERE pi.policy_qual ~ 'current_user|users.*users\.|industry_groups.*&&.*users\.industry_groups|EXISTS.*users.*EXISTS.*users'

  UNION ALL

  -- Summary statistics
  SELECT 
    'SUMMARY_STATS' as query_section,
    4 as section_order,
    3 as risk_priority,
    0 as policy_id,
    'SUMMARY' as policy_name,
    'STATS' as policy_command,
    'summary' as pattern_type,
    COUNT(*) as dependency_level,
    'total_policies: ' || COUNT(*) || 
    ', current_user_issues: ' || COUNT(*) FILTER (WHERE policy_qual ~ 'current_user') ||
    ', self_ref_issues: ' || COUNT(*) FILTER (WHERE policy_qual ~ 'industry_groups.*&&.*users\.industry_groups') ||
    ', potential_circular: ' || COUNT(*) FILTER (WHERE policy_qual ~ 'EXISTS.*users.*EXISTS.*users') ||
    ', complex_policies: ' || COUNT(*) FILTER (WHERE (LENGTH(COALESCE(policy_qual, '')) - LENGTH(REPLACE(COALESCE(policy_qual, ''), 'EXISTS', ''))) / 6 > 2)
    as referenced_policies,
    false as is_circular,
    'INFO' as risk_level,
    'Summary of all policy analysis results' as recommendation,
    'Statistical summary of policy issues found' as policy_expression
  FROM policy_info

  UNION ALL

  -- Recommended fixes
  SELECT 
    'RECOMMENDED_FIXES' as query_section,
    5 as section_order,
    1 as risk_priority,
    pi.policy_id,
    pi.policy_name,
    'FIX' as policy_command,
    'fix_script' as pattern_type,
    0 as dependency_level,
    'DROP POLICY "' || pi.policy_name || '" ON public.users;' as referenced_policies,
    false as is_circular,
    'ACTION' as risk_level,
    'Execute these statements to fix current_user issues' as recommendation,
    'CREATE POLICY "' || pi.policy_name || '" ON public.users FOR ' || 
    CASE 
      WHEN pi.policy_command = 'SELECT' THEN 'SELECT'
      WHEN pi.policy_command = 'INSERT' THEN 'INSERT'
      WHEN pi.policy_command = 'UPDATE' THEN 'UPDATE'
      WHEN pi.policy_command = 'DELETE' THEN 'DELETE'
      WHEN pi.policy_command = 'ALL' THEN 'ALL'
      ELSE 'SELECT'
    END || 
    ' USING (' || 
    REPLACE(COALESCE(pi.policy_qual, ''), 'current_user', 'auth.uid()') || 
    ');' as policy_expression
  FROM policy_info pi
  WHERE pi.policy_qual ~ 'current_user'
)

-- Final results with proper ordering
SELECT 
  query_section,
  policy_id,
  policy_name,
  policy_command,
  pattern_type,
  dependency_level,
  referenced_policies,
  is_circular,
  risk_level,
  recommendation,
  policy_expression
FROM all_results
ORDER BY 
  section_order,
  risk_priority,
  policy_name;