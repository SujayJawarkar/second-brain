import { useState, useEffect } from "react";
import { Puzzle, X, ArrowRight } from "lucide-react";

export function ExtensionBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Slight delay so it pops in nicely after load
    const timer = setTimeout(() => {
      const dismissed = localStorage.getItem("extension-banner-dismissed");
      if (!dismissed) {
        setIsVisible(true);
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      localStorage.setItem("extension-banner-dismissed", "true");
    }, 300); // Wait for exit animation
  };

  if (!isVisible && localStorage.getItem("extension-banner-dismissed") === "true") {
    return null;
  }

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-out ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
      }`}
    >
      <div 
        className="bg-card dark:bg-app-2 text-foreground border border-brand/30 shadow-2xl rounded-full px-5 py-3 flex items-center gap-4 max-w-[90vw] w-max group hover:border-brand/60 transition-colors"
        style={{
          boxShadow: "0 20px 40px -10px rgba(var(--brand), 0.15)"
        }}
      >
        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-brand-soft">
          <Puzzle className="w-4 h-4 text-brand" />
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 md:gap-6 min-w-0">
          <p className="text-sm font-medium tracking-tight whitespace-nowrap truncate text-app">
            Capture knowledge anywhere on the web.
          </p>
          <a
            href="https://github.com/SujayJawarkar/second-brain#browser-extension"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-xs font-bold text-brand hover:text-brand/80 transition-colors whitespace-nowrap outline-none"
            onClick={() => {
              // Optionally you could auto-dismiss when clicked
              // dismiss();
            }}
          >
            Get the Browser Extension <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-0.5" />
          </a>
        </div>

        <button 
          onClick={dismiss}
          className="ml-2 w-6 h-6 rounded-full flex items-center justify-center hover:bg-app-3 transition-colors shrink-0 outline-none"
          title="Dismiss"
        >
          <X className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground transition-colors" />
        </button>
      </div>
    </div>
  );
}
