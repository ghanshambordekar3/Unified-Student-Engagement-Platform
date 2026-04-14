import { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Filter, ArrowUpDown, Star, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';
import { GlassCard } from './ui/GlassCard';
import { Button } from './ui/Button';

export default function BankConsensusMatrix({ banks, selectedBank, onSelectBank }) {
  const [sortBy, setSortBy] = useState('interest');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filterCountry, setFilterCountry] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [showDetails, setShowDetails] = useState(null);

  const countries = ['all', ...new Set(banks.map(b => b.country))];
  const types = ['all', ...new Set(banks.map(b => b.type))];

  const filteredAndSortedBanks = useMemo(() => {
    let result = [...banks];

    // Filter by country
    if (filterCountry !== 'all') {
      result = result.filter(b => b.country === filterCountry);
    }

    // Filter by type
    if (filterType !== 'all') {
      result = result.filter(b => b.type === filterType);
    }

    // Sort
    result.sort((a, b) => {
      let aVal, bVal;

      switch (sortBy) {
        case 'interest':
          aVal = a.interest.effectiveRate;
          bVal = b.interest.effectiveRate;
          break;
        case 'amount':
          aVal = a.maxAmount;
          bVal = b.maxAmount;
          break;
        case 'disbursal':
          // Convert disbursal time to number for sorting
          aVal = parseInt(a.disbursalTime) || 999;
          bVal = parseInt(b.disbursalTime) || 999;
          break;
        case 'processing':
          // Extract percentage from processing fee
          aVal = parseFloat(a.processingFee.amount) || 0;
          bVal = parseFloat(b.processingFee.amount) || 0;
          break;
        case 'rank':
          aVal = a.consensusRank || 999;
          bVal = b.consensusRank || 999;
          break;
        default:
          aVal = a.interest.effectiveRate;
          bVal = b.interest.effectiveRate;
      }

      if (sortOrder === 'asc') {
        return aVal - bVal;
      } else {
        return bVal - aVal;
      }
    });

    return result;
  }, [banks, filterCountry, filterType, sortBy, sortOrder]);

  const toggleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const formatAmount = (amount, currency = 'INR') => {
    if (currency === 'INR') {
      if (amount >= 10000000) {
        return `₹${(amount / 10000000).toFixed(1)} Cr`;
      } else if (amount >= 100000) {
        return `₹${(amount / 100000).toFixed(1)}L`;
      }
      return `₹${amount.toLocaleString()}`;
    } else {
      return `${currency === 'USD' ? '$' : currency === 'GBP' ? '£' : ''}${amount.toLocaleString()}`;
    }
  };

  const SortHeader = ({ label, value, className }) => (
    <th
      className={cn("px-3 py-3 text-left cursor-pointer hover:bg-gray-50 transition-colors", className)}
      onClick={() => value && toggleSort(value)}
    >
      <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-gray-500">
        {label}
        {sortBy === value && (
          sortOrder === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
        )}
      </div>
    </th>
  );

  return (
    <div className="space-y-4">
      {/* Filters */}
      <GlassCard className="p-4" hoverable={false}>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-gray-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Filter:</span>
          </div>

          <select
            className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-bold focus:outline-none focus:border-primary/50"
            value={filterCountry}
            onChange={(e) => setFilterCountry(e.target.value)}
          >
            <option value="all">All Countries</option>
            {countries.filter(c => c !== 'all').map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-bold focus:outline-none focus:border-primary/50"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Types</option>
            {types.filter(t => t !== 'all').map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <div className="ml-auto text-[10px] font-bold text-gray-500">
            {filteredAndSortedBanks.length} options
          </div>
        </div>
      </GlassCard>

      {/* Consensus Matrix Table */}
      <GlassCard className="overflow-hidden" hoverable={false}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <SortHeader label="Rank" value="rank" />
                <th className="px-3 py-3 text-left">
                  <span className="text-[10px] font-black uppercase tracking-wider text-gray-500">Bank</span>
                </th>
                <SortHeader label="Interest" value="interest" />
                <SortHeader label="Max Amount" value="amount" />
                <SortHeader label="Processing" value="processing" />
                <th className="px-3 py-3 text-left">
                  <span className="text-[10px] font-black uppercase tracking-wider text-gray-500">Collateral</span>
                </th>
                <SortHeader label="Disbursal" value="disbursal" />
                <th className="px-3 py-3 text-left">
                  <span className="text-[10px] font-black uppercase tracking-wider text-gray-500">Tax Benefit</span>
                </th>
                <th className="px-3 py-3 text-left">
                  <span className="text-[10px] font-black uppercase tracking-wider text-gray-500">Action</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAndSortedBanks.map((bank) => (
                <motion.tr
                  key={bank.id}
                  className={cn(
                    "hover:bg-gray-50 transition-colors",
                    selectedBank?.id === bank.id && "bg-primary/5"
                  )}
                >
                  <td className="px-3 py-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 text-xs font-black text-gray-600">
                      {bank.consensusRank || '-'}
                    </div>
                  </td>
                  <td className="px-3 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{bank.logo}</span>
                      <div>
                        <div className="text-xs font-black text-gray-900">{bank.shortName}</div>
                        <div className="text-[10px] text-gray-500">{bank.type}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-gray-900">
                        {bank.interest.effectiveRate}%
                      </span>
                      <span className="text-[10px] text-gray-500">
                        {bank.interest.min}% - {bank.interest.max}%
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-4">
                    <span className="text-sm font-black text-gray-900">
                      {formatAmount(bank.maxAmount, bank.currency)}
                    </span>
                  </td>
                  <td className="px-3 py-4">
                    <span className={cn(
                      "text-xs font-bold px-2 py-0.5 rounded-full",
                      bank.processingFee.amount === 0
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    )}>
                      {bank.processingFee.display}
                    </span>
                  </td>
                  <td className="px-3 py-4">
                    <span className={cn(
                      "text-xs font-bold",
                      bank.collateralRequired ? "text-red-600" : "text-green-600"
                    )}>
                      {bank.collateralRequired ? (
                        <span className="flex items-center gap-1">
                          <AlertCircle size={12} />
                          Required
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <CheckCircle size={12} />
                          Not Required
                        </span>
                      )}
                    </span>
                  </td>
                  <td className="px-3 py-4">
                    <span className="text-xs font-bold text-gray-700">
                      {bank.disbursalTime}
                    </span>
                  </td>
                  <td className="px-3 py-4">
                    <span className={cn(
                      "text-xs font-bold",
                      bank.taxBenefit ? "text-green-600" : "text-gray-400"
                    )}>
                      {bank.taxBenefit ? '✓ Yes' : '—'}
                    </span>
                  </td>
                  <td className="px-3 py-4">
                    <Button
                      size="sm"
                      variant={selectedBank?.id === bank.id ? "primary" : "secondary"}
                      className="h-8 text-[10px] whitespace-nowrap"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        // Only highlight/select — do NOT navigate
                        setShowDetails(bank.id === showDetails ? null : bank.id);
                        // Notify parent of selection without navigating
                        if (typeof onSelectBank === 'function') {
                          onSelectBank(bank, true /* previewOnly */);
                        }
                      }}
                    >
                      {selectedBank?.id === bank.id ? '✓ Selected' : 'Select Bank'}
                    </Button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Detailed Comparison */}
      {selectedBank && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <GlassCard className="border-primary/30 bg-primary/5" hoverable={false}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{selectedBank.logo}</span>
                  <div>
                    <h3 className="text-sm font-black text-gray-900">{selectedBank.name}</h3>
                    <p className="text-xs text-gray-500">{selectedBank.type} • {selectedBank.country}</p>
                  </div>
                </div>
                {selectedBank.tag && (
                  <span className="text-[10px] font-black uppercase px-2 py-1 rounded-full"
                    style={{ backgroundColor: `${selectedBank.color}20`, color: selectedBank.color }}>
                    {selectedBank.tag}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="p-3 bg-white rounded-xl">
                  <div className="text-[10px] font-black uppercase text-gray-500 mb-1">Interest Rate</div>
                  <div className="text-lg font-black text-gray-900">{selectedBank.interest.effectiveRate}%</div>
                  <div className="text-[10px] text-gray-500">{selectedBank.interest.type}</div>
                </div>
                <div className="p-3 bg-white rounded-xl">
                  <div className="text-[10px] font-black uppercase text-gray-500 mb-1">Max Loan</div>
                  <div className="text-lg font-black text-gray-900">{formatAmount(selectedBank.maxAmount, selectedBank.currency)}</div>
                  <div className="text-[10px] text-gray-500">{selectedBank.currency}</div>
                </div>
                <div className="p-3 bg-white rounded-xl">
                  <div className="text-[10px] font-black uppercase text-gray-500 mb-1">Tenure</div>
                  <div className="text-lg font-black text-gray-900">{selectedBank.tenure.min}-{selectedBank.tenure.max} yrs</div>
                  <div className="text-[10px] text-gray-500">{selectedBank.tenure.options.join(', ')}</div>
                </div>
                <div className="p-3 bg-white rounded-xl">
                  <div className="text-[10px] font-black uppercase text-gray-500 mb-1">Processing</div>
                  <div className="text-lg font-black text-gray-900">{selectedBank.processingFee.display}</div>
                  <div className="text-[10px] text-gray-500">{selectedBank.disbursalTime}</div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="text-[10px] font-black uppercase text-gray-500 mb-2">Key Features</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedBank.features.map((feature, i) => (
                      <span key={i} className="text-xs font-medium text-gray-700 bg-white px-2 py-1 rounded-lg border border-gray-200">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] font-black uppercase text-gray-500 mb-2">Eligible Countries</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedBank.eligibleCountries.map((country, i) => (
                      <span key={i} className="text-xs font-medium text-gray-600 bg-gray-50 px-2 py-1 rounded-lg">
                        {country}
                      </span>
                    ))}
                  </div>
                </div>

                {selectedBank.collateralNote && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                    <div className="flex items-start gap-2">
                      <AlertCircle size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-xs font-bold text-amber-800">Collateral: </span>
                        <span className="text-xs text-amber-700">{selectedBank.collateralNote}</span>
                      </div>
                    </div>
                  </div>
                )}

                {selectedBank.taxBenefitNote && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                    <div className="flex items-start gap-2">
                      <Info size={14} className="text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-xs font-bold text-blue-800">Tax Benefit: </span>
                        <span className="text-xs text-blue-700">{selectedBank.taxBenefitNote}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </GlassCard>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 text-[10px] text-gray-500">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-green-100 border border-green-200" />
          <span>Low/No Fee</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-red-100 border border-red-200" />
          <span>Collateral Required</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-blue-100 border border-blue-200" />
          <span>Tax Benefit Eligible</span>
        </div>
      </div>
    </div>
  );
}
