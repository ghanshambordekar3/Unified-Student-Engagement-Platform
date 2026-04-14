import { useState, useMemo } from 'react';
import { FileCheck, Upload, CheckCircle, Circle, AlertCircle, ChevronDown, ChevronRight, ShieldCheck, User, BookOpen, Building, Briefcase, CreditCard, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';
import { GlassCard } from './ui/GlassCard';
import { Button } from './ui/Button';

const categoryIcons = {
  identity: User,
  academic: BookOpen,
  admission: Building,
  financial: CreditCard,
  collateral: Lock,
};

const categoryLabels = {
  identity: 'Identity Documents',
  academic: 'Academic Records',
  admission: 'Admission Documents',
  financial: 'Financial Documents',
  collateral: 'Collateral Documents',
};

export default function DocumentChecklist({ bank, profile }) {
  const [expandedCategories, setExpandedCategories] = useState(['identity', 'academic', 'admission']);
  const [uploadedDocs, setUploadedDocs] = useState({});
  const [verifiedDocs, setVerifiedDocs] = useState({});

  // Get requirements based on bank
  const requirements = useMemo(() => {
    if (!bank) return null;

    const baseRequirements = {
      identity: [
        { id: 'passport', name: 'Passport', spec: 'Valid passport (min 6 months validity)', required: true },
        { id: 'aadhaar', name: 'Aadhaar Card', spec: 'Valid Aadhaar (Indian students)', required: true, alternatives: ['PAN Card', 'Voter ID'] },
        { id: 'pan', name: 'PAN Card', spec: 'Permanent Account Number', required: true },
      ],
      academic: [
        { id: '10th', name: '10th Marksheet & Certificate', spec: 'Class 10 records', required: true },
        { id: '12th', name: '12th Marksheet & Certificate', spec: 'Class 12 records', required: true },
        { id: 'graduation', name: 'Graduation Marksheets & Certificate', spec: 'All semester records + final degree', required: true },
        { id: 'gre_gmat', name: 'GRE/GMAT Score', spec: 'Valid scores (310+ GRE / 600+ GMAT)', required: false, conditional: 'For MS/MBA abroad' },
      ],
      admission: [
        { id: 'offer_letter', name: 'University Offer Letter', spec: 'Official admission offer', required: true },
        { id: 'i20', name: 'I-20 Form (USA)', spec: 'F-1 Student Visa eligibility', required: false, conditional: 'Required for USA' },
        { id: 'cas', name: 'CAS Letter (UK)', spec: 'Confirmation of Acceptance', required: false, conditional: 'Required for UK' },
        { id: 'coe', name: 'CoE (Australia)', spec: 'Confirmation of Enrolment', required: false, conditional: 'Required for Australia' },
        { id: 'fee_structure', name: 'Fee Structure', spec: 'Detailed university fee breakdown', required: true },
      ],
    };

    // Add financial documents based on income type
    const incomeType = profile?.incomeType || 'salaried';
    baseRequirements.financial = incomeType === 'salaried' ? [
      { id: 'itr', name: 'Income Tax Returns', spec: 'ITR for last 2 years with Acknowledgment', required: true },
      { id: 'form16', name: 'Form 16', spec: 'From employer for last 2 years', required: true },
      { id: 'salary_slips', name: 'Salary Slips', spec: 'Last 3 months', required: true },
      { id: 'bank_statements', name: 'Bank Statements', spec: 'Last 6 months (self & co-applicant)', required: true },
    ] : [
      { id: 'itr_business', name: 'Income Tax Returns', spec: 'ITR for last 3 years', required: true },
      { id: 'balance_sheet', name: 'Balance Sheet', spec: 'Audited for last 3 years', required: true },
      { id: 'gst_returns', name: 'GST Returns', spec: 'Last 6 months filings', required: true },
      { id: 'bank_statements', name: 'Bank Statements', spec: 'Last 12 months (business + personal)', required: true },
    ];

    // Add collateral if required
    if (bank.collateralRequired) {
      baseRequirements.collateral = [
        { id: 'property_docs', name: 'Property Documents', spec: 'Sale agreement, Khata, Encumbrance certificate', required: true },
        { id: 'valuation', name: 'Property Valuation', spec: 'Report from approved valuer', required: true },
      ];
    }

    // Add bank-specific requirements
    if (bank.id === 'sbi_scholar') {
      baseRequirements.admission.push({ id: 'sbi_account', name: 'SBI Account', spec: 'Must have SBI account', required: true });
    }

    return baseRequirements;
  }, [bank, profile]);

  const toggleCategory = (category) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleDocUpload = (docId) => {
    setUploadedDocs(prev => ({ ...prev, [docId]: !prev[docId] }));
  };

  const toggleDocVerified = (docId) => {
    setVerifiedDocs(prev => ({ ...prev, [docId]: !prev[docId] }));
  };

  const getCategoryStats = (category) => {
    if (!requirements?.[category]) return { total: 0, uploaded: 0, verified: 0 };
    const docs = requirements[category];
    return {
      total: docs.length,
      uploaded: docs.filter(d => uploadedDocs[d.id]).length,
      verified: docs.filter(d => verifiedDocs[d.id]).length,
    };
  };

  const overallStats = useMemo(() => {
    if (!requirements) return { total: 0, uploaded: 0, verified: 0 };
    const allDocs = Object.values(requirements).flat();
    return {
      total: allDocs.length,
      uploaded: allDocs.filter(d => uploadedDocs[d.id]).length,
      verified: allDocs.filter(d => verifiedDocs[d.id]).length,
    };
  }, [requirements, uploadedDocs, verifiedDocs]);

  if (!requirements) {
    return (
      <GlassCard className="p-6 text-center" hoverable={false}>
        <AlertCircle size={24} className="text-gray-400 mx-auto mb-2" />
        <p className="text-sm font-bold text-gray-500">Select a bank to see document requirements</p>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-4">
      {/* Overall Progress */}
      <GlassCard className="p-4" hoverable={false}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider">Document Checklist</h3>
            <p className="text-[10px] text-gray-500 mt-1">
              {bank ? `${bank.shortName} Requirements` : 'Universal Checklist'}
            </p>
          </div>
          <div className="text-right">
            <div className="text-lg font-black text-primary">
              {overallStats.uploaded}/{overallStats.total}
            </div>
            <div className="text-[10px] text-gray-500">Uploaded</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-teal-500 transition-all duration-500"
            style={{ width: `${(overallStats.uploaded / overallStats.total) * 100}%` }}
          />
        </div>

        {bank && (
          <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Info size={12} className="text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-[10px] text-blue-700">
                <span className="font-bold">{bank.shortName}</span> requires specific documents.
                Processing time: {bank.disbursalTime}
              </p>
            </div>
          </div>
        )}
      </GlassCard>

      {/* Category Accordions */}
      <div className="space-y-2">
        {Object.entries(requirements).map(([category, docs]) => {
          const Icon = categoryIcons[category] || FileCheck;
          const stats = getCategoryStats(category);
          const isExpanded = expandedCategories.includes(category);

          return (
            <GlassCard key={category} className="overflow-hidden" hoverable={false}>
              <button
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center",
                    stats.verified === stats.total
                      ? "bg-green-100 text-green-600"
                      : stats.uploaded > 0
                        ? "bg-blue-100 text-blue-600"
                        : "bg-gray-100 text-gray-400"
                  )}>
                    <Icon size={16} />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-black text-gray-900">{categoryLabels[category]}</div>
                    <div className="text-[10px] text-gray-500">
                      {stats.verified}/{stats.total} verified
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {stats.verified === stats.total ? (
                    <CheckCircle size={16} className="text-green-500" />
                  ) : (
                    <span className="text-[10px] font-bold text-gray-400">
                      {stats.uploaded}/{stats.total}
                    </span>
                  )}
                  {isExpanded ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
                </div>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 pt-0 space-y-2">
                      {docs.map((doc) => (
                        <div
                          key={doc.id}
                          className={cn(
                            "p-3 rounded-xl border transition-all",
                            verifiedDocs[doc.id]
                              ? "bg-green-50 border-green-200"
                              : uploadedDocs[doc.id]
                                ? "bg-blue-50 border-blue-200"
                                : doc.required
                                  ? "bg-white border-gray-200"
                                  : "bg-gray-50 border-gray-100"
                          )}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className={cn(
                                  "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0",
                                  verifiedDocs[doc.id]
                                    ? "bg-green-500 text-white"
                                    : uploadedDocs[doc.id]
                                      ? "bg-blue-500 text-white"
                                      : doc.required
                                        ? "bg-gray-200"
                                        : "bg-gray-100"
                                )}>
                                  {verifiedDocs[doc.id] ? (
                                    <CheckCircle size={12} />
                                  ) : uploadedDocs[doc.id] ? (
                                    <FileCheck size={12} />
                                  ) : (
                                    <Circle size={12} />
                                  )}
                                </span>
                                <span className={cn(
                                  "text-xs font-bold",
                                  verifiedDocs[doc.id]
                                    ? "text-green-800"
                                    : uploadedDocs[doc.id]
                                      ? "text-blue-800"
                                      : doc.required
                                        ? "text-gray-900"
                                        : "text-gray-500"
                                )}>
                                  {doc.name}
                                </span>
                                {doc.required && (
                                  <span className="text-[8px] font-black uppercase px-1.5 py-0.5 bg-red-100 text-red-600 rounded">
                                    Required
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-gray-500 mt-1 ml-7">
                                {doc.spec}
                              </p>
                              {doc.conditional && (
                                <p className="text-[10px] text-blue-600 mt-1 ml-7">
                                  {doc.conditional}
                                </p>
                              )}
                              {doc.alternatives && (
                                <p className="text-[10px] text-gray-400 mt-1 ml-7">
                                  Alternatives: {doc.alternatives.join(', ')}
                                </p>
                              )}
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={() => toggleDocUpload(doc.id)}
                                className={cn(
                                  "p-1.5 rounded-lg transition-colors",
                                  uploadedDocs[doc.id]
                                    ? "bg-blue-100 text-blue-600 hover:bg-blue-200"
                                    : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                                )}
                                title={uploadedDocs[doc.id] ? 'Uploaded' : 'Mark as uploaded'}
                              >
                                <Upload size={14} />
                              </button>
                              {uploadedDocs[doc.id] && (
                                <button
                                  onClick={() => toggleDocVerified(doc.id)}
                                  className={cn(
                                    "p-1.5 rounded-lg transition-colors",
                                    verifiedDocs[doc.id]
                                      ? "bg-green-100 text-green-600 hover:bg-green-200"
                                      : "bg-gray-100 text-gray-400 hover:bg-green-100"
                                  )}
                                  title={verifiedDocs[doc.id] ? 'Verified' : 'Mark as verified'}
                                >
                                  <ShieldCheck size={14} />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </GlassCard>
          );
        })}
      </div>

      {/* Bank-Specific Notes */}
      {bank?.special && bank.special.length > 0 && (
        <GlassCard className="p-4 border-amber-200 bg-amber-50" hoverable={false}>
          <h4 className="text-[10px] font-black uppercase text-amber-700 mb-2">Important Notes for {bank.shortName}</h4>
          <ul className="space-y-1">
            {bank.special.map((note, i) => (
              <li key={i} className="flex items-start gap-2 text-[10px] text-amber-700">
                <span className="text-amber-500">•</span>
                {note}
              </li>
            ))}
          </ul>
        </GlassCard>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          variant="secondary"
          className="flex-1 h-10"
          onClick={() => {
            const allIds = Object.values(requirements).flat().map(d => d.id);
            setUploadedDocs(Object.fromEntries(allIds.map(id => [id, true])));
          }}
        >
          Mark All Uploaded
        </Button>
        <Button
          className="flex-1 h-10"
          disabled={overallStats.uploaded < overallStats.total}
        >
          Submit Application
        </Button>
      </div>
    </div>
  );
}
