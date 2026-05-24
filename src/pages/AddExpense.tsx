import React, { useState, useEffect, useRef } from 'react';
import { CustomDatePicker } from '../components/CustomDatePicker';
import { categorizeExpense, CATEGORIES } from '../utils/aiCategorizer';
import { useVoiceToText } from '../hooks/useVoiceToText';
import { 
  ShoppingCart, Lightbulb, Car, BookOpen, HeartPulse, 
  Utensils, Tv, FileText, Mic, MicOff, Check, X, Sparkles,
  Camera, Upload, Image, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { CustomAlertDialog } from '../components/CustomAlertDialog';

interface AddExpenseProps {
  onAddExpense: (expense: {
    amount: number;
    remarks: string;
    category: string;
    date: string;
    billImage?: string;
  }) => void;
  recentRemarks: string[];
  onNavigate: (tab: string) => void;
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

// Popular mock suggestions
const POPULAR_SUGGESTIONS = [
  'Doodh aur bread',
  'Sabzi and fruits',
  'Uber ride to office',
  'Electricity bill',
  'Medicine for Papa',
  'Swiggy order',
  'Netflix subscription',
  'Chai and samosa',
];

export function AddExpense({ onAddExpense, recentRemarks, onNavigate }: AddExpenseProps) {
  const todayStr = new Date().toISOString().split('T')[0];
  
  const [amount, setAmount] = useState('');
  const [remarks, setRemarks] = useState('');
  const [date, setDate] = useState(todayStr);
  const [showVoiceDialog, setShowVoiceDialog] = useState(false);
  const [billImage, setBillImage] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        triggerAlert('Invalid File', 'Please select a valid image file (PNG, JPG, HEIC, etc.)', 'danger');
        return;
      }
      // Validate size (max 5MB to prevent offline storage overload)
      if (file.size > 5 * 1024 * 1024) {
        triggerAlert('File Too Large', 'Please upload a smaller receipt image under 5MB.', 'danger');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setBillImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const [alertConfig, setAlertConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    type: 'danger' | 'info' | 'success';
  }>({
    isOpen: false,
    title: '',
    description: '',
    type: 'danger',
  });

  const triggerAlert = (title: string, description: string, type: 'danger' | 'info' | 'success' = 'danger') => {
    setAlertConfig({
      isOpen: true,
      title,
      description,
      type,
    });
  };

  const amountRef = useRef<HTMLInputElement>(null);
  const remarksRef = useRef<HTMLInputElement>(null);

  const {
    isListening,
    transcript,
    error: voiceError,
    supported: voiceSupported,
    startListening,
    stopListening,
    parseVoiceTranscript
  } = useVoiceToText({ interimResults: true });

  // Focus Amount input on load
  useEffect(() => {
    if (amountRef.current) {
      amountRef.current.focus();
    }
  }, []);

  // Sync voice transcript
  useEffect(() => {
    if (transcript) {
      const parsed = parseVoiceTranscript(transcript);
      if (parsed.amount > 0) {
        setAmount(String(parsed.amount));
      }
      if (parsed.remarks) {
        setRemarks(parsed.remarks);
      }
      if (parsed.amount > 0 && parsed.remarks) {
        setTimeout(() => {
          stopListening();
          setShowVoiceDialog(false);
        }, 350);
      }
    }
  }, [transcript]);

  const handleAmountKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && remarksRef.current) {
      e.preventDefault();
      remarksRef.current.focus();
    }
  };

  // Perform AI category categorization
  const { category, matchedKeyword, confidence } = categorizeExpense(remarks);
  const activeCatInfo = CATEGORIES[category] || CATEGORIES.Others;
  const CatIcon = CATEGORY_ICONS[category] || FileText;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);
    
    if (isNaN(numericAmount) || numericAmount <= 0) {
      triggerAlert('Invalid Amount', 'Please enter a valid amount greater than zero.', 'danger');
      return;
    }
    
    if (!remarks.trim()) {
      triggerAlert('Remarks Required', 'Please enter some remarks describing the expense.', 'danger');
      return;
    }

    onAddExpense({
      amount: numericAmount,
      remarks: remarks.trim(),
      category,
      date,
      billImage: billImage || undefined,
    });

    // Success fireworks confetti
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#059669', '#FF6B35', '#F5F2EA']
    });

    // Reset fields
    setAmount('');
    setRemarks('');
    setDate(todayStr);
    setBillImage('');

    // Redirect to home
    onNavigate('dashboard');
  };

  const selectSuggestion = (text: string) => {
    setRemarks(text);
    // Autofocus remarks input
    if (remarksRef.current) {
      remarksRef.current.focus();
    }
  };

  const handleMicClick = () => {
    if (!voiceSupported) {
      triggerAlert('Voice Support Unavailable', 'Voice Speech is not supported in this browser. Please try Google Chrome or Safari.', 'info');
      return;
    }
    setShowVoiceDialog(true);
    startListening();
  };

  const handleCloseVoiceDialog = () => {
    stopListening();
    setShowVoiceDialog(false);
  };

  // Filter suggestion list based on what user has typed so far
  const filteredSuggestions = POPULAR_SUGGESTIONS.filter(item => 
    remarks && item.toLowerCase().includes(remarks.toLowerCase()) && item.toLowerCase() !== remarks.toLowerCase()
  );

  return (
    <div className="w-full px-5 py-4 flex flex-col gap-5">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-emerald-950 tracking-tight">Add Expense</h2>
        <p className="text-xs font-semibold text-emerald-800/60 mt-0.5 uppercase tracking-wider">
          AI Auto-Category Engine Active
        </p>
      </div>

      {/* Main Expense Form */}
      <form onSubmit={handleSave} className="flex flex-col gap-4">
        {/* Card base */}
        <div className="rounded-2xl border border-emerald-100/40 p-5 shadow-premium glass-panel flex flex-col gap-4">
          
          {/* Amount input */}
          <div className="relative">
            <label className="block text-xs font-bold text-emerald-800 mb-1 px-1">Amount (INR)</label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-xl font-bold text-emerald-900">₹</span>
              <input
                ref={amountRef}
                type="number"
                inputMode="decimal"
                pattern="[0-9]*"
                autoFocus
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                onKeyDown={handleAmountKeyDown}
                className="w-full h-14 pl-9 pr-4 rounded-xl border border-emerald-100 bg-white/50 text-xl font-bold text-emerald-950 input-focus-glow transition-all"
                required
              />
            </div>
          </div>

          {/* Remarks/Description Input with Voice trigger */}
          <div className="relative">
            <label className="block text-xs font-bold text-emerald-800 mb-1 px-1">Remarks / Spoken Text</label>
            <div className="relative flex items-center">
              <input
                ref={remarksRef}
                type="text"
                placeholder="e.g. doodh aur sabzi, petrol, uber ride"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full h-12 pl-4 pr-11 rounded-xl border border-emerald-100 bg-white/50 text-sm font-medium text-emerald-950 input-focus-glow transition-all"
                required
              />
              <button
                type="button"
                onClick={handleMicClick}
                className="absolute right-3 p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 active:scale-95 transition-all"
              >
                <Mic size={18} />
              </button>
            </div>
          </div>

          {/* Dynamic Typeahead Suggestions (Directly below remarks field) */}
          {remarks && filteredSuggestions.length > 0 && (
            <div className="flex flex-col gap-1 px-1 mt-0.5 animate-fade-in">
              <span className="text-[9px] font-extrabold text-emerald-800/50 uppercase tracking-wider">
                Matching Suggestions
              </span>
              <div className="flex flex-wrap gap-1.5">
                {filteredSuggestions.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => selectSuggestion(item)}
                    className="py-1 px-2.5 rounded-lg bg-white/80 border border-emerald-100 hover:bg-emerald-50 text-[11px] font-bold text-emerald-900 transition-colors shadow-sm cursor-pointer active:scale-95"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Recently used & popular suggestions (Directly below remarks field) */}
          <div className="flex flex-col gap-1 px-1 mt-0.5 animate-fade-in">
            <span className="text-[9px] font-extrabold text-emerald-800/50 uppercase tracking-wider">
              {recentRemarks.length > 0 ? 'Recently Used Remarks' : 'Popular Suggestions'}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {(recentRemarks.length > 0 ? recentRemarks : POPULAR_SUGGESTIONS).slice(0, 6).map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => selectSuggestion(item)}
                  className="py-1 px-2.5 rounded-lg bg-white/80 border border-emerald-100/50 hover:bg-emerald-50 text-[11px] font-bold text-emerald-950 transition-colors shadow-sm cursor-pointer active:scale-95"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* AI Live Category Preview */}
          <AnimatePresence mode="wait">
            <motion.div
              key={category}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="mt-1 p-3 rounded-xl border flex items-center justify-between transition-all"
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
                    {remarks ? 'Auto Detected Category' : 'Awaiting Remarks'}
                  </span>
                  <span className="text-sm font-bold text-emerald-950">
                    {category}
                  </span>
                </div>
              </div>

              {remarks && confidence > 0 && (
                <div className="text-right">
                  <div className="flex items-center gap-1 text-[10px] font-extrabold text-emerald-800 uppercase">
                    <Sparkles size={10} className="text-orange-500" />
                    <span>{confidence}% Match</span>
                  </div>
                  {matchedKeyword && (
                    <span className="text-[9px] font-medium text-emerald-900/60">
                      via "{matchedKeyword}"
                    </span>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Theme custom date picker */}
          <CustomDatePicker
            selectedDate={date}
            onChange={setDate}
            label="Transaction Date"
          />

          {/* Bill / Invoice Receipt Attachment (Optional) */}
          <div className="relative mt-2">
            <label className="block text-xs font-bold text-emerald-800 mb-1 px-1">
              Attach Bill / Receipt (Optional)
            </label>
            
            {billImage ? (
              // Preview of uploaded bill
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-xl border border-emerald-100 bg-white/70 p-3.5 flex items-center justify-between shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-12 rounded-lg border border-emerald-100 overflow-hidden shadow-inner flex-shrink-0 bg-cream">
                    <img src={billImage} alt="Receipt Thumbnail" className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-100/50 rounded-full px-2.5 py-0.5 uppercase tracking-wide inline-block">
                      Attachment Ready
                    </span>
                    <p className="text-[10px] font-bold text-emerald-950 mt-1">
                      receipt_attachment.png
                    </p>
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={() => setBillImage('')}
                  className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 active:scale-90 transition-all cursor-pointer flex-shrink-0"
                  title="Remove Attachment"
                >
                  <Trash2 size={16} />
                </button>
              </motion.div>
            ) : (
              // Upload and Camera buttons side-by-side
              <div className="flex gap-3">
                {/* Upload File trigger */}
                <label className="flex-1 h-11 border border-dashed border-emerald-100 bg-white/40 hover:bg-emerald-50/30 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-800 cursor-pointer transition-all active:scale-[0.98]">
                  <Upload size={14} />
                  <span>Upload File</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                
                {/* Camera capture trigger */}
                <label className="flex-1 h-11 border border-dashed border-emerald-100 bg-white/40 hover:bg-emerald-50/30 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-800 cursor-pointer transition-all active:scale-[0.98]">
                  <Camera size={14} />
                  <span>Take Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>

        </div>
        {/* Save button */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          type="submit"
          className="w-full h-13 rounded-2xl bg-gradient-to-r from-amber-500 via-accent-orange to-accent-orange-hover hover:from-amber-600 hover:to-accent-orange-hover active:scale-95 text-white font-bold text-sm shadow-lg shadow-accent-orange/30 flex items-center justify-center gap-2 mt-2 transition-all cursor-pointer"
        >
          <Check size={18} />
          Save Household Expense
        </motion.button>
      </form>

      {/* High-Fidelity Voice Recording Dialog */}
      <AnimatePresence>
        {showVoiceDialog && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseVoiceDialog}
              className="fixed inset-0 bg-black z-40"
            />

            {/* Dialog sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed bottom-0 left-0 right-0 mx-auto max-w-[480px] bg-cream rounded-t-3xl border-t border-emerald-100/30 p-6 z-50 shadow-2xl glass-panel-dark pb-8 flex flex-col items-center"
            >
              <div className="w-full flex justify-between items-center mb-4">
                <span className="text-xs font-extrabold text-emerald-800 uppercase tracking-widest">
                  Voice Expense Entry
                </span>
                <button
                  onClick={handleCloseVoiceDialog}
                  className="p-1.5 rounded-full hover:bg-emerald-50 text-emerald-600"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Pulsing microphone status icon */}
              <div className="my-8 relative flex items-center justify-center">
                {isListening && (
                  <>
                    <motion.div
                      animate={{ scale: [1, 1.8, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="absolute w-24 h-24 bg-emerald-100 rounded-full"
                    />
                    <motion.div
                      animate={{ scale: [1, 2.4, 1], opacity: [0.3, 0, 0.3] }}
                      transition={{ duration: 2, delay: 0.3, repeat: Infinity }}
                      className="absolute w-24 h-24 bg-emerald-50 rounded-full"
                    />
                  </>
                )}

                <button
                  type="button"
                  className={`
                    h-20 w-20 rounded-full flex items-center justify-center shadow-lg transition-all relative z-10
                    ${isListening ? 'bg-emerald-600 text-white animate-pulse' : 'bg-rose-500 text-white'}
                  `}
                >
                  {isListening ? <Mic size={32} /> : <MicOff size={32} />}
                </button>
              </div>

              {/* Status information */}
              <div className="text-center w-full px-4 mb-4">
                <h4 className="text-base font-bold text-emerald-950">
                  {isListening ? 'Listening to you...' : 'Processing audio...'}
                </h4>
                <p className="text-xs font-semibold text-emerald-800/60 mt-1">
                  Speak in Hindi, English or Hinglish
                </p>
                <p className="text-xs text-emerald-700/80 italic mt-2.5 bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100/40">
                  Try saying: "five hundred rupees spent on petrol" or "doodh ke liye do sau bees rupaye"
                </p>
              </div>

              {/* Output log */}
              {transcript && (
                <div className="w-full bg-white/70 rounded-xl border border-emerald-100/50 p-3 text-center mb-2 shadow-inner">
                  <span className="text-[9px] uppercase font-extrabold tracking-wider text-emerald-500 block mb-1">
                    Speech Recognized
                  </span>
                  <span className="text-sm font-bold text-emerald-950 italic">
                    "{transcript}"
                  </span>
                </div>
              )}

              {voiceError && (
                <div className="w-full bg-rose-50 border border-rose-100 text-rose-700 rounded-xl p-3 text-center text-xs font-semibold">
                  {voiceError}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Local custom validation alert */}
      <CustomAlertDialog
        isOpen={alertConfig.isOpen}
        title={alertConfig.title}
        description={alertConfig.description}
        confirmLabel="Okay"
        cancelLabel=""
        onConfirm={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))}
        onCancel={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))}
        type={alertConfig.type}
      />
    </div>
  );
}
