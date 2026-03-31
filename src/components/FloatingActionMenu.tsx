"use client";

import { useEffect, useRef } from "react";
import { SelectionPosition } from "@/hooks/useTextSelection";

interface FloatingActionMenuProps {
  position: SelectionPosition;
  onAskAI: () => void;
  onClose: () => void;
}

export default function FloatingActionMenu({
  position,
  onAskAI,
  onClose,
}: FloatingActionMenuProps) {
  const fabRef = useRef<HTMLDivElement>(null);

  // ปรับตำแหน่งถ้า FAB จะออกนอกหน้าจอ
  useEffect(() => {
    if (!fabRef.current) return;

    const fab = fabRef.current;
    const rect = fab.getBoundingClientRect();
    const vw = window.innerWidth;

    // ถ้า FAB ชิดขอบซ้าย
    if (rect.left < 8) {
      fab.style.left = `${8 + rect.width / 2}px`;
      fab.style.transform = "translateX(0) scale(1)";
    }
    // ถ้า FAB ชิดขอบขวา
    else if (rect.right > vw - 8) {
      fab.style.left = `${vw - 8 - rect.width / 2}px`;
      fab.style.transform = "translateX(0) scale(1)";
    }
  }, [position]);

  const handleAskAI = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAskAI();
  };

  return (
    <div
      ref={fabRef}
      data-fab="true"
      className="fab-animate"
      style={{
        position: "absolute",
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: "translateX(-50%)",
        zIndex: 9999,
        pointerEvents: "auto",
      }}
    >
      {/* ลูกศรชี้ลง */}
      <div
        className="absolute left-1/2 -translate-x-1/2"
        style={{ bottom: "-5px" }}
      >
        <div
          style={{
            width: 0,
            height: 0,
            borderLeft: "5px solid transparent",
            borderRight: "5px solid transparent",
            borderTop: "5px solid var(--accent)",
          }}
        />
      </div>

      {/* ปุ่ม Ask AI */}
      <button
        data-fab="true"
        onMouseDown={handleAskAI}
        onTouchEnd={handleAskAI}
        className="
          flex items-center gap-1.5 
          px-3 py-1.5 
          rounded-full 
          text-white text-sm font-semibold 
          select-none
          whitespace-nowrap
          shadow-lg
          active:scale-95
          transition-transform duration-100
        "
        style={{
          background: "var(--accent)",
          boxShadow: "0 4px 20px rgba(108, 99, 255, 0.5), 0 2px 8px rgba(0,0,0,0.3)",
          WebkitTapHighlightColor: "transparent",
        }}
      >
        {/* ไอคอน sparkle */}
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z" />
          <path d="M19 15l.75 2.25L22 18l-2.25.75L19 21l-.75-2.25L16 18l2.25-.75z" />
        </svg>
        Ask AI
      </button>
    </div>
  );
}
