#!/bin/bash
cd frontend

echo "Repairing migration history..."

# Repair all remote migrations
npx supabase migration repair --status applied 20251006221905
npx supabase migration repair --status applied 20251006235000
npx supabase migration repair --status applied 20251007000000
npx supabase migration repair --status applied 20251007000100
npx supabase migration repair --status applied 20251007001000
npx supabase migration repair --status applied 20251007001100
npx supabase migration repair --status applied 20251007011708
npx supabase migration repair --status applied 20251007012000
npx supabase migration repair --status applied 20251007012310
npx supabase migration repair --status applied 20251007020000
npx supabase migration repair --status applied 20251007025000
npx supabase migration repair --status applied 20251007092740
npx supabase migration repair --status applied 20251008145421
npx supabase migration repair --status applied 20251009012500
npx supabase migration repair --status applied 20251009012600

echo "Migration history repaired!"