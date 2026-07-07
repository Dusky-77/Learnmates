import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const DiscordIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.211.375-.445.865-.607 1.25a18.27 18.27 0 0 0-5.487 0c-.162-.385-.395-.875-.607-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.873-1.295 1.226-1.994a.076.076 0 0 0-.042-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.294.075.075 0 0 1 .078-.01c3.928 1.793 8.18 1.793 12.062 0a.075.075 0 0 1 .079.009c.12.098.246.198.373.294a.077.077 0 0 1-.007.128 12.299 12.299 0 0 1-1.873.892.076.076 0 0 0-.041.107c.356.699.768 1.364 1.225 1.994a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.057c.5-4.761-.838-8.898-3.549-12.562a.06.06 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-.965-2.157-2.156 0-1.193.964-2.157 2.157-2.157 1.193 0 2.156.964 2.156 2.157 0 1.19-.963 2.156-2.156 2.156zm7.975 0c-1.183 0-2.157-.965-2.157-2.156 0-1.193.964-2.157 2.157-2.157 1.193 0 2.157.964 2.157 2.157 0 1.19-.964 2.156-2.157 2.156z" />
  </svg>
);

const DiscordPopup: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [dismissedUntil, setDismissedUntil] = useState<number>(0);

  useEffect(() => {
    // Check if forced to show via query parameter (for testing)
    const params = new URLSearchParams(window.location.search);
    if (params.get('discord-popup') === 'show') {
      setIsVisible(true);
      return;
    }

    // Check if popup was dismissed recently
    const storedDismissTime = localStorage.getItem('discord_popup_dismissed');
    if (storedDismissTime) {
      const dismissTime = parseInt(storedDismissTime, 10);
      const twentyFourHours = 24 * 60 * 60 * 1000;
      if (Date.now() - dismissTime < twentyFourHours) {
        setDismissedUntil(dismissTime + twentyFourHours);
        return;
      }
    }

    const handleScroll = () => {
      if (!hasScrolled && window.scrollY > 300) {
        setHasScrolled(true);
        setIsVisible(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasScrolled]);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('discord_popup_dismissed', Date.now().toString());
    setDismissedUntil(Date.now() + 24 * 60 * 60 * 1000);
  };

  const handleJoinClick = () => {
    window.open('https://discord.gg/qCQTxTQkRh', '_blank');
    handleClose();
  };

  if (dismissedUntil > Date.now()) {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ duration: 0.3, type: 'spring', stiffness: 300 }}
          className="fixed bottom-6 right-6 z-50 max-w-sm"
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden border-l-4 border-blue-500">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="text-white">
                  <DiscordIcon />
                </div>
                <h3 className="font-bold text-lg">Join Our Community</h3>
              </div>
              <button
                onClick={handleClose}
                className="text-white hover:bg-blue-700 rounded-full p-1 transition-colors"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-4">
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Join our Discord server to connect with other students, ask questions, and get help with your studies!
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleJoinClick}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Join Discord
                </button>
                <button
                  onClick={handleClose}
                  className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Dismiss
                </button>
              </div>
             
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DiscordPopup;
