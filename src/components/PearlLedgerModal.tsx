import React, { useState } from 'react';
import { motion } from 'motion/react';
import { PearlIcon } from './PearlIcon';
import { storage } from '../services/storage';
import { User, XpTransaction, PearlTransaction } from '../types';
import { Sparkles, ArrowDownRight, ArrowUpRight, ShieldCheck, X } from 'lucide-react';
import { sound } from '../services/sound';

interface PearlLedgerModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
}

export const PearlLedgerModal: React.FC<PearlLedgerModalProps> = ({
  user,
  isOpen,
  onClose,
}) => {
  const [tab, setTab] = useState<'pearls' | 'xp'>('pearls');

  if (!isOpen) return null;

  const txs = storage.getTransactionsForCurrentUser();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.94 }}
        className="w-full max-w-sm max-h-[85vh] overflow-y-auto rounded-3xl bg-[#0D111A] border border-white/10 shadow-2xl p-6 text-white relative"
      >
        <button
          onClick={onClose}
          type="button"
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Currency Spotlight */}
        <div className="text-center pt-1 mb-5">
          <div className="flex items-center justify-center mb-2">
            <PearlIcon size="xl" animate />
          </div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            Vault Balance
          </span>
          <h2
            className="text-3xl font-black text-white tabular-nums tracking-tight mt-0.5"
            style={{ fontFamily: 'var(--font-display, sans-serif)' }}
          >
            {user.pearlBalance.toLocaleString()} Pearls
          </h2>
          <p className="text-[11px] text-slate-400 mt-1">
            Auditable transaction ledger. Pearls are earned purely through consistency.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center p-1 bg-slate-900 rounded-xl mb-4 border border-white/5">
          <button
            type="button"
            onClick={() => {
              sound.tap();
              setTab('pearls');
            }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              tab === 'pearls' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-400'
            }`}
          >
            Pearl Ledger ({txs.pearls.length})
          </button>
          <button
            type="button"
            onClick={() => {
              sound.tap();
              setTab('xp');
            }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              tab === 'xp' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-400'
            }`}
          >
            XP History ({txs.xp.length})
          </button>
        </div>

        {/* Transactions List */}
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {tab === 'pearls' ? (
            txs.pearls.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">No Pearl transactions yet.</p>
            ) : (
              txs.pearls.map((t: PearlTransaction) => (
                <div
                  key={t.id}
                  className="p-3 rounded-xl bg-slate-900/80 border border-white/5 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-emerald-400">
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white line-clamp-1">{t.reason}</p>
                      <p className="text-[10px] text-slate-500">{t.timestamp.split('T')[0]}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <PearlIcon size="xs" />
                    <span className="text-xs font-black text-emerald-400 tabular-nums">
                      +{t.amount}
                    </span>
                  </div>
                </div>
              ))
            )
          ) : txs.xp.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">No XP transactions yet.</p>
          ) : (
            txs.xp.map((t: XpTransaction) => (
              <div
                key={t.id}
                className="p-3 rounded-xl bg-slate-900/80 border border-white/5 flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white line-clamp-1">{t.reason}</p>
                    <p className="text-[10px] text-slate-500">{t.timestamp.split('T')[0]}</p>
                  </div>
                </div>
                <span className="text-xs font-black text-amber-300 tabular-nums shrink-0">
                  +{t.amount} XP
                </span>
              </div>
            ))
          )}
        </div>

        {/* Free app pledge */}
        <div className="mt-4 p-3 rounded-xl bg-slate-900/40 border border-white/5 flex items-center gap-2 text-[11px] text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Pearls cannot be bought with real money. The entire app is 100% free forever.</span>
        </div>
      </motion.div>
    </div>
  );
};
