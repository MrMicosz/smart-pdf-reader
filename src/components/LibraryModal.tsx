"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface LibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = "flashcards" | "history";

export default function LibraryModal({ isOpen, onClose }: LibraryModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("flashcards");
  const [isClosing, setIsClosing] = useState(false);
  
  const [flashcards, setFlashcards] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { user } = useAuth();
  const supabase = createClient();

  // Handle closing animation
  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 250);
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      if (user) {
        fetchData(activeTab);
      }
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen, activeTab, user]);

  const fetchData = async (tab: TabType) => {
    setIsLoading(true);
    if (tab === "flashcards") {
      const { data } = await supabase
        .from("flashcards")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });
      setFlashcards(data || []);
    } else {
      const { data } = await supabase
        .from("history")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });
      setHistory(data || []);
    }
    setIsLoading(false);
  };

  if (!isOpen && !isClosing) return null;

  return (
    <>
      <div 
        className="fixed inset-0 z-50 transition-opacity duration-250"
        style={{ 
          background: "rgba(0,0,0,0.5)", 
          backdropFilter: "blur(4px)",
          opacity: isClosing ? 0 : 1
        }}
        onClick={handleClose}
      />
      
      <div 
        className={`fixed bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-3xl h-[92vh] ${isClosing ? 'sheet-animate-out' : 'sheet-animate-in'}`}
        style={{ 
          background: "var(--bg-canvas)",
          boxShadow: "var(--shadow-lg)"
        }}
      >
        <div className="flex-shrink-0 flex justify-center pt-3 pb-1" onClick={handleClose}>
          <div className="w-12 h-1.5 rounded-full" style={{ background: "var(--border-strong)" }} />
        </div>

        {/* Header & Tabs */}
        <div className="px-5 pt-3 pb-4" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>
              My Library
            </h2>
            <button onClick={handleClose} className="p-2 rounded-full tap-target" style={{ background: "var(--bg-surface)" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          
          <div className="flex gap-2">
            <TabButton 
              active={activeTab === "flashcards"} 
              onClick={() => setActiveTab("flashcards")}
              icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/></svg>}
              label="Flashcards"
            />
            <TabButton 
              active={activeTab === "history"} 
              onClick={() => setActiveTab("history")}
              icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>}
              label="History"
            />
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-5 pb-safe">
          {!user ? (
            <EmptyState 
              title="Welcome to Library" 
              subtitle="Please login to view your saved flashcards and reading history." 
              icon="🔒" 
            />
          ) : isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="skeleton h-32 w-full rounded-2xl" />
              ))}
            </div>
          ) : activeTab === "flashcards" ? (
            flashcards.length === 0 ? (
              <EmptyState 
                title="No Flashcards Yet" 
                subtitle="Highlight text in a PDF and ask AI to generate flashcards!" 
                icon="📇" 
              />
            ) : (
              <div className="space-y-4">
                {flashcards.map((card) => (
                  <FlashcardItem key={card.id} card={card} />
                ))}
              </div>
            )
          ) : (
            history.length === 0 ? (
              <EmptyState 
                title="No Reading History" 
                subtitle="Start translating and explaining paragraphs to build your reading history." 
                icon="📚" 
              />
            ) : (
              <div className="space-y-4">
                {history.map((item) => (
                  <HistoryItem key={item.id} item={item} />
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-colors tap-target"
      style={{
        background: active ? "var(--bg-card)" : "transparent",
        color: active ? "var(--text-primary)" : "var(--text-muted)",
        border: active ? "1px solid var(--border-strong)" : "1px solid transparent"
      }}
    >
      <span style={{ color: active ? "var(--accent)" : "inherit" }}>{icon}</span>
      {label}
    </button>
  );
}

function EmptyState({ title, subtitle, icon }: { title: string, subtitle: string, icon: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center px-4 py-20 opacity-80">
      <div className="text-6xl mb-6">{icon}</div>
      <h3 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>{title}</h3>
      <p className="text-sm max-w-xs" style={{ color: "var(--text-muted)", lineHeight: 1.6 }}>{subtitle}</p>
    </div>
  );
}

function FlashcardItem({ card }: { card: any }) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div 
      className="rounded-2xl p-5 mb-4 tap-target cursor-pointer reveal-up"
      style={{ 
        background: isOpen ? "var(--bg-elevated)" : "var(--bg-surface)",
        border: isOpen ? "1px solid var(--accent-glow)" : "1px solid var(--border)",
        boxShadow: isOpen ? "var(--shadow-md)" : "var(--shadow-sm)",
        transition: "all 0.3s ease"
      }}
      onClick={() => setIsOpen(!isOpen)}
    >
      <div className="flex justify-between items-start mb-2 gap-4">
        <p className="font-semibold text-[15px] leading-relaxed" style={{ color: "var(--text-primary)" }}>
          {card.front_text}
        </p>
        <span 
          className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full" 
          style={{ background: "var(--bg-canvas)", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.3s" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
        </span>
      </div>
      
      <div 
        className="overflow-hidden transition-all duration-300"
        style={{
          maxHeight: isOpen ? "800px" : "0px",
          opacity: isOpen ? 1 : 0
        }}
      >
        <div 
          className="mt-4 pt-4 text-sm leading-relaxed" 
          style={{ borderTop: "1px dashed var(--border-strong)", color: "var(--text-secondary)" }}
        >
          {card.back_text}
        </div>
      </div>
    </div>
  );
}

function HistoryItem({ item }: { item: any }) {
  return (
    <div 
      className="rounded-2xl p-5 mb-4 reveal-up"
      style={{ 
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow-sm)"
      }}
    >
      <div className="mb-3 pl-3" style={{ borderLeft: "3px solid var(--accent)", color: "var(--text-secondary)" }}>
        <p className="text-sm italic line-clamp-3">{item.selected_text}</p>
      </div>
      <div className="text-sm leading-relaxed" style={{ color: "var(--text-primary)" }}>
        <p className="line-clamp-4">{item.result_text}</p>
      </div>
      <div className="mt-3 text-xs" style={{ color: "var(--text-faint)" }}>
        {new Date(item.created_at).toLocaleDateString()}
      </div>
    </div>
  );
}
