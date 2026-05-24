import React, { useState } from 'react';
import { CustomDropdown } from '../components/CustomDropdown';
import { Calendar, Wallet, Check, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { CustomAlertDialog } from '../components/CustomAlertDialog';

interface BudgetPlanningProps {
  budget: number;
  onUpdateBudget: (newBudget: number) => void;
  onNavigate: (tab: string) => void;
}

export function BudgetPlanning({ budget, onUpdateBudget, onNavigate }: BudgetPlanningProps) {
  const [budgetVal, setBudgetVal] = useState(String(budget));
  
  // Custom styled dropdown selection for months
  const [selectedMonth, setSelectedMonth] = useState('05-2026'); // May 2026
  
  const [alertConfig, setAlertConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    type: 'danger' | 'info' | 'success';
    onConfirm?: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    type: 'info',
  });

  const triggerAlert = (
    title: string, 
    description: string, 
    type: 'danger' | 'info' | 'success' = 'info',
    onConfirm?: () => void
  ) => {
    setAlertConfig({
      isOpen: true,
      title,
      description,
      type,
      onConfirm,
    });
  };

  const monthOptions = [
    { value: '05-2026', label: 'May 2026 (Current)' },
    { value: '06-2026', label: 'June 2026 (Next)' },
    { value: '07-2026', label: 'July 2026' },
    { value: '08-2026', label: 'August 2026' },
  ];

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(budgetVal);
    if (isNaN(parsed) || parsed < 0) {
      triggerAlert('Invalid Budget Limit', 'Please enter a valid budget amount greater than or equal to zero.', 'danger');
      return;
    }

    onUpdateBudget(parsed);

    // Save success feedback confetti
    confetti({
      particleCount: 60,
      spread: 50,
      origin: { y: 0.8 },
      colors: ['#059669', '#FF6B35']
    });

    triggerAlert(
      'Budget Saved Successfully!',
      `The global family household budget limit has been successfully updated to ₹${parsed.toLocaleString('en-IN')}.`,
      'success',
      () => {
        onNavigate('dashboard');
      }
    );
  };

  return (
    <div className="w-full px-5 py-4 flex flex-col gap-5">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-emerald-950 tracking-tight">Budget Planning</h2>
        <p className="text-xs font-semibold text-emerald-800/60 mt-0.5 uppercase tracking-wider">
          Establish simple month-wise spending limits
        </p>
      </div>

      {/* Intro info box */}
      <div className="rounded-2xl border border-emerald-100/40 p-4 shadow-premium glass-panel flex items-start gap-3 bg-emerald-50/20">
        <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-inner flex-shrink-0 mt-0.5">
          <Wallet size={16} />
        </div>
        <div className="flex-1">
          <h4 className="text-xs font-bold text-emerald-950">Simple Month-Wise Budgeting</h4>
          <p className="text-[11px] text-emerald-800/80 leading-relaxed mt-1">
            GharKharch uses a single, streamlined global budget for your family instead of confusing category limits. Unused balances carry forward to keep your finances in flow.
          </p>
        </div>
      </div>

      {/* Core Budget Form */}
      <form onSubmit={handleSaveBudget} className="flex flex-col gap-4">
        <div className="rounded-2xl border border-emerald-100/40 p-5 shadow-premium glass-panel flex flex-col gap-4">
          
          {/* Custom theme bound month select */}
          <CustomDropdown
            label="Target Month"
            options={monthOptions}
            value={selectedMonth}
            onChange={setSelectedMonth}
          />

          {/* Budget Limit Input */}
          <div>
            <label className="block text-xs font-bold text-emerald-800 mb-1 px-1">
              Monthly Budget Limit (INR)
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-xl font-bold text-emerald-900">₹</span>
              <input
                type="number"
                inputMode="decimal"
                pattern="[0-9]*"
                placeholder="e.g. 25000"
                value={budgetVal}
                onChange={(e) => setBudgetVal(e.target.value)}
                className="w-full h-14 pl-9 pr-4 rounded-xl border border-emerald-100 bg-white/50 text-xl font-bold text-emerald-950 input-focus-glow transition-all"
                required
              />
            </div>
          </div>
        </div>

        {/* Info card regarding carry forward setting */}
        <div className="rounded-xl border border-emerald-100/30 p-3 bg-emerald-50/10 flex items-start gap-2 text-[11px] text-emerald-800/80 leading-relaxed">
          <AlertCircle size={14} className="text-emerald-600 flex-shrink-0 mt-0.5" />
          <span>
            Note: If budget is not explicitly added for a month, it will automatically carry forward the previous month's limit (editable in Settings).
          </span>
        </div>

        {/* Submit */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          type="submit"
          className="w-full h-13 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 mt-2 transition-all cursor-pointer"
        >
          <Check size={18} />
          Save Month's Budget
        </motion.button>
      </form>

      {/* Local custom budget alert */}
      <CustomAlertDialog
        isOpen={alertConfig.isOpen}
        title={alertConfig.title}
        description={alertConfig.description}
        confirmLabel="Okay"
        cancelLabel=""
        onConfirm={() => {
          setAlertConfig(prev => ({ ...prev, isOpen: false }));
          if (alertConfig.onConfirm) {
            alertConfig.onConfirm();
          }
        }}
        onCancel={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))}
        type={alertConfig.type}
      />
    </div>
  );
}
