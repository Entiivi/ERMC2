'use client';

import React, { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import { api, PartnerisDTO } from '@/app/lib/api';

type PartnersApiResp = PartnerisDTO[] | { partners: PartnerisDTO[] };

export const KlientaiIrPartneriai: React.FC = () => {
  const [partners, setPartners] = useState<PartnerisDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [err, setErr] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragState = useRef<{ startX: number; scrollLeft: number }>({ startX: 0, scrollLeft: 0 });
  const singleWidthRef = useRef<number>(0);

  // Fetch from DB via API
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const resp = await fetch('http://localhost:4000/partneriai');
        if (!resp.ok) throw new Error('Nepavyko gauti partnerių');
        const data = await resp.json();
        if (!cancelled) setPartners(data);
      } catch (e: unknown) {
        if (!cancelled) setErr(e instanceof Error ? e.message : 'Nepavyko įkelti partnerių');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // nustatom pradinį scroll ir „single“ plotį begaliniam takui
  useEffect(() => {
    const cont = containerRef.current;
    if (!cont) return;

    const calculateWidth = () => {
      const total = cont.scrollWidth;
      const single = total / 3; // nes kartojam 3 kartus
      singleWidthRef.current = single;
      cont.scrollLeft = single;
    };

    calculateWidth();
    window.addEventListener('resize', calculateWidth);
    return () => window.removeEventListener('resize', calculateWidth);
  }, [partners.length]);

  useEffect(() => {
    const cont = containerRef.current;
    if (!cont) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      const dx = e.clientX - dragState.current.startX;
      let newScroll = dragState.current.scrollLeft - dx;
      const single = singleWidthRef.current;
      if (newScroll < single * 0.5) {
        newScroll += single;
        dragState.current.scrollLeft += single;
      } else if (newScroll > single * 1.5) {
        newScroll -= single;
        dragState.current.scrollLeft -= single;
      }
      cont.scrollLeft = newScroll;
    };

    const handleMouseUp = () => {
      if (isDragging) setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  useEffect(() => {
    const cont = containerRef.current;
    if (!cont) return;

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      const touch = e.touches[0];
      const dx = touch.clientX - dragState.current.startX;
      let newScroll = dragState.current.scrollLeft - dx;
      const single = singleWidthRef.current;
      if (newScroll < single * 0.5) {
        newScroll += single;
        dragState.current.scrollLeft += single;
      } else if (newScroll > single * 1.5) {
        newScroll -= single;
        dragState.current.scrollLeft -= single;
      }
      cont.scrollLeft = newScroll;
    };

    const handleTouchEnd = () => {
      if (isDragging) setIsDragging(false);
    };

    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
    return () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const cont = containerRef.current;
    if (!cont) return;
    setIsDragging(true);
    dragState.current.startX = e.clientX;
    dragState.current.scrollLeft = cont.scrollLeft;
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const cont = containerRef.current;
    if (!cont) return;
    setIsDragging(true);
    const touch = e.touches[0];
    dragState.current.startX = touch.clientX;
    dragState.current.scrollLeft = cont.scrollLeft;
  };

  const items = partners.length ? [...partners, ...partners, ...partners] : [];


  return (
    <>
      {loading && <p>Kraunama…</p>}
      {err && <p style={{ color: 'crimson' }}>{err}</p>}

      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        style={{
          display: 'flex',
          flexWrap: 'nowrap',
          gap: '2rem',
          overflowX: 'auto',
          cursor: isDragging ? 'grabbing' : 'grab',
          padding: '1rem 0',
          userSelect: 'none',
        }}
        className="scrollbar-none"
      >
        {items.map((partner, idx) => (
          <div
            key={`${partner.id ?? partner.name}-${idx}`}
            className="relative bg-white rounded-2xl shadow-md overflow-hidden transform hover:scale-105 transition duration-300 cursor-pointer flex-shrink-0"
            style={{ width: '20vw', height: '40vh' }}
          >
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
              <img
                src={partner.image ?? partner.imageSrc ?? "/fallback.png"}
                alt={partner.imageAlt ?? partner.name}
                draggable={false}
                onDragStart={(e) => e.preventDefault()}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center',
                  userSelect: 'none',
                  pointerEvents: 'none',
                  position: 'absolute',
                  inset: 0,
                }}
              />
            </div>

            <div
              style={{
                position: 'absolute',
                top: '-0.5rem',
                left: '-0.5rem',
                backgroundColor: '#e7e7e7',
                padding: '0.25rem 0.5rem',
                borderBottomRightRadius: '2rem',
                pointerEvents: 'none',
                userSelect: 'none',
              }}
            >
              <p className="text-sm whitespace-normal break-words" style={{ color: '#000' }}>
                {partner.name}
              </p>
            </div>
          </div>
        ))}
      </div>

      <style jsx global>{`
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </>
  );
};
