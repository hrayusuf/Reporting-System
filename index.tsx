import React, { useState, useEffect, useMemo, createContext, useContext } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, ComposedChart
} from 'recharts';
import { 
  LayoutDashboard, TrendingUp, Award, Truck, UploadCloud, Settings, LogOut, 
  DollarSign, Activity, FileText, Users, Percent, AlertCircle, CheckCircle2,
  Car, Plus, X, Download, Globe
} from 'lucide-react';

// --- Translations ---
const translations: Record<string, Record<string, string>> = {
  en: {}, // Fallback is key
  ar: {
    'Overview': 'نظرة عامة',
    'Sales Performance': 'أداء المبيعات',
    'Top 10 Rankings': 'أفضل 10 تصنيفات',
    'Fleet & Operations': 'الأسطول والعمليات',
    'Data Upload': 'رفع البيانات',
    'Settings': 'الإعدادات',
    'Sign Out': 'تسجيل الخروج',
    'Performance Portal': 'بوابة الأداء',
    'Sign in to your secure dashboard': 'تسجيل الدخول إلى لوحة القيادة الآمنة',
    'Admin Username': 'اسم المستخدم',
    'Password': 'كلمة المرور',
    'Access Dashboard': 'الدخول للوحة القيادة',
    'For MVP demo, any credentials will work.': 'للعرض التجريبي، أي بيانات اعتماد ستعمل.',
    'Manage your system parameters': 'إدارة معلمات النظام الخاص بك',
    'Performance metrics for': 'مقاييس الأداء لـ',
    'Revenue': 'إيرادات',
    'Expense': 'مصروفات',
    'Fuel': 'وقود',
    'Employee': 'موظف',
    'All': 'الكل',
    'This Year': 'هذا العام',
    'This Quarter': 'هذا الربع',
    'This Month': 'هذا الشهر',
    'Total Revenue': 'إجمالي الإيرادات',
    'Total Expenses': 'إجمالي المصروفات',
    'Net Profit': 'صافي الربح',
    'Profit Margin': 'هامش الربح',
    'Financial Performance Trend': 'اتجاه الأداء المالي',
    'Expenses Breakdown': 'تفصيل المصروفات',
    'Total Sales': 'إجمالي المبيعات',
    'Total Deals Closed': 'إجمالي الصفقات المغلقة',
    'Average Deal Size': 'متوسط حجم الصفقة',
    'Sales by Representative': 'المبيعات حسب المندوب',
    'Recent Sales Transactions': 'معاملات المبيعات الأخيرة',
    'Date': 'التاريخ',
    'Sales Rep': 'مندوب المبيعات',
    'Customer': 'العميل',
    'Service': 'الخدمة',
    'Value': 'القيمة',
    'No recent sales found.': 'لا توجد مبيعات حديثة.',
    'Top 10 Customers (Revenue)': 'أفضل 10 عملاء (إيرادات)',
    'Top 10 Expense Categories': 'أعلى 10 فئات للمصروفات',
    'Total Fuel Cost': 'إجمالي تكلفة الوقود',
    'Total Maintenance': 'إجمالي الصيانة',
    'Total Operating Cost': 'إجمالي تكلفة التشغيل',
    'Operating Cost by Vehicle': 'تكلفة التشغيل حسب المركبة',
    'Monthly Fleet Cost Trend': 'اتجاه تكلفة الأسطول الشهرية',
    'Data Management Hub': 'مركز إدارة البيانات',
    'Download CSV templates to fill out your own data, or instantly populate the system with robust mock data for demonstration.': 'قم بتنزيل قوالب CSV لملء بياناتك الخاصة، أو قم بتعبئة النظام ببيانات تجريبية قوية للعرض.',
    'Generate Sample Data': 'توليد بيانات عينة',
    'Clear All Data': 'مسح كافة البيانات',
    'Manual File Upload & Templates': 'الرفع اليدوي للملفات والقوالب',
    'Financials Data': 'بيانات المالية',
    'Sales Data': 'بيانات المبيعات',
    'Fleet Data': 'بيانات الأسطول',
    'Upload .csv template': 'رفع قالب .csv',
    'Template': 'قالب',
    'Browse File': 'تصفح الملف',
    'Company Profile Settings': 'إعدادات ملف الشركة',
    'Company Name': 'اسم الشركة',
    'Base Currency': 'العملة الأساسية',
    'Save Changes': 'حفظ التغييرات',
    'Add Revenue': 'إضافة إيراد',
    'Add Expense': 'إضافة مصروف',
    'Add Fuel Record': 'إضافة سجل وقود',
    'Add Employee Salary': 'إضافة راتب موظف',
    'Amount': 'المبلغ',
    'Category': 'الفئة',
    'Select category': 'اختر الفئة',
    'Service Revenue': 'إيرادات الخدمات',
    'Product Sales': 'مبيعات المنتجات',
    'Other Income': 'إيرادات أخرى',
    'Rent': 'إيجار',
    'Software': 'برمجيات',
    'Marketing': 'تسويق',
    'Utilities': 'مرافق',
    'Office Supplies': 'لوازم مكتبية',
    'Vehicle ID': 'معرف المركبة',
    'Description': 'الوصف',
    '(Employee Name)': '(اسم الموظف)',
    'Date / Month': 'التاريخ / الشهر',
    'Cancel': 'إلغاء',
    'Add': 'إضافة',
    'No Data Available': 'لا توجد بيانات متاحة',
    'It looks like you haven\'t added any data yet. Use the buttons above to manually add entries or go to Data Upload to generate templates.': 'يبدو أنك لم تقم بإضافة أي بيانات بعد. استخدم الأزرار أعلاه لإضافة الإدخالات يدويًا أو انتقل إلى رفع البيانات لإنشاء قوالب.',
    'Go to Data Upload': 'الذهاب إلى رفع البيانات',
    'Settings saved successfully!': 'تم حفظ الإعدادات بنجاح!',
    'Sample data loaded successfully! View dashboards to see the metrics.': 'تم تحميل بيانات العينة بنجاح! اعرض لوحات القيادة لرؤية المقاييس.',
    'Are you sure you want to clear all data?': 'هل أنت متأكد أنك تريد مسح كافة البيانات؟',
    'File is empty or missing data.': 'الملف فارغ أو لا توجد بيانات.',
    'Data uploaded successfully!': 'تم رفع البيانات بنجاح!',
    'Error parsing file. Please ensure it matches the template.': 'خطأ في قراءة الملف. يرجى التأكد من مطابقته للقالب.'
  }
};

// --- Types & Interfaces ---
type PeriodFilter = 'All' | 'This Year' | 'This Quarter' | 'This Month';
type Language = 'en' | 'ar';

interface CompanyProfile {
  name: string;
  currency: string;
}

interface FinancialEntry {
  id: string;
  date: string;
  type: 'Revenue' | 'Expense';
  category: string;
  amount: number;
  description?: string;
}

interface SalesEntry {
  id: string;
  date: string;
  salesRep: string;
  customer: string;
  service: string;
  contractValue: number;
  cost: number;
}

interface FleetEntry {
  id: string;
  date: string;
  vehicleId: string;
  type: 'Fuel' | 'Maintenance';
  cost: number;
  details?: string;
}

interface AppState {
  isAuthenticated: boolean;
  language: Language;
  profile: CompanyProfile;
  financials: FinancialEntry[];
  sales: SalesEntry[];
  fleet: FleetEntry[];
  period: PeriodFilter;
}

// --- Context & State Management ---
const initialState: AppState = {
  isAuthenticated: false,
  language: 'en',
  profile: { name: 'Acme Services Ltd.', currency: 'SAR' },
  financials: [],
  sales: [],
  fleet: [],
  period: 'All',
};

const AppContext = createContext<{
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  t: (key: string) => string;
  formatCurrency: (amount: number) => string;
  formatCompactCurrency: (amount: number) => string;
  addFinancial: (entry: Omit<FinancialEntry, 'id'>) => void;
  addFleet: (entry: Omit<FleetEntry, 'id'>) => void;
}>({
  state: initialState,
  setState: () => {},
  t: (k) => k,
  formatCurrency: () => '',
  formatCompactCurrency: () => '',
  addFinancial: () => {},
  addFleet: () => {},
});

// --- Mock Data Generator ---
const generateMockData = () => {
  const financials: FinancialEntry[] = [];
  const sales: SalesEntry[] = [];
  const fleet: FleetEntry[] = [];
  const reps = ['Alice Smith', 'Bob Jones', 'Charlie Davis', 'Diana Prince'];
  const customers = ['TechCorp', 'MegaBuild', 'City Hospital', 'EduCenter', 'RetailGroup'];
  const services = ['Consulting', 'Installation', 'Maintenance', 'Support'];
  const vehicles = ['VAN-001', 'TRK-002', 'CAR-003', 'VAN-004'];
  const expenseCategories = ['Salaries', 'Rent', 'Software', 'Marketing', 'Utilities', 'Office Supplies'];

  const now = new Date();
  for (let i = 0; i < 300; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
    const dateStr = date.toISOString().split('T')[0];
    
    // Financials
    if (i < 150) {
      const isRev = Math.random() > 0.4;
      financials.push({
        id: `fin-${i}`,
        date: dateStr,
        type: isRev ? 'Revenue' : 'Expense',
        category: isRev ? 'Service Revenue' : expenseCategories[Math.floor(Math.random() * expenseCategories.length)],
        amount: Math.floor(Math.random() * (isRev ? 15000 : 5000)) + 500,
      });
    }

    // Sales
    if (i < 100) {
      const contractValue = Math.floor(Math.random() * 20000) + 1000;
      sales.push({
        id: `sal-${i}`,
        date: dateStr,
        salesRep: reps[Math.floor(Math.random() * reps.length)],
        customer: customers[Math.floor(Math.random() * customers.length)],
        service: services[Math.floor(Math.random() * services.length)],
        contractValue,
        cost: contractValue * (Math.random() * 0.4 + 0.2), // 20-60% cost
      });
    }

    // Fleet
    if (i < 120) {
      const isFuel = Math.random() > 0.3;
      fleet.push({
        id: `flt-${i}`,
        date: dateStr,
        vehicleId: vehicles[Math.floor(Math.random() * vehicles.length)],
        type: isFuel ? 'Fuel' : 'Maintenance',
        cost: isFuel ? Math.floor(Math.random() * 150) + 50 : Math.floor(Math.random() * 800) + 100,
      });
    }
  }

  return { financials, sales, fleet };
};

// --- Helper Components ---
const Card = ({ children, title, className = '' }: { children?: React.ReactNode, title?: string, className?: string }) => {
  const { t } = useContext(AppContext);
  return (
    <div className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-6 transition-all duration-300 hover:border-orange-500/50 hover:bg-white/10 ${className}`}>
      {title && <h3 className="text-lg font-semibold text-slate-100 mb-4">{t(title)}</h3>}
      {children}
    </div>
  );
};

const KPICard = ({ title, value, subValue, icon: Icon, trend = 'neutral' }: any) => {
  const { t } = useContext(AppContext);
  const trendColor = trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-rose-400' : 'text-slate-400';
  const bgColor = trend === 'up' ? 'bg-emerald-400/10' : trend === 'down' ? 'bg-rose-400/10' : 'bg-slate-400/10';
  
  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-xl flex items-center gap-4 transition-all duration-300 hover:border-orange-500 hover:bg-white/10 group">
      <div className={`p-3 rounded-xl ${bgColor} text-slate-200 group-hover:text-orange-400 transition-colors duration-300`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-400 group-hover:text-slate-300">{t(title)}</p>
        <h4 className="text-2xl font-bold text-white tracking-tight">{value}</h4>
        {subValue && <p className={`text-sm mt-1 ${trendColor}`}>{subValue}</p>}
      </div>
    </div>
  );
};

// --- Recharts Theme Presets ---
const chartDarkTheme = {
  contentStyle: { backgroundColor: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(12px)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '0.75rem', color: '#f1f5f9' },
  itemStyle: { color: '#f1f5f9' },
  cursor: { fill: 'rgba(255,255,255,0.05)' },
  grid: { stroke: 'rgba(255,255,255,0.05)' },
  tick: { fill: '#94a3b8', fontSize: 12 }
};

// Wraps Recharts components to force LTR so SVG coordinates don't break in RTL mode,
// while allowing the rest of the app to remain RTL.
const ChartWrapper = ({ children }: { children?: React.ReactNode }) => (
  <div dir="ltr" className="w-full h-full">
    {children}
  </div>
);

// --- Dashboard Views ---
const OverviewDashboard = () => {
  const { state, t, formatCurrency, formatCompactCurrency } = useContext(AppContext);
  const { financials } = state;

  const { metrics, chartData, expensePie } = useMemo(() => {
    let rev = 0, exp = 0;
    const monthly: Record<string, { name: string, Revenue: number, Expenses: number, Profit: number }> = {};
    const expCategory: Record<string, number> = {};

    financials.forEach(f => {
      const amt = f.amount;
      const month = f.date.substring(0, 7); 
      
      if (!monthly[month]) monthly[month] = { name: month, Revenue: 0, Expenses: 0, Profit: 0 };
      
      if (f.type === 'Revenue') {
        rev += amt;
        monthly[month].Revenue += amt;
      } else {
        exp += amt;
        monthly[month].Expenses += amt;
        expCategory[f.category] = (expCategory[f.category] || 0) + amt;
      }
      monthly[month].Profit = monthly[month].Revenue - monthly[month].Expenses;
    });

    const profit = rev - exp;
    const margin = rev > 0 ? (profit / rev) * 100 : 0;
    
    const chartData = Object.values(monthly).sort((a, b) => a.name.localeCompare(b.name));
    const expensePie = Object.entries(expCategory).map(([name, value]) => ({ name: t(name), value })).sort((a,b) => b.value - a.value);

    return { metrics: { rev, exp, profit, margin }, chartData, expensePie };
  }, [financials, t]);

  const COLORS = ['#6366f1', '#10b981', '#f43f5e', '#f97316', '#8b5cf6', '#0ea5e9'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard title="Total Revenue" value={formatCurrency(metrics.rev)} icon={TrendingUp} trend="up" />
        <KPICard title="Total Expenses" value={formatCurrency(metrics.exp)} icon={Activity} trend="down" />
        <KPICard title="Net Profit" value={formatCurrency(metrics.profit)} icon={DollarSign} trend={metrics.profit >= 0 ? 'up' : 'down'} />
        <KPICard title="Profit Margin" value={`${metrics.margin.toFixed(1)}%`} icon={Percent} trend={metrics.margin >= 20 ? 'up' : 'neutral'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Financial Performance Trend" className="lg:col-span-2 h-96">
          <ChartWrapper>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartDarkTheme.grid.stroke} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={chartDarkTheme.tick} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tickFormatter={formatCompactCurrency} tick={chartDarkTheme.tick} width={80} />
                <RechartsTooltip formatter={(val: number, name: string) => [formatCurrency(val), t(name)]} cursor={chartDarkTheme.cursor} contentStyle={chartDarkTheme.contentStyle} itemStyle={chartDarkTheme.itemStyle} />
                <Legend formatter={(value) => t(value)} wrapperStyle={{ color: '#cbd5e1' }}/>
                <Bar yAxisId="left" dataKey="Revenue" name="Revenue" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar yAxisId="left" dataKey="Expenses" name="Expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={20} />
                <Line yAxisId="left" type="monotone" dataKey="Profit" name="Net Profit" stroke="#f97316" strokeWidth={3} dot={{r: 4, fill: '#0f111a', strokeWidth: 2}} activeDot={{r: 6, fill: '#f97316'}} />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartWrapper>
        </Card>

        <Card title="Expenses Breakdown" className="h-96">
          <ChartWrapper>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={expensePie} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                  {expensePie.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <RechartsTooltip formatter={(val: number) => formatCurrency(val)} contentStyle={chartDarkTheme.contentStyle} itemStyle={chartDarkTheme.itemStyle} />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: '#cbd5e1' }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartWrapper>
        </Card>
      </div>
    </div>
  );
};

const SalesDashboard = () => {
  const { state, t, formatCurrency, formatCompactCurrency } = useContext(AppContext);
  const { sales } = state;

  const { metrics, repData, tableData } = useMemo(() => {
    let totalSales = 0;
    const reps: Record<string, { name: string, Sales: number, Profit: number, Deals: number }> = {};

    sales.forEach(s => {
      totalSales += s.contractValue;
      if (!reps[s.salesRep]) reps[s.salesRep] = { name: s.salesRep, Sales: 0, Profit: 0, Deals: 0 };
      reps[s.salesRep].Sales += s.contractValue;
      reps[s.salesRep].Profit += (s.contractValue - s.cost);
      reps[s.salesRep].Deals += 1;
    });

    const repData = Object.values(reps).sort((a, b) => b.Sales - a.Sales);
    const avgDeal = sales.length > 0 ? totalSales / sales.length : 0;
    
    const tableData = [...sales].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);

    return { metrics: { totalSales, deals: sales.length, avgDeal }, repData, tableData };
  }, [sales]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KPICard title="Total Sales" value={formatCurrency(metrics.totalSales)} icon={DollarSign} trend="up" />
        <KPICard title="Total Deals Closed" value={metrics.deals.toString()} icon={CheckCircle2} />
        <KPICard title="Average Deal Size" value={formatCurrency(metrics.avgDeal)} icon={Users} />
      </div>

      <Card title="Sales by Representative" className="h-96">
        <ChartWrapper>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={repData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartDarkTheme.grid.stroke} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={chartDarkTheme.tick} />
              <YAxis axisLine={false} tickLine={false} tickFormatter={formatCompactCurrency} tick={chartDarkTheme.tick} width={80} />
              <RechartsTooltip formatter={(val: number, name: string) => [formatCurrency(val), t(name === 'Sales' ? 'Total Sales' : 'Net Profit')]} cursor={chartDarkTheme.cursor} contentStyle={chartDarkTheme.contentStyle} itemStyle={chartDarkTheme.itemStyle} />
              <Legend formatter={(value) => t(value === 'Sales' ? 'Total Sales' : 'Net Profit')} wrapperStyle={{ color: '#cbd5e1' }} />
              <Bar dataKey="Sales" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={60} />
              <Bar dataKey="Profit" fill="#f97316" radius={[4, 4, 0, 0]} maxBarSize={60} />
            </BarChart>
          </ResponsiveContainer>
        </ChartWrapper>
      </Card>

      <Card title="Recent Sales Transactions" className="overflow-x-auto p-0 border-none bg-transparent shadow-none">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
          <table className="min-w-full text-sm text-start text-slate-400">
            <thead className="text-xs text-slate-300 uppercase bg-black/20 border-b border-white/10 text-start">
              <tr>
                <th className="px-6 py-4">{t('Date')}</th>
                <th className="px-6 py-4">{t('Sales Rep')}</th>
                <th className="px-6 py-4">{t('Customer')}</th>
                <th className="px-6 py-4">{t('Service')}</th>
                <th className={`px-6 py-4 ${state.language === 'ar' ? 'text-left' : 'text-right'}`}>{t('Value')}</th>
                <th className={`px-6 py-4 ${state.language === 'ar' ? 'text-left' : 'text-right'}`}>{t('Profit Margin')}</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map(row => {
                const margin = ((row.contractValue - row.cost) / row.contractValue) * 100;
                return (
                  <tr key={row.id} className="border-b border-white/5 hover:bg-orange-500/10 transition-colors text-start">
                    <td className="px-6 py-4">{row.date}</td>
                    <td className="px-6 py-4 font-medium text-slate-200">{row.salesRep}</td>
                    <td className="px-6 py-4">{row.customer}</td>
                    <td className="px-6 py-4 text-slate-500">{t(row.service)}</td>
                    <td className={`px-6 py-4 font-medium text-emerald-400 ${state.language === 'ar' ? 'text-left' : 'text-right'}`}>{formatCurrency(row.contractValue)}</td>
                    <td className={`px-6 py-4 ${state.language === 'ar' ? 'text-left' : 'text-right'}`}>
                      <span className={`px-2 py-1 rounded text-xs font-medium inline-block ${margin >= 20 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-orange-500/20 text-orange-300'}`}>
                        {margin.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                )
              })}
              {tableData.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">{t('No recent sales found.')}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

const Top10Dashboard = () => {
  const { state, t, formatCurrency, formatCompactCurrency } = useContext(AppContext);
  const { sales, financials } = state;

  const { topCustomers, topExpenses } = useMemo(() => {
    const custMap: Record<string, number> = {};
    sales.forEach(s => { custMap[s.customer] = (custMap[s.customer] || 0) + s.contractValue; });
    const topCustomers = Object.entries(custMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value).slice(0, 10);

    const expMap: Record<string, number> = {};
    financials.filter(f => f.type === 'Expense').forEach(f => {
      expMap[f.category] = (expMap[f.category] || 0) + f.amount;
    });
    const topExpenses = Object.entries(expMap)
      .map(([name, value]) => ({ name: t(name), value }))
      .sort((a, b) => b.value - a.value).slice(0, 10);

    return { topCustomers, topExpenses };
  }, [sales, financials, t]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card title="Top 10 Customers (Revenue)" className="h-[500px]">
        <ChartWrapper>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topCustomers} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={chartDarkTheme.grid.stroke} />
              <XAxis type="number" axisLine={false} tickLine={false} tickFormatter={formatCompactCurrency} tick={chartDarkTheme.tick} />
              <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={100} tick={chartDarkTheme.tick} />
              <RechartsTooltip formatter={(val: number) => [formatCurrency(val), t('Revenue')]} cursor={chartDarkTheme.cursor} contentStyle={chartDarkTheme.contentStyle} itemStyle={chartDarkTheme.itemStyle} />
              <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} barSize={24} name={t('Revenue')} />
            </BarChart>
          </ResponsiveContainer>
        </ChartWrapper>
      </Card>

      <Card title="Top 10 Expense Categories" className="h-[500px]">
        <ChartWrapper>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topExpenses} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={chartDarkTheme.grid.stroke} />
              <XAxis type="number" axisLine={false} tickLine={false} tickFormatter={formatCompactCurrency} tick={chartDarkTheme.tick} />
              <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={100} tick={chartDarkTheme.tick} />
              <RechartsTooltip formatter={(val: number) => [formatCurrency(val), t('Expense')]} cursor={chartDarkTheme.cursor} contentStyle={chartDarkTheme.contentStyle} itemStyle={chartDarkTheme.itemStyle} />
              <Bar dataKey="value" fill="#f43f5e" radius={[0, 4, 4, 0]} barSize={24} name={t('Expense')} />
            </BarChart>
          </ResponsiveContainer>
        </ChartWrapper>
      </Card>
    </div>
  );
};

const FleetDashboard = () => {
  const { state, t, formatCurrency, formatCompactCurrency } = useContext(AppContext);
  const { fleet } = state;

  const { metrics, vehicleData, trendData } = useMemo(() => {
    let fuel = 0, maint = 0;
    const vMap: Record<string, { name: string, Fuel: number, Maintenance: number, Total: number }> = {};
    const tMap: Record<string, { name: string, Fuel: number, Maintenance: number }> = {};

    fleet.forEach(f => {
      const month = f.date.substring(0, 7);
      if (f.type === 'Fuel') fuel += f.cost;
      else maint += f.cost;

      if (!vMap[f.vehicleId]) vMap[f.vehicleId] = { name: f.vehicleId, Fuel: 0, Maintenance: 0, Total: 0 };
      vMap[f.vehicleId][f.type] += f.cost;
      vMap[f.vehicleId].Total += f.cost;

      if (!tMap[month]) tMap[month] = { name: month, Fuel: 0, Maintenance: 0 };
      tMap[month][f.type] += f.cost;
    });

    const vehicleData = Object.values(vMap).sort((a,b) => b.Total - a.Total);
    const trendData = Object.values(tMap).sort((a,b) => a.name.localeCompare(b.name));
    
    return { metrics: { fuel, maint, total: fuel + maint }, vehicleData, trendData };
  }, [fleet]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KPICard title="Total Fuel Cost" value={formatCurrency(metrics.fuel)} icon={Truck} />
        <KPICard title="Total Maintenance" value={formatCurrency(metrics.maint)} icon={AlertCircle} />
        <KPICard title="Total Operating Cost" value={formatCurrency(metrics.total)} icon={Car} trend="down" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Operating Cost by Vehicle" className="h-96">
          <ChartWrapper>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={vehicleData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartDarkTheme.grid.stroke} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={chartDarkTheme.tick} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={formatCompactCurrency} tick={chartDarkTheme.tick} width={80} />
                <RechartsTooltip formatter={(val: number, name: string) => [formatCurrency(val), t(name)]} cursor={chartDarkTheme.cursor} contentStyle={chartDarkTheme.contentStyle} itemStyle={chartDarkTheme.itemStyle} />
                <Legend formatter={(value) => t(value)} wrapperStyle={{ color: '#cbd5e1' }} />
                <Bar dataKey="Fuel" name="Fuel" stackId="a" fill="#0ea5e9" radius={[0, 0, 0, 0]} maxBarSize={50} />
                <Bar dataKey="Maintenance" name="Maintenance" stackId="a" fill="#f97316" radius={[4, 4, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </ChartWrapper>
        </Card>

        <Card title="Monthly Fleet Cost Trend" className="h-96">
          <ChartWrapper>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartDarkTheme.grid.stroke} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={chartDarkTheme.tick} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={formatCompactCurrency} tick={chartDarkTheme.tick} width={80} />
                <RechartsTooltip formatter={(val: number, name: string) => [formatCurrency(val), t(name)]} contentStyle={chartDarkTheme.contentStyle} itemStyle={chartDarkTheme.itemStyle} />
                <Legend formatter={(value) => t(value)} wrapperStyle={{ color: '#cbd5e1' }} />
                <Line type="monotone" dataKey="Fuel" name="Fuel" stroke="#0ea5e9" strokeWidth={3} dot={{r: 3, fill: '#0ea5e9'}} activeDot={{r: 5, fill: '#f97316'}} />
                <Line type="monotone" dataKey="Maintenance" name="Maintenance" stroke="#f97316" strokeWidth={3} dot={{r: 3, fill: '#f97316'}} />
              </LineChart>
            </ResponsiveContainer>
          </ChartWrapper>
        </Card>
      </div>
    </div>
  );
};

const DataUploadDashboard = () => {
  const { setState, t } = useContext(AppContext);

  const handleLoadSample = () => {
    const mock = generateMockData();
    setState(prev => ({ ...prev, financials: mock.financials, sales: mock.sales, fleet: mock.fleet }));
    alert(t('Sample data loaded successfully! View dashboards to see the metrics.'));
  };

  const handleClearData = () => {
    if (confirm(t('Are you sure you want to clear all data?'))) {
      setState(prev => ({ ...prev, financials: [], sales: [], fleet: [] }));
    }
  };

  const downloadTemplate = (type: 'financials' | 'sales' | 'fleet') => {
    let headers: string[] = [];
    if(type === 'financials') headers = ['Date', 'Type (Revenue/Expense)', 'Category', 'Amount', 'Description'];
    if(type === 'sales') headers = ['Date', 'SalesRep', 'Customer', 'Service', 'ContractValue', 'Cost'];
    if(type === 'fleet') headers = ['Date', 'VehicleId', 'Type (Fuel/Maintenance)', 'Cost', 'Details'];

    const csv = headers.join(',') + '\n';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}_template.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'financials' | 'sales' | 'fleet') => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) return;

      const lines = text.split('\n').map(line => line.trim()).filter(line => line);
      if (lines.length <= 1) {
        alert(t('File is empty or missing data.'));
        return;
      }

      // Helper to correctly parse CSV line, ignoring commas inside quotes
      const parseRow = (row: string) => row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(s => s.replace(/^"|"$/g, '').trim());
      const dataRows = lines.slice(1);

      try {
        if (type === 'financials') {
          const parsed: FinancialEntry[] = dataRows.map((row, i) => {
            const cols = parseRow(row);
            return {
              id: `csv-fin-${Date.now()}-${i}`,
              date: cols[0] || new Date().toISOString().split('T')[0],
              type: (cols[1] || 'Expense') as 'Revenue' | 'Expense',
              category: cols[2] || 'General',
              amount: parseFloat(cols[3] || '0'),
              description: cols[4] || ''
            };
          });
          setState(prev => ({ ...prev, financials: [...parsed, ...prev.financials] }));
        } else if (type === 'sales') {
          const parsed: SalesEntry[] = dataRows.map((row, i) => {
            const cols = parseRow(row);
            return {
              id: `csv-sal-${Date.now()}-${i}`,
              date: cols[0] || new Date().toISOString().split('T')[0],
              salesRep: cols[1] || 'Unknown Rep',
              customer: cols[2] || 'Unknown Customer',
              service: cols[3] || 'General Service',
              contractValue: parseFloat(cols[4] || '0'),
              cost: parseFloat(cols[5] || '0')
            };
          });
          setState(prev => ({ ...prev, sales: [...parsed, ...prev.sales] }));
        } else if (type === 'fleet') {
          const parsed: FleetEntry[] = dataRows.map((row, i) => {
            const cols = parseRow(row);
            return {
              id: `csv-flt-${Date.now()}-${i}`,
              date: cols[0] || new Date().toISOString().split('T')[0],
              vehicleId: cols[1] || 'Unknown Vehicle',
              type: (cols[2] || 'Maintenance') as 'Fuel' | 'Maintenance',
              cost: parseFloat(cols[3] || '0'),
              details: cols[4] || ''
            };
          });
          setState(prev => ({ ...prev, fleet: [...parsed, ...prev.fleet] }));
        }
        alert(t('Data uploaded successfully!'));
      } catch (error) {
        console.error(error);
        alert(t('Error parsing file. Please ensure it matches the template.'));
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset input to allow re-uploading the same file if needed
  };

  return (
    <div className="max-w-4xl space-y-6">
      <Card title="Data Management Hub">
        <p className="text-slate-400 mb-6">
          {t('Download CSV templates to fill out your own data, or instantly populate the system with robust mock data for demonstration.')}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <button 
            onClick={handleLoadSample}
            className="flex items-center justify-center gap-2 w-full py-4 px-6 bg-indigo-600/80 hover:bg-orange-500 text-white rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-orange-500/25 border border-transparent hover:border-orange-400"
          >
            <UploadCloud className="w-5 h-5" />
            <span>{t('Generate Sample Data')}</span>
          </button>
          
          <button 
            onClick={handleClearData}
            className="flex items-center justify-center gap-2 w-full py-4 px-6 bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500 hover:text-white rounded-xl font-medium transition-all duration-300"
          >
            <AlertCircle className="w-5 h-5" />
            <span>{t('Clear All Data')}</span>
          </button>
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold text-slate-200">{t('Manual File Upload & Templates')}</h4>
          {['Financials', 'Sales', 'Fleet'].map((type) => (
            <div key={type} className="border border-white/10 bg-black/20 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between hover:border-orange-500/50 transition-colors group">
              <div className="flex items-center gap-4 mb-4 sm:mb-0">
                <div className="p-3 bg-white/5 rounded-xl text-slate-300 group-hover:text-orange-400 transition-colors">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-medium text-slate-200">{t(`${type} Data`)}</p>
                  <p className="text-sm text-slate-500">{t('Upload .csv template')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => downloadTemplate(type.toLowerCase() as any)}
                  className="flex items-center gap-2 text-sm text-slate-300 hover:text-orange-400 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>{t('Template')}</span>
                </button>
                <label className="cursor-pointer bg-white/10 hover:bg-orange-500 hover:text-white text-slate-200 py-2 px-4 rounded-lg font-medium border border-white/10 hover:border-orange-400 transition-all text-sm">
                  {t('Browse File')}
                  <input type="file" className="hidden" accept=".csv" onChange={(e) => handleFileUpload(e, type.toLowerCase() as any)} />
                </label>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

const SettingsDashboard = () => {
  const { state, setState, t } = useContext(AppContext);
  const [name, setName] = useState(state.profile.name);
  const [currency, setCurrency] = useState(state.profile.currency);

  const handleSave = () => {
    setState(prev => ({ ...prev, profile: { name, currency } }));
    alert(t('Settings saved successfully!'));
  };

  return (
    <Card title="Company Profile Settings" className="max-w-2xl">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">{t('Company Name')}</label>
          <input 
            type="text" value={name} onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none text-white transition-all placeholder-slate-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">{t('Base Currency')}</label>
          <select 
            value={currency} onChange={(e) => setCurrency(e.target.value)}
            className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none text-white transition-all appearance-none"
            dir="ltr"
          >
            <option value="SAR" className="bg-slate-900">SAR (SR)</option>
            <option value="USD" className="bg-slate-900">USD ($)</option>
            <option value="EUR" className="bg-slate-900">EUR (€)</option>
            <option value="GBP" className="bg-slate-900">GBP (£)</option>
          </select>
        </div>
        <button 
          onClick={handleSave}
          className="px-6 py-3 bg-indigo-600/80 hover:bg-orange-500 text-white rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-orange-500/25 border border-transparent hover:border-orange-400"
        >
          {t('Save Changes')}
        </button>
      </div>
    </Card>
  );
};

// --- Modals for Manual Entry ---
const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children?: React.ReactNode }) => {
  const { t } = useContext(AppContext);
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)]">
        <div className="flex justify-between items-center p-6 border-b border-white/10">
          <h3 className="text-xl font-semibold text-white">{t(title)}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-orange-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

// --- Main App & Layout ---
const App = () => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('appState');
    if (saved) {
      const parsed = JSON.parse(saved);
      if(!parsed.language) parsed.language = 'en'; // migration
      return parsed;
    }
    return initialState;
  });

  const [activeTab, setActiveTab] = useState('Overview');
  const [activeModal, setActiveModal] = useState<'revenue' | 'expense' | 'fuel' | 'employee' | null>(null);

  useEffect(() => {
    localStorage.setItem('appState', JSON.stringify(state));
    document.documentElement.dir = state.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = state.language;
  }, [state]);

  const t = (key: string) => {
    if (state.language === 'en') return key;
    return translations.ar[key] || key;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(state.language === 'ar' ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: state.profile.currency,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatCompactCurrency = (amount: number) => {
    return new Intl.NumberFormat(state.language === 'ar' ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: state.profile.currency,
      maximumFractionDigits: 0,
      notation: 'compact',
      compactDisplay: 'short'
    }).format(amount);
  };

  const addFinancial = (entry: Omit<FinancialEntry, 'id'>) => {
    const newEntry = { ...entry, id: `man-fin-${Date.now()}` };
    setState(prev => ({ ...prev, financials: [newEntry, ...prev.financials] }));
    setActiveModal(null);
  };

  const addFleet = (entry: Omit<FleetEntry, 'id'>) => {
    const newEntry = { ...entry, id: `man-flt-${Date.now()}` };
    setState(prev => ({ ...prev, fleet: [newEntry, ...prev.fleet] }));
    setActiveModal(null);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setState(prev => ({ ...prev, isAuthenticated: true }));
  };

  const handleLogout = () => {
    setState(prev => ({ ...prev, isAuthenticated: false }));
  };

  const toggleLanguage = () => {
    setState(prev => ({ ...prev, language: prev.language === 'ar' ? 'en' : 'ar' }));
  };

  if (!state.isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0f111a] flex items-center justify-center p-4 relative overflow-hidden" dir={state.language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-orange-600/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="absolute top-4 end-4">
          <button onClick={toggleLanguage} className="flex items-center gap-2 text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl transition-colors border border-white/10">
            <Globe className="w-5 h-5" />
            <span>{state.language === 'ar' ? 'English' : 'عربي'}</span>
          </button>
        </div>

        <div className="bg-white/5 backdrop-blur-2xl max-w-md w-full p-8 rounded-3xl shadow-2xl border border-white/10 z-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 mb-6 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
              <Activity className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">{t('Performance Portal')}</h1>
            <p className="text-slate-400 mt-2">{t('Sign in to your secure dashboard')}</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">{t('Admin Username')}</label>
              <input type="text" required className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none text-white transition-all" placeholder="admin" dir="ltr" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">{t('Password')}</label>
              <input type="password" required className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none text-white transition-all" placeholder="••••••••" dir="ltr" />
            </div>
            <button type="submit" className="w-full bg-indigo-600 hover:bg-orange-500 text-white py-3.5 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-orange-500/30 border border-transparent hover:border-orange-400 mt-4">
              {t('Access Dashboard')}
            </button>
          </form>
          <div className="mt-8 text-center text-sm text-slate-500">
            {t('For MVP demo, any credentials will work.')}
          </div>
        </div>
      </div>
    );
  }

  const navItems = [
    { id: 'Overview', icon: LayoutDashboard, label: 'Overview' },
    { id: 'Sales', icon: TrendingUp, label: 'Sales Performance' },
    { id: 'Top10', icon: Award, label: 'Top 10 Rankings' },
    { id: 'Fleet', icon: Truck, label: 'Fleet & Operations' },
    { id: 'Upload', icon: UploadCloud, label: 'Data Upload' },
    { id: 'Settings', icon: Settings, label: 'Settings' },
  ];

  const ModalFormContent = ({ type }: { type: 'revenue' | 'expense' | 'fuel' | 'employee' }) => {
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [desc, setDesc] = useState('');
    const [date, setDate] = useState('');
    const [vehicleId, setVehicleId] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const numAmount = parseFloat(amount);
      if(!date || isNaN(numAmount)) return;

      if(type === 'revenue' || type === 'expense' || type === 'employee') {
        addFinancial({
          type: type === 'revenue' ? 'Revenue' : 'Expense',
          amount: numAmount,
          category: type === 'employee' ? 'Salaries' : (category || 'General'),
          description: desc,
          date
        });
      } else if (type === 'fuel') {
        addFleet({
          type: 'Fuel',
          cost: numAmount,
          vehicleId: vehicleId || 'UNKNOWN',
          date
        });
      }
    };

    const inputClasses = "w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none text-white transition-all mb-4";
    const labelClasses = "block text-sm font-medium text-slate-300 mb-2";

    return (
      <form onSubmit={handleSubmit}>
        <div>
          <label className={labelClasses}>{t('Amount')} ({state.profile.currency})</label>
          <input type="number" step="0.01" required value={amount} onChange={e => setAmount(e.target.value)} className={inputClasses} dir="ltr" />
        </div>

        {type !== 'fuel' && type !== 'employee' && (
          <div>
            <label className={labelClasses}>{t('Category')}</label>
            <select required value={category} onChange={e => setCategory(e.target.value)} className={`${inputClasses} appearance-none`}>
              <option value="" disabled className="bg-slate-900">{t('Select category')}</option>
              {type === 'revenue' ? (
                <>
                  <option value="Service Revenue" className="bg-slate-900">{t('Service Revenue')}</option>
                  <option value="Product Sales" className="bg-slate-900">{t('Product Sales')}</option>
                  <option value="Other Income" className="bg-slate-900">{t('Other Income')}</option>
                </>
              ) : (
                <>
                  <option value="Rent" className="bg-slate-900">{t('Rent')}</option>
                  <option value="Software" className="bg-slate-900">{t('Software')}</option>
                  <option value="Marketing" className="bg-slate-900">{t('Marketing')}</option>
                  <option value="Utilities" className="bg-slate-900">{t('Utilities')}</option>
                  <option value="Office Supplies" className="bg-slate-900">{t('Office Supplies')}</option>
                </>
              )}
            </select>
          </div>
        )}

        {type === 'fuel' && (
          <div>
            <label className={labelClasses}>{t('Vehicle ID')}</label>
            <input type="text" required value={vehicleId} onChange={e => setVehicleId(e.target.value)} className={inputClasses} placeholder={t('e.g. VAN-001')} dir="ltr" />
          </div>
        )}

        {type !== 'fuel' && (
          <div>
            <label className={labelClasses}>{t('Description')} {type==='employee' && t('(Employee Name)')}</label>
            <input type="text" value={desc} onChange={e => setDesc(e.target.value)} className={inputClasses} placeholder={type==='employee' ? t('e.g. John Doe Salary') : ''} />
          </div>
        )}

        <div>
          <label className={labelClasses}>{t('Date / Month')}</label>
          <input type="date" required value={date} onChange={e => setDate(e.target.value)} className={inputClasses} dir="ltr" />
        </div>

        <div className="flex gap-3 mt-6">
          <button type="button" onClick={() => setActiveModal(null)} className="flex-1 py-3 px-4 bg-white/5 border border-white/10 text-slate-300 rounded-xl hover:bg-white/10 hover:text-white transition-colors">
            {t('Cancel')}
          </button>
          <button type="submit" className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-orange-500 text-white rounded-xl font-medium transition-all duration-300 border border-transparent hover:border-orange-400">
            {t('Add')}
          </button>
        </div>
      </form>
    );
  };

  return (
    <AppContext.Provider value={{ state, setState, t, formatCurrency, formatCompactCurrency, addFinancial, addFleet }}>
      <div className="min-h-screen bg-[#0f111a] text-slate-200 flex flex-col md:flex-row font-sans relative overflow-hidden" dir={state.language === 'ar' ? 'rtl' : 'ltr'}>
        
        {/* Ambient background blurs for glassmorphism */}
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none z-0" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-orange-600/10 rounded-full blur-[150px] pointer-events-none z-0" />

        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-white/5 backdrop-blur-2xl border-e border-white/10 flex flex-col z-20 md:min-h-screen flex-shrink-0 relative">
          <div className="p-6 pb-4 border-b border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-indigo-500/20 border border-indigo-500/30 rounded-xl text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                <Activity className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-white truncate tracking-tight">{state.profile.name}</h2>
            </div>
          </div>
          <nav className="flex-1 py-6 space-y-2 px-4 overflow-y-auto">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 font-medium ${isActive ? 'bg-orange-500 text-white shadow-[0_0_20px_rgba(249,115,22,0.3)] border border-orange-400/50' : 'text-slate-400 hover:bg-white/10 hover:text-orange-400 hover:border-white/10 border border-transparent'}`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="truncate">{t(item.label)}</span>
                </button>
              )
            })}
          </nav>
          <div className="p-4 border-t border-white/10 space-y-2">
            <button onClick={toggleLanguage} className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl w-full text-slate-300 bg-black/20 hover:text-white hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all duration-300">
              <Globe className="w-4 h-4" />
              <span>{state.language === 'ar' ? 'Switch to English' : 'التبديل للعربية'}</span>
            </button>
            <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30 transition-all duration-300">
              <LogOut className="w-5 h-5 flex-shrink-0" />
              <span>{t('Sign Out')}</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden z-10 relative">
          
          {/* Header */}
          <header className="bg-white/5 backdrop-blur-xl border-b border-white/10 px-8 py-5 flex flex-col xl:flex-row items-start xl:items-center justify-between sticky top-0 z-30">
            <div className="mb-4 xl:mb-0">
              <h1 className="text-2xl font-bold text-white tracking-tight">{t(navItems.find(i => i.id === activeTab)?.label || '')}</h1>
              <p className="text-sm text-slate-400 mt-1">
                {activeTab === 'Upload' || activeTab === 'Settings' 
                  ? t('Manage your system parameters') 
                  : `${t('Performance metrics for')} ${state.profile.name}`
                }
              </p>
            </div>
            
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
              {/* Action Buttons */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 w-full lg:w-auto">
                <button onClick={() => setActiveModal('revenue')} className="flex items-center whitespace-nowrap px-4 py-2.5 bg-emerald-500 rounded-xl font-medium text-white hover:bg-orange-500 hover:shadow-[0_0_15px_rgba(249,115,22,0.4)] transition-all duration-300 border border-transparent">
                  <Plus className="w-4 h-4 me-1.5" /> {t('Revenue')}
                </button>
                <button onClick={() => setActiveModal('expense')} className="flex items-center whitespace-nowrap px-4 py-2.5 bg-slate-700/60 rounded-xl font-medium text-white hover:bg-orange-500 hover:shadow-[0_0_15px_rgba(249,115,22,0.4)] transition-all duration-300 border border-white/10 hover:border-orange-400">
                  <Plus className="w-4 h-4 me-1.5" /> {t('Expense')}
                </button>
                <button onClick={() => setActiveModal('fuel')} className="flex items-center whitespace-nowrap px-4 py-2.5 bg-slate-700/60 rounded-xl font-medium text-white hover:bg-orange-500 hover:shadow-[0_0_15px_rgba(249,115,22,0.4)] transition-all duration-300 border border-white/10 hover:border-orange-400">
                  <Plus className="w-4 h-4 me-1.5" /> {t('Fuel')}
                </button>
                <button onClick={() => setActiveModal('employee')} className="flex items-center whitespace-nowrap px-4 py-2.5 bg-slate-700/60 rounded-xl font-medium text-white hover:bg-orange-500 hover:shadow-[0_0_15px_rgba(249,115,22,0.4)] transition-all duration-300 border border-white/10 hover:border-orange-400">
                  <Plus className="w-4 h-4 me-1.5" /> {t('Employee')}
                </button>
              </div>

              {!['Upload', 'Settings'].includes(activeTab) && (
                <div className="flex items-center bg-black/20 border border-white/10 rounded-xl p-1">
                  {['All', 'This Year', 'This Quarter', 'This Month'].map(p => (
                    <button 
                      key={p} 
                      onClick={() => setState(prev => ({...prev, period: p as PeriodFilter}))}
                      className={`px-3 sm:px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 whitespace-nowrap ${state.period === p ? 'bg-orange-500 text-white shadow-[0_0_10px_rgba(249,115,22,0.3)]' : 'text-slate-400 hover:text-orange-400 hover:bg-white/5'}`}
                    >
                      {t(p)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </header>

          {/* Dashboard Area */}
          <div className="flex-1 overflow-y-auto p-8 z-10">
            {state.financials.length === 0 && !['Upload', 'Settings'].includes(activeTab) ? (
              <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto">
                <div className="w-24 h-24 bg-white/5 border border-white/10 text-slate-500 rounded-full flex items-center justify-center mb-6 shadow-xl">
                  <UploadCloud className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{t('No Data Available')}</h3>
                <p className="text-slate-400 mb-8 leading-relaxed">{t("It looks like you haven't added any data yet. Use the buttons above to manually add entries or go to Data Upload to generate templates.")}</p>
                <button 
                  onClick={() => setActiveTab('Upload')}
                  className="px-8 py-3.5 bg-indigo-600/80 text-white rounded-xl font-medium hover:bg-orange-500 transition-all duration-300 shadow-[0_0_20px_rgba(79,70,229,0.2)] hover:shadow-[0_0_20px_rgba(249,115,22,0.4)] border border-transparent hover:border-orange-400"
                >
                  {t('Go to Data Upload')}
                </button>
              </div>
            ) : (
              <div className="animate-in fade-in duration-500">
                {activeTab === 'Overview' && <OverviewDashboard />}
                {activeTab === 'Sales' && <SalesDashboard />}
                {activeTab === 'Top10' && <Top10Dashboard />}
                {activeTab === 'Fleet' && <FleetDashboard />}
                {activeTab === 'Upload' && <DataUploadDashboard />}
                {activeTab === 'Settings' && <SettingsDashboard />}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modals */}
      <Modal isOpen={activeModal === 'revenue'} onClose={() => setActiveModal(null)} title="Add Revenue">
        <ModalFormContent type="revenue" />
      </Modal>
      <Modal isOpen={activeModal === 'expense'} onClose={() => setActiveModal(null)} title="Add Expense">
        <ModalFormContent type="expense" />
      </Modal>
      <Modal isOpen={activeModal === 'fuel'} onClose={() => setActiveModal(null)} title="Add Fuel Record">
        <ModalFormContent type="fuel" />
      </Modal>
      <Modal isOpen={activeModal === 'employee'} onClose={() => setActiveModal(null)} title="Add Employee Salary">
        <ModalFormContent type="employee" />
      </Modal>

    </AppContext.Provider>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
