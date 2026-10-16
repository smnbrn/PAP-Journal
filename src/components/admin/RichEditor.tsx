"use client";
import Image from "@tiptap/extension-image";
import { Placeholder } from "@tiptap/extensions";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  Strikethrough,
  Underline,
  Undo2,
  Unlink,
} from "lucide-react";
import { useRef, useState, type ReactNode } from "react";
import { uploadFile } from "@/lib/upload-client";

type Props = {
  name: string;
  initialHtml: string;
  placeholder?: string;
  onDirty?: () => void;
  label: string;
};

/**
 * Editor per i testi lunghi. Il contenuto finisce in un campo nascosto del
 * modulo, così il salvataggio funziona come un normale invio di form.
 */
export function RichEditor({ name, initialHtml, placeholder, onDirty, label }: Props) {
  const [html, setHtml] = useState(initialHtml);
  const [panel, setPanel] = useState<null | "link" | "image">(null);
  const [linkUrl, setLinkUrl] = useState("");
  const [image, setImage] = useState<{ url: string; alt: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        codeBlock: false,
        code: false,
        link: { openOnClick: false, autolink: true, defaultProtocol: "https" },
      }),
      Image.configure({ inline: false }),
      Placeholder.configure({ placeholder: placeholder ?? "Comincia a scrivere…" }),
    ],
    content: initialHtml,
    editorProps: {
      attributes: {
        class: "tiptap prose-pap min-h-[24rem] px-5 py-6 outline-none sm:px-8",
        "aria-label": label,
        "aria-multiline": "true",
        role: "textbox",
      },
    },
    onUpdate: ({ editor }) => {
      setHtml(editor.isEmpty ? "" : editor.getHTML());
      onDirty?.();
    },
  });

  const state = useEditorState({
    editor,
    selector: ({ editor }) =>
      editor
        ? {
            bold: editor.isActive("bold"),
            italic: editor.isActive("italic"),
            underline: editor.isActive("underline"),
            strike: editor.isActive("strike"),
            h2: editor.isActive("heading", { level: 2 }),
            h3: editor.isActive("heading", { level: 3 }),
            bullet: editor.isActive("bulletList"),
            ordered: editor.isActive("orderedList"),
            quote: editor.isActive("blockquote"),
            link: editor.isActive("link"),
            canUndo: editor.can().undo(),
            canRedo: editor.can().redo(),
            words: editor.getText().trim().split(/\s+/).filter(Boolean).length,
          }
        : null,
  });

  const chain = () => editor!.chain().focus();

  function openLink() {
    setLinkUrl(editor?.getAttributes("link").href ?? "");
    setPanel(panel === "link" ? null : "link");
  }

  function applyLink() {
    const url = linkUrl.trim();
    if (!url) chain().extendMarkRange("link").unsetLink().run();
    else chain().extendMarkRange("link").setLink({ href: /^(https?:|mailto:|\/)/.test(url) ? url : `https://${url}` }).run();
    setPanel(null);
  }

  async function onFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const url = await uploadFile(file, "immagini");
      setImage({ url, alt: "" });
      setPanel("image");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  function insertImage() {
    if (!image || !image.alt.trim()) return;
    chain().setImage({ src: image.url, alt: image.alt.trim() }).run();
    setImage(null);
    setPanel(null);
  }

  return (
    <div className="overflow-hidden rounded-md border-2 border-ink/20 bg-paper focus-within:border-ink">
      <input type="hidden" name={name} value={html} />
      <div
        role="toolbar"
        aria-label="Formattazione del testo"
        className="sticky top-0 z-10 flex flex-wrap items-center gap-0.5 border-b border-ink/15 bg-paper-2 px-2 py-1.5"
      >
        <Tool label="Titoletto" active={state?.h2} onClick={() => chain().toggleHeading({ level: 2 }).run()}>
          <Heading2 />
        </Tool>
        <Tool label="Titoletto piccolo" active={state?.h3} onClick={() => chain().toggleHeading({ level: 3 }).run()}>
          <Heading3 />
        </Tool>
        <Sep />
        <Tool label="Grassetto" shortcut="Ctrl+B" active={state?.bold} onClick={() => chain().toggleBold().run()}>
          <Bold />
        </Tool>
        <Tool label="Corsivo" shortcut="Ctrl+I" active={state?.italic} onClick={() => chain().toggleItalic().run()}>
          <Italic />
        </Tool>
        <Tool label="Sottolineato" shortcut="Ctrl+U" active={state?.underline} onClick={() => chain().toggleUnderline().run()}>
          <Underline />
        </Tool>
        <Tool label="Barrato" active={state?.strike} onClick={() => chain().toggleStrike().run()}>
          <Strikethrough />
        </Tool>
        <Sep />
        <Tool label="Elenco puntato" active={state?.bullet} onClick={() => chain().toggleBulletList().run()}>
          <List />
        </Tool>
        <Tool label="Elenco numerato" active={state?.ordered} onClick={() => chain().toggleOrderedList().run()}>
          <ListOrdered />
        </Tool>
        <Tool label="Citazione in evidenza" active={state?.quote} onClick={() => chain().toggleBlockquote().run()}>
          <Quote />
        </Tool>
        <Tool label="Linea di separazione" onClick={() => chain().setHorizontalRule().run()}>
          <Minus />
        </Tool>
        <Sep />
        <Tool label="Collegamento" active={state?.link || panel === "link"} onClick={openLink}>
          <Link2 />
        </Tool>
        {state?.link && (
          <Tool label="Togli collegamento" onClick={() => chain().extendMarkRange("link").unsetLink().run()}>
            <Unlink />
          </Tool>
        )}
        <Tool label={busy ? "Caricamento immagine…" : "Inserisci immagine"} disabled={busy} onClick={() => fileInput.current?.click()}>
          <ImagePlus className={busy ? "animate-pulse" : ""} />
        </Tool>
        <input
          ref={fileInput}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="sr-only"
          tabIndex={-1}
          aria-hidden
          onChange={(e) => onFile(e.target.files?.[0])}
        />
        <Sep />
        <Tool label="Annulla" shortcut="Ctrl+Z" disabled={!state?.canUndo} onClick={() => chain().undo().run()}>
          <Undo2 />
        </Tool>
        <Tool label="Ripeti" shortcut="Ctrl+Shift+Z" disabled={!state?.canRedo} onClick={() => chain().redo().run()}>
          <Redo2 />
        </Tool>
        <span className="ml-auto pr-2 font-mono text-xs text-ink-mute" aria-live="off">
          {state?.words ?? 0} parole
        </span>
      </div>

      {panel === "link" && (
        <div className="flex flex-wrap items-center gap-2 border-b border-ink/15 bg-paper-2 px-3 py-2">
          <label htmlFor={`${name}-link`} className="text-sm font-semibold">
            Indirizzo
          </label>
          <input
            id={`${name}-link`}
            autoFocus
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                applyLink();
              }
              if (e.key === "Escape") setPanel(null);
            }}
            placeholder="https://…"
            className="min-w-0 flex-1 rounded border-2 border-ink/20 bg-paper px-2 py-1 text-sm outline-none focus:border-tomato"
          />
          <button type="button" className="btn btn-ink px-3 py-1 text-sm" onClick={applyLink}>
            Applica
          </button>
          <button type="button" className="text-sm underline" onClick={() => setPanel(null)}>
            Annulla
          </button>
        </div>
      )}

      {panel === "image" && image && (
        <div className="flex flex-wrap items-end gap-3 border-b border-ink/15 bg-paper-2 px-3 py-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image.url} alt="" className="h-16 w-24 rounded object-cover" />
          <div className="min-w-0 flex-1">
            <label htmlFor={`${name}-alt`} className="block text-sm font-semibold">
              Descrizione dell&apos;immagine <span className="font-normal text-ink-mute">(obbligatoria)</span>
            </label>
            <input
              id={`${name}-alt`}
              autoFocus
              value={image.alt}
              onChange={(e) => setImage({ ...image, alt: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  insertImage();
                }
              }}
              placeholder="Che cosa si vede? Per esempio: la brigata di cucina al lavoro sui forni"
              className="mt-1 w-full rounded border-2 border-ink/20 bg-paper px-2 py-1 text-sm outline-none focus:border-tomato"
            />
          </div>
          <button type="button" className="btn btn-ink px-3 py-1 text-sm" disabled={!image.alt.trim()} onClick={insertImage}>
            Inserisci
          </button>
          <button
            type="button"
            className="text-sm underline"
            onClick={() => {
              setImage(null);
              setPanel(null);
            }}
          >
            Annulla
          </button>
        </div>
      )}

      {error && (
        <p role="alert" className="border-b border-ink/15 bg-[#f6ddd3] px-3 py-2 text-sm font-semibold text-tomato-ink">
          {error}
        </p>
      )}

      {editor ? (
        <EditorContent editor={editor} />
      ) : (
        <div className="min-h-[24rem] px-8 py-6 text-ink-mute">Preparazione dell&apos;editor…</div>
      )}
    </div>
  );
}

function Tool({
  label,
  shortcut,
  active,
  disabled,
  onClick,
  children,
}: {
  label: string;
  shortcut?: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={shortcut ? `${label} (${shortcut})` : label}
      aria-label={label}
      aria-pressed={active === undefined ? undefined : active}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`grid size-9 place-items-center rounded transition [&_svg]:size-[18px] ${
        active ? "bg-ink text-paper" : "hover:bg-paper-3"
      } disabled:opacity-35`}
    >
      {children}
    </button>
  );
}

function Sep() {
  return <span aria-hidden className="mx-1 h-6 w-px bg-ink/15" />;
}
