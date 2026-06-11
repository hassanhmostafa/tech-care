import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // Check if already installed
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) return;

    // Check if dismissed before
    const dismissed = sessionStorage.getItem("pwa-install-dismissed");
    if (dismissed) return;

    // Detect iOS
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    setIsIOS(ios);

    if (ios) {
      // Show iOS instructions after a short delay
      setTimeout(() => setShowBanner(true), 3000);
      return;
    }

    // Listen for Android/Chrome install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShowBanner(true), 3000);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    sessionStorage.setItem("pwa-install-dismissed", "1");
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Install Banner */}
      <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
        <div className="bg-white border border-cyan-200 rounded-2xl shadow-xl p-4 flex items-start gap-3">
          {/* App Icon */}
          <img
            src="https://d2xsxph8kpxj0f.cloudfront.net/310519663052167250/adQspJefUTFqKyf6yHum6G/pwa-icon-512-Njw5mfjYVQrS2JHikUmEfa.png"
            alt="Tech Care"
            className="w-12 h-12 rounded-xl flex-shrink-0"
          />

          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 text-sm">Install Tech Care</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Add to your home screen for quick access to your health data
            </p>

            {isIOS ? (
              <button
                onClick={() => setShowIOSInstructions(true)}
                className="mt-2 text-xs font-medium text-cyan-600 underline"
              >
                How to install on iPhone
              </button>
            ) : (
              <Button
                size="sm"
                onClick={handleInstall}
                className="mt-2 h-7 text-xs bg-cyan-500 hover:bg-cyan-600 text-white gap-1"
              >
                <Download className="w-3 h-3" />
                Install
              </Button>
            )}
          </div>

          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 flex-shrink-0 mt-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* iOS Instructions Modal */}
      {showIOSInstructions && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Install on iPhone</h3>
              <button onClick={() => setShowIOSInstructions(false)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <ol className="space-y-3 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-cyan-100 text-cyan-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                <span>Tap the <strong>Share</strong> button at the bottom of Safari (the square with an arrow pointing up)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-cyan-100 text-cyan-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                <span>Scroll down and tap <strong>"Add to Home Screen"</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-cyan-100 text-cyan-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                <span>Tap <strong>"Add"</strong> in the top right corner</span>
              </li>
            </ol>
            <Button
              className="w-full mt-5 bg-cyan-500 hover:bg-cyan-600 text-white"
              onClick={() => { setShowIOSInstructions(false); handleDismiss(); }}
            >
              Got it
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
