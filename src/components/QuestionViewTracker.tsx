import React, { useEffect, useRef } from 'react';
import { useQuestionXP } from '../hooks/useQuestionXP';

interface QuestionViewTrackerProps {
  questionId: string;
  children: React.ReactNode;
}

export function QuestionViewTracker({ questionId, children }: QuestionViewTrackerProps) {
  const { markQuestionSeen, markMSSeen } = useQuestionXP(questionId);
  const containerRef = useRef<HTMLDivElement>(null);
  const observedElements = useRef<Set<Element>>(new Set());

  useEffect(() => {
    if (!containerRef.current) return;

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement;
            if (target.dataset.type === 'question') {
              markQuestionSeen();
            } else if (target.dataset.type === 'marking_scheme') {
              markMSSeen();
            }
          }
        });
      },
      { threshold: 0.1 } // Using 10% threshold to ensure it triggers even for large elements
    );

    const observeNewElements = () => {
      if (!containerRef.current) return;
      const elements = containerRef.current.querySelectorAll('[data-type="question"], [data-type="marking_scheme"]');
      elements.forEach(el => {
        if (!observedElements.current.has(el)) {
          intersectionObserver.observe(el);
          observedElements.current.add(el);
        }
      });
    };

    // Initial observation
    observeNewElements();

    // Use MutationObserver to watch for dynamic additions (e.g. marking scheme modal/tab)
    const mutationObserver = new MutationObserver(() => {
      observeNewElements();
    });

    mutationObserver.observe(containerRef.current, {
      childList: true,
      subtree: true
    });

    return () => {
      intersectionObserver.disconnect();
      mutationObserver.disconnect();
      observedElements.current.clear();
    };
  }, [markQuestionSeen, markMSSeen, questionId]); // Added questionId to reset when question changes

  return (
    <div ref={containerRef} className="question-tracker-container w-full h-full flex flex-col">
      {children}
    </div>
  );
}
