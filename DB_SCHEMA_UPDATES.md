# Database Schema Updates

This document outlines any database schema changes needed for the new features.

## Overview

The implementation adds new features that leverage the existing schema. Here are the updates you may need:

## 1. User Table Extensions

The current `user` table should support:

```sql
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS name VARCHAR(255);
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS image TEXT;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS emailVerified TIMESTAMP;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS provider VARCHAR(50);
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user'; -- 'user' or 'admin'
```

## 2. OAuth Tracking (Optional)

If you want to track OAuth connections separately:

```sql
CREATE TABLE IF NOT EXISTS oauth_account (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL,
  providerAccountId VARCHAR(255) NOT NULL,
  accessToken TEXT,
  refreshToken TEXT,
  expiresAt BIGINT,
  createdAt TIMESTAMP DEFAULT NOW(),
  UNIQUE(provider, providerAccountId)
);

CREATE INDEX idx_oauth_userId ON oauth_account(userId);
```

## 3. Admin Activity Log (Optional but Recommended)

```sql
CREATE TABLE IF NOT EXISTS admin_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  adminId UUID NOT NULL REFERENCES "user"(id),
  action VARCHAR(100) NOT NULL,
  targetId UUID,
  targetType VARCHAR(50),
  details JSONB,
  timestamp TIMESTAMP DEFAULT NOW(),
  ipAddress VARCHAR(45),
  userAgent TEXT
);

CREATE INDEX idx_admin_log_adminId ON admin_log(adminId);
CREATE INDEX idx_admin_log_timestamp ON admin_log(timestamp);
```

## 4. Processing Jobs (For Long-Running Tasks)

```sql
CREATE TABLE IF NOT EXISTS processing_job (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  projectId UUID NOT NULL REFERENCES "platformProject"(id) ON DELETE CASCADE,
  userId UUID NOT NULL REFERENCES "user"(id),
  jobType VARCHAR(50) NOT NULL, -- 'auth_inference', 'workflow_detection', etc.
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed'
  progress INTEGER DEFAULT 0,
  totalSteps INTEGER,
  currentStep VARCHAR(255),
  tokensProcessed INTEGER DEFAULT 0,
  result JSONB,
  error TEXT,
  startedAt TIMESTAMP,
  completedAt TIMESTAMP,
  createdAt TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_processing_job_projectId ON processing_job(projectId);
CREATE INDEX idx_processing_job_status ON processing_job(status);
```

## 5. Analysis Results Caching

```sql
CREATE TABLE IF NOT EXISTS analysis_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  projectId UUID NOT NULL REFERENCES "platformProject"(id) ON DELETE CASCADE,
  analysisType VARCHAR(50) NOT NULL, -- 'auth', 'workflows', 'compression', 'parser'
  result JSONB NOT NULL,
  cacheVersion INTEGER DEFAULT 1,
  createdAt TIMESTAMP DEFAULT NOW(),
  expiresAt TIMESTAMP,
  UNIQUE(projectId, analysisType)
);

CREATE INDEX idx_analysis_cache_projectId ON analysis_cache(projectId);
CREATE INDEX idx_analysis_cache_expiresAt ON analysis_cache(expiresAt);
```

## Running Migrations

### Option 1: Using Drizzle ORM (Recommended)

If your project uses Drizzle ORM, create a migration file:

```bash
pnpm drizzle-kit generate:pg
```

Then apply:

```bash
pnpm drizzle-kit push:pg
```

### Option 2: Direct SQL

Connect to your database and run:

```bash
# For Supabase, use the SQL editor in the dashboard
# Or connect via psql:
psql postgresql://user:password@host:5432/dbname < migrations.sql
```

### Option 3: Using Database IDE

1. Open your database management tool
2. Execute the SQL statements above
3. Verify indexes were created

## Schema Additions by Feature

### Admin Dashboard
- Requires: Enhanced `user` table with `role` column
- Optional: `admin_log` table for audit trail

### OAuth Integration
- Requires: `name`, `image`, `emailVerified` in user table
- Optional: `oauth_account` table for tracking connections

### Live Processing
- Requires: `processing_job` table for tracking
- Optional: `analysis_cache` table for results

### Auth Inference / Workflows / Compression
- Optional: `analysis_cache` table for caching results
- No table changes required (stores in JSON columns)

## Data Migration

If migrating existing data:

```sql
-- Ensure all users have a role
UPDATE "user" SET role = 'user' WHERE role IS NULL;

-- Set admin role for specific users
UPDATE "user" SET role = 'admin' WHERE email = 'gautammanak1@gmail.com';

-- Verify
SELECT email, role FROM "user" LIMIT 10;
```

## Verification

After applying migrations, verify:

```sql
-- Check user table columns
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'user' ORDER BY ordinal_position;

-- Check new tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' ORDER BY table_name;

-- Check indexes
SELECT indexname FROM pg_indexes WHERE schemaname = 'public';
```

## Rollback

If you need to rollback:

```sql
-- Drop new tables (in order of dependencies)
DROP TABLE IF EXISTS admin_log CASCADE;
DROP TABLE IF EXISTS oauth_account CASCADE;
DROP TABLE IF EXISTS processing_job CASCADE;
DROP TABLE IF EXISTS analysis_cache CASCADE;

-- Remove columns (if needed)
ALTER TABLE "user" DROP COLUMN IF EXISTS provider;
ALTER TABLE "user" DROP COLUMN IF EXISTS role;
```

## Notes

- All new tables have CASCADE delete for referential integrity
- Indexes are created for optimal query performance
- JSON columns provide flexibility for complex data
- Timestamps use PostgreSQL NOW() function
- UUIDs use PostgreSQL gen_random_uuid()

## Environment-Specific Considerations

### Supabase
- Use the SQL Editor in Supabase dashboard
- Migrations are version controlled in `supabase/migrations/`
- RLS policies are automatically inherited from existing tables

### Neon
- Use Neon dashboard or CLI
- Supports standard PostgreSQL migrations
- Connection pooling handled automatically

### Self-Hosted PostgreSQL
- Use standard psql client
- Ensure backups before applying migrations
- Test on staging environment first

## Future Schema Considerations

For planned features:

```sql
-- Team collaboration
CREATE TABLE team (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  createdAt TIMESTAMP DEFAULT NOW()
);

-- Webhooks
CREATE TABLE webhook (
  id UUID PRIMARY KEY,
  projectId UUID NOT NULL REFERENCES "platformProject"(id),
  url TEXT NOT NULL,
  events TEXT[], -- array of event types
  active BOOLEAN DEFAULT TRUE
);
```

---

**Note:** These migrations are optional. The core application works with just the existing schema. These additions enable advanced features like admin panel, OAuth, and job tracking.
