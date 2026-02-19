import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { X, Loader2 } from 'lucide-react';

interface Props {
  type: 'revenue' | 'expense' | 'fuel' | 'employee';
  onClose: () => void;
}

export const AddEntryModal = ({ type, onClose }: Props) => {
  const { addFinancial, addFleet, profile, t } = useApp();
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [desc, setDesc] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [vehicleId, setVehicleId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!date || isNaN(num)) return;
    setLoading(true);
    try {
      if (type === 'revenue' || type === 'expense' || type === 'employee') {
        await addFinancial({
          type: type === 'revenue' ? 'Revenue' : 'Expense',
          amount: num,
          category: type === 'employee' ? 'Salaries' : (category || 'General'),
          description: desc,
          date,
          period_type: 'Month',
        });
      } else {
        await addFleet({ type: 'Fuel', cost: num, vehicle_id: vehicleId || 'UNKNOWN', date });
      }
      onClose();
    } catch (err) {
      console.error(err);
      alert('Error saving entry');
    } finally {
      setLoading(false);
    }
  };

  const ic = "w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none text-white transition-all mb-4";
  const lc = "block text-sm font-medium text-slate-300 mb-2";
  const titles = { revenue: 'Add Revenue', expense: 'Add Expense', fuel: 'Add Fuel Record', employee: 'Add Employee Salary' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)]">
        <div className="flex justify-between items-center p-6 border-b border-white/10">
          <h3 className="text-xl font-semibold text-white">{t(titles[type])}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-orange-400 transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <div>
            <label className={lc}>{t('Amount')} ({profile.currency})</label>
            <input type="number" step="0.01" required value={amount} onChange={e => setAmount(e.target.value)} className={ic} dir="ltr" />
          </div>

          {type !== 'fuel' && type !== 'employee' && (
            <div>
              <label className={lc}>{t('Category')}</label>
              <select required value={category} onChange={e => setCategory(e.target.value)} className={`${ic} appearance-none`}>
                <option value="" disabled className="bg-slate-900">{t('Select category')}</option>
                {type === 'revenue' ? (
                  <>
                    <option value="Service Revenue" className="bg-slate-900">Service Revenue</option>
                    <option value="Product Sales" className="bg-slate-900">Product Sales</option>
                    <option value="Other Income" className="bg-slate-900">Other Income</option>
                  </>
                ) : (
                  <>
                    <option value="Rent" className="bg-slate-900">Rent</option>
                    <option value="Software" className="bg-slate-900">Software</option>
                    <option value="Marketing" className="bg-slate-900">Marketing</option>
                    <option value="Utilities" className="bg-slate-900">Utilities</option>
                    <option value="Salaries" className="bg-slate-900">Salaries</option>
                    <option value="Office Supplies" className="bg-slate-900">Office Supplies</option>
                  </>
                )}
              </select>
            </div>
          )}

          {type === 'fuel' && (
            <div>
              <label className={lc}>{t('Vehicle ID')}</label>
              <input type="text" required value={vehicleId} onChange={e => setVehicleId(e.target.value)} className={ic} placeholder="e.g. VAN-001" dir="ltr" />
            </div>
          )}

          {type !== 'fuel' && (
            <div>
              <label className={lc}>{t('Description')}{type === 'employee' && ' (Employee Name)'}</label>
              <input type="text" value={desc} onChange={e => setDesc(e.target.value)} className={ic} placeholder={type === 'employee' ? 'e.g. John Doe Salary' : ''} />
            </div>
          )}

          <div>
            <label className={lc}>{t('Date / Month')}</label>
            <input type="date" required value={date} onChange={e => setDate(e.target.value)} className={ic} dir="ltr" />
          </div>

          <div className="flex gap-3 mt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 px-4 bg-white/5 border border-white/10 text-slate-300 rounded-xl hover:bg-white/10 transition-colors">{t('Cancel')}</button>
            <button type="submit" disabled={loading} className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-orange-500 text-white rounded-xl font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? t('Loading...') : t('Add')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
