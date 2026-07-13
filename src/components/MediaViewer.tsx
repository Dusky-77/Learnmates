import React, { useEffect, useRef, useState } from 'react';
import { Pen } from 'lucide-react';
import { pdfjs, pdfGetDocumentOptions } from '../utils/pdfjsConfig';
import { resolveFromR2, fetchR2AsBlobUrl, getAssetAuthHeaders } from '../utils/r2Utils';

interface MediaViewerProps {
  url: string;
  type: 'pdf' | 'image';
  markSchemeUrl?: string;
  markSchemeType?: 'pdf' | 'image';
  onLoadComplete?: (numPages: number) => void;
  onMarkCorrect?: () => void;
  onMarkIncorrect?: () => void;
  showMarkingButtons?: boolean;
  savedAnnotation?: string; // Base64 encoded canvas data
  onSaveAnnotation?: (annotationData: string) => void; // Callback to save annotation
  hasMarkScheme?: boolean;
  markSchemeOpen?: boolean;
  onToggleMarkScheme?: (open: boolean) => void;
  // separate mark-scheme annotation props
  savedMarkSchemeAnnotation?: string;
  onSaveMarkSchemeAnnotation?: (annotationData: string) => void;
  // Optional: allow modal to navigate between questions
  questionList?: Array<{ questionContent?: string; questionContentType?: 'image' | 'pdf'; markScheme?: string; markSchemeType?: 'image' | 'pdf' }>;
  questionIndex?: number;
  onChangeQuestion?: (newIndex: number) => void;
  disableR2?: boolean; // when true, skip all R2 fetch attempts
  // When true, hide the internal toolbar so parent can render its own controls
  hideToolbar?: boolean;
  // Optional external control of annotation mode (used when toolbar is hidden)
  forceAnnotationMode?: boolean;
}

interface PageRef {
  canvas: HTMLCanvasElement | null;
  annotationCanvas: HTMLCanvasElement | null;
}

const MediaViewer: React.FC<MediaViewerProps> = ({
  url,
  type,
  markSchemeUrl,
  markSchemeType,
  onLoadComplete,
  onMarkCorrect,
  onMarkIncorrect,
  showMarkingButtons = false,
  savedAnnotation,
  onSaveAnnotation,
  hasMarkScheme = false,
  markSchemeOpen = false,
  onToggleMarkScheme,
  savedMarkSchemeAnnotation,
  onSaveMarkSchemeAnnotation,
  questionList,
  questionIndex,
  onChangeQuestion,
  disableR2 = false,
  hideToolbar = false,
  forceAnnotationMode
}) => {
  const effectiveUrl = (markSchemeOpen && markSchemeUrl) ? markSchemeUrl : url;
  const effectiveType = (markSchemeOpen && markSchemeType) ? markSchemeType : type;
  const containerRef = useRef<HTMLDivElement>(null);
  const pagesContainerRef = useRef<HTMLDivElement>(null);
  const canvasRefsMap = useRef<Map<number, PageRef>>(new Map());
  const imageRef = useRef<HTMLImageElement>(null);
  const annotationCanvasRef = useRef<HTMLCanvasElement>(null);

  // Move marking buttons below content when the content area is too small
  const markingButtonsRef = useRef<HTMLDivElement | null>(null);
  const [showMarkingBelow, setShowMarkingBelow] = useState(false);
  const MIN_MARKING_CONTENT_HEIGHT = 220; // px
  const MIN_MARKING_CONTENT_WIDTH = 360; // px

  const [numPages, setNumPages] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const ZOOM_SCALE = 3.0;
  const pdfRef = useRef<any>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const renderedPagesRef = useRef<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [annotationMode, setAnnotationMode] = useState(false);
  const [drawColor, setDrawColor] = useState('#FF0000');
  const [drawMode, setDrawMode] = useState<'pen' | 'eraser'>('pen');
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  // Persistent pen/eraser settings (stored in localStorage)
  const STORAGE_PEN_KEY = 'lm_penSize';
  const STORAGE_ERASER_KEY = 'lm_eraserSize';
  const STORAGE_COLOR_KEY = 'lm_drawColor';

  const [penSize, setPenSize] = useState<number>(() => {
    try {
      const v = localStorage.getItem(STORAGE_PEN_KEY);
      return v ? Number(v) : 3;
    } catch (e) {
      return 3;
    }
  });
  const [eraserSize, setEraserSize] = useState<number>(() => {
    try {
      const v = localStorage.getItem(STORAGE_ERASER_KEY);
      return v ? Number(v) : 20;
    } catch (e) {
      return 20;
    }
  });
  // override drawColor initialiser to load from storage if present
  useEffect(() => {
    try {
      const c = localStorage.getItem(STORAGE_COLOR_KEY);
      if (c) setDrawColor(c);
    } catch (e) {
      // ignore
    }
  }, []);
  const [currentDrawingPageNum, setCurrentDrawingPageNum] = useState<number | null>(null);
  // viewer always shows primary content (question). Parent handles mark-scheme pane.
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageLoadAttempt, setImageLoadAttempt] = useState(0);
  const imageFallbackUrlRef = useRef<string>('');

  // Minimum width (px) required before annotation is enabled; below this, annotation is disabled
  const MIN_ANNOTATION_WIDTH_PX = 360;
  const [canAnnotate, setCanAnnotate] = useState(true);
  // Zoom modal state (opens via long-press or double-click/double-tap)
  const [zoomOpen, setZoomOpen] = useState(false);

  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const pdfCanvasObserverRef = useRef<ResizeObserver | null>(null);

  // Gesture detection: long-press and double-tap
  const LONG_PRESS_MS = 600;
  const DOUBLE_TAP_MS = 300;
  const longPressTimerRef = useRef<number | null>(null);
  const lastTapRef = useRef<number | null>(null);
  const longPressActiveRef = useRef(false);

  // Zoom modal refs/state (view-only)
  const zoomImageRef = useRef<HTMLImageElement | null>(null);
  const [zoomImageSrc, setZoomImageSrc] = useState<string | null>(null);
  const [modalPages, setModalPages] = useState<string[]>([]); // data URLs or image URLs for modal
  const [modalLoading, setModalLoading] = useState(false);
  const [modalMode, setModalMode] = useState<'question' | 'markscheme'>('question');
  const [modalQuestionIndex, setModalQuestionIndex] = useState<number>(0);
  const modalWrapperRef = useRef<HTMLDivElement | null>(null);
  const [modalImageWidth, setModalImageWidth] = useState<number | null>(null);
  const modalContentRef = useRef<HTMLDivElement | null>(null);
  const [modalZoom, setModalZoom] = useState<number>(1);
  const [topicTags, setTopicTags] = useState<string[]>([]);

  // Sync external annotation mode when provided (mainly when toolbar is hidden)
  useEffect(() => {
    if (typeof forceAnnotationMode === 'boolean') {
      // Only enable annotation if allowed by size
      setAnnotationMode(forceAnnotationMode && canAnnotate);
    }
  }, [forceAnnotationMode, canAnnotate]);

  // Helper to remove file extension
  const removeExtension = (url: string): string => {
    return url.replace(/\.(pdf|png|jpg|jpeg|gif|webp)$/i, '');
  };

  // Helper to try loading image with different extensions
  const tryImageWithExtensions = (baseUrl: string, attempt: number = 0) => {
    const imageExtensions = ['png', 'jpg', 'jpeg', 'gif', 'webp'];
    
    if (attempt < imageExtensions.length) {
      const ext = imageExtensions[attempt];
      const withoutExt = removeExtension(baseUrl);
      const newUrl = `${withoutExt}.${ext}`;
      
      console.log(`Trying extension ${attempt}: ${newUrl}`);
      if (imageRef.current) {
        imageFallbackUrlRef.current = newUrl;
        imageRef.current.src = newUrl;
      }
    }
  };

  // Load topic tags from info.json
  const loadTopicsForFile = async (fileUrl: string) => {
    try {
      setTopicTags([]);
      if (!fileUrl) return;

      // Extract directory path from URL
      let normalizedUrl = fileUrl;
      if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
        try {
          const parsedUrl = new URL(fileUrl);
          normalizedUrl = `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;
        } catch {
          normalizedUrl = fileUrl;
        }
      }

      const urlPath = normalizedUrl.startsWith('/') ? normalizedUrl : `/${normalizedUrl}`;
      const lastSlash = urlPath.lastIndexOf('/');
      const dirPath = urlPath.substring(0, lastSlash);
      const fileName = urlPath.substring(lastSlash + 1);
      
      // Remove file extension to get the base name (e.g., "Jan 2021 Q1" from "Jan 2021 Q1.pdf")
      const baseFileName = fileName.replace(/\.(pdf|png|jpg|jpeg|gif|webp)$/i, '');
      
      // Try to fetch info.json from the same directory
      const infoJsonPath = `${dirPath}/info.json`;
      const resolvedInfoUrl = shouldUseR2(fileUrl) ? await resolveFromR2(infoJsonPath) : null;
      if (!resolvedInfoUrl) {
        return;
      }
      const response = await fetch(resolvedInfoUrl, { headers: getAssetAuthHeaders() });
      
      if (response.ok) {
        const infoData = await response.json();
        
        // Find the entry that matches this file name
        const matchingEntry = Array.isArray(infoData) 
          ? infoData.find((item: any) => item.file_name === baseFileName)
          : null;
        
        if (matchingEntry && Array.isArray(matchingEntry.topic_matches)) {
          setTopicTags(matchingEntry.topic_matches);
        }
      }
    } catch (error) {
      console.warn('Failed to load topic tags:', error);
    }
  };

  const shouldUseR2 = (value: string) => {
    if (!value || disableR2) return false;
    const normalized = value.toLowerCase();
    if (normalized.includes('/questions/') || normalized.includes('/topicals/')) return true;
    if (normalized.includes('assets.learnmates.org')) return true;
    return false;
  };

  // Load content (PDF or image)
  useEffect(() => {
    // Cancel any previous render
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    const load = async () => {
      let currentUrl = effectiveUrl;
      let currentType = effectiveType;
      
      try {
        setLoading(true);
        setError(null);
        // Reset previous pages so React unmounts old canvases before new PDF renders
        setNumPages(null);
        canvasRefsMap.current.clear();
        renderedPagesRef.current.clear();

        if (currentType === 'pdf') {
          // Clear all canvas content when loading new PDF
          canvasRefsMap.current.forEach((pageRef) => {
            if (pageRef.canvas) {
              const ctx = pageRef.canvas.getContext('2d');
              if (ctx) {
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, pageRef.canvas.width, pageRef.canvas.height);
              }
            }
            if (pageRef.annotationCanvas) {
              const ctx = pageRef.annotationCanvas.getContext('2d');
              if (ctx) {
                ctx.clearRect(0, 0, pageRef.annotationCanvas.width, pageRef.annotationCanvas.height);
              }
            }
          });
          
          let pdfUrl = currentUrl;
          if (!pdfUrl.startsWith('http') && !pdfUrl.startsWith('blob:')) {
            pdfUrl = new URL(pdfUrl, window.location.origin).href;
          }

          let pdf: any = null;
          if (shouldUseR2(currentUrl) && !disableR2) {
            const r2Url = await resolveFromR2(currentUrl);
            if (!r2Url) {
              throw new Error(`Could not resolve managed asset URL: ${currentUrl}`);
            }

            pdfUrl = r2Url;
            console.log(`[MediaViewer] Using assets URL only: ${pdfUrl}`);

            const blobUrl = await fetchR2AsBlobUrl(pdfUrl);
            if (blobUrl) {
              pdf = await pdfjs.getDocument({
                ...pdfGetDocumentOptions,
                url: blobUrl,
              }).promise;
            } else {
              pdf = await pdfjs.getDocument({
                ...pdfGetDocumentOptions,
                url: pdfUrl,
              }).promise;
            }
          } else {
            pdf = await pdfjs.getDocument({
              ...pdfGetDocumentOptions,
              url: pdfUrl,
            }).promise;
          }

          if (signal.aborted) return;
          pdfRef.current = pdf;
          setNumPages(pdf.numPages);
          if (onLoadComplete) {
            onLoadComplete(pdf.numPages);
          }
          setImageLoaded(false);
          setError(null);
        } else {
          // Image - for Questions paths, try R2 first
          setNumPages(1);
          setImageLoaded(false);
          setImageLoadAttempt(0); // Reset attempts for new image
          imageFallbackUrlRef.current = removeExtension(currentUrl); // Store base URL without extension
          
          if (shouldUseR2(currentUrl) && !disableR2) {
            console.log(`[MediaViewer] Using assets URL only for image: ${currentUrl}`);
            resolveFromR2(currentUrl).then(r2Url => {
              if (r2Url && imageRef.current) {
                console.log(`[MediaViewer] Using R2 URL for image: ${r2Url}`);
                imageRef.current.src = r2Url;
              } else if (imageRef.current) {
                setError('Failed to resolve image from R2 storage');
                setLoading(false);
              }
            }).catch(err => {
              console.error(`[MediaViewer] R2 resolution failed for image:`, err);
              setError('Failed to resolve image from R2 storage');
              setLoading(false);
            });
          } else if (imageRef.current) {
            imageRef.current.src = currentUrl;
          }
        }
      } catch (err: any) {
        if (signal.aborted) return;

        // If PDF parsing fails for a managed asset, surface the direct R2 error instead of falling back to the legacy host.
        if (currentType === 'pdf' && shouldUseR2(currentUrl)) {
          console.error('[MediaViewer] Managed asset load failed:', err?.message || err);
          setError(`Failed to load managed asset from R2: ${err?.message || String(err)}`);
          return;
        }
        
        // If PDF parsing fails (or R2 fallback failed), try treating it as an image instead
        if (currentType === 'pdf') {
          console.warn('PDF parsing failed, attempting to load as image:', err?.message);
          try {
            setNumPages(1);
            setImageLoaded(false);
            setImageLoadAttempt(0); // Reset image load attempts
            
            // Extract base URL without extension
            const baseUrl = removeExtension(currentUrl);
            imageFallbackUrlRef.current = baseUrl;
            
            // Try image extensions in order: first try original URL, then alternatives
            // Start with attempt 0 which will use the original URL as-is
            if (imageRef.current) {
              // First attempt: try the original URL as an image (might work if server serves it correctly)
              imageRef.current.src = currentUrl;
            }
            setError(null);
            return;
          } catch (imageErr) {
            // Both PDF and image load failed
          }
        }
        
        const errorMsg = err?.message || String(err);
        setError(`Failed to load: ${errorMsg}`);
        console.error('Error loading:', err);
      } finally {
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    };

    load();
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [effectiveUrl, effectiveType, onLoadComplete]);

  useEffect(() => {
    // reset draw mode when content changes but keep user's chosen sizes/colors
    setDrawMode('pen');
    setImageLoadAttempt(0); // Reset image load attempt for new URLs
    imageFallbackUrlRef.current = ''; // Reset fallback URL
  }, [url, type]);

  // Load topic tags when URL changes
  useEffect(() => {
    loadTopicsForFile(effectiveUrl);
  }, [effectiveUrl]);

  // Watch displayed image or first PDF page size and enable/disable annotation accordingly
  useEffect(() => {
    const updateCanAnnotateFromImage = () => {
      const w = imageRef.current?.clientWidth || 0;
      setCanAnnotate(w >= MIN_ANNOTATION_WIDTH_PX);
    };

    const updateCanAnnotateFromPdf = () => {
      const firstCanvas = canvasRefsMap.current.get(1)?.canvas;
      const w = firstCanvas?.getBoundingClientRect().width || 0;
      setCanAnnotate(w >= MIN_ANNOTATION_WIDTH_PX);
    };

    // Observe image element if present
    if (imageRef.current) {
      updateCanAnnotateFromImage();
      if (resizeObserverRef.current) resizeObserverRef.current.disconnect();
      resizeObserverRef.current = new ResizeObserver(updateCanAnnotateFromImage);
      resizeObserverRef.current.observe(imageRef.current);
      window.addEventListener('resize', updateCanAnnotateFromImage);
    }

    // Observe first PDF canvas if present
    const firstCanvas = canvasRefsMap.current.get(1)?.canvas;
    if (firstCanvas) {
      updateCanAnnotateFromPdf();
      if (pdfCanvasObserverRef.current) pdfCanvasObserverRef.current.disconnect();
      pdfCanvasObserverRef.current = new ResizeObserver(updateCanAnnotateFromPdf);
      pdfCanvasObserverRef.current.observe(firstCanvas);
      window.addEventListener('resize', updateCanAnnotateFromPdf);
    }

    return () => {
      if (resizeObserverRef.current) resizeObserverRef.current.disconnect();
      if (pdfCanvasObserverRef.current) pdfCanvasObserverRef.current.disconnect();
      window.removeEventListener('resize', updateCanAnnotateFromImage);
      window.removeEventListener('resize', updateCanAnnotateFromPdf);
    };
  }, [imageLoaded, numPages]);

  // If content becomes too small, ensure annotation mode is turned off to avoid UI confusion
  useEffect(() => {
    if (!canAnnotate && annotationMode) {
      setAnnotationMode(false);
    }
  }, [canAnnotate, annotationMode]);

  // Decide whether the marking buttons should be moved below the content if the display area is small
  useEffect(() => {
    const contentEl = pagesContainerRef.current;
    if (!contentEl) return;

    const updateMarkingPosition = () => {
      const rect = contentEl.getBoundingClientRect();
      const tooSmall = rect.width < MIN_MARKING_CONTENT_WIDTH || rect.height < MIN_MARKING_CONTENT_HEIGHT;
      setShowMarkingBelow(tooSmall);
    };

    updateMarkingPosition();
    window.addEventListener('resize', updateMarkingPosition);
    const ro = new ResizeObserver(updateMarkingPosition);
    ro.observe(contentEl);

    return () => {
      window.removeEventListener('resize', updateMarkingPosition);
      ro.disconnect();
    };
  }, [imageLoaded, numPages]);

  // Persist pen/eraser settings and color to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PEN_KEY, String(penSize));
      localStorage.setItem(STORAGE_ERASER_KEY, String(eraserSize));
      localStorage.setItem(STORAGE_COLOR_KEY, drawColor);
    } catch (e) {
      // ignore storage errors
    }
  }, [penSize, eraserSize, drawColor]);

  // Restore saved annotation when content, image load, or annotation mode changes
  useEffect(() => {
    const annotationToRestore = markSchemeOpen ? savedMarkSchemeAnnotation : savedAnnotation;
    if (!annotationToRestore) return;
    
    // Delay restoration to allow canvases to be properly sized
    const restoreTimer = setTimeout(() => {
      // For PDFs: restore to the first page's annotation canvas
      const firstPageRef = canvasRefsMap.current.get(1);
      if (firstPageRef?.annotationCanvas) {
        const canvas = firstPageRef.annotationCanvas;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const img = new Image();
          img.onload = () => {
            // Draw saved annotation into the annotation canvas, scaled to canvas size
            try {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            } catch (e) {
              // fallback to default draw
              ctx.drawImage(img, 0, 0);
            }
          };
          img.onerror = () => console.warn('Failed to restore annotation');
          img.src = annotationToRestore;
        }
      }
      
      // For images: restore to image annotation canvas
      if (annotationCanvasRef.current && imageLoaded) {
        const canvas = annotationCanvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const img = new Image();
          img.onload = () => {
            try {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            } catch (e) {
              ctx.drawImage(img, 0, 0);
            }
          };
          img.onerror = () => console.warn('Failed to restore annotation');
          img.src = annotationToRestore;
        }
      }
    }, 50);
    
    return () => clearTimeout(restoreTimer);
  }, [savedAnnotation, savedMarkSchemeAnnotation, imageLoaded, numPages, markSchemeOpen, annotationMode]);

  useEffect(() => {
    if (!annotationMode) return;
    setTimeout(() => {
      canvasRefsMap.current.forEach((pageRef) => {
        if (pageRef.canvas && pageRef.annotationCanvas) {
          pageRef.annotationCanvas.width = pageRef.canvas.width;
          pageRef.annotationCanvas.height = pageRef.canvas.height;
        }
      });
      // Size image annotation canvas to match image
      if (effectiveType === 'image' && imageRef.current && annotationCanvasRef.current) {
        annotationCanvasRef.current.width = imageRef.current.naturalWidth;
        annotationCanvasRef.current.height = imageRef.current.naturalHeight;
      }
    }, 0);
  }, [annotationMode, numPages, effectiveType, imageLoaded, markSchemeOpen]);

  // Render all PDF pages
  useEffect(() => {
    if (effectiveType !== 'pdf') return;
    const signal = abortControllerRef.current?.signal;

    const renderAllPages = async () => {
      if (!pdfRef.current || !numPages) return;
      try {
        setLoading(true);
        // Wait for canvas elements to be rendered to the DOM
        await new Promise((resolve) => setTimeout(resolve, 0));

        if (signal?.aborted) return;

        // Save current annotation before rendering new PDF
        let savedAnnotationData: string | null = null;
        const firstPageRef = canvasRefsMap.current.get(1);
        if (firstPageRef?.annotationCanvas) {
          savedAnnotationData = firstPageRef.annotationCanvas.toDataURL();
        }

        // Render page 1 first for immediate visual feedback
        const firstPageRef_render = canvasRefsMap.current.get(1);
        if (firstPageRef_render?.canvas) {
          if (signal?.aborted) return;
          const page = await pdfRef.current.getPage(1);
          const viewport = page.getViewport({ scale: ZOOM_SCALE });
          const context = firstPageRef_render.canvas.getContext('2d');
          if (context) {
            firstPageRef_render.canvas.width = viewport.width;
            firstPageRef_render.canvas.height = viewport.height;
            if (firstPageRef_render.annotationCanvas) {
              firstPageRef_render.annotationCanvas.width = viewport.width;
              firstPageRef_render.annotationCanvas.height = viewport.height;
            }
            const renderContext = {
              canvasContext: context,
              viewport: viewport,
            };
            await page.render(renderContext).promise;
          }
          setLoading(false); // Show page 1 immediately
        }

        // Render remaining pages in background
        for (let pageNum = 2; pageNum <= numPages; pageNum++) {
          if (signal?.aborted) return;
          // Yield to browser to keep UI responsive
          await new Promise(resolve => setTimeout(resolve, 0));
          
          const pageRef = canvasRefsMap.current.get(pageNum);
          const canvas = pageRef?.canvas;
          const annotationCanvas = pageRef?.annotationCanvas;
          if (!canvas) continue;
          const page = await pdfRef.current.getPage(pageNum);
          const viewport = page.getViewport({ scale: ZOOM_SCALE });
          const context = canvas.getContext('2d');
          if (!context) continue;
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          if (annotationCanvas) {
            annotationCanvas.width = viewport.width;
            annotationCanvas.height = viewport.height;
          }
          const renderContext = {
            canvasContext: context,
            viewport: viewport,
          };
          await page.render(renderContext).promise;
        }

        // Restore annotation after rendering
        if (savedAnnotationData && firstPageRef?.annotationCanvas) {
          const ctx = firstPageRef.annotationCanvas.getContext('2d');
          if (ctx) {
            const img = new Image();
            img.onload = () => {
              if (!signal?.aborted) ctx.drawImage(img, 0, 0);
            };
            img.src = savedAnnotationData;
          }
        }

        setError(null);
      } catch (err) {
        if (signal?.aborted) return;
        setError('Failed to render pages');
        console.error('Error rendering pages:', err);
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    };
    renderAllPages();
  }, [numPages, effectiveType, effectiveUrl]);

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    return { x, y };
  };

  const getImageCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    return { x, y };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>, pageNum: number) => {
    if (!annotationMode) return;
    // Only respond to left-click
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDrawing(true);
    setCurrentDrawingPageNum(pageNum);
    const pageRef = canvasRefsMap.current.get(pageNum);
    const canvas = pageRef?.annotationCanvas;
    if (!canvas) return;
    const { x, y } = getCanvasCoords(e, canvas);
    lastPointRef.current = { x, y };
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const startImageDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!annotationMode) return;
    // Only respond to left-click
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDrawing(true);
    setCurrentDrawingPageNum(1);
    const canvas = annotationCanvasRef.current;
    if (!canvas) return;
    const { x, y } = getImageCanvasCoords(e, canvas);
    lastPointRef.current = { x, y };
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>, pageNum: number) => {
    if (!isDrawing || !annotationMode || currentDrawingPageNum !== pageNum) return;
    e.preventDefault();
    e.stopPropagation();
    const pageRef = canvasRefsMap.current.get(pageNum);
    const canvas = pageRef?.annotationCanvas;
    if (!canvas) return;
    const { x, y } = getCanvasCoords(e, canvas);
    const ctx = canvas.getContext('2d');
    if (ctx && lastPointRef.current) {
      if (drawMode === 'pen') {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = drawColor;
        // scale pen size to canvas pixel ratio so visual thickness matches across PDFs/images
        const rect = canvas.getBoundingClientRect();
        const scale = canvas.width / rect.width || 1;
        ctx.lineWidth = penSize * scale;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        if (lastPointRef.current.x === x && lastPointRef.current.y === y) {
          ctx.beginPath();
          ctx.arc(x, y, (penSize / 2) * scale, 0, 2 * Math.PI);
          ctx.fillStyle = drawColor;
          ctx.fill();
        }
        ctx.beginPath();
        ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
        ctx.lineTo(x, y);
        ctx.stroke();
        lastPointRef.current = { x, y };
      } else if (drawMode === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        const rect = canvas.getBoundingClientRect();
        const scale = canvas.width / rect.width || 1;
        ctx.lineWidth = eraserSize * scale;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
        ctx.lineTo(x, y);
        ctx.stroke();
        lastPointRef.current = { x, y };
        ctx.globalCompositeOperation = 'source-over';
      }
    }
  };

  const drawImage = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !annotationMode || currentDrawingPageNum !== 1) return;
    e.preventDefault();
    e.stopPropagation();
    const canvas = annotationCanvasRef.current;
    if (!canvas) return;
    const { x, y } = getImageCanvasCoords(e, canvas);
    const ctx = canvas.getContext('2d');
    if (ctx && lastPointRef.current) {
      if (drawMode === 'pen') {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = drawColor;
        const rect = canvas.getBoundingClientRect();
        const scale = canvas.width / rect.width || 1;
        ctx.lineWidth = penSize * scale;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        if (lastPointRef.current.x === x && lastPointRef.current.y === y) {
          ctx.beginPath();
          ctx.arc(x, y, (penSize / 2) * scale, 0, 2 * Math.PI);
          ctx.fillStyle = drawColor;
          ctx.fill();
        }
        ctx.beginPath();
        ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
        ctx.lineTo(x, y);
        ctx.stroke();
        lastPointRef.current = { x, y };
      } else if (drawMode === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        const rect = canvas.getBoundingClientRect();
        const scale = canvas.width / rect.width || 1;
        ctx.lineWidth = eraserSize * scale;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
        ctx.lineTo(x, y);
        ctx.stroke();
        lastPointRef.current = { x, y };
        ctx.globalCompositeOperation = 'source-over';
      }
    }
  };

  const stopDrawing = (e?: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsDrawing(false);
    setCurrentDrawingPageNum(null);
    lastPointRef.current = null;
    
    // Save annotation after stroke ends
    const canvas = effectiveType === 'pdf'
      ? canvasRefsMap.current.get(1)?.annotationCanvas
      : annotationCanvasRef.current;
    if (canvas) {
      const data = canvas.toDataURL();
      if (markSchemeOpen) {
        if (onSaveMarkSchemeAnnotation) onSaveMarkSchemeAnnotation(data);
      } else {
        if (onSaveAnnotation) onSaveAnnotation(data);
      }
    }
  };

  // Touch-friendly drawing helpers (for mobile/small screens)
  const startDrawingTouch = (e: React.TouchEvent<HTMLCanvasElement>, pageNum: number) => {
    if (!annotationMode) return;
    e.preventDefault();
    setIsDrawing(true);
    setCurrentDrawingPageNum(pageNum);
    const pageRef = canvasRefsMap.current.get(pageNum);
    const canvas = pageRef?.annotationCanvas;
    if (!canvas) return;
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const scale = canvas.width / rect.width || 1;
    const x = (touch.clientX - rect.left) * scale;
    const y = (touch.clientY - rect.top) * scale;
    lastPointRef.current = { x, y };
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const drawTouch = (e: React.TouchEvent<HTMLCanvasElement>, pageNum: number) => {
    if (!isDrawing || !annotationMode || currentDrawingPageNum !== pageNum) return;
    e.preventDefault();
    const pageRef = canvasRefsMap.current.get(pageNum);
    const canvas = pageRef?.annotationCanvas;
    if (!canvas) return;
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const x = (touch.clientX - rect.left) * (canvas.width / rect.width || 1);
    const y = (touch.clientY - rect.top) * (canvas.height / rect.height || 1);
    const ctx = canvas.getContext('2d');
    if (ctx && lastPointRef.current) {
      if (drawMode === 'pen') {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = drawColor;
        const scale = canvas.width / rect.width || 1;
        ctx.lineWidth = penSize * scale;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        if (lastPointRef.current.x === x && lastPointRef.current.y === y) {
          ctx.beginPath();
          ctx.arc(x, y, (penSize / 2) * scale, 0, 2 * Math.PI);
          ctx.fillStyle = drawColor;
          ctx.fill();
        }
        ctx.beginPath();
        ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
        ctx.lineTo(x, y);
        ctx.stroke();
        lastPointRef.current = { x, y };
      } else if (drawMode === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        const scale = canvas.width / rect.width || 1;
        ctx.lineWidth = eraserSize * scale;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
        ctx.lineTo(x, y);
        ctx.stroke();
        lastPointRef.current = { x, y };
        ctx.globalCompositeOperation = 'source-over';
      }
    }
  };

  const startImageDrawingTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!annotationMode) return;
    e.preventDefault();
    setIsDrawing(true);
    setCurrentDrawingPageNum(1);
    const canvas = annotationCanvasRef.current;
    if (!canvas) return;
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const x = (touch.clientX - rect.left) * (canvas.width / rect.width || 1);
    const y = (touch.clientY - rect.top) * (canvas.height / rect.height || 1);
    lastPointRef.current = { x, y };
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const drawImageTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !annotationMode || currentDrawingPageNum !== 1) return;
    e.preventDefault();
    const canvas = annotationCanvasRef.current;
    if (!canvas) return;
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const x = (touch.clientX - rect.left) * (canvas.width / rect.width || 1);
    const y = (touch.clientY - rect.top) * (canvas.height / rect.height || 1);
    const ctx = canvas.getContext('2d');
    if (ctx && lastPointRef.current) {
      if (drawMode === 'pen') {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = drawColor;
        const scale = canvas.width / rect.width || 1;
        ctx.lineWidth = penSize * scale;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        if (lastPointRef.current.x === x && lastPointRef.current.y === y) {
          ctx.beginPath();
          ctx.arc(x, y, (penSize / 2) * scale, 0, 2 * Math.PI);
          ctx.fillStyle = drawColor;
          ctx.fill();
        }
        ctx.beginPath();
        ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
        ctx.lineTo(x, y);
        ctx.stroke();
        lastPointRef.current = { x, y };
      } else if (drawMode === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        const scale = canvas.width / rect.width || 1;
        ctx.lineWidth = eraserSize * scale;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
        ctx.lineTo(x, y);
        ctx.stroke();
        lastPointRef.current = { x, y };
        ctx.globalCompositeOperation = 'source-over';
      }
    }
  };

  const stopDrawingTouch = () => {
    // reuse stop logic which also saves the annotation
    stopDrawing();
  };

  // --- Zoom modal helpers ---
  const absUrl = (u: string) => u.startsWith('/') ? new URL(u, window.location.origin).href : u;

  // Load modal content for a specific question index (uses questionList if provided)
  const loadModalForQuestion = async (index: number, mode: 'question' | 'markscheme' = 'question') => {
    setModalPages([]);
    setModalLoading(false);
    setModalMode(mode);

    const q = (questionList && questionList[index]) || null;
    if (q) {
      const url = mode === 'question' ? (q.questionContent || '') : (q.markScheme || '');
      const type = mode === 'question' ? (q.questionContentType || 'image') : (q.markSchemeType || 'image');
      if (!url) {
        setZoomImageSrc(null);
        return;
      }
      if (type === 'image') {
        const src = absUrl(url);
        setZoomImageSrc(src);
        setModalPages([src]);
      } else {
        // pdf - render at a larger scale for the modal
        setZoomImageSrc(null);
        await loadPdfPagesForModal(url);
      }
    } else {
      // Fallback to current effective content
      if (mode === 'question') {
        if (effectiveType === 'image') {
          const src = absUrl(effectiveUrl);
          setZoomImageSrc(src);
          setModalPages([src]);
        } else {
          setZoomImageSrc(null);
          await loadPdfPagesForModal(effectiveUrl);
        }
      } else {
        if (markSchemeType === 'image' && markSchemeUrl) {
          setZoomImageSrc(absUrl(markSchemeUrl));
          setModalPages([absUrl(markSchemeUrl)]);
        } else if (markSchemeType === 'pdf' && markSchemeUrl) {
          setZoomImageSrc(null);
          await loadPdfPagesForModal(markSchemeUrl);
        }
      }
    }
  };

  const openZoomModal = async () => {
    // If a question index is provided, start from that question
    const startIndex = typeof questionIndex === 'number' ? questionIndex : 0;
    setModalQuestionIndex(startIndex);
    await loadModalForQuestion(startIndex, 'question');
    setZoomOpen(true);
    // Scroll to top after modal opens
    setTimeout(() => {
      if (modalContentRef.current) {
        modalContentRef.current.scrollTop = 0;
      }
    }, 0);
  };

  const closeZoomModal = () => {
    // View-only modal: don't save or change annotations from within the zoom view
    setZoomOpen(false);
    setModalZoom(1); // Reset zoom when closing modal
    // If main content is too small, disable annotation mode
    if (!canAnnotate) setAnnotationMode(false);
  }; 

  // Gesture handlers (mouse & touch) to open zoom modal
  const startLongPress = (e?: React.MouseEvent | React.TouchEvent) => {
    if (annotationMode) return; // don't intercept drawing
    longPressActiveRef.current = false;
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    longPressTimerRef.current = window.setTimeout(() => {
      longPressActiveRef.current = true;
      openZoomModal();
    }, LONG_PRESS_MS);
  };

  const cancelLongPress = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    longPressActiveRef.current = false;
  };

  const handleDoubleTap = () => {
    if (annotationMode) return;
    const now = Date.now();
    if (lastTapRef.current && (now - lastTapRef.current) < DOUBLE_TAP_MS) {
      // double-tap detected
      openZoomModal();
      lastTapRef.current = null;
    } else {
      lastTapRef.current = now;
    }
  };

  // Zoom modal is view-only: drawing in the zoom modal has been removed to avoid duplicate/accidental annotations.

  // Load PDF pages for modal - same as normal but with higher zoom
  const loadPdfPagesForModal = async (pdfUrl: string) => {
    try {
      setModalLoading(true);
      setModalPages([]);
      let url = pdfUrl;
      if (!url.startsWith('http') && !url.startsWith('blob:')) {
        url = new URL(url, window.location.origin).href;
      }
      
      let pdf: any;
      
      if (shouldUseR2(pdfUrl) && !disableR2) {
        const r2Url = await resolveFromR2(pdfUrl);
        if (!r2Url) {
          throw new Error(`Could not resolve managed asset URL: ${pdfUrl}`);
        }

        console.log('[loadPdfPagesForModal] Using assets URL only:', r2Url);
        const blobUrl = await fetchR2AsBlobUrl(r2Url);
        if (blobUrl) {
          pdf = await pdfjs.getDocument({ ...pdfGetDocumentOptions, url: blobUrl }).promise;
        } else {
          pdf = await pdfjs.getDocument({ ...pdfGetDocumentOptions, url: r2Url }).promise;
        }
      } else {
        pdf = await pdfjs.getDocument({ ...pdfGetDocumentOptions, url }).promise;
      }
      
      const total = Math.min(pdf.numPages, 50);
      
      // Get first page to determine target width
      let targetWidth = 1000; // default fallback
      try {
        const firstPage = await pdf.getPage(1);
        const firstViewport = firstPage.getViewport({ scale: 5.0 });
        targetWidth = Math.floor(firstViewport.width);
        console.log('[loadPdfPagesForModal] Target width (from first page at 5.0x):', targetWidth);
      } catch (e) {
        console.warn('[loadPdfPagesForModal] Failed to get first page for width calculation:', e);
      }

      for (let p = 1; p <= total; p++) {
        try {
          const page = await pdf.getPage(p);
          // Get unscaled viewport to calculate aspect ratio
          const unscaled = page.getViewport({ scale: 1.0 });
          // Calculate scale needed to match target width
          const scale = targetWidth / unscaled.width;
          const viewport = page.getViewport({ scale });
          const canvas = document.createElement('canvas');
          // Set canvas width to EXACTLY targetWidth to ensure all pages have identical width
          canvas.width = targetWidth;
          // Compute height based on aspect ratio to preserve proportions
          canvas.height = Math.round(targetWidth * (unscaled.height / unscaled.width));
          const ctx = canvas.getContext('2d');
          if (ctx) {
            // Use the original viewport but set exact canvas dimensions
            // This ensures pdfjs renders all pages consistently at the same pixel width
            const renderContext: any = { canvasContext: ctx, viewport };
            await (page as any).render(renderContext).promise;
            const data = canvas.toDataURL('image/png');
            setModalPages(prev => [...prev, data]);
          }
        } catch (e) {
          console.warn('Failed to render PDF page for modal', p, e);
        }
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    } catch (e) {
      console.error('Error loading pdf for modal:', e);
    } finally {
      setModalLoading(false);
    }
  };

  // Load PDF pages into data URLs progressively (used by modal)
  const loadPdfPages = async (pdfUrl: string) => {
    try {
      setModalLoading(true);
      setModalPages([]);
      let url = pdfUrl;
      if (!url.startsWith('http') && !url.startsWith('blob:')) {
        url = new URL(url, window.location.origin).href;
      }
      
      let pdf: any;
      
      if (shouldUseR2(pdfUrl) && !disableR2) {
        const r2Url = await resolveFromR2(pdfUrl);
        if (!r2Url) {
          throw new Error(`Could not resolve managed asset URL: ${pdfUrl}`);
        }

        console.log('[loadPdfPages] Using assets URL only:', r2Url);
        const blobUrl = await fetchR2AsBlobUrl(r2Url);
        if (blobUrl) {
          pdf = await pdfjs.getDocument({ ...pdfGetDocumentOptions, url: blobUrl }).promise;
        } else {
          pdf = await pdfjs.getDocument({ ...pdfGetDocumentOptions, url: r2Url }).promise;
        }
      } else {
        pdf = await pdfjs.getDocument({ ...pdfGetDocumentOptions, url }).promise;
      }
      
      const total = Math.min(pdf.numPages, 50);
      // Just use simple zoom scale for basic PDF rendering (fallback function)
      const ZOOM_SCALE = 3.0;

      for (let p = 1; p <= total; p++) {
        try {
          const page = await pdf.getPage(p);
          const viewport = page.getViewport({ scale: ZOOM_SCALE });
          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, Math.floor(viewport.width));
          canvas.height = Math.max(1, Math.floor(viewport.height));
          const ctx = canvas.getContext('2d');
          if (ctx) {
            const renderContext: any = { canvasContext: ctx, viewport };
            await (page as any).render(renderContext).promise;
            const data = canvas.toDataURL('image/png');
            setModalPages(prev => [...prev, data]);
          }
        } catch (e) {
          console.warn('Failed to render PDF page for modal', p, e);
        }
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    } catch (e) {
      console.error('Error loading pdf for modal:', e);
    } finally {
      setModalLoading(false);
    }
  };

  // Scroll modal content to top whenever pages load
  useEffect(() => {
    if (modalContentRef.current && modalPages.length > 0) {
      modalContentRef.current.scrollTop = 0;
    }
  }, [modalPages]);

  // Handle Ctrl+scroll zoom in modal (works in Firefox and other browsers)
  useEffect(() => {
    if (!zoomOpen || !modalContentRef.current) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        setModalZoom(prev => {
          const newZoom = e.deltaY > 0 
            ? Math.max(0.5, prev - 0.1) 
            : Math.min(3, prev + 0.1);
          return newZoom;
        });
      }
    };

    const element = modalContentRef.current;
    element.addEventListener('wheel', handleWheel, { passive: false });
    return () => element.removeEventListener('wheel', handleWheel);
  }, [zoomOpen]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && zoomOpen) closeZoomModal();
      if (!zoomOpen) return;
      if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && questionList && questionList.length > 0) {
        if (e.key === 'ArrowLeft') {
          const prev = Math.max(0, modalQuestionIndex - 1);
          if (prev !== modalQuestionIndex) {
            setModalQuestionIndex(prev);
            loadModalForQuestion(prev, modalMode);
            if (onChangeQuestion) onChangeQuestion(prev);
          }
        } else if (e.key === 'ArrowRight') {
          const next = Math.min(questionList.length - 1, modalQuestionIndex + 1);
          if (next !== modalQuestionIndex) {
            setModalQuestionIndex(next);
            loadModalForQuestion(next, modalMode);
            if (onChangeQuestion) onChangeQuestion(next);
          }
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [zoomOpen, modalQuestionIndex, modalMode, questionList, onChangeQuestion]);
  
  // Compute a consistent modal image width so all pages render at the same width
  useEffect(() => {
    if (!zoomOpen) {
      setModalImageWidth(null);
      return;
    }

    const compute = () => {
      try {
        const wrapper = modalWrapperRef.current;
        let avail = Math.min(window.innerWidth * 0.95, 1200);
        if (wrapper) {
          const rect = wrapper.getBoundingClientRect();
          avail = Math.min(rect.width, avail);
        }
        // subtract internal paddings/margins to find content width
        const target = Math.max(320, Math.floor(avail - 48));
        setModalImageWidth(target);
      } catch (e) {
        setModalImageWidth(Math.min(900, Math.floor(window.innerWidth * 0.9)));
      }
    };

    compute();
    const ro = new ResizeObserver(compute);
    if (modalWrapperRef.current) ro.observe(modalWrapperRef.current);
    window.addEventListener('resize', compute);
    return () => {
      try { ro.disconnect(); } catch (e) {}
      window.removeEventListener('resize', compute);
    };
  }, [zoomOpen, modalPages.length]);
  const clearAnnotations = () => {
    canvasRefsMap.current.forEach((pageRef) => {
      if (pageRef.annotationCanvas) {
        const ctx = pageRef.annotationCanvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, pageRef.annotationCanvas.width, pageRef.annotationCanvas.height);
        }
      }
    });
    if (annotationCanvasRef.current) {
      const ctx = annotationCanvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, annotationCanvasRef.current.width, annotationCanvasRef.current.height);
      }
    }
  }; 

  if (error) {
    return (
      <div className="w-full rounded bg-red-100 dark:bg-red-900 p-4 text-red-700 dark:text-red-200">
        <p className="font-semibold">Error loading content</p>
        <p className="text-sm">{error}</p>
        <p className="text-xs mt-2 opacity-75">URL: {url}</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex flex-col min-h-0 h-full overflow-hidden bg-gray-100 dark:bg-gray-900 rounded-lg border border-gray-300 dark:border-gray-700"
    >
      {/* Toolbar */}
      {!hideToolbar && (
      <div className="bg-gray-200 dark:bg-gray-800 p-3 flex items-center justify-between border-b border-gray-300 dark:border-gray-700 sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {loading ? 'Loading...' : (effectiveType === 'pdf' ? `${numPages || '?'} pages` : (markSchemeOpen ? 'Mark Scheme Image' : 'Question Image'))}
          </span>
          {hasMarkScheme && (
            <span className={`text-xs font-semibold px-2 py-1 rounded ${
              markSchemeOpen ? 'bg-orange-500 text-white' : 'bg-blue-500 text-white'
            }`}>
              {markSchemeOpen ? 'MARK SCHEME' : 'QUESTION'}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {hasMarkScheme && (
            <>
              <div className="w-px h-6 bg-gray-400 dark:bg-gray-600" />
              <button
                onClick={() => onToggleMarkScheme && onToggleMarkScheme(!markSchemeOpen)}
                className={`px-3 py-1.5 rounded text-sm transition-colors ${
                  markSchemeOpen
                    ? 'bg-orange-500 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
                title="Toggle mark scheme"
              >
                {markSchemeOpen ? 'Question' : 'Mark Scheme'}
              </button>
            </>
          )}

          {canAnnotate && (
            <button
              onClick={() => setAnnotationMode(prev => !prev)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded text-sm transition-colors ${
                annotationMode
                  ? 'bg-purple-500 text-white'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
              title="Toggle annotation mode"
            >
              <Pen className="w-4 h-4" />
              Annotate
            </button>
          )}  


          {showMarkingButtons && !showMarkingBelow && (
            <>
              <div className="w-px h-6 bg-gray-400 dark:bg-gray-600" />
              <button
                onClick={onMarkCorrect}
                className="px-3 py-1.5 rounded text-sm font-semibold bg-green-500 text-white hover:bg-green-600 transition-colors"
                title="Mark as correct"
              >
                ✓ Correct
              </button>
              <button
                onClick={onMarkIncorrect}
                className="px-3 py-1.5 rounded text-sm font-semibold bg-red-500 text-white hover:bg-red-600 transition-colors"
                title="Mark as incorrect"
              >
                ✗ Wrong
              </button>
            </>
          )} 
        </div>
      </div>
      )}

      {/* Topic Tags Section */}
      {topicTags.length > 0 && !hideToolbar && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800 px-3 py-2 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Topics:</span>
          {topicTags.map((topic, idx) => (
            <span
              key={idx}
              className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
            >
              {topic}
            </span>
          ))}
        </div>
      )}

      {/* Marking buttons moved below content when screen is small */}
      {showMarkingBelow && showMarkingButtons && (
        <div ref={markingButtonsRef} className="mt-4 flex items-center justify-center gap-3">
          <button
            onClick={onMarkCorrect}
            className="px-4 py-2 rounded text-sm font-semibold bg-green-500 text-white hover:bg-green-600 transition-colors"
            title="Mark as correct"
          >
            ✓ Correct
          </button>
          <button
            onClick={onMarkIncorrect}
            className="px-4 py-2 rounded text-sm font-semibold bg-red-500 text-white hover:bg-red-600 transition-colors"
            title="Mark as incorrect"
          >
            ✗ Wrong
          </button>
        </div>
      )}

      {/* Zoom Modal (in-app, opens via long-press or double-click) */}
      {zoomOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black bg-opacity-60 p-6">
          <div ref={modalWrapperRef} className="bg-white dark:bg-gray-900 rounded-lg overflow-hidden max-w-[95vw] max-h-[95vh] w-full" style={{ maxWidth: 1200 }}>
                  <div className="p-3 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold">Large View</h3>
                {modalLoading && (
                  <span className="text-sm text-gray-500">Loading...</span>
                )}
                {/* Show question index when available */}
                {typeof questionIndex === 'number' && questionList && (
                  <span className="text-sm text-gray-500">Question {modalQuestionIndex + 1} of {questionList.length}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {/* Prev/Next question buttons (work when questionList is provided) */}
                {questionList && questionList.length > 0 && (
                  <>
                    <button
                      onClick={async () => {
                        const prev = Math.max(0, modalQuestionIndex - 1);
                        setModalQuestionIndex(prev);
                        await loadModalForQuestion(prev, modalMode);
                        if (onChangeQuestion) onChangeQuestion(prev);
                        // Scroll to top after loading
                        setTimeout(() => {
                          if (modalContentRef.current) modalContentRef.current.scrollTop = 0;
                        }, 0);
                      }}
                      disabled={modalQuestionIndex === 0}
                      className="px-2 sm:px-3 py-1 sm:py-1.5 rounded bg-white dark:bg-gray-800 text-xs sm:text-sm md:text-base text-gray-700 dark:text-gray-200"
                      title="Previous question"
                    >
                      ← Prev
                    </button>
                    <button
                      onClick={async () => {
                        const next = Math.min((questionList?.length || 1) - 1, modalQuestionIndex + 1);
                        setModalQuestionIndex(next);
                        await loadModalForQuestion(next, modalMode);
                        if (onChangeQuestion) onChangeQuestion(next);
                        // Scroll to top after loading
                        setTimeout(() => {
                          if (modalContentRef.current) modalContentRef.current.scrollTop = 0;
                        }, 0);
                      }}
                      disabled={modalQuestionIndex >= (questionList.length - 1)}
                      className="px-2 sm:px-3 py-1 sm:py-1.5 rounded bg-white dark:bg-gray-800 text-xs sm:text-sm md:text-base text-gray-700 dark:text-gray-200"
                      title="Next question"
                    >
                      Next →
                    </button>
                  </>
                )}

                {/* Toggle between Question and Mark Scheme inside modal */}
                {hasMarkScheme && markSchemeUrl && (
                  <button
                    onClick={async () => {
                      const nextMode = modalMode === 'question' ? 'markscheme' : 'question';
                      setModalMode(nextMode);
                      if (questionList && questionList[modalQuestionIndex]) {
                        await loadModalForQuestion(modalQuestionIndex, nextMode);
                      } else {
                        // fallback to effective urls
                        if (nextMode === 'markscheme') {
                          if (markSchemeType === 'pdf' && markSchemeUrl) await loadPdfPages(markSchemeUrl);
                          else if (markSchemeUrl) setModalPages([absUrl(markSchemeUrl)]);
                        } else {
                          if (effectiveType === 'pdf') await loadPdfPages(effectiveUrl);
                          else setModalPages([absUrl(effectiveUrl)]);
                        }
                      }
                      // Scroll to top after loading
                      setTimeout(() => {
                        if (modalContentRef.current) modalContentRef.current.scrollTop = 0;
                      }, 0);
                    }}
                    title="Toggle mark scheme"
                    className="px-2 sm:px-3 py-1 sm:py-1.5 rounded bg-gray-100 dark:bg-gray-800 text-xs sm:text-sm md:text-base text-gray-700 dark:text-gray-200"
                  >
                    {modalMode === 'question' ? 'Mark Scheme' : 'Question'}
                  </button>
                )}

                {/* Zoom controls */}
                <button
                  onClick={() => setModalZoom(prev => Math.max(0.5, prev - 0.1))}
                  className="px-2 sm:px-3 py-1 sm:py-1.5 rounded bg-gray-100 dark:bg-gray-800 text-xs sm:text-sm md:text-base text-gray-700 dark:text-gray-200"
                  title="Zoom out"
                >
                  −
                </button>
                <span className="text-xs text-gray-600 dark:text-gray-400 px-2">{Math.round(modalZoom * 100)}%</span>
                <button
                  onClick={() => setModalZoom(prev => Math.min(3, prev + 0.1))}
                  className="px-2 sm:px-3 py-1 sm:py-1.5 rounded bg-gray-100 dark:bg-gray-800 text-xs sm:text-sm md:text-base text-gray-700 dark:text-gray-200"
                  title="Zoom in"
                >
                  +
                </button>

                <button onClick={closeZoomModal} className="px-2 sm:px-3 py-1 sm:py-1.5 rounded bg-red-500 text-white text-sm">Close</button>
              </div>
            </div>

            <div 
              ref={modalContentRef} 
              className="p-4 overflow-auto flex flex-col items-center justify-start" 
              style={{ minHeight: 320, maxHeight: '72vh' }}
            >
              {modalLoading ? (
                <div className="text-center text-gray-500">Loading pages…</div>
              ) : modalPages.length > 0 ? (
                <div className="flex flex-col items-center gap-6" style={{ transform: `scale(${modalZoom})`, transformOrigin: 'top center', transition: 'transform 0.15s ease-out' }}>
                  {modalPages.map((p, i) => {
                    // Calculate dynamic margins based on zoom level
                    // Higher zoom = less margin, lower zoom = more margin
                    const marginMultiplier = 1 / modalZoom;
                    const marginVw = 5 * marginMultiplier;
                    const marginRem = 1 * marginMultiplier;
                    const widthVw = 10 * marginMultiplier;
                    const widthRem = 2 * marginMultiplier;
                    
                    return (
                      <img
                        key={i}
                        src={p}
                        alt={`Page ${i + 1}`}
                        className="block"
                        style={{
                          maxWidth: `calc(100% - max(${widthVw}vw, ${widthRem}rem))`,
                          height: 'auto',
                          marginLeft: `max(${marginVw}vw, ${marginRem}rem)`,
                          marginRight: `max(${marginVw}vw, ${marginRem}rem)`
                        }}
                      />
                    );
                  })}
                </div>
              ) : zoomImageSrc ? (
                <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
                  <img
                    ref={zoomImageRef}
                    src={zoomImageSrc}
                    alt="Zoomed content"
                    className="block"
                    style={{
                      maxWidth: '100%',
                      height: 'auto',
                      maxHeight: '80vh'
                    }}
                  />
                </div>
              ) : (
                <p className="text-gray-500">Unable to prepare zoom view</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Annotation Tools */}
      {annotationMode && (
        <div className="bg-gray-300 dark:bg-gray-700 p-2 flex items-center gap-2 border-b border-gray-400 dark:border-gray-600">
          <button
            onClick={() => setDrawMode('pen')}
            className={`px-2 py-1 rounded text-sm ${
              drawMode === 'pen'
                ? 'bg-blue-500 text-white'
                : 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200'
            }`}
          >
            Pen
          </button>
          <label className="flex items-center gap-1 text-xs">
            <span>Size</span>
            <input
              type="range"
              min={1}
              max={20}
              value={penSize}
              onChange={e => setPenSize(Number(e.target.value))}
              disabled={drawMode !== 'pen'}
            />
            <span>{penSize}</span>
          </label>
          <button
            onClick={() => setDrawMode('eraser')}
            className={`px-2 py-1 rounded text-sm ${
              drawMode === 'eraser'
                ? 'bg-blue-500 text-white'
                : 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200'
            }`}
          >
            Eraser
          </button>
          <label className="flex items-center gap-1 text-xs">
            <span>Size</span>
            <input
              type="range"
              min={5}
              max={60}
              value={eraserSize}
              onChange={e => setEraserSize(Number(e.target.value))}
              disabled={drawMode !== 'eraser'}
            />
            <span>{eraserSize}</span>
          </label>
          <input
            type="color"
            value={drawColor}
            onChange={(e) => setDrawColor(e.target.value)}
            className="w-8 h-8 cursor-pointer rounded"
            title="Pen color"
          />
          <button
            onClick={clearAnnotations}
            className="px-2 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
          >
            Clear
          </button>
        </div>
      )}

      {/* Content Container */}
      <div
        ref={pagesContainerRef}
        className={`flex-1 min-h-0 w-full bg-gray-50 dark:bg-gray-950 p-0 overflow-y-auto overflow-x-hidden`}
        style={{ minHeight: 0 }}
      >
        <div className="flex flex-col gap-2 items-start w-full justify-start">
          {effectiveType === 'pdf' && numPages ? (
            Array.from({ length: numPages }, (_, i) => i + 1).map((pageNum) => {
              if (!canvasRefsMap.current.has(pageNum)) {
                canvasRefsMap.current.set(pageNum, {
                  canvas: null,
                  annotationCanvas: null
                });
              }

              return (
                <div key={pageNum} className="relative inline-block">
                  <div style={{ position: 'relative', display: 'inline-block' }}
                     onMouseDown={(e) => { if (!annotationMode) startLongPress(); }}
                     onMouseUp={(e) => { if (!annotationMode) { e.preventDefault(); e.stopPropagation(); cancelLongPress(); } }}
                     onMouseLeave={(e) => { if (!annotationMode) { e.preventDefault(); e.stopPropagation(); cancelLongPress(); } }}
                     onTouchStart={(e) => { if (!annotationMode) startLongPress(e); }}
                     onTouchEnd={(e) => { if (!annotationMode) { cancelLongPress(); handleDoubleTap(); } }}
                     onTouchCancel={() => { if (!annotationMode) cancelLongPress(); }}
                >
                    <canvas
                      ref={(el) => {
                        if (el) {
                          const pageRef = canvasRefsMap.current.get(pageNum) || {
                            canvas: null,
                            annotationCanvas: null
                          };
                          pageRef.canvas = el;
                          canvasRefsMap.current.set(pageNum, pageRef);
                        }
                      }}
                      className="bg-white shadow-lg rounded block"
                      style={{
                        height: 'auto',
                        display: 'block',
                        width: '100%'
                      }}
                    />
                    {annotationMode ? (
                      <canvas
                        ref={(el) => {
                          if (el) {
                            const pageRef = canvasRefsMap.current.get(pageNum) || {
                              canvas: null,
                              annotationCanvas: null
                            };
                            pageRef.annotationCanvas = el;
                            canvasRefsMap.current.set(pageNum, pageRef);
                          }
                        }}
                        className="absolute top-0 left-0 cursor-crosshair rounded"
                        style={{
                          display: 'block',
                          pointerEvents: 'auto',
                          width: '100%',
                          height: '100%',
                          zIndex: 10
                        }}
                        onMouseDown={(e) => { e.stopPropagation(); startDrawing(e, pageNum); }}
                        onMouseMove={(e) => { e.stopPropagation(); draw(e, pageNum); }}
                        onMouseUp={(e) => { e.stopPropagation(); stopDrawing(e); }}
                        onMouseLeave={(e) => { e.stopPropagation(); stopDrawing(e); }}
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                        onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}
                        onTouchStart={(e) => { e.stopPropagation(); startDrawingTouch(e, pageNum); }}
                        onTouchMove={(e) => { e.stopPropagation(); drawTouch(e, pageNum); }}
                        onTouchEnd={(e) => { e.stopPropagation(); stopDrawingTouch(); }}
                        onTouchCancel={(e) => { e.stopPropagation(); stopDrawingTouch(); }} 
                      />
                    ) : (
                      // when not annotating, show saved annotation image overlay if available
                      (markSchemeOpen ? savedMarkSchemeAnnotation : savedAnnotation) ? (
                        <img
                          src={markSchemeOpen ? savedMarkSchemeAnnotation as string : savedAnnotation as string}
                          alt="Annotation overlay"
                          className="absolute top-0 left-0 pointer-events-none rounded"
                          style={{
                            display: 'block',
                            width: '100%',
                            height: '100%'
                          }}
                        />
                      ) : null
                    )}
                  </div>
                  <div className="text-center text-sm text-gray-600 dark:text-gray-400 mt-2">
                    Page {pageNum}
                  </div>
                </div>
              );
            })
          ) : effectiveType === 'image' ? (
            <div className="relative inline-block">
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <img
                  ref={imageRef}
                  onLoad={() => {
                    setImageLoaded(true);
                    setLoading(false);
                  }}
                  onError={() => {
                    console.error(`[MediaViewer] Failed to load image from asset URL: ${effectiveUrl}`);
                    setError('Failed to load image from R2 storage');
                    setLoading(false);
                  }}
                  onMouseDown={() => startLongPress()}
                  onMouseUp={() => cancelLongPress()}
                  onMouseLeave={() => cancelLongPress()}
                  onTouchStart={(e) => { startLongPress(e); }}
                  onTouchEnd={(e) => { cancelLongPress(); handleDoubleTap(); }}
                  onTouchCancel={() => cancelLongPress()}
                  className="bg-white shadow-lg rounded max-w-full h-auto"
                  alt="Content"
                  style={{
                    display: 'block',
                    width: '100%'
                  }}
                />
                {annotationMode && imageLoaded ? (
                  <canvas
                    ref={annotationCanvasRef}
                    className="absolute top-0 left-0 cursor-crosshair rounded"
                    style={{
                      display: 'block',
                      pointerEvents: 'auto',
                      width: '100%',
                      height: '100%',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      zIndex: 10
                    }}
                    width={imageRef.current?.width || 0}
                    height={imageRef.current?.height || 0}
                    onMouseDown={(e) => { e.stopPropagation(); startImageDrawing(e); }}
                    onMouseMove={(e) => { e.stopPropagation(); drawImage(e); }}
                    onMouseUp={(e) => { e.stopPropagation(); stopDrawing(e); }}
                    onMouseLeave={(e) => { e.stopPropagation(); stopDrawing(e); }}
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onTouchStart={(e) => { e.stopPropagation(); startImageDrawingTouch(e); }}
                    onTouchMove={(e) => { e.stopPropagation(); drawImageTouch(e); }}
                    onTouchEnd={(e) => { e.stopPropagation(); stopDrawingTouch(); }}
                    onTouchCancel={(e) => { e.stopPropagation(); stopDrawingTouch(); }}
                  />
                ) : (
                  imageLoaded && (markSchemeOpen ? savedMarkSchemeAnnotation : savedAnnotation) ? (
                    <img
                      src={markSchemeOpen ? savedMarkSchemeAnnotation as string : savedAnnotation as string}
                      alt="Annotation overlay"
                      className="absolute top-0 left-0 pointer-events-none rounded"
                      style={{
                        display: 'block',
                        width: '100%',
                        height: '100%',
                        position: 'absolute',
                        top: 0,
                        left: 0
                      }}
                    />
                  ) : null
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>


    </div>
  );
};

export default MediaViewer;
 