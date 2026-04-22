import { useContext, useState } from 'react';
import { Zap, X, Flame, Plus } from 'lucide-react';
import { FocusContext } from '../../context/FocusContext';
import { useTasks } from '../../hooks/useTasks';

/* ── constants ───────────────────────────────────────────── */
const FOCUS_PRESETS  = [15, 20, 25, 30, 45, 60];
const BREAK_OPTIONS  = [
  { mins: 5,  icon: '⚡', label: 'Quick Break',   desc: 'Breathe, stretch, hydrate.' },
  { mins: 10, icon: '☕', label: 'Regular Break',  desc: 'Step away from the screen.' },
  { mins: 15, icon: '🌿', label: 'Long Break',     desc: 'Walk, meditate, recharge.'  },
];
const CIRCUMFERENCE = 2 * Math.PI * 54; // SVG ring radius = 54

/* ── Intro screen ───────────────────────────────────────── */
const IntroScreen = ({ focusMins, setFocusMins, onStart }) => {
  const notifDenied   = typeof Notification !== 'undefined' && Notification.permission === 'denied';
  const notifGranted  = typeof Notification !== 'undefined' && Notification.permission === 'granted';

  return (
    <div className="focus-intro">
      <div className="focus-intro__eyebrow">⚡ Deep Focus Mode</div>

      <h2 className="focus-intro__headline">
        Your brain can't multitask.
        <br />
        <em className="focus-intro__headline-em">Make peace with that.</em>
      </h2>

      <p className="focus-intro__body">
        Work in sharp bursts, rest with intention, repeat.
        The <strong>Pomodoro technique</strong> — battle-tested for deep work.
        When you close this window, the timer keeps ticking in the background.
      </p>

      <div className="focus-intro__divider" />

      <p className="focus-intro__duration-label">Choose your focus duration</p>
      <div className="focus-intro__presets">
        {FOCUS_PRESETS.map(m => (
          <button
            key={m}
            className={`focus-preset-btn ${focusMins === m ? 'focus-preset-btn--active' : ''}`}
            onClick={() => setFocusMins(m)}
          >
            {m}<span>m</span>
          </button>
        ))}
      </div>

      <button className="focus-start-btn" onClick={() => onStart(focusMins)}>
        <Zap size={18} /> Start {focusMins}-minute Focus
      </button>

      {!notifGranted && !notifDenied && (
        <button
          className="focus-notif-btn"
          onClick={() => Notification.requestPermission()}
        >
          🔔 Enable notifications for reminders
        </button>
      )}
      {notifDenied && (
        <p className="focus-notif-denied">
          Notifications blocked — enable them in browser settings for session alerts.
        </p>
      )}
    </div>
  );
};

/* ── Timer ring screen ──────────────────────────────────── */
const TimerScreen = ({ phase, timeDisplay, isRunning, progress, sessions, focusTask, onTogglePause, onStop, onAddTime }) => {
  const isFocus   = phase === 'focus';
  const ringColor = isFocus ? 'var(--primary-500)' : 'var(--success)';
  const dashOffset = CIRCUMFERENCE - (progress / 100) * CIRCUMFERENCE;

  return (
    <div className="focus-timer-screen">
      <div className={`focus-phase-badge focus-phase-badge--${isFocus ? 'focus' : 'break'}`}>
        {isFocus ? '⚡ Focusing' : '🌿 Break'}
      </div>

      {focusTask && isFocus && (
        <p className="focus-task-label" title={focusTask.title}>
          {focusTask.title}
        </p>
      )}

      {/* SVG ring */}
      <div className="focus-ring-container">
        <svg className="focus-ring-svg" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" className="focus-ring-track" />
          <circle
            cx="60" cy="60" r="54"
            className="focus-ring-progress"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            style={{ stroke: ringColor }}
          />
        </svg>
        <div className="focus-ring-time">{timeDisplay}</div>
      </div>

      {/* Add-time chips */}
      {isFocus && (
        <div className="focus-addtime-row">
          {[5, 10].map(m => (
            <button key={m} className="focus-addtime-btn" onClick={() => onAddTime(m)}>
              <Plus size={12} /> {m}m
            </button>
          ))}
        </div>
      )}

      <div className="focus-controls">
        <button className="focus-btn focus-btn--secondary" onClick={onStop}>Stop</button>
        <button className="focus-btn focus-btn--primary" onClick={onTogglePause}>
          {isRunning ? 'Pause' : 'Resume'}
        </button>
      </div>

      <p className="focus-sessions">
        <Flame size={14} /> {sessions} session{sessions !== 1 ? 's' : ''} completed
      </p>
    </div>
  );
};

/* ── Break selection screen ─────────────────────────────── */
const BreakSelectScreen = ({ sessions, onSelectBreak, onSkip }) => (
  <div className="focus-break-select">
    <div className="focus-break-select__emoji">🎉</div>
    <h2 className="focus-break-select__title">Session Complete!</h2>
    <p className="focus-break-select__sub">
      {sessions} session{sessions !== 1 ? 's' : ''} done · You've earned a break
    </p>

    <div className="focus-break-options">
      {BREAK_OPTIONS.map(opt => (
        <button
          key={opt.mins}
          className="focus-break-card"
          onClick={() => onSelectBreak(opt.mins)}
        >
          <span className="focus-break-card__icon">{opt.icon}</span>
          <div className="focus-break-card__info">
            <span className="focus-break-card__label">{opt.label}</span>
            <span className="focus-break-card__desc">{opt.desc}</span>
          </div>
          <span className="focus-break-card__mins">{opt.mins} min</span>
        </button>
      ))}
    </div>

    <button className="focus-btn focus-btn--ghost" onClick={onSkip}>
      Skip break → start next session
    </button>
  </div>
);

/* ── Modal shell ────────────────────────────────────────── */
const FocusModal = () => {
  const {
    phase, focusMins, setFocusMins,
    timeDisplay, isRunning, sessions, progress,
    startFocus, startBreak, togglePause, stopSession, addTime,
    setIsOpen,
  } = useContext(FocusContext);

  const { filteredTasks } = useTasks();
  const focusTask = filteredTasks?.find(t => t.status === 'pending') || null;

  const handleClose = () => setIsOpen(false);

  return (
    <div className="focus-overlay" onClick={handleClose}>
      <div className="focus-modal" onClick={e => e.stopPropagation()}>
        <button className="focus-close-btn" onClick={handleClose}><X size={20} /></button>

        {phase === 'idle' && (
          <IntroScreen
            focusMins={focusMins}
            setFocusMins={setFocusMins}
            onStart={startFocus}
          />
        )}

        {(phase === 'focus' || phase === 'break') && (
          <TimerScreen
            phase={phase}
            timeDisplay={timeDisplay}
            isRunning={isRunning}
            progress={progress}
            sessions={sessions}
            focusTask={focusTask}
            onTogglePause={togglePause}
            onStop={stopSession}
            onAddTime={addTime}
          />
        )}

        {phase === 'break-select' && (
          <BreakSelectScreen
            sessions={sessions}
            onSelectBreak={(mins) => { startBreak(mins); }}
            onSkip={() => { startFocus(focusMins); }}
          />
        )}
      </div>
    </div>
  );
};

/* ── Header button ──────────────────────────────────────── */
export const FocusModeButton = () => {
  const { phase, timeDisplay, isRunning, isActive, sessions, setIsOpen } = useContext(FocusContext);

  return (
    <>
      <button
        className={`header__focus-btn ${isActive ? 'header__focus-btn--active' : ''} ${phase === 'break' ? 'header__focus-btn--break' : ''}`}
        onClick={() => setIsOpen(true)}
        title={isActive ? `${phase === 'focus' ? 'Focus' : 'Break'}: ${timeDisplay}` : 'Open Focus Mode'}
      >
        <Zap size={18} />
        {isActive && isRunning
          ? <span className="header__focus-countdown">{timeDisplay}</span>
          : <span>Focus</span>
        }
        {isActive && <span className="header__focus-dot" />}
      </button>
    </>
  );
};

/* ── Focus modal renderer (used in AppLayout) ───────────── */
export const FocusModalRenderer = () => {
  const { isOpen } = useContext(FocusContext);
  return isOpen ? <FocusModal /> : null;
};

/* ── Streak widget (analytics page) ────────────────────── */
const getMidnight = (d) => { const x = new Date(d); x.setHours(0,0,0,0); return x.getTime(); };

export const StreakWidget = () => {
  const { tasks } = useTasks();

  const completedDays = new Set(
    tasks.filter(t => t.completedAt).map(t => getMidnight(t.completedAt))
  );

  const todayMs = getMidnight(new Date());
  const sorted  = Array.from(completedDays).sort((a,b) => b - a);

  let current = 0;
  let cursor  = sorted[0] === todayMs ? todayMs : todayMs - 86400000;
  for (const day of sorted) {
    if (day === cursor) { current++; cursor -= 86400000; }
    else if (day < cursor) break;
  }

  const ascending = Array.from(completedDays).sort((a,b) => a-b);
  let longest = ascending.length ? 1 : 0, run = 1;
  for (let i = 1; i < ascending.length; i++) {
    if (ascending[i] - ascending[i-1] === 86400000) longest = Math.max(longest, ++run);
    else run = 1;
  }

  const completedToday = tasks.filter(t => t.completedAt && getMidnight(t.completedAt) === todayMs).length;

  return (
    <div className="streak-widget">
      <div className="streak-widget__header">
        <Flame size={20} className="streak-widget__icon" />
        <h3 className="streak-widget__title">Streak</h3>
      </div>
      <div className="streak-widget__stats">
        <div className="streak-stat">
          <span className="streak-stat__value" style={{ color: current > 0 ? 'var(--warning)' : undefined }}>{current}</span>
          <span className="streak-stat__label">Current</span>
        </div>
        <div className="streak-stat streak-stat--divider">
          <span className="streak-stat__value">{longest}</span>
          <span className="streak-stat__label">Longest</span>
        </div>
        <div className="streak-stat">
          <span className="streak-stat__value" style={{ color: 'var(--success)' }}>{completedToday}</span>
          <span className="streak-stat__label">Today</span>
        </div>
      </div>
      {current > 0 && (
        <div className="streak-widget__flame-row">
          {Array.from({ length: Math.min(current, 7) }).map((_, i) => (
            <span key={i} className="streak-flame" style={{ opacity: 0.4 + (i+1)/(Math.min(current,7)+1)*0.6 }}>🔥</span>
          ))}
        </div>
      )}
    </div>
  );
};

export default StreakWidget;
