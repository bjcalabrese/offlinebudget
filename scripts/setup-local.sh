#!/bin/bash

echo "Setting up local development environment..."

# Install Supabase CLI if not already installed
if ! command -v supabase &> /dev/null; then
    echo "Installing Supabase CLI..."
    npm install -g supabase
fi

# Initialize Supabase project
echo "Initializing Supabase project..."
supabase init

# Start local Supabase
echo "Starting local Supabase..."
supabase start

# Apply seed data
echo "Applying seed data..."
supabase db reset

echo "Local setup complete!"
echo "Supabase Studio: http://localhost:54323"
echo "API URL: http://localhost:54321"
echo "Database URL: postgresql://postgres:postgres@localhost:54322/postgres"