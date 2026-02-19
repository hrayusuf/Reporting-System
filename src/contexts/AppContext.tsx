import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { databaseService, FinancialRow, SalesRow, FleetRow, MaintenanceRow } from '../services/database';

export type Language = 'en' | 'ar';
export type PeriodFilter = 'All' | 'This Year' | 'This Quarter' | 'This Month';

export type { FinancialRow as FinancialEntry, SalesRow as SalesEntry, FleetRow as FleetEntry, MaintenanceRow as MaintenanceEntry };

export interface CompanyProfile {
  name: string;
  currency: string;
}

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  period: PeriodFilter;
  setPeriod: (period: PeriodFilter) => void;
  profile: CompanyProfile;
  setProfile: (profile: CompanyProfile) => void;
  financials: FinancialRow[];
  sales: SalesRow[];
  fleet: FleetRow[];
  maintenance: MaintenanceRow[];
  filteredFinancials: FinancialRow[];
  filteredSales: SalesRow[];
  filteredFleet: FleetRow[];
  filteredMaintenance: MaintenanceRow[];
  isLoading: boolean;
  refreshData: () => Promise<void>;
  addFinancial: (entry: Omit<FinancialRow, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  addFleet: (entry: Omit<FleetRow, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  addMaintenance: (entry: Omit<MaintenanceRow, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  generateSampleData: () => Promise<void>;
  clearAllData: () => Promise<void>;
  t: (key: string) => string;
  formatCurrency: (amount: number) => string;
  formatCompactCurrency: (amount: number) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};

const AR: Record<string, string> = {
  'Overview': 'نظرة عامة',
  'Sales Performance': 'أداء المبيعات',
  'Top 10 Rankings': 'أفضل 10 تصنيفات',
  'Fleet & Operations': 'الأسطول والعمليات',
  'Data Upload': 'رفع البيانات',
  'Settings': 'الإعدادات',
  'Sign Out': 'تسجيل الخروج',
  'Sign In': 'تسجيل الدخول',
  'Sign Up': 'إنشاء حساب',
  'Create Account': 'إنشاء حساب',
  'Already have an account?': 'لديك حساب بالفعل؟',
  "Don't have an account?": 'ليس لديك حساب؟',
  'Performance Portal': 'بوابة الأداء',
  'Email': 'البريد الإلكتروني',
  'Password': 'كلمة المرور',
  'Loading...': 'جار التحميل...',
  'Manage your system parameters': 'إدارة معلمات النظام',
  'Performance metrics for': 'مقاييس الأداء لـ',
  'Revenue': 'إيرادات',
  'Expense': 'مصروفات',
  'Employee': 'موظف',
  'Fuel': 'وقود',
  'Maintenance': 'صيانة',
  'All': 'الكل',
  'This Year': 'هذا العام',
  'This Quarter': 'هذا الربع',
  'This Month': 'هذا الشهر',
  'Total Revenue': 'إجمالي الإيرادات',
  'Total Expenses': 'إجمالي المصروفات',
  'Net Profit': 'صافي الربح',
  'Profit Margin': 'هامش الربح',
  'Total Sales': 'إجمالي المبيعات',
  'Total Deals Closed': 'إجمالي الصفقات المغلقة',
  'Average Deal Size': 'متوسط حجم الصفقة',
  'Best Sales Rep': 'أفضل مندوب مبيعات',
  'Total Fuel Cost': 'إجمالي تكلفة الوقود',
  'Total Maintenance Cost': 'إجمالي تكلفة الصيانة',
  'Total Operating Cost': 'إجمالي تكلفة التشغيل',
  'Avg Cost per Vehicle': 'متوسط التكلفة لكل مركبة',
  'Generate Sample Data': 'توليد بيانات عينة',
  'Clear All Data': 'مسح كافة البيانات',
  'Company Name': 'اسم الشركة',
  'Base Currency': 'العملة الأساسية',
  'Save Changes': 'حفظ التغييرات',
  'Add Revenue': 'إضافة إيراد',
  'Add Expense': 'إضافة مصروف',
  'Add Fuel Record': 'إضافة سجل وقود',
  'Add Employee Salary': 'إضافة راتب موظف',
  'No Data Available': 'لا توجد بيانات متاحة',
  'Go to Data Upload': 'الذهاب إلى رفع البيانات',
  'Financial Performance Trend': 'اتجاه الأداء المالي',
  'Expenses Breakdown': 'تفصيل المصروفات',
  'Revenue Breakdown': 'تفصيل الإيرادات',
  'Sales by Representative': 'المبيعات حسب المندوب',
  'Recent Sales Transactions': 'معاملات المبيعات الأخيرة',
  'Date': 'التاريخ',
  'Sales Rep': 'مندوب المبيعات',
  'Customer': 'العميل',
  'Service': 'الخدمة',
  'Value': 'القيمة',
  'Profit': 'الربح',
  'No recent sales found.': 'لا توجد مبيعات حديثة.',
  'Top 10 Customers (Revenue)': 'أفضل 10 عملاء (إيرادات)',
  'Top 10 Expense Categories': 'أعلى 10 فئات للمصروفات',
  'Operating Cost by Vehicle': 'تكلفة التشغيل حسب المركبة',
  'Monthly Fleet Cost Trend': 'اتجاه تكلفة الأسطول الشهرية',
  'Top Vehicles by Cost': 'أعلى المركبات بالتكلفة',
  'Operating Cost Breakdown': 'تفصيل تكلفة التشغيل',
  'Data Management Hub': 'مركز إدارة البيانات',
  'Financials Data': 'بيانات المالية',
  'Sales Data': 'بيانات المبيعات',
  'Fleet Data': 'بيانات الأسطول',
  'Template': 'قالب',
  'Browse File': 'تصفح الملف',
  'Company Profile Settings': 'إعدادات ملف الشركة',
  'Are you sure you want to clear all data?': 'هل أنت متأكد أنك تريد مسح كافة البيانات؟',
  'Settings saved successfully!': 'تم حفظ الإعدادات بنجاح!',
  'Sample data generated successfully!': 'تم توليد البيانات التجريبية بنجاح!',
  'Cancel': 'إلغاء',
  'Add': 'إضافة',
  'Amount': 'المبلغ',
  'Category': 'الفئة',
  'Select category': 'اختر الفئة',
  'Service Revenue': 'إيرادات الخدمات',
  'Description': 'الوصف',
  'Vehicle ID': 'معرف المركبة',
  'Date / Month': 'التاريخ / الشهر',
  'Salaries': 'رواتب',
  'Rent': 'إيجار',
  'Software': 'برمجيات',
  'Marketing': 'تسويق',
  'Utilities': 'مرافق',
  'Office Supplies': 'لوازم مكتبية',
  'P&L Summary': 'ملخص الأرباح والخسائر',
  'Contribution %': 'نسبة المساهمة',
  'VehicleID': 'رقم المركبة',
  'Branch': 'الفرع',
  'Downtime Days': 'أيام التوقف',
  'Upload': 'رفع',
  'Preview': 'معاينة',
  'Validate': 'التحقق',
  'Import': 'استيراد',
  'Rows detected': 'صفوف مكتشفة',
  'rows': 'صفوف',
};

function filterByPeriod<T extends { date: string }>(items: T[], period: PeriodFilter): T[] {
  if (period === 'All') return items;
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();

  return items.filter(item => {
    const d = new Date(item.date);
    if (period === 'This Year') return d.getFullYear() === y;
    if (period === 'This Month') return d.getFullYear() === y && d.getMonth() === m;
    if (period === 'This Quarter') {
      const q = Math.floor(m / 3);
      const dq = Math.floor(d.getMonth() / 3);
      return d.getFullYear() === y && dq === q;
    }
    return true;
  });
}

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('en');
  const [period, setPeriod] = useState<PeriodFilter>('All');
  const [profile, setProfile] = useState<CompanyProfile>({ name: 'My Company', currency: 'SAR' });
  const [financials, setFinancials] = useState<FinancialRow[]>([]);
  const [sales, setSales] = useState<SalesRow[]>([]);
  const [fleet, setFleet] = useState<FleetRow[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const filteredFinancials = useMemo(() => filterByPeriod(financials, period), [financials, period]);
  const filteredSales = useMemo(() => filterByPeriod(sales, period), [sales, period]);
  const filteredFleet = useMemo(() => filterByPeriod(fleet, period), [fleet, period]);
  const filteredMaintenance = useMemo(() => filterByPeriod(maintenance, period), [maintenance, period]);

  const refreshData = async () => {
    try {
      setIsLoading(true);
      const [fin, sal, flt, mnt, prof] = await Promise.all([
        databaseService.getAllFinancials(),
        databaseService.getAllSales(),
        databaseService.getAllFleet(),
        databaseService.getAllMaintenance(),
        databaseService.getCompanyProfile(),
      ]);
      setFinancials(fin);
      setSales(sal);
      setFleet(flt);
      setMaintenance(mnt);
      if (prof) setProfile({ name: prof.name, currency: prof.currency });
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const addFinancial = async (entry: Omit<FinancialRow, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    await databaseService.addFinancial(entry);
    await refreshData();
  };

  const addFleet = async (entry: Omit<FleetRow, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    await databaseService.getOrCreateVehicle(entry.vehicle_id);
    await databaseService.addFleet(entry);
    await refreshData();
  };

  const addMaintenance = async (entry: Omit<MaintenanceRow, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    await databaseService.getOrCreateVehicle(entry.vehicle_id);
    await databaseService.addMaintenance(entry);
    await refreshData();
  };

  const generateSampleData = async () => {
    setIsLoading(true);
    try {
      await databaseService.generateMockData();
      await refreshData();
      alert(t('Sample data generated successfully!'));
    } catch (err) {
      console.error(err);
      alert('Error generating sample data');
    } finally {
      setIsLoading(false);
    }
  };

  const clearAllData = async () => {
    if (!confirm(t('Are you sure you want to clear all data?'))) return;
    setIsLoading(true);
    try {
      await databaseService.clearAllData();
      await refreshData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const t = (key: string): string => (language === 'en' ? key : (AR[key] ?? key));

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-US', {
      style: 'currency', currency: profile.currency, maximumFractionDigits: 0,
    }).format(amount);

  const formatCompactCurrency = (amount: number) =>
    new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-US', {
      style: 'currency', currency: profile.currency, maximumFractionDigits: 0,
      notation: 'compact', compactDisplay: 'short',
    }).format(amount);

  return (
    <AppContext.Provider value={{
      language, setLanguage, period, setPeriod, profile, setProfile,
      financials, sales, fleet, maintenance,
      filteredFinancials, filteredSales, filteredFleet, filteredMaintenance,
      isLoading, refreshData,
      addFinancial, addFleet, addMaintenance,
      generateSampleData, clearAllData,
      t, formatCurrency, formatCompactCurrency,
    }}>
      {children}
    </AppContext.Provider>
  );
};
