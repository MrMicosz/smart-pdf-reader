"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import UploadScreen from "@/components/UploadScreen";
import LibraryModal from "@/components/LibraryModal";

const PdfViewer = dynamic(() => import("@/components/PdfViewer"), { ssr: false });

export default function Home() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);

  return (
    <>
      {pdfFile ? (
        <PdfViewer
          file={pdfFile}
          onBack={() => setPdfFile(null)}
          onOpenLibrary={() => setIsLibraryOpen(true)}
        />
      ) : (
        <UploadScreen 
          onFileSelected={setPdfFile} 
          onOpenLibrary={() => setIsLibraryOpen(true)}
        />
      )}
      <LibraryModal isOpen={isLibraryOpen} onClose={() => setIsLibraryOpen(false)} />
    </>
  );
}
