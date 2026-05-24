import { useState } from 'react';
import { Users, UserPlus, Copy, RefreshCw, CheckCircle, ShieldCheck, ToggleLeft, ToggleRight } from 'lucide-react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { CustomAlertDialog } from '../components/CustomAlertDialog';
import { Avatar } from '../components/Avatar';

export interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  photoUrl: string;
  totalSpent: number;
  active: boolean;
}

interface FamilySharingProps {
  members: FamilyMember[];
  onToggleMemberActive: (id: string) => void;
  onSyncSimulatedExpense: (expense: {
    amount: number;
    remarks: string;
    category: string;
    date: string;
    memberRelation: string;
  }) => void;
}

export function FamilySharing({ members, onToggleMemberActive, onSyncSimulatedExpense }: FamilySharingProps) {
  const [copied, setCopied] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    type: 'danger' | 'info' | 'success';
    confirmLabel?: string;
  }>({
    isOpen: false,
    title: '',
    description: '',
    type: 'info',
    confirmLabel: 'Okay'
  });

  const triggerAlert = (title: string, description: string, type: 'danger' | 'info' | 'success' = 'info', confirmLabel = 'Okay') => {
    setAlertConfig({
      isOpen: true,
      title,
      description,
      type,
      confirmLabel
    });
  };

  const getInviteLink = () => {
    return `${window.location.origin}?invite=family-12948-sec`;
  };

  const handleCopyLink = () => {
    setCopied(true);
    navigator.clipboard.writeText(getInviteLink());
    
    confetti({
      particleCount: 40,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#059669', '#FF6B35']
    });

    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `Hey! Let's manage our household expenses together on GharKharch PWA! 🏡💰\n\nClick this invite link to install the app and sync our family budget instantly:\n${getInviteLink()}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleSimulateSync = () => {
    // Get list of currently active external family members (excluding Self)
    const activeExternalMembers = members.filter(m => m.active && m.relation !== 'Self');

    if (activeExternalMembers.length === 0) {
      triggerAlert(
        'Simulation Warning',
        'Please activate at least one family member (Mother, Father, or Sister) to simulate a synced expense!',
        'danger'
      );
      return;
    }

    setSyncing(true);
    setTimeout(() => {
      // Define possible simulated expenses grouped by their relation
      const simulatedExpensesByRelation: Record<string, { amount: number; remarks: string; category: string }[]> = {
        Father: [
          { amount: 1500, remarks: 'Electricity bill paid by Father', category: 'Utilities' },
          { amount: 350, remarks: 'Petrol refuel by Father', category: 'Travel' }
        ],
        Mother: [
          { amount: 450, remarks: 'Sabzi and fruits bought by Mother', category: 'Ration' },
          { amount: 1200, remarks: 'Monthly grocery ration bought by Mother', category: 'Ration' }
        ],
        Sister: [
          { amount: 800, remarks: 'Book purchased by Sister', category: 'Education' },
          { amount: 200, remarks: 'Stationery items bought by Sister', category: 'Education' }
        ]
      };

      // Randomly pick one of the active external members
      const randomMember = activeExternalMembers[Math.floor(Math.random() * activeExternalMembers.length)];
      const relation = randomMember.relation;
      
      const pool = simulatedExpensesByRelation[relation] || [
        { amount: 500, remarks: `${relation} logged household expense`, category: 'Others' }
      ];
      
      const randomExp = pool[Math.floor(Math.random() * pool.length)];
      const todayStr = new Date().toISOString().split('T')[0];

      // Notify parent app of simulated sync
      onSyncSimulatedExpense({
        amount: randomExp.amount,
        remarks: randomExp.remarks,
        category: randomExp.category,
        date: todayStr,
        memberRelation: relation
      });

      // Launch success confetti
      confetti({
        particleCount: 50,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#059669', '#FF6B35']
      });

      setSyncing(false);
      triggerAlert(
        'Simulated Sync Successful!',
        `Member: ${randomMember.name} (${relation})\nAdded: "${randomExp.remarks}" of ₹${randomExp.amount}`,
        'success'
      );
    }, 1200);
  };

  return (
    <div className="w-full px-5 py-4 flex flex-col gap-5">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-emerald-950 tracking-tight">Family Sharing</h2>
        <p className="text-xs font-semibold text-emerald-800/60 mt-0.5 uppercase tracking-wider">
          Manage shared household expenses
        </p>
      </div>

      {/* Share simulation banner card */}
      <div className="w-full rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 p-5 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-44 h-44 rounded-full bg-white/10 blur-xl" />
        <h3 className="text-lg font-black tracking-tight flex items-center gap-1.5 z-10 relative">
          <Users size={20} />
          Shared Family Hub
        </h3>
        <p className="text-xs font-semibold text-emerald-100/90 leading-relaxed mt-2 z-10 relative">
          Connect all family members to log expenses together. Everyone gets live categorization push notifications!
        </p>
        
        <div className="flex gap-2 mt-4 z-10 relative">
          <button
            onClick={handleSimulateSync}
            disabled={syncing}
            className="flex-1 h-10 bg-white hover:bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition-all disabled:opacity-70 cursor-pointer"
          >
            <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
            {syncing ? 'Syncing...' : 'Simulate Family Sync'}
          </button>
        </div>
      </div>

      {/* Members Spent list */}
      <div className="flex flex-col gap-3">
        <h4 className="text-xs font-black text-emerald-950 uppercase tracking-widest px-1">
          Active Family Members
        </h4>

        <div className="flex flex-col gap-2.5">
          {members.map((member) => {
            const isSelf = member.relation === 'Self';
            return (
              <div
                key={member.id}
                className={`
                  rounded-2xl border p-3.5 shadow-premium glass-panel flex items-center justify-between transition-all duration-200
                  ${member.active 
                    ? 'border-emerald-100/35 bg-white/75' 
                    : 'border-gray-200/50 bg-gray-100/40 opacity-60'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar
                      src={member.photoUrl}
                      name={member.name}
                      active={member.active}
                      className={`h-10 w-10 border shadow-sm transition-all
                        ${member.active ? 'border-emerald-100' : 'border-gray-200'}
                      `}
                    />
                    {/* Active dot */}
                    <span className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white
                      ${member.active ? 'bg-emerald-500' : 'bg-gray-400'}
                    `} />
                  </div>
                  <div>
                    <h4 className={`text-sm font-bold transition-all ${member.active ? 'text-emerald-950' : 'text-gray-500'}`}>
                      {member.name}
                    </h4>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`text-[9px] font-extrabold rounded-full px-2 py-0.5 uppercase tracking-wide inline-block border
                        ${member.active 
                          ? 'text-emerald-600 bg-emerald-50 border-emerald-100/40' 
                          : 'text-gray-500 bg-gray-100 border-gray-200'
                        }
                      `}>
                        {member.relation}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Spent amount & Toggle */}
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-[9px] font-bold text-emerald-800/50 uppercase block">Spent this Month</span>
                    <span className={`text-sm font-black transition-all ${member.active ? 'text-emerald-950' : 'text-gray-400 line-through'}`}>
                      ₹{member.active ? member.totalSpent.toLocaleString('en-IN') : '0'}
                    </span>
                  </div>

                  {/* Toggle Button (Hidden for Self to prevent self-deactivation) */}
                  {!isSelf && (
                    <button
                      onClick={() => onToggleMemberActive(member.id)}
                      className="text-emerald-600 hover:text-emerald-700 active:scale-90 transition-all cursor-pointer flex-shrink-0"
                    >
                      {member.active ? (
                        <ToggleRight size={32} className="text-emerald-600" />
                      ) : (
                        <ToggleLeft size={32} className="text-gray-400" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Invite Member dialog form */}
      <div className="rounded-2xl border border-emerald-100/40 p-4 shadow-premium glass-panel flex flex-col gap-3">
        <div className="flex items-center gap-1.5">
          <UserPlus size={16} className="text-emerald-700" />
          <h4 className="text-xs font-black text-emerald-950 uppercase tracking-widest">
            Invite Family Member
          </h4>
        </div>
        
        <p className="text-xs text-emerald-800/70 leading-relaxed">
          Copy this unique sharing link to invite Mother, Father, Brother, or Sister to this GharKharch budget:
        </p>

        <div className="flex gap-2.5">
          <div className="h-11 flex-1 bg-white/70 border border-emerald-100 rounded-xl px-3 flex items-center justify-between text-xs font-semibold text-emerald-900 shadow-inner min-w-0">
            <span className="truncate pr-2">{getInviteLink()}</span>
            <button
              onClick={handleCopyLink}
              className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 active:scale-90 transition-all flex-shrink-0 cursor-pointer"
              title="Copy Link"
            >
              {copied ? <CheckCircle size={16} className="text-emerald-600" /> : <Copy size={16} />}
            </button>
          </div>
          
          <button
            onClick={handleWhatsAppShare}
            className="h-11 px-4 bg-[#25D366] hover:bg-[#20BA5A] active:scale-95 text-white rounded-xl shadow-md shadow-green-500/10 flex items-center justify-center gap-1.5 font-bold text-xs transition-all cursor-pointer flex-shrink-0"
          >
            {/* Custom WhatsApp SVG icon */}
            <svg className="h-4.5 w-4.5 fill-current" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.705 1.456h.008c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Share
          </button>
        </div>

        {copied && (
          <motion.span
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[10px] font-bold text-emerald-700 self-center"
          >
            Link Copied! Send to family via WhatsApp.
          </motion.span>
        )}
      </div>

      {/* Security note */}
      <div className="flex items-center justify-center gap-1.5 text-[9px] font-bold text-emerald-800/60 uppercase tracking-wider text-center mt-2">
        <ShieldCheck size={14} className="text-emerald-600/70" />
        <span>End-to-End family encrypted sync</span>
      </div>

      {/* Local custom alert */}
      <CustomAlertDialog
        isOpen={alertConfig.isOpen}
        title={alertConfig.title}
        description={alertConfig.description}
        confirmLabel={alertConfig.confirmLabel}
        cancelLabel=""
        onConfirm={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))}
        onCancel={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))}
        type={alertConfig.type}
      />
    </div>
  );
}
