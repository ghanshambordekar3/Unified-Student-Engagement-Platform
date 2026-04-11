import { Lightbulb, RefreshCw } from 'lucide-react';
import tips from '../data/tips.json';

export default function DailyTip() {
  // Rotate tip by day of year
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  const tip = tips[dayOfYear % tips.length];

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 border-l-4 border-l-yellow-400 shadow-sm animate-slide-up">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center flex-shrink-0">
          <Lightbulb size={20} className="text-yellow-500" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-yellow-500">Daily Tip</h3>
            <span className="text-xs text-gray-500">Day {dayOfYear % tips.length + 1} of {tips.length}</span>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">{tip}</p>
        </div>
      </div>
    </div>
  );
}
