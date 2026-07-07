import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, ArrowLeft, Plus } from 'lucide-react';
import { getAvailableLevels, getAvailableBoardsForLevel, getAvailableSubjectsForLevelAndBoard, BoardKey } from '../utils/curriculumData';
import { FavoriteSubject, saveFavoriteSubjects } from '../utils/favoriteSubjects';
import { getSubjectIcon } from '../utils/subjectIcons';

interface AddSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  favoriteSubjects: FavoriteSubject[];
  onSubjectsChange: (subjects: FavoriteSubject[]) => void;
}

type ModalStep = 'level' | 'board' | 'subject' | 'success';

const AddSubjectModal: React.FC<AddSubjectModalProps> = ({
  isOpen,
  onClose,
  favoriteSubjects,
  onSubjectsChange,
}) => {
  const [step, setStep] = useState<ModalStep>('level');
  const [modalLevel, setModalLevel] = useState<string | null>(null);
  const [modalBoard, setModalBoard] = useState<BoardKey | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  const availableLevels = getAvailableLevels();
  const availableBoards = modalLevel ? getAvailableBoardsForLevel(modalLevel) : [];
  const availableSubjects = modalLevel && modalBoard ? getAvailableSubjectsForLevelAndBoard(modalLevel, modalBoard) : [];

  const handleClose = () => {
    setStep('level');
    setModalLevel(null);
    setModalBoard(null);
    setSelectedSubject(null);
    onClose();
  };

  const handleLevelSelect = (level: string) => {
    setModalLevel(level);
    setModalBoard(null);
    setSelectedSubject(null);
    setStep('board');
  };

  const handleBoardSelect = (board: BoardKey) => {
    setModalBoard(board);
    setSelectedSubject(null);
    setStep('subject');
  };

  const handleSubjectSelect = (subject: string) => {
    setSelectedSubject(subject);
  };

  const handleConfirmSubject = () => {
    if (!modalLevel || !modalBoard || !selectedSubject) return;

    const newFavorite: FavoriteSubject = { subject: selectedSubject, level: modalLevel, board: modalBoard };
    const alreadyExists = favoriteSubjects.some(
      (fav) => fav.subject === selectedSubject && fav.level === modalLevel && fav.board === modalBoard
    );
    
    if (!alreadyExists) {
      const newSubjects = [...favoriteSubjects, newFavorite];
      saveFavoriteSubjects(newSubjects);
      onSubjectsChange(newSubjects);
      setStep('success');
    } else {
      handleClose();
    }
  };

  const handleBackToLevel = () => {
    setStep('level');
    setModalLevel(null);
    setModalBoard(null);
    setSelectedSubject(null);
  };

  const handleBackToBoard = () => {
    setStep('board');
    setModalBoard(null);
    setSelectedSubject(null);
  };

  const handleBackToSubject = () => {
    setStep('subject');
    setSelectedSubject(null);
  };

  const getStepTitle = () => {
    switch (step) {
      case 'level':
        return 'Select Your Level';
      case 'board':
        return 'Select Your Board';
      case 'subject':
        return 'Select Your Subject';
      case 'success':
        return 'Subject Added!';
      default:
        return 'Add Subject';
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 'level':
        return 'Choose your education level';
      case 'board':
        return `Great! Now select your board`;
      case 'subject':
        return `Perfect! Choose a subject to study`;
      case 'success':
        return 'Ready to start learning?';
      default:
        return '';
    }
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <AnimatePresence mode="wait">
              {step !== 'success' && (
                <motion.div
                  key="header"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-between mb-8"
                >
                  <div>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{getStepTitle()}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{getStepDescription()}</p>
                  </div>
                  <button
                    onClick={handleClose}
                    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors flex-shrink-0"
                  >
                    <X className="w-7 h-7" />
                  </button>
                </motion.div>
              )}

              {/* Level Selection Step */}
              {step === 'level' && (
                <motion.div
                  key="level-step"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="space-y-3">
                    {availableLevels.map((level) => (
                      <button
                        key={level}
                        onClick={() => handleLevelSelect(level)}
                        className="w-full p-4 rounded-lg font-medium text-base transition-all border-2 text-left bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-200 dark:border-gray-600 hover:border-blue-500 hover:shadow-md dark:hover:border-blue-400"
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Board Selection Step */}
              {step === 'board' && (
                <motion.div
                  key="board-step"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="space-y-3 mb-6">
                    {availableBoards.map((board) => (
                      <button
                        key={board.id}
                        onClick={() => handleBoardSelect(board.id)}
                        className="w-full p-4 rounded-lg font-medium text-base transition-all border-2 text-left bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-200 dark:border-gray-600 hover:border-blue-500 hover:shadow-md dark:hover:border-blue-400"
                      >
                        {board.name}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={handleBackToLevel}
                    className="w-full flex items-center justify-center gap-2 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    Back
                  </button>
                </motion.div>
              )}

              {/* Subject Selection Step */}
              {step === 'subject' && (
                <motion.div
                  key="subject-step"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="space-y-3 mb-6">
                    {availableSubjects.map((subject) => {
                      const isAdded = favoriteSubjects.some(
                        (fav) => fav.subject === subject && fav.level === modalLevel && fav.board === modalBoard
                      );
                      const isSelected = selectedSubject === subject;
                      
                      return (
                        <button
                          key={subject}
                          onClick={() => handleSubjectSelect(subject)}
                          disabled={isAdded && !isSelected}
                          className={`w-full p-4 rounded-lg font-medium text-base transition-all border-2 text-left flex items-center justify-between ${
                            isSelected
                              ? 'bg-gradient-to-r from-blue-500 to-teal-500 text-white border-blue-500 dark:border-blue-400'
                              : isAdded
                              ? 'bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-500 cursor-not-allowed'
                              : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-200 dark:border-gray-600 hover:border-blue-500 hover:shadow-md dark:hover:border-blue-400'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`text-lg flex-shrink-0 ${isSelected ? 'text-white' : 'text-blue-600 dark:text-blue-400'}`}>
                              {getSubjectIcon(subject)}
                            </div>
                            <span>{subject}</span>
                          </div>
                          {isSelected && <CheckCircle className="w-5 h-5 flex-shrink-0" />}
                          {isAdded && !isSelected && <CheckCircle className="w-5 h-5 flex-shrink-0 opacity-50" />}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleBackToBoard}
                      className="flex-1 flex items-center justify-center gap-2 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors border border-gray-300 dark:border-gray-600 rounded-lg"
                    >
                      <ArrowLeft className="w-5 h-5" />
                      Back
                    </button>
                    <button
                      onClick={handleConfirmSubject}
                      disabled={!selectedSubject}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-lg hover:from-blue-600 hover:to-teal-600 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add Subject
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Success Step */}
              {step === 'success' && (
                <motion.div
                  key="success-step"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                  className="text-center py-8"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.4, type: 'spring', stiffness: 100 }}
                    className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6"
                  >
                    <CheckCircle className="w-9 h-9 text-white" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Great! You're all set
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    <span className="font-semibold text-blue-600 dark:text-blue-400">{selectedSubject}</span> has been added to your subjects
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        handleClose();
                      }}
                      className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all font-semibold"
                    >
                      Done
                    </button>
                    <button
                      onClick={() => {
                        setStep('level');
                        setModalLevel(null);
                        setModalBoard(null);
                        setSelectedSubject(null);
                      }}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-lg hover:from-blue-600 hover:to-teal-600 transition-all font-semibold flex items-center justify-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      Add Another
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default AddSubjectModal;
