// No default React import needed with react-jsx transform
import { InstagramLogo, DiscordLogo, GithubLogo } from 'phosphor-react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const scrollTop = () => {
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      window.scrollTo(0, 0);
    }
  };

  return (
    <footer className="bg-gray-200 dark:bg-gray-800 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8 md:gap-12">
          {/* Left section - Logo with Help Us and Legal */}
          <div className="flex flex-col gap-8 min-w-[200px]">
            {/* Logo and Rights */}
            <div className="flex items-start space-x-3">
              <div className="rounded-lg overflow-hidden min-w-[2.5rem] min-h-[2.5rem] w-12 h-12 flex-shrink-0 mt-0.5">
                <img 
                  src="/logo.svg"
                  alt="Learnmates Logo"
                  className="w-full h-full object-contain"
                  style={{ aspectRatio: '1 / 1' }}
                />
              </div>
              <div>
                <span className="text-lg font-bold text-gray-600 dark:text-gray-200">Learnmates</span>
                <p className="text-sm text-gray-600 dark:text-gray-200">© 2026 Learnmates. All rights reserved.</p>
              </div>
            </div>

            {/* Help Us Section */}
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold  uppercase tracking-wider  text-gray-600 dark:text-gray-400 ">Help Us</h3>
              <div className="flex flex-col gap-2 text-sm">
                <Link
                  to="/contribute"
                  className="text-gray-600 dark:text-gray-200 hover:text-blue-400 transition-colors duration-200"
                  onClick={scrollTop}
                >
                  Contribute
                </Link>
                <Link
                  to="/donate"
                  className="text-gray-600 dark:text-gray-200 hover:text-blue-400 transition-colors duration-200"
                  onClick={scrollTop}
                >
                  Donate
                </Link>
              </div>
            </div>

            {/* Legal Section */}
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-gray-400">Legal</h3>
              <div className="flex flex-col gap-2 text-sm">
                <Link
                  to="/privacy"
                  className="text-gray-600 dark:text-gray-200 hover:text-blue-400 transition-colors duration-200"
                  onClick={scrollTop}
                >
                  Privacy Policy
                </Link>
                <Link
                  to="/terms"
                  className="text-gray-600 dark:text-gray-200 hover:text-blue-400 transition-colors duration-200"
                  onClick={scrollTop}
                >
                  Terms of Service
                </Link>
                <Link
                  to="/copyright"
                  className="text-gray-600 dark:text-gray-200 hover:text-blue-400 transition-colors duration-200"
                  onClick={scrollTop}
                >
                  Copyright & Attribution
                </Link>
              </div>
            </div>
          </div>

          {/* Browse Section */}
          <div className="flex flex-col gap-4 min-w-[220px]">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-400 uppercase tracking-wider">Browse</h3>
            <div className="flex flex-col gap-2 text-sm">
              <Link
                to="/"
                className="text-gray-600 dark:text-gray-200 hover:text-blue-400 transition-colors duration-200"
                onClick={scrollTop}
              >
                Home
              </Link>
              <Link
                to="/curriculum"
                className="text-gray-600 dark:text-gray-200 hover:text-blue-400 transition-colors duration-200"
                onClick={scrollTop}
              >
                Curriculum
              </Link>
              <Link
                to="/about"
                className="text-gray-600 dark:text-gray-200 hover:text-blue-400 transition-colors duration-200"
                onClick={scrollTop}
              >
                About
              </Link>
            </div>

            {/* Curriculum Subsection */}
            <div className="flex flex-col gap-2 text-xs">
              <p className="text-gray-900 dark:text-gray-400 font-medium mt-2">Exam Boards:</p>
              <Link
                to="/curriculum/igcse/cambridge"
                className="text-gray-600 dark:text-gray-200 hover:text-blue-400 transition-colors duration-200"
                onClick={scrollTop}
              >
                IGCSE Cambridge
              </Link>
              <Link
                to="/curriculum/igcse/edexcel"
                className="text-gray-600 dark:text-gray-200 hover:text-blue-400 transition-colors duration-200"
                onClick={scrollTop}
              >
                IGCSE Edexcel
              </Link>
              <Link
                to="/curriculum/a-level/cambridge"
                className="text-gray-600 dark:text-gray-200 hover:text-blue-400 transition-colors duration-200"
                onClick={scrollTop}
              >
                A-Level Cambridge
              </Link>
              <Link
                to="/curriculum/a-level/edexcel"
                className="text-gray-600 dark:text-gray-200 hover:text-blue-400 transition-colors duration-200"
                onClick={scrollTop}
              >
                A-Level Edexcel
              </Link>
            </div>
          </div>

          {/* Right section - Follow us and Contact */}
          <div className="flex flex-col gap-6 w-full md:w-auto">
            {/* Follow us */}
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-200 uppercase tracking-wider">Follow us</h3>
              <div className="flex items-center space-x-6">
                <a
                  href="https://www.instagram.com/learnmates_org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-gray-200 hover:text-pink-400 transition-colors duration-200"
                  aria-label="Instagram"
                >
                  <InstagramLogo className="w-6 h-6" />
                </a>
                <a
                  href="https://discord.com/invite/qCQTxTQkRh"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-gray-200 hover:text-blue-400 transition-colors duration-200"
                  aria-label="Discord"
                >
                  <DiscordLogo className="w-6 h-6" />
                </a>
                <a
                  href="https://github.com/anon-haf/Learnmates"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-gray-200 hover:text-gray-300 transition-colors duration-200"
                  aria-label="GitHub"
                >
                  <GithubLogo className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Write to us - Highlighted */}
            <div className="bg-gradient-to-br from-blue-500/10 to-teal-500/10 border border-blue-500/30 rounded-lg p-4">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-200 mb-2">Write to us</p>
              <a
                href="mailto:learnmates.share@gmail.com"
                className="text-blue-400 hover:text-blue-300 transition-colors duration-200 text-sm font-medium break-all"
              >
                learnmates.share@gmail.com
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 mt-8 pt-6">
          <p className="text-xs text-gray-500 text-center">Made with passion for learners worldwide</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
