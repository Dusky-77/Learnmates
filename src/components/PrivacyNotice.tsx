import React, { useState } from 'react';
import { AlertCircle, X, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PrivacyNoticeProps {
  service: string;
  tips: string[];
  onAccept: () => void;
  onDecline: () => void;
  isEmbedded?: boolean; // If true, shows as an inline notice instead of modal
}

const PrivacyNotice: React.FC<PrivacyNoticeProps> = ({
  service,
  tips,
  onAccept,
  onDecline,
  isEmbedded = false,
}) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  if (isEmbedded) {
    // Inline notice for embedded content
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 mb-4"
      >
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-yellow-900 dark:text-yellow-200 mb-2">
              Privacy Notice
            </h3>
            <ul className="text-sm text-yellow-800 dark:text-yellow-300 space-y-1 mb-3">
              {tips.map((tip, index) => (
                <li key={index} className="flex gap-2">
                  <span className="text-yellow-600 dark:text-yellow-400">•</span>
                  {tip}
                </li>
              ))}
            </ul>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  onAccept();
                  setDismissed(true);
                }}
                className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded transition-colors"
              >
                I Understand
              </button>
              <button
                onClick={() => {
                  onDecline();
                  setDismissed(true);
                }}
                className="px-3 py-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 text-sm rounded transition-colors"
              >
                Don't Load
              </button>
            </div>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300 flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    );
  }

  // Modal notice for external links
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={() => {
          onDecline();
          setDismissed(true);
        }}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6"
        >
          <div className="flex items-start gap-3 mb-4">
            <div className="bg-yellow-100 dark:bg-yellow-900/30 rounded-full p-2 flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Privacy Notice
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                External link detected
              </p>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
              This link will take you to:
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded p-3 mb-4">
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-200">
                {service}
              </p>
            </div>

            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
              Privacy Considerations:
            </p>
            <ul className="space-y-2">
              {tips.map((tip, index) => (
                <li key={index} className="flex gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <span className="text-gray-400 dark:text-gray-500 flex-shrink-0">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900 rounded p-4 mb-6">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              <strong>Tip:</strong> Use a VPN for additional privacy protection, or consider using privacy-focused browser extensions.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                onDecline();
                setDismissed(true);
              }}
              className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium rounded-lg transition-colors"
            >
              Don't Open
            </button>
            <button
              onClick={() => {
                onAccept();
                setDismissed(true);
              }}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              I Understand, Open Link
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PrivacyNotice;
