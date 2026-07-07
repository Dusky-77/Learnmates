import React from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { CheckCircle, PlusCircle, BookOpen, User, Users, Briefcase, Code, HeartHandshake } from 'lucide-react';

const Contribute: React.FC = () => {
  const [showWordModal, setShowWordModal] = React.useState(false);
  const [selectedRole, setSelectedRole] = React.useState<number | null>(null);

  const roles = [
    {
      icon: <Code className="w-5 h-5" />,
      title: "Development",
      desc: "Build our platform with modern tech.",
      details: {
        description: "Help us build and maintain the Learnmates platform using modern web technologies. You'll develop new features, improve existing functionality, work with React and TypeScript, collaborate with the design team on UI/UX implementation, write clean and maintainable code, and participate in code reviews and testing."
      }
    },
    {
      icon: <BookOpen className="w-5 h-5" />,
      title: "Content & Education",
      desc: "Heart of your platform (lessons, notes, quizzes).",
      details: {
        description: "Review, curate, and ensure quality of educational content across our platform. You'll review submitted educational materials for accuracy, verify curriculum alignment with IGCSE/A-Level standards, provide constructive feedback to contributors, organize and categorize content, and suggest improvements for submitted resources."
      }
    },
    {
      icon: <HeartHandshake className="w-5 h-5" />,
      title: "Media & Outreach",
      desc: "Manage our social media and Discord presence.",
      details: {
        description: "Build and manage parts of our social media presence and community channels. You'll help manage some of our social media accounts (such as Instagram or Twitter), create engaging social media content, moderate our Discord server and community forums, respond to community inquiries and comments, and help grow our engagement metrics."
      }
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6 }
    }
  };


  return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <Helmet>
          <title>Learnmates | Contribute</title>
          <meta name="description" content="Contribute to Learnmates by sharing lessons, notes, or quizzes, or join our team to help build what's next. Help students worldwide access quality educational resources." />
          <meta name="keywords" content="Learnmates, contribute, share, education, lessons, notes, quizzes, curriculum, community, join team, volunteer" />
        </Helmet>
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
    >
      {/* Hero Section */}
      <motion.div variants={itemVariants} className="text-center mb-16">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <PlusCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">Contribute</h1>
          <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">Share lessons, notes, or quizzes to help learners everywhere, or join the Learnmates team to help build what's next.</p>
      </motion.div>

      {/* Two Column Content Section */}
      <motion.section variants={itemVariants} className="mb-16 grid md:grid-cols-2 gap-12 items-center">
        {/* Left: Why Contribute */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Why contribute?</h2>
          <div className="space-y-4">
            {[
              { title: "Impact Learning", desc: "Your content directly helps students understand complex concepts and achieve better grades." },
              { title: "Build Community", desc: "Join educators committed to making quality education accessible worldwide." },
              { title: "Get Recognition", desc: "Get credited and build your reputation in the education community." }
            ].map((item, idx) => (
              <div key={idx} className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900">
                    <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{item.title}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Team Roles */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Join Our Team</h2>
          <div className="space-y-4">
            {roles.map((role, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedRole(idx)}
                className="w-full flex gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-gray-700 transition cursor-pointer text-left group"
              >
                <div className="flex-shrink-0 text-blue-600 dark:text-blue-400 mt-1 group-hover:scale-110 transition">{role.icon}</div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">{role.title}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{role.desc}</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 group-hover:underline">Click to learn more →</p>
                </div>
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-6">Click on any role to see detailed information.</p>
        </div>
      </motion.section>

      {/* Guidelines Section */}
      <motion.section variants={itemVariants} className="mb-16 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Guidelines</h2>
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Content Standards</h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                IGCSE/A-Level curriculum aligned
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                Original or properly credited
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                Clear video & audio quality
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                Well-formatted PDFs
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Review Process</h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                Reviewed by our education team
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                2-3 business days turnaround
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                Feedback provided always
              </li>
            </ul>
          </div>
        </div>
      </motion.section>

      {/* Final CTA Section */}
      <motion.section variants={itemVariants} className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Ready to Get Started?</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
          Share resources or apply to join our team. Just open the form below and let us know how you'd like to contribute.
        </p>
        <a
          href="https://docs.google.com/forms/d/e/1FAIpQLSfOHzdrN-UlAWhRcgUtCGdjuK9LG5-0H2UOjMap8sZV5JajMg/viewform?usp=header"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg"
        >
          Open Contribution Form
        </a>
      </motion.section>

      {/* Role Details Modal */}
      {selectedRole !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
          onClick={() => setSelectedRole(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-blue-600 dark:text-blue-400">{roles[selectedRole].icon}</div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{roles[selectedRole].title}</h2>
              </div>
              <button
                onClick={() => setSelectedRole(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Description */}
              <div>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">{roles[selectedRole].details.description}</p>
              </div>

              {/* CTA */}
              <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <a
                  href="https://docs.google.com/forms/d/e/1FAIpQLSfOHzdrN-UlAWhRcgUtCGdjuK9LG5-0H2UOjMap8sZV5JajMg/viewform?usp=header"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-center"
                >
                  Apply for {roles[selectedRole].title}
                </a>
                <button
                  onClick={() => setSelectedRole(null)}
                  className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
    </div>
  );
};

export default Contribute;
