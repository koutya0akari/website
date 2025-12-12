# Supabase Setup Guide

This document describes the Supabase database schema and setup required for the admin panel.

## Database Schema

### Diary Table

Create the following table in your Supabase project:

```sql
-- Create diary table
CREATE TABLE diary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  body TEXT,
  summary TEXT,
  folder TEXT,
  tags TEXT[],
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  hero_image_url TEXT,
  view_count INTEGER DEFAULT 0,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for better query performance
CREATE INDEX idx_diary_status ON diary(status);
CREATE INDEX idx_diary_slug ON diary(slug);
CREATE INDEX idx_diary_published_at ON diary(published_at DESC);
CREATE INDEX idx_diary_created_at ON diary(created_at DESC);

-- Enable Row Level Security
ALTER TABLE diary ENABLE ROW LEVEL SECURITY;

-- Policy: Public read for published posts
CREATE POLICY "Public read for published" ON diary
  FOR SELECT USING (status = 'published');

-- Policy: Authenticated users have full access
CREATE POLICY "Authenticated users full access" ON diary
  FOR ALL USING (auth.role() = 'authenticated');
```

### Auto-update timestamp trigger

```sql
-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER update_diary_updated_at
  BEFORE UPDATE ON diary
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

Required variables:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon/public key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (server-side only)
- `USE_SUPABASE`: Set to `true` to use Supabase instead of microCMS

## Authentication Setup

1. Go to your Supabase project dashboard
2. Navigate to Authentication > Providers
3. Enable Email provider
4. Create a user account in Authentication > Users
5. Use this account to log in to `/admin/login`

## Migration from microCMS

The application supports both microCMS and Supabase through a feature flag (`USE_SUPABASE`).

- When `USE_SUPABASE=false` (default): Uses microCMS
- When `USE_SUPABASE=true`: Uses Supabase

This allows for gradual migration:

1. Set up Supabase database and authentication
2. Optionally migrate existing data from microCMS to Supabase
3. Toggle `USE_SUPABASE=true` to switch to Supabase
4. Test thoroughly before deploying

## Security Considerations

1. **Row Level Security (RLS)**: Enabled on the diary table with policies
2. **API Authentication**: All admin API routes check for authenticated users
3. **Input Validation**: Slug uniqueness and required fields are validated
4. **XSS Protection**: Content should be sanitized when displayed
5. **CSP Headers**: Updated to allow ace-builds web workers

## Admin Panel Features

- **Dashboard**: View statistics (total posts, drafts, published, views)
- **Diary Management**: Create, read, update, delete posts
- **Markdown Editor**: Ace editor with syntax highlighting
- **Auto-save**: Editor content auto-saved to localStorage every 5 seconds
- **Search & Filter**: Search by title/slug, filter by status, sort by various fields
- **Tags**: Multiple tags support
- **Status**: Draft or published
- **Hero Images**: URL-based images (future: upload support)

## Development

1. Install dependencies:
```bash
npm install
```

2. Copy ace-builds to public directory:
```bash
mkdir -p public/ace-builds
cp -r node_modules/ace-builds/src-noconflict public/ace-builds/
```

Note: This step is automated in the build process but needed for local development.

3. Start development server:
```bash
npm run dev
```

4. Access admin panel at:
```
http://localhost:3000/admin/login
```

## Production Deployment

1. Set environment variables in your hosting platform (Vercel, etc.)
2. Ensure ace-builds are copied to public directory during build
3. Test authentication and CRUD operations
4. Monitor Supabase logs and usage

## Troubleshooting

### Ace Editor not loading
- Check that ace-builds are in `public/ace-builds/src-noconflict/`
- Check browser console for CSP errors
- Verify CSP headers in `next.config.ts` include `worker-src 'self' blob:` and `script-src 'unsafe-eval'`

### Authentication issues
- Verify Supabase credentials in environment variables
- Check Supabase dashboard for user accounts
- Ensure middleware is not blocking the login route

### API errors
- Check Supabase RLS policies
- Verify user is authenticated
- Check browser network tab for detailed error messages
