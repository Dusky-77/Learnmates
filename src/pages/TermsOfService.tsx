import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const TermsOfService: React.FC = () => {
  const sections = [
    {
      title: 'Educational Purpose & Use',
      content: `Learnmates is a learning platform designed to support students in their academic journey by providing quizzes, study materials, and educational resources. All content is provided exclusively for personal, non-commercial educational use. Users commit to using the platform responsibly and in accordance with their educational institution's policies and local regulations.`
    },
    {
      title: 'Intellectual Property & Attribution',
      content: `Examination Materials:
- Cambridge Assessment owns copyright to exam papers and mark schemes
- Edexcel and other official examination bodies own their materials
- Learnmates does not claim ownership of official examination materials
- All such content is used under principles of fair use for educational purposes

Original Content:
- Original content created by Learnmates is protected by copyright
- TopicalQuiz questions, explanations, and study guides are owned by Learnmates
- Content is provided "as-is" and not endorsed by examination boards
- All materials are used under fair use principles`
    },
    {
      title: 'Disclaimer of Accuracy & Liability',
      content: `Content Accuracy:
- While we strive to provide accurate content, no guarantees are made
- Official examination boards bear no responsibility for our content
- Content should not be considered as official guidance

Official Resources:
- Consult official examination syllabuses and past papers
- Review official mark schemes directly from examination boards
- Follow guidance from your educational institution

Academic Outcomes:
- Learnmates is not liable for academic outcomes or grades
- Use of the platform is at your own risk
- No guarantees regarding examination results`
    },
    {
      title: 'Acceptable Use Policy',
      content: `Prohibited Activities:
- Copying, downloading, or exporting content for commercial resale
- Using automated tools, bots, or scrapers to collect data
- Redistributing or republishing Learnmates content without permission
- Using the platform for non-educational purposes
- Attempting to reverse-engineer or gain unauthorized access
- Harassing, threatening, or abusing other users or staff
- Circumventing access controls or security measures
- Violating any applicable laws or regulations

Consequences:
- Violations may result in immediate suspension or termination of access`
    },
    {
      title: 'Limitation of Liability',
      content: `No Liability for Damages:
- Learnmates is not liable for direct, indirect, or consequential damages
- We are not liable for incidental or punitive damages

Specific Exclusions:
- Academic performance issues or examination results
- Lost opportunities or career outcomes
- Grades or marks received
- Any other outcome from platform use

Use at Your Own Risk:
- Your use of the platform is entirely at your own risk
- No warranties are provided regarding availability or fitness`
    },
    {
      title: 'Termination of Access',
      content: `Right to Suspend Access:
- We reserve the right to suspend or terminate access for:
  - Violations of these Terms of Service
  - Misuse of the platform
  - Unlawful activity
  - Intellectual property violations
  - Security risks

Effect of Termination:
- Upon termination, all rights to use the platform cease immediately
- You must cease using the platform
- You may not attempt to regain access`
    },
    {
      title: 'Privacy & Data Storage',
      content: `Your use of Learnmates is governed by our Privacy Policy.

Data We Store (with your consent via account creation):
- Account information: email, name, username (stored in Supabase Auth)
- Learning progress: topic completion percentages (stored in Supabase database)
- Streak data: daily visit dates for streak tracking (stored in Supabase database)
- Recent topics: last 3 opened topics for "continue where you left off" (stored in Supabase database)
- Favorite subjects: your selected subjects and boards (stored in Supabase database)
- Theme preference: dark/light mode (stored locally in browser)

Authentication:
- Google OAuth via Supabase Auth (we receive email, name, profile picture)
- Email/password authentication via Supabase Auth

What We Do NOT Store:
- Passwords (handled by Supabase Auth)
- Payment information (no payments on platform)
- Precise location data
- Browsing history beyond the 3 recent topics

Data Retention:
- Account data retained while account is active
- Deleted upon account deletion request
- Anonymous analytics (e.g., via Google Analytics) may be retained

For complete details, please refer to our full Privacy Policy.`
    },
    {
      title: 'No Warranties',
      content: `Platform Provided As-Is:
- Learnmates is provided "as-is" without any warranties
- We make no guarantees about content accuracy or completeness
- We do not warrant that the platform will be error-free or uninterrupted

Specific Disclaimers:
- No warranty that content meets your specific educational needs
- No warranty that examination materials are complete or current
- No warranty that all content is aligned with current syllabuses
- No warranty regarding third-party content or services

Your Responsibility:
- You are responsible for verifying content accuracy
- Educational outcomes depend on your effort and circumstances
- Always consult official examination resources as primary sources
- Learnmates is supplementary educational material only

To the Fullest Extent Permitted:
- We disclaim all other warranties, expressed or implied
- Including merchantability and fitness for a particular purpose`
    },
    {
      title: 'Indemnification',
      content: `User Indemnification:
- You agree to defend and indemnify Learnmates from any claims
- This includes claims arising from your use of the platform
- Claims arising from violation of these terms
- Claims arising from intellectual property infringement
- Claims from content or information you provide or use

What This Covers:
- Legal fees and court costs
- Damages awarded in litigation
- Settlement amounts
- Any losses resulting from claims against Learnmates

Exceptions:
- This does not apply if the claim arises solely from Learnmates' negligence or misconduct
- You are not responsible for claims from third-party services' conduct
- Cooperation with defense is required

Your Obligation:
- Promptly notify Learnmates of any claim
- Grant Learnmates control of defense and settlement
- Provide reasonable cooperation in defense`
    },
    {
      title: 'Governing Law & Jurisdiction',
      content: `Applicable Law:
- These Terms of Service are governed by applicable international law
- Disputes shall be resolved through good faith negotiation
- You agree to comply with all applicable local, state, and international laws

Jurisdiction:
- The terms and conditions are interpreted under fair use principles
- In case of disputes, both parties agree to attempt resolution through discussion
- Any legal proceedings shall be conducted fairly and transparently

Severability:
- If any provision is found to be invalid or unenforceable, the remaining provisions continue in effect
- The courts may modify terms only if absolutely necessary for enforceability

Whole Agreement:
- These Terms of Service constitute the entire agreement between you and Learnmates
- Any previous agreements or understandings are superseded
- Any amendments must be made in writing and agreed upon by both parties`
    },
    {
      title: 'Changes to Terms',
      content: `Updates to Terms:
- Learnmates may update these Terms at any time without prior notice
- Your continued use constitutes acceptance of revised terms

How to Stay Informed:
- Review this page periodically for updates
- Check the Last Updated date to see when changes were made
- We recommend revisiting these terms regularly

Notification:
- For significant changes, we will attempt to notify users
- Continued use indicates acceptance of updated terms`
    },
    {
      title: 'Contact Us',
      content: `Questions About Terms:
- If you have questions or concerns, please reach out

Contact Methods:
- Email: learnmates.share@gmail.com
- Use our contact form on the website
- Send us your inquiry with details about your concern

Response Time:
- We strive to respond to all inquiries within a reasonable timeframe

Feedback:
- We welcome your feedback and suggestions for improving our terms`
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-800 dark:from-indigo-900 dark:via-indigo-800 dark:to-gray-900"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-400 rounded-full opacity-10 blur-3xl -translate-y-1/2 -translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500 rounded-full opacity-5 blur-3xl translate-y-1/2 translate-x-1/2"></div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl font-bold text-white mb-6"
          >
            Terms of Service
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-indigo-100 text-lg leading-relaxed max-w-2xl"
          >
            Please read these terms carefully. Your use of Learnmates constitutes acceptance of these terms.
          </motion.p>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-indigo-200 text-sm mt-4"
          >
            Last updated: January 2026
          </motion.p>
        </div>
      </motion.div>

      {/* Introduction Box */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 border border-indigo-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Agreement to Terms
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            By accessing and using Learnmates, you agree to be bound by these Terms of Service. If you do not agree, please do not use our platform.
          </p>
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
              className="bg-white dark:bg-gray-800 rounded-2xl p-8 sm:p-10 border border-indigo-200 dark:border-gray-700 shadow-md hover:shadow-lg transition-shadow"
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
                              <span className="text-indigo-600 dark:text-indigo-400 font-bold flex-shrink-0 mt-0.5">
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
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-indigo-700 dark:from-indigo-800 dark:to-indigo-900 rounded-2xl shadow-2xl p-8 sm:p-12 text-center">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-400 rounded-full opacity-10 blur-3xl -translate-y-1/2 -translate-x-1/2"></div>
          <div className="relative">
            <h2 className="text-3xl font-bold text-white mb-4">
              Questions About These Terms?
            </h2>
            <p className="text-indigo-100 mb-8 max-w-xl mx-auto text-lg">
              We're here to help clarify any questions you may have about our terms of service.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:learnmates.share@gmail.com"
                className="inline-flex items-center justify-center px-8 py-3 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-indigo-50 transition-all"
              >
                Email Us
              </a>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center px-8 py-3 bg-indigo-500 hover:bg-indigo-400 text-white font-semibold rounded-lg transition-all"
              >
                Contact Form
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TermsOfService;