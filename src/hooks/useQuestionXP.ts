import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { XP_RULES } from '../lib/xp-rules';

export function useQuestionXP(questionId: string) {
  const viewDurationRef = useRef(0);
  const sawQuestionRef = useRef(false);
  const sawMSRef = useRef(false);
  const hasTriggeredRef = useRef(false);
  
  useEffect(() => {
    if (!questionId) return;
    
    // Reset refs when question changes
    viewDurationRef.current = 0;
    sawQuestionRef.current = false;
    sawMSRef.current = false;
    hasTriggeredRef.current = false;
    
    const interval = setInterval(async () => {
      // Accumulate time only if document is visible
      if (document.visibilityState === 'visible') {
        viewDurationRef.current += 1;
      }
      
      const duration = viewDurationRef.current;
      const sawQuestion = sawQuestionRef.current;
      const sawMS = sawMSRef.current;
      
      if (
        !hasTriggeredRef.current && 
        duration >= XP_RULES.question_view.minViewDuration && 
        sawQuestion && 
        sawMS
      ) {
        hasTriggeredRef.current = true;
        
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) return;
          
          await fetch('/api/xp/heartbeat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify({
              action: 'question_view',
              refId: questionId,
              duration,
              sawQuestion,
              sawMS
            })
          });
        } catch (error) {
          console.error('Failed to send question_view heartbeat', error);
          hasTriggeredRef.current = false; // Allow retrying if failed
        }
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [questionId]);
  
  return {
    markQuestionSeen: () => { sawQuestionRef.current = true; },
    markMSSeen: () => { sawMSRef.current = true; }
  };
}
