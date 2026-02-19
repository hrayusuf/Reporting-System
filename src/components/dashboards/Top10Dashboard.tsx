import React, { useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Card, ChartWrapper, chartDarkTheme } from '../shared/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

export const Top10Dashboard = () => {
  const { filteredSales: sales, filteredFinancials: financials, t, formatCurrency, formatCompactCurrency } = useApp();

  const { topCustomers, topExpenses, totalRevenue, totalExpenses } = useMemo(() => {
    const custMap: Record<string, { revenue: number; deals: number; profit: number }> = {};
    let totalRevenue = 0;
    sales.forEach(s => {
      if (!custMap[s.customer]) custMap[s.customer] = { revenue: 0, deals: 0, profit: 0 };
      custMap[s.customer].revenue += s.contract_value;
      custMap[s.customer].deals += 1;
      custMap[s.customer].profit += (s.calculated_profit ?? (s.contract_value - s.cost));
      totalRevenue += s.contract_value;
    });
    const topCustomers = Object.entries(custMap)
      .map(([name, d]) => ({ name, value: d.revenue, deals: d.deals, profit: d.profit, margin: d.revenue > 0 ? (d.profit / d.revenue) * 100 : 0 }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    const expMap: Record<string, number> = {};
    let totalExpenses = 0;
    financials.filter(f => f.type === 'Expense').forEach(f => {
      expMap[f.category] = (expMap[f.category] || 0) + f.amount;
      totalExpenses += f.amount;
    });
    const topExpenses = Object.entries(expMap)
      .map(([name, value]) => ({ name: t(name), value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    return { topCustomers, topExpenses, totalRevenue, totalExpenses };
  }, [sales, financials, t]);

  return (
    <div className="space-y-4">
      {/* TOP 10 CUSTOMERS */}
      <div className="space-y-4">
        <Card title="Top 10 Customers (Revenue)" className="h-72">
          <ChartWrapper>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topCustomers} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={chartDarkTheme.grid.stroke} />
                <XAxis type="number" axisLine={false} tickLine={false} tickFormatter={formatCompactCurrency} tick={chartDarkTheme.tick} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={90} tick={chartDarkTheme.tick} />
                <RechartsTooltip
                  formatter={(v: number) => [formatCurrency(v), t('Revenue')]}
                  cursor={chartDarkTheme.cursor}
                  contentStyle={chartDarkTheme.contentStyle}
                  itemStyle={chartDarkTheme.itemStyle}
                />
                <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} barSize={22} />
              </BarChart>
            </ResponsiveContainer>
          </ChartWrapper>
        </Card>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
          <table className="min-w-full text-sm text-slate-400">
            <thead className="text-xs text-slate-300 uppercase bg-black/20 border-b border-white/10">
              <tr>
                <th className="px-5 py-3 text-start">#</th>
                <th className="px-5 py-3 text-start">{t('Customer')}</th>
                <th className="px-5 py-3 text-end">Deals</th>
                <th className="px-5 py-3 text-end">{t('Value')}</th>
                <th className="px-5 py-3 text-end">{t('Profit')}</th>
                <th className="px-5 py-3 text-end">{t('Profit Margin')}</th>
                <th className="px-5 py-3 text-end">{t('Contribution %')}</th>
              </tr>
            </thead>
            <tbody>
              {topCustomers.map((row, i) => {
                const contrib = totalRevenue > 0 ? (row.value / totalRevenue) * 100 : 0;
                return (
                  <tr key={row.name} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${i < 3 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/5 text-slate-400'}`}>{i + 1}</span>
                    </td>
                    <td className="px-5 py-3 font-medium text-slate-200">{row.name}</td>
                    <td className="px-5 py-3 text-end">{row.deals}</td>
                    <td className="px-5 py-3 text-end text-emerald-400 font-medium">{formatCurrency(row.value)}</td>
                    <td className="px-5 py-3 text-end">{formatCurrency(row.profit)}</td>
                    <td className="px-5 py-3 text-end">
                      <span className={`px-2 py-0.5 rounded text-xs ${row.margin >= 20 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-orange-500/20 text-orange-300'}`}>
                        {row.margin.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-5 py-3 text-end">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(contrib, 100)}%` }} />
                        </div>
                        <span className="text-xs text-slate-400 w-10 text-end">{contrib.toFixed(1)}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* TOP 10 EXPENSES */}
      <div className="space-y-4">
        <Card title="Top 10 Expense Categories" className="h-72">
          <ChartWrapper>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topExpenses} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={chartDarkTheme.grid.stroke} />
                <XAxis type="number" axisLine={false} tickLine={false} tickFormatter={formatCompactCurrency} tick={chartDarkTheme.tick} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={100} tick={chartDarkTheme.tick} />
                <RechartsTooltip
                  formatter={(v: number) => [formatCurrency(v), t('Expense')]}
                  cursor={chartDarkTheme.cursor}
                  contentStyle={chartDarkTheme.contentStyle}
                  itemStyle={chartDarkTheme.itemStyle}
                />
                <Bar dataKey="value" fill="#f43f5e" radius={[0, 4, 4, 0]} barSize={22} />
              </BarChart>
            </ResponsiveContainer>
          </ChartWrapper>
        </Card>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
          <table className="min-w-full text-sm text-slate-400">
            <thead className="text-xs text-slate-300 uppercase bg-black/20 border-b border-white/10">
              <tr>
                <th className="px-5 py-3 text-start">#</th>
                <th className="px-5 py-3 text-start">Category</th>
                <th className="px-5 py-3 text-end">Total Expense</th>
                <th className="px-5 py-3 text-end">{t('Contribution %')}</th>
              </tr>
            </thead>
            <tbody>
              {topExpenses.map((row, i) => {
                const contrib = totalExpenses > 0 ? (row.value / totalExpenses) * 100 : 0;
                return (
                  <tr key={row.name} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${i < 3 ? 'bg-rose-500/20 text-rose-300' : 'bg-white/5 text-slate-400'}`}>{i + 1}</span>
                    </td>
                    <td className="px-5 py-3 font-medium text-slate-200">{row.name}</td>
                    <td className="px-5 py-3 text-end text-rose-400 font-medium">{formatCurrency(row.value)}</td>
                    <td className="px-5 py-3 text-end">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-rose-500 rounded-full" style={{ width: `${Math.min(contrib, 100)}%` }} />
                        </div>
                        <span className="text-xs text-slate-400 w-10 text-end">{contrib.toFixed(1)}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
