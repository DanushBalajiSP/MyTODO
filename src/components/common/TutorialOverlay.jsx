import { useState, useEffect, useCallback } from 'react';
import { Sparkles, ArrowRight, X } from 'lucide-react';
import Button from './Button';

const TUTORIAL_KEY = 'mytodo_tutorial_completed';

const TUTORIAL_STEPS = [
  {
    id: 'sidebar',
    title: 'Your Workspace',
    body: 'Switch between Notes and Tasks using the sidebar. This is where you organize your day.',
    selector: '.sidebar__nav',
  },
  {
    id: 'add_btn',
    title: 'Create Something',
    body: 'Click the + button to add your first task or note. Stay productive!',
    selector: '.mobile-fab, .header__add-btn',
  },
  {
    id: 'focus',
    title: 'Deep Focus',
    body: 'Need to concentrate? Use the Focus button to start a battle-tested Pomodoro timer.',
    selector: '.header__focus-btn',
  },
  {
    id: 'drafts',
    title: '💡 Pro Tip: Drafts',
    body: 'Type "draft" in any title (e.g. "Draft Plan") to get automatic reminder notifications later!',
    selector: null, // Centered tip
  },
  {
    id: 'reschedule',
    title: 'Quick Reschedule',
    body: 'In a hurry? Use the Alarm icon on any task card to quickly postpone it for later.',
    selector: '.task-card__action-btn', // Points to first alarm button if it exists
  },
];

const TutorialOverlay = () => {
  const [currentStep, setCurrentStep] = useState(-1); // -1 means checking status
  const [spotlight, setSpotlight] = useState(null);

  useEffect(() => {
    const isCompleted = localStorage.getItem(TUTORIAL_KEY);
    if (!isCompleted) {
      // Start tutorial after a short delay
      const timer = setTimeout(() => setCurrentStep(0), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const updateSpotlight = useCallback(() => {
    if (currentStep < 0 || currentStep >= TUTORIAL_STEPS.length) {
      setSpotlight(null);
      return;
    }

    const step = TUTORIAL_STEPS[currentStep];
    if (!step.selector) {
      setSpotlight(null);
      return;
    }

    const element = document.querySelector(step.selector);
    if (element) {
      const rect = element.getBoundingClientRect();
      setSpotlight({
        top: rect.top - 8,
        left: rect.left - 8,
        width: rect.width + 16,
        height: rect.height + 16,
      });
    } else {
      setSpotlight(null);
    }
  }, [currentStep]);

  useEffect(() => {
    updateSpotlight();
    window.addEventListener('resize', updateSpotlight);
    return () => window.removeEventListener('resize', updateSpotlight);
  }, [updateSpotlight]);

  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    localStorage.setItem(TUTORIAL_KEY, 'true');
    setCurrentStep(-1);
  };

  if (currentStep < 0 || currentStep >= TUTORIAL_STEPS.length) return null;

  const step = TUTORIAL_STEPS[currentStep];

  return (
    <>
      <div className="tutorial-overlay" onClick={handleComplete}>
        {spotlight && (
          <div 
            className="tutorial-card__spotlight" 
            style={{
              top: spotlight.top,
              left: spotlight.left,
              width: spotlight.width,
              height: spotlight.height,
            }}
          />
        )}
        
        <div className="tutorial-card" onClick={e => e.stopPropagation()}>
          <div className="tutorial-card__header">
            <Sparkles size={14} />
            Quick Guidance
          </div>
          
          <h3 className="tutorial-card__title">{step.title}</h3>
          <p className="tutorial-card__body">{step.body}</p>
          
          <div className="tutorial-card__footer">
            <span className="tutorial-card__steps">
              Step {currentStep + 1} of {TUTORIAL_STEPS.length}
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button variant="ghost" size="sm" onClick={handleComplete}>
                Skip
              </Button>
              <Button variant="primary" size="sm" icon={ArrowRight} onClick={handleNext}>
                {currentStep === TUTORIAL_STEPS.length - 1 ? 'Finish' : 'Next'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TutorialOverlay;
