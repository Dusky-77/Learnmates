import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui';

const PrivacyPolicy: React.FC = () => {
  const sections = [
    {
      title: 'Privacy Overview',
      content: `At Learnmates, we are committed to protecting your privacy and ensuring you have a positive experience on our platform. This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website and use our educational resources.

Your privacy is important to us, and we strive to be transparent about our data practices. We comply with applicable privacy regulations and best practices in data protection.`
    },
    {
      title: 'What Information We Collect',
      content: `We collect minimal information and are committed to user privacy. Here's what we collect:

Account Information (when you create an account):
- Email address (via Google OAuth or email/password signup)
- Name (from Google profile or entered during signup)
- Username (optional, chosen by you)
- Profile picture (from Google OAuth)

Learning Data (stored in Supabase database):
- Topic progress percentages
- Completed resources (videos, quizzes, etc.)
- Daily visit dates for streak tracking
- Last 3 opened topics for "continue where you left off"
- Favorite subjects, boards, and levels

Local Browser Storage (not sent to our servers):
- Theme preference (dark/light mode)
- Temporary UI state

Contact Form Data:
- Name and email you provide via contact form (sent to Formspree)

Information We Do NOT Collect:
- Passwords (handled securely by Supabase Auth)
- Payment information (no payments on platform)
- Precise location data
- Browsing history beyond the 3 recent topics
- Data for advertising or tracking purposes`
    },
    {
      title: 'How We Use Your Information',
      content: `Your information is used for the following purposes:

Account & Personalization:
- Creating and managing your account
- Personalizing your experience with your name and preferences
- Enabling Google OAuth sign-in
- Syncing progress across devices

Learning Features:
- Tracking YOUR learning progress (stored in Supabase)
- Displaying streak count and calendar
- Showing "continue where you left off" topics (last 3)
- Remembering favorite subjects and progress

Contact Form:
- Your name and email sent to Formspree to handle your inquiry
- Used only to respond to your questions

Platform Operations:
- Maintaining website functionality and security
- Debugging and error resolution
- Analyzing aggregated usage patterns to improve experience
- Preventing fraud and abuse

What We Do NOT Do:
- We do NOT sell your personal information to third parties
- We do NOT use your information for targeted advertising
- We do NOT share your learning data with external services, except for anonymous usage analytics via Google Analytics
- We do NOT send marketing emails unless you contact us first`
    },
    {
      title: 'Data Security',
      content: `We implement industry-standard security measures to protect your information:

Technical Safeguards:
- HTTPS encryption for all data in transit
- Secure authentication via Supabase Auth (industry-standard)
- Row Level Security (RLS) on all database tables
- Regular security audits and vulnerability assessments
- Secure hosting on reputable cloud providers (Vercel, Supabase)

Administrative Safeguards:
- Employee privacy training
- Non-disclosure agreements
- Access control and authentication
- Incident response procedures
- Regular backup and disaster recovery

What We Cannot Guarantee:
No security system is completely impenetrable. While we take reasonable precautions, we cannot guarantee absolute security. Users should use strong passwords, enable 2FA if available, and keep devices updated.`
    },
    {
      title: 'Children\'s Privacy',
      content: `Learnmates is designed for educational use by students of all ages. Our privacy practices:

For Users Under 13:
- Account creation requires parental consent (handled by Google/Supabase)
- We do not knowingly collect data from children under 13 without parental consent
- Parents can request account deletion at any time

Safety Features:
- No public profiles or social features
- No chat or messaging between users
- No advertising or tracking
- All learning data is private to the account

For Parents:
You can monitor learning progress, request account deletion, and manage data through account settings.`
    },
    {
      title: 'Third-Party Services & Data Sharing',
      content: `Third-Party Services We Use:

Authentication & Database:
- Supabase: Authentication (email/password, Google OAuth), database, storage
  - We receive: email, name, profile picture from Google
  - Supabase Privacy Policy: https://supabase.com/privacy

Contact Forms:
- Formspree: Processes contact form submissions
  - Data sent: name, email, message content
  - Formspree Privacy Policy: https://formspree.io/privacy/

Embedded Educational Content:
- YouTube: Embedded videos (governed by YouTube Terms of Service)
- Vimeo: Embedded videos (governed by Vimeo Terms of Service)
- Google Drive/Dropbox/OneDrive: Links to supplementary materials

How Your Data is Shared:
- Account data stored in Supabase (our backend provider)
- Contact form data sent to Formspree
- No learning data shared with YouTube, Vimeo, or file hosts
- Embedded content loads from their domains (their cookies/policies apply)

Third-Party Privacy Policies:
- Each third-party service has its own privacy policy and terms
- You should review their privacy practices before using their services
- Learnmates is not responsible for third-party data handling practices

Data Control:
- You control whether you submit information through contact forms
- You can choose not to use links to third-party services
- You can manage your privacy settings on third-party platforms directly`
    },
    {
      title: 'Data Retention',
      content: `How Long We Keep Your Data:

Account Data (Supabase):
- Retained while account is active
- Deleted within 30 days of account deletion request
- Anonymized analytics may be retained

Learning Progress (Supabase):
- Retained while account is active
- Deleted with account deletion
- You can delete individual progress anytime

Streak Data (Supabase):
- Daily visit dates retained for streak calculation
- Deleted with account deletion

Recent Topics (Supabase):
- Last 3 topics retained for "continue where you left off"
- Automatically rotated as you open new topics

Local Browser Data:
- Theme preference persists until changed or cleared
- You can delete anytime by clearing browser storage

Contact Form Data:
- Sent to Formspree, retained per their policy
- You can request deletion by emailing us

Your Control:
- Delete account anytime in settings (deletes all Supabase data)
- Clear local browser data anytime
- Request data export by emailing us`
    },
    {
      title: 'Cookies & Local Storage',
      content: `What We Use:

Local Storage (browser):
- Theme preference (dark/light mode)
- Temporary UI state
- NOT tracked or monitored by our servers
- Data remains only on your device

Cookies:
- Supabase Auth session cookies (secure, httpOnly, sameSite)
- Google Analytics cookies for aggregated, anonymous usage tracking
- No third-party marketing or advertising cookies

How to Manage:
- Clear cookies anytime through browser settings
- Clear local storage in browser developer tools
- Disabling cookies will prevent authentication from working
- Disabling local storage may affect theme persistence
- You can opt out of Google Analytics via browser extensions

Analytics & Tracking:
- We use Google Analytics to understand how users interact with our platform to improve our services
- We do not use cookies for targeted advertising
- Your personal learning data is not shared with Google Analytics`
    },
    {
      title: 'International Data Transfers',
      content: `Our services are hosted on:
- Vercel (US/EU edge network)
- Supabase (US/EU regions, configurable)

Data may be processed in the United States or European Union depending on hosting region. Both providers offer Standard Contractual Clauses and adequacy decisions for international transfers.`
    },
    {
      title: 'Your Rights',
      content: `Depending on your jurisdiction, you may have the right to:

Access & Portability:
- Request a copy of your personal data
- Request data export in portable format

Rectification:
- Update your name, username, email in account settings

Deletion:
- Delete your account anytime (Settings → Delete Account)
- Request deletion of contact form submissions

Objection & Restriction:
- Object to processing (though this may disable features)
- Restrict certain processing activities

Withdraw Consent:
- Disconnect Google OAuth in account settings
- Delete account to withdraw all consent

To exercise these rights, email: learnmates.share@gmail.com
We respond within 30 days as required by applicable law.`
    },
    {
      title: 'Contact Us',
      content: `If you have questions or concerns about this Privacy Policy, please reach out to us.

Contact Methods:
- Email: learnmates.share@gmail.com
- Use our contact form on the website
- Send us your inquiry with details about your concern

Your Rights:
You have the right to request what personal information we have collected, request deletion of your data, understand our data practices, and ask questions about this policy.`
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 dark:from-blue-900 dark:via-blue-800 dark:to-gray-900"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400 rounded-full opacity-10 blur-3xl -translate-y-1/2 -translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500 rounded-full opacity-5 blur-3xl translate-y-1/2 translate-x-1/2"></div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl font-bold text-white mb-6"
          >
            Privacy Policy
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-blue-100 text-lg leading-relaxed max-w-2xl"
          >
            We're committed to protecting your privacy. This policy explains how we collect, use, and safeguard your information.
          </motion.p>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-blue-200 text-sm mt-4"
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
              className="bg-white dark:bg-gray-800 rounded-2xl p-8 sm:p-10 border border-blue-200 dark:border-gray-700 shadow-md hover:shadow-lg transition-shadow"
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
                              <span className="text-blue-600 dark:text-blue-400 font-bold flex-shrink-0 mt-0.5">
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
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-800 dark:to-blue-900 rounded-2xl shadow-2xl p-8 sm:p-12 text-center">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400 rounded-full opacity-10 blur-3xl -translate-y-1/2 -translate-x-1/2"></div>
          <div className="relative">
            <h2 className="text-3xl font-bold text-white mb-4">
              Questions About Your Privacy?
            </h2>
            <p className="text-blue-100 mb-8 max-w-xl mx-auto text-lg">
              We're committed to protecting your data and answering any questions you may have.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="secondary" asChild>
                <a href="mailto:learnmates.share@gmail.com">Email Us</a>
              </Button>
              <Button asChild>
                <Link to="/contact">Contact Form</Link>
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PrivacyPolicy;