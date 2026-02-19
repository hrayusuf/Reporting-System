import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useApp } from '../contexts/AppContext';
import {
  LayoutDashboard, TrendingUp, Award, Truck, UploadCloud, Settings, LogOut,
  Plus, Globe, Loader2,
} from 'lucide-react';
import { OverviewDashboard } from './dashboards/OverviewDashboard';
import { SalesDashboard } from './dashboards/SalesDashboard';
import { Top10Dashboard } from './dashboards/Top10Dashboard';
import { FleetDashboard } from './dashboards/FleetDashboard';
import { DataUploadDashboard } from './dashboards/DataUploadDashboard';
import { SettingsDashboard } from './dashboards/SettingsDashboard';
import { AddEntryModal } from './AddEntryModal';

type Tab = 'Overview' | 'Sales' | 'Top10' | 'Fleet' | 'Upload' | 'Settings';

export const DashboardLayout = () => {
  const { language, setLanguage, period, setPeriod, profile, financials, isLoading, t } = useApp();
  const [activeTab, setActiveTab] = useState<Tab>('Overview');
  const [activeModal, setActiveModal] = useState<'revenue' | 'expense' | 'fuel' | 'employee' | null>(null);

  const handleLogout = () => { supabase.auth.signOut(); };
  const toggleLanguage = () => setLanguage(language === 'ar' ? 'en' : 'ar');

  const navItems: { id: Tab; icon: React.ComponentType<{ className?: string }>; label: string }[] = [
    { id: 'Overview', icon: LayoutDashboard, label: 'Overview' },
    { id: 'Sales', icon: TrendingUp, label: 'Sales Performance' },
    { id: 'Top10', icon: Award, label: 'Top 10 Rankings' },
    { id: 'Fleet', icon: Truck, label: 'Fleet & Operations' },
    { id: 'Upload', icon: UploadCloud, label: 'Data Upload' },
    { id: 'Settings', icon: Settings, label: 'Settings' },
  ];

  const isDataTab = !['Upload', 'Settings'].includes(activeTab);

  return (
    <div className="min-h-screen bg-[#0f111a] text-slate-200 flex flex-col md:flex-row font-sans relative overflow-hidden" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-orange-600/10 rounded-full blur-[150px] pointer-events-none z-0" />

      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white/5 backdrop-blur-2xl border-e border-white/10 flex flex-col z-20 md:min-h-screen flex-shrink-0 relative">
        <div className="p-6 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 border border-indigo-500/30 rounded-xl text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
              <LayoutDashboard className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-white truncate tracking-tight">{profile.name}</h2>
          </div>
        </div>

        <nav className="flex-1 py-6 space-y-1 px-4 overflow-y-auto">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button key={item.id} onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 font-medium ${
                  isActive
                    ? 'bg-orange-500 text-white shadow-[0_0_20px_rgba(249,115,22,0.3)] border border-orange-400/50'
                    : 'text-slate-400 hover:bg-white/10 hover:text-orange-400 border border-transparent hover:border-white/10'
                }`}>
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="truncate">{t(item.label)}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-2">
          <button onClick={toggleLanguage} className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl w-full text-slate-300 bg-black/20 hover:text-white hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all duration-300">
            <Globe className="w-4 h-4" />
            <span className="text-sm">{language === 'ar' ? 'Switch to English' : 'التبديل للعربية'}</span>
          </button>
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30 transition-all duration-300">
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{t('Sign Out')}</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden z-10 relative">
        {/* Header */}
        <header className="bg-white/5 backdrop-blur-xl border-b border-white/10 px-6 py-4 flex flex-col xl:flex-row items-start xl:items-center justify-between sticky top-0 z-30 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">{t(navItems.find(i => i.id === activeTab)?.label || '')}</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              {isDataTab ? `${t('Performance metrics for')} ${profile.name}` : t('Manage your system parameters')}
            </p>
          </div>

          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3 w-full xl:w-auto">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
              {[
                { key: 'revenue' as const, label: t('Revenue'), color: 'bg-emerald-500 hover:bg-orange-500' },
                { key: 'expense' as const, label: t('Expense'), color: 'bg-slate-700/60 hover:bg-orange-500 border border-white/10 hover:border-orange-400' },
                { key: 'fuel' as const, label: t('Fuel'), color: 'bg-slate-700/60 hover:bg-orange-500 border border-white/10 hover:border-orange-400' },
                { key: 'employee' as const, label: t('Employee'), color: 'bg-slate-700/60 hover:bg-orange-500 border border-white/10 hover:border-orange-400' },
              ].map(btn => (
                <button key={btn.key} onClick={() => setActiveModal(btn.key)}
                  className={`flex items-center whitespace-nowrap px-4 py-2 ${btn.color} rounded-xl font-medium text-white hover:shadow-[0_0_15px_rgba(249,115,22,0.4)] transition-all duration-300 text-sm`}>
                  <Plus className="w-3.5 h-3.5 me-1.5" />{btn.label}
                </button>
              ))}
            </div>

            {isDataTab && (
              <div className="flex items-center bg-black/20 border border-white/10 rounded-xl p-1 flex-shrink-0">
                {(['All', 'This Year', 'This Quarter', 'This Month'] as const).map(p => (
                  <button key={p} onClick={() => setPeriod(p)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-300 whitespace-nowrap ${
                      period === p ? 'bg-orange-500 text-white shadow-[0_0_10px_rgba(249,115,22,0.3)]' : 'text-slate-400 hover:text-orange-400 hover:bg-white/5'
                    }`}>
                    {t(p)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 z-10">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
            </div>
          ) : financials.length === 0 && isDataTab ? (
            <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto gap-6">
              <div className="w-24 h-24 bg-white/5 border border-white/10 text-slate-500 rounded-full flex items-center justify-center shadow-xl">
                <UploadCloud className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">{t('No Data Available')}</h3>
                <p className="text-slate-400 leading-relaxed">Add entries using the buttons above, or generate sample data to see all dashboards in action.</p>
              </div>
              <button onClick={() => setActiveTab('Upload')}
                className="px-8 py-3.5 bg-indigo-600/80 text-white rounded-xl font-medium hover:bg-orange-500 transition-all duration-300 hover:shadow-[0_0_20px_rgba(249,115,22,0.4)] border border-transparent hover:border-orange-400">
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

      {activeModal && <AddEntryModal type={activeModal} onClose={() => setActiveModal(null)} />}
    </div>
  );
};
