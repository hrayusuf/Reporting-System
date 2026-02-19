import React, { useState, useRef } from 'react';
import { useApp } from '../../contexts/AppContext';
import { databaseService } from '../../services/database';
import { Card } from '../shared/Card';
import { UploadCloud, AlertCircle, Download, CheckCircle2, XCircle, FileText, Loader2, Trash2 } from 'lucide-react';

type DataType = 'financials' | 'sales' | 'fleet' | 'maintenance';

interface ParsedRow {
  [key: string]: string;
}

interface ValidationError {
  row: number;
  column: string;
  message: string;
}

interface UploadState {
  type: DataType;
  file: File | null;
  preview: ParsedRow[];
  headers: string[];
  errors: ValidationError[];
  valid: boolean;
  importing: boolean;
  imported: boolean;
  rowCount: number;
}

const TEMPLATES: Record<DataType, { headers: string[]; label: string; example: string[] }> = {
  financials: {
    label: 'Financials',
    headers: ['Date', 'Type', 'Category', 'Amount', 'SubCategory', 'CostCenter', 'Description'],
    example: ['2024-01-15', 'Revenue', 'Service Revenue', '12500', 'Pest Control', 'HQ', 'Monthly service'],
  },
  sales: {
    label: 'Sales',
    headers: ['Date', 'SalesRep', 'Customer', 'Service', 'ContractValue', 'Cost'],
    example: ['2024-01-20', 'Alice Smith', 'TechCorp', 'Consulting', '18000', '7200'],
  },
  fleet: {
    label: 'Fuel',
    headers: ['Date', 'VehicleID', 'Liters', 'FuelCost', 'Odometer'],
    example: ['2024-01-10', 'VAN-001', '45', '135', '52000'],
  },
  maintenance: {
    label: 'Maintenance',
    headers: ['Date', 'VehicleID', 'Type', 'MaintenanceCost', 'DowntimeDays', 'Notes'],
    example: ['2024-01-08', 'TRK-002', 'Routine', '450', '1', 'Oil change'],
  },
};

const parseCSV = (text: string): { headers: string[]; rows: ParsedRow[] } => {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length < 2) return { headers: [], rows: [] };
  const parseRow = (row: string) =>
    row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(s => s.replace(/^"|"$/g, '').trim());
  const headers = parseRow(lines[0]);
  const rows = lines.slice(1).map(line => {
    const vals = parseRow(line);
    const obj: ParsedRow = {};
    headers.forEach((h, i) => { obj[h] = vals[i] ?? ''; });
    return obj;
  });
  return { headers, rows };
};

const validateFinancials = (rows: ParsedRow[]): ValidationError[] => {
  const errors: ValidationError[] = [];
  rows.forEach((row, i) => {
    if (!row['Date'] || isNaN(Date.parse(row['Date']))) errors.push({ row: i + 2, column: 'Date', message: 'Invalid or missing date' });
    if (!['Revenue', 'Expense'].includes(row['Type'])) errors.push({ row: i + 2, column: 'Type', message: 'Must be Revenue or Expense' });
    if (!row['Category']) errors.push({ row: i + 2, column: 'Category', message: 'Category is required' });
    if (!row['Amount'] || isNaN(Number(row['Amount']))) errors.push({ row: i + 2, column: 'Amount', message: 'Must be a valid number' });
  });
  return errors;
};

const validateSales = (rows: ParsedRow[]): ValidationError[] => {
  const errors: ValidationError[] = [];
  rows.forEach((row, i) => {
    if (!row['Date'] || isNaN(Date.parse(row['Date']))) errors.push({ row: i + 2, column: 'Date', message: 'Invalid or missing date' });
    if (!row['SalesRep']) errors.push({ row: i + 2, column: 'SalesRep', message: 'Sales rep name required' });
    if (!row['Customer']) errors.push({ row: i + 2, column: 'Customer', message: 'Customer name required' });
    if (!row['ContractValue'] || isNaN(Number(row['ContractValue']))) errors.push({ row: i + 2, column: 'ContractValue', message: 'Must be a valid number' });
  });
  return errors;
};

const validateFleet = (rows: ParsedRow[]): ValidationError[] => {
  const errors: ValidationError[] = [];
  rows.forEach((row, i) => {
    if (!row['Date'] || isNaN(Date.parse(row['Date']))) errors.push({ row: i + 2, column: 'Date', message: 'Invalid or missing date' });
    if (!row['VehicleID']) errors.push({ row: i + 2, column: 'VehicleID', message: 'Vehicle ID required' });
    if (!row['FuelCost'] || isNaN(Number(row['FuelCost']))) errors.push({ row: i + 2, column: 'FuelCost', message: 'Must be a valid number' });
  });
  return errors;
};

const validateMaintenance = (rows: ParsedRow[]): ValidationError[] => {
  const errors: ValidationError[] = [];
  rows.forEach((row, i) => {
    if (!row['Date'] || isNaN(Date.parse(row['Date']))) errors.push({ row: i + 2, column: 'Date', message: 'Invalid or missing date' });
    if (!row['VehicleID']) errors.push({ row: i + 2, column: 'VehicleID', message: 'Vehicle ID required' });
    if (!row['MaintenanceCost'] || isNaN(Number(row['MaintenanceCost']))) errors.push({ row: i + 2, column: 'MaintenanceCost', message: 'Must be a valid number' });
  });
  return errors;
};

const emptyUpload = (type: DataType): UploadState => ({
  type, file: null, preview: [], headers: [], errors: [], valid: false, importing: false, imported: false, rowCount: 0,
});

export const DataUploadDashboard = () => {
  const { generateSampleData, clearAllData, t, isLoading, refreshData } = useApp();
  const [uploads, setUploads] = useState<Record<DataType, UploadState>>({
    financials: emptyUpload('financials'),
    sales: emptyUpload('sales'),
    fleet: emptyUpload('fleet'),
    maintenance: emptyUpload('maintenance'),
  });
  const fileRefs = useRef<Record<DataType, HTMLInputElement | null>>({
    financials: null, sales: null, fleet: null, maintenance: null,
  });

  const downloadTemplate = (type: DataType) => {
    const tpl = TEMPLATES[type];
    const csvContent = [tpl.headers.join(','), tpl.example.join(',')].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}_template.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (type: DataType, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      if (!text) return;
      const { headers, rows } = parseCSV(text);
      const preview = rows.slice(0, 20);
      let errors: ValidationError[] = [];
      if (type === 'financials') errors = validateFinancials(rows);
      else if (type === 'sales') errors = validateSales(rows);
      else if (type === 'fleet') errors = validateFleet(rows);
      else if (type === 'maintenance') errors = validateMaintenance(rows);
      setUploads(prev => ({
        ...prev,
        [type]: { ...prev[type], file, headers, preview, errors, valid: errors.length === 0, rowCount: rows.length, importing: false, imported: false },
      }));
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleImport = async (type: DataType) => {
    const state = uploads[type];
    if (!state.file || !state.valid) return;
    setUploads(prev => ({ ...prev, [type]: { ...prev[type], importing: true } }));
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const text = ev.target?.result as string;
      const { rows } = parseCSV(text);
      try {
        if (type === 'financials') {
          await databaseService.bulkInsertFinancials(rows.map(r => ({
            date: r['Date'],
            type: r['Type'] as 'Revenue' | 'Expense',
            category: r['Category'] || 'General',
            amount: parseFloat(r['Amount']) || 0,
            sub_category: r['SubCategory'] || '',
            cost_center: r['CostCenter'] || '',
            period_type: 'Month',
            description: r['Description'] || '',
          })));
        } else if (type === 'sales') {
          await databaseService.bulkInsertSales(rows.map(r => ({
            date: r['Date'],
            sales_rep: r['SalesRep'] || 'Unknown',
            customer: r['Customer'] || 'Unknown',
            service: r['Service'] || 'General',
            contract_value: parseFloat(r['ContractValue']) || 0,
            cost: parseFloat(r['Cost']) || 0,
          })));
        } else if (type === 'fleet') {
          for (const r of rows) await databaseService.getOrCreateVehicle(r['VehicleID']);
          await databaseService.bulkInsertFleet(rows.map(r => ({
            date: r['Date'],
            vehicle_id: r['VehicleID'],
            type: 'Fuel' as 'Fuel',
            cost: parseFloat(r['FuelCost']) || 0,
            liters: parseFloat(r['Liters']) || 0,
            odometer: parseFloat(r['Odometer']) || 0,
          })));
        } else if (type === 'maintenance') {
          for (const r of rows) await databaseService.getOrCreateVehicle(r['VehicleID']);
          await databaseService.bulkInsertMaintenance(rows.map(r => ({
            date: r['Date'],
            vehicle_id: r['VehicleID'],
            type: (['Routine','Repair','Tires','Other'].includes(r['Type']) ? r['Type'] : 'Other') as 'Routine' | 'Repair' | 'Tires' | 'Other',
            maintenance_cost: parseFloat(r['MaintenanceCost']) || 0,
            downtime_days: parseInt(r['DowntimeDays']) || 0,
            notes: r['Notes'] || '',
          })));
        }
        await refreshData();
        setUploads(prev => ({ ...prev, [type]: { ...prev[type], imported: true, importing: false } }));
      } catch (err: any) {
        console.error(err);
        alert('Import failed: ' + (err?.message || 'Unknown error'));
        setUploads(prev => ({ ...prev, [type]: { ...prev[type], importing: false } }));
      }
    };
    reader.readAsText(state.file);
  };

  const resetUpload = (type: DataType) => {
    setUploads(prev => ({ ...prev, [type]: emptyUpload(type) }));
  };

  const types: DataType[] = ['financials', 'sales', 'fleet', 'maintenance'];

  return (
    <div className="max-w-5xl space-y-6">
      {/* Quick Actions */}
      <Card title="Data Management Hub">
        <p className="text-slate-400 mb-6">
          Generate realistic sample data for demonstration, or upload your own CSV files using the templates below.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={generateSampleData}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 w-full py-4 px-6 bg-indigo-600/80 hover:bg-orange-500 text-white rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-orange-500/25 border border-transparent hover:border-orange-400 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UploadCloud className="w-5 h-5" />}
            <span>{t('Generate Sample Data')}</span>
          </button>
          <button
            onClick={clearAllData}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 w-full py-4 px-6 bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500 hover:text-white rounded-xl font-medium transition-all duration-300 disabled:opacity-50"
          >
            <Trash2 className="w-5 h-5" />
            <span>{t('Clear All Data')}</span>
          </button>
        </div>
      </Card>

      {/* Upload Cards */}
      {types.map(type => {
        const state = uploads[type];
        const tpl = TEMPLATES[type];
        return (
          <Card key={type} className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/5 rounded-xl">
                  <FileText className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-100">{tpl.label} Data</h3>
                  <p className="text-xs text-slate-500">Required columns: {tpl.headers.join(', ')}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => downloadTemplate(type)}
                  className="flex items-center gap-1.5 text-sm text-slate-300 hover:text-orange-400 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>{t('Template')}</span>
                </button>
                <label className="cursor-pointer bg-white/10 hover:bg-orange-500 hover:text-white text-slate-200 py-2 px-4 rounded-lg font-medium border border-white/10 hover:border-orange-400 transition-all text-sm">
                  {t('Browse File')}
                  <input
                    ref={el => { fileRefs.current[type] = el; }}
                    type="file"
                    className="hidden"
                    accept=".csv"
                    onChange={e => handleFileChange(type, e)}
                  />
                </label>
              </div>
            </div>

            {/* File loaded: show preview */}
            {state.file && (
              <div className="border border-white/10 rounded-xl overflow-hidden">
                {/* Status bar */}
                <div className={`flex items-center justify-between px-4 py-3 ${state.valid ? 'bg-emerald-500/10 border-b border-emerald-500/20' : 'bg-rose-500/10 border-b border-rose-500/20'}`}>
                  <div className="flex items-center gap-2">
                    {state.valid
                      ? <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      : <XCircle className="w-4 h-4 text-rose-400" />}
                    <span className={`text-sm font-medium ${state.valid ? 'text-emerald-300' : 'text-rose-300'}`}>
                      {state.file.name} — {state.rowCount} {t('rows')} {state.valid ? '— Valid' : `— ${state.errors.length} error(s)`}
                    </span>
                  </div>
                  <button onClick={() => resetUpload(type)} className="text-slate-400 hover:text-rose-400 transition-colors p-1">
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>

                {/* Validation errors */}
                {state.errors.length > 0 && (
                  <div className="max-h-40 overflow-y-auto bg-rose-500/5 p-3 space-y-1">
                    {state.errors.slice(0, 10).map((err, i) => (
                      <p key={i} className="text-xs text-rose-300">
                        Row {err.row} / <span className="font-medium">{err.column}</span>: {err.message}
                      </p>
                    ))}
                    {state.errors.length > 10 && (
                      <p className="text-xs text-rose-400 font-medium">…and {state.errors.length - 10} more errors</p>
                    )}
                  </div>
                )}

                {/* Preview table */}
                {state.preview.length > 0 && (
                  <div className="overflow-x-auto max-h-48">
                    <table className="min-w-full text-xs text-slate-400">
                      <thead className="bg-black/20 text-slate-300 uppercase sticky top-0">
                        <tr>
                          {state.headers.map(h => (
                            <th key={h} className="px-3 py-2 whitespace-nowrap text-left">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {state.preview.map((row, i) => (
                          <tr key={i} className="border-t border-white/5 hover:bg-white/5">
                            {state.headers.map(h => (
                              <td key={h} className="px-3 py-1.5 whitespace-nowrap">{row[h]}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Import button */}
                {state.valid && !state.imported && (
                  <div className="px-4 py-3 border-t border-white/10 flex justify-end">
                    <button
                      onClick={() => handleImport(type)}
                      disabled={state.importing}
                      className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-400 text-white rounded-xl text-sm font-medium transition-all disabled:opacity-50"
                    >
                      {state.importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      {state.importing ? 'Importing...' : `Import ${state.rowCount} rows`}
                    </button>
                  </div>
                )}

                {state.imported && (
                  <div className="px-4 py-3 border-t border-emerald-500/20 flex items-center gap-2 text-emerald-400 text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Successfully imported {state.rowCount} rows! Dashboards are now updated.</span>
                  </div>
                )}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
};
