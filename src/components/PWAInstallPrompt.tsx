import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallButton(true);
    };

    const installedHandler = () => {
      setIsInstalled(true);
      setShowInstallButton(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', installedHandler);

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowInstallButton(false);
    }
  };



  return (
    <>
      {/* Install Prompt */}
      {showInstallButton && !isInstalled && (
        <div className="fixed bottom-4 left-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50 md:left-auto md:right-4 md:max-w-sm">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-sm">Instalar App</h3>
              <p className="text-xs opacity-90 mt-1">
                Instale o Finança Fácil no seu dispositivo para acesso rápido
              </p>
            </div>
            <div className="flex gap-2 ml-4">
              <button
                onClick={handleInstallClick}
                className="bg-white text-blue-600 px-3 py-1 rounded text-xs font-medium hover:bg-gray-100"
              >
                Instalar
              </button>
              <button
                onClick={() => setShowInstallButton(false)}
                className="text-white/80 hover:text-white text-xs px-2"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}


    </>
  );
}