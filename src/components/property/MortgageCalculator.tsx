import React, { useState } from 'react';
import { formatPrice } from '../../utils/formatters';
import { Calculator, DollarSign, Percent, Calendar, ShieldCheck } from 'lucide-react';

interface MortgageCalculatorProps {
  initialPrice: number;
  currency?: string;
}

export const MortgageCalculator: React.FC<MortgageCalculatorProps> = ({
  initialPrice,
  currency = 'USD'
}) => {
  const [price, setPrice] = useState<number>(initialPrice);
  const [downPaymentPct, setDownPaymentPct] = useState<number>(20);
  const [interestRate, setInterestRate] = useState<number>(5.8);
  const [loanYears, setLoanYears] = useState<number>(30);

  // Financial calculations
  const downPaymentAmount = (price * downPaymentPct) / 100;
  const loanPrincipal = price - downPaymentAmount;

  const monthlyRate = interestRate / 100 / 12;
  const totalMonths = loanYears * 12;

  const monthlyPayment =
    monthlyRate > 0
      ? (loanPrincipal * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths))) /
        (Math.pow(1 + monthlyRate, totalMonths) - 1)
      : loanPrincipal / totalMonths;

  const totalRepayment = monthlyPayment * totalMonths;
  const totalInterest = totalRepayment - loanPrincipal;

  return (
    <div className="glass-panel rounded-xl border border-[#d4af37]/25 p-6 shadow-xl font-mono text-xs">
      <div className="flex items-center gap-2 text-[#d4af37] tracking-widest uppercase font-semibold mb-4 pb-3 border-b border-white/10">
        <Calculator className="w-4 h-4 text-[#d4af37]" />
        <span>Private Wealth Mortgage & Financing Analysis</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Controls */}
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1.5">
              <span className="text-[#9eacb8] uppercase">Acquisition Price</span>
              <span className="text-[#f5f6f8] font-bold">{formatPrice(price, currency)}</span>
            </div>
            <input
              type="range"
              min={1000000}
              max={25000000}
              step={250000}
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="w-full accent-[#d4af37] h-1.5 bg-[#0a0c0e] rounded cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between mb-1.5">
              <span className="text-[#9eacb8] uppercase">Down Payment</span>
              <span className="text-[#f5f6f8] font-bold">
                {downPaymentPct}% ({formatPrice(downPaymentAmount, currency)})
              </span>
            </div>
            <input
              type="range"
              min={10}
              max={60}
              step={5}
              value={downPaymentPct}
              onChange={(e) => setDownPaymentPct(Number(e.target.value))}
              className="w-full accent-[#d4af37] h-1.5 bg-[#0a0c0e] rounded cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between mb-1.5">
              <span className="text-[#9eacb8] uppercase">Fixed Interest Rate</span>
              <span className="text-[#f5f6f8] font-bold">{interestRate.toFixed(1)}%</span>
            </div>
            <input
              type="range"
              min={2.5}
              max={9.0}
              step={0.1}
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="w-full accent-[#d4af37] h-1.5 bg-[#0a0c0e] rounded cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between mb-1.5">
              <span className="text-[#9eacb8] uppercase">Amortization Tenure</span>
              <span className="text-[#f5f6f8] font-bold">{loanYears} Years</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[15, 20, 30].map((yr) => (
                <button
                  key={yr}
                  onClick={() => setLoanYears(yr)}
                  className={`py-1.5 rounded border transition-all ${
                    loanYears === yr
                      ? 'border-[#d4af37] bg-[#d4af37]/20 text-[#f5f6f8] font-semibold'
                      : 'border-white/5 bg-[#14171d] text-[#9eacb8] hover:border-white/20'
                  }`}
                >
                  {yr} Yrs
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Card */}
        <div className="bg-[#12151a] rounded-lg p-5 border border-white/5 flex flex-col justify-between">
          <div>
            <span className="text-[10px] text-[#9eacb8] uppercase tracking-widest">
              ESTIMATED MONTHLY SERVICE
            </span>
            <div className="font-display text-3xl text-[#f2ca50] font-light mt-1">
              {formatPrice(Math.round(monthlyPayment), currency)}
              <span className="text-xs font-mono text-[#9eacb8] font-normal"> / mo</span>
            </div>
          </div>

          <div className="space-y-2 py-4 border-y border-white/5 my-2">
            <div className="flex justify-between">
              <span className="text-[#9eacb8]">LOAN PRINCIPAL:</span>
              <span className="text-[#f5f6f8]">{formatPrice(loanPrincipal, currency)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#9eacb8]">TOTAL INTEREST OVER TERM:</span>
              <span className="text-[#f5f6f8]">{formatPrice(Math.round(totalInterest), currency)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#9eacb8]">LTV (LOAN-TO-VALUE):</span>
              <span className="text-[#d4af37]">{100 - downPaymentPct}%</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-[#9eacb8]">
            <ShieldCheck className="w-4 h-4 text-[#d4af37] shrink-0" />
            <span>Underwriting verified through AURA Private Banking Syndicate partners.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
