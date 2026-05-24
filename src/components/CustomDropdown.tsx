import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export interface DropdownOption {
  value: string;
  label: string;
}

interface CustomDropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
}

export function CustomDropdown({ options, value, onChange, label, placeholder = 'Select option' }: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className="w-full relative" ref={dropdownRef}>
      {label && <label className="block text-xs font-semibold text-emerald-800 mb-1 px-1">{label}</label>}
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-12 px-4 rounded-xl border border-emerald-100 flex items-center justify-between text-left glass-panel hover:bg-emerald-50/50 transition-all duration-200"
      >
        <span className={`text-sm font-medium ${selectedOption ? 'text-emerald-950' : 'text-emerald-500'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown size={18} className={`text-emerald-600 transition-transform duration-250 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for Mobile */}
            <div className="fixed inset-0 z-30 md:hidden" onClick={() => setIsOpen(false)} />

            {/* Dropdown Options List */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 right-0 mt-2 z-40 bg-cream rounded-2xl border border-emerald-100/50 overflow-hidden shadow-2xl glass-panel-dark max-h-60 overflow-y-auto no-scrollbar"
            >
              <div className="py-1">
                {options.map((option) => {
                  const isSelected = option.value === value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleSelect(option.value)}
                      className={`
                        w-full h-11 px-4 flex items-center justify-between text-left text-sm font-medium transition-colors
                        ${isSelected 
                          ? 'bg-emerald-50 text-emerald-800 font-bold' 
                          : 'text-emerald-950 hover:bg-emerald-50/50 hover:text-emerald-700'
                        }
                      `}
                    >
                      <span>{option.label}</span>
                      {isSelected && <Check size={16} className="text-emerald-600" />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
