import { useState } from 'react';
import { Share2, Copy, Check } from 'lucide-react';

export default function ReferralButton() {
  const [copied, setCopied] = useState(false);
  const referralLink = `${window.location.origin}?ref=EDUPATH${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-teal-200">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0">
          <Share2 size={20} className="text-teal-500" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Refer a Friend</h3>
          <p className="text-sm text-gray-500 mt-1">Share EduPath and help a friend start their study abroad journey!</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
          <p className="text-xs text-gray-500 truncate">{referralLink}</p>
        </div>
        <button
          onClick={handleCopy}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex-shrink-0 ${
            copied
              ? 'bg-green-100 border border-green-200 text-green-600'
              : 'bg-teal-500 text-white hover:bg-teal-600'
          }`}
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
    </div>
  );
}
