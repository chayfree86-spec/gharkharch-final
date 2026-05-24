import { useState } from 'react';
import { 
  Download, PieChart as ChartIcon, 
  TrendingUp, Calendar, Hash, ShoppingCart, 
  Lightbulb, Car, BookOpen, HeartPulse, Utensils, Tv, FileText 
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { CATEGORIES } from '../utils/aiCategorizer';
import { CustomDropdown } from '../components/CustomDropdown';
import type { DropdownOption } from '../components/CustomDropdown';
import { motion } from 'framer-motion';

interface MonthlyReportProps {
  expenses: Array<{
    id: string;
    amount: number;
    remarks: string;
    category: string;
    date: string;
  }>;
  budget: number;
}

const CATEGORY_ICONS: Record<string, any> = {
  Ration: ShoppingCart,
  Utilities: Lightbulb,
  Travel: Car,
  Education: BookOpen,
  Health: HeartPulse,
  'Dining Out': Utensils,
  Entertainment: Tv,
  Others: FileText,
};

export function MonthlyReport({ expenses, budget }: MonthlyReportProps) {
  // Dynamically generate past 12 months, starting from current month going backwards (no future months!)
  const getPastMonths = (): DropdownOption[] => {
    const options: DropdownOption[] = [];
    const today = new Date();
    
    for (let i = 0; i < 12; i++) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const value = `${year}-${month}`; // 100% local YYYY-MM format, no timezone conversion shift!
      const label = d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
      options.push({ value, label });
    }
    return options;
  };

  const monthOptions = getPastMonths();
  const [selectedMonth, setSelectedMonth] = useState<string>(monthOptions[0].value);

  // Filter expenses strictly belonging to selected month
  const filteredExpenses = expenses.filter(exp => exp.date.startsWith(selectedMonth));

  // Selected Month Label for CSV download title
  const activeMonthOption = monthOptions.find(opt => opt.value === selectedMonth);
  const selectedMonthLabel = activeMonthOption ? activeMonthOption.label : 'Monthly';

  // Calculations
  const totalSpent = filteredExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  const averageSpent = filteredExpenses.length > 0 ? Math.round(totalSpent / filteredExpenses.length) : 0;
  const transactionCount = filteredExpenses.length;

  // Category Summarization
  const getCategoryBreakdown = () => {
    const data: Record<string, number> = {};
    filteredExpenses.forEach((exp) => {
      data[exp.category] = (data[exp.category] || 0) + exp.amount;
    });

    return Object.entries(data).map(([name, value]) => {
      const info = CATEGORIES[name] || CATEGORIES.Others;
      return {
        name,
        value,
        color: info.color,
        percentage: totalSpent > 0 ? Math.round((value / totalSpent) * 100) : 0,
      };
    }).sort((a, b) => b.value - a.value);
  };

  const breakdownData = getCategoryBreakdown();

  // Find max category
  const topCategory = breakdownData[0] ? breakdownData[0].name : 'N/A';
  const topCatAmount = breakdownData[0] ? breakdownData[0].value : 0;

  // Export to CSV Function
  const handleExportCSV = () => {
    if (filteredExpenses.length === 0) {
      alert('No data to export for this month!');
      return;
    }

    const headers = ['Date', 'Remarks', 'Category', 'Amount (INR)'];
    const rows = filteredExpenses.map(exp => [
      exp.date,
      `"${exp.remarks.replace(/"/g, '""')}"`,
      exp.category,
      exp.amount
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `GharKharch_Report_${selectedMonthLabel.replace(' ', '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full px-5 py-4 flex flex-col gap-5">
      {/* Header */}
      <div className="flex justify-between items-start gap-4">
        <div>
          <h2 className="text-2xl font-black text-emerald-950 tracking-tight">Monthly Report</h2>
          <p className="text-xs font-semibold text-emerald-800/60 mt-0.5 uppercase tracking-wider">
            Spending Infographic Log
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="h-10 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-emerald-600/30 flex items-center gap-1.5 transition-all cursor-pointer flex-shrink-0 mt-1"
        >
          <Download size={14} />
          Export CSV
        </button>
      </div>

      {/* Theme Matching Dropdown selection for Month (Current is first, no future shown) */}
      <div className="w-full relative z-30">
        <CustomDropdown
          label="Select Target Month"
          options={monthOptions}
          value={selectedMonth}
          onChange={setSelectedMonth}
        />
      </div>

      {/* Highlights Metrics Grid */}
      <div className="grid grid-cols-3 gap-3">
        {/* Total Spent */}
        <div className="rounded-2xl border border-emerald-100/35 p-3 shadow-premium glass-panel text-center flex flex-col items-center">
          <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center mb-1 text-emerald-600 shadow-inner">
            <TrendingUp size={16} />
          </div>
          <span className="text-[9px] font-extrabold text-emerald-800/60 uppercase tracking-wider">
            Total Spent
          </span>
          <span className="text-xs font-black text-emerald-950 mt-0.5">
            ₹{totalSpent.toLocaleString('en-IN')}
          </span>
        </div>

        {/* Avg Spent */}
        <div className="rounded-2xl border border-emerald-100/35 p-3 shadow-premium glass-panel text-center flex flex-col items-center">
          <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center mb-1 text-emerald-600 shadow-inner">
            <Hash size={16} />
          </div>
          <span className="text-[9px] font-extrabold text-emerald-800/60 uppercase tracking-wider">
            Avg / Item
          </span>
          <span className="text-xs font-black text-emerald-950 mt-0.5">
            ₹{averageSpent.toLocaleString('en-IN')}
          </span>
        </div>

        {/* Transactions count */}
        <div className="rounded-2xl border border-emerald-100/35 p-3 shadow-premium glass-panel text-center flex flex-col items-center">
          <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center mb-1 text-emerald-600 shadow-inner">
            <Calendar size={16} />
          </div>
          <span className="text-[9px] font-extrabold text-emerald-800/60 uppercase tracking-wider">
            Logs count
          </span>
          <span className="text-xs font-black text-emerald-950 mt-0.5">
            {transactionCount}
          </span>
        </div>
      </div>

      {/* Pie Chart Card */}
      <div className="w-full rounded-2xl border border-emerald-100/40 p-4 shadow-premium glass-panel flex flex-col gap-3 relative z-10">
        <div className="flex items-center gap-1.5">
          <ChartIcon size={16} className="text-emerald-700" />
          <h4 className="text-xs font-black text-emerald-950 uppercase tracking-widest">
            Category Share Breakdown
          </h4>
        </div>

        {filteredExpenses.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-center">
            <span className="text-xs text-emerald-800/60 font-semibold">No data logged in {selectedMonthLabel}.</span>
          </div>
        ) : (
          <div className="h-56 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <PieChart>
                <Pie
                  data={breakdownData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {breakdownData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#FCFBF7', 
                    borderColor: '#D1FAE5',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    color: '#065f46'
                  }}
                  formatter={(value: any) => [`₹${value}`, 'Spent']}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center label */}
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-[9px] font-bold text-emerald-800/50 uppercase tracking-widest">
                Top Spend
              </span>
              <span className="text-xs font-black text-emerald-950 mt-0.5">
                {topCategory.split(' ')[0]}
              </span>
              <span className="text-[10px] font-bold text-emerald-700">
                {topCatAmount > 0 ? `${Math.round((topCatAmount / totalSpent) * 100)}%` : '0%'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Detailed category list breakdown with progress bar */}
      <div className="flex flex-col gap-2.5 relative z-10">
        <h4 className="text-xs font-black text-emerald-950 uppercase tracking-widest px-1">
          Detailed breakdown
        </h4>
        
        <div className="flex flex-col gap-2.5">
          {breakdownData.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-emerald-200 p-8 text-center glass-panel">
              <span className="text-xs text-emerald-800/60 font-semibold">Log expenses to analyze your categories.</span>
            </div>
          ) : (
            breakdownData.map((item, idx) => {
              const Icon = CATEGORY_ICONS[item.name] || FileText;
              return (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={item.name}
                  className="rounded-2xl border border-emerald-100/30 p-3 shadow-premium glass-panel flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="h-8 w-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${item.color}12` }}
                      >
                        <Icon size={16} style={{ color: item.color }} />
                      </div>
                      <span className="text-sm font-bold text-emerald-950">{item.name}</span>
                    </div>

                    <div className="text-right flex items-center gap-1.5">
                      <span className="text-xs font-bold text-emerald-900/60">({item.percentage}%)</span>
                      <span className="text-sm font-black text-emerald-950">₹{item.value.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  {/* Visual Indicator Row */}
                  <div className="w-full h-1.5 bg-emerald-50 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full" 
                      style={{ 
                        width: `${item.percentage}%`,
                        backgroundColor: item.color 
                      }} 
                    />
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
