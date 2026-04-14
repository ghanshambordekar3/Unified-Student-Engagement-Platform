import { motion } from 'framer-motion';

export default function UniversityCard({ university, compact = false }) {
  const { name, country, flag, course, fees, ranking, acceptanceRate, duration, degree } = university;

  const feesFormatted = fees >= 1000
    ? `$${(fees / 1000).toFixed(0)}k`
    : `$${fees}`;

  const rankColor = ranking <= 20 ? 'text-yellow-500 border-yellow-200 bg-yellow-50' : ranking <= 100 ? 'text-blue-500 border-blue-200 bg-blue-50' : 'text-gray-500 border-gray-200 bg-gray-50';

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98, backgroundColor: 'rgba(255, 255, 255, 0)' }}
      animate={{ opacity: 1, scale: 1, backgroundColor: 'rgba(255, 255, 255, 0.4)' }}
      whileHover={{ y: -4, scale: 1.01, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' }}
      className={`backdrop-blur-xl rounded-3xl p-5 border border-slate-200 transition-colors group relative overflow-hidden ${compact ? 'max-w-md' : ''}`}
    >
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
         <span className="text-6xl font-black italic">{ranking}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-3xl shadow-inner border border-slate-100 group-hover:bg-white group-hover:shadow-lg transition-all">
            {flag}
          </div>
          <div>
            <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-tight tracking-tight">
              {name}
            </h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">{country}</p>
          </div>
        </div>
        {!compact && (
          <span className={`px-3 py-1.5 rounded-xl border text-[10px] font-black tracking-widest uppercase ${rankColor}`}>
            #{ranking} QS
          </span>
        )}
      </div>

      {/* Course & Degree */}
      <div className="flex flex-wrap items-center gap-2 mb-5 relative z-10">
        <span className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-bold uppercase tracking-wider">{course}</span>
        <span className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100 text-[10px] font-bold uppercase tracking-wider">{degree}</span>
        <span className="text-[10px] font-bold text-slate-400 ml-auto whitespace-nowrap">{duration}</span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 relative z-10">
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100/50 group-hover:bg-white group-hover:border-slate-200 group-hover:shadow-sm transition-all duration-300">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Annual Fees</p>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black text-slate-900">{feesFormatted}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">USD / YR</span>
          </div>
        </div>
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100/50 group-hover:bg-white group-hover:border-slate-200 group-hover:shadow-sm transition-all duration-300">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Acceptance</p>
          <div className="flex items-center gap-3">
             <span className="text-xl font-black text-slate-900">{acceptanceRate}%</span>
             <div className="flex-1 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${acceptanceRate}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-500"
                />
             </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

