import React, { useEffect } from 'react';

interface GoogleAdSenseProps {
  adClient?: string;
  adSlot?: string;
  format?: 'auto' | 'fluid' | 'rectangle';
  responsive?: boolean;
  className?: string;
}

/**
 * Component for Google AdSense integration.
 * In a real environment, you would need to include the AdSense script in your index.html:
 * <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX" crossorigin="anonymous"></script>
 */
export const GoogleAdSense: React.FC<GoogleAdSenseProps> = ({ 
  adClient = "ca-pub-PLACEHOLDER", 
  adSlot = "1234567890", 
  format = "auto", 
  responsive = true,
  className = ""
}) => {
  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error("Adsbygoogle error:", e);
    }
  }, []);

  return (
    <div className={`ad-container overflow-hidden ${className}`}>
      {/* Placeholder for development/preview */}
      <div className="bg-zinc-800/50 border border-zinc-700 rounded p-1 flex items-center justify-center min-h-[32px]">
        <ins className="adsbygoogle"
             style={{ display: 'block', textAlign: 'center' }}
             data-ad-client={adClient}
             data-ad-slot={adSlot}
             data-ad-format={format}
             data-full-width-responsive={responsive ? "true" : "false"}></ins>
        <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-tighter">Google Ad Slot</span>
      </div>
    </div>
  );
};
