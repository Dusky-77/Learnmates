import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, User, Bookmark, Plus, X, CheckCircle, Pencil, ArrowLeft, Award } from 'lucide-react';
import { useUser } from '../context/UserContext';
import {
  getTopicSlug,
  getTopicMetadata,
  getAvailableLevels,
  getAvailableBoardsForLevel,
  getAvailableSubjectsForLevelAndBoard,
  BoardKey,
  curriculumData,
  type Topic,
} from '../utils/curriculumData';
import { FavoriteSubject, loadFavoriteSubjects, saveFavoriteSubjects, getSubjectPaths, hasTopicalsForSubject, getLevelKey } from '../utils/favoriteSubjects';
import { getSubjectIcon } from '../utils/subjectIcons';
import { updateStreak, StreakData, getLast30Days, DayData } from '../utils/streakUtils';
import AddSubjectModal from '../components/AddSubjectModal';
import SubjectProgressBars from '../components/SubjectProgressBars';
import { useEngagementRevision } from '../hooks/useEngagementRevision';
import { getGroupedSubjectProgress } from '../utils/subjectProgressGroups';
import { topicData } from './TopicPage';

const Home: React.FC = () => {
  const { user, setUser } = useUser();
  const [showNameInput, setShowNameInput] = useState<boolean | null>(null); // null = loading
  const [tempName, setTempName] = useState('');
  const [favoriteSubjects, setFavoriteSubjects] = useState<FavoriteSubject[]>([]);
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [isEditingSubjects, setIsEditingSubjects] = useState(false);
  const [modalLevel, setModalLevel] = useState<string | null>(null);
  const [modalBoard, setModalBoard] = useState<BoardKey | null>(null);
  const [setupStep, setSetupStep] = useState<'name' | 'level' | 'board' | 'subjects' | 'done'>('name');
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [dayData, setDayData] = useState<DayData[]>([]);

  const availableLevels = getAvailableLevels();
  const availableBoards = modalLevel ? getAvailableBoardsForLevel(modalLevel) : [];
  const availableSubjects = modalLevel && modalBoard ? getAvailableSubjectsForLevelAndBoard(modalLevel, modalBoard) : [];
  const engagementRevision = useEngagementRevision();

  const getTopicsForFavorite = (fav: FavoriteSubject): Topic[] => {
    const levelKey = getLevelKey(fav.level);
    const curriculum = curriculumData[levelKey];
    if (!curriculum) return [];
    return curriculum.boards[fav.board]?.topics.filter((topic) => topic.subject === fav.subject) ?? [];
  };

  const getTopicResources = (topicId: string) => topicData[topicId]?.resources ?? [];

  const subjectProgressByKey = useMemo(() => {
    void engagementRevision;
    const map = new Map<string, ReturnType<typeof getGroupedSubjectProgress>>();
    for (const fav of favoriteSubjects) {
      const key = `${fav.level}|${fav.board}|${fav.subject}`;
      const topics = getTopicsForFavorite(fav);
      map.set(key, getGroupedSubjectProgress(topics, getTopicResources));
    }
    return map;
  }, [favoriteSubjects, engagementRevision]);



  // Arrays for random welcomes and messages
const welcomeVariations = [
  "Welcome back",
  "Great to see you again",
  "Ready to learn",
  "Hey there",
  "Good to have you back",
  "Glad you're here",
  "Let's get started",
  "Back for more knowledge",
  "Your learning journey continues",
  "Another day, another lesson"
];

const motivationalMessages = [
  "Continue your learning journey with curated content, interactive quizzes, and personalized study paths.",
  "Ready to level up? Today's lessons are waiting just for you!",
  "Small progress is still progress. Keep going! 💪",
  "Your next breakthrough is just one lesson away.",
  "Consistency beats intensity. Let's learn something new today!",
  "Every expert was once a beginner. Stay curious!",
  "You're doing great! Let's make today's learning count.",
  "New day, new knowledge. What will you discover today?",
  "Turn your goals into achievements — one lesson at a time.",
  "Learning is a treasure that follows everywhere. Let's dive in!",
  "Your future self will thank you for today's effort.",
  "One step closer to mastery. Keep pushing!"
];

// Get random items
const getRandomWelcome = () => welcomeVariations[Math.floor(Math.random() * welcomeVariations.length)];
const getRandomMessage = () => motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];

// Inside your component

  // Initialize on mount - load user and subjects from localStorage
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      setFavoriteSubjects(loadFavoriteSubjects());
      
      // Update streak on visit
      try {
        const updatedStreak = updateStreak();
        setStreak(updatedStreak);
      } catch (streakError) {
        console.error('Streak error:', streakError);
      }
      
      // Get calendar data
      try {
        const calendarData = getLast30Days();
        setDayData(calendarData);
      } catch (calendarError) {
        console.error('Calendar error:', calendarError);
      }
      
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setShowNameInput(false);
      } else {
        setShowNameInput(true);
      }
    } catch (error) {
      console.error('Home component initialization error:', error);
      setShowNameInput(true);
    }
  }, []);

  useEffect(() => {
    const syncSubjects = () => setFavoriteSubjects(loadFavoriteSubjects());
    window.addEventListener('favoriteSubjectsUpdated', syncSubjects);
    return () => window.removeEventListener('favoriteSubjectsUpdated', syncSubjects);
  }, []);

  const handleRemoveSubject = useCallback((subject: FavoriteSubject) => {
    const newSubjects = favoriteSubjects.filter(
      (s) => !(s.subject === subject.subject && s.level === subject.level && s.board === subject.board)
    );
    setFavoriteSubjects(newSubjects);
    saveFavoriteSubjects(newSubjects);
    if (newSubjects.length === 0) {
      setIsEditingSubjects(false);
    }
  }, [favoriteSubjects]);

  const handleCloseModal = useCallback(() => {
    setShowAddSubjectModal(false);
  }, []);

  const handleNameSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = tempName.trim();
    if (trimmed) {
      setSetupStep('level');
    }
  }, [tempName]);

  const handleLevelSelect = useCallback((level: string) => {
    setModalLevel(level);
    setModalBoard(null);
    setSetupStep('board');
  }, []);

  const handleBoardSelect = useCallback((board: BoardKey) => {
    setModalBoard(board);
    setSetupStep('subjects');
  }, []);

  const handleGoToLevel = useCallback(() => {
    setModalLevel(null);
    setModalBoard(null);
    setSetupStep('level');
  }, []);

  const handleGoToBoard = useCallback(() => {
    setModalBoard(null);
    setSetupStep('board');
  }, []);

  const handleSubjectsSubmit = useCallback(() => {
    if (tempName.trim() && favoriteSubjects.length > 0) {
      const newUser = {
        name: tempName.trim(),
        progress: {},
        recentCourses: []
      };
      // Save user
      setUser(newUser);
      localStorage.setItem("user", JSON.stringify(newUser));
      // Save favorite subjects to localStorage
      saveFavoriteSubjects(favoriteSubjects);
      // Close modal and reset
      setShowNameInput(false);
      setTempName('');
      setModalLevel(null);
      setModalBoard(null);
      setSetupStep('name');
    }
  }, [tempName, favoriteSubjects]);

  const handleSubjectToggle = (subject: FavoriteSubject) => {
    const exists = favoriteSubjects.some(
      (s) => s.subject === subject.subject && s.level === subject.level && s.board === subject.board
    );
    if (exists) {
      setFavoriteSubjects(favoriteSubjects.filter(
        (s) => !(s.subject === subject.subject && s.level === subject.level && s.board === subject.board)
      ));
    } else {
      setFavoriteSubjects([...favoriteSubjects, subject]);
    }
  };

  const toggleIsEditing = useCallback(() => setIsEditingSubjects(prev => !prev), []);
  const openAddSubjectModal = useCallback(() => setShowAddSubjectModal(true), []);

  const containerVariants = useMemo(() => ({
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }), []);

  const itemVariants = useMemo(() => ({
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6 }
    }
  }), []);

  const [randomWelcome, setRandomWelcome] = useState(getRandomWelcome());
  const [randomMessage, setRandomMessage] = useState(getRandomMessage());

  useEffect(() => {
    setRandomWelcome(getRandomWelcome());
    setRandomMessage(getRandomMessage());
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900">
      <Helmet>
        <title>Learnmates | Dashboard</title>
        <meta name="description" content="Your personalized learning dashboard for IGCSE and A-Level studies." />
        <meta name="keywords" content="Learnmates, IGCSE, A-Level, education, learning, dashboard" />
      </Helmet>

      {/* Loading State - Show while initializing */}
      {showNameInput === null && (
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full animate-pulse mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      )}

      {/* Onboarding Modal for New Users */}
      <AnimatePresence>
        {showNameInput === true && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl"
            >
              <AnimatePresence mode="wait">
                {/* Name Input Step */}
                {setupStep === 'name' && (
                  <motion.div
                    key="name-step"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <User className="w-7 h-7 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-2">
                      Welcome to Learnmates
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 text-center mb-6 text-base">
                      Let's personalize your learning experience. What should we call you?
                    </p>
                    
                    <form onSubmit={handleNameSubmit}>
                      <input
                        type="text"
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        placeholder="Enter your name"
                        className="w-full px-5 py-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-6 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-base"
                        autoFocus
                      />
                      
                      {/* Privacy Notice */}
                      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 mb-6">
                        <p className="text-xs text-green-900 dark:text-green-200">
                          <strong>Privacy:</strong> Your data is stored only in your browser. View our <Link to="/privacy" className="underline hover:no-underline">Privacy Policy</Link>.
                        </p>
                      </div>

                      <button
                        type="submit"
                        disabled={!tempName.trim()}
                        className="w-full bg-gradient-to-r from-blue-500 to-teal-500 text-white py-4 rounded-lg hover:from-blue-600 hover:to-teal-600 transition-all duration-200 font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Continue
                      </button>
                    </form>
                  </motion.div>
                )}

                {/* Level Selection Step */}
                {setupStep === 'level' && (
                  <motion.div
                    key="level-step"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Award className="w-7 h-7 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-2">
                      Choose Your Level
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 text-center mb-6 text-base">
                      What level are you studying?
                    </p>
                    
                    <div className="space-y-3 mb-6">
                      {availableLevels.map((level) => (
                        <button
                          key={level}
                          onClick={() => handleLevelSelect(level)}
                          className="w-full p-4 rounded-lg font-medium text-base transition-all border-2 text-left bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 hover:border-blue-500 hover:shadow-md dark:hover:border-blue-400"
                        >
                          {level}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => {
                        setSetupStep('name');
                        setModalLevel(null);
                        setModalBoard(null);
                      }}
                      className="w-full flex items-center justify-center gap-2 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                      <ArrowLeft className="w-5 h-5" />
                      Back
                    </button>
                  </motion.div>
                )}

                {/* Board Selection Step */}
                {setupStep === 'board' && (
                  <motion.div
                    key="board-step"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Bookmark className="w-7 h-7 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-2">
                      Choose Your Board
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 text-center mb-6 text-base">
                      Which exam board are you following?
                    </p>

                    <div className="space-y-3 mb-6">
                      {availableBoards.map((board) => (
                        <button
                          key={board.id}
                          onClick={() => handleBoardSelect(board.id)}
                          className="w-full p-4 rounded-lg font-medium text-base transition-all border-2 text-left bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 hover:border-blue-500 hover:shadow-md dark:hover:border-blue-400"
                        >
                          {board.name}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={handleGoToLevel}
                      className="w-full flex items-center justify-center gap-2 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors border border-gray-300 dark:border-gray-600 rounded-lg"
                    >
                      <ArrowLeft className="w-5 h-5" />
                      Back
                    </button>
                  </motion.div>
                )}

                {/* Subject Selection Step */}
                {setupStep === 'subjects' && (
                  <motion.div
                    key="subjects-step"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      Select Your Subjects
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 text-base mb-6">
                      Choose the subjects you'd like to study. You can add more later.
                    </p>

                    <div className="space-y-3 max-h-96 overflow-y-auto mb-6">
                      {availableSubjects.map((subject) => {
                        const isSelected = favoriteSubjects.some(
                          (s) => s.subject === subject && s.level === modalLevel && s.board === modalBoard
                        );
                        return (
                          <button
                            key={subject}
                            onClick={() => {
                              if (modalLevel && modalBoard) {
                                handleSubjectToggle({ subject, level: modalLevel, board: modalBoard });
                              }
                            }}
                            className={`w-full p-4 rounded-lg font-medium text-base transition-all border-2 text-left flex items-center justify-between ${
                              isSelected
                                ? 'bg-gradient-to-r from-blue-500 to-teal-500 text-white border-blue-500 dark:border-blue-400'
                                : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 hover:border-blue-500 hover:shadow-md dark:hover:border-blue-400'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`text-lg flex-shrink-0 ${isSelected ? 'text-white' : 'text-blue-600 dark:text-blue-400'}`}>
                                {getSubjectIcon(subject)}
                              </div>
                              <span>{subject}</span>
                            </div>
                            {isSelected && <CheckCircle className="w-5 h-5 flex-shrink-0" />}
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={handleGoToBoard}
                        className="flex-1 px-5 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all font-semibold text-base flex items-center justify-center gap-2"
                      >
                        <ArrowLeft className="w-5 h-5" />
                        Back
                      </button>
                      <button
                        onClick={handleSubjectsSubmit}
                        disabled={favoriteSubjects.length === 0}
                        className="flex-1 px-5 py-3 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-lg hover:from-blue-600 hover:to-teal-600 transition-all font-semibold text-base disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Get Started
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Dashboard */}
      {showNameInput === false && user && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-0 w-full"
        >
          <>
            {/* Main Layout: Left Column (Welcome + Subjects) | Right Column (Streak + Continue Learning) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-9">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-8">
                {/* Welcome & Motivational Text */}
                <motion.div variants={itemVariants}>
                  <h1 className="text-5xl font-bold text-gray-900 dark:text-white">
                    {randomWelcome}, <span className="text-transparent bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text">{user.name}</span>
                  </h1>
                  <p className="text-lg text-gray-600 dark:text-gray-400 mt-4">{randomMessage}</p>
                </motion.div>

                {/* My Subjects Section */}
                <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              My Subjects
            </h2>
            <div className="flex items-center gap-3">
              {favoriteSubjects.length > 0 && (
                <button
                  onClick={toggleIsEditing}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                    isEditingSubjects
                      ? 'border-blue-600 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:border-blue-400 dark:text-blue-400'
                      : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-blue-500 hover:text-blue-600 dark:hover:border-blue-400 dark:hover:text-blue-400'
                  }`}
                  aria-label={isEditingSubjects ? 'Done editing subjects' : 'Edit subjects'}
                  title={isEditingSubjects ? 'Done editing — hide controls' : 'Edit subject list'}
                >
                  <Pencil className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={openAddSubjectModal}
                className="px-7 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-semibold flex items-center gap-2 text-base"
              >
                <Plus className="w-5 h-5" />
                Add Subject
              </button>
            </div>
          </div>

          {favoriteSubjects.length > 0 ? (
            <div className="flex flex-col gap-6">
              {favoriteSubjects.map((fav, index) => {
                const paths = getSubjectPaths(fav);
                const showTopicals = hasTopicalsForSubject(fav);
                const progressKey = `${fav.level}|${fav.board}|${fav.subject}`;
                const progressGroups = subjectProgressByKey.get(progressKey) ?? [];
                return (
                <motion.div
                  key={`${fav.board}-${fav.level}-${fav.subject}`}
                  initial={{ scale: 0.8 , opacity: 1 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative group rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-blue-600 dark:hover:border-blue-400 transition-all border-[1.5px] duration-300"
                >
                  <div className="h-10 bg-blue-800" />

                  <div className="bg-white dark:bg-gray-800">
                    <div className="p-6">
                      <div className="flex items-start gap-5">
                        <div className="bg-blue-100 w-14 h-14 dark:bg-gray-900/70 rounded-md text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0 mt-0">
                          {getSubjectIcon(fav.subject, 'w-9 h-9')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="font-semibold text-gray-900 dark:text-white block text-2xl">{fav.subject}</span>
                          <span className="text-base text-gray-500 dark:text-gray-400">{fav.level} • {fav.board}</span>
                          <SubjectProgressBars groups={progressGroups} compact />
                        </div>
                        {isEditingSubjects && (
                          <button
                            onClick={() => handleRemoveSubject(fav)}
                            className="text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1 flex-shrink-0 mt-3"
                            aria-label={`Remove ${fav.subject}`}
                            title={`Remove ${fav.subject} from your list`}
                          >
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                              transition={{ duration: 0.2 }}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <X className="w-6 h-6" />
                            </motion.div>
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                      <Link
                        to={paths.resources}
                        className="flex-1 py-3.5 text-center text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        Resources
                      </Link>
                      {showTopicals && (
                        <>
                          <div className="w-px shrink-0 bg-gray-200 dark:bg-gray-700" aria-hidden="true" />
                          <Link
                            to={paths.topicals}
                            className="flex-1 py-3.5 text-center text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                          >
                            Topicals
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
                );
              })}
            </div>
          ) : (
            <p className="text-lg text-gray-600 dark:text-gray-400">No subjects added yet. Click "Add Subject" to get started!</p>
          )}
        
          {user.recentCourses.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20, }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-12 flex justify-center"
            >
              <Link
                to="/curriculum"
                className="px-10 py-5 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-lg hover:from-blue-600 hover:to-teal-600 transition-all duration-200 font-semibold text-xl shadow-lg hover:shadow-xl flex items-center gap-3"
              >
                Explore New Things
              </Link>
            </motion.div>
          )}
        </motion.div>
              </div>

              {/* Right Column - Stacked Vertically */}
              <div className="lg:col-span-1 space-y-8">
                {/* Streak Widget */}
                {streak && dayData.length > 0 && (
                  <motion.div
                    variants={itemVariants}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="bg-blue-50 dark:bg-slate-900 rounded-2xl p-8 border border-blue-200 dark:border-gray-100/50 shadow-md h-full">
                      {/* Streak Stats */}
                      <div className="space-y-3 mb-4">
                        <div className="text-center">
                          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold mb-1">Current Streak</p>
                          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                            {streak.currentStreak}🔥
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2 text-center">
                            <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Best</p>
                            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{streak.longestStreak}</p>
                          </div>
                          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2 text-center">
                            <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Visited</p>
                            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{streak.visitedDates.length}</p>
                          </div>
                        </div>
                      </div>

                      {/* Mini Calendar */}
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                        <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase">Last 30 Days</h4>
                        <div className="grid grid-cols-7 gap-1">
                          {dayData.map((day, index) => (
                            <motion.div
                              key={day.date}
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: index * 0.01 }}
                              title={day.date}
                              className="group relative"
                            >
                              <div
                                className={`w-5 h-5 rounded text-xs flex items-center justify-center font-semibold transition-all ${
                                  day.isVisited
                                    ? 'bg-green-400 text-white shadow-sm'
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-500 text-[0.6rem]'
                                }`}
                              >
                                {day.dayOfMonth}
                              </div>
                              {/* Tooltip */}
                              <div className="hidden group-hover:block absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-1.5 py-0.5 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded whitespace-nowrap z-10 pointer-events-none">
                                {day.date}
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      {/* Motivation */}
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 text-center">
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          🎯 Come back tomorrow!
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Continue Learning - Stacked Below Streak */}
                {user.recentCourses.length > 0 && (
                  <motion.div variants={itemVariants}>
                    <div className="bg-blue-50 dark:bg-slate-900 rounded-2xl p-8 border border-blue-200 dark:border-gray-100/50 shadow-md">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-5 flex items-center">
                        <Bookmark className="w-7 h-7 fill-blue-600 text-blue-600 mr-2" />
                        Pick Up Where You Left Off
                      </h3>
                      <div className="space-y-2">
                        {user.recentCourses.slice(0, 3).map((course, index) => {
                          const metadata = getTopicMetadata(course.id);
                          return (
                            <motion.div
                              key={course.id}
                              initial={{ opacity: 1, y: 10, scale: 0.8 }}
                              animate={{ opacity: 1, y: 0 ,scale: 1 }}
                              transition={{ delay: index * 0.1 }}
                              className="px-6 py-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm group hover:shadow-md hover:border-blue-600 dark:hover:border-blue-400 transition-all cursor-pointer text-left w-full"
                            >
                              <div className="flex gap-3">
                                {/* Subject Icon - aligned with title using mt-1 */}
                                {course.subject && (
                                  <div className="bg-blue-100 w-12 h-12 dark:bg-gray-900/70 rounded-md text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0 mt-6">
                                    {getSubjectIcon(course.subject, 'w-7 h-7')}
                                  </div>
                                )}
                                
                                {/* Content wrapper */}
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 flex-wrap mb-3">
                                    {(() => {
                                      const dedup: Record<string, boolean> = {};
                                      const badges: React.ReactNode[] = [];

                                      const addBadge = (label: string, className: string) => {
                                        if (!label || dedup[label]) return;
                                        dedup[label] = true;
                                        badges.push(
                                          <span key={label} className={`text-[0.600rem] font-semibold px-3 py-1 rounded-full ${className}`}>
                                            {label}
                                          </span>
                                        );
                                      };

                                      addBadge(course.type, 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-100');
                                      if (course.group) addBadge(course.group, 'text-blue-700 bg-blue-100 dark:bg-blue-900 dark:text-blue-100');
                                      if (metadata?.tags) {
                                        metadata.tags.forEach((tag) => {
                                          addBadge(tag.name, `${tag.color} text-white`);
                                        });
                                      }

                                      return badges;
                                    })()}
                                  </div>
                                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">{course.title}</h4>
                                  {(() => {
                                    const hasBoardAndSubject = course.board && course.subject;
                                    const link = hasBoardAndSubject
                                      ? `/curriculum/${course.type.toLowerCase()}/${course.board}/${course.subject}/${getTopicSlug({ title: course.title, group: course.group })}`
                                      : `/topic/${course.id}`;
                                    return (
                                      <Link to={link} className=" px-0.5 inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold text-xs ">
                                        Continue
                                        <ArrowRight className="w-4 h-4 ml-1" />
                                      </Link>
                                    );
                                  })()}
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
        </>
      </motion.div>
      )}

      {/* Add Subject Modal */}
      <AddSubjectModal
        isOpen={showAddSubjectModal && showNameInput === false && !!user}
        onClose={handleCloseModal}
        favoriteSubjects={favoriteSubjects}
        onSubjectsChange={setFavoriteSubjects}
      />
    </div>
  );
};

export default Home;
