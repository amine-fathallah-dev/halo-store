"use client";

import { useEffect } from "react";
import { CheckCircle2, XCircle, X } from "lucide-react";

export type ToastType = "success" | "error";

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

export default function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-warm-lg animate-fade-in max-w-sm ${
        type === "success"
          ? "bg-noir text-white"
          : "bg-promo text-white"
      }`}
    >
      {type === "success" ? (
        <CheckCircle2 size={18} className="flex-shrink-0" />
      ) : (
        <XCircle size={18} className="flex-shrink-0" />
      )}
      <p className="font-dm text-sm flex-1">{message}</p>
      <button onClick={onClose} className="cursor-pointer opacity-70 hover:opacity-100 transition-opacity">
        <X size={14} />
      </button>
    </div>
  );
}
