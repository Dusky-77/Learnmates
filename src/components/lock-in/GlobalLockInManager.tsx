import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLockInSession } from './LockInContext';
import { LockedScreen } from './LockedScreen';
import { OpenDeviceWidget } from './OpenDeviceWidget';
import { BreakOverlay, TabLeaveOverlay } from './Overlays';
import { supabase } from '../../lib/supabaseClient';

export const GlobalLockInManager: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { sessionState, updateSessionState, endSessionContext, currentDevice, deviceId } = useLockInSession();
  const navigate = useNavigate();

  const handleEndSession = async () => {
    if (!user) return;
    await supabase
      .from('user_devices')
      .update({ status: 'lobby', lock_until: null })
      .eq('user_id', user.id);
      
    await endSessionContext();
    navigate('/lock_in');
  };

  const handleTakeBreak = async () => {
    if (!sessionState) return;
    if (sessionState.breaks_taken >= sessionState.breaks_allowed) return;
    await updateSessionState({ current_break_started_at: new Date().toISOString() });
  };

  const handleEndBreak = async () => {
    if (!sessionState?.current_break_started_at) return;
    const started = new Date(sessionState.current_break_started_at).getTime();
    const now = new Date().getTime();
    const durationMs = now - started;
    
    const isShortBreak = durationMs < 2 * 60 * 1000;
    
    await updateSessionState({
      current_break_started_at: null,
      breaks_taken: isShortBreak ? sessionState.breaks_taken : sessionState.breaks_taken + 1,
      paused_duration_ms: sessionState.paused_duration_ms + durationMs
    });
  };

  useEffect(() => {
    if (!sessionState) return;
    if (currentDevice?.status !== 'locked' && currentDevice?.status !== 'open') return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (!sessionState.current_break_started_at && !sessionState.tab_left_at) {
          updateSessionState({ 
            tab_left_at: new Date().toISOString(),
            tab_left_device_id: deviceId
          });
        }
      } else {
        if (sessionState.tab_left_at && sessionState.tab_left_device_id === deviceId) {
          const leftAt = new Date(sessionState.tab_left_at).getTime();
          const now = new Date().getTime();
          updateSessionState({
            tab_left_at: null,
            tab_left_device_id: null,
            paused_duration_ms: sessionState.paused_duration_ms + (now - leftAt)
          });
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [currentDevice?.status, sessionState, deviceId, updateSessionState]);

  useEffect(() => {
    if (!sessionState) return;
    if (currentDevice?.status !== 'locked' && currentDevice?.status !== 'open') return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      
      if (sessionState.tab_left_at) {
        if (now - new Date(sessionState.tab_left_at).getTime() > 2 * 60 * 1000) {
           handleEndSession();
        }
      }

      if (sessionState.current_break_started_at) {
        if (now - new Date(sessionState.current_break_started_at).getTime() > 10 * 60 * 1000) {
           handleEndSession();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentDevice?.status, sessionState]);

  const isLocked = currentDevice?.status === 'locked' && !!sessionState;
  const isOpen = currentDevice?.status === 'open' && !!sessionState;

  return (
    <>
      {isLocked && sessionState ? (
        <LockedScreen 
          lockUntil={currentDevice.lock_until} 
          onEndSession={handleEndSession} 
          pausedDurationMs={sessionState.paused_duration_ms} 
          onTakeBreak={handleTakeBreak} 
          breaksAllowed={sessionState.breaks_allowed} 
          breaksTaken={sessionState.breaks_taken} 
          isBreak={!!sessionState.current_break_started_at} 
        />
      ) : (
        children
      )}

      {isOpen && !isLocked && sessionState && (
        <OpenDeviceWidget 
           lockUntil={currentDevice.lock_until} 
           pausedDurationMs={sessionState.paused_duration_ms} 
           isBreak={!!sessionState.current_break_started_at}
           onEndSession={handleEndSession}
           onTakeBreak={handleTakeBreak}
           breaksAllowed={sessionState.breaks_allowed}
           breaksTaken={sessionState.breaks_taken}
        />
      )}

      {sessionState?.tab_left_at && (isLocked || isOpen) && (
         <TabLeaveOverlay tabLeftAt={sessionState.tab_left_at} />
      )}
      {sessionState?.current_break_started_at && (isLocked || isOpen) && (
         <BreakOverlay startedAt={sessionState.current_break_started_at} onEndBreak={handleEndBreak} />
      )}
    </>
  );
};
