import { createContext, useState, useEffect, useRef, useCallback, useContext } from 'react';

export const FocusContext = createContext(null);

export const useFocus = () => {
  const ctx = useContext(FocusContext);
  if (!ctx) throw new Error('useFocus must be used within FocusProvider');
  return ctx;
};

export const playAlertSound = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    // Pleasant double-beep sound
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880.00, ctx.currentTime + 0.15); // A5
    
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.15);
    
    gainNode.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.2);
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
  } catch(e) {}
};

export const sendNotification = (title, body) => {
  playAlertSound();
  if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
    try { 
      new Notification(title, { 
        body, 
        icon: '/MyTODO/pwa-192x192.png',
        vibrate: [200, 100, 200]
      }); 
    } catch {}
  }
};

const FOCUS_STORAGE_KEY = 'mytodo_focus_state';

const loadState = () => {
  try {
    const saved = localStorage.getItem(FOCUS_STORAGE_KEY);
    if (!saved) return null;
    return JSON.parse(saved);
  } catch { return null; }
};

const saveState = (stateObj) => {
  localStorage.setItem(FOCUS_STORAGE_KEY, JSON.stringify(stateObj));
};

export const FocusProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  // 1. Init from local storage
  const initData = loadState();
  let initPhase = 'idle', initFocusMins = 25, initSecsLeft = 25 * 60, initTotalSecs = 25 * 60, initIsRunning = false, initSessions = 0, initTarget = null;
  
  if (initData) {
    initPhase = initData.phase;
    initFocusMins = initData.focusMins;
    initTotalSecs = initData.totalSeconds;
    initSessions = initData.sessions;
    
    if (initData.isRunning && initData.targetTime) {
      const diffSecs = Math.round((initData.targetTime - Date.now()) / 1000);
      if (diffSecs <= 0) {
        initSecsLeft = 1; // Let the interval trigger the handleComplete naturally
        initIsRunning = true;
        initTarget = initData.targetTime;
      } else {
        initSecsLeft = diffSecs;
        initIsRunning = true;
        initTarget = initData.targetTime;
      }
    } else {
      initSecsLeft = initData.secondsLeft;
      initIsRunning = false;
      initTarget = null;
    }
  }

  const [phase, setPhase]             = useState(initPhase);
  const [focusMins, setFocusMins]     = useState(initFocusMins);
  const [secondsLeft, setSecondsLeft] = useState(initSecsLeft);
  const [totalSeconds, setTotalSecs]  = useState(initTotalSecs);
  const [isRunning, setIsRunning]     = useState(initIsRunning);
  const [sessions, setSessions]       = useState(initSessions);
  const [targetTime, setTargetTime]   = useState(initTarget);

  const intervalRef   = useRef(null);
  const phaseRef      = useRef(phase);
  const focusMinsRef  = useRef(focusMins);
  const sessionsRef   = useRef(sessions);
  const targetTimeRef = useRef(targetTime);

  // Sync refs
  phaseRef.current    = phase;
  focusMinsRef.current = focusMins;
  sessionsRef.current  = sessions;
  targetTimeRef.current = targetTime;

  // Persist state changes
  useEffect(() => {
    saveState({ phase, focusMins, secondsLeft, totalSeconds, isRunning, sessions, targetTime });
  }, [phase, focusMins, secondsLeft, totalSeconds, isRunning, sessions, targetTime]);

  const handleComplete = useCallback((completedPhase) => {
    clearInterval(intervalRef.current);
    setIsRunning(false);
    setTargetTime(null);
    setSecondsLeft(0);

    if (completedPhase === 'focus') {
      setSessions(n => n + 1);
      sendNotification('🎉 Focus complete!', 'Great work! Choose your break.');
      setPhase('break-select');
      setIsOpen(true);
    } else if (completedPhase === 'break') {
      sendNotification('🚀 Break over!', `${sessionsRef.current} sessions done. Keep going!`);
      const secs = focusMinsRef.current * 60;
      setSecondsLeft(secs);
      setTotalSecs(secs);
      setPhase('idle');
      setIsOpen(true);
    }
  }, []);

  useEffect(() => {
    clearInterval(intervalRef.current);
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      if (targetTimeRef.current) {
        const diff = Math.round((targetTimeRef.current - Date.now()) / 1000);
        if (diff <= 0) {
          setSecondsLeft(0);
          const cp = phaseRef.current;
          setTimeout(() => handleComplete(cp), 0);
        } else {
          setSecondsLeft(diff);
        }
      }
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [isRunning, handleComplete]);

  const startFocus = useCallback((mins) => {
    clearInterval(intervalRef.current);
    const m = mins ?? focusMinsRef.current;
    const secs = m * 60;
    const tTime = Date.now() + secs * 1000;
    
    setFocusMins(m);
    setSecondsLeft(secs); 
    setTotalSecs(secs);
    setPhase('focus');
    setTargetTime(tTime);
    setIsRunning(true);
    
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const startBreak = useCallback((mins) => {
    clearInterval(intervalRef.current);
    const secs = mins * 60;
    const tTime = Date.now() + secs * 1000;

    setSecondsLeft(secs); 
    setTotalSecs(secs);
    setPhase('break');
    setTargetTime(tTime);
    setIsRunning(true);
  }, []);

  const togglePause = useCallback(() => {
    setIsRunning(prev => {
      const next = !prev;
      if (next) {
        // Resuming: set new target time based on remaining seconds
        setTargetTime(Date.now() + secondsLeft * 1000);
      } else {
        // Pausing: clear target time
        setTargetTime(null);
      }
      return next;
    });
  }, [secondsLeft]);

  const stopSession = useCallback(() => {
    clearInterval(intervalRef.current);
    setIsRunning(false);
    setTargetTime(null);
    setPhase('idle');
    const secs = focusMinsRef.current * 60;
    setSecondsLeft(secs);
    setTotalSecs(secs);
  }, []);

  const addTime = useCallback((extraMins) => {
    setSecondsLeft(s => {
      const newSecs = s + extraMins * 60;
      if (isRunning) {
        setTargetTime(Date.now() + newSecs * 1000);
      }
      return newSecs;
    });
    setTotalSecs(t => t + extraMins * 60);
  }, [isRunning]);

  const progress    = totalSeconds > 0 ? (1 - secondsLeft / totalSeconds) * 100 : 0;
  const mDisplay    = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const sDisplay    = String(secondsLeft % 60).padStart(2, '0');
  const timeDisplay = `${mDisplay}:${sDisplay}`;
  const isActive    = phase === 'focus' || phase === 'break' || phase === 'break-select';

  return (
    <FocusContext.Provider value={{
      isOpen, setIsOpen,
      phase, focusMins, setFocusMins,
      secondsLeft, totalSeconds, timeDisplay,
      isRunning, sessions, progress, isActive,
      startFocus, startBreak, togglePause, stopSession, addTime,
    }}>
      {children}
    </FocusContext.Provider>
  );
};
