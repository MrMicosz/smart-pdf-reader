"use client";

// ─── เพิ่ม imports ใหม่ ───────────────────────────────────────────
import { useState, useRef, useCallback, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";

import FloatingActionMenu from "./FloatingActionMenu";
import AIResultSheet from "./AIResultSheet";
import LoginPromptSheet from "./LoginPromptSheet";
import AuthButton from "./AuthButton";
import ThemeToggle from "./ThemeToggle";
import { useTextSelection } from "@/hooks/useTextSelection";
import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfViewerProps {
  file: File;
  onBack: () => void;
  onOpenLibrary: () => void;
}

export default function PdfViewer({ file, onBack, onOpenLibrary }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageWidth, setPageWidth] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [fileUrl, setFileUrl] = useState<string>("");

  // ─── AI State ───────────────────────────────────────────────────
  const [aiSheetOpen, setAiSheetOpen] = useState(false);
  const [loginSheetOpen, setLoginSheetOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [pendingText, setPendingText] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { selectedText, position, isVisible, clearSelection } =
    useTextSelection(
      containerRef as React.RefObject<HTMLElement | null>,
      scrollRef as React.RefObject<HTMLElement | null>
    );

  // ─── Auth Hook ───────────────────────────────────────────────────
  const { user } = useAuth();

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setFileUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setPageWidth(containerRef.current.offsetWidth - 32);
      }
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const handleDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsLoading(false);
  };

  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  const handleScroll = useCallback(() => {
    if (!scrollRef.current || numPages === 0) return;
    if (scrollTimeout.current) return;

    scrollTimeout.current = setTimeout(() => {
      if (scrollRef.current) {
        const scrollTop = scrollRef.current.scrollTop;
        const pageHeight = scrollRef.current.scrollHeight / numPages;
        const page = Math.floor(scrollTop / pageHeight) + 1;
        setCurrentPage(Math.min(Math.max(page, 1), numPages));
      }
      scrollTimeout.current = null;
    }, 100);
  }, [numPages]);

  // ─── ฟังก์ชันเรียก AI API ─────────────────────────────────────────
  const callAI = useCallback(async (text: string) => {
    setAiLoading(true);
    setAiResult(null);
    setAiError(null);
    setAiSheetOpen(true);

    try {
      const response = await fetch("/api/ask-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedText: text }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "เกิดข้อผิดพลาด");
      }

      setAiResult(data.result);
    } catch (err) {
      setAiError(
        err instanceof Error ? err.message : "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ"
      );
    } finally {
      setAiLoading(false);
    }
  }, []);

  // ─── Restore pendingText after Login ─────────────────────────────
  useEffect(() => {
    if (user) {
      const savedText = sessionStorage.getItem("pendingAiText");
      if (savedText) {
        sessionStorage.removeItem("pendingAiText");
        setPendingText(savedText);
        // เลื่อนเล็กน้อยเพื่อให้ React อัปเดต state เสร็จ
        setTimeout(() => callAI(savedText), 100);
      }
    }
  }, [user, callAI]);

  // ─── Handler หลักเมื่อกด "Ask AI" ────────────────────────────────
  const handleAskAI = useCallback(() => {
    if (!selectedText) return;

    const text = selectedText;
    clearSelection();

    if (!user) {
      // ยังไม่ได้ login → เปิด LoginPromptSheet
      sessionStorage.setItem("pendingAiText", text);
      setPendingText(text);
      setLoginSheetOpen(true);
    } else {
      // Login แล้ว → เรียก AI ได้เลย
      setPendingText(text);
      callAI(text);
    }
  }, [selectedText, user, clearSelection, callAI]);

  const handleRetry = useCallback(() => {
    if (pendingText) callAI(pendingText);
  }, [pendingText, callAI]);

  const handleSaveFlashcard = useCallback(async (text: string, explanation: string) => {
    if (!user) return;
    const supabase = createClient();
    const { error } = await supabase.from("flashcards").insert({
      user_id: user.id,
      front_text: text,
      back_text: explanation,
    });
    
    if (error) {
      console.error("[Flashcard] error:", error);
      alert("เกิดข้อผิดพลาดในการบันทึก Flashcard");
    } else {
      alert("บันทึก Flashcard สำเร็จ!");
    }
  }, [user]);

  if (!fileUrl) return null;

  return (
    <div
      className="flex flex-col h-screen overflow-hidden relative"
      style={{ background: "var(--bg-canvas)" }}
    >
      {/* Header — เพิ่ม AuthButton */}
      <header
        className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
        style={{
          background: "var(--bg-surface)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <button
          onClick={onBack}
          className="flex items-center justify-center w-8 h-8 rounded-lg"
          style={{ background: "var(--bg-card)" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15,18 9,12 15,6" />
          </svg>
        </button>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>
            {file.name}
          </p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            {isLoading ? "กำลังโหลด..." : `หน้า ${currentPage} / ${numPages}`}
          </p>
        </div>

        <ThemeToggle />

        <button
          onClick={onOpenLibrary}
          className="flex items-center justify-center w-9 h-9 rounded-full tap-target"
          style={{ background: "var(--accent-dim)", flexShrink: 0 }}
          title="Library"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
        </button>

        {/* ✅ ปุ่ม Login/Logout */}
        <div className="flex-shrink-0">
          <AuthButton />
        </div>
      </header>

      {/* PDF Container */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto no-scrollbar"
        onScroll={handleScroll}
        style={{ position: "relative" }}
      >
        {isVisible && position && (
          <FloatingActionMenu
            position={position}
            onAskAI={handleAskAI}
            onClose={clearSelection}
          />
        )}

        <div ref={containerRef} className="pdf-container px-4 py-4">
          {isLoading && (
            <div className="flex flex-col gap-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="rounded-lg"
                  style={{
                    height: "400px",
                    background: "var(--bg-surface)",
                    animation: `shimmer 1.5s infinite ${i * 0.2}s`,
                  }}
                />
              ))}
            </div>
          )}

          <Document
            file={fileUrl}
            onLoadSuccess={handleDocumentLoadSuccess}
            loading={null}
          >
            {Array.from({ length: numPages }, (_, i) => i + 1).map((pageNum) => (
              <div
                key={pageNum}
                className="mb-4 rounded-lg overflow-hidden"
                style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.4)", background: "#ffffff" }}
              >
                <Page
                  pageNumber={pageNum}
                  width={pageWidth || undefined}
                  renderTextLayer={true}
                  renderAnnotationLayer={false}
                  loading={null}
                />
              </div>
            ))}
          </Document>
        </div>
      </div>

      {/* Hint Bar */}
      {!isLoading && !isVisible && (
        <div
          className="flex-shrink-0 px-4 py-2 text-center text-xs"
          style={{
            color: "var(--text-muted)",
            borderTop: "1px solid var(--border)",
            background: "var(--bg-surface)",
          }}
        >
          {user
            ? "✨ กดค้างเพื่อเลือกข้อความ แล้วกด Ask AI"
            : "🔒 Login ด้วย Google เพื่อใช้ฟีเจอร์ AI"}
        </div>
      )}

      {/* ─── Bottom Sheets ──────────────────────────────────────────── */}
      <LoginPromptSheet
        isOpen={loginSheetOpen}
        onClose={() => setLoginSheetOpen(false)}
      />

      <AIResultSheet
        isOpen={aiSheetOpen}
        isLoading={aiLoading}
        result={aiResult}
        error={aiError}
        selectedText={pendingText}
        onClose={() => setAiSheetOpen(false)}
        onRetry={handleRetry}
        onSaveFlashcard={handleSaveFlashcard}
      />
    </div>
  );
}
