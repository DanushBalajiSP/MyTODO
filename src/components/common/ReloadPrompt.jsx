import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCw, X } from 'lucide-react';

const ReloadPrompt = () => {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needUpdate: [needUpdate, setNeedUpdate],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered: ', r);
    },
    onRegisterError(error) {
      console.error('SW registration error', error);
    },
  });

  const close = () => {
    setOfflineReady(false);
    setNeedUpdate(false);
  };

  if (!offlineReady && !needUpdate) return null;

  return (
    <div className="reload-prompt">
      <div className="reload-prompt__card">
        <div className="reload-prompt__content">
          <div className="reload-prompt__icon">
             <RefreshCw size={20} className={needUpdate ? 'animate-spin' : ''} />
          </div>
          <div className="reload-prompt__text">
            {offlineReady ? (
              <span>App is ready to work offline</span>
            ) : (
              <span>New version available! Update now?</span>
            )}
          </div>
        </div>
        <div className="reload-prompt__actions">
          {needUpdate && (
            <button className="btn btn--primary btn--sm" onClick={() => updateServiceWorker(true)}>
              Update
            </button>
          )}
          <button className="reload-prompt__close" onClick={close}>
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReloadPrompt;
