import { useCallback, useRef, useState } from 'react';
import {
  exportCanvasAnnotation,
  StoredAnnotationPage,
} from './pdfIndexedDBStorage';

type HistoryEntry = {
  pageNumber: number;
  imageData: ImageData;
};

export function usePdfAnnotationHistory() {
  const pastRef = useRef<HistoryEntry[]>([]);
  const futureRef = useRef<HistoryEntry[]>([]);
  const canvasMapRef = useRef<Map<number, HTMLCanvasElement>>(new Map());
  const cachedPagesRef = useRef<Record<number, StoredAnnotationPage>>({});
  const dirtyPagesRef = useRef<Set<number>>(new Set());
  const drawingPagesRef = useRef<Set<number>>(new Set());
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const syncAvailability = useCallback(() => {
    setCanUndo(pastRef.current.length > 0);
    setCanRedo(futureRef.current.length > 0);
  }, []);

  const isDrawingActive = useCallback(() => {
    return drawingPagesRef.current.size > 0;
  }, []);

  const setPageDrawingActive = useCallback((pageNumber: number, active: boolean) => {
    if (active) {
      drawingPagesRef.current.add(pageNumber);
    } else {
      drawingPagesRef.current.delete(pageNumber);
    }
  }, []);

  const registerCanvas = useCallback((pageNumber: number, canvas: HTMLCanvasElement | null) => {
    if (canvas) {
      canvasMapRef.current.set(pageNumber, canvas);
      return;
    }

    if (drawingPagesRef.current.has(pageNumber)) {
      return;
    }

    const existing = canvasMapRef.current.get(pageNumber);
    if (existing) {
      const exported = exportCanvasAnnotation(existing, {
        skipContentCheck: dirtyPagesRef.current.has(pageNumber),
      });
      if (exported) {
        cachedPagesRef.current[pageNumber] = exported;
      }
    }
    canvasMapRef.current.delete(pageNumber);
  }, []);

  const getCachedPage = useCallback((pageNumber: number) => {
    return cachedPagesRef.current[pageNumber] ?? null;
  }, []);

  const resetCache = useCallback(() => {
    cachedPagesRef.current = {};
    dirtyPagesRef.current.clear();
    drawingPagesRef.current.clear();
  }, []);

  const markSaved = useCallback(() => {
    dirtyPagesRef.current.clear();
    setIsDirty(false);
  }, []);

  const pushAction = useCallback((pageNumber: number, beforeSnapshot: ImageData) => {
    pastRef.current.push({ pageNumber, imageData: beforeSnapshot });
    futureRef.current = [];
    dirtyPagesRef.current.add(pageNumber);
    setIsDirty(true);
    syncAvailability();
  }, [syncAvailability]);

  const restoreSnapshot = useCallback((pageNumber: number, snapshot: ImageData) => {
    const canvas = canvasMapRef.current.get(pageNumber);
    if (!canvas) return null;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    if (
      snapshot.width !== canvas.width ||
      snapshot.height !== canvas.height
    ) {
      return null;
    }
    return ctx.getImageData(0, 0, canvas.width, canvas.height);
  }, []);

  const applySnapshot = useCallback((pageNumber: number, snapshot: ImageData) => {
    const canvas = canvasMapRef.current.get(pageNumber);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    if (
      snapshot.width !== canvas.width ||
      snapshot.height !== canvas.height
    ) {
      return;
    }
    ctx.putImageData(snapshot, 0, 0);
    dirtyPagesRef.current.add(pageNumber);
  }, []);

  const undo = useCallback(() => {
    const entry = pastRef.current.pop();
    if (!entry) return;

    const current = restoreSnapshot(entry.pageNumber, entry.imageData);
    if (current) {
      futureRef.current.push({ pageNumber: entry.pageNumber, imageData: current });
    }
    applySnapshot(entry.pageNumber, entry.imageData);
    syncAvailability();
  }, [applySnapshot, restoreSnapshot, syncAvailability]);

  const redo = useCallback(() => {
    const entry = futureRef.current.pop();
    if (!entry) return;

    const current = restoreSnapshot(entry.pageNumber, entry.imageData);
    if (current) {
      pastRef.current.push({ pageNumber: entry.pageNumber, imageData: current });
    }
    applySnapshot(entry.pageNumber, entry.imageData);
    syncAvailability();
  }, [applySnapshot, restoreSnapshot, syncAvailability]);

  const clearAll = useCallback(() => {
    canvasMapRef.current.forEach((canvas) => {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    });
    cachedPagesRef.current = {};
    dirtyPagesRef.current.clear();
    pastRef.current = [];
    futureRef.current = [];
    setIsDirty(true);
    syncAvailability();
  }, [syncAvailability]);

  const reset = useCallback(() => {
    pastRef.current = [];
    futureRef.current = [];
    syncAvailability();
  }, [syncAvailability]);

  const exportAll = useCallback(() => {
    const pages: Record<number, StoredAnnotationPage> = { ...cachedPagesRef.current };

    canvasMapRef.current.forEach((canvas, pageNumber) => {
      const isDirtyPage = dirtyPagesRef.current.has(pageNumber);

      if (!isDirtyPage && pages[pageNumber]) {
        return;
      }

      const exported = exportCanvasAnnotation(canvas, {
        skipContentCheck: isDirtyPage,
      });

      if (exported) {
        pages[pageNumber] = exported;
      } else if (isDirtyPage) {
        delete pages[pageNumber];
      }
    });

    return pages;
  }, []);

  return {
    registerCanvas,
    pushAction,
    undo,
    redo,
    clearAll,
    reset,
    resetCache,
    exportAll,
    getCachedPage,
    markSaved,
    isDrawingActive,
    setPageDrawingActive,
    canUndo,
    canRedo,
    isDirty,
  };
}
