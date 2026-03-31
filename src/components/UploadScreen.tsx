"use client";

import { useRef, useState, useCallback } from "react";
import ThemeToggle from "./ThemeToggle";

interface UploadScreenProps {
  onFileSelected: (file: File) => void;
  onOpenLibrary: () => void;
}

export default function UploadScreen({ onFileSelected, onOpenLibrary }: UploadScreenProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback(
    (file: File | undefined) => {
      if (!file) return;
      if (file.type !== "application/pdf") {
        alert("กรุณาเลือกไฟล์ PDF เท่านั้น");
        return;
      }
      onFileSelected(file);
    },
    [onFileSelected]
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6 relative">
      {/* Top Bar for Library */}
      <div className="w-full flex justify-end items-center gap-3 mb-16 pt-2">
        <ThemeToggle />
        <button
          onClick={onOpenLibrary}
          className="flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm transition-colors tap-target"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", color: "var(--text-primary)", boxShadow: "var(--shadow-sm)" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
          Library
        </button>
      </div>

      {/* Header */}
      <div className="mb-10 text-center">
        <div
          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
          style={{
            background: "var(--accent-dim)",
            border: "1px solid var(--accent-glow)",
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
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14,2 14,8 20,8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10,9 9,9 8,9" />
          </svg>
        </div>
        <h1
          className="text-2xl font-bold mb-1"
          style={{ color: "var(--text-primary)" }}
        >
          Smart PDF Reader
        </h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          อัปโหลด PDF แล้วถาม AI ได้เลย
        </p>
      </div>

      {/* Drop Zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className="
          w-full max-w-sm
          rounded-2xl p-8
          flex flex-col items-center gap-3
          cursor-pointer
          transition-all duration-200
          select-none
          active:scale-98
        "
        style={{
          border: `2px dashed ${isDragging ? "var(--accent)" : "var(--border-strong)"}`,
          background: isDragging
            ? "var(--bg-elevated)"
            : "var(--bg-surface)",
          boxShadow: isDragging
            ? "var(--shadow-md)"
            : "none",
        }}
      >
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ background: "var(--accent-dim)" }}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2"
          >
            <polyline points="16,16 12,12 8,16" />
            <line x1="12" y1="12" x2="12" y2="21" />
            <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
          </svg>
        </div>
        <div className="text-center">
          <p
            className="font-semibold text-sm"
            style={{ color: "var(--text-primary)" }}
          >
            {isDragging ? "วางไฟล์ได้เลย!" : "แตะเพื่อเลือก PDF"}
          </p>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
            หรือลากไฟล์มาวางที่นี่
          </p>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      <p className="mt-6 text-xs" style={{ color: "var(--text-muted)" }}>
        ไฟล์จะไม่ถูกอัปโหลดไปที่ server · ประมวลผลในเครื่องคุณทั้งหมด
      </p>
    </div>
  );
}
