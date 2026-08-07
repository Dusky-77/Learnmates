import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { XP_RULES } from '../lib/xp-rules';

export function useXP() {
  const activeTimeRef = useRef(0);
  const scrollTimeRef = useRef(0);
  
  const lastActivePingRef = useRef(Date.now());
  const lastScrollPingRef = useRef(Date.now());
  
  const lastScrollPosRef = useRef(window.scrollY);
  const lastScrollTimeRef = useRef(Date.now());
  
  const isMouseMovingRef = useRef(false);
  const isReachedBottomRef = useRef(false);

  useEffect(() => {
    // Mouse movement tracking
    let mouseTimeout: ReturnType<typeof setTimeout>;
    
    const handleMouseMove = () => {
      isMouseMovingRef.current = true;
      clearTimeout(mouseTimeout);
      mouseTimeout = setTimeout(() => {
        isMouseMovingRef.current = false;
      }, 2000); // Stop considering mouse moving after 2 seconds of inactivity
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(mouseTimeout);
    };
  }, []);

  useEffect(() => {
    // Scroll tracking
    const handleScroll = () => {
      // Only track scrolling on PDF viewer pages
      if (!window.location.pathname.endsWith('.pdf')) {
        return;
      }
      
      const currentScrollPos = window.scrollY;
      const currentTime = Date.now();
      
      const timeDiff = currentTime - lastScrollTimeRef.current;
      const distance = Math.abs(currentScrollPos - lastScrollPosRef.current);
      
      if (timeDiff > 0) {
        const speed = (distance / timeDiff) * 1000; // pixels per second
        
        // If speed is within natural reading speed, accumulate scroll time
        if (speed > 0 && speed < XP_RULES.scrolling.maxScrollSpeed) {
          // Add the time spent scrolling
          scrollTimeRef.current += timeDiff;
        }
      }
      
      // Check if reached bottom
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      if (windowHeight + currentScrollPos >= documentHeight - 100) {
        isReachedBottomRef.current = true;
      }
      
      lastScrollPosRef.current = currentScrollPos;
      lastScrollTimeRef.current = currentTime;
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Active time accumulation interval (runs every second)
    const activeInterval = setInterval(() => {
      const isVisible = document.visibilityState === 'visible';
      
      if (isVisible && isMouseMovingRef.current) {
        activeTimeRef.current += 1000;
      }
    }, 1000);
    
    return () => clearInterval(activeInterval);
  }, []);

  useEffect(() => {
    // API Heartbeat for active time
    const activePingInterval = setInterval(async () => {
      const now = Date.now();
      const timeSinceLastPing = now - lastActivePingRef.current;
      
      // Only send if we have at least some active time
      if (activeTimeRef.current >= 5000) { // arbitrary small threshold
        const duration = Math.floor(activeTimeRef.current / 1000);
        
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
              action: 'active_time',
              duration,
              tabVisible: document.visibilityState === 'visible',
              mouseMoving: isMouseMovingRef.current
            })
          });
          
          // Reset after successful ping
          activeTimeRef.current = 0;
          lastActivePingRef.current = now;
        } catch (error) {
          console.error('Failed to send active time heartbeat', error);
        }
      }
    }, XP_RULES.active_time.checkInterval);
    
    return () => clearInterval(activePingInterval);
  }, []);

  useEffect(() => {
    // API Heartbeat for scrolling
    const scrollPingInterval = setInterval(async () => {
      const now = Date.now();
      
      // Check if we're on a PDF page
      if (!window.location.pathname.endsWith('.pdf')) {
        scrollTimeRef.current = 0;
        isReachedBottomRef.current = false;
        return;
      }

      if (scrollTimeRef.current >= 5000 && isReachedBottomRef.current) {
        const duration = Math.floor(scrollTimeRef.current / 1000);
        
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
              action: 'scrolling',
              duration,
              scrollSpeed: 50, // We already validated speed during accumulation
              reachedBottom: true
            })
          });
          
          // Reset after successful ping
          scrollTimeRef.current = 0;
          isReachedBottomRef.current = false;
          lastScrollPingRef.current = now;
        } catch (error) {
          console.error('Failed to send scroll heartbeat', error);
        }
      }
    }, XP_RULES.scrolling.checkInterval);
    
    return () => clearInterval(scrollPingInterval);
  }, []);
}
