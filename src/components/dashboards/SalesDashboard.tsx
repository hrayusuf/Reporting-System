import React, { useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Card, KPICard, ChartWrapper, chartDarkTheme } from '../shared/Card';
import { DollarSign, CheckCircle2, Users, Star } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';

export const SalesDashboard = () => {
  const { filteredSales: sales, t, formatCurrency, formatCompactCurrency, language } = useApp();

  const { metrics, repData, tableData } = useMemo(() => {
    let totalSales = 0;
    const reps: Record<string, { name: string; Sales: number; Profit: number; Deals: number }> = {};

    sales.forEach(s => {
      totalSales += s.contract_value;
      if (!reps[s.sales_rep]) reps[s.sales_rep] = { name: s.sales_rep, Sales: 0, Profit: 0, Deals: 0 };
      reps[s.sales_rep].Sales += s.contract_value;
      reps[s.sales_rep].Profit += (s.calculated_profit ?? (s.contract_value - s.cost));
      reps[s.sales_rep].Deals += 1;
    });

    const repData = Object.values(reps).sort((a, b) => b.Sales - a.Sales);
    const avgDeal = sales.length > 0 ? totalSales / sales.length : 0;
    const bestRep = repData[0]?.name || '—';

    const tableData = [...sales]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 15);

    return { metrics: { totalSales, deals: sales.length, avgDeal, bestRep }, repData, tableData };
  }, [sales]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard title="Total Sales" value={formatCurrency(metrics.totalSales)} icon={DollarSign} trend="up" />
        <KPICard title="Total Deals Closed" value={metrics.deals.toString()} icon={CheckCircle2} />
        <KPICard title="Average Deal Size" value={formatCurrency(metrics.avgDeal)} icon={Users} />
        <KPICard title="Best Sales Rep" value={metrics.bestRep} icon={Star} trend="up" />
      </div>

      <Card title="Sales by Representative" className="h-96">
        <ChartWrapper>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={repData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartDarkTheme.grid.stroke} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={chartDarkTheme.tick} />
              <YAxis axisLine={false} tickLine={false} tickFormatter={formatCompactCurrency} tick={chartDarkTheme.tick} width={80} />
              <RechartsTooltip
                formatter={(v: number, n: string) => [formatCurrency(v), n === 'Sales' ? t('Total Sales') : t('Profit')]}
                cursor={chartDarkTheme.cursor}
                contentStyle={chartDarkTheme.contentStyle}
                itemStyle={chartDarkTheme.itemStyle}
              />
              <Legend formatter={v => v === 'Sales' ? t('Total Sales') : t('Profit')} wrapperStyle={{ color: '#cbd5e1' }} />
              <Bar dataKey="Sales" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={60} />
              <Bar dataKey="Profit" fill="#f97316" radius={[4, 4, 0, 0]} maxBarSize={60} />
            </BarChart>
          </ResponsiveContainer>
        </ChartWrapper>
      </Card>

      <Card title="Recent Sales Transactions" className="p-0 border-none bg-transparent shadow-none overflow-x-auto">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
          <table className="min-w-full text-sm text-slate-400">
            <thead className="text-xs text-slate-300 uppercase bg-black/20 border-b border-white/10">
              <tr>
                <th className="px-5 py-4 text-start">{t('Date')}</th>
                <th className="px-5 py-4 text-start">{t('Sales Rep')}</th>
                <th className="px-5 py-4 text-start">{t('Customer')}</th>
                <th className="px-5 py-4 text-start">{t('Service')}</th>
                <th className="px-5 py-4 text-end">{t('Value')}</th>
                <th className="px-5 py-4 text-end">{t('Profit')}</th>
                <th className="px-5 py-4 text-end">{t('Profit Margin')}</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map(row => {
                const profit = row.calculated_profit ?? (row.contract_value - row.cost);
                const margin = row.calculated_margin_percent ?? (row.contract_value > 0 ? (profit / row.contract_value) * 100 : 0);
                return (
                  <tr key={row.id} className="border-b border-white/5 hover:bg-orange-500/10 transition-colors">
                    <td className="px-5 py-4">{row.date}</td>
                    <td className="px-5 py-4 font-medium text-slate-200">{row.sales_rep}</td>
                    <td className="px-5 py-4">{row.customer}</td>
                    <td className="px-5 py-4 text-slate-500">{row.service}</td>
                    <td className="px-5 py-4 text-end font-medium text-emerald-400">{formatCurrency(row.contract_value)}</td>
                    <td className="px-5 py-4 text-end text-slate-300">{formatCurrency(profit)}</td>
                    <td className="px-5 py-4 text-end">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${margin >= 20 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-orange-500/20 text-orange-300'}`}>
                        {margin.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
              {tableData.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-slate-500">{t('No recent sales found.')}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
