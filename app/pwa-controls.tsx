'use client';
import { useEffect, useRef, useState } from 'react';
import { Download, RefreshCw, WifiOff, X } from 'lucide-react';

type InstallPrompt = Event & {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

export default function PwaControls() {
  const [installed, setInstalled] = useState(false);
  const [prompt, setPrompt] = useState<InstallPrompt | null>(null);
  const [help, setHelp] = useState(false);
  const [offline, setOffline] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null);
  const [reloading, setReloading] = useState(false);
  const reloadRequested = useRef(false);

  useEffect(() => {
    let disposed = false;
    let registration: ServiceWorkerRegistration | undefined;
    const display = matchMedia('(display-mode: standalone)');
    const detectInstalled = () => setInstalled(display.matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone));
    const connectivity = () => setOffline(!navigator.onLine);
    const capturePrompt = (event: Event) => { event.preventDefault(); setPrompt(event as InstallPrompt); };
    const onInstalled = () => { setInstalled(true); setPrompt(null); setHelp(false); };
    const onController = () => {
      if (reloadRequested.current) location.reload();
      else setReady(true);
    };
    const checkUpdate = () => {
      if (document.visibilityState === 'visible' && navigator.onLine) registration?.update().catch(() => {});
    };
    detectInstalled(); connectivity();
    display.addEventListener('change', detectInstalled);
    window.addEventListener('online', connectivity);
    window.addEventListener('offline', connectivity);
    window.addEventListener('beforeinstallprompt', capturePrompt);
    window.addEventListener('appinstalled', onInstalled);
    document.addEventListener('visibilitychange', checkUpdate);
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.addEventListener('controllerchange', onController);
      navigator.serviceWorker.register('/sw.js', { scope: '/', updateViaCache: 'none' }).then(reg => {
        if (disposed) return;
        registration = reg;
        setReady(Boolean(reg.active));
        if (reg.waiting) setWaiting(reg.waiting);
        const watch = () => {
          const worker = reg.installing;
          if (!worker) return;
          worker.addEventListener('statechange', () => {
            if (disposed) return;
            if (worker.state === 'installed' && reg.waiting && navigator.serviceWorker.controller) setWaiting(reg.waiting);
            if (worker.state === 'activated') { setReady(true); setFailed(false); }
            if (worker.state === 'redundant' && !reg.active) setFailed(true);
          });
        };
        watch(); reg.addEventListener('updatefound', watch);
      }).catch(() => { if (!disposed) setFailed(true); });
    }
    return () => {
      disposed = true;
      display.removeEventListener('change', detectInstalled);
      window.removeEventListener('online', connectivity);
      window.removeEventListener('offline', connectivity);
      window.removeEventListener('beforeinstallprompt', capturePrompt);
      window.removeEventListener('appinstalled', onInstalled);
      document.removeEventListener('visibilitychange', checkUpdate);
      navigator.serviceWorker?.removeEventListener('controllerchange', onController);
    };
  }, []);

  async function install() {
    if (!prompt) { setHelp(value => !value); return; }
    const current = prompt;
    setPrompt(null);
    try { await current.prompt(); await current.userChoice; }
    catch { setHelp(true); }
  }
  function update() {
    if (!waiting) return;
    // Keep reload explicit: writing drafts may still be in memory.
    if (!window.confirm('Save any answer or note you are editing first. Reload Study Garden to use the new version now?')) return;
    reloadRequested.current = true; setReloading(true);
    waiting.postMessage({ type: 'SKIP_WAITING' });
  }
  return <div className="pwa-tools">
    {!installed && <button className="export" onClick={install} aria-expanded={help}><Download size={15}/>Install Study Garden</button>}
    {help && <div className="pwa-help" role="region" aria-label="Install Study Garden">
      <button className="pwa-close" aria-label="Close installation help" onClick={() => setHelp(false)}><X size={16}/></button>
      <strong>Keep your garden close</strong>
      <p><b>iPhone / iPad:</b> Open this website in Safari → Share → Add to Home Screen → Add. If shown, keep “Open as Web App” on.</p>
      <p><b>Android / computer:</b> Use your browser menu → Install app or Add to Home screen.</p>
      <p>Your saved work is stored on this device. Use Export my study data and Restore a backup to move it to another browser or installed app.</p>
    </div>}
    <p className="pwa-status" role="status">{offline ? <><WifiOff size={13}/>Offline · {ready ? 'your notes are ready' : 'reconnect to prepare notes'}</> : ready ? 'Notes ready for offline reading' : failed ? 'Offline setup incomplete. Reconnect and reopen to retry.' : 'Open online once to prepare offline reading.'}</p>
    {waiting && <div className="pwa-update"><p>A new version of your garden is ready.</p><button className="export" onClick={update} disabled={reloading}><RefreshCw size={14}/>{reloading ? 'Updating…' : 'Reload to update'}</button></div>}
  </div>;
}
