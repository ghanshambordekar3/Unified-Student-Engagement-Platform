export default function UniversityCard({ university }) {
  const { name, country, flag, course, fees, ranking, acceptanceRate, duration, degree } = university;

  const feesFormatted = fees >= 1000
    ? `$${(fees / 1000).toFixed(0)}k`
    : `$${fees}`;

  const rankColor = ranking <= 20 ? 'text-yellow-500' : ranking <= 100 ? 'text-blue-500' : 'text-gray-500';

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all group animate-slide-up">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{flag}</span>
          <div>
            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors leading-tight">
              {name}
            </h3>
            <p className="text-sm text-gray-500">{country}</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full border text-xs font-semibold ${rankColor}`}>
          #{ranking} QS
        </span>
      </div>

      {/* Course & Degree */}
      <div className="flex items-center gap-2 mb-4">
        <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-100 text-xs font-medium">{course}</span>
        <span className="px-3 py-1 rounded-full bg-teal-50 text-teal-600 border border-teal-100 text-xs font-medium">{degree}</span>
        <span className="text-xs text-gray-500 ml-auto">{duration}</span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-xs text-gray-500 mb-1">Annual Fees</p>
          <p className="text-lg font-bold text-gray-900">{feesFormatted}</p>
          <p className="text-xs text-gray-500">USD / year</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-xs text-gray-500 mb-1">Acceptance</p>
          <p className="text-lg font-bold text-gray-900">{acceptanceRate}%</p>
          <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
            <div
              className="h-1 rounded-full bg-gradient-to-r from-blue-500 to-teal-500"
              style={{ width: `${acceptanceRate}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
