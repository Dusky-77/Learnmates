import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { BookOpen, ArrowRight, FlaskConical, Gauge, Dna, Rocket, Sigma, PieChart, CheckCircle } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { curriculumData, type Topic, type BoardKey, getTopicSlug } from '../utils/curriculumData';
import TopicGroupList from '../components/TopicGroupList';
import { topicData } from '../data/topicData';
import { useEngagementRevision } from '../hooks/useEngagementRevision';
import {
  getSubjectProgress,
  isTopicComplete,
  loadResourceEngagements,
} from '../utils/resourceEngagement';
import { filterCountableTopics, isRevisionTopic } from '../utils/subjectProgressGroups';
import { loadDoneItems } from '../utils/doneItems';
import { useRouteBase, withBase } from '../utils/routeBase';
import { Card, Badge, Button } from '@/components/ui';


const CurriculumPage: React.FC = () => {
  const base = useRouteBase();
  const curriculumPath = (...parts: string[]) => withBase(base, `/curriculum/${parts.join('/')}`);
  const { user, addRecentCourse } = useUser();
  const [selectedBoard, setSelectedBoard] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  const params = useParams<{ type?: string; board?: string; subject?: string }>();
  const typeParam = params.type ? params.type.toLowerCase() : undefined;
  const boardParam = params.board ? params.board.toLowerCase() : undefined;
  const subjectParam = params.subject ? decodeURIComponent(params.subject) : undefined;
  const availableLevels = Object.keys(curriculumData);
  const selectedLevel = typeParam && availableLevels.includes(typeParam) ? typeParam : 'igcse';
  const curriculum = curriculumData[selectedLevel as keyof typeof curriculumData];
  const navigate = useNavigate();

  useEffect(() => {
    if (boardParam === 'cambridge' || boardParam === 'edexcel') {
      setSelectedBoard(boardParam);
    } else {
      setSelectedBoard(null);
    }
  }, [boardParam]);

  useEffect(() => {
    if (subjectParam) {
      setSelectedSubject(subjectParam);
    } else {
      setSelectedSubject(null);
    }
  }, [subjectParam]);

  const boardTopics = useMemo<Topic[]>(() => {
    return (curriculum && selectedBoard && (selectedBoard === 'cambridge' || selectedBoard === 'edexcel'))
      ? curriculum.boards[selectedBoard as BoardKey]?.topics || []
      : [];
  }, [curriculum, selectedBoard]);

  const subjectTopics = useMemo<Topic[]>(() => {
    return selectedSubject
      ? boardTopics.filter((t: Topic) => t.subject === selectedSubject)
      : [];
  }, [selectedSubject, boardTopics]);

  const engagementRevision = useEngagementRevision();

  const getTopicResources = (topicId: string) => topicData[topicId]?.resources ?? [];

  const countableTopics = useMemo(
    () => filterCountableTopics(subjectTopics),
    [subjectTopics]
  );

  const subjectProgress = useMemo(() => {
    void engagementRevision;
    const doneResources = loadDoneItems('doneResources');
    const engagements = loadResourceEngagements();
    return getSubjectProgress(
      countableTopics.map((topic) => topic.id),
      getTopicResources,
      doneResources,
      engagements
    );
  }, [countableTopics, engagementRevision]);

  const isTopicDone = (topic: Topic) => {
    void engagementRevision;
    if (isRevisionTopic(topic)) return false;
    return isTopicComplete(topic.id, getTopicResources(topic.id));
  };

  const containerVariants = {
    hidden: { opacity: 0, transition: { duration: 0 } },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0, transition: { duration: 0 } },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6 }
    }
  };

  const getSubjectIcon = (subject: string) => {
    const icons: Record<string, React.ReactNode> = {
      'Chemistry': <FlaskConical className="w-8 h-8 transform transition-transform group-hover:scale-150" />,
      'Biology': <Dna className="w-8 h-8 transform transition-transform group-hover:scale-125" />,
      'Physics': <Rocket className="w-8 h-8 transform transition-transform group-hover:scale-125" />,
      'Mathematics': <Sigma className="w-8 h-8 transform transition-transform group-hover:scale-125" />,
      'Pure Mathematics': <Sigma className="w-8 h-8 transform transition-transform group-hover:scale-125" />,
      'Statistics': <PieChart className="w-8 h-8 transform transition-transform group-hover:scale-125" />,
      'Mechanics': <Gauge className="w-8 h-8 transform transition-transform group-hover:scale-125" />,
    };
    return icons[subject] || <BookOpen className="w-7 h-7 text-neutral-600 dark:text-neutral-300 transform transition-transform group-hover:scale-125" />;
  };

  const getSubjectColor = (subject: string) => {
    const colors: Record<string, string> = {
      'Chemistry': 'from-teal-500 to-teal-600 dark:from-teal-400 dark:to-teal-500',
      'Biology': 'from-green-500 to-green-600 dark:from-green-400 dark:to-green-500',
      'Physics': 'from-indigo-500 to-indigo-600 dark:from-indigo-400 dark:to-indigo-500',
      'Mathematics': 'from-orange-500 to-orange-600 dark:from-orange-400 dark:to-orange-500',
      'Pure Mathematics': 'from-amber-500 to-amber-600 dark:from-amber-400 dark:to-amber-500',
      'Statistics': 'from-purple-500 to-purple-600 dark:from-purple-400 dark:to-purple-500',
      'Mechanics': 'from-red-500 to-red-600 dark:from-red-400 dark:to-red-500',
    };
    return colors[subject] || 'from-primary-600 to-primary-500 dark:from-primary-700 dark:to-primary-800';
  };

  // Step 1: Select Board
  if (!selectedBoard) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2 tracking-tight">Select Your Exam Board</h1>
          <p className="text-base text-neutral-500">Choose a board to see tailored subjects and topics.</p>
        </motion.div>
        <div className="flex flex-col sm:flex-row gap-8 w-full justify-center">
          <motion.button
            initial={{ opacity: 0, y: 20, transition: { duration: 0 } }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex-1 rounded-2xl shadow-sm bg-[#374151] border border-neutral-100 dark:border-neutral-700 px-8 py-8 text-left transform hover:-translate-y-1 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary-100 group"
            onClick={() => navigate(curriculumPath(selectedLevel, 'cambridge'))}
          >
            <div className="flex items-start">
              <img src="/logos/Cambridge.svg" alt="Cambridge" className="w-12 h-12 mr-6 object-contain transform transition-transform group-hover:scale-105" />
              <div>
                <span className="block mb-1 text-2xl font-semibold text-slate-900 dark:text-white">Cambridge</span>
                <span className="block text-sm text-neutral-600 dark:text-neutral-300">International Examinations</span>
              </div>
            </div>
          </motion.button>
          <motion.button
            initial={{ opacity: 0, y: 20, transition: { duration: 0 } }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex-1 rounded-2xl shadow-sm bg-[#374151] border border-neutral-100 dark:border-neutral-700 px-8 py-8 text-left transform hover:-translate-y-1 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary-100 group"
            onClick={() => navigate(curriculumPath(selectedLevel, 'edexcel'))}
          >
            <div className="flex items-start">
              <img src="/logos/Pearson.svg" alt="Pearson" className="w-12 h-12 mr-6 object-contain transform transition-transform group-hover:scale-105" />
              <div>
                <span className="block mb-1 text-2xl font-semibold text-slate-900 dark:text-white">Edexcel</span>
                <span className="block text-sm text-neutral-600 dark:text-neutral-300">Edexcel Board</span>
              </div>
            </div>
          </motion.button>
        </div>
        <div className="mt-12">
          <Link to={curriculumPath()} className="inline-flex items-center text-primary-600 hover:underline text-lg font-medium">
            <ArrowRight className="w-5 h-5 mr-2" /> Back to Curriculum
          </Link>
        </div>
      </div>
    );
  }

  // Step 2: Select Subject
  if (!selectedSubject) {
    if (!curriculum || !selectedBoard) return null;
    const subjects: string[] = Array.from(new Set(boardTopics.map((t: Topic) => t.subject)));
    const subjectColors: Record<string, string> = {};
    const ACCENT_GRADIENT = 'from-primary-600 to-primary-500 dark:from-primary-700 dark:to-primary-800';
    subjects.forEach((subject) => {
      subjectColors[subject] = subjectColors[subject] || ACCENT_GRADIENT;
    });
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col items-center">
        <Helmet>
          <title>{`${curriculum.title} — ${selectedBoard?.charAt(0).toUpperCase() + selectedBoard?.slice(1)} Subjects | Learnmates`}</title>
          <meta name="description" content={curriculum.description} />
          <meta name="keywords" content={`Learnmates, ${curriculum.title}, ${selectedBoard}, subjects, free study materials`} />
          <link rel="canonical" href={`/curriculum/${selectedLevel}/${selectedBoard}`} />
        </Helmet>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">Select a Subject</h1>
          <p className="text-base text-neutral-500">Pick a subject to view topics and start learning.</p>
        </motion.div>
        <div
          className={
            subjects.length === 1
              ? "w-full flex justify-center"
              : subjects.length === 2
                ? "w-full grid grid-cols-2 gap-8 justify-center"
                : "w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 justify-center"
          }
        >
          {subjects.map((subject: string) => (
            <motion.button
              key={subject}
              initial={{ opacity: 0, y: 20, transition: { duration: 0 } }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col items-start rounded-2xl shadow-sm bg-[#374151] border border-neutral-100 dark:border-neutral-700 px-6 py-8 sm:px-8 sm:py-10 lg:px-8 lg:py-10 transform hover:-translate-y-1 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary-100 group"
              onClick={() => navigate(curriculumPath(selectedLevel, selectedBoard!, encodeURIComponent(subject)))}
            >
              <div className="flex items-center mb-4">
                <div className="bg-primary-100 w-12 h-12 dark:bg-neutral-900 p-2 rounded-md mr-2 transform transition-transform group-hover:scale-103">
                  {getSubjectIcon(subject)}
                </div>
                <span className="font-semibold text-lg text-slate-900 dark:text-white">{subject}</span>
              </div>
              <span className="text-xs text-neutral-500 dark:text-neutral-400">Explore topics and resources</span>
            </motion.button>
          ))}
        </div>
        <div className="mt-12">
          <Button variant="ghost" onClick={() => navigate(curriculumPath(selectedLevel))} leftIcon={<ArrowRight className="w-5 h-5" />}>
            Back to Board Selection
          </Button>
        </div>
      </div>
    );
  }

  // Step 3: Show topics for selected subject
  if (!curriculum || !selectedBoard) return null;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
    >
      <Helmet>
        <title>{`${curriculum.title} — ${selectedSubject} Topics | Learnmates`}</title>
        <meta name="description" content={`Browse ${selectedSubject} topics for ${curriculum.title}. ${curriculum.description}`} />
        <meta name="keywords" content={`Learnmates, ${curriculum.title}, ${selectedBoard}, ${selectedSubject}, topics`} />
        <link rel="canonical" href={`/curriculum/${selectedLevel}/${selectedBoard}/${encodeURIComponent(selectedSubject)}`} />
      </Helmet>
      {/* Header */}
      <motion.div variants={itemVariants} className="text-center mb-16">
        <div className="flex items-center justify-center mb-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(curriculumPath(selectedLevel, selectedBoard!))}>
            ← Back to Subjects
          </Button>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white mb-3">
          {curriculum.title} — {selectedSubject} Topics
        </h1>
        <p className="text-base text-neutral-600 dark:text-neutral-300 max-w-3xl mx-auto leading-relaxed">
          {curriculum.description}
        </p>
        <div className="mt-4 text-lg text-neutral-700 dark:text-neutral-300">Board: <span className="font-semibold">{selectedBoard}</span></div>
        {subjectProgress.total > 0 && (
          <div className="mt-6 max-w-md mx-auto">
            <div className="flex justify-between text-sm text-neutral-600 dark:text-neutral-300 mb-2">
              <span>Subject progress</span>
              <span>{subjectProgress.completed} of {subjectProgress.total} topics ({subjectProgress.percent}%)</span>
            </div>
            <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2.5">
              <div
                className={`bg-gradient-to-r ${getSubjectColor(selectedSubject || '')} h-2.5 rounded-full transition-all duration-300`}
                style={{ width: `${subjectProgress.percent}%` }}
              />
            </div>
          </div>
        )}
      </motion.div>

      {/* Topics Grid */}
      <TopicGroupList
        topics={subjectTopics}
        onTopicClick={(topic) => {
          if (user) {
            addRecentCourse({
              id: topic.id,
              title: topic.title,
              progress: isTopicDone(topic) ? 100 : 0,
              type: curriculum.title,
              board: selectedBoard,
              subject: topic.subject,
              group: topic.group
            });
          }
        }}
        renderTopicCard={(topic, index) => {
          const completed = isTopicDone(topic);
          const hasResources = getTopicResources(topic.id).length > 0;
          const countsTowardProgress = !isRevisionTopic(topic);
          return (
            <motion.div
              initial={{ opacity: 0, y: 20, transition: { duration: 0 } }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="bg-[#374151] dark:bg-[#374151] rounded-xl shadow-lg border border-transparent hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 overflow-hidden group hover:border-2 hover:border-primary-500 dark:hover:border-primary-400"
              style={{ minWidth: '0' }}
            >
              {/* Mobile List View */}
              <Link
                to={curriculumPath(curriculum.title.toLowerCase(), selectedBoard!, topic.subject, getTopicSlug(topic))}
                className="flex lg:hidden flex-col hover:bg-neutral-700 transition-colors"
              >
                <div className="flex items-start p-4 gap-3">
                  <div className="w-1 rounded-full flex-shrink-0 bg-teal-500" style={{ height: '100%', minHeight: '80px' }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                      <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400 uppercase tracking-wide">{topic.subject}</span>
                      {topic.group && (
                        <Badge variant="outline" size="xs" className="bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-200">
                          {topic.group}
                        </Badge>
                      )}
                      {topic.tags && topic.tags.length > 0 && (
                        <div className="flex gap-1 flex-wrap">
                          {topic.tags.map((tag, idx) => (
                            <Badge key={idx} variant="primary" size="xs" className="text-xs">
                              {tag.name}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">{topic.title}</h3>
                    <p className="text-xs text-neutral-600 dark:text-neutral-300 line-clamp-2">{topic.description}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    {countsTowardProgress && completed && (
                      <Badge variant="success" size="xs" className="text-xs">
                        <CheckCircle className="w-3.5 h-3.5 mr-0.5" />
                        Done
                      </Badge>
                    )}
                  </div>
                </div>
              </Link>

              {/* Desktop Card View */}
              <div className="hidden lg:flex h-full flex-col">
                <div className="flex">
                    <div className="w-1.5 mr-4 rounded-full bg-[#1e48c7] transition-all duration-200 group-hover:w-3" />
                    <div className="flex-1 p-5 flex flex-col bg-[#374151]">
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400 uppercase tracking-wide">
                          {topic.subject}
                        </span>
{topic.group && (
                        <Badge variant="outline" size="xs" className="bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-200">
                          {topic.group}
                        </Badge>
                      )}
                      {topic.tags && topic.tags.length > 0 && (
                        <div className="flex gap-1.5 flex-wrap">
                          {topic.tags.map((tag, idx) => (
                            <Badge key={idx} variant="primary" size="xs" className="text-xs">
                              {tag.name}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 leading-snug">{topic.title}</h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-300 line-clamp-2 flex-grow">{topic.description}</p>
                  </div>
                </div>

                {/* Desktop Content */}
                <div className="p-5 pt-3 flex flex-col flex-grow justify-between">
                  {hasResources && countsTowardProgress && completed && (
                    <Badge variant="success" size="sm" className="mb-3 w-fit">
                      <CheckCircle className="w-4 h-4 mr-1.5" />
                      Topic completed
                    </Badge>
                  )}

                  {/* CTA Button */}
                  <Link
                    to={curriculumPath(curriculum.title.toLowerCase(), selectedBoard!, topic.subject, getTopicSlug(topic))}
                    className="block w-full text-center py-2.5 px-4 bg-[#1e48c7] text-white rounded-lg hover:bg-[#1a3fb3] hover:shadow-md transition-all duration-200 group-hover:scale-105 font-medium text-sm"
                  >
                    <span className="flex items-center justify-center">
                      {completed ? 'Review Topic' : hasResources ? 'Start Learning' : 'Open Topic'}
                      <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Link>
                </div>
              </div>
            </motion.div>
          );
        }}
      />

      {/* Call to Action */}
      <motion.section variants={itemVariants} className="mt-16 text-center">
        <Card variant="elevated" padding="xl" className="bg-gradient-to-r from-primary-600 to-primary-500 text-white">
          <h2 className="text-2xl font-bold mb-3">Ready to excel in {curriculum.title}?</h2>
          <p className="text-base mb-6 opacity-90 max-w-2xl mx-auto">
            Start with any topic that interests you, or follow the structured path for best results.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {subjectTopics.length > 0 && (
              <Button size="lg" asChild className="bg-white text-primary-600 hover:bg-neutral-100 shadow-lg">
                <Link
                  to={curriculumPath(curriculum.title.toLowerCase(), selectedBoard!, subjectTopics[0].subject, getTopicSlug(subjectTopics[0]))}
                  className="flex items-center"
                >
                  Start with First Topic
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            )}
            <Button variant="outline" size="lg" asChild className="border-white text-white hover:bg-white hover:text-primary-600">
              <Link to="/contribute" className="flex items-center">
                Contribute Content
              </Link>
            </Button>
          </div>
        </Card>
      </motion.section>
    </motion.div>
  );
};

export default CurriculumPage;