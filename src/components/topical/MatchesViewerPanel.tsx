import React from 'react';
import TopicalQuiz, { Question } from '../TopicalQuiz';
import ExportMenu from './ExportMenu';
import { pillActive, btnSecondary } from './ui';

interface MatchesViewerPanelProps {
  topicalQuiz: Question[];
  hasLoadedOnce: boolean;
  loadingProgress: { current: number; total: number; isLoading: boolean };
  showUnitTags: boolean;
  onExport: (type: 'questions' | 'markschemes', options?: { extraPage?: boolean }) => void;
  onExpandPicker?: () => void;
  loadFeedback?: string | null;
  showExtraPageOption?: boolean;
  extraPageEnabled?: boolean;
  onExtraPageToggle?: (enabled: boolean) => void;
  loadId?: number;
}

const EmptyState: React.FC<{ title: string; body: string }> = ({ title, body }) => (
  <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 p-4 sm:p-6 text-center">
    <p className="text-sm font-medium text-gray-800 dark:text-gray-100 mb-1">{title}</p>
    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{body}</p>
  </div>
);

const MatchesViewerPanel: React.FC<MatchesViewerPanelProps> = ({
  topicalQuiz,
  hasLoadedOnce,
  loadingProgress,
  showUnitTags,
  onExport,
  onExpandPicker,
  loadFeedback,
  showExtraPageOption = false,
  extraPageEnabled = false,
  onExtraPageToggle,
  loadId,
}) => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-5 h-full flex flex-col">
      <div className="flex items-baseline justify-between gap-3 mb-3">
        <div>
          {hasLoadedOnce && topicalQuiz.length > 0 && onExpandPicker ? (
            <button type="button" onClick={onExpandPicker} className={`${btnSecondary} whitespace-nowrap`}>
              Edit topics
            </button>
          ) : (
            <>
              <h2 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100">Matching questions</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Based on your selected topics and subtopics.</p>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasLoadedOnce && topicalQuiz.length > 0 && (
            <ExportMenu
              onExport={onExport}
              showExtraPageOption={showExtraPageOption}
              extraPageEnabled={extraPageEnabled}
              onExtraPageToggle={onExtraPageToggle}
            />
          )}
          {hasLoadedOnce && (
            <span className={pillActive}>
              {topicalQuiz.length} match{topicalQuiz.length === 1 ? '' : 'es'}
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 border-t border-gray-200 dark:border-blue-800 pt-4 mt-2">
        {loadingProgress.isLoading && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Loading questions...</p>
                <div className="mt-1">
                  <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-1.5">
                    <div
                      className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${loadingProgress.total > 0 ? (loadingProgress.current / loadingProgress.total) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                    {loadingProgress.current} of {loadingProgress.total} questions loaded
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {loadFeedback ? (
          <div className="rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/40 p-4 text-sm text-red-700 dark:text-red-200">
            <p className="font-semibold">No matching papers found</p>
            <p className="mt-1">{loadFeedback}</p>
          </div>
        ) : topicalQuiz.length > 0 ? (
          <TopicalQuiz
            key={loadId}
            questions={topicalQuiz}
            title={`Topical Matches (${topicalQuiz.length})`}
            quizId="topical"
            showUnitTags={showUnitTags}
            isLoading={loadingProgress.isLoading}
          />
        ) : hasLoadedOnce ? (
          <EmptyState
            title="No matching questions found"
            body='Try selecting more topics or a different unit, then click "Load matching papers" again.'
          />
        ) : (
          <EmptyState
            title="Matches will appear here"
            body='Tick one or more topics on the left, then click "Load matching papers" to see relevant questions.'
          />
        )}
      </div>
    </div>
  );
};

export default MatchesViewerPanel;
