import React, { useState } from 'react';
import { 
  Plus, TrendingUp, Sparkles, ShoppingCart, Lightbulb, 
  Car, BookOpen, HeartPulse, Utensils, Tv, FileText, ChevronRight, AlertCircle, Pencil, Trash2,
  Paperclip
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import { CATEGORIES, generateInsights } from '../utils/aiCategorizer';
import { motion } from 'framer-motion';
import { Avatar } from '../components/Avatar';

interface DashboardProps {
  user: { name: string; email: string; photoUrl: string };
  expenses: Array<{
    id: string;
    amount: number;
    remarks: string;
    category: string;
    date: string;
    billImage?: string;
  }>;
  budget: number;
  onNavigate: (tab: string) => void;
  onEditExpense: (expense: any) => void;
  onDeleteRequest: (id: string) => void;
  onShowBill: (imageUrl: string) => void;
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

export function Dashboard({ user, expenses, budget, onNavigate, onEditExpense, onDeleteRequest, onShowBill }: DashboardProps) {
  const currentMonthName = new Date().toLocaleString('en-US', { month: 'long' });
  const [chartMode, setChartMode] = useState<'monthly' | 'daily'>('monthly');

  // Calculations
  const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const remainingBalance = Math.max(0, budget - totalSpent);
  const percentSpent = budget > 0 ? Math.min(100, Math.round((totalSpent / budget) * 100)) : 0;

  // Daily Expenses Calculation (Last 7 days)
  const getLast7DaysData = () => {
    const data = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      
      const dayTotal = expenses
        .filter(exp => exp.date === dateStr)
        .reduce((sum, curr) => sum + curr.amount, 0);

      data.push({
        name: dayName,
        amount: dayTotal,
      });
    }
    return data;
  };

  // Monthly Expenses Calculation (Last 6 Months)
  const getLast6MonthsData = () => {
    const data = [];
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const monthName = d.toLocaleDateString('en-US', { month: 'short' });
      
      const monthTotal = expenses
        .filter(exp => exp.date.startsWith(monthKey))
        .reduce((sum, curr) => sum + curr.amount, 0);

      data.push({
        name: monthName,
        amount: monthTotal,
      });
    }
    return data;
  };

  const activeChartData = chartMode === 'monthly' ? getLast6MonthsData() : getLast7DaysData();

  // Generate dynamic AI insights
  const aiInsights = generateInsights(expenses, budget);

  return (
    <div className="w-full px-5 py-4 flex flex-col gap-5">
      {/* Top Welcome Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar 
            src={user.photoUrl} 
            name={user.name} 
            className="h-10 w-10 border border-emerald-200/50 shadow-sm"
          />
          <div>
            <h3 className="text-sm font-bold text-emerald-950">Hello, {user.name.split(' ')[0]}</h3>
            <p className="text-[10px] font-bold text-emerald-800/60 uppercase tracking-widest">
              My Household Account
            </p>
          </div>
        </div>
        <button
          onClick={() => onNavigate('settings')}
          className="h-9 w-9 rounded-xl bg-white border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm hover:bg-emerald-50 active:scale-95 transition-all"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Main Premium Budget Card */}
      <div className="w-full rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 p-5 text-white shadow-xl shadow-emerald-700/20 relative overflow-hidden">
        {/* Soft geometric glows */}
        <div className="absolute top-[-50%] right-[-30%] w-56 h-56 rounded-full bg-emerald-500/20 blur-2xl" />
        <div className="absolute bottom-[-40%] left-[-20%] w-48 h-48 rounded-full bg-teal-500/10 blur-2xl" />

        <div className="flex justify-between items-start z-10 relative">
          <div>
            <span className="text-[10px] font-bold text-emerald-100/70 uppercase tracking-widest">
              {currentMonthName} Budget Overview
            </span>
            <h2 className="text-3xl font-black tracking-tight mt-1">
              ₹{remainingBalance.toLocaleString('en-IN')}
            </h2>
            <span className="text-xs font-semibold text-emerald-100/90 block mt-0.5">
              Remaining Balance
            </span>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl py-1 px-2.5 text-right border border-white/10">
            <span className="text-[9px] font-extrabold text-emerald-100 uppercase tracking-wider block">
              Budget Limit
            </span>
            <span className="text-sm font-bold">
              ₹{budget.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Budget Progress Bar */}
        <div className="mt-6 z-10 relative">
          <div className="flex justify-between text-xs font-semibold text-emerald-100 mb-1.5">
            <span>Spent: ₹{totalSpent.toLocaleString('en-IN')}</span>
            <span>{percentSpent}%</span>
          </div>
          <div className="w-full h-2.5 bg-emerald-950/20 rounded-full overflow-hidden border border-white/5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${percentSpent}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-full rounded-full ${percentSpent > 90 ? 'bg-accent-orange' : 'bg-white'}`}
            />
          </div>
        </div>
      </div>

      {/* Dynamic AI Spending Insights Scroll */}
      <div className="w-full rounded-2xl border border-emerald-100/40 p-4 shadow-premium glass-panel flex flex-col gap-3">
        <div className="flex items-center gap-1.5">
          <Sparkles size={16} className="text-accent-orange animate-pulse" />
          <h4 className="text-xs font-black text-emerald-950 uppercase tracking-widest">
            AI Spending Insights
          </h4>
        </div>
        
        <div className="flex flex-col gap-2.5 max-h-36 overflow-y-auto no-scrollbar">
          {aiInsights.map((insight, idx) => (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              key={idx} 
              className="flex items-start gap-2.5 bg-emerald-50/40 border border-emerald-100/30 rounded-xl p-2.5 text-xs text-emerald-900 font-medium leading-relaxed"
            >
              <AlertCircle size={14} className="text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>{insight}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recharts Dual-Mode Spending Trend Area Chart */}
      <div className="w-full rounded-2xl border border-emerald-100/40 p-4 shadow-premium glass-panel flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <h4 className="text-xs font-black text-emerald-950 uppercase tracking-widest">
            {chartMode === 'monthly' ? 'Monthly Trend (Last 6 Months)' : 'Daily Trend (Last 7 Days)'}
          </h4>
          
          {/* Theme custom toggle */}
          <div className="flex bg-emerald-50 border border-emerald-100/50 rounded-lg p-0.5 text-[9px] font-bold">
            <button
              type="button"
              onClick={() => setChartMode('monthly')}
              className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                chartMode === 'monthly' 
                  ? 'bg-emerald-600 text-white shadow-sm' 
                  : 'text-emerald-700 hover:bg-emerald-100/30'
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setChartMode('daily')}
              className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                chartMode === 'daily' 
                  ? 'bg-emerald-600 text-white shadow-sm' 
                  : 'text-emerald-700 hover:bg-emerald-100/30'
              }`}
            >
              Daily
            </button>
          </div>
        </div>
        
        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <AreaChart data={activeChartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="name" 
                tickLine={false} 
                axisLine={false} 
                tick={{ fontSize: 10, fill: '#047857', fontWeight: 600 }} 
              />
              <YAxis 
                width={35}
                tickLine={false} 
                axisLine={false} 
                tick={{ fontSize: 10, fill: '#047857', fontWeight: 600 }}
                tickFormatter={(val: any) => {
                  if (val >= 100000) return `${(val / 100000).toFixed(0)}L`;
                  if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
                  return String(val);
                }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#FCFBF7', 
                  borderColor: '#D1FAE5',
                  borderRadius: '12px',
                  boxShadow: '0 8px 32px 0 rgba(4, 120, 87, 0.05)',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  color: '#065f46'
                }}
                formatter={(value: any) => [`₹${value}`, 'Amount']}
                labelStyle={{ color: '#047857', fontWeight: 'bold' }}
              />
              <Area 
                type="monotone" 
                dataKey="amount" 
                stroke="#059669" 
                strokeWidth={2} 
                fillOpacity={1} 
                fill="url(#colorSpent)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Transactions Section */}
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center px-1">
          <h4 className="text-xs font-black text-emerald-950 uppercase tracking-widest">
            Recent Expenses
          </h4>
          <button 
            onClick={() => onNavigate('history')} 
            className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 uppercase tracking-wider cursor-pointer"
          >
            See All Logs
          </button>
        </div>

        <div className="flex flex-col gap-2.5">
          {expenses.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-emerald-200 p-8 text-center glass-panel">
              <span className="text-xs text-emerald-800/60 font-semibold">No household expenses logged yet.</span>
            </div>
          ) : (
            expenses.slice(0, 4).map((exp, idx) => {
              const Icon = CATEGORY_ICONS[exp.category] || FileText;
              const catInfo = CATEGORIES[exp.category] || CATEGORIES.Others;
              const formattedDate = new Date(exp.date).toLocaleDateString('en-IN', { 
                day: 'numeric', 
                month: 'short' 
              });

              return (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={exp.id}
                  className="rounded-2xl border border-emerald-100/35 p-3.5 shadow-premium glass-panel flex items-center justify-between hover:bg-emerald-50/10 transition-colors animate-fade-in"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="h-10 w-10 rounded-xl flex items-center justify-center shadow-inner"
                      style={{ backgroundColor: `${catInfo.color}12` }}
                    >
                      <Icon size={18} style={{ color: catInfo.color }} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-emerald-950 capitalize max-w-[150px] truncate">
                        {exp.remarks}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-bold uppercase" style={{ color: catInfo.color }}>
                          {exp.category}
                        </span>
                        <span className="h-1 w-1 rounded-full bg-emerald-600/30" />
                        <span className="text-[10px] font-semibold text-emerald-900/60">
                          {formattedDate}
                        </span>
                        {exp.billImage && (
                          <>
                            <span className="h-1 w-1 rounded-full bg-emerald-600/30" />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onShowBill(exp.billImage!);
                              }}
                              className="flex items-center gap-0.5 text-[9px] font-extrabold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
                              title="View Attached Receipt"
                            >
                              <Paperclip size={10} className="stroke-[3]" />
                              <span>BILL</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-sm font-black text-emerald-950">
                      -₹{exp.amount.toLocaleString('en-IN')}
                    </span>
                    
                    <div className="flex items-center gap-0.5">
                      <button
                        onClick={() => onEditExpense(exp)}
                        className="p-1 rounded-lg text-emerald-600 hover:bg-emerald-50 active:scale-90 transition-all cursor-pointer"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => onDeleteRequest(exp.id)}
                        className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-600 active:scale-90 transition-all cursor-pointer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
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
