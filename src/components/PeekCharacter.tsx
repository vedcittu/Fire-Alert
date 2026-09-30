"use client";

import { useEffect, useRef, useState } from "react";

const MAX_PUPIL_TRAVEL = 4.5;
const TRACKING_RANGE = 280;

/** Deterministic fluff outline: a ring of soft circles around the body. */
const FLUFF = Array.from({ length: 13 }, (_, index) => {
  const angle = (index / 13) * Math.PI * 2 - Math.PI / 2;
  return {
    cx: Number((80 + Math.cos(angle) * 38).toFixed(2)),
    cy: Number((75 + Math.sin(angle) * 38).toFixed(2)),
    r: index % 2 === 0 ? 15 : 12,
  };
});

/**
 * A friendly fuzzy mascot that pops up from behind the auth card and looks
 * around inside the page. Its pupils follow the pointer when the visitor
 * moves the mouse, and drift idly otherwise.
 */
export function PeekCharacter() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [pupil, setPupil] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    let latest: PointerEvent | null = null;

    const apply = () => {
      frame = 0;
      const event = latest;
      const rect = svgRef.current?.getBoundingClientRect();
      if (!event || !rect) return;

      const eyeCenterX = rect.left + rect.width / 2;
      const eyeCenterY = rect.top + rect.height * 0.52;
      const dx = event.clientX - eyeCenterX;
      const dy = event.clientY - eyeCenterY;
      const distance = Math.hypot(dx, dy) || 1;
      const reach = Math.min(1, distance / TRACKING_RANGE);

      setPupil({
        x: (dx / distance) * MAX_PUPIL_TRAVEL * reach,
        y: (dy / distance) * MAX_PUPIL_TRAVEL * reach,
      });
    };

    const onPointerMove = (event: PointerEvent) => {
      latest = event;
      if (frame) return;
      frame = window.requestAnimationFrame(apply);
    };

    const onPointerLeave = () => setPupil({ x: 0, y: 0 });

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerleave", onPointerLeave);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
    };
  }, []);

  const pupilTransform = `translate(${pupil.x.toFixed(2)} ${pupil.y.toFixed(2)})`;

  return (
    <div className="peek-pop">
      <svg
        ref={svgRef}
        viewBox="0 0 160 120"
        className="peek-bob h-[120px] w-[160px]"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <linearGradient id="peekBodyGradient" x1="0" y1="0" x2="0.35" y2="1">
            <stop offset="0%" stopColor="#7cc4f8" />
            <stop offset="55%" stopColor="#4a9be8" />
            <stop offset="100%" stopColor="#2c6fc0" />
          </linearGradient>
        </defs>

        <g fill="#3f8fdc">
          <rect x="30" y="62" width="15" height="46" rx="7.5" className="peek-wave" />
          <rect x="115" y="62" width="15" height="46" rx="7.5" />
        </g>

        <g fill="#2f7fcc">
          <rect x="24" y="99" width="28" height="21" rx="10.5" />
          <rect x="108" y="99" width="28" height="21" rx="10.5" />
        </g>

        <g fill="url(#peekBodyGradient)">
          {FLUFF.map((circle, index) => (
            <circle key={index} cx={circle.cx} cy={circle.cy} r={circle.r} />
          ))}
          <circle cx="80" cy="75" r="41" />
        </g>

        <ellipse cx="80" cy="88" rx="24" ry="19" fill="#8fd0fb" opacity="0.5" />
        <ellipse cx="48" cy="84" rx="8" ry="5" fill="#f472b6" opacity="0.28" />
        <ellipse cx="112" cy="84" rx="8" ry="5" fill="#f472b6" opacity="0.28" />

        <g className="peek-blink">
          <ellipse cx="63" cy="66" rx="14" ry="15" fill="#ffffff" />
          <ellipse cx="97" cy="66" rx="14" ry="15" fill="#ffffff" />
          <g className="peek-dart">
            <g transform={pupilTransform}>
              <circle cx="63" cy="68" r="7" fill="#12243d" />
              <circle cx="97" cy="68" r="7" fill="#12243d" />
              <circle cx="60.5" cy="65" r="2.4" fill="#ffffff" opacity="0.9" />
              <circle cx="94.5" cy="65" r="2.4" fill="#ffffff" opacity="0.9" />
            </g>
          </g>
        </g>

        <path
          d="M72 93 q8 9 16 0"
          fill="none"
          stroke="#1c3f66"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.6"
        />
      </svg>
    </div>
  );
}
