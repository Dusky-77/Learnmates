import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import DiscordPopup from './components/DiscordPopup';
import Home from './pages/Home';
import About from './pages/About';
import Contribute from './pages/Contribute';
import Donate from './pages/Donate';
import ContactUs from './pages/ContactUs';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import Curriculum from './pages/Curriculum';
import CurriculumPage from './pages/CurriculumPage';
import TopicPage from './pages/TopicPage';
import CurriculumPdfViewerPage from './pages/CurriculumPdfViewerPage';
import TopicalPages from './pages/TopicalPages';
import { UserProvider } from './context/UserContext';
import { DarkModeProvider } from './context/DarkModeContext';

function AppContent() {
  const location = useLocation();

  return (
    <>
      <ScrollToTop />
      <DiscordPopup />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex flex-col text-gray-900 dark:text-gray-100 transition-colors duration-200">
        <Header />
        
        <main className="flex-grow" key={location.key}>
          <Routes key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contribute" element={<Contribute />} />
            <Route path="/donate" element={<Donate />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/curriculum" element={<Curriculum />} />
            <Route path="/curriculum/:type" element={<CurriculumPage />} />
            <Route path="/curriculum/:type/:board" element={<CurriculumPage />} />
            <Route path="/curriculum/:type/:board/:subject" element={<CurriculumPage />} />
            <Route path="/curriculum/:type/:board/:subject/:title/:pdfFile" element={<CurriculumPdfViewerPage />} />
            <Route path="/curriculum/:type/:board/:subject/:title" element={<TopicPage />} />
            <Route path="/topicals" element={<TopicalPages />} />
            <Route path="/topicals/:level/:board/:subject" element={<TopicalPages />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </>
  );
}

function App() {
  return (
    <DarkModeProvider>
      <UserProvider>
        <Router>
          <AppContent />
        </Router>
      </UserProvider>
    </DarkModeProvider>
  );
}

export default App;
