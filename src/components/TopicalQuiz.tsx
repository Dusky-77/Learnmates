import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Flag, Trophy, FileText, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import MediaViewer from './MediaViewer';
import { deriveMarkSchemeUrl } from '../utils/quizLoader';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { resolveFromR2 } from '../utils/r2Utils';

export interface Question {
  id: string;
  questionContent?: string;
  questionContentType?: 'image' | 'pdf';
  markScheme?: string;
  markSchemeType?: 'image' | 'pdf';
  title?: string;
  downloadOnly?: boolean; // If true, show download buttons instead of viewer
  topicMatches?: string[]; // Topics that match this question
  unit?: string; // Unit this question belongs to
  mcqAnswer?: string; // Optional answer for Cambridge IGCSE MCQ practice papers
}

interface SingleQuizProps {
  questions: Question[];
  title: string;
  quizId?: string;
  showUnitTags?: boolean; // Show unit tags for each question when true
  isLoading?: boolean; // Indicates if more questions are still loading
}

interface MultiQuiz {
  id: string;
  title: string;
  questions: Question[];
  folderPath?: string; // Optional: path to folder for lazy loading
  loadQuiz?: (folderPath: string) => Promise<Question[]>; // Optional: callback to load questions
  isLoading?: boolean; // Indicates if more questions are still loading
  questionCount?: number; // Quick count of questions (loaded without loading all questions)
}

interface QuizMenuProps {
  quizzes: MultiQuiz[];
}

type QuizComponentProps = SingleQuizProps | QuizMenuProps;

const TopicalQuiz: React.FC<QuizComponentProps> = (props) => {
  const isQuizMenu = 'quizzes' in props;
  const singleQuizQuestions = (props as SingleQuizProps).questions;
  const singleQuizTitle = (props as SingleQuizProps).title;
  const singleQuizId = (props as SingleQuizProps).quizId;
  const questions = useMemo(() => (isQuizMenu ? [] : singleQuizQuestions), [isQuizMenu, singleQuizQuestions]);
  const title = useMemo(() => (isQuizMenu ? '' : singleQuizTitle), [isQuizMenu, singleQuizTitle]);
  const quizId = useMemo(() => (isQuizMenu ? undefined : singleQuizId), [isQuizMenu, singleQuizId]);

  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const [loadingQuizzes, setLoadingQuizzes] = useState<Map<string, boolean>>(new Map());
  const [loadedQuizzes, setLoadedQuizzes] = useState<Map<string, Question[]>>(new Map());
  const [isLoadingMore, setIsLoadingMore] = useState<Map<string, boolean>>(new Map());
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showMarkScheme, setShowMarkScheme] = useState(false);
  const [annotations, setAnnotations] = useState<Map<string, string>>(new Map());
  const [mcqSelections, setMcqSelections] = useState<Record<number, string>>({});
  const [selectedMcqOption, setSelectedMcqOption] = useState<string | null>(null);
  const [liveMcqCheckEnabled, setLiveMcqCheckEnabled] = useState(true);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [annotationMode, setAnnotationMode] = useState(false);

  // helper: fetch with a short timeout (local files shouldn't take long)
  const fetchWithTimeout = (url: string, timeout = 3000): Promise<Response> => {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('timeout')), timeout);
      fetch(url)
        .then(res => {
          clearTimeout(timer);
          resolve(res);
        })
        .catch(err => {
          clearTimeout(timer);
          reject(err);
        });
    });
  };

  const resolveAssetUrl = async (url: string): Promise<string> => {
    if (!url) return url;
    if (url.startsWith('blob:')) return url;

    const resolvedUrl = await resolveFromR2(url);
    return resolvedUrl || url;
  };

  // Shared download functions
  const handleDownload = async (url: string, filename: string) => {
    try {
      const resolvedUrl = await resolveAssetUrl(url);

      // Convert relative URL to absolute if needed
      const absoluteUrl = resolvedUrl.startsWith('http') || resolvedUrl.startsWith('blob:')
        ? resolvedUrl
        : new URL(resolvedUrl, window.location.origin).href;

      // Attempt to fetch from the original URL
      let response: Response | null = null;

      try {
        response = await fetch(absoluteUrl);
      } catch (error) {
        console.log(`[TopicalQuiz] Fetch failed for local file: ${(error as Error).message}`);
      }
      
      if (!response || !response.ok) {
        throw new Error(`Failed to download: ${response?.statusText || 'Network error'}`);
      }
      
      const blob = await response.blob();
      
      // Create a temporary link and trigger download
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error downloading file:', error);
      // Fallback: open in new tab
      const absoluteUrl = url.startsWith('http') || url.startsWith('blob:')
        ? url
        : new URL(url, window.location.origin).href;
      window.open(absoluteUrl, '_blank');
    }
  };

  const getFilenameFromUrl = (url: string, defaultName: string): string => {
    try {
      const urlPath = url.split('/').pop() || defaultName;
      // Remove query parameters if any
      let filename = urlPath.split('?')[0];
      // Decode URL-encoded characters (e.g., %20 → space, %26 → &, %2C → ,)
      filename = decodeURIComponent(filename);
      return filename;
    } catch {
      return defaultName;
    }
  };

  // Create a separator page with question number
  const createSeparatorPage = async (pdf: PDFDocument, questionNumber: number, type: 'questions' | 'markschemes'): Promise<void> => {
    const page = pdf.addPage([612, 792]); // US Letter size
    const { width, height } = page.getSize();
    
    // Draw background
    page.drawRectangle({
      x: 0,
      y: 0,
      width: width,
      height: height,
      color: rgb(0.95, 0.95, 0.95), // Light gray background
    });
    
    // Draw border
    page.drawRectangle({
      x: 50,
      y: 50,
      width: width - 100,
      height: height - 100,
      borderColor: rgb(0.2, 0.2, 0.2),
      borderWidth: 3,
    });
    
    // Draw question number text (large and centered)
    const fontSize = 72;
    const text = `${type === 'questions' ? 'Question' : 'Mark Scheme'} ${questionNumber}`;
    
    // Embed font
    const font = await pdf.embedFont(StandardFonts.HelveticaBold);
    const textWidth = font.widthOfTextAtSize(text, fontSize);
    const textHeight = fontSize;
    
    page.drawText(text, {
      x: (width - textWidth) / 2,
      y: height / 2 + textHeight / 2,
      size: fontSize,
      color: rgb(0, 0, 0),
      font: font,
    });
  };

  // Convert image to PDF page
  const addImageToPdf = async (
    pdf: PDFDocument,
    imageUrl: string,
    questionNumber: number
  ): Promise<void> => {
    try {
      const resolvedUrl = await resolveAssetUrl(imageUrl);
      const absoluteUrl = resolvedUrl.startsWith('http') || resolvedUrl.startsWith('blob:')
        ? resolvedUrl
        : new URL(resolvedUrl, window.location.origin).href;
      
      console.log(`[PDF Merge] Fetching image: ${absoluteUrl}`);
      let response: Response | null = null;
      try {
        response = await fetchWithTimeout(absoluteUrl, 3000);
      } catch {
        response = null;
      }
      
      if (!response || !response.ok) {
        console.error(`[PDF Merge] Failed to fetch image: ${response ? response.statusText : 'no response'}`);
        return;
      }
      
      const arrayBuffer = await response.arrayBuffer();
      let image;
      const contentType = response.headers.get('content-type') || '';
      
      console.log(`[PDF Merge] Image content type: ${contentType}`);
      
      if (contentType.includes('png')) {
        image = await pdf.embedPng(arrayBuffer);
        console.log(`[PDF Merge] Successfully embedded as PNG`);
      } else if (contentType.includes('jpeg') || contentType.includes('jpg')) {
        image = await pdf.embedJpg(arrayBuffer);
        console.log(`[PDF Merge] Successfully embedded as JPG`);
      } else {
        // Try PNG first, then JPG
        try {
          image = await pdf.embedPng(arrayBuffer);
          console.log(`[PDF Merge] Successfully embedded as PNG (auto-detect)`);
        } catch {
          try {
            image = await pdf.embedJpg(arrayBuffer);
            console.log(`[PDF Merge] Successfully embedded as JPG (auto-detect)`);
          } catch (e2) {
            console.error(`[PDF Merge] Failed to embed image as PNG or JPG:`, e2);
            return;
          }
        }
      }
      
      // Create a page that fits the image (standard letter size)
      const pageWidth = 612; // US Letter width
      const pageHeight = 792; // US Letter height
      const imageDims = image.scale(1);
      
      console.log(`[PDF Merge] Image dimensions: ${imageDims.width} x ${imageDims.height}`);
      
      // Calculate scale to fit image on page (leave space for question number)
      const maxImageHeight = pageHeight - 60; // Leave 60px for text and margins
      const maxImageWidth = pageWidth - 40; // Leave 20px margin on each side
      const scaleX = maxImageWidth / imageDims.width;
      const scaleY = maxImageHeight / imageDims.height;
      const scale = Math.min(scaleX, scaleY, 1); // Don't upscale
      
      const scaledWidth = imageDims.width * scale;
      const scaledHeight = imageDims.height * scale;
      
      console.log(`[PDF Merge] Scaled dimensions: ${scaledWidth} x ${scaledHeight} (scale: ${scale})`);
      
      const page = pdf.addPage([pageWidth, pageHeight]);
      
      // Add question number text at the top (larger and more prominent)
      const textSize = 24;
      const textY = pageHeight - 40;
      const font = await pdf.embedFont(StandardFonts.HelveticaBold);
      page.drawText(`Question ${questionNumber}`, {
        x: 30,
        y: textY,
        size: textSize,
        color: rgb(0, 0, 0),
        font: font,
      });
      
      // Draw the image centered below the text
      const imageX = (pageWidth - scaledWidth) / 2;
      const imageY = pageHeight - 50 - scaledHeight;
      
      console.log(`[PDF Merge] Drawing image at (${imageX}, ${imageY}) with size ${scaledWidth} x ${scaledHeight}`);
      
      page.drawImage(image, {
        x: imageX,
        y: imageY,
        width: scaledWidth,
        height: scaledHeight,
      });
      
      console.log(`[PDF Merge] Successfully added image page for question ${questionNumber}`);
    } catch (error) {
      console.error(`[PDF Merge] Error adding image ${imageUrl}:`, error);
    }
  };

  // Merge PDFs and images with question numbers and separators
  const mergePDFsAndImages = async (
    questions: Question[],
    type: 'questions' | 'markschemes'
  ): Promise<Blob> => {
    const mergedPdf = await PDFDocument.create();
    
    console.log(`[PDF Merge] Starting merge for ${questions.length} questions`);
    
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      const questionNumber = parseInt(question.id.replace('q', '')) || (i + 1);
      const fileUrl = type === 'questions' ? question.questionContent : question.markScheme;
      const fileType = type === 'questions' ? question.questionContentType : question.markSchemeType;
      
      if (!fileUrl) {
        console.warn(`[PDF Merge] Skipping question ${questionNumber}: no file URL`);
        continue;
      }
      
      try {
        const resolvedUrl = await resolveAssetUrl(fileUrl);
        const absoluteUrl = resolvedUrl.startsWith('http') || resolvedUrl.startsWith('blob:')
          ? resolvedUrl
          : new URL(resolvedUrl, window.location.origin).href;
        
        console.log(`[PDF Merge] Processing question ${questionNumber}: ${fileType} from ${absoluteUrl}`);
        
        if (fileType === 'pdf') {
          // Add separator page before PDF
          await createSeparatorPage(mergedPdf, questionNumber, type);
          console.log(`[PDF Merge] Added separator page for question ${questionNumber}`);
          
          // After:
          let response: Response | null = null;
          try {
            response = await fetchWithTimeout(absoluteUrl, 20000); // 20s — R2 downloads, not local files
          } catch (err) {
            console.warn(`[PDF Merge] First fetch attempt failed for question ${questionNumber}, retrying: ${(err as Error).message}`);
            try {
              response = await fetchWithTimeout(absoluteUrl, 20000);
            } catch (err2) {
              console.error(`[PDF Merge] Retry also failed for question ${questionNumber}: ${(err2 as Error).message}`);
              response = null;
            }
          }

          if (!response || !response.ok) {
            console.error(`[PDF Merge] Failed to fetch PDF for question ${questionNumber}: ${response ? response.status + ' ' + response.statusText : 'no response'} (${absoluteUrl})`);
            continue;
          }
          
          const arrayBuffer = await response.arrayBuffer();
          const pdf = await PDFDocument.load(arrayBuffer);
          const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
          
          // Embed font once for all pages
          const font = await mergedPdf.embedFont(StandardFonts.HelveticaBold);
          const headerText = `${type === 'questions' ? 'Question' : 'Mark Scheme'} ${questionNumber}`;
          const headerFontSize = 14;
          const headerHeight = 35;
          
          pages.forEach((page, pageIndex) => {
            const { width, height } = page.getSize();
            
            console.log(`[PDF Merge] Adding header to page ${pageIndex + 1}, size: ${width}x${height}`);
            
            // Draw header background (PDF coordinates: bottom-left is origin)
            // Fill the entire header area
            page.drawRectangle({
              x: 0,
              y: height - headerHeight,
              width: width,
              height: headerHeight,
              color: rgb(0.85, 0.85, 0.85), // Light gray background
            });
            
            // Draw a border rectangle for the header
            page.drawRectangle({
              x: 0,
              y: height - headerHeight,
              width: width,
              height: headerHeight,
              borderColor: rgb(0.5, 0.5, 0.5),
              borderWidth: 1,
            });
            
            // Draw header text (y position accounts for text baseline)
            // Text baseline is at the y coordinate, so we position it in the middle of the header
            const textY = height - headerHeight + (headerHeight / 2) - (headerFontSize / 3); // Center vertically
            page.drawText(headerText, {
              x: 20,
              y: textY,
              size: headerFontSize,
              color: rgb(0, 0, 0),
              font: font,
            });
            
            // Draw page number if multiple pages
            if (pages.length > 1) {
              const pageNumText = `Page ${pageIndex + 1} of ${pages.length}`;
              const pageNumWidth = font.widthOfTextAtSize(pageNumText, headerFontSize);
              page.drawText(pageNumText, {
                x: width - pageNumWidth - 20,
                y: textY,
                size: headerFontSize,
                color: rgb(0, 0, 0),
                font: font,
              });
            }
            
            mergedPdf.addPage(page);
            console.log(`[PDF Merge] Added page ${pageIndex + 1} with header`);
          });
          
          console.log(`[PDF Merge] Added ${pages.length} pages from PDF for question ${questionNumber} with headers`);
        } else if (fileType === 'image') {
          // Add question number and image
          await addImageToPdf(mergedPdf, absoluteUrl, questionNumber);
          console.log(`[PDF Merge] Added image page for question ${questionNumber}`);
        }
      } catch (error) {
        console.error(`[PDF Merge] Error processing ${fileType} ${fileUrl}:`, error);
        // Continue with other files even if one fails
      }
    }
    
    console.log(`[PDF Merge] Final PDF has ${mergedPdf.getPageCount()} pages`);
    const pdfBytes = await mergedPdf.save();
    return new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
  };

  // Download merged PDFs for a quiz
  const handleDownloadMergedPDFs = async (
    quiz: MultiQuiz,
    type: 'questions' | 'markschemes',
    loadedQuestions: Question[]
  ) => {
    try {
      // If questions aren't loaded yet, try to load them
      let questions = loadedQuestions;
      if (questions.length === 0 && quiz.loadQuiz && quiz.folderPath) {
        try {
          questions = await quiz.loadQuiz(quiz.folderPath);
        } catch (error) {
          console.error('Error loading questions:', error);
          alert('Failed to load questions. Please try opening the quiz first.');
          return;
        }
      }

      // Filter questions that have the requested file type
      const validQuestions = questions.filter(q => {
        const fileUrl = type === 'questions' ? q.questionContent : q.markScheme;
        const fileType = type === 'questions' ? q.questionContentType : q.markSchemeType;
        return fileUrl && (fileType === 'pdf' || fileType === 'image');
      });

      if (validQuestions.length === 0) {
        alert(`No files found to merge for ${type === 'questions' ? 'questions' : 'mark schemes'}`);
        return;
      }

      // Show non-blocking loading notification
      const loadingNotification = document.createElement('div');
      loadingNotification.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:10000;background:#fff;padding:16px 24px;border-radius:12px;box-shadow:0 10px 40px rgba(0,0,0,0.15);display:flex;align-items:center;gap:12px;max-width:350px;animation:slideIn 0.3s ease-out;';
      
      // Add keyframe animation for slide in
      const style = document.createElement('style');
      style.textContent = '@keyframes slideIn { from { transform: translateX(400px); opacity: 0; } to { transform: translateX(0); opacity: 1; } } @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }';
      document.head.appendChild(style);
      
      // Spinner
      const spinner = document.createElement('div');
      spinner.style.cssText = 'width:24px;height:24px;border:3px solid #e5e7eb;border-top:3px solid #3b82f6;border-radius:50%;animation:spin 0.8s linear infinite;flex-shrink:0;';
      
      // Text container
      const textContainer = document.createElement('div');
      textContainer.style.cssText = 'flex:1;';
      
      // Title
      const title = document.createElement('div');
      title.style.cssText = 'font-size:14px;font-weight:600;color:#1f2937;margin-bottom:2px;';
      title.textContent = 'Creating PDF';
      
      // Message
      const message = document.createElement('div');
      message.style.cssText = 'font-size:12px;color:#6b7280;';
      message.textContent = `Merging ${validQuestions.length} file${validQuestions.length !== 1 ? 's' : ''}...`;
      
      textContainer.appendChild(title);
      textContainer.appendChild(message);
      loadingNotification.appendChild(spinner);
      loadingNotification.appendChild(textContainer);
      document.body.appendChild(loadingNotification);

      const mergedBlob = await mergePDFsAndImages(validQuestions, type);
      
      // Remove loading notification
      document.body.removeChild(loadingNotification);
      if (style.parentNode) {
        document.head.removeChild(style);
      }

      const downloadUrl = window.URL.createObjectURL(mergedBlob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      const filename = `${quiz.title.replace(/[^a-z0-9]/gi, '_')}_${type === 'questions' ? 'All_Questions' : 'All_Mark_Schemes'}.pdf`;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error merging PDFs:', error);
      alert('Failed to merge PDFs. Please try again.');
    }
  };

  const questionsWithMarkSchemes = useMemo(
    () =>
      questions.map((q) => {
        const msUrl = q.markScheme || deriveMarkSchemeUrl(q.questionContent);
        if (!msUrl) return q;
        return {
          ...q,
          markScheme: msUrl,
          markSchemeType: (q.markSchemeType || q.questionContentType || 'pdf') as 'pdf' | 'image',
        };
      }),
    [questions]
  );

  const quizzes = isQuizMenu ? (props as QuizMenuProps).quizzes : [];
  const selectedQuiz = quizzes.find(q => q.id === selectedQuizId);
  const propQuestions = useMemo(() => selectedQuiz?.questions || [], [selectedQuiz?.questions]);
  const stateQuestions = selectedQuizId ? (loadedQuizzes.get(selectedQuizId) || []) : [];
  const selectedQuizQuestions = propQuestions.length > 0 ? propQuestions : (stateQuestions.length > 0 ? stateQuestions : []);
  const stillLoading = selectedQuizId ? (
    selectedQuiz?.isLoading !== undefined ? selectedQuiz.isLoading :
    (isLoadingMore.get(selectedQuizId) || false)
  ) : false;

  useEffect(() => {
    if (!quizId) return;
    try {
      localStorage.setItem(`quiz_annotations_${quizId}`, JSON.stringify(Array.from(annotations.entries())));
    } catch {
      // ignore
    }
  }, [annotations, quizId]);

  useEffect(() => {
    if (!quizId) return;
    try {
      const stored = localStorage.getItem(`quiz_mcq_answers_${quizId}`);
      if (stored) {
        const parsed = JSON.parse(stored) as Record<number, string>;
        setMcqSelections(parsed);
      }
    } catch {
      // ignore
    }
  }, [quizId]);

  useEffect(() => {
    if (!quizId) return;
    try {
      localStorage.setItem(`quiz_mcq_answers_${quizId}`, JSON.stringify(mcqSelections));
    } catch {
      // ignore
    }
  }, [mcqSelections, quizId]);

  useEffect(() => {
    setSelectedMcqOption(mcqSelections[currentQuestion] ?? null);
  }, [currentQuestion, mcqSelections]);

  const getAnnotationKey = (questionIndex: number, isMarkScheme: boolean): string => {
    return `q${questionIndex}_${isMarkScheme ? 'ms' : 'q'}`;
  };

  const handleSaveAnnotation = (annotationData: string, isMarkScheme: boolean = false) => {
    const key = getAnnotationKey(currentQuestion, isMarkScheme);
    setAnnotations(prev => new Map(prev).set(key, annotationData));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setShowMarkScheme(false);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setShowMarkScheme(false);
    }
  };

  const handlePageCountChange = useCallback((numPages: number) => {
    setPageCount(numPages);
  }, []);

  useEffect(() => {
    if (!isQuizMenu || !selectedQuizId || propQuestions.length === 0) return;
    const currentLoaded = loadedQuizzes.get(selectedQuizId) || [];
    if (propQuestions.length > currentLoaded.length) {
      setLoadedQuizzes(prev => new Map(prev).set(selectedQuizId, propQuestions));
    }
  }, [isQuizMenu, selectedQuizId, propQuestions, loadedQuizzes]);

  useEffect(() => {
    if (!isQuizMenu || !selectedQuizId || !selectedQuiz) return;
    if (selectedQuiz.isLoading === false) {
      setIsLoadingMore(prev => new Map(prev).set(selectedQuizId, false));
    } else if (selectedQuiz.isLoading === true && propQuestions.length > 0) {
      setIsLoadingMore(prev => new Map(prev).set(selectedQuizId, true));
    }
  }, [isQuizMenu, selectedQuizId, selectedQuiz, propQuestions.length]);

  const handleSelectQuiz = async (quiz: MultiQuiz) => {
      setSelectedQuizId(quiz.id);
      
      // If questions already loaded or available in props, skip loading
      if (quiz.questions.length > 0) {
        return;
      }
      
      // Load on demand if callback provided and no questions yet
      if (quiz.loadQuiz && quiz.folderPath) {
        setLoadingQuizzes(prev => new Map(prev).set(quiz.id, true));
        setIsLoadingMore(prev => new Map(prev).set(quiz.id, true));
        
        try {
          // This will return partial results after timeout, but questions are added incrementally via callback
          // Questions will be updated in TopicPage and flow through props
          await quiz.loadQuiz(quiz.folderPath);
          
          // Don't automatically mark as not loading - let the continueLoading promise handle it
          // The isLoading flag from the quiz prop will be updated when loading completes
        } catch (error) {
          console.error('Failed to load quiz:', error);
          setIsLoadingMore(prev => new Map(prev).set(quiz.id, false));
        } finally {
          setLoadingQuizzes(prev => new Map(prev).set(quiz.id, false));
        }
      }
    };

  if (isQuizMenu) {
    if (!selectedQuizId) {
      if (quizzes.length === 0) {
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 h-8 text-gray-400 dark:text-gray-300" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Quiz Available</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">No quiz questions have been added for this topic yet. Help us grow by contributing content!</p>
            <Link to="/contribute" className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-lg hover:from-blue-600 hover:to-teal-600 transition-all duration-200 shadow-md hover:shadow-lg">
              Contribute Questions
            </Link>
          </motion.div>
        );
      }
      return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white text-center flex items-center justify-center gap-2">
            <Trophy className="w-7 h-7 text-blue-500 dark:text-teal-400 mr-2" />
            Select a Quiz
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {quizzes.map(q => {
              const isLoading = loadingQuizzes.get(q.id) || false;
              // Prefer quick count, then loaded count, then questions length
              const questionCount = q.questionCount !== undefined 
                ? q.questionCount 
                : (loadedQuizzes.get(q.id)?.length || q.questions.length);
              
              // Check if this is a single-file download-only quiz
              const firstQuestion = q.questions.length > 0 ? q.questions[0] : null;
              const isDownloadOnly = firstQuestion?.downloadOnly === true;

              // If it's a download-only quiz, show download buttons directly (styled similar to folder-based quizzes)
              if (isDownloadOnly && firstQuestion) {
                return (
                  <div
                    key={q.id}
                    className="flex flex-col p-6 bg-blue-500 dark:bg-blue-900 border border-blue-400 dark:border-teal-900 rounded-2xl shadow hover:shadow-lg transition-all duration-200"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <FileText className="w-6 h-6 text-white opacity-90" />
                      <span className="text-lg font-semibold text-white">
                        {q.title}
                      </span>
                    </div>
                    <div className="flex flex-col gap-2 pt-2 border-t border-blue-300/60 dark:border-teal-800/80">
                      {firstQuestion.questionContent && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(
                              firstQuestion.questionContent!,
                              getFilenameFromUrl(firstQuestion.questionContent!, `Question_Paper.${firstQuestion.questionContentType === 'pdf' ? 'pdf' : 'png'}`)
                            );
                          }}
                          className="flex items-center justify-center gap-2 px-3 py-2 text-xs bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <Download className="w-3 h-3" />
                          <span>Download Question</span>
                        </button>
                      )}
                      {firstQuestion.markScheme && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(
                              firstQuestion.markScheme!,
                              getFilenameFromUrl(firstQuestion.markScheme!, `Mark_Scheme.${firstQuestion.markSchemeType === 'pdf' ? 'pdf' : 'png'}`)
                            );
                          }}
                          className="flex items-center justify-center gap-2 px-3 py-2 text-xs bg-white dark:bg-gray-800 text-orange-600 dark:text-orange-400 rounded-lg hover:bg-orange-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <Download className="w-3 h-3" />
                          <span>Download Mark Scheme</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              }

              const allQuestions = q.questions.length > 0 ? q.questions : (loadedQuizzes.get(q.id) || []);
              const isFolderBased = q.folderPath !== undefined;
              
              return (
                <div
                  key={q.id}
                  className="flex flex-col p-6 bg-blue-500 dark:bg-blue-900 border border-blue-400 dark:border-teal-900 rounded-2xl shadow hover:shadow-lg transition-all duration-200"
                >
                  <button
                    className="flex flex-col items-start text-left group disabled:opacity-60 mb-3"
                    onClick={() => handleSelectQuiz(q)}
                    disabled={isLoading}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Trophy className="w-6 h-6 text-white opacity-90 group-hover:opacity-100 transition-opacity" />
                      <span className="text-lg font-semibold text-white group-hover:text-yellow-200 transition-colors">{q.title}</span>
                    </div>
                    <span className="text-sm text-blue-100 dark:text-teal-100 opacity-90">
                      {isLoading ? '⏳ Loading...' : `${questionCount} question${questionCount !== 1 ? 's' : ''}`}
                    </span>
                  </button>
                  
                  {/* Download merged PDFs buttons - show for folder-based quizzes */}
                  {isFolderBased && (
                    <div className="flex flex-col gap-2 mt-2 pt-3 border-t border-blue-400 dark:border-teal-800">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadMergedPDFs(q, 'questions', allQuestions);
                        }}
                        className="flex items-center justify-center gap-2 px-3 py-2 text-xs bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                        title="Download all question papers as merged PDF"
                        disabled={isLoading}
                      >
                        <Download className="w-3 h-3" />
                        <span>All Questions PDF</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadMergedPDFs(q, 'markschemes', allQuestions);
                        }}
                        className="flex items-center justify-center gap-2 px-3 py-2 text-xs bg-white dark:bg-gray-800 text-orange-600 dark:text-orange-400 rounded-lg hover:bg-orange-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                        title="Download all mark schemes as merged PDF"
                        disabled={isLoading}
                      >
                        <Download className="w-3 h-3" />
                        <span>All Mark Schemes PDF</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      );
    }

    // Show selected quiz
    if (!selectedQuiz) return null;
    const isLoading = loadingQuizzes.get(selectedQuiz.id) || false;
    
    return (
      <div>
        <button
          className="mb-4 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-60"
          onClick={() => setSelectedQuizId(null)}
          disabled={isLoading}
        >
          ← Back to Quiz List
        </button>
        {isLoading && selectedQuizQuestions.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
            <div className="w-12 h-12 border-4 border-blue-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading quiz questions...</p>
          </div>
        ) : selectedQuizQuestions.length > 0 ? (
          <div>
            <TopicalQuiz questions={selectedQuizQuestions} title={selectedQuiz.title} quizId={selectedQuiz.id} />
            {stillLoading && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-center gap-3"
              >
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Loading more questions...
                </p>
              </motion.div>
            )}
          </div>
        ) : !isLoading ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">No questions found for this quiz.</p>
          </div>
        ) : null}
      </div>
    );
  }

  // Safety check: ensure questions is a valid array
  if (!Array.isArray(questions)) {
    console.error('Quiz component received invalid questions:', questions);
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center"
      >
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trophy className="w-8 h-8 text-gray-400 dark:text-gray-300" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Error Loading Quiz</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Invalid quiz data received.</p>
      </motion.div>
    );
  }
  
  if (questions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center"
      >
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trophy className="w-8 h-8 text-gray-400 dark:text-gray-300" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Quiz Available</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">No quiz questions have been added for this topic yet. Help us grow by contributing content!</p>
        <Link to="/contribute" className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-lg hover:from-blue-600 hover:to-teal-600 transition-all duration-200 shadow-md hover:shadow-lg">
          Contribute Questions
        </Link>
      </motion.div>
    );
  }

  // Safety check: ensure currentQuestion is valid
  const validCurrentQuestion = Math.min(currentQuestion, questions.length - 1);
  const currentQ = questionsWithMarkSchemes[validCurrentQuestion];

  // Detect if this is a single-file download-only quiz
  // If there's only one question and it has downloadOnly flag set to true, treat as download-only
  const isDownloadOnly = questions.length === 1 && currentQ.downloadOnly === true;

  // Download-only mode: show simple download interface
  if (isDownloadOnly) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
            <Link to="/contact" className="p-2 text-gray-400 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 transition-colors" title="Report Quiz">
              <Flag className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {currentQ.title || 'Download Files'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Click the buttons below to download the question paper and mark scheme
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {currentQ.questionContent && (
              <button
                onClick={() => handleDownload(
                  currentQ.questionContent!,
                  getFilenameFromUrl(currentQ.questionContent!, `Question_Paper.${currentQ.questionContentType === 'pdf' ? 'pdf' : 'png'}`)
                )}
                className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 dark:hover:from-blue-700 dark:hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 min-w-[200px] justify-center"
                title="Download question paper"
              >
                <Download className="w-5 h-5" />
                <span className="font-semibold">Download Question Paper</span>
              </button>
            )}
            {currentQ.markScheme && (
              <button
                onClick={() => handleDownload(
                  currentQ.markScheme!,
                  getFilenameFromUrl(currentQ.markScheme!, `Mark_Scheme.${currentQ.markSchemeType === 'pdf' ? 'pdf' : 'png'}`)
                )}
                className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 dark:hover:from-orange-700 dark:hover:to-orange-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 min-w-[200px] justify-center"
                title="Download mark scheme"
              >
                <Download className="w-5 h-5" />
                <span className="font-semibold">Download Mark Scheme</span>
              </button>
            )}
          </div>

          {!currentQ.questionContent && !currentQ.markScheme && (
            <div className="text-center mt-8">
              <p className="text-gray-500 dark:text-gray-400">No files available for download</p>
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  // Normal multi-question quiz mode
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden flex flex-row w-full min-h-0"
    >
      <div className="flex flex-col flex-1 overflow-hidden min-h-0">
        <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          {/* Navigation at the top (only Previous / Next) */}
          <div className="flex gap-2 sm:gap-4 justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="px-3 sm:px-4 py-2 text-base text-gray-700 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <button
              onClick={handleNext}
              className="px-3 sm:px-6 py-2 text-base bg-gray-700 dark:bg-gray-600 text-white rounded-lg hover:bg-gray-600 dark:hover:bg-gray-500 transition-colors"
            >
              Next Question
            </button>
          </div>

          {/* Horizontal paper list bar (was sidebar) - mobile / small screens */}
          <div className="mt-3 flex w-full md:hidden overflow-x-auto border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-lg">
            {questions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentQuestion(idx)}
                className={`px-3 py-2 text-xs sm:text-sm whitespace-nowrap transition-colors flex items-center gap-2 ${
                  currentQuestion === idx
                    ? 'bg-blue-500 text-white font-semibold'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800'
                }`}
              >
                <span>{q.title || `Paper ${idx + 1}`}</span>
                {'showUnitTags' in props && props.showUnitTags && q.unit && (
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                    currentQuestion === idx
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-200'
                  }`}>
                    {q.unit}
                  </span>
                )}
              </button>
            ))}
            {'isLoading' in props && props.isLoading && (
              <>
                {/* Skeleton loading items for mobile */}
                {Array.from({ length: 2 }, (_, idx) => (
                  <div key={`mobile-skeleton-${idx}`} className="px-3 py-2 text-xs sm:text-sm whitespace-nowrap flex items-center gap-2 animate-pulse">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                    {'showUnitTags' in props && props.showUnitTags && (
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-6"></div>
                    )}
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Content area - external toolbar, inner region scrolls */}
        <div className="flex-1 p-2 flex flex-col bg-gray-50 dark:bg-gray-900 overflow-hidden">
          <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
            <div className="flex items-center gap-3 flex-wrap">
              {currentQ.title && (
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {currentQ.title}
                </h3>
              )}
              {'showUnitTags' in props && props.showUnitTags && currentQ.unit && (
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200">
                  {currentQ.unit}
                </span>
              )}
            </div>
            {pageCount !== null && (
              <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                {pageCount} page{pageCount === 1 ? '' : 's'}
              </span>
            )}
          </div>

          {/* Topic tags */}
          {currentQ.topicMatches && currentQ.topicMatches.length > 0 && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800 px-2 py-1.5 rounded mb-2 flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Topics:</span>
              {currentQ.topicMatches.map((topic, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                >
                  {topic}
                </span>
              ))}
            </div>
          )}

          {/* External Question / Mark Scheme toggle + Annotate */}
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="inline-flex rounded-lg bg-gray-800/60 p-1">
              <button
                type="button"
                onClick={() => setShowMarkScheme(false)}
                className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-md transition-colors ${
                  !showMarkScheme
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-200 hover:bg-gray-700'
                }`}
              >
                Question
              </button>
              {Boolean(currentQ.markScheme && !currentQ.mcqAnswer) && (
                <button
                  type="button"
                  onClick={() => setShowMarkScheme(true)}
                  className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-md transition-colors ${
                    showMarkScheme
                      ? 'bg-orange-500 text-white'
                      : 'text-gray-200 hover:bg-gray-700'
                  }`}
                >
                  Mark Scheme
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setAnnotationMode(prev => !prev)}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs sm:text-sm font-semibold transition-colors ${
                annotationMode
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-800 text-gray-200 hover:bg-gray-700'
              }`}
            >
              Annotate
            </button>
          </div>

          {/* Question Content Display (wraps to content height) */}
          <div className="w-full border-2 border-gray-300 dark:border-gray-600 rounded-lg p-1 bg-gray-50 dark:bg-gray-900 overflow-hidden">
            {currentQ.questionContent ? (
              <div className="w-full max-h-[60vh] overflow-y-auto overflow-x-hidden">
                <MediaViewer
                  url={currentQ.questionContent}
                  type={(currentQ.questionContentType || 'pdf') as 'pdf' | 'image'}
                  markSchemeUrl={currentQ.markScheme}
                  markSchemeType={(currentQ.markSchemeType || currentQ.questionContentType || 'pdf') as 'pdf' | 'image'}
                  hasMarkScheme={Boolean(currentQ.markScheme)}
                  markSchemeOpen={showMarkScheme}
                  onToggleMarkScheme={(open: boolean) => setShowMarkScheme(open)}
                  showMarkingButtons={false}
                  savedAnnotation={annotations.get(getAnnotationKey(currentQuestion, false))}
                  savedMarkSchemeAnnotation={annotations.get(getAnnotationKey(currentQuestion, true))}
                  onSaveAnnotation={(data) => handleSaveAnnotation(data, false)}
                  onSaveMarkSchemeAnnotation={(data) => handleSaveAnnotation(data, true)}
                  questionList={questionsWithMarkSchemes}
                  questionIndex={currentQuestion}
                  onChangeQuestion={(i) => setCurrentQuestion(i)}
                  disableR2={false}
                  hideToolbar={true}
                  onLoadComplete={handlePageCountChange}
                  forceAnnotationMode={annotationMode}
                />
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No question content provided</p>
            )}
          </div>

          {currentQ.mcqAnswer && (
  <div className="mt-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100/70 dark:bg-gray-800/60 p-3 sm:p-4">
    <div className="flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-0.5">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">MCQ practice</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Choose A–D below. Live checking is optional.</p>
        </div>
        <button
          type="button"
          onClick={() => setLiveMcqCheckEnabled(prev => !prev)}
          className={`inline-flex items-center justify-center rounded-md px-3 py-1.5 text-xs sm:text-sm font-semibold transition-colors mt-0.5 ${
            liveMcqCheckEnabled
              ? 'bg-purple-500 text-white hover:bg-purple-600'
              : 'bg-gray-800 text-gray-200 hover:bg-gray-700'
          }`}
        >
          {liveMcqCheckEnabled ? 'Live check: On' : 'Live check: Off'}
        </button>
      </div>

      {/* Rest of the MCQ options remains the same */}
      <div className="flex items-stretch justify-center py-4">
        <div className="flex items-stretch gap-4 w-full max-w-md mx-auto">
          {['A', 'B', 'C', 'D'].map(option => {
            const isSelected = selectedMcqOption === option;
            const isCorrect = liveMcqCheckEnabled && isSelected && currentQ.mcqAnswer === option;
            const isWrong = liveMcqCheckEnabled && isSelected && currentQ.mcqAnswer !== option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => {
                  setSelectedMcqOption(option);
                  if (quizId) {
                    setMcqSelections(prev => ({ ...prev, [currentQuestion]: option }));
                  }
                }}
                className={`flex-1 aspect-square min-w-[56px] max-w-[120px] rounded-full border text-lg font-bold uppercase transition-colors duration-200 flex items-center justify-center ${
                  isCorrect
                    ? 'border-green-600 bg-green-600 text-white'
                    : isWrong
                      ? 'border-red-600 bg-red-600 text-white'
                      : isSelected
                        ? 'border-gray-700 bg-gray-700 dark:border-gray-500 dark:bg-gray-600 text-white'
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>
      
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        {selectedMcqOption ? (
          liveMcqCheckEnabled ? (
            <p className={`text-xs sm:text-sm font-semibold ${selectedMcqOption === currentQ.mcqAnswer ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-400'}`}>
              {selectedMcqOption === currentQ.mcqAnswer ? 'Correct!' : `Correct answer: ${currentQ.mcqAnswer}`}
            </p>
          ) : (
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Live check is off. Toggle it on to reveal the answer.</p>
          )
        ) : (
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Tap an option to check your answer.</p>
        )}
      </div>
    </div>
  </div>
)}
        </div>
      </div>

      {/* Vertical sidebar for larger screens */}
      <div className="hidden md:flex flex-col w-52 flex-shrink-0 border-l border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 min-h-0 max-h-[70vh]">
        <div className="px-3 py-3 border-b border-gray-200 dark:border-gray-800">
          <h3 className="text-sm font-semibold tracking-wide text-gray-700 dark:text-gray-200 uppercase">
            Papers
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {questions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentQuestion(idx)}
              className={`w-full px-3 py-2 text-sm text-left border-b border-gray-200 dark:border-gray-800 transition-colors flex items-center justify-between ${
                currentQuestion === idx
                  ? 'bg-blue-500 text-white font-semibold'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800'
              }`}
            >
              <span>{q.title || `Paper ${idx + 1}`}</span>
              {'showUnitTags' in props && props.showUnitTags && q.unit && (
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ml-2 flex-shrink-0 ${
                  currentQuestion === idx
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-200'
                }`}>
                  {q.unit}
                </span>
              )}
            </button>
          ))}
          {'isLoading' in props && props.isLoading && (
            <>
              {/* Skeleton loading items */}
              {Array.from({ length: 3 }, (_, idx) => (
                <div key={`skeleton-${idx}`} className="w-full px-3 py-2 text-sm text-left border-b border-gray-200 dark:border-gray-800 flex items-center justify-between animate-pulse">
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  </div>
                  {'showUnitTags' in props && props.showUnitTags && (
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-8 ml-2 flex-shrink-0"></div>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default TopicalQuiz;
