import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { databaseService } from '../../services/database';
import { Card } from '../shared/Card';
import { Loader2 } from 'lucide-react';

export const SettingsDashboard = () => {
  const { profile, setProfile, t, refreshData } = useApp();
  const [name, setName] = useState(profile.name);
  const [currency, setCurrency] = useState(profile.currency);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(profile.name);
    setCurrency(profile.currency);
  }, [profile]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await databaseService.createOrUpdateCompanyProfile({ name, currency });
      setProfile({ name, currency });
      await refreshData();
      alert(t('Settings saved successfully!'));
    } catch (err) {
      console.error(err);
      alert('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card title="Company Profile Settings" className="max-w-2xl">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">{t('Company Name')}</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)}
            className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none text-white transition-all placeholder-slate-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">{t('Base Currency')}</label>
          <select value={currency} onChange={e => setCurrency(e.target.value)} dir="ltr"
            className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none text-white transition-all appearance-none">
            <option value="SAR" className="bg-slate-900">SAR (SR)</option>
            <option value="USD" className="bg-slate-900">USD ($)</option>
            <option value="EUR" className="bg-slate-900">EUR (€)</option>
            <option value="GBP" className="bg-slate-900">GBP (£)</option>
          </select>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="px-6 py-3 bg-indigo-600/80 hover:bg-orange-500 text-white rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-orange-500/25 border border-transparent hover:border-orange-400 disabled:opacity-50 flex items-center gap-2">
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          {saving ? t('Loading...') : t('Save Changes')}
        </button>
      </div>
    </Card>
  );
};
