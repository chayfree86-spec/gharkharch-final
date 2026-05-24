import { useState } from 'react';
import { Search, ShoppingCart, Lightbulb, Car, BookOpen, HeartPulse, Utensils, Tv, FileText, Trash2, Pencil, Paperclip } from 'lucide-react';
import { CATEGORIES } from '../utils/aiCategorizer';
import { motion, AnimatePresence } from 'framer-motion';

interface ExpenseHistoryProps {
  expenses: Array<{
    id: string;
    amount: number;
    remarks: string;
    category: string;
    date: string;
    billImage?: string;
  }>;
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

export function ExpenseHistory({ expenses, onEditExpense, onDeleteRequest, onShowBill }: ExpenseHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Available categories for filter tabs
  const categoryFilters = ['All', ...Object.keys(CATEGORIES)];

  // Filtering logic
  const filteredExpenses = expenses.filter((exp) => {
    const matchesSearch = exp.remarks.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          exp.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || exp.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="w-full px-5 py-4 flex flex-col gap-4">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-emerald-950 tracking-tight">Expense History</h2>
        <p className="text-xs font-semibold text-emerald-800/60 mt-0.5 uppercase tracking-wider">
          Filter and search all household logs
        </p>
      </div>

      {/* Search Input */}
      <div className="relative flex items-center">
        <Search size={16} className="absolute left-4 text-emerald-600/70" />
        <input
          type="text"
          placeholder="Search by remarks or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full h-11 pl-10 pr-4 rounded-xl border border-emerald-100 bg-white/50 text-sm font-medium text-emerald-950 input-focus-glow transition-all"
        />
      </div>

      {/* Category filter pills (Horizontal scroll) */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar px-1 -mx-2">
        {categoryFilters.map((cat) => {
          const isActive = selectedCategory === cat;
          const info = CATEGORIES[cat] || { color: '#059669', bg: '#D1FAE5' };
          
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`
                py-2 px-4 rounded-xl text-xs font-bold whitespace-nowrap active:scale-95 transition-all cursor-pointer border
                ${isActive 
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/10' 
                  : 'bg-white text-emerald-950 border-emerald-100 hover:bg-emerald-50'
                }
              `}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Log list container */}
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center px-1">
          <span className="text-[10px] font-extrabold text-emerald-800/60 uppercase tracking-wider">
            Displaying {filteredExpenses.length} transaction{filteredExpenses.length === 1 ? '' : 's'}
          </span>
        </div>

        <div className="flex flex-col gap-3 min-h-[300px]">
          <AnimatePresence mode="popLayout">
            {filteredExpenses.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-2xl border border-dashed border-emerald-200 p-12 text-center glass-panel flex flex-col items-center justify-center"
              >
                <span className="text-xs text-emerald-800/60 font-bold">No matching expenses found.</span>
              </motion.div>
            ) : (
              filteredExpenses.map((exp) => {
                const Icon = CATEGORY_ICONS[exp.category] || FileText;
                const catInfo = CATEGORIES[exp.category] || CATEGORIES.Others;
                const dateObj = new Date(exp.date);
                const formattedDate = dateObj.toLocaleDateString('en-IN', { 
                  day: 'numeric', 
                  month: 'short',
                  year: 'numeric' 
                });

                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    key={exp.id}
                    className="rounded-2xl border border-emerald-100/35 p-4 shadow-premium glass-panel flex items-center justify-between group hover:bg-emerald-50/10 transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      {/* Icon */}
                      <div 
                        className="h-11 w-11 rounded-xl flex items-center justify-center shadow-inner flex-shrink-0"
                        style={{ backgroundColor: `${catInfo.color}12` }}
                      >
                        <Icon size={20} style={{ color: catInfo.color }} />
                      </div>
                      
                      {/* Remarks and metadata */}
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-emerald-950 capitalize truncate max-w-[170px]">
                          {exp.remarks}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-extrabold uppercase" style={{ color: catInfo.color }}>
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

                    {/* Amount & Actions */}
                    <div className="flex items-center gap-2">
                      <span className="text-base font-black text-emerald-950">
                        -₹{exp.amount.toLocaleString('en-IN')}
                      </span>
                      
                      <button
                        onClick={() => onEditExpense(exp)}
                        className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 active:scale-90 transition-all cursor-pointer"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => onDeleteRequest(exp.id)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-600 active:scale-90 transition-all cursor-pointer"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
