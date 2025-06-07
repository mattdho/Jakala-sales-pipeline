# Supabase Integration Setup Guide for Jakala Sales Pipeline

## 🚀 Quick Start

Your Supabase project is already configured with the provided credentials:
- **Project URL**: https://verktcxvuapfpywllzad.supabase.co
- **Anon Key**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

## 📋 Setup Checklist

### 1. Database Schema Setup
Run the migration files in your Supabase SQL Editor in this order:

1. **001_initial_schema.sql** - Creates all tables, types, and basic structure
2. **002_security_policies.sql** - Sets up Row Level Security policies
3. **003_storage_setup.sql** - Configures file storage buckets and policies
4. **004_sample_data.sql** - Adds sample data for development

### 2. Authentication Configuration

#### In Supabase Dashboard:
1. Go to **Authentication → Settings**
2. Configure the following:
   - **Site URL**: `http://localhost:5173` (for development)
   - **Redirect URLs**: Add your production domain when ready
   - **Email confirmation**: ✅ Disabled (as per requirements)
   - **Email change confirmation**: ✅ Disabled
   - **Phone confirmation**: ✅ Disabled

#### Email Templates (Optional):
1. Go to **Authentication → Email Templates**
2. Customize templates with Jakala branding
3. Update sender email and name

### 3. Storage Configuration

The following storage buckets are automatically created:

- **documents** (Private) - Job documents, contracts, proposals
- **media** (Public) - Company logos, marketing materials
- **exports** (Private) - Data exports and reports

### 4. Environment Variables

Your `.env` file is already configured with:
```env
VITE_SUPABASE_URL=https://verktcxvuapfpywllzad.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🔐 Security Features

### Row Level Security (RLS)
- ✅ All tables have RLS enabled
- ✅ Users can only access data in their industry groups
- ✅ Admins have full access
- ✅ Client leaders can manage their own opportunities/jobs

### File Storage Security
- ✅ Documents are private and access-controlled
- ✅ Users can only upload to jobs they manage
- ✅ File organization by job ID and user ID

### Activity Logging
- ✅ All CRUD operations are automatically logged
- ✅ Audit trail for compliance and debugging
- ✅ User attribution for all actions

## 🎯 Key Features Implemented

### 1. Dual Pipeline Tracking
- **Opportunities**: Exploration → Ready for Proposal → Closed Won/Lost
- **Jobs**: Proposal Preparation → Proposal Sent → Final Negotiation → Backlog → Closed/Lost
- Auto-creation of Jobs when Opportunities reach "Ready for Proposal"

### 2. Industry Group Management
Based on Jakala's global industry taxonomy:
- Financial Services & Insurance (FSI)
- Consumer
- TMT & Energy
- Services
- Industrial & Automotive
- Pharma & Lifesciences
- Government & Public Sector

### 3. Document Management
- Secure file upload and storage
- Version control
- Document type categorization (NDA, RFP, Contract, etc.)
- Access control based on job permissions

### 4. Real-time Updates
- Live data synchronization across all users
- Instant updates when opportunities/jobs change
- Real-time notifications for important events

## 🧪 Testing the Integration

### 1. Authentication Flow
```bash
# Test user registration
curl -X POST 'https://verktcxvuapfpywllzad.supabase.co/auth/v1/signup' \
  -H 'apikey: YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"email": "test@jakala.com", "password": "password123"}'
```

### 2. Data Operations
The app includes comprehensive error handling and validation:
- Input validation on all forms
- Supabase error translation to user-friendly messages
- Retry mechanisms for failed operations
- Loading states and error boundaries

### 3. Real-time Functionality
- Open the app in multiple browser tabs
- Create/update opportunities in one tab
- Observe real-time updates in other tabs

## 🔧 Development Workflow

### 1. Local Development
```bash
npm run dev
```
The app will connect to your Supabase instance automatically.

### 2. Database Changes
1. Create new migration files in `supabase/migrations/`
2. Run them in Supabase SQL Editor
3. Update TypeScript types in `src/types/database.ts`

### 3. Adding New Features
1. Update database schema if needed
2. Add/update service functions in `src/services/`
3. Create React Query hooks in `src/hooks/useSupabaseQuery.ts`
4. Implement UI components

## 📊 Monitoring and Analytics

### Built-in Metrics
- Pipeline value (total and weighted)
- Win rates and conversion rates
- Average deal sizes
- Pipeline velocity
- Activity tracking

### Performance Monitoring
- Query performance through React Query dev tools
- Real-time connection status
- Error tracking and reporting

## 🚨 Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Check environment variables
   - Verify Supabase project settings
   - Ensure RLS policies are correct

2. **Data Access Issues**
   - Verify user has correct industry groups assigned
   - Check RLS policies for the specific table
   - Ensure user role permissions are correct

3. **File Upload Problems**
   - Check storage bucket policies
   - Verify file size limits
   - Ensure user has permission to upload to the job

### Debug Mode
Enable debug logging by adding to your `.env`:
```env
VITE_DEBUG=true
```

## 🔄 Data Migration

### From Existing Systems
1. Export data from current CRM/system
2. Use the provided import utilities in `src/services/`
3. Validate data integrity after import
4. Update user permissions and industry group assignments

### Backup and Recovery
- Regular database backups through Supabase dashboard
- Export functionality for critical data
- Point-in-time recovery available

## 📈 Scaling Considerations

### Performance Optimization
- Database indexes on frequently queried columns
- Efficient RLS policies
- Query optimization through React Query caching
- Real-time subscription management

### User Management
- Role-based access control
- Industry group segmentation
- Scalable permission system
- Audit trail for compliance

## 🎉 Next Steps

1. **Run the migrations** in Supabase SQL Editor
2. **Test authentication** by creating a user account
3. **Create sample data** to test the pipeline views
4. **Configure email templates** for your organization
5. **Set up production environment** variables
6. **Train your team** on the new system

Your Jakala Sales Pipeline Management System is now ready for use! 🚀