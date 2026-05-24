import React, { useState, useEffect, useRef } from 'react';
import { CustomDatePicker } from './CustomDatePicker';
import { categorizeExpense, CATEGORIES } from '../utils/aiCategorizer';
import { ShoppingCart, Lightbulb, Car, BookOpen, HeartPulse, Utensils, Tv, FileText, Check, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Expense {
  id: string;
  amount: number;
  remarks: string;
  category: string;
  date: string;
}

interface EditExpenseModalProps {
  isOpen: boolean;
  expense: Expense | null;
  onSave: (updatedExpense: Expense) => void;
  onCancel: () => void;
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

export function EditExpenseModal({ isOpen, expense, onSave, onCancel }: EditExpenseModalProps) {
  const [amount, setAmount] = useState(expense ? String(expense.amount) : '');
  const [remarks, setRemarks] = useState(expense ? expense.remarks : '');
  const [date, setDate] = useState(expense ? expense.date : '');

  const amountRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (expense) {
      setAmount(String(expense.amount));
      setRemarks(expense.remarks);
      setDate(expense.date);
      
      // Auto focus amount input when opened
      setTimeout(() => {
        if (amountRef.current) {
          amountRef.current.focus();
        }
      }, 200);
    }
  }, [expense, isOpen]);

  if (!isOpen || !expense) return null;

  // AI categorization logic
  const { category, confidence, matchedKeyword } = categorizeExpense(remarks);
  const activeCatInfo = CATEGORIES[category] || CATEGORIES.Others;
  const CatIcon = CATEGORY_ICONS[category] || FileText;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);
    
    if (isNaN(numericAmount) || numericAmount <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    
    if (!remarks.trim()) {
      alert('Please enter some remarks');
      return;
    }

    onSave({
      id: expense.id,
      amount: numericAmount,
      remarks: remarks.trim(),
      category,
      date,
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 bg-black z-40"
          />

          {/* Edit Drawer Modal */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed bottom-0 left-0 right-0 mx-auto max-w-[480px] bg-cream rounded-t-3xl border-t border-emerald-100/30 p-6 z-45 shadow-2xl glass-panel-dark pb-8 flex flex-col gap-4"
          >
            {/* Header */}
            <div className="w-full flex justify-between items-center mb-1">
              <div>
                <h3 className="text-lg font-black text-emerald-950">Edit Expense</h3>
                <span className="text-[10px] font-bold text-emerald-800/60 uppercase tracking-wide">
                  Live AI classification enabled
                </span>
              </div>
              <button
                onClick={onCancel}
                className="p-1.5 rounded-full hover:bg-emerald-50 text-emerald-600"
              >
                <X size={18} />
              </button>
            </div>

            {/* Core Form */}
            <form onSubmit={handleSave} className="flex flex-col gap-4">
              
              {/* Amount input */}
              <div>
                <label className="block text-xs font-bold text-emerald-800 mb-1 px-1">Amount (INR)</label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-xl font-bold text-emerald-900">₹</span>
                  <input
                    ref={amountRef}
                    type="number"
                    inputMode="decimal"
                    pattern="[0-9]*"
                    placeholder="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full h-14 pl-9 pr-4 rounded-xl border border-emerald-100 bg-white/50 text-xl font-bold text-emerald-950 input-focus-glow transition-all"
                    required
                  />
                </div>
              </div>

              {/* Remarks input */}
              <div>
                <label className="block text-xs font-bold text-emerald-800 mb-1 px-1">Remarks / Spoken Text</label>
                <input
                  type="text"
                  placeholder="e.g. doodh aur sabzi, petrol, uber ride"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border border-emerald-100 bg-white/50 text-sm font-medium text-emerald-950 input-focus-glow transition-all"
                  required
                />
              </div>

              {/* AI live categorization tag */}
              <motion.div
                key={category}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl border flex items-center justify-between transition-all"
                style={{ 
                  backgroundColor: activeCatInfo.bg, 
                  borderColor: `${activeCatInfo.color}20` 
                }}
              >
                <div className="flex items-center gap-2.5">
                  <div 
                    className="h-8 w-8 rounded-lg flex items-center justify-center shadow-inner"
                    style={{ backgroundColor: `${activeCatInfo.color}15` }}
                  >
                    <CatIcon size={18} style={{ color: activeCatInfo.color }} />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-extrabold tracking-wider block" style={{ color: `${activeCatInfo.color}aa` }}>
                      AI Classified Category
                    </span>
                    <span className="text-sm font-bold text-emerald-950">
                      {category}
                    </span>
                  </div>
                </div>

                {remarks && confidence > 0 && (
                  <div className="text-right">
                    <div className="flex items-center gap-0.5 text-[10px] font-extrabold text-emerald-800 uppercase">
                      <Sparkles size={9} className="text-orange-500" />
                      <span>{confidence}% Match</span>
                    </div>
                    {matchedKeyword && (
                      <span className="text-[9px] font-medium text-emerald-900/60 block">
                        via "{matchedKeyword}"
                      </span>
                    )}
                  </div>
                )}
              </motion.div>

              {/* Theme Date Picker */}
              <CustomDatePicker
                selectedDate={date}
                onChange={setDate}
                label="Transaction Date"
              />

              {/* Action Buttons */}
              <div className="flex gap-3 mt-3">
                <button
                  type="button"
                  onClick={onCancel}
                  className="flex-1 h-12 border border-emerald-100 bg-white hover:bg-emerald-50 text-emerald-950 text-xs font-bold rounded-xl shadow-sm transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-12 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/30 flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                >
                  <Check size={16} />
                  Save Changes
                </button>
              </div>

            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
