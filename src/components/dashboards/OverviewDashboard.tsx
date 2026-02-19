import React, { useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Card, KPICard, ChartWrapper, chartDarkTheme } from '../shared/Card';
import { TrendingUp, Activity, DollarSign, Percent } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, ComposedChart,
} from 'recharts';

const COLORS = ['#10b981', '#6366f1', '#f97316', '#0ea5e9', '#f43f5e', '#8b5cf6', '#facc15'];

export const OverviewDashboard = () => {
  const { filteredFinancials: financials, t, formatCurrency, formatCompactCurrency } = useApp();

  const { metrics, chartData, expensePie, revPie, plRows } = useMemo(() => {
    let rev = 0, exp = 0;
    const monthly: Record<string, { name: string; Revenue: number; Expenses: number; Profit: number }> = {};
    const expCat: Record<string, number> = {};
    const revCat: Record<string, number> = {};

    financials.forEach(f => {
      const month = f.date.substring(0, 7);
      if (!monthly[month]) monthly[month] = { name: month, Revenue: 0, Expenses: 0, Profit: 0 };
      if (f.type === 'Revenue') {
        rev += f.amount;
        monthly[month].Revenue += f.amount;
        revCat[f.category] = (revCat[f.category] || 0) + f.amount;
      } else {
        exp += f.amount;
        monthly[month].Expenses += f.amount;
        expCat[f.category] = (expCat[f.category] || 0) + f.amount;
      }
      monthly[month].Profit = monthly[month].Revenue - monthly[month].Expenses;
    });

    const profit = rev - exp;
    const margin = rev > 0 ? (profit / rev) * 100 : 0;
    const chartData = Object.values(monthly).sort((a, b) => a.name.localeCompare(b.name));

    const expensePie = Object.entries(expCat)
      .map(([name, value]) => ({ name: t(name), value }))
      .sort((a, b) => b.value - a.value);

    const revPie = Object.entries(revCat)
      .map(([name, value]) => ({ name: t(name), value }))
      .sort((a, b) => b.value - a.value);

    const plRows = [
      { label: 'Total Revenue', value: rev, highlight: 'emerald' as const },
      { label: 'Total Expenses', value: exp, highlight: 'rose' as const },
      { label: 'Net Profit', value: profit, highlight: profit >= 0 ? 'emerald' as const : 'rose' as const },
      { label: 'Profit Margin', value: margin, isPercent: true, highlight: margin >= 20 ? 'emerald' as const : margin >= 0 ? 'orange' as const : 'rose' as const },
    ];

    return { metrics: { rev, exp, profit, margin }, chartData, expensePie, revPie, plRows };
  }, [financials, t]);

  return (
    <div className="space-y-4">
      {/* KPI row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Revenue" value={formatCurrency(metrics.rev)} icon={TrendingUp} trend="up" />
        <KPICard title="Total Expenses" value={formatCurrency(metrics.exp)} icon={Activity} trend="down" />
        <KPICard title="Net Profit" value={formatCurrency(metrics.profit)} icon={DollarSign} trend={metrics.profit >= 0 ? 'up' : 'down'} />
        <KPICard title="Profit Margin" value={`${metrics.margin.toFixed(1)}%`} icon={Percent} trend={metrics.margin >= 20 ? 'up' : 'neutral'} />
      </div>

      {/* Financial trend + expense donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card title="Financial Performance Trend" className="lg:col-span-2 h-72">
          <ChartWrapper>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartDarkTheme.grid.stroke} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={chartDarkTheme.tick} />
                <YAxis yAxisId="l" axisLine={false} tickLine={false} tickFormatter={formatCompactCurrency} tick={chartDarkTheme.tick} width={80} />
                <RechartsTooltip formatter={(v: number, n: string) => [formatCurrency(v), t(n)]} cursor={chartDarkTheme.cursor} contentStyle={chartDarkTheme.contentStyle} itemStyle={chartDarkTheme.itemStyle} />
                <Legend formatter={v => t(v)} wrapperStyle={{ color: '#cbd5e1' }} />
                <Bar yAxisId="l" dataKey="Revenue" fill="#10b981" radius={[4, 4, 0, 0]} barSize={18} />
                <Bar yAxisId="l" dataKey="Expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={18} />
                <Line yAxisId="l" type="monotone" dataKey="Profit" name="Net Profit" stroke="#f97316" strokeWidth={3} dot={{ r: 4, fill: '#0f111a', strokeWidth: 2 }} activeDot={{ r: 6, fill: '#f97316' }} />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartWrapper>
        </Card>

        <Card title="Expenses Breakdown" className="h-72">
          <ChartWrapper>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={expensePie} innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value" stroke="none">
                  {expensePie.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <RechartsTooltip formatter={(v: number) => formatCurrency(v)} contentStyle={chartDarkTheme.contentStyle} itemStyle={chartDarkTheme.itemStyle} />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: '#cbd5e1', fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartWrapper>
        </Card>
      </div>

      {/* Revenue breakdown + P&L table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card title="Revenue Breakdown" className="h-64">
          <ChartWrapper>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={revPie} innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value" stroke="none">
                  {revPie.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <RechartsTooltip formatter={(v: number) => formatCurrency(v)} contentStyle={chartDarkTheme.contentStyle} itemStyle={chartDarkTheme.itemStyle} />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: '#cbd5e1', fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartWrapper>
        </Card>

        <Card title="P&L Summary" className="lg:col-span-2 h-64">
          <div className="overflow-x-auto h-full flex flex-col justify-center">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 uppercase text-xs">
                  <th className="py-3 text-start font-medium">Item</th>
                  <th className="py-3 text-end font-medium">Value</th>
                  <th className="py-3 text-end font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {plRows.map(row => (
                  <tr key={row.label} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 text-slate-200 font-medium">{t(row.label)}</td>
                    <td className={`py-4 text-end font-bold text-lg ${row.highlight === 'emerald' ? 'text-emerald-400' : row.highlight === 'rose' ? 'text-rose-400' : 'text-orange-400'}`}>
                      {row.isPercent ? `${(row.value as number).toFixed(1)}%` : formatCurrency(row.value as number)}
                    </td>
                    <td className="py-4 text-end">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                        row.highlight === 'emerald' ? 'bg-emerald-500/15 text-emerald-300'
                        : row.highlight === 'rose' ? 'bg-rose-500/15 text-rose-300'
                        : 'bg-orange-500/15 text-orange-300'
                      }`}>
                        {row.highlight === 'emerald' ? '▲ Good' : row.highlight === 'rose' ? '▼ Alert' : '~ Watch'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};
