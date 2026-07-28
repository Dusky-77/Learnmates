import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Copyright: React.FC = () => {
  const sections = [
    {
      title: 'Copyright Notice',
      content: `All content on Learnmates, including but not limited to:
- Original educational materials, quizzes, and study guides
- TopicalQuiz questions and explanations
- Platform design, layout, and user interface
- Code, scripts, and software functionality
- Logos, branding, and visual assets

is the intellectual property of Learnmates and is protected by applicable copyright laws.`
    },
    {
      title: 'Third-Party Content & Attribution',
      content: `Examination Materials:
- Cambridge Assessment International Education owns copyright to Cambridge IGCSE and A-Level exam papers, mark schemes, and syllabuses
- Pearson Edexcel owns copyright to Edexcel IGCSE and A-Level exam papers, mark schemes, and syllabuses
- All official examination materials are used under principles of fair use/fair dealing for educational purposes
- Learnmates does not claim ownership of any official examination board materials
- Links to official resources direct users to examination board websites

Original Content:
- TopicalQuiz questions, explanations, and study guides created by Learnmates are original works protected by copyright
- Curriculum structure and organization is original Learnmates intellectual property
- Platform features (streaks, progress tracking, favorites) are proprietary

Media & Embedded Content:
- YouTube videos embedded via YouTube's embed feature (governed by YouTube Terms of Service)
- Vimeo videos embedded via Vimeo's embed feature (governed by Vimeo Terms of Service)
- External links to Google Drive, Dropbox, OneDrive (governed by respective provider terms)
- Images and icons from phosphor-react and lucide-react libraries (MIT License)`
    },
    {
      title: 'Permitted Use',
      content: `You may:
- Access and use Learnmates for personal, non-commercial educational purposes
- Print or download materials for individual study use
- Share links to Learnmates pages with others
- Use embedded content as permitted by the original platform (YouTube, Vimeo, etc.)

You may NOT:
- Copy, reproduce, or distribute Learnmates original content for commercial purposes
- Create derivative works from Learnmates original content without permission
- Scrape, crawl, or use automated tools to extract content
- Remove copyright notices or proprietary markings
- Use the platform's branding, logos, or name without permission
- Mirror or frame the Learnmates website`
    },
    {
      title: 'Fair Use / Fair Dealing',
      content: `Learnmates' use of third-party examination materials is based on:
- Educational purpose and non-commercial nature
- Transformative use (adding explanations, organization, quizzes)
- Limited portions of original works
- No market substitution for official materials
- Attribution to original examination boards

Users should consult official examination board resources as primary sources. Learnmates is supplementary educational material only.`
    },
    {
      title: 'Digital Millennium Copyright Act (DMCA)',
      content: `If you believe your copyrighted work has been used in a way that constitutes infringement, please provide our designated agent with:

1. Identification of the copyrighted work claimed to be infringed
2. Identification of the infringing material and its location on Learnmates
3. Your contact information (name, address, phone, email)
4. A statement of good faith belief that use is not authorized
5. A statement of accuracy under penalty of perjury
6. Your physical or electronic signature

DMCA Agent:
Email: learnmates.share@gmail.com
Subject: DMCA Notice

We will respond to valid DMCA notices promptly and may remove or disable access to allegedly infringing material.`
    },
    {
      title: 'Open Source & Third-Party Licenses',
      content: `Learnmates uses the following open-source libraries and acknowledges their licenses:

- React (MIT License)
- React Router (MIT License)
- Framer Motion (MIT License)
- Supabase JS Client (MIT License)
- phosphor-react (MIT License)
- lucide-react (ISC License)
- Tailwind CSS (MIT License)
- Vite (MIT License)
- TypeScript (Apache 2.0)
- ESLint (MIT License)
- Prettier (MIT License)
- date-fns (MIT License)
- clsx (MIT License)
- class-variance-authority (MIT License)
- @radix-ui/react-slot (MIT License)
- @vercel/blob (MIT License)
- @formspree/react (MIT License)
- @icon-park/svg (Apache 2.0)

Full license texts available in the project repository.`
    },
    {
      title: 'User-Generated Content',
      content: `Users retain ownership of content they submit through:
- Contact forms
- Feedback submissions
- Contribution forms

By submitting content, you grant Learnmates a non-exclusive, worldwide, royalty-free license to use, display, and distribute the content for platform operations and improvement. You represent that you have the right to grant this license.`
    },
    {
      title: 'Enforcement',
      content: `Learnmates reserves the right to:
- Monitor for copyright violations
- Remove or disable access to infringing content
- Suspend or terminate accounts violating copyright
- Pursue legal remedies for willful infringement

Repeat infringers may have their access permanently terminated under DMCA repeat infringer policy.`
    },
    {
      title: 'Contact',
      content: `For copyright questions, licensing inquiries, or DMCA notices:

Email: learnmates.share@gmail.com
Subject: Copyright / Licensing / DMCA

We aim to respond to all inquiries within a reasonable timeframe.`
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-br from-amber-600 via-amber-700 to-amber-800 dark:from-amber-900 dark:via-amber-800 dark:to-gray-900"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400 rounded-full opacity-10 blur-3xl -translate-y-1/2 -translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500 rounded-full opacity-5 blur-3xl translate-y-1/2 translate-x-1/2"></div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl font-bold text-white mb-6"
          >
            Copyright & Attribution
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-amber-100 text-lg leading-relaxed max-w-2xl"
          >
            Intellectual property rights, third-party attributions, and usage permissions for Learnmates content.
          </motion.p>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-amber-200 text-sm mt-4"
          >
            Last updated: January 2026
          </motion.p>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-8"
        >
          {sections.map((section, idx) => (
            <motion.section
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + idx * 0.05 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-8 sm:p-10 border border-amber-200 dark:border-gray-700 shadow-md hover:shadow-lg transition-shadow"
            >
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                {section.title}
              </h2>
              <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 text-base leading-relaxed space-y-4">
                {section.content.split('\n\n').map((paragraph, pIdx) => {
                  if (!paragraph.trim()) return null;

                  return (
                    <div key={pIdx} className="space-y-2">
                      {paragraph.split('\n').map((line, lineIdx) => {
                        if (!line.trim()) return null;

                        if (line.trim().endsWith(':') && !line.includes('-')) {
                          return (
                            <p key={lineIdx} className="font-semibold text-gray-900 dark:text-white text-lg mt-4 mb-2">
                              {line}
                            </p>
                          );
                        }

                        if (line.trim().startsWith('-')) {
                          return (
                            <div key={lineIdx} className="flex gap-3 items-start">
                              <span className="text-amber-600 dark:text-amber-400 font-bold flex-shrink-0 mt-0.5">
                                •
                              </span>
                              <span>{line.trim().slice(1).trim()}</span>
                            </div>
                          );
                        }

                        return (
                          <p key={lineIdx}>
                            {line}
                          </p>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </motion.section>
          ))}
        </motion.div>
      </div>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
      >
        <div className="relative overflow-hidden bg-gradient-to-br from-amber-600 to-amber-700 dark:from-amber-800 dark:to-amber-900 rounded-2xl shadow-2xl p-8 sm:p-12 text-center">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400 rounded-full opacity-10 blur-3xl -translate-y-1/2 -translate-x-1/2"></div>
          <div className="relative">
            <h2 className="text-3xl font-bold text-white mb-4">
              Questions About Copyright or Licensing?
            </h2>
            <p className="text-amber-100 mb-8 max-w-xl mx-auto text-lg">
              We're happy to clarify usage rights, attribution requirements, or licensing inquiries.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:learnmates.share@gmail.com?subject=Copyright%20Inquiry"
                className="inline-flex items-center justify-center px-8 py-3 bg-white text-amber-600 font-semibold rounded-lg hover:bg-amber-50 transition-all"
              >
                Email Us
              </a>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center px-8 py-3 bg-amber-500 hover:bg-amber-400 text-white font-semibold rounded-lg transition-all"
              >
                Contact Form
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Acknowledgment */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center"
      >
        <p className="text-gray-600 dark:text-gray-400">
          &copy; 2026 Learnmates. All rights reserved. Educational use permitted under fair use principles.
        </p>
      </motion.div>
    </div>
  );
};

export default Copyright;