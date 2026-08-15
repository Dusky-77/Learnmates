import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { SubjectConfig } from '../../utils/topicalConfig';
import { makeKey } from '../../utils/topicalHelpers';
import { pillActive, pillInactive, btnSecondary } from './ui';

interface TopicPickerPanelProps {
  cfg: SubjectConfig;
  checked: Set<string>;
  expanded: Set<string>;
  expandedUnits: Set<string>;
  isTopicChecked: (cfg: SubjectConfig, unitName: string, topicName: string) => boolean;
  isTopicPartiallyChecked: (cfg: SubjectConfig, unitName: string, topicName: string) => boolean;
  toggleTopic: (cfg: SubjectConfig, unitName: string, topicName: string) => void;
  toggleSubtopic: (cfg: SubjectConfig, unitName: string, topicName: string, subtopicName: string) => void;
  toggleExpanded: (cfg: SubjectConfig, unitName: string, topicName: string) => void;
  toggleUnitExpanded: (cfg: SubjectConfig, unitName: string) => void;
  selectedTopicsCount: number;
  hasAnySelectedTopics: boolean;
  collapsed: boolean;
  onExpandPicker: () => void;
}

const TopicPickerPanel: React.FC<TopicPickerPanelProps> = ({
  cfg,
  checked,
  expanded,
  expandedUnits,
  isTopicChecked,
  isTopicPartiallyChecked,
  toggleTopic,
  toggleSubtopic,
  toggleExpanded,
  toggleUnitExpanded,
  selectedTopicsCount,
  hasAnySelectedTopics,
  collapsed,
  onExpandPicker,
}) => {
  const countLabel = hasAnySelectedTopics
    ? `${selectedTopicsCount} topic${selectedTopicsCount === 1 ? '' : 's'} selected`
    : 'No topics selected';

  if (collapsed) {
    return null;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold tracking-wide uppercase text-gray-500 dark:text-gray-400">
          Topics
        </span>
        <span className={hasAnySelectedTopics ? pillActive : pillInactive}>{countLabel}</span>
      </div>
      {cfg.units.map((unit, uidx) => {
        const unitKey = `${cfg.level}||${cfg.board}||${cfg.subject}||${unit.unit}`;
        const isUnitExpanded = expandedUnits.has(unitKey);
        return (
          <div key={uidx} className="mt-4 pl-0">
            <div className="bg-slate-800 dark:bg-slate-900 p-4 rounded-xl border border-slate-700 shadow-lg">
              <div
                className="flex items-center justify-between cursor-pointer mb-2 group"
                onClick={() => toggleUnitExpanded(cfg, unit.unit)}
              >
                <h3 className="text-lg font-bold text-white tracking-wide uppercase">
                  <span className="text-indigo-300 group-hover:text-indigo-200 transition-colors">{unit.unit}</span>
                </h3>
                <span className="flex items-center gap-2 text-sm font-semibold text-indigo-300 group-hover:text-indigo-200 transition-colors">
                  <span>{isUnitExpanded ? 'Collapse' : 'Expand'}</span>
                  <motion.div animate={{ rotate: isUnitExpanded ? 180 : 0 }} transition={{ type: "spring", stiffness: 300, damping: 24 }}>
                    <ChevronDown className="w-5 h-5" />
                  </motion.div>
                </span>
              </div>
              <AnimatePresence initial={false}>
                {isUnitExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 26 }}
                    className="overflow-hidden"
                  >
                    <ul className="space-y-2 pt-2 pb-1">
                      {unit.topics.map((topic, tidx) => {
                        const topicKey = makeKey(cfg.level, cfg.board, cfg.subject, unit.unit, topic.topic);
                        const hasSub = !!(topic.subtopics && topic.subtopics.length > 0);
                        const expandedHere = expanded.has(topicKey);
                        const checkedHere = isTopicChecked(cfg, unit.unit, topic.topic);
                        const partiallyCheckedHere = isTopicPartiallyChecked(cfg, unit.unit, topic.topic);
                        return (
                          <li key={tidx} className="rounded-lg bg-slate-900/70 dark:bg-slate-800/80 border border-slate-700 p-3">
                            <div className="flex items-center justify-between gap-2">
                              <label className="inline-flex items-center space-x-3 cursor-pointer group w-full">
                                <input
                                  type="checkbox"
                                  className="sr-only peer"
                                  checked={checkedHere}
                                  onChange={() => toggleTopic(cfg, unit.unit, topic.topic)}
                                />
                                <span className="relative h-5 w-5 flex-shrink-0 rounded-full border-2 border-gray-400 dark:border-gray-500 aspect-square transition-colors group-hover:border-blue-400">
                                  <motion.span
                                    className="absolute inset-0 m-auto h-3 w-3 rounded-full bg-blue-600 dark:bg-blue-500 border border-blue-400 dark:border-blue-300"
                                    initial={false}
                                    animate={{
                                      clipPath: checkedHere
                                        ? 'inset(0 0% 0 0)'
                                        : partiallyCheckedHere
                                          ? 'inset(0 50% 0 0)'
                                          : 'inset(0 100% 0 0)',
                                    }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                                  />
                                </span>
                                <span
                                  className={`ml-2 text-base font-semibold transition-colors break-words whitespace-normal ${
                                    checkedHere
                                      ? 'text-gray-100 dark:text-gray-200'
                                      : 'text-gray-100 dark:text-gray-200 group-hover:text-white'
                                  }`}
                                >
                                  {topic.topic}
                                </span>
                              </label>
                              {hasSub && (
                                <button
                                  type="button"
                                  onClick={() => toggleExpanded(cfg, unit.unit, topic.topic)}
                                  className="text-sm text-slate-400 hover:text-white dark:text-slate-400 dark:hover:text-white ml-3 transition-colors p-1 rounded-md hover:bg-slate-700/50"
                                  title={expandedHere ? 'Collapse subtopics' : 'Expand subtopics'}
                                >
                                  <motion.div animate={{ rotate: expandedHere ? 180 : 0 }} transition={{ type: "spring", stiffness: 300, damping: 24 }}>
                                    <ChevronDown className="w-5 h-5" />
                                  </motion.div>
                                </button>
                              )}
                            </div>

                            <AnimatePresence initial={false}>
                              {hasSub && expandedHere && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ type: "spring", stiffness: 300, damping: 26 }}
                                  className="overflow-hidden"
                                >
                                  <ul className="pl-10 mt-3 space-y-3 pb-2 border-l border-slate-700/50 ml-2.5">
                                    {topic.subtopics!.map((sub, sidx) => {
                                      const subKey = makeKey(cfg.level, cfg.board, cfg.subject, unit.unit, sub.subtopic);
                                      const subChecked = checked.has(subKey);
                                      return (
                                        <li key={sidx}>
                                          <label className="inline-flex items-center space-x-3 cursor-pointer group">
                                            <input
                                              type="checkbox"
                                              className="sr-only peer"
                                              checked={subChecked}
                                              onChange={() => toggleSubtopic(cfg, unit.unit, topic.topic, sub.subtopic)}
                                            />
                                            <span className="relative h-4 w-4 flex-shrink-0 rounded-full border border-gray-400 dark:border-gray-500 aspect-square transition-colors group-hover:border-blue-400">
                                              <motion.span
                                                className="absolute inset-0 m-auto h-2.5 w-2.5 rounded-full bg-blue-600 dark:bg-blue-500 border border-blue-400 dark:border-blue-300"
                                                initial={false}
                                                animate={{ clipPath: subChecked ? 'inset(0 0% 0 0)' : 'inset(0 100% 0 0)' }}
                                                transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                                              />
                                            </span>
                                            <span
                                              className={`text-sm transition-colors ${
                                                subChecked ? 'text-gray-300 dark:text-gray-400' : 'text-gray-300 dark:text-gray-400 group-hover:text-gray-200'
                                              }`}
                                            >
                                              {sub.subtopic}
                                            </span>
                                          </label>
                                        </li>
                                      );
                                    })}
                                  </ul>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </li>
                        );
                      })}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TopicPickerPanel;
