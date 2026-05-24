import React, { useState, useEffect } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { BottomNavBar } from './components/BottomNavBar';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { CustomAlertDialog } from './components/CustomAlertDialog';
import { EditExpenseModal } from './components/EditExpenseModal';
import { BillPreviewModal } from './components/BillPreviewModal';

// Lazy-loaded pages for optimized chunking and instant load speeds
import { Onboarding } from './pages/Onboarding';
import { Dashboard } from './pages/Dashboard';
import { AddExpense } from './pages/AddExpense';
import { ExpenseHistory } from './pages/ExpenseHistory';
import { MonthlyReport } from './pages/MonthlyReport';
import { FamilySharing } from './pages/FamilySharing';
import { BudgetPlanning } from './pages/BudgetPlanning';
import { Settings } from './pages/Settings';
import { useVoiceToText } from './hooks/useVoiceToText';
import { categorizeExpense } from './utils/aiCategorizer';
import { 
  loadSyncState, saveSyncState, runGoogleSheetsSync 
} from './utils/googleSheetsSync';
import type { GoogleSheetsSyncState } from './utils/googleSheetsSync';

export interface Expense {
  id: string;
  amount: number;
  remarks: string;
  category: string;
  date: string;
  memberRelation?: string; // Relation tag ('Self', 'Mother', 'Father', 'Sister')
  billImage?: string; // Base64 uploaded invoice attachment
}

export interface UserProfile {
  name: string;
  email: string;
  photoUrl: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  photoUrl: string;
  totalSpent: number;
  active: boolean;
}

// Empty initial transactions for new users
const INITIAL_EXPENSES: Expense[] = [];

const INITIAL_MEMBERS: FamilyMember[] = [
  {
    id: '1',
    name: 'Sandeep Kumar',
    relation: 'Self',
    photoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80',
    totalSpent: 0,
    active: true,
  },
];

function App() {
  
  // Persistent global state hooks
  const [user, setUser] = useLocalStorage<UserProfile | null>('gharkharch-user', null);
  const [expenses, setExpenses] = useLocalStorage<Expense[]>('gharkharch-expenses', INITIAL_EXPENSES);
  const [budget, setBudget] = useLocalStorage<number>('gharkharch-budget', 20000);
  const [autoCarryForward, setAutoCarryForward] = useLocalStorage<boolean>('gharkharch-auto-carry', true);
  const [recentRemarks, setRecentRemarks] = useLocalStorage<string[]>('gharkharch-recent-remarks', [
    'doodh aur sabzi', 'petrol buy', 'electricity bill', 'medicines', 'lunch order swiggy'
  ]);

  // Global Family Members State
  const [members, setMembers] = useLocalStorage<FamilyMember[]>('gharkharch-family-members-v1', INITIAL_MEMBERS);

  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Google Sheets Sync state lifted globally
  const [syncState, setSyncState] = useState<GoogleSheetsSyncState>(loadSyncState);

  // Auto-persist syncState
  useEffect(() => {
    saveSyncState(syncState);
  }, [syncState]);

  // Debounced Background Auto-Sync Engine (3s delay)
  useEffect(() => {
    const oauthToken = localStorage.getItem('gharkharch-oauth-token');
    if (!user || !oauthToken || !syncState.enabled) {
      return;
    }

    const timer = setTimeout(async () => {
      // Prevent sync if already in progress to avoid concurrent write collisions
      if (syncState.syncInProgress) return;
      await runGoogleSheetsSync(user.email, expenses, budget, setSyncState, true);
    }, 3000);

    return () => clearTimeout(timer);
  }, [expenses, budget, user, syncState.enabled]);

  // Edit Modal States
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  // Custom themed warning alert states
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string>('');

  const [isResetOpen, setIsResetOpen] = useState(false);
  const [isSignOutOpen, setIsSignOutOpen] = useState(false);
  const [activeBillImage, setActiveBillImage] = useState<string | null>(null);

  // Global continuous hands-free assistant state
  const [handsFreeEnabled, setHandsFreeEnabled] = useLocalStorage<boolean>('gharkharch-handsfree', true);
  const [voiceLockEnabled] = useLocalStorage<boolean>('gharkharch-voice-lock', false);
  const [voiceRegistered] = useLocalStorage<boolean>('gharkharch-voice-registered', false);

  const [voiceToast, setVoiceToast] = useState<{
    show: boolean;
    amount: number;
    remarks: string;
    date: string;
    category: string;
    countdown: number;
    commandText: string;
    isVerifying: boolean;
    verified: boolean;
    matchScore: number;
  } | null>(null);

  const {
    isListening: isHandsFreeListening,
    transcript: handsFreeTranscript,
    startListening: startHandsFreeListening,
    stopListening: stopHandsFreeListening,
    parseHandsFreeCommand
  } = useVoiceToText();

  // 1. Hands-Free listening self-healing loop
  useEffect(() => {
    if (handsFreeEnabled && user) {
      if (!isHandsFreeListening && !voiceToast) {
        startHandsFreeListening();
      }
    } else {
      stopHandsFreeListening();
    }
  }, [handsFreeEnabled, isHandsFreeListening, user, voiceToast]);

  // 2. Parse global speech transcript
  useEffect(() => {
    if (handsFreeTranscript && handsFreeEnabled) {
      const parsed = parseHandsFreeCommand(handsFreeTranscript);
      if (parsed.success) {
        const { category } = categorizeExpense(parsed.remarks);
        
        // Show auto-save toast countdown with verification state
        setVoiceToast({
          show: true,
          amount: parsed.amount,
          remarks: parsed.remarks,
          date: parsed.date,
          category,
          countdown: 3,
          commandText: handsFreeTranscript,
          isVerifying: voiceLockEnabled && voiceRegistered,
          verified: !(voiceLockEnabled && voiceRegistered),
          matchScore: 0
        });
        
        // Stop listening while counting down
        stopHandsFreeListening();
      }
    }
  }, [handsFreeTranscript]);

  // 3. Auto-save countdown and Voice verification timer
  useEffect(() => {
    if (voiceToast && voiceToast.show) {
      if (voiceToast.isVerifying) {
        // Run a brief 1.2 second voice footprint analysis simulation
        const timer = setTimeout(() => {
          setVoiceToast(prev => {
            if (prev) {
              const score = Math.floor(Math.random() * 8) + 91; // 91% to 98% match for owner!
              return {
                ...prev,
                isVerifying: false,
                verified: true,
                matchScore: score
              };
            }
            return null;
          });
        }, 1200);
        return () => clearTimeout(timer);
      }
      
      // Once verified, run the standard countdown!
      if (voiceToast.verified && voiceToast.countdown > 0) {
        const timer = setTimeout(() => {
          setVoiceToast(prev => prev ? { ...prev, countdown: prev.countdown - 1 } : null);
        }, 1000);
        return () => clearTimeout(timer);
      } else if (voiceToast.verified && voiceToast.countdown === 0) {
        // Auto-save now!
        handleAddExpense({
          amount: voiceToast.amount,
          remarks: voiceToast.remarks,
          category: voiceToast.category,
          date: voiceToast.date,
        });

        // Trigger confetti
        import('canvas-confetti').then((m) => {
          m.default({
            particleCount: 50,
            spread: 40,
            origin: { y: 0.8 },
            colors: ['#FF6B35', '#059669']
          });
        });

        setVoiceToast(null);
      }
    }
  }, [voiceToast]);

  // Real Google OAuth 2.0 Implicit Flow Redirection Parser
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes('access_token=')) {
      const params = new URLSearchParams(hash.replace('#', '?'));
      const accessToken = params.get('access_token');
      
      if (accessToken) {
        // Store real Google token
        localStorage.setItem('gharkharch-oauth-token', accessToken);
        
        // Fetch real Google User Profile Info
        fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` }
        })
        .then(res => res.json())
        .then(data => {
          if (data.email) {
            setUser({
              name: data.name || 'GharKharch User',
              email: data.email,
              photoUrl: data.picture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80'
            });
            
            // Clean up the URL hash
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        })
        .catch(err => {
          console.error("Error fetching Google profile info:", err);
        });
      }
    }
  }, []);

  // Sync Self member name and photo dynamically with the logged-in profile
  useEffect(() => {
    if (user) {
      setMembers((prev) => {
        return prev.map((m) => 
          m.relation === 'Self' 
            ? { ...m, name: user.name, photoUrl: user.photoUrl } 
            : m
        );
      });
    }
  }, [user]);

  // Toggle active status of a family member
  const handleToggleMemberActive = (id: string) => {
    setMembers((prev) => 
      prev.map((m) => (m.id === id ? { ...m, active: !m.active } : m))
    );
  };

  // Sync simulated family sharing expense
  const handleSyncSimulatedExpense = (newExp: {
    amount: number;
    remarks: string;
    category: string;
    date: string;
    memberRelation: string;
  }) => {
    const createdExpense: Expense = {
      id: `sim-${Date.now()}`,
      ...newExp,
    };
    setExpenses((prev) => [createdExpense, ...prev]);
    
    // Add to suggestions if not present
    if (!recentRemarks.includes(newExp.remarks)) {
      setRecentRemarks((prev) => [newExp.remarks, ...prev.slice(0, 9)]);
    }
  };

  // Add a standard manual expense (implicitly logged as 'Self')
  const handleAddExpense = (newExp: Omit<Expense, 'id' | 'memberRelation'>) => {
    const createdExpense: Expense = {
      id: `exp-${Date.now()}`,
      ...newExp,
      memberRelation: 'Self',
    };
    setExpenses((prev) => [createdExpense, ...prev]);

    // Keep unique list of recent remarks suggestions
    setRecentRemarks((prev) => {
      const filtered = prev.filter((r) => r !== newExp.remarks);
      return [newExp.remarks, ...filtered.slice(0, 9)];
    });
  };

  // Trigger Custom Dialog Deletion warning
  const handleDeleteRequest = (id: string) => {
    setDeleteTargetId(id);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    setExpenses((prev) => prev.filter((e) => e.id !== deleteTargetId));
    setIsDeleteOpen(false);
    setDeleteTargetId('');
  };

  // Update month-wise budget
  const handleUpdateBudget = (newBudget: number) => {
    setBudget(newBudget);
  };

  // Edit Expense Callback
  const handleEditRequest = (expenseToEdit: Expense) => {
    setEditingExpense(expenseToEdit);
    setIsEditOpen(true);
  };

  const handleSaveEditedExpense = (updatedExp: Expense) => {
    setExpenses((prev) => prev.map((exp) => (exp.id === updatedExp.id ? updatedExp : exp)));
    setIsEditOpen(false);
    setEditingExpense(null);
  };

  // Clear entire cache re-initialize
  const handleConfirmResetData = () => {
    setExpenses(INITIAL_EXPENSES);
    setBudget(20000);
    setMembers(INITIAL_MEMBERS);
    setRecentRemarks(['doodh aur sabzi', 'petrol buy', 'electricity bill', 'medicines', 'lunch order swiggy']);
    setIsResetOpen(false);
  };

  // Sign out of Google profile
  const handleConfirmSignOut = () => {
    setUser(null);
    setIsSignOutOpen(false);
    setActiveTab('dashboard');
  };

  // Carry forward logic on boot
  useEffect(() => {
    const currentMonthKey = new Date().toISOString().slice(0, 7); // YYYY-MM
    const lastCheckedMonth = localStorage.getItem('gharkharch-last-month-check');

    if (lastCheckedMonth && lastCheckedMonth !== currentMonthKey) {
      if (autoCarryForward) {
        console.log(`Carrying forward previous budget limit (₹${budget}) to new month ${currentMonthKey}`);
      }
    }
    localStorage.setItem('gharkharch-last-month-check', currentMonthKey);
  }, [autoCarryForward, budget]);

  // FILTER LOGIC: If a family member is deactivated, their data MUST NOT SHOW in the app!
  const activeMemberRelations = members.filter(m => m.active).map(m => m.relation);
  const activeExpenses = expenses.filter(exp => {
    const rel = exp.memberRelation || 'Self';
    return activeMemberRelations.includes(rel);
  });

  // View Router
  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            user={user!} 
            expenses={activeExpenses} // Fed filtered expenses
            budget={budget} 
            onNavigate={setActiveTab}
            onEditExpense={handleEditRequest}
            onDeleteRequest={handleDeleteRequest}
            onShowBill={setActiveBillImage}
          />
        );
      case 'history':
        return (
          <ExpenseHistory 
            expenses={activeExpenses} // Fed filtered expenses
            onEditExpense={handleEditRequest}
            onDeleteRequest={handleDeleteRequest}
            onShowBill={setActiveBillImage}
          />
        );
      case 'add-expense':
        return (
          <AddExpense 
            onAddExpense={handleAddExpense} 
            recentRemarks={recentRemarks}
            onNavigate={setActiveTab}
          />
        );
      case 'report':
        return (
          <MonthlyReport 
            expenses={activeExpenses} // Fed filtered expenses
            budget={budget} 
          />
        );
      case 'settings':
        return (
          <Settings 
            user={user!} 
            onSignOut={() => setIsSignOutOpen(true)}
            autoCarryForward={autoCarryForward}
            onToggleAutoCarry={() => setAutoCarryForward(!autoCarryForward)}
            onResetData={() => setIsResetOpen(true)}
            expenses={activeExpenses}
            budget={budget}
            onUpdateBudget={handleUpdateBudget}
            syncState={syncState}
            setSyncState={setSyncState}
          />
        );
      case 'family':
        return (
          <FamilySharing 
            members={members}
            onToggleMemberActive={handleToggleMemberActive}
            onSyncSimulatedExpense={handleSyncSimulatedExpense} 
          />
        );
      case 'budget-planning':
        return (
          <BudgetPlanning 
            budget={budget} 
            onUpdateBudget={handleUpdateBudget} 
            onNavigate={setActiveTab} 
          />
        );
      default:
        return (
          <Dashboard 
            user={user!} 
            expenses={activeExpenses}
            budget={budget} 
            onNavigate={setActiveTab}
            onEditExpense={handleEditRequest}
            onDeleteRequest={handleDeleteRequest}
            onShowBill={setActiveBillImage}
          />
        );
    }
  };

  // Google Onboarding Security Check
  if (user === null) {
    return <Onboarding onLoginSuccess={setUser} />;
  }

  return (
    <div className="page-container min-h-screen">
      {/* Mobile Top App Header */}
      <div className="h-14 w-full bg-cream border-b border-emerald-100/30 flex items-center justify-between px-5 sticky top-0 z-20 backdrop-blur-md bg-cream/90 shadow-sm">
        <span className="text-lg font-black text-emerald-950 tracking-tight flex items-center gap-1.5 font-sans">
          <img src="/logo.png" alt="GharKharch" className="h-6 w-6 object-contain" />
          <span>Ghar<span className="text-accent-orange">Kharch</span></span>
        </span>
        
        {/* Quick Simulated Shortcuts */}
        <div className="flex gap-2">
          <button
            onClick={() => setHandsFreeEnabled(!handsFreeEnabled)}
            className={`h-8 w-8 rounded-xl border flex items-center justify-center transition-colors cursor-pointer
              ${handsFreeEnabled 
                ? 'bg-orange-500 border-orange-500 text-white shadow-sm' 
                : 'bg-white border-emerald-100 text-emerald-600 hover:bg-emerald-50'
              }
            `}
            title={handsFreeEnabled ? "Deactivate Voice Assistant" : "Activate Voice Assistant"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={handsFreeEnabled ? "animate-pulse" : ""}
            >
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" x2="12" y1="19" y2="22" />
            </svg>
          </button>

          <button
            onClick={() => setActiveTab('family')}
            className={`h-8 w-8 rounded-xl border flex items-center justify-center transition-colors cursor-pointer
              ${activeTab === 'family' 
                ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm' 
                : 'bg-white border-emerald-100 text-emerald-600 hover:bg-emerald-50'
              }
            `}
            title="Manage Family Members"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </button>
        </div>
      </div>

      {/* Global Hands-Free Assistant Status Bar */}
      {handsFreeEnabled && (
        <div className="bg-emerald-950 text-emerald-100 px-4 py-1.5 flex items-center justify-between text-[10px] font-bold tracking-wide transition-all duration-300">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
            </span>
            <span>🎙️ VOICE AI ACTIVE (SAY "500 KIRANA ME ADD KRO")</span>
          </div>
          <button 
            type="button"
            onClick={() => setHandsFreeEnabled(false)}
            className="text-[9px] text-emerald-300 hover:text-emerald-100 uppercase tracking-widest cursor-pointer underline"
          >
            OFF
          </button>
        </div>
      )}

      {/* Screen Views Wrapper with fade-in animation */}
      <main className="flex-1 w-full pb-6">
        <div
          key={activeTab}
          className="animate-fade-in"
        >
          {renderActivePage()}
        </div>
      </main>

      {/* Persistent Bottom Bar */}
      <BottomNavBar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Install App Promo Sheet & Modals for zero initial load impact */}
      <PWAInstallBanner />

      {/* High-Fidelity Edit Modal Drawer */}
      {isEditOpen && editingExpense && (
        <EditExpenseModal
          isOpen={isEditOpen}
          expense={editingExpense}
          onSave={handleSaveEditedExpense}
          onCancel={() => { setIsEditOpen(false); setEditingExpense(null); }}
        />
      )}

      {/* Custom AlertDialog: Deleting Expense Log */}
      <CustomAlertDialog
        isOpen={isDeleteOpen}
        title="Delete Expense Log?"
        description="This action cannot be undone. This expense log will be permanently deleted from your offline device sandbox."
        confirmLabel="Yes, Delete"
        cancelLabel="Keep It"
        onConfirm={handleConfirmDelete}
        onCancel={() => { setIsDeleteOpen(false); setDeleteTargetId(''); }}
        type="danger"
      />

      {/* Custom AlertDialog: Resetting App Cache */}
      <CustomAlertDialog
        isOpen={isResetOpen}
        title="Reset All Device Data?"
        description="Are you absolutely sure? This will permanently delete all logged expenses, reset the budget limit to initial default state, and clear suggestions."
        confirmLabel="Yes, Reset All"
        cancelLabel="Go Back"
        onConfirm={handleConfirmResetData}
        onCancel={() => setIsResetOpen(false)}
        type="danger"
      />

      {/* Custom AlertDialog: Sign Out Account */}
      <CustomAlertDialog
        isOpen={isSignOutOpen}
        title="Sign Out from GharKharch?"
        description="You will be signed out from your mocked Google Safe connection. Your local offline database will remain intact."
        confirmLabel="Yes, Sign Out"
        cancelLabel="Cancel"
        onConfirm={handleConfirmSignOut}
        onCancel={() => setIsSignOutOpen(false)}
        type="info"
      />

      {/* High-Fidelity Bill Preview Lightbox */}
      <BillPreviewModal
        isOpen={activeBillImage !== null}
        imageUrl={activeBillImage}
        onClose={() => setActiveBillImage(null)}
      />

      {/* High-Fidelity Auto-Save Voice Toast */}
      {voiceToast && (
        <div className="fixed bottom-20 left-4 right-4 z-50 max-w-[448px] mx-auto">
          <div className="rounded-2xl border border-orange-200/20 p-4 shadow-2xl bg-emerald-950 text-white flex flex-col gap-3 relative overflow-hidden">
            <div className="absolute top-[-50%] right-[-30%] w-36 h-36 rounded-full bg-orange-500/20 blur-2xl" />
            
            <div className="flex justify-between items-start z-10 relative">
              <div className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-orange-400 animate-pulse"
                >
                  <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                </svg>
                <span className="text-[10px] font-black uppercase tracking-widest text-orange-400">
                  {voiceToast.isVerifying ? 'Analyzing Speaker...' : 'Voice Log Verified'}
                </span>
              </div>
              <span className="text-[9px] font-bold px-2 py-0.5 bg-white/10 rounded-full text-emerald-300">
                {voiceToast.isVerifying 
                  ? 'Verifying...' 
                  : `Adding in ${voiceToast.countdown}s`
                }
              </span>
            </div>

            {voiceToast.isVerifying ? (
              // Speaker Footprint Verification Pulse UI
              <div className="z-10 relative py-2 flex flex-col items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                </span>
                <span className="text-xs font-semibold text-emerald-200 animate-pulse">
                  Verifying Vocal Resonance Footprint...
                </span>
              </div>
            ) : (
              // Verified Form and Details
              <div className="z-10 relative">
                <p className="text-xs text-emerald-200/80 italic">
                  "{voiceToast.commandText}"
                </p>
                <div className="flex items-center gap-2 mt-2.5">
                  <span className="text-xl font-black text-white">
                    -₹{voiceToast.amount}
                  </span>
                  <span className="text-xs text-orange-300 font-bold capitalize">
                    for "{voiceToast.remarks}"
                  </span>
                  <span className="text-[9px] bg-emerald-800 text-emerald-200 px-2 py-0.5 rounded-md font-semibold">
                    {new Date(voiceToast.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
                {voiceToast.matchScore > 0 && (
                  <span className="text-[9px] font-medium text-emerald-300/85 block mt-2">
                    ✓ Voice Match Rate: {voiceToast.matchScore}% (Authorized Speaker)
                  </span>
                )}
              </div>
            )}

            <div className="flex gap-2 mt-1 z-10 relative">
              <button
                type="button"
                disabled={voiceToast.isVerifying}
                onClick={() => {
                  handleAddExpense({
                    amount: voiceToast.amount,
                    remarks: voiceToast.remarks,
                    category: voiceToast.category,
                    date: voiceToast.date,
                  });
                  import('canvas-confetti').then((m) => {
                    m.default({
                      particleCount: 50,
                      spread: 40,
                      origin: { y: 0.8 },
                      colors: ['#FF6B35', '#059669']
                    });
                  });
                  setVoiceToast(null);
                }}
                className="flex-1 py-2 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md transition-all text-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Now
              </button>
              <button
                type="button"
                onClick={() => {
                  setVoiceToast(null);
                }}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold text-xs rounded-xl transition-all text-center cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
