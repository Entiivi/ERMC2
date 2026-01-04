"use client";

import { useEffect, useMemo, useRef } from "react";

type Lang = "LT" | "EN";

export function ServicesPreviewPanel({ lang }: { lang: Lang }) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const frontendBase =
    process.env.NEXT_PUBLIC_FRONTEND_URL ?? "https://localhost:3000";

  const src = useMemo(() => {
    // be ?lang=... nes lang siųsim per postMessage
    return `${frontendBase}/preview/services`;
  }, [frontendBase]);

  const sendLang = () => {
    iframeRef.current?.contentWindow?.postMessage(
      { type: "PREVIEW_LANG", lang },
      frontendBase
    );
  };

  useEffect(() => {
    sendLang();
  }, [lang]); // kai admin'e pasikeičia lang -> nusiunčiam į preview

  return (
    <div className="rounded-2xl bg-white/70 p-4">
      <div className="h-[520px] rounded-xl overflow-hidden bg-white">
        <iframe
          ref={iframeRef}
          src={src}
          onLoad={sendLang} // kad gautų pradinį lang po užkrovimo
          className="block w-full h-full border-0 outline-none bg-transparent"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    </div>
  );
}
