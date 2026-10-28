'use client';

import { useEffect, useRef, useState } from 'react';
import { EditorContent, useEditor, useEditorState, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { uploadFile } from '@/lib/upload-client';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
}

function ToolbarButton({
  label,
  title,
  active = false,
  disabled = false,
  onClick,
}: {
  label: React.ReactNode;
  title: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={active}
      disabled={disabled}
      // Keep the selection in the editor while clicking the toolbar
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`min-w-[2rem] h-8 px-2 rounded text-sm ${
        active ? 'bg-green-100 text-green-800' : 'text-gray-700 hover:bg-gray-100'
      } disabled:opacity-40`}
    >
      {label}
    </button>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      h2: e.isActive('heading', { level: 2 }),
      h3: e.isActive('heading', { level: 3 }),
      bold: e.isActive('bold'),
      italic: e.isActive('italic'),
      link: e.isActive('link'),
      bulletList: e.isActive('bulletList'),
      orderedList: e.isActive('orderedList'),
      blockquote: e.isActive('blockquote'),
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  });

  const setLink = () => {
    const previous = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('Adresa linka (prazno uklanja link)', previous || 'https://');
    if (url === null) return;
    if (url.trim() === '' || url.trim() === 'https://') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run();
    }
  };

  const insertImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    try {
      const src = await uploadFile(file);
      editor.chain().focus().setImage({ src, alt: file.name.replace(/\.[^.]+$/, '') }).run();
    } catch (error) {
      console.error('Image upload failed:', error);
      alert('Greška pri otpremanju slike');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-gray-200 p-2 bg-gray-50 rounded-t-lg">
      <ToolbarButton label="H2" title="Naslov" active={state.h2} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} />
      <ToolbarButton label="H3" title="Podnaslov" active={state.h3} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} />
      <span className="w-px h-6 bg-gray-200 mx-1" />
      <ToolbarButton label={<strong>B</strong>} title="Podebljano" active={state.bold} onClick={() => editor.chain().focus().toggleBold().run()} />
      <ToolbarButton label={<em>I</em>} title="Kurziv" active={state.italic} onClick={() => editor.chain().focus().toggleItalic().run()} />
      <ToolbarButton label="Link" title="Link" active={state.link} onClick={setLink} />
      <span className="w-px h-6 bg-gray-200 mx-1" />
      <ToolbarButton label="• Lista" title="Lista" active={state.bulletList} onClick={() => editor.chain().focus().toggleBulletList().run()} />
      <ToolbarButton label="1. Lista" title="Numerisana lista" active={state.orderedList} onClick={() => editor.chain().focus().toggleOrderedList().run()} />
      <ToolbarButton label="„Citat“" title="Citat" active={state.blockquote} onClick={() => editor.chain().focus().toggleBlockquote().run()} />
      <span className="w-px h-6 bg-gray-200 mx-1" />
      <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/gif,image/webp" className="hidden" onChange={insertImage} />
      <ToolbarButton
        label={uploading ? 'Otpremanje...' : 'Slika'}
        title="Ubaci sliku"
        disabled={uploading}
        onClick={() => fileInput.current?.click()}
      />
      <span className="w-px h-6 bg-gray-200 mx-1" />
      <ToolbarButton label="↶" title="Poništi" disabled={!state.canUndo} onClick={() => editor.chain().focus().undo().run()} />
      <ToolbarButton label="↷" title="Ponovi" disabled={!state.canRedo} onClick={() => editor.chain().focus().redo().run()} />
    </div>
  );
}

// WordPress-style visual editor; reads and writes HTML
export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        link: { openOnClick: false, autolink: true },
      }),
      Image,
    ],
    content: value,
    // Rendered only in the browser; avoids a server/client markup mismatch
    immediatelyRender: false,
    editorProps: {
      attributes: { class: 'prose max-w-none min-h-[400px] p-4 focus:outline-none' },
    },
    onUpdate: ({ editor: e }) => onChange(e.isEmpty ? '' : e.getHTML()),
  });

  // Content loaded after the editor mounted (edit page fetches the post)
  useEffect(() => {
    if (!editor) return;
    const current = editor.isEmpty ? '' : editor.getHTML();
    if (value !== current) editor.commands.setContent(value, { emitUpdate: false });
  }, [editor, value]);

  return (
    <div className="border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-green-500">
      {editor ? <Toolbar editor={editor} /> : <div className="h-12 border-b border-gray-200 bg-gray-50 rounded-t-lg" />}
      <EditorContent editor={editor} />
    </div>
  );
}
