import React, { useEffect } from 'react';

interface InstagramEmbedProps {
  url: string;
}

export default function InstagramEmbed({ url }: InstagramEmbedProps) {
  useEffect(() => {
    const loadScript = () => {
      // @ts-ignore
      if (window.instgrm) {
        // @ts-ignore
        window.instgrm.Embeds.process();
        return;
      }

      if (!document.getElementById('instagram-embed-script')) {
        const script = document.createElement('script');
        script.id = 'instagram-embed-script';
        script.src = "https://www.instagram.com/embed.js";
        script.async = true;
        script.defer = true;
        script.onload = () => {
          // @ts-ignore
          if (window.instgrm) {
            // @ts-ignore
            window.instgrm.Embeds.process();
          }
        };
        document.body.appendChild(script);
      }
    };

    loadScript();
  }, [url]);

  return (
    <div className="w-full flex justify-center overflow-hidden rounded-3xl">
      <blockquote 
        className="instagram-media" 
        data-instgrm-permalink={url}
        data-instgrm-version="14"
        style={{
          background: '#FFF',
          border: '0',
          borderRadius: '24px',
          boxShadow: '0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15)',
          margin: '0',
          maxWidth: '100%',
          minWidth: '326px',
          padding: '0',
          width: '100%',
        }}
      >
        <div style={{ padding: '24px' }}>
          <a 
            href={url}
            style={{
              background: '#FFFFFF',
              lineHeight: '0',
              padding: '0 0',
              textAlign: 'center',
              textDecoration: 'none',
              width: '100%',
            }}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="flex flex-col items-center justify-center py-10 gap-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center animate-pulse">
                <div className="w-6 h-6 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Incorporando Visão...</span>
            </div>
          </a>
        </div>
      </blockquote>
    </div>
  );
}
