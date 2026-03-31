"use client";

import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";

interface AIResultSheetProps {
  isOpen: boolean;
  isLoading: boolean;
  result: string | null;
  error: string | null;
  selectedText: string;
  onClose: () => void;
  onRetry: () => void;
  onSaveFlashcard?: (text: string, explanation: string) => void;
}

export default function AIResultSheet({
  isOpen,
  isLoading,
  result,
  error,
  selectedText,
  onClose,
  onRetry,
  onSaveFlashcard,
}: AIResultSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef<number>(0);
  const currentYRef = useRef<number>(0);

  // Swipe down เพื่อปิด Sheet
  useEffect(() => {
    const sheet = sheetRef.current;
    if (!sheet) return;

    const handleTouchStart = (e: TouchEvent) => {
      startYRef.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      currentYRef.current = e.touches[0].clientY;
      const diff = currentYRef.current - startYRef.current;
      if (diff > 0) {
        sheet.style.transform = `translateY(${diff}px)`;
        sheet.style.transition = "none";
      }
    };

    const handleTouchEnd = () => {
      const diff = currentYRef.current - startYRef.current;
      sheet.style.transition = "transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)";

      if (diff > 100) {
        // swipe down เกิน 100px → ปิด
        onClose();
      } else {
        // ดึงกลับ
        sheet.style.transform = "translateY(0)";
      }
    };

    sheet.addEventListener("touchstart", handleTouchStart, { passive: true });
    sheet.addEventListener("touchmove", handleTouchMove, { passive: true });
    sheet.addEventListener("touchend", handleTouchEnd);

    return () => {
      sheet.removeEventListener("touchstart", handleTouchStart);
      sheet.removeEventListener("touchmove", handleTouchMove);
      sheet.removeEventListener("touchend", handleTouchEnd);
    };
  }, [onClose]);

  // Lock scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(4px)",
          animation: "fade-in 0.2s ease",
        }}
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <div
        ref={sheetRef}
        className="fixed bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-3xl"
        style={{
          background: "var(--bg-surface)",
          borderTop: "1px solid var(--border)",
          maxHeight: "85vh",
          animation: "sheet-slide-up 0.35s cubic-bezier(0.32, 0.72, 0, 1)",
        }}
      >
        {/* Drag Handle */}
        <div className="flex-shrink-0 flex justify-center pt-3 pb-1">
          <div
            className="w-10 h-1 rounded-full"
            style={{ background: "rgba(255,255,255,0.15)" }}
          />
        </div>

        {/* Header */}
        <div
          className="flex-shrink-0 flex items-center justify-between px-5 py-3"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(108, 99, 255, 0.2)" }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--accent)"
                strokeWidth="2.5"
              >
                <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z" />
              </svg>
            </div>
            <span
              className="font-semibold text-sm"
              style={{ color: "var(--text-primary)" }}
            >
              AI Tutor
            </span>
            {isLoading && (
              <span
                className="text-xs px-2 py-0.5 rounded-full animate-pulse"
                style={{
                  background: "var(--accent-dim)",
                  color: "var(--accent)",
                }}
              >
                กำลังคิด...
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
            style={{ background: "var(--bg-card)" }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Selected Text Preview */}
        {selectedText && (
          <div
            className="flex-shrink-0 mx-4 mt-3 p-3 rounded-xl"
            style={{
              background: "var(--bg-card)",
              borderLeft: "3px solid var(--accent)",
            }}
          >
            <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>
              ข้อความที่เลือก
            </p>
            <p
              className="text-sm line-clamp-2 leading-relaxed"
              style={{ color: "var(--text-primary)" }}
            >
              {selectedText}
            </p>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-5 py-4">
          {/* Loading State */}
          {isLoading && <LoadingSkeleton />}

          {/* Error State */}
          {!isLoading && error && (
            <div className="flex flex-col items-center gap-4 py-8">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: "rgba(239, 68, 68, 0.15)" }}
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <div className="text-center">
                <p
                  className="font-semibold mb-1"
                  style={{ color: "var(--text-primary)" }}
                >
                  เกิดข้อผิดพลาด
                </p>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  {error}
                </p>
              </div>
              <button
                onClick={onRetry}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                style={{
                  background: "var(--accent-dim)",
                  color: "var(--accent)",
                  border: "1px solid var(--accent-glow)",
                }}
              >
                ลองใหม่อีกครั้ง
              </button>
            </div>
          )}

          {/* Result — Markdown Rendered */}
          {!isLoading && result && (
            <>
              <div className="prose-ai">
                <ReactMarkdown
                components={{
                  h1: ({ children }) => (
                    <h1
                      className="text-lg font-bold mb-3 mt-4"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2
                      className="text-base font-bold mb-2 mt-4"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3
                      className="text-sm font-bold mb-2 mt-3"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p
                      className="text-sm leading-relaxed mb-3"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {children}
                    </p>
                  ),
                  ul: ({ children }) => (
                    <ul className="mb-3 space-y-1.5 pl-1">{children}</ul>
                  ),
                  li: ({ children }) => (
                    <li
                      className="text-sm leading-relaxed flex gap-2"
                      style={{ color: "var(--text-primary)" }}
                    >
                      <span style={{ color: "var(--accent)", flexShrink: 0 }}>•</span>
                      <span>{children}</span>
                    </li>
                  ),
                  strong: ({ children }) => (
                    <strong
                      className="font-semibold"
                      style={{ color: "#a78bfa" }}
                    >
                      {children}
                    </strong>
                  ),
                  code: ({ children }) => (
                    <code
                      className="px-1.5 py-0.5 rounded text-xs font-mono"
                      style={{
                        background: "var(--bg-card)",
                        color: "var(--accent)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      {children}
                    </code>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote
                      className="pl-3 my-3"
                      style={{
                        borderLeft: "3px solid var(--accent)",
                        color: "var(--text-muted)",
                      }}
                    >
                      {children}
                    </blockquote>
                  ),
                }}
              >
                {result}
              </ReactMarkdown>
            </div>
            
            {/* Save as Flashcard Button */}
            {onSaveFlashcard && (
              <button
                onClick={() => onSaveFlashcard(selectedText, result || "")}
                className="w-full mt-6 mb-2 py-3 rounded-xl font-semibold text-[15px] flex items-center justify-center gap-2 tap-target shadow-md"
                style={{
                  background: "var(--accent)",
                  color: "#1a1a1a",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                  <polyline points="17 21 17 13 7 13 7 21" />
                  <polyline points="7 3 7 8 15 8" />
                </svg>
                บันทึกเป็น Flashcard
              </button>
            )}
            </>
          )}
        </div>

        {/* Bottom safe area */}
        <div className="flex-shrink-0 pb-safe h-4" />
      </div>
    </>
  );
}

// Loading Skeleton Component
function LoadingSkeleton() {
  return (
    <div className="space-y-3 pt-2">
      {[100, 85, 95, 70, 90, 60].map((width, i) => (
        <div
          key={i}
          className="h-3 rounded-full"
          style={{
            width: `${width}%`,
            background: "var(--bg-card)",
            animation: `shimmer 1.5s infinite ${i * 0.1}s`,
            backgroundImage:
              "linear-gradient(90deg, var(--bg-card) 0%, var(--bg-surface) 50%, var(--bg-card) 100%)",
            backgroundSize: "200% 100%",
          }}
        />
      ))}
      <div className="pt-2 space-y-3">
        {[75, 90].map((width, i) => (
          <div
            key={i}
            className="h-3 rounded-full"
            style={{
              width: `${width}%`,
              background: "var(--bg-card)",
              animation: `shimmer 1.5s infinite ${(i + 6) * 0.1}s`,
              backgroundImage:
                "linear-gradient(90deg, var(--bg-card) 0%, var(--bg-surface) 50%, var(--bg-card) 100%)",
              backgroundSize: "200% 100%",
            }}
          />
        ))}
      </div>
    </div>
  );
}
