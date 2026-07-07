import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const PrivacyPolicy: React.FC = () => {
  const sections = [
    {
      title: 'Privacy Overview',
      content: `At Learnmates, we are committed to protecting your privacy and ensuring you have a positive experience on our platform. This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website and use our educational resources.

Your privacy is important to us, and we strive to be transparent about our data practices. We comply with applicable privacy regulations and best practices in data protection.`,
    },
    {
      title: 'What Information We Collect',
      content: `We collect minimal information and are committed to user privacy. Here's what we do collect:

Information You Provide Directly:
- Your name (optional, stored locally in your browser for personalization)
- Contact information you submit through our contact form
- Feedback or inquiries you send to us

Information NOT Collected:
- We do NOT require email addresses to use the platform
- We do NOT have user accounts or login systems
- We do NOT collect personally identifiable information automatically
- We do NOT require registration to access educational content

Information Stored Locally:
- Your name preference (stored in your browser)
- Your learning progress and completed resources
- Your theme preference - dark/light mode
- Resources you've marked as done
- These are stored ONLY in your browser and NOT sent to our servers`,
    },
    {
      title: 'How We Use Your Information',
      content: `Your information is used for the following purposes:

Personalizing Your Experience:
- Personalizing your learning experience with your preferred name
- Tracking YOUR learning progress (stored only on your device)
- Remembering resources you mark as complete
- Displaying recent courses you've viewed

Contact Form Data:
- Your name and email are sent to Formspree to handle your inquiry
- We use responses only to help you with your questions
- Improving our platform based on your feedback

Platform Operations:
- Maintaining website functionality and security
- Debugging and error resolution
- Analyzing usage patterns to improve user experience
- Preventing fraud and abuse

What We Do NOT Do:
- We do NOT sell your personal information to third parties
- We do NOT use your information for targeted advertising
- We do NOT share your local data with external services
- We do NOT send emails unless you contact us first`,
    },
    {
      title: 'Data Security',
      content: `We implement industry-standard security measures to protect your information:

Technical Safeguards:
- HTTPS encryption for all data in transit
- Secure password storage with industry-standard hashing
- Regular security audits and vulnerability assessments
- Firewall protection and DDoS mitigation
- Secure hosting on reputable cloud providers

Administrative Safeguards:
- Employee privacy training
- Non-disclosure agreements
- Access control and authentication
- Incident response procedures
- Regular backup and disaster recovery

What We Cannot Guarantee:
No security system is completely impenetrable. While we take reasonable precautions, we cannot guarantee absolute security. Users should use strong passwords and keep devices updated.`,
    },
    {
      title: 'Children\'s Privacy',
      content: `Learnmates is designed for educational use by students of all ages. Our privacy practices are particularly child-friendly:

Why We're Safe for Children:
- No user accounts or logins required
- No email addresses collected to use the platform
- No personal information stored on servers
- All data stored locally on the child's device only
- No marketing or advertising targeting
- No data sharing with third parties
- Parents/guardians have full visibility and control

For Parents:
You can monitor learning progress, clear stored data, teach your child to manage their data, disable cookies in browser settings, and use parental controls on their device.`,
    },
    {
      title: 'Third-Party Services & Data Sharing',
      content: `Third-Party Services We Use:
- Formspree: Processes contact form submissions containing name and email
- YouTube: Embedded videos for educational content
- Google Drive, Dropbox, OneDrive: Links to supplementary materials
- Google Forms: Surveys and feedback collection
- Vimeo: Video hosting for educational content

How Your Data is Shared:
- Contact form data is sent to Formspree to handle your inquiry
- Only contact information is shared when you voluntarily submit the form
- Other services are accessed through embedded links or iframes
- No personal data is automatically shared with these services

Third-Party Privacy Policies:
- Each third-party service has its own privacy policy and terms
- You should review their privacy practices before using their services
- Learnmates is not responsible for third-party data handling practices
- We recommend understanding what data you share when accessing external services

Data Control:
- You control whether you submit your information through contact forms
- You can choose not to use links to third-party services
- You can manage your privacy settings on third-party platforms directly`,
    },
    {
      title: 'Data Retention',
      content: `How Long We Keep Your Data:

Local Browser Data:
- Your name preference is stored indefinitely until you clear browser data
- Learning progress and completed resources remain until you clear local storage
- Theme preference persists until changed or cleared
- You can delete this data anytime by clearing your browser's local storage

Contact Form Data:
- Information submitted through contact forms is sent to Formspree
- Formspree retains submission data according to their privacy policy
- You can request deletion of your contact data by emailing us

Server-Side Data:
- We do not store any server-side user data
- No accounts or login information is retained
- Analytics data (if any) is aggregated and anonymized

Your Control:
- You have full control over deleting your local data
- You can request deletion of contact form submissions
- Clear cookies and local storage in your browser settings anytime`,
    },
    {
      title: 'Cookies & Local Storage',
      content: `What We Use:

Local Storage:
- Browser local storage stores your preferences and learning data
- This is NOT tracked or monitored by our servers
- Data remains only on your device
- Essential for remembering your progress and preferences

Cookies:
- We use minimal cookies, primarily for basic functionality
- Session cookies may be used for site navigation
- No tracking or advertising cookies
- You can disable cookies in your browser settings

How to Manage:
- Access local storage settings in your browser's developer tools
- Clear cookies anytime through browser settings
- Most browsers allow you to set privacy levels for local storage
- Disabling storage may affect functionality (progress tracking, preferences)

No Third-Party Tracking:
- We do not use cookies to track your behavior
- We do not use cookies for advertising or analytics
- Your browsing activity is private to your device`,
    },
    {
      title: 'Contact Us',
      content: `If you have questions or concerns about this Privacy Policy, please reach out to us.

Contact Methods:
- Email: learnmates.share@gmail.com
- Use our contact form on the website
- Send us your inquiry with details about your concern

Your Rights:
You have the right to request what personal information we have collected, request deletion of your data, understand our data practices, and ask questions about this policy.`,
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
            Last updated: January 16, 2026
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
              <a
                href="mailto:learnmates.share@gmail.com"
                className="inline-flex items-center justify-center px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-all"
              >
                Email Us
              </a>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center px-8 py-3 bg-blue-500 hover:bg-blue-400 text-white font-semibold rounded-lg transition-all"
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

export default PrivacyPolicy;
