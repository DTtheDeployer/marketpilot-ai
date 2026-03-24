"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { toPng } from "html-to-image";
import { Button } from "@marketpilot/ui";

interface ExportButtonProps {
  targetRef: React.RefObject<HTMLElement | null>;
  filename?: string;
}

export function ExportButton({
  targetRef,
  filename = "chart",
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  async function handleExport() {
    if (!targetRef.current) return;

    setIsExporting(true);

    try {
      const dataUrl = await toPng(targetRef.current, {
        backgroundColor: "#0a0a0a",
        pixelRatio: 2,
      });

      const link = document.createElement("a");
      link.download = `${filename}-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleExport}
      disabled={isExporting}
    >
      <Download className="w-4 h-4 mr-1.5" />
      {isExporting ? "Exporting..." : "Export"}
    </Button>
  );
}
