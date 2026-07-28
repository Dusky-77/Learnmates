import React, { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, BookOpen, CheckCircle, Sparkles, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchProfile } from '../utils/profileSync';
import { Card, Button, Badge } from '@/components/ui';


const Home: React.FC = () => {
  const { user: authUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading || !authUser) return;

    const redirectIfComplete = async () => {
      const profile = await fetchProfile(authUser.id);
      if (profile?.username && profile?.profile_complete) {
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
    };

    redirectIfComplete();
  }, [authUser, authLoading, navigate]);

  const containerVariants = useMemo(
    () => ({
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 },
      },
    }),
    []
  );

  const itemVariants = useMemo(
    () => ({
      hidden: { y: 20, opacity: 0 },
      visible: {
        y: 0,
        opacity: 1,
        transition: { duration: 0.6 },
      },
    }),
    []
  );

  if (authLoading || authUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary-600 rounded-full animate-pulse mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  const features = [
    {
      icon: <BookOpen className="h-7 w-7" />,
      title: 'Learn with structure',
      description: 'Explore curriculum-aligned subjects and step-by-step topics for IGCSE and A-Level study.',
    },
    {
      icon: <CheckCircle className="h-7 w-7" />,
      title: 'Practise and improve',
      description: 'Use quizzes, videos, topicals, and other resources to turn understanding into progress.',
    },
    {
      icon: <Users className="h-7 w-7" />,
      title: 'Study your way',
      description: 'Save your subjects, track your streak, and continue learning at your own pace.',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Helmet>
        <title>Learnmates | Free IGCSE and A-Level Learning Resources</title>
        <meta
          name="description"
          content="Learnmates provides free, curriculum-aligned IGCSE and A-Level resources, quizzes, videos, and study tools."
        />
        <meta name="keywords" content="Learnmates, IGCSE, A-Level, education, learning resources" />
      </Helmet>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 w-full"
      >
        <motion.section variants={itemVariants} className="text-center max-w-4xl mx-auto">
          
          <h1 className="mt-7 text-5xl font-extrabold tracking-tight text-neutral-900 dark:text-white sm:text-7xl">
            Meet{' '}
            <span className="text-primary-600 dark:text-primary-400">
              Learnmates
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-xl leading-relaxed text-neutral-600 dark:text-neutral-300">
            Learnmates is a free learning platform that helps IGCSE and A-Level students understand difficult topics,
            practise with confidence, and keep their learning journey organised.
          </p>
          <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild variant="secondary">
              <Link to="/login" className="flex items-center gap-2">
                Start your journey
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" asChild variant="outline">
              <Link to="/curriculum" className="flex items-center">
                Explore curriculum
              </Link>
            </Button>
          </div>
        </motion.section>

        <motion.section variants={itemVariants} className="mt-16 grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} variant="elevated" padding="lg">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                {feature.icon}
              </div>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white">{feature.title}</h2>
              <p className="mt-3 leading-relaxed text-neutral-600 dark:text-neutral-300">{feature.description}</p>
            </Card>
          ))}
        </motion.section>

        <motion.p variants={itemVariants} className="mt-10 text-center text-sm text-neutral-500 dark:text-neutral-400">
          Learn more about our mission and resources on the{' '}
          <Link to="/about" className="font-semibold text-primary-600 hover:underline dark:text-primary-400">
            About Learnmates
          </Link>{' '}
          page.
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Home;