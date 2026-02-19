/*
  # Enhance Schema to Full PRD Specification

  ## Overview
  Adds missing columns and a new `maintenance_entries` table to match the 
  full Product Requirements Document. Separates fuel and maintenance into 
  dedicated tables (per PRD section 6.3), and enriches existing tables with
  additional tracking fields.

  ## 1. Modified Tables

  ### `financial_entries`
  - Added `period_type` (text) - Month / Quarter / Year
  - Added `sub_category` (text) - optional finer-grained category
  - Added `cost_center` (text) - optional department/branch/project

  ### `vehicles`
  - Added `status` (text, default 'active') - active / inactive

  ### `fleet_entries` (renamed logical function to fuel_only)
  - Added `liters` (numeric) - fuel volume consumed
  - Added `odometer` (numeric) - km reading at fill-up

  ### `sales_entries`
  - Added `calculated_profit` (numeric) - stored profit = contract_value - cost
  - Added `calculated_margin_percent` (numeric) - stored margin %

  ## 2. New Tables

  ### `maintenance_entries`
  Separate table for vehicle maintenance records (tire changes, repairs, etc.)
  - `id` (uuid, primary key)
  - `date` (date)
  - `vehicle_id` (text)
  - `type` (text) - Routine / Repair / Tires / Other
  - `maintenance_cost` (numeric)
  - `downtime_days` (integer, default 0)
  - `notes` (text)
  - `user_id` (uuid)
  - `created_at`, `updated_at`

  ## 3. Security
  - RLS enabled on maintenance_entries with the same patterns as other tables

  ## 4. Notes
  - All new columns use IF NOT EXISTS to be safe on repeated runs
  - Existing data is preserved; new nullable columns default to empty/null
*/

-- Enhance financial_entries
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='financial_entries' AND column_name='period_type') THEN
    ALTER TABLE financial_entries ADD COLUMN period_type text DEFAULT 'Month' CHECK (period_type IN ('Month','Quarter','Year'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='financial_entries' AND column_name='sub_category') THEN
    ALTER TABLE financial_entries ADD COLUMN sub_category text DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='financial_entries' AND column_name='cost_center') THEN
    ALTER TABLE financial_entries ADD COLUMN cost_center text DEFAULT '';
  END IF;
END $$;

-- Enhance fleet_entries with fuel-specific fields
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fleet_entries' AND column_name='liters') THEN
    ALTER TABLE fleet_entries ADD COLUMN liters numeric DEFAULT 0 CHECK (liters >= 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fleet_entries' AND column_name='odometer') THEN
    ALTER TABLE fleet_entries ADD COLUMN odometer numeric DEFAULT 0 CHECK (odometer >= 0);
  END IF;
END $$;

-- Enhance vehicles with status
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='vehicles' AND column_name='status') THEN
    ALTER TABLE vehicles ADD COLUMN status text DEFAULT 'active' CHECK (status IN ('active','inactive'));
  END IF;
END $$;

-- Enhance sales_entries with stored calculated fields
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sales_entries' AND column_name='calculated_profit') THEN
    ALTER TABLE sales_entries ADD COLUMN calculated_profit numeric GENERATED ALWAYS AS (contract_value - cost) STORED;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sales_entries' AND column_name='calculated_margin_percent') THEN
    ALTER TABLE sales_entries ADD COLUMN calculated_margin_percent numeric GENERATED ALWAYS AS (
      CASE WHEN contract_value > 0 THEN ROUND(((contract_value - cost) / contract_value * 100)::numeric, 2) ELSE 0 END
    ) STORED;
  END IF;
END $$;

-- Create maintenance_entries table
CREATE TABLE IF NOT EXISTS maintenance_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL DEFAULT CURRENT_DATE,
  vehicle_id text NOT NULL,
  type text NOT NULL DEFAULT 'Routine' CHECK (type IN ('Routine','Repair','Tires','Other')),
  maintenance_cost numeric NOT NULL DEFAULT 0 CHECK (maintenance_cost >= 0),
  downtime_days integer NOT NULL DEFAULT 0 CHECK (downtime_days >= 0),
  notes text DEFAULT '',
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_maintenance_entries_user_id ON maintenance_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_entries_date ON maintenance_entries(date DESC);
CREATE INDEX IF NOT EXISTS idx_maintenance_entries_vehicle_id ON maintenance_entries(vehicle_id);

ALTER TABLE maintenance_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own maintenance entries"
  ON maintenance_entries FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own maintenance entries"
  ON maintenance_entries FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own maintenance entries"
  ON maintenance_entries FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own maintenance entries"
  ON maintenance_entries FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_maintenance_entries_updated_at ON maintenance_entries;
CREATE TRIGGER update_maintenance_entries_updated_at
  BEFORE UPDATE ON maintenance_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();