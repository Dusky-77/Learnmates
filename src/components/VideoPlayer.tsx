import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Flag, Globe, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { extractYouTubeVideoId } from '../utils/privacyUtils';

interface VideoPlayerProps {
  title: string;
  description: string;
  englishUrl?: string;
  arabicUrl?: string;
  onReport?: () => void;
  done?: boolean;
  onToggleDone?: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  title,
  description,
  englishUrl,
  arabicUrl,
  onReport,
  done,
  onToggleDone
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'ar'>('en');
  const [isPlaying, setIsPlaying] = useState(false);

  const videoUrl = selectedLanguage === 'en' ? englishUrl : arabicUrl;
  const hasContent = englishUrl || arabicUrl;

  const getVideoId = (url: string) => {
    if (!url) return null;
    return extractYouTubeVideoId(url);
  };

  const getEmbedUrl = (url: string) => {
    const videoId = getVideoId(url);
    if (!videoId) return null;
    // Use standard YouTube embed with rel=0 to prevent related videos
    return `https://www.youtube.com/embed/${videoId}?rel=0`;
  };

  const getThumbnailUrl = (url: string) => {
    const videoId = getVideoId(url);
    if (!videoId) return null;
    // Use high-quality thumbnail
    return `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
  };

  if (!hasContent) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 md:p-8 text-center"
      >
        <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-2">No Content Available</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base mb-6">
          This video hasn't been added yet. Help us grow by contributing content!
        </p>
        <Link
          to="/contribute"
          className="inline-flex items-center px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-lg hover:from-blue-600 hover:to-teal-600 transition-all duration-200 shadow-md hover:shadow-lg text-sm sm:text-base"
        >
          Contribute Content
        </Link>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden text-sm sm:text-base"
      >
        {/* Video Header */}
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4">
            {/* Buttons first on mobile, title first on larger screens */}
            <div className="order-1 sm:order-2 flex items-center space-x-2 justify-end w-full sm:w-auto">
              {/* Language Toggle */}
              {englishUrl && arabicUrl && (
                <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  <button
                    onClick={() => {
                      setSelectedLanguage('en');
                      setIsPlaying(false);
                    }}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      selectedLanguage === 'en'
                        ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-300 shadow-sm'
                        : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-300'
                    }`}
                  >
                    <Globe className="w-4 h-4 inline mr-1" />
                    EN
                  </button>
                  <button
                    onClick={() => {
                      setSelectedLanguage('ar');
                      setIsPlaying(false);
                    }}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      selectedLanguage === 'ar'
                        ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-300 shadow-sm'
                        : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-300'
                    }`}
                  >
                    <Globe className="w-4 h-4 inline mr-1" />
                    AR
                  </button>
                </div>
              )}
              {/* Report Button */}
              <Link
                to="/contact"
                className="p-2 text-gray-400 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                title="Report Content"
              >
                <Flag className="w-4 h-4" />
              </Link>
              {/* Done Button */}
              {typeof done !== 'undefined' && onToggleDone && (
                <button
                  className={`flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${done ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-700 dark:text-gray-300 text-gray-700 hover:bg-green-100 hover:text-green-700 dark:hover:bg-green-900 dark:hover:text-green-300'}`}
                  onClick={onToggleDone}
                  title={done ? 'Mark as not done' : 'Mark as done'}
                >
                  <svg className={`w-5 h-5 mr-1 ${done ? 'text-green-600' : 'text-gray-400 dark:text-gray-300'}`} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="2" y="2" width="16" height="16" rx="4" fill="currentColor" stroke="currentColor" strokeWidth="2" />
                    {done && <path d="M6 10l3 3 5-5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />}
                  </svg>
                  {done ? 'Done' : 'Mark as Done'}
                </button>
              )}
            </div>
            <h2 className="order-2 sm:order-1 text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white break-words">{title}</h2>
          </div>
        </div>

        {/* Video Player - Lazy Load */}
        {videoUrl && (
          <>
            {isPlaying && getEmbedUrl(videoUrl) ? (
              // Iframe only loads when play button is clicked
              <div className="relative aspect-video bg-gray-900 dark:bg-black">
                <iframe
                  src={getEmbedUrl(videoUrl) || ''}
                  title={title}
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            ) : getEmbedUrl(videoUrl) ? (
              // Thumbnail with play button - no cookies until clicked
              <div
                className="relative aspect-video bg-gray-900 dark:bg-black cursor-pointer group"
                onClick={() => setIsPlaying(true)}
              >
                <img
                  src={getThumbnailUrl(videoUrl) || ''}
                  alt={title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                  <div className="bg-red-600 hover:bg-red-700 rounded-full p-4 transition-colors shadow-lg">
                    <Play className="w-8 h-8 text-white fill-white" />
                  </div>
                </div>
                <p className="absolute bottom-4 left-4 bg-black/70 text-white text-xs px-2 py-1 rounded">Click to play</p>
              </div>
            ) : (
              <div className="relative aspect-video bg-gray-900 dark:bg-black flex items-center justify-center">
                <p className="text-gray-400 text-center px-4">Unable to parse video URL. Please check the link format.</p>
              </div>
            )}
          </>
        )}

        {/* Description */}
        <div className="p-4 sm:p-6">
          <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base leading-relaxed break-words">{description}</p>
        </div>
      </motion.div>
    </>
  );
};

export default VideoPlayer;