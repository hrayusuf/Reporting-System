import React, { useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Card, KPICard, ChartWrapper, chartDarkTheme } from '../shared/Card';
import { Truck, AlertCircle, Car, Gauge } from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';

const COLORS = ['#0ea5e9', '#f97316', '#10b981', '#f43f5e', '#8b5cf6', '#facc15'];

export const FleetDashboard = () => {
  const { filteredFleet: fleet, filteredMaintenance: maintenance, t, formatCurrency, formatCompactCurrency } = useApp();

  const { metrics, vehicleData, trendData, topVehicles, piData, maintTable } = useMemo(() => {
    let totalFuel = 0, totalMaint = 0;

    const vMap: Record<string, { name: string; Fuel: number; Maintenance: number; Total: number; Liters: number; MaxOdo: number; MinOdo: number; DowntimeDays: number }> = {};
    const tMap: Record<string, { name: string; Fuel: number; Maintenance: number }> = {};

    fleet.forEach(f => {
      const month = f.date.substring(0, 7);
      totalFuel += f.cost;
      if (!vMap[f.vehicle_id]) vMap[f.vehicle_id] = { name: f.vehicle_id, Fuel: 0, Maintenance: 0, Total: 0, Liters: 0, MaxOdo: 0, MinOdo: Infinity, DowntimeDays: 0 };
      vMap[f.vehicle_id].Fuel += f.cost;
      vMap[f.vehicle_id].Total += f.cost;
      vMap[f.vehicle_id].Liters += f.liters || 0;
      if (f.odometer) {
        if (f.odometer > vMap[f.vehicle_id].MaxOdo) vMap[f.vehicle_id].MaxOdo = f.odometer;
        if (f.odometer < vMap[f.vehicle_id].MinOdo) vMap[f.vehicle_id].MinOdo = f.odometer;
      }
      if (!tMap[month]) tMap[month] = { name: month, Fuel: 0, Maintenance: 0 };
      tMap[month].Fuel += f.cost;
    });

    maintenance.forEach(m => {
      const month = m.date.substring(0, 7);
      totalMaint += m.maintenance_cost;
      if (!vMap[m.vehicle_id]) vMap[m.vehicle_id] = { name: m.vehicle_id, Fuel: 0, Maintenance: 0, Total: 0, Liters: 0, MaxOdo: 0, MinOdo: Infinity, DowntimeDays: 0 };
      vMap[m.vehicle_id].Maintenance += m.maintenance_cost;
      vMap[m.vehicle_id].Total += m.maintenance_cost;
      vMap[m.vehicle_id].DowntimeDays += m.downtime_days || 0;
      if (!tMap[month]) tMap[month] = { name: month, Fuel: 0, Maintenance: 0 };
      tMap[month].Maintenance += m.maintenance_cost;
    });

    const total = totalFuel + totalMaint;
    const vArr = Object.values(vMap);
    vArr.forEach(v => { if (v.MinOdo === Infinity) v.MinOdo = 0; });

    const avgCostPerVehicle = vArr.length > 0 ? total / vArr.length : 0;
    const vehicleData = vArr.sort((a, b) => b.Total - a.Total);
    const topVehicles = vehicleData.slice(0, 10);
    const trendData = Object.values(tMap).sort((a, b) => a.name.localeCompare(b.name));

    const piData = [
      { name: t('Fuel'), value: totalFuel },
      { name: t('Maintenance'), value: totalMaint },
    ].filter(d => d.value > 0);

    const maintTable = [...maintenance]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);

    return {
      metrics: { totalFuel, totalMaint, total, avgCostPerVehicle },
      vehicleData, trendData, topVehicles, piData, maintTable,
    };
  }, [fleet, maintenance, t]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard title="Total Fuel Cost" value={formatCurrency(metrics.totalFuel)} icon={Truck} />
        <KPICard title="Total Maintenance Cost" value={formatCurrency(metrics.totalMaint)} icon={AlertCircle} />
        <KPICard title="Total Operating Cost" value={formatCurrency(metrics.total)} icon={Car} trend="down" />
        <KPICard title="Avg Cost per Vehicle" value={formatCurrency(metrics.avgCostPerVehicle)} icon={Gauge} />
      </div>

      {/* Cost by vehicle + Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Operating Cost by Vehicle" className="h-96">
          <ChartWrapper>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={vehicleData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartDarkTheme.grid.stroke} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={chartDarkTheme.tick} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={formatCompactCurrency} tick={chartDarkTheme.tick} width={80} />
                <RechartsTooltip formatter={(v: number, n: string) => [formatCurrency(v), t(n)]} cursor={chartDarkTheme.cursor} contentStyle={chartDarkTheme.contentStyle} itemStyle={chartDarkTheme.itemStyle} />
                <Legend formatter={v => t(v)} wrapperStyle={{ color: '#cbd5e1' }} />
                <Bar dataKey="Fuel" name="Fuel" stackId="a" fill="#0ea5e9" maxBarSize={50} />
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
                <RechartsTooltip formatter={(v: number, n: string) => [formatCurrency(v), t(n)]} contentStyle={chartDarkTheme.contentStyle} itemStyle={chartDarkTheme.itemStyle} />
                <Legend formatter={v => t(v)} wrapperStyle={{ color: '#cbd5e1' }} />
                <Line type="monotone" dataKey="Fuel" name="Fuel" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 3, fill: '#0ea5e9' }} activeDot={{ r: 5, fill: '#f97316' }} />
                <Line type="monotone" dataKey="Maintenance" name="Maintenance" stroke="#f97316" strokeWidth={3} dot={{ r: 3, fill: '#f97316' }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartWrapper>
        </Card>
      </div>

      {/* Top vehicles + pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Top Vehicles by Cost" className="lg:col-span-2 h-96">
          <ChartWrapper>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topVehicles} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={chartDarkTheme.grid.stroke} />
                <XAxis type="number" axisLine={false} tickLine={false} tickFormatter={formatCompactCurrency} tick={chartDarkTheme.tick} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={70} tick={chartDarkTheme.tick} />
                <RechartsTooltip formatter={(v: number) => [formatCurrency(v), t('Total Operating Cost')]} cursor={chartDarkTheme.cursor} contentStyle={chartDarkTheme.contentStyle} itemStyle={chartDarkTheme.itemStyle} />
                <Bar dataKey="Total" fill="#0ea5e9" radius={[0, 4, 4, 0]} barSize={20} name={t('Total Operating Cost')} />
              </BarChart>
            </ResponsiveContainer>
          </ChartWrapper>
        </Card>

        <Card title="Operating Cost Breakdown" className="h-96">
          <ChartWrapper>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={piData} innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value" stroke="none">
                  {piData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <RechartsTooltip formatter={(v: number) => formatCurrency(v)} contentStyle={chartDarkTheme.contentStyle} itemStyle={chartDarkTheme.itemStyle} />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: '#cbd5e1' }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartWrapper>
        </Card>
      </div>

      {/* Recent maintenance records */}
      {maintTable.length > 0 && (
        <Card title="Recent Maintenance Records" className="p-0 border-none bg-transparent shadow-none overflow-x-auto">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
            <table className="min-w-full text-sm text-slate-400">
              <thead className="text-xs text-slate-300 uppercase bg-black/20 border-b border-white/10">
                <tr>
                  <th className="px-5 py-4 text-start">{t('Date')}</th>
                  <th className="px-5 py-4 text-start">{t('Vehicle ID')}</th>
                  <th className="px-5 py-4 text-start">Type</th>
                  <th className="px-5 py-4 text-end">Cost</th>
                  <th className="px-5 py-4 text-end">{t('Downtime Days')}</th>
                  <th className="px-5 py-4 text-start">Notes</th>
                </tr>
              </thead>
              <tbody>
                {maintTable.map(row => (
                  <tr key={row.id} className="border-b border-white/5 hover:bg-orange-500/10 transition-colors">
                    <td className="px-5 py-4">{row.date}</td>
                    <td className="px-5 py-4 font-medium text-slate-200">{row.vehicle_id}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        row.type === 'Routine' ? 'bg-emerald-500/20 text-emerald-300'
                        : row.type === 'Repair' ? 'bg-rose-500/20 text-rose-300'
                        : row.type === 'Tires' ? 'bg-sky-500/20 text-sky-300'
                        : 'bg-slate-500/20 text-slate-300'
                      }`}>
                        {row.type}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-end text-orange-400 font-medium">{formatCurrency(row.maintenance_cost)}</td>
                    <td className="px-5 py-4 text-end">
                      {row.downtime_days > 0
                        ? <span className="text-rose-400">{row.downtime_days}d</span>
                        : <span className="text-slate-600">0</span>}
                    </td>
                    <td className="px-5 py-4 text-slate-500 max-w-xs truncate">{row.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};
