import { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Calculator, Download, Info, TrendingUp, TrendingDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';
import { GlassCard } from './ui/GlassCard';
import { Button } from './ui/Button';

function formatINR(n) {
  if (n >= 10000000) {
    return `₹${(n / 10000000).toFixed(2)} Cr`;
  } else if (n >= 100000) {
    return `₹${(n / 100000).toFixed(2)} L`;
  }
  return `₹${n.toLocaleString('en-IN')}`;
}

function formatCurrency(n, currency = 'INR') {
  if (currency === 'INR') {
    return formatINR(n);
  } else if (currency === 'USD') {
    return `$${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  } else if (currency === 'GBP') {
    return `£${n.toLocaleString('en-GB', { maximumFractionDigits: 0 })}`;
  }
  return `${currency} ${n.toLocaleString()}`;
}

function calcEMI(principal, annualRate, months) {
  if (annualRate === 0) return principal / months;
  const r = annualRate / 100 / 12;
  return Math.round((principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1));
}

function generateAmortizationSchedule(principal, annualRate, months) {
  const schedule = [];
  let balance = principal;
  const emi = calcEMI(principal, annualRate, months);
  const monthlyRate = annualRate / 100 / 12;
  let totalPrincipal = 0;
  let totalInterest = 0;

  for (let month = 1; month <= months; month++) {
    const interest = Math.round(balance * monthlyRate);
    const principalPaid = emi - interest;
    balance = Math.max(0, balance - principalPaid);
    totalPrincipal += principalPaid;
    totalInterest += interest;

    schedule.push({
      month,
      emi,
      principal: principalPaid,
      interest,
      balance,
      totalPrincipal,
      totalInterest,
    });
  }

  return schedule;
}

function groupByYear(schedule, principal) {
  const grouped = {};
  for (const item of schedule) {
    const year = Math.ceil(item.month / 12);
    if (!grouped[year]) {
      grouped[year] = {
        year,
        totalEMI: 0,
        totalPrincipal: 0,
        totalInterest: 0,
        openingBalance: 0,
        closingBalance: 0,
        months: [],
      };
    }
    if (item.month === 1 || year !== Math.ceil((item.month - 1) / 12)) {
      grouped[year].openingBalance = item.month === 1 ? principal : schedule[item.month - 1].balance;
    }
    grouped[year].totalEMI += item.emi;
    grouped[year].totalPrincipal += item.principal;
    grouped[year].totalInterest += item.interest;
    grouped[year].closingBalance = item.balance;
    grouped[year].months.push(item);
  }
  return Object.values(grouped);
}

export default function EMIProjection({ bank, loanAmount, onTenureChange }) {
  const [tenure, setTenure] = useState(bank?.tenure?.options?.includes(10) ? 10 : bank?.tenure?.options?.[0] || 10);
  const [viewMode, setViewMode] = useState('summary'); // summary, year, month
  const [expandedYear, setExpandedYear] = useState(null);

  const currency = bank?.currency || 'INR';
  const principal = loanAmount || bank?.maxAmount || 2500000;
  const interestRate = bank?.interest?.effectiveRate || 10;
  const months = tenure * 12;

  const emi = calcEMI(principal, interestRate, months);
  const totalPayable = emi * months;
  const totalInterest = totalPayable - principal;
  const interestRatio = (totalInterest / totalPayable) * 100;
  const principalRatio = (principal / totalPayable) * 100;

  const schedule = useMemo(() => generateAmortizationSchedule(principal, interestRate, months), [principal, interestRate, months]);
  const yearlyData = useMemo(() => groupByYear(schedule, principal), [schedule, principal]);

  // Tax benefit calculation (Indian banks - Section 80E)
  const isIndianBank = bank?.country === 'India';
  const taxBenefitRate = 0.3; // Assuming 30% tax bracket
  const annualTaxSaving = Math.min(totalInterest, 150000) * taxBenefitRate; // Max ₹1.5L under 80E
  const effectiveInterestCost = totalInterest - (annualTaxSaving * tenure);

  const tenureOptions = bank?.tenure?.options || [5, 7, 10, 15];

  return (
    <div className="space-y-6">
      {/* Tenure Selector */}
      <GlassCard className="p-4" hoverable={false}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider">Loan Duration</h3>
            <p className="text-[10px] text-gray-500 mt-1">Select repayment tenure</p>
          </div>
          <div className="flex gap-2">
            {tenureOptions.map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTenure(t);
                  onTenureChange?.(t);
                }}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-black transition-all",
                  tenure === t
                    ? "bg-primary text-white shadow-lg shadow-primary/30"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                )}
              >
                {t} Years
              </button>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <GlassCard className="p-4 text-center" hoverable={false}>
          <div className="text-[10px] font-black uppercase text-gray-500 mb-2">Loan Amount</div>
          <div className="text-xl font-black text-gray-900">{formatCurrency(principal, currency)}</div>
        </GlassCard>
        <GlassCard className="p-4 text-center" hoverable={false}>
          <div className="text-[10px] font-black uppercase text-gray-500 mb-2">Monthly EMI</div>
          <div className="text-xl font-black text-primary">{formatCurrency(emi, currency)}</div>
        </GlassCard>
        <GlassCard className="p-4 text-center" hoverable={false}>
          <div className="text-[10px] font-black uppercase text-gray-500 mb-2">Total Interest</div>
          <div className="text-xl font-black text-red-500">{formatCurrency(totalInterest, currency)}</div>
        </GlassCard>
        <GlassCard className="p-4 text-center" hoverable={false}>
          <div className="text-[10px] font-black uppercase text-gray-500 mb-2">Total Payable</div>
          <div className="text-xl font-black text-gray-900">{formatCurrency(totalPayable, currency)}</div>
        </GlassCard>
      </div>

      {/* Interest vs Principal Visual */}
      <GlassCard className="p-4" hoverable={false}>
        <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider mb-4">Payment Breakdown</h3>
        <div className="h-4 rounded-full overflow-hidden flex bg-gray-100">
          <div
            className="bg-primary h-full transition-all duration-500"
            style={{ width: `${principalRatio}%` }}
          />
          <div
            className="bg-red-400 h-full transition-all duration-500"
            style={{ width: `${interestRatio}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-[10px] font-bold">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-gray-600">Principal: {principalRatio.toFixed(1)}%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-red-400" />
            <span className="text-gray-600">Interest: {interestRatio.toFixed(1)}%</span>
          </div>
        </div>

        {/* Tax Benefit Info (Indian Banks) */}
        {isIndianBank && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-start gap-2">
              <TrendingDown size={14} className="text-green-600 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-green-800">
                  Estimated Tax Savings (Section 80E)
                </div>
                <div className="text-[10px] text-green-700 mt-1">
                  Interest payment is tax-deductible. Estimated annual saving: {formatCurrency(annualTaxSaving, currency)}<br />
                  Effective interest cost: {formatCurrency(effectiveInterestCost, currency)}
                </div>
              </div>
            </div>
          </div>
        )}
      </GlassCard>

      {/* View Mode Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calculator size={14} className="text-gray-400" />
          <span className="text-[10px] font-black uppercase text-gray-500">Amortization Schedule</span>
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {['summary', 'year', 'month'].map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={cn(
                "px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all",
                viewMode === mode
                  ? "bg-white text-gray-900 shadow"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              {mode === 'year' ? 'Year-wise' : mode === 'month' ? 'Monthly' : 'Summary'}
            </button>
          ))}
        </div>
      </div>

      {/* Year-wise View */}
      <AnimatePresence>
        {viewMode === 'year' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <GlassCard className="overflow-hidden" hoverable={false}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-[10px] font-black uppercase text-gray-500">Year</th>
                      <th className="px-4 py-3 text-right text-[10px] font-black uppercase text-gray-500">EMI Paid</th>
                      <th className="px-4 py-3 text-right text-[10px] font-black uppercase text-gray-500">Principal</th>
                      <th className="px-4 py-3 text-right text-[10px] font-black uppercase text-gray-500">Interest</th>
                      <th className="px-4 py-3 text-right text-[10px] font-black uppercase text-gray-500">Balance</th>
                      <th className="px-4 py-3 text-center text-[10px] font-black uppercase text-gray-500">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {yearlyData.map((year) => (
                      <>
                        <tr key={year.year} className="hover:bg-gray-50 cursor-pointer" onClick={() => setExpandedYear(expandedYear === year.year ? null : year.year)}>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-black text-gray-900">Year {year.year}</span>
                              <span className="text-[10px] text-gray-500">({year.months.length} months)</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-right text-sm font-bold text-gray-900">{formatCurrency(year.totalEMI, currency)}</td>
                          <td className="px-4 py-4 text-right text-sm font-bold text-primary">{formatCurrency(year.totalPrincipal, currency)}</td>
                          <td className="px-4 py-4 text-right text-sm font-bold text-red-500">{formatCurrency(year.totalInterest, currency)}</td>
                          <td className="px-4 py-4 text-right text-sm font-bold text-gray-700">{formatCurrency(year.closingBalance, currency)}</td>
                          <td className="px-4 py-4 text-center">
                            {expandedYear === year.year ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
                          </td>
                        </tr>
                        {expandedYear === year.year && (
                          <tr>
                            <td colSpan={6} className="bg-gray-50 px-4 py-2">
                              <div className="space-y-1">
                                {year.months.map((m) => (
                                  <div key={m.month} className="flex justify-between text-[10px] text-gray-600 px-2">
                                    <span>Month {m.month}</span>
                                    <span>Principal: {formatCurrency(m.principal, currency)} | Interest: {formatCurrency(m.interest, currency)} | Balance: {formatCurrency(m.balance, currency)}</span>
                                  </div>
                                ))}
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary View */}
      <AnimatePresence>
        {viewMode === 'summary' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <GlassCard className="p-4" hoverable={false}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-gray-50 rounded-xl">
                  <div className="text-[10px] font-black uppercase text-gray-500 mb-1">Principal</div>
                  <div className="text-sm font-black text-primary">{formatCurrency(principal, currency)}</div>
                  <div className="text-[10px] text-gray-500">{principalRatio.toFixed(1)}% of total</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <div className="text-[10px] font-black uppercase text-gray-500 mb-1">Total Interest</div>
                  <div className="text-sm font-black text-red-500">{formatCurrency(totalInterest, currency)}</div>
                  <div className="text-[10px] text-gray-500">{interestRatio.toFixed(1)}% of total</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <div className="text-[10px] font-black uppercase text-gray-500 mb-1">Interest Rate</div>
                  <div className="text-sm font-black text-gray-900">{interestRate}% p.a.</div>
                  <div className="text-[10px] text-gray-500">{bank?.interest?.type || 'Floating'}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <div className="text-[10px] font-black uppercase text-gray-500 mb-1">Processing Fee</div>
                  <div className="text-sm font-black text-gray-900">{bank?.processingFee?.display || 'N/A'}</div>
                  <div className="text-[10px] text-gray-500">{bank?.disbursalTime || 'N/A'}</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex justify-between text-[10px] font-bold text-gray-500 mb-2">
                  <span>Loan Repayment Progress</span>
                  <span>{tenure} Years / {months} Months</span>
                </div>
                <div className="h-6 bg-gray-100 rounded-lg overflow-hidden flex">
                  {yearlyData.map((year, i) => (
                    <div
                      key={year.year}
                      className="h-full flex items-center justify-center text-[8px] font-black text-white"
                      style={{
                        width: `${(year.totalPrincipal / principal) * 100}%`,
                        backgroundColor: `hsl(${200 - (i * 30)}, 70%, 50%)`,
                      }}
                      title={`Year ${year.year}: ${formatCurrency(year.totalPrincipal, currency)}`}
                    >
                      {year.year}
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Monthly View */}
      <AnimatePresence>
        {viewMode === 'month' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <GlassCard className="overflow-hidden max-h-96" hoverable={false}>
              <div className="overflow-y-auto max-h-96">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left text-[10px] font-black uppercase text-gray-500">Month</th>
                      <th className="px-3 py-2 text-right text-[10px] font-black uppercase text-gray-500">EMI</th>
                      <th className="px-3 py-2 text-right text-[10px] font-black uppercase text-gray-500">Principal</th>
                      <th className="px-3 py-2 text-right text-[10px] font-black uppercase text-gray-500">Interest</th>
                      <th className="px-3 py-2 text-right text-[10px] font-black uppercase text-gray-500">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {schedule.map((m) => (
                      <tr key={m.month} className="hover:bg-gray-50 text-xs">
                        <td className="px-3 py-2 font-medium text-gray-900">#{m.month}</td>
                        <td className="px-3 py-2 text-right text-gray-700">{formatCurrency(m.emi, currency)}</td>
                        <td className="px-3 py-2 text-right text-primary font-medium">{formatCurrency(m.principal, currency)}</td>
                        <td className="px-3 py-2 text-right text-red-400">{formatCurrency(m.interest, currency)}</td>
                        <td className="px-3 py-2 text-right text-gray-500">{formatCurrency(m.balance, currency)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <GlassCard className="p-4 border-green-200 bg-green-50" hoverable={false}>
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown size={14} className="text-green-600" />
            <span className="text-[10px] font-black uppercase text-green-700">Interest Ratio</span>
          </div>
          <div className="text-2xl font-black text-green-600">{interestRatio.toFixed(1)}%</div>
          <div className="text-[10px] text-green-600">of total payment</div>
        </GlassCard>
        <GlassCard className="p-4 border-primary/20 bg-primary/5" hoverable={false}>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={14} className="text-primary" />
            <span className="text-[10px] font-black uppercase text-primary">Principal Ratio</span>
          </div>
          <div className="text-2xl font-black text-primary">{principalRatio.toFixed(1)}%</div>
          <div className="text-[10px] text-primary">of total payment</div>
        </GlassCard>
        <GlassCard className="p-4" hoverable={false}>
          <div className="text-[10px] font-black uppercase text-gray-500 mb-2">Effective Cost</div>
          <div className="text-2xl font-black text-gray-900">{formatCurrency(totalPayable, currency)}</div>
          <div className="text-[10px] text-gray-500">over {tenure} years</div>
        </GlassCard>
      </div>
    </div>
  );
}
