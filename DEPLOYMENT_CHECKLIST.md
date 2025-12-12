# Deployment Checklist

Follow these steps to deploy the Supabase admin panel:

## Prerequisites
- [ ] Supabase account created
- [ ] Node.js and npm installed
- [ ] Access to deployment platform (Vercel, etc.)

## Supabase Setup
- [ ] Create new Supabase project
- [ ] Run SQL schema from `docs/SUPABASE_SETUP.md`
- [ ] Create admin user in Authentication > Users
- [ ] Copy project URL and keys

## Local Testing
- [ ] Copy `.env.example` to `.env.local`
- [ ] Fill in Supabase credentials
- [ ] Run `npm install`
- [ ] Copy ace-builds: `mkdir -p public/ace-builds && cp -r node_modules/ace-builds/src-noconflict public/ace-builds/`
- [ ] Start dev server: `npm run dev`
- [ ] Test login at `http://localhost:3000/admin/login`
- [ ] Create a test post
- [ ] Verify CRUD operations work

## Production Deployment
- [ ] Set environment variables in hosting platform:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `USE_SUPABASE=false` (initially, keep using microCMS)
- [ ] Add build script to copy ace-builds to public directory
- [ ] Deploy to hosting platform
- [ ] Verify build succeeds
- [ ] Test login in production
- [ ] Test creating/editing posts

## Migration (Optional)
- [ ] Export existing data from microCMS (if migrating)
- [ ] Import data to Supabase
- [ ] Verify all posts migrated correctly
- [ ] Set `USE_SUPABASE=true` in environment
- [ ] Test public blog posts display correctly
- [ ] Monitor for any issues
- [ ] Keep microCMS credentials as backup (for quick rollback)

## Post-Deployment
- [ ] Test authentication flow
- [ ] Test CRUD operations
- [ ] Verify RLS policies working
- [ ] Check CSP headers not blocking ace-builds
- [ ] Monitor Supabase logs
- [ ] Monitor application errors
- [ ] Update team documentation

## Rollback Plan
If issues occur:
1. Set `USE_SUPABASE=false` in environment
2. Restart application
3. System will revert to microCMS
4. Investigate and fix issues
5. Retry with `USE_SUPABASE=true`

## Support
- Documentation: `docs/SUPABASE_SETUP.md`
- Implementation details: `docs/IMPLEMENTATION_SUMMARY.md`
- Troubleshooting: See docs/SUPABASE_SETUP.md
