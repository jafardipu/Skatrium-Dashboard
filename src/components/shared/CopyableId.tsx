"use client";

import { message } from "antd";
import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

type CopyableIdProps = {
  id: string | number | undefined | null;
  /** When true, only shows the last 4 characters (e.g. ···abcd) */
  previewLast4?: boolean;
  className?: string;
};

const CopyableId = ({ id, previewLast4 = false, className }: CopyableIdProps) => {
  const [copied, setCopied] = useState(false);
  const value = id != null ? String(id) : "";

  if (!value) return <span className="text-gray-400">N/A</span>;

  const display = previewLast4
    ? `···${value.slice(-4)}`
    : value;

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      message.success("ID copied");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      message.error("Failed to copy");
    }
  };

  return (
    <div className={cn("inline-flex items-center gap-1.5", className)}>
      <span className="font-mono text-sm">{display}</span>
      <button
        type="button"
        onClick={handleCopy}
        title="Copy ID"
        className="inline-flex items-center justify-center rounded p-0.5 text-gray-400 hover:text-[#78C0A8] transition-colors"
      >
        {copied ? <Check size={14} className="text-[#4BB54B]" /> : <Copy size={14} />}
      </button>
    </div>
  );
};

export default CopyableId;
