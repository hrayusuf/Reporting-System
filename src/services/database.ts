import { supabase } from '../lib/supabase';

export interface FinancialRow {
  id: string;
  date: string;
  type: 'Revenue' | 'Expense';
  category: string;
  sub_category?: string | null;
  cost_center?: string | null;
  period_type?: string | null;
  amount: number;
  description?: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface SalesRow {
  id: string;
  date: string;
  sales_rep: string;
  customer: string;
  service: string;
  contract_value: number;
  cost: number;
  calculated_profit?: number | null;
  calculated_margin_percent?: number | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface FleetRow {
  id: string;
  date: string;
  vehicle_id: string;
  type: 'Fuel' | 'Maintenance';
  cost: number;
  liters?: number | null;
  odometer?: number | null;
  details?: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface MaintenanceRow {
  id: string;
  date: string;
  vehicle_id: string;
  type: 'Routine' | 'Repair' | 'Tires' | 'Other';
  maintenance_cost: number;
  downtime_days: number;
  notes?: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface VehicleRow {
  id: string;
  vehicle_id: string;
  plate_number?: string | null;
  vehicle_type?: string | null;
  branch?: string | null;
  status?: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface CompanyProfileRow {
  id: string;
  user_id: string;
  name: string;
  currency: string;
  created_at: string;
  updated_at: string;
}

const getUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  return user;
};

export const databaseService = {
  async getAllFinancials(): Promise<FinancialRow[]> {
    const { data, error } = await supabase.from('financial_entries').select('*').order('date', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async addFinancial(entry: Omit<FinancialRow, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<FinancialRow> {
    const user = await getUser();
    const { data, error } = await supabase.from('financial_entries').insert({ ...entry, user_id: user.id }).select().single();
    if (error) throw error;
    return data;
  },

  async bulkInsertFinancials(entries: Omit<FinancialRow, 'id' | 'user_id' | 'created_at' | 'updated_at'>[]): Promise<void> {
    const user = await getUser();
    const { error } = await supabase.from('financial_entries').insert(entries.map(e => ({ ...e, user_id: user.id })));
    if (error) throw error;
  },

  async clearAllFinancials(): Promise<void> {
    const user = await getUser();
    const { error } = await supabase.from('financial_entries').delete().eq('user_id', user.id);
    if (error) throw error;
  },

  async getAllSales(): Promise<SalesRow[]> {
    const { data, error } = await supabase.from('sales_entries').select('*').order('date', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async addSales(entry: Omit<SalesRow, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'calculated_profit' | 'calculated_margin_percent'>): Promise<SalesRow> {
    const user = await getUser();
    const { data, error } = await supabase.from('sales_entries').insert({ ...entry, user_id: user.id }).select().single();
    if (error) throw error;
    return data;
  },

  async bulkInsertSales(entries: Omit<SalesRow, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'calculated_profit' | 'calculated_margin_percent'>[]): Promise<void> {
    const user = await getUser();
    const { error } = await supabase.from('sales_entries').insert(entries.map(e => ({ ...e, user_id: user.id })));
    if (error) throw error;
  },

  async clearAllSales(): Promise<void> {
    const user = await getUser();
    const { error } = await supabase.from('sales_entries').delete().eq('user_id', user.id);
    if (error) throw error;
  },

  async getAllFleet(): Promise<FleetRow[]> {
    const { data, error } = await supabase.from('fleet_entries').select('*').order('date', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async addFleet(entry: Omit<FleetRow, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<FleetRow> {
    const user = await getUser();
    const { data, error } = await supabase.from('fleet_entries').insert({ ...entry, user_id: user.id }).select().single();
    if (error) throw error;
    return data;
  },

  async bulkInsertFleet(entries: Omit<FleetRow, 'id' | 'user_id' | 'created_at' | 'updated_at'>[]): Promise<void> {
    const user = await getUser();
    const { error } = await supabase.from('fleet_entries').insert(entries.map(e => ({ ...e, user_id: user.id })));
    if (error) throw error;
  },

  async clearAllFleet(): Promise<void> {
    const user = await getUser();
    const { error } = await supabase.from('fleet_entries').delete().eq('user_id', user.id);
    if (error) throw error;
  },

  async getAllMaintenance(): Promise<MaintenanceRow[]> {
    const { data, error } = await supabase.from('maintenance_entries').select('*').order('date', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async addMaintenance(entry: Omit<MaintenanceRow, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<MaintenanceRow> {
    const user = await getUser();
    const { data, error } = await supabase.from('maintenance_entries').insert({ ...entry, user_id: user.id }).select().single();
    if (error) throw error;
    return data;
  },

  async bulkInsertMaintenance(entries: Omit<MaintenanceRow, 'id' | 'user_id' | 'created_at' | 'updated_at'>[]): Promise<void> {
    const user = await getUser();
    const { error } = await supabase.from('maintenance_entries').insert(entries.map(e => ({ ...e, user_id: user.id })));
    if (error) throw error;
  },

  async clearAllMaintenance(): Promise<void> {
    const user = await getUser();
    const { error } = await supabase.from('maintenance_entries').delete().eq('user_id', user.id);
    if (error) throw error;
  },

  async getAllVehicles(): Promise<VehicleRow[]> {
    const { data, error } = await supabase.from('vehicles').select('*').order('vehicle_id');
    if (error) throw error;
    return data || [];
  },

  async getOrCreateVehicle(vehicleId: string): Promise<VehicleRow> {
    const user = await getUser();
    const { data: existing } = await supabase.from('vehicles').select('*').eq('vehicle_id', vehicleId).eq('user_id', user.id).maybeSingle();
    if (existing) return existing;
    const { data, error } = await supabase.from('vehicles').insert({ vehicle_id: vehicleId, user_id: user.id }).select().single();
    if (error) throw error;
    return data;
  },

  async getCompanyProfile(): Promise<CompanyProfileRow | null> {
    const user = await getUser();
    const { data, error } = await supabase.from('company_profiles').select('*').eq('user_id', user.id).maybeSingle();
    if (error) throw error;
    return data;
  },

  async createOrUpdateCompanyProfile(profile: { name: string; currency: string }): Promise<CompanyProfileRow> {
    const user = await getUser();
    const existing = await this.getCompanyProfile();
    if (existing) {
      const { data, error } = await supabase.from('company_profiles').update(profile).eq('user_id', user.id).select().single();
      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase.from('company_profiles').insert({ ...profile, user_id: user.id }).select().single();
      if (error) throw error;
      return data;
    }
  },

  async generateMockData(): Promise<void> {
    const user = await getUser();
    const reps = ['Alice Smith', 'Bob Jones', 'Charlie Davis', 'Diana Prince'];
    const customers = ['TechCorp', 'MegaBuild', 'City Hospital', 'EduCenter', 'RetailGroup'];
    const services = ['Consulting', 'Installation', 'Maintenance', 'Support'];
    const vehicleIds = ['VAN-001', 'TRK-002', 'CAR-003', 'VAN-004'];
    const expenseCategories = ['Salaries', 'Rent', 'Software', 'Marketing', 'Utilities', 'Office Supplies'];

    const financials: any[] = [];
    const sales: any[] = [];
    const fleet: any[] = [];
    const maintenance: any[] = [];

    const now = new Date();
    for (let i = 0; i < 300; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
      const dateStr = date.toISOString().split('T')[0];

      if (i < 150) {
        const isRev = Math.random() > 0.4;
        financials.push({
          date: dateStr,
          type: isRev ? 'Revenue' : 'Expense',
          category: isRev ? 'Service Revenue' : expenseCategories[Math.floor(Math.random() * expenseCategories.length)],
          amount: Math.floor(Math.random() * (isRev ? 15000 : 5000)) + 500,
          period_type: 'Month',
          user_id: user.id,
        });
      }

      if (i < 100) {
        const cv = Math.floor(Math.random() * 20000) + 1000;
        sales.push({
          date: dateStr,
          sales_rep: reps[Math.floor(Math.random() * reps.length)],
          customer: customers[Math.floor(Math.random() * customers.length)],
          service: services[Math.floor(Math.random() * services.length)],
          contract_value: cv,
          cost: Math.round(cv * (Math.random() * 0.4 + 0.2)),
          user_id: user.id,
        });
      }

      if (i < 80) {
        fleet.push({
          date: dateStr,
          vehicle_id: vehicleIds[Math.floor(Math.random() * vehicleIds.length)],
          type: 'Fuel',
          cost: Math.floor(Math.random() * 150) + 50,
          liters: Math.floor(Math.random() * 60) + 20,
          odometer: Math.floor(Math.random() * 50000) + 10000,
          user_id: user.id,
        });
      }

      if (i < 40) {
        maintenance.push({
          date: dateStr,
          vehicle_id: vehicleIds[Math.floor(Math.random() * vehicleIds.length)],
          type: ['Routine', 'Repair', 'Tires', 'Other'][Math.floor(Math.random() * 4)],
          maintenance_cost: Math.floor(Math.random() * 800) + 100,
          downtime_days: Math.floor(Math.random() * 5),
          user_id: user.id,
        });
      }
    }

    for (const vid of vehicleIds) {
      await this.getOrCreateVehicle(vid);
    }

    const CHUNK = 50;
    for (let i = 0; i < financials.length; i += CHUNK) {
      const { error } = await supabase.from('financial_entries').insert(financials.slice(i, i + CHUNK));
      if (error) throw error;
    }
    for (let i = 0; i < sales.length; i += CHUNK) {
      const { error } = await supabase.from('sales_entries').insert(sales.slice(i, i + CHUNK));
      if (error) throw error;
    }
    for (let i = 0; i < fleet.length; i += CHUNK) {
      const { error } = await supabase.from('fleet_entries').insert(fleet.slice(i, i + CHUNK));
      if (error) throw error;
    }
    for (let i = 0; i < maintenance.length; i += CHUNK) {
      const { error } = await supabase.from('maintenance_entries').insert(maintenance.slice(i, i + CHUNK));
      if (error) throw error;
    }
  },

  async clearAllData(): Promise<void> {
    await Promise.all([
      this.clearAllFinancials(),
      this.clearAllSales(),
      this.clearAllFleet(),
      this.clearAllMaintenance(),
    ]);
  },
};
