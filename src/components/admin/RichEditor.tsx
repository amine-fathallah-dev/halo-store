"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, useCallback } from "react";
import {
  Bold, Italic, Heading1, Heading2, Heading3,
  List, ListOrdered, Link as LinkIcon, Image as ImageIcon, Quote,
  Undo, Redo,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface RichEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function RichEditor({ value, onChange, placeholder }: RichEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ inline: false, allowBase64: false }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: "text-bronze underline" } }),
      Placeholder.configure({
        placeholder: placeholder ?? "Commencez à écrire...",
        emptyEditorClass: "before:content-[attr(data-placeholder)] before:text-grege before:pointer-events-none before:absolute",
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose max-w-none min-h-[400px] font-dm text-sm text-noir leading-relaxed focus:outline-none p-4",
      },
    },
  });

  // Sync external value changes (e.g. switching FR/EN tabs)
  useEffect(() => {
    if (editor && editor.getHTML() !== value) {
      editor.commands.setContent(value || "");
    }
  }, [value, editor]);

  const handleLink = useCallback(() => {
    if (!editor) return;
    const previous = editor.getAttributes("link").href;
    const url = window.prompt("URL du lien :", previous ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    }
  }, [editor]);

  const handleImage = useCallback(async () => {
    if (!editor) return;
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const supabase = createClient();
      const ext = file.name.split(".").pop();
      const path = `blog/${Date.now()}.${ext}`;
      const { data, error } = await supabase.storage
        .from("halo-images")
        .upload(path, file, { upsert: false });
      if (error || !data) return;
      const { data: { publicUrl } } = supabase.storage.from("halo-images").getPublicUrl(data.path);
      editor.chain().focus().setImage({ src: publicUrl, alt: file.name }).run();
    };
    input.click();
  }, [editor]);

  if (!editor) return null;

  const ToolBtn = ({
    onClick,
    active,
    children,
    title,
    disabled,
  }: {
    onClick: () => void;
    active?: boolean;
    children: React.ReactNode;
    title: string;
    disabled?: boolean;
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-30 ${
        active
          ? "bg-bronze text-white"
          : "text-grege hover:text-noir hover:bg-beige"
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="border border-beige rounded-2xl overflow-hidden focus-within:border-bronze focus-within:ring-1 focus-within:ring-bronze transition-colors">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 p-2 bg-background border-b border-beige">
        <ToolBtn
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="Gras"
        >
          <Bold size={14} />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="Italique"
        >
          <Italic size={14} />
        </ToolBtn>

        <div className="w-px h-5 bg-beige mx-1" />

        <ToolBtn
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive("heading", { level: 1 })}
          title="Titre H1"
        >
          <Heading1 size={14} />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive("heading", { level: 2 })}
          title="Titre H2"
        >
          <Heading2 size={14} />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive("heading", { level: 3 })}
          title="Titre H3"
        >
          <Heading3 size={14} />
        </ToolBtn>

        <div className="w-px h-5 bg-beige mx-1" />

        <ToolBtn
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="Liste à puces"
        >
          <List size={14} />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="Liste numérotée"
        >
          <ListOrdered size={14} />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          title="Citation"
        >
          <Quote size={14} />
        </ToolBtn>

        <div className="w-px h-5 bg-beige mx-1" />

        <ToolBtn onClick={handleLink} active={editor.isActive("link")} title="Insérer un lien">
          <LinkIcon size={14} />
        </ToolBtn>
        <ToolBtn onClick={handleImage} title="Insérer une image">
          <ImageIcon size={14} />
        </ToolBtn>

        <div className="w-px h-5 bg-beige mx-1" />

        <ToolBtn
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Annuler"
        >
          <Undo size={14} />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Refaire"
        >
          <Redo size={14} />
        </ToolBtn>
      </div>

      {/* Editor area */}
      <EditorContent editor={editor} />
    </div>
  );
}
