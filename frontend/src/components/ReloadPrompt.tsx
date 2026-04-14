import { useRegisterSW } from 'virtual:pwa-register/react';
import toast from 'react-hot-toast';
import { useEffect } from 'react';

export default function ReloadPrompt() {
  const {
    offlineReady: [offlineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r: any) {
      console.log('SW Registered: ' + r)
    },
    onRegisterError(error: any) {
      console.log('SW registration error', error)
    },
  });

  useEffect(() => {
    if (offlineReady) {
      toast.success('App ready to work offline', { id: 'offline-ready' });
    }
  }, [offlineReady]);

  useEffect(() => {
    if (needRefresh) {
      toast((t) => (
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">New update available! Click reload to apply.</span>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => updateServiceWorker(true)}
              className="text-xs font-bold px-3 py-1.5 bg-brand-500 text-white rounded-md cursor-pointer hover:bg-brand-600 transition-colors"
            >
              Reload
            </button>
            <button
              onClick={() => { setNeedRefresh(false); toast.dismiss(t.id); }}
              className="text-xs font-semibold px-3 py-1.5 border border-border rounded-md cursor-pointer hover:bg-muted transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      ), { duration: Infinity, id: 'need-refresh' });
    }
  }, [needRefresh, updateServiceWorker, setNeedRefresh]);

  return null;
}
