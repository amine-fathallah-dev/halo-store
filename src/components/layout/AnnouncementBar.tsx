"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";

export default function AnnouncementBar() {
  const t = useTranslations("announcement");
  const [visible, setVisible] = useState(false);
  const [index, setIndex] = useState(0);

  const messages = [t("message1"), t("message2"), t("message3")];

  useEffect(() => {
    const dismissed = localStorage.getItem("halo-announcement-dismissed");
    if (!dismissed) setVisible(true);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % messages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [visible, messages.length]);

  if (!visible) return null;

  return (
    <div className="bg-bronze text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-center gap-4">
        <div className="flex-1 text-center">
          <p className="font-dm text-xs tracking-widest uppercase transition-all duration-500">
            {messages[index]}
          </p>
        </div>
        <button
          onClick={() => {
            setVisible(false);
            localStorage.setItem("halo-announcement-dismissed", "1");
          }}
          className="flex-shrink-0 p-1 hover:opacity-70 transition-opacity cursor-pointer"
          aria-label="Fermer"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
