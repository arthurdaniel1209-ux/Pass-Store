import React, { useState, useEffect, useRef } from 'react';
import { cn } from '../lib/utils';

export interface CardData {
  number: string;
  holder: string;
  expMonth: string;
  expYear: string;
  cvv: string;
  isValid: boolean;
}

interface CheckoutCreditCardProps {
  onChange: (data: CardData) => void;
}

export function CheckoutCreditCard({ onChange }: CheckoutCreditCardProps) {
  const [number, setNumber] = useState('');
  const [holder, setHolder] = useState('');
  const [expMonth, setExpMonth] = useState('');
  const [expYear, setExpYear] = useState('');
  const [cvv, setCvv] = useState('');
  const [isFlipped, setIsFlipped] = useState(false);

  // Grouped card states
  const rawNum = number.replace(/\D/g, '').slice(0, 16);
  const groups = [
    rawNum.slice(0, 4).padEnd(4, '#'),
    rawNum.slice(4, 8).padEnd(4, '#'),
    rawNum.slice(8, 12).padEnd(4, '#'),
    rawNum.slice(12, 16).padEnd(4, '#')
  ];

  const formattedHolder = holder.trim() ? holder.toUpperCase() : 'NOME DO TITULAR';
  const formattedExpiry = `${expMonth || 'MM'}/${expYear || 'YY'}`;
  const formattedCvv = cvv ? '*'.repeat(cvv.length) : '***';

  // Trigger state updates up to parent
  useEffect(() => {
    const isNumValid = rawNum.length === 16;
    const isHolderValid = holder.trim().length >= 3;
    const isExpiryValid = expMonth !== '' && expYear !== '';
    const isCvvValid = cvv.length >= 3;

    onChange({
      number: rawNum,
      holder,
      expMonth,
      expYear,
      cvv,
      isValid: isNumValid && isHolderValid && isExpiryValid && isCvvValid
    });
  }, [rawNum, holder, expMonth, expYear, cvv]);

  // Handle formatted inputs
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 16);
    let formatted = val.replace(/(.{4})/g, '$1 ').trim();
    setNumber(formatted);
  };

  const handleHolderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHolder(e.target.value);
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 4);
    setCvv(val);
  };

  return (
    <div className="card-payment-wrapper relative z-10 w-full mt-6 flex flex-col items-center">
      {/* Visual Card Scene */}
      <div className="card-scene relative w-full max-w-[380px] aspect-[1.583/1] mb-8 select-none">
        
        {/* Blob Ambient Backdrop specifically for the card */}
        <div className="card-ambient-blobs absolute inset-0 -z-10 overflow-hidden rounded-3xl opacity-40">
          <div className="absolute w-[200px] h-[200px] bg-purple-500 rounded-full blur-[40px] -top-10 -left-10 animate-[drift_8s_ease-i-out_infinite_alternate]" />
          <div className="absolute w-[150px] h-[150px] bg-blue-500 rounded-full blur-[40px] -bottom-10 -right-10 animate-[drift_8s_ease-i-out_infinite_alternate_-3s]" />
          <div className="absolute w-[120px] h-[120px] bg-pink-500 rounded-full blur-[40px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-[drift_8s_ease-i-out_infinite_alternate_-5s]" />
        </div>

        <div className={cn("card-inner w-full h-full relative cursor-pointer", isFlipped && "flipped")}>
          
          {/* FRONT */}
          <div className="card-front absolute inset-0 rounded-[20px] p-6 sm:p-7 flex flex-col justify-between overflow-hidden shadow-2xl border border-white/5 bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] select-none text-white">
            {/* Conic gloss aurora effect */}
            <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0deg,rgba(168,85,247,0.15)_60deg,rgba(59,130,246,0.1)_120deg,transparent_180deg,rgba(236,72,153,0.1)_240deg,transparent_300deg)] animate-[aurora_12s_linear_infinite]" />
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5" />

            <div className="card-top flex items-center justify-between relative z-10">
              <div>
                <div className="card-brand font-mono text-[11px] sm:text-xs font-bold tracking-[0.15em] uppercase text-white/80">CREDIT CARD</div>
                <div className="chip w-10 h-8 sm:w-11 sm:h-8.5 rounded-md mt-3 relative overflow-hidden bg-gradient-to-br from-[#d4af37] via-[#f5d060] to-[#b8960c] border border-white/10 shadow-inner">
                  <div className="absolute top-[50%] left-0 right-0 h-[1px] bg-black/15 -translate-y-1/2" />
                  <div className="absolute left-[50%] top-0 bottom-0 w-[1px] bg-black/15 -translate-x-1/2" />
                </div>
              </div>
              <div className="mastercard-logo w-14 h-9 relative flex-shrink-0">
                <div className="mc-circle w-9 h-9 rounded-full absolute left-0 bg-[#eb001b]/80" />
                <div className="mc-circle w-9 h-9 rounded-full absolute left-5 bg-[#f79e1b]/80" />
              </div>
            </div>

            <div className="card-number-display relative z-10 font-mono text-base sm:text-lg tracking-[0.15em] text-white/90 drop-shadow-md flex justify-between items-center my-4 font-bold select-none">
              <span className={cn("transition-all duration-300", rawNum.length > 0 && rawNum.length <= 4 && "text-purple-400")}>{groups[0]}</span>
              <span className={cn("transition-all duration-300", rawNum.length > 4 && rawNum.length <= 8 && "text-purple-400")}>{groups[1]}</span>
              <span className={cn("transition-all duration-300", rawNum.length > 8 && rawNum.length <= 12 && "text-purple-400")}>{groups[2]}</span>
              <span className={cn("transition-all duration-300", rawNum.length > 12 && rawNum.length <= 16 && "text-purple-400")}>{groups[3]}</span>
            </div>

            <div className="card-bottom flex justify-between items-end relative z-10 select-none">
              <div className="min-w-0 pr-4">
                <div className="card-info-label text-[8px] sm:text-[9px] text-white/40 tracking-wider uppercase font-bold mb-1">CANT HOLDER</div>
                <div className="card-info-value font-mono text-[11px] sm:text-xs font-bold text-white/95 truncate uppercase">{formattedHolder}</div>
              </div>
              <div className="flex-shrink-0 text-right">
                <div className="card-info-label text-[8px] sm:text-[9px] text-white/40 tracking-wider uppercase font-bold mb-1">VALID THRU</div>
                <div className="card-info-value font-mono text-[11px] sm:text-xs font-bold text-white/95">{formattedExpiry}</div>
              </div>
            </div>
          </div>

          {/* BACK */}
          <div className="card-back absolute inset-0 rounded-[20px] overflow-hidden shadow-2xl border border-white/5 bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] select-none text-white">
            <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0deg,rgba(168,85,247,0.15)_60deg,rgba(59,130,246,0.1)_120deg,transparent_180deg)] animate-[aurora_12s_linear_infinite]" />
            <div className="magnetic-stripe absolute top-10 left-0 right-0 h-11 sm:h-12 bg-gradient-to-b from-[#111] via-[#222] to-[#111] z-10" />
            <div className="cvv-section absolute bottom-12 left-0 right-0 px-6 sm:px-7 z-10">
              <div className="cvv-label font-mono text-[9px] text-white/40 tracking-wider uppercase mb-1.5 text-right font-black">CVV</div>
              <div className="cvv-band bg-white/90 rounded-md h-10 flex items-center justify-end px-4">
                <span className="cvv-dots font-mono text-base font-bold text-slate-900 tracking-wider">{formattedCvv}</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Inputs Form */}
      <div className="form-card w-full bg-slate-50/50 dark:bg-slate-900/10 border border-slate-100 dark:border-white/5 rounded-3xl p-6 backdrop-blur-md space-y-4">
        
        {/* Card Number Input */}
        <div className="field flex flex-col gap-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Número do Cartão</label>
          <input
            type="text"
            required
            placeholder="1234 5678 9012 3456"
            maxLength={19}
            inputMode="numeric"
            autoComplete="off"
            value={number}
            onChange={handleNumberChange}
            className="w-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-white/5 shadow-sm rounded-xl py-3.5 px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-mono"
          />
        </div>

        {/* Card Holder Input */}
        <div className="field flex flex-col gap-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nome impresso no cartão</label>
          <input
            type="text"
            required
            placeholder="Nome Completo"
            autoComplete="off"
            value={holder}
            onChange={handleHolderChange}
            className="w-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-white/5 shadow-sm rounded-xl py-3.5 px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all uppercase"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          {/* Month */}
          <div className="field flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mês</label>
            <select
              value={expMonth}
              onChange={(e) => setExpMonth(e.target.value)}
              className="w-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-white/5 shadow-sm rounded-xl py-3.5 px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
            >
              <option value="">MM</option>
              {Array.from({ length: 12 }, (_, i) => {
                const val = String(i + 1).padStart(2, '0');
                return <option key={val} value={val}>{val}</option>;
              })}
            </select>
          </div>

          {/* Year */}
          <div className="field flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ano</label>
            <select
              value={expYear}
              onChange={(e) => setExpYear(e.target.value)}
              className="w-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-white/5 shadow-sm rounded-xl py-3.5 px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
            >
              <option value="">YY</option>
              {Array.from({ length: 8 }, (_, i) => {
                const val = String(26 + i);
                return <option key={val} value={val}>{val}</option>;
              })}
            </select>
          </div>

          {/* CVV */}
          <div className="field flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-pink-400">CVV</label>
            <input
              type="password"
              required
              placeholder="***"
              maxLength={4}
              inputMode="numeric"
              autoComplete="off"
              value={cvv}
              onFocus={() => setIsFlipped(true)}
              onBlur={() => setIsFlipped(false)}
              onChange={handleCvvChange}
              className="w-full bg-white dark:bg-slate-800 border border-pink-100/30 dark:border-pink-500/10 shadow-sm rounded-xl py-3.5 px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all font-mono"
            />
          </div>
        </div>

      </div>
    </div>
  );
}
