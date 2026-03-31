"use client";

import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

interface LoginPromptSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginPromptSheet({
  isOpen,
  onClose,
}: LoginPromptSheetProps) {
  const { signInWithGoogle } = useAuth();

  // ล็อค scroll เมื่อ sheet เปิด
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl p-6"
        style={{
          background: "var(--bg-surface)",
          borderTop: "1px solid var(--border)",
          animation: "sheet-slide-up 0.3s cubic-bezier(0.32, 0.72, 0, 1)",
        }}
      >
        {/* Handle */}
        <div className="flex justify-center mb-5">
          <div
            className="w-10 h-1 rounded-full"
            style={{ background: "var(--border)" }}
          />
        </div>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{
              background: "rgba(108, 99, 255, 0.15)",
              border: "1px solid rgba(108, 99, 255, 0.3)",
            }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="1.8"
            >
              <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z" />
              <path d="M19 15l.75 2.25L22 18l-2.25.75L19 21l-.75-2.25L16 18l2.25-.75z" />
            </svg>
          </div>
        </div>

        <div className="text-center mb-6">
          <h2
            className="text-xl font-bold mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            เข้าสู่ระบบเพื่อใช้ Ask AI
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
            ฟีเจอร์ AI ต้องการ Login ด้วย Google
            เพื่อรักษาความปลอดภัยและประสบการณ์ที่ดีที่สุด
          </p>
        </div>

        <button
          onClick={() => {
            onClose();
            signInWithGoogle();
          }}
          className="
            w-full flex items-center justify-center gap-3
            py-3.5 rounded-2xl
            font-semibold text-base
            transition-all duration-150
            active:scale-98
          "
          style={{
            background: "white",
            color: "#1a1a23",
            boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continue with Google
        </button>

        <button
          onClick={onClose}
          className="w-full py-3 mt-2 text-sm font-medium rounded-2xl transition-colors"
          style={{ color: "var(--text-muted)" }}
        >
          ยกเลิก
        </button>
      </div>
    </>
  );
}
