# Local Development Setup

This guide will help you set up the project to run locally with PostgreSQL instead of the online Supabase instance.

## Prerequisites

- Node.js (v16 or higher)
- Docker and Docker Compose
- Supabase CLI

## Option 1: Using Supabase CLI (Recommended)

1. **Install Supabase CLI:**
   ```bash
   npm install -g supabase
   ```

2. **Initialize and start local Supabase:**
   ```bash
   # Make setup script executable
   chmod +x scripts/setup-local.sh
   
   # Run setup script
   ./scripts/setup-local.sh
   ```

3. **Update environment variables:**
   ```bash
   # Copy local environment file
   cp .env.local .env
   ```

4. **Update the Supabase client import:**
   In your components, change imports from:
   ```typescript
   import { supabase } from "@/integrations/supabase/client";
   ```
   
   To:
   ```typescript
   import { supabase } from "@/integrations/supabase/client.local";
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

## Option 2: Using Docker Compose

1. **Start the services:**
   ```bash
   docker-compose up -d
   ```

2. **Apply database schema:**
   ```bash
   # Connect to the database and run the seed file
   docker exec -i supabase-db psql -U postgres -d postgres < supabase/seed.sql
   ```

3. **Update environment variables:**
   ```bash
   cp .env.local .env
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

## Local URLs

- **Application:** http://localhost:5173
- **Supabase Studio:** http://localhost:54323
- **Supabase API:** http://localhost:54321
- **PostgreSQL:** postgresql://postgres:postgres@localhost:54322/postgres

## Database Management

### Access PostgreSQL directly:
```bash
# Using Docker
docker exec -it supabase-db psql -U postgres -d postgres

# Using Supabase CLI
supabase db shell
```

### Reset database:
```bash
supabase db reset
```

### Generate new types:
```bash
supabase gen types typescript --local > src/integrations/supabase/types.ts
```

## Migrating Data from Production

If you want to migrate data from your production Supabase instance:

1. **Export data from production:**
   ```bash
   # Export schema
   pg_dump -h your-supabase-host -U postgres -d postgres --schema-only > schema.sql
   
   # Export data
   pg_dump -h your-supabase-host -U postgres -d postgres --data-only > data.sql
   ```

2. **Import to local:**
   ```bash
   # Import schema
   supabase db shell < schema.sql
   
   # Import data
   supabase db shell < data.sql
   ```

## Switching Between Local and Production

To easily switch between local and production environments, you can:

1. **Use environment-based client configuration:**
   ```typescript
   // src/integrations/supabase/client.ts
   import { createClient } from '@supabase/supabase-js';
   import type { Database } from './types';
   
   const isLocal = import.meta.env.MODE === 'development';
   
   const SUPABASE_URL = isLocal 
     ? "http://localhost:54321"
     : "https://vpmeqoesvaixucailbxw.supabase.co";
     
   const SUPABASE_ANON_KEY = isLocal
     ? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvY2FsaG9zdCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjQxNzY5MjAwLCJleHAiOjE5NTcxNDUyMDB9.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE"
     : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwbWVxb2VzdmFpeHVjYWlsYnh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxNDE3NjMsImV4cCI6MjA3MzcxNzc2M30.QG4Gri8T1wo0D6UxNOqVz9Y46andD5c2gRoUC5rozp8";
   
   export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
     auth: {
       storage: localStorage,
       persistSession: true,
       autoRefreshToken: true,
     }
   });
   ```

2. **Use different environment files:**
   - `.env` - for production
   - `.env.local` - for local development
   - `.env.development` - for development mode