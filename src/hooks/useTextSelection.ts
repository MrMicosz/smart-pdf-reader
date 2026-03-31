"use client";

import { useState, useEffect, useCallback, RefObject } from "react";

export interface SelectionPosition {
  x: number; // ตำแหน่งกลางของ selection (viewport coordinates)
  y: number; // ตำแหน่งด้านบนของ selection
}

export interface TextSelectionState {
  selectedText: string;
  position: SelectionPosition | null;
  isVisible: boolean;
}

/**
 * useTextSelection
 *
 * Hook นี้ตรวจจับการเลือกข้อความบน element ที่กำหนด
 * รองรับทั้ง mouse events (desktop) และ touch events (mobile)
 *
 * @param containerRef - ref ของ element ที่ต้องการตรวจจับ selection
 */
export function useTextSelection(
  containerRef: RefObject<HTMLElement | null>,
  scrollRef?: RefObject<HTMLElement | null>
): TextSelectionState & { clearSelection: () => void } {
  const [selectedText, setSelectedText] = useState("");
  const [position, setPosition] = useState<SelectionPosition | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  /**
   * คำนวณตำแหน่งของ FAB จาก Selection range
   * วาง FAB ไว้เหนือ selection เล็กน้อย
   */
  const computePosition = useCallback((): SelectionPosition | null => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return null;

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    if (rect.width === 0 && rect.height === 0) return null;

    let x = rect.left + rect.width / 2;
    let y = rect.top + window.scrollY - 8;

    if (scrollRef && scrollRef.current) {
      const scrollRect = scrollRef.current.getBoundingClientRect();
      x = rect.left + rect.width / 2 - scrollRect.left;
      y = rect.top - scrollRect.top + scrollRef.current.scrollTop - 8;
    }

    return { x, y };
  }, [scrollRef]);

  /**
   * ตรวจสอบ selection และ update state
   */
  const handleSelectionChange = useCallback(() => {
    const selection = window.getSelection();
    let text = selection?.toString().trim() ?? "";

    if (!text || text.length === 0) {
      // ไม่มี selection → ซ่อน FAB
      setIsVisible(false);
      setSelectedText("");
      setPosition(null);
      return;
    }

    // Clean Thai spacing glitches using positive lookahead logic per request
    text = text.replace(/([ก-๙])\s+(?=[ก-๙])/g, '$1');

    // ตรวจว่า selection อยู่ใน container ของเราหรือเปล่า
    if (containerRef.current && selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const container = containerRef.current;

      const isInsideContainer =
        container.contains(range.commonAncestorContainer);

      if (!isInsideContainer) {
        setIsVisible(false);
        return;
      }
    }

    const pos = computePosition();
    if (pos) {
      setSelectedText(text);
      setPosition(pos);
      setIsVisible(true);
    }
  }, [containerRef, computePosition]);

  /**
   * จัดการ touch events สำหรับ mobile
   * บน iOS และ Android การ select text จะเสร็จหลัง touchend
   * ต้องรอ delay เล็กน้อยให้ browser update Selection object
   */
  const handleTouchEnd = useCallback(() => {
    // delay 300ms เพื่อรอ browser อัปเดต Selection
    setTimeout(() => {
      handleSelectionChange();
    }, 300);
  }, [handleSelectionChange]);

  /**
   * ซ่อน FAB เมื่อคลิกที่อื่น
   * แต่ต้องไม่ซ่อนเมื่อคลิกที่ FAB เอง (จัดการใน FloatingActionMenu)
   */
  const handleClickOutside = useCallback(
    (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement;
      // ถ้าคลิกที่ element ที่มี data-fab="true" → ไม่ต้องซ่อน
      if (target.closest("[data-fab]")) return;

      // ถ้าคลิกข้างนอก container → ซ่อน
      if (
        containerRef.current &&
        !containerRef.current.contains(target)
      ) {
        setIsVisible(false);
        setSelectedText("");
        setPosition(null);
      }
    },
    [containerRef]
  );

  useEffect(() => {
    // Desktop: selectionchange event (fires ขณะ select อยู่)
    document.addEventListener("selectionchange", handleSelectionChange);

    // Mobile: touchend event
    document.addEventListener("touchend", handleTouchEnd, { passive: true });

    // คลิกนอก container
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside, {
      passive: true,
    });

    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
      document.removeEventListener("touchend", handleTouchEnd);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [handleSelectionChange, handleTouchEnd, handleClickOutside]);

  const clearSelection = useCallback(() => {
    window.getSelection()?.removeAllRanges();
    setIsVisible(false);
    setSelectedText("");
    setPosition(null);
  }, []);

  return { selectedText, position, isVisible, clearSelection };
}
