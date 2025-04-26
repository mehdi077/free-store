"use client";

import { useEditor, EditorContent, BubbleMenu, FloatingMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Underline from '@tiptap/extension-underline';
import YouTube from '@tiptap/extension-youtube';
import Placeholder from '@tiptap/extension-placeholder';
import Typography from '@tiptap/extension-typography';
import FontFamily from '@tiptap/extension-font-family';
import React, { useState, useCallback } from 'react';
import { Button } from './button';
import { 
  Bold, Italic, Underline as UnderlineIcon, List, ListOrdered, Heading, Undo, Redo, 
  AlignLeft, AlignCenter, AlignRight, AlignJustify, Image as ImageIcon, Link as LinkIcon,
  Youtube, Type, Highlighter, Palette, CircleDot, Trash2, FileVideo
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  editorClassName?: string;
}

export const RichTextEditor = ({ value, onChange, placeholder, editorClassName }: RichTextEditorProps) => {
  // State hooks - define all state hooks first
  const [linkUrl, setLinkUrl] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [showImageInput, setShowImageInput] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [showVideoInput, setShowVideoInput] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  
  // Editor initialization hook
  const editor = useEditor({
    extensions: [
      StarterKit,
      Highlight,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify'],
      }),
      Image.configure({
        allowBase64: true,
        inline: true,
      }),
      Link.configure({
        openOnClick: true,
        linkOnPaste: true,
      }),
      TextStyle,
      Color,
      Underline,
      YouTube.configure({
        nocookie: true,
        width: 480,
        height: 320,
      }),
      Placeholder.configure({
        placeholder: placeholder || 'Commencez à écrire...',
      }),
      Typography,
      FontFamily,
    ],
    content: value,
    editorProps: {
      attributes: {
        class: `min-h-[200px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 overflow-y-auto prose prose-sm max-w-none ${editorClassName || ''}`,
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Always define these hooks regardless of editor state to maintain hook order
  const addImage = useCallback(() => {
    if (!editor || !imageUrl) return;
    editor.chain().focus().setImage({ src: imageUrl }).run();
    setImageUrl('');
    setShowImageInput(false);
  }, [editor, imageUrl]);

  const addVideo = useCallback(() => {
    if (!editor) return;
    const videoId = videoUrl.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1];
    if (videoId) {
      editor.chain().focus().setYoutubeVideo({ src: videoId }).run();
      setVideoUrl('');
      setShowVideoInput(false);
    }
  }, [editor, videoUrl]);

  const setLink = useCallback(() => {
    if (!editor || !linkUrl) return;
    editor.chain().focus().setLink({ href: linkUrl }).run();
    setLinkUrl('');
    setShowLinkInput(false);
  }, [editor, linkUrl]);

  if (!editor) {
    return null;
  }

  return (
    <div className="rich-text-editor">
      {editor && (
        <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
          <div className="flex gap-1 p-1 rounded-md shadow-lg bg-background border border-input">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={`p-1 ${editor.isActive('bold') ? 'bg-muted' : ''}`}
              onClick={() => editor.chain().focus().toggleBold().run()}
            >
              <Bold className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={`p-1 ${editor.isActive('italic') ? 'bg-muted' : ''}`}
              onClick={() => editor.chain().focus().toggleItalic().run()}
            >
              <Italic className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={`p-1 ${editor.isActive('underline') ? 'bg-muted' : ''}`}
              onClick={() => editor.chain().focus().toggleUnderline().run()}
            >
              <UnderlineIcon className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={`p-1 ${editor.isActive('highlight') ? 'bg-muted' : ''}`}
              onClick={() => editor.chain().focus().toggleHighlight().run()}
            >
              <Highlighter className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="p-1"
              onClick={() => editor.chain().focus().unsetAllMarks().run()}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </BubbleMenu>
      )}
      
      <div className="toolbar border border-input rounded-t-md flex flex-wrap p-1 gap-1 bg-background">
        {/* Text formatting */}
        <div className="flex flex-wrap gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={`p-1 ${editor.isActive('bold') ? 'bg-muted' : ''}`}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={`p-1 ${editor.isActive('italic') ? 'bg-muted' : ''}`}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={`p-1 ${editor.isActive('underline') ? 'bg-muted' : ''}`}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          >
            <UnderlineIcon className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={`p-1 ${editor.isActive('highlight') ? 'bg-muted' : ''}`}
            onClick={() => editor.chain().focus().toggleHighlight().run()}
          >
            <Highlighter className="h-4 w-4" />
          </Button>
        </div>

        <div className="border-l border-input mx-1"></div>

        {/* Lists */}
        <div className="flex flex-wrap gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={`p-1 ${editor.isActive('bulletList') ? 'bg-muted' : ''}`}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={`p-1 ${editor.isActive('orderedList') ? 'bg-muted' : ''}`}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
        </div>

        <div className="border-l border-input mx-1"></div>

        {/* Headings */}
        <div className="flex flex-wrap gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={`p-1 ${editor.isActive('heading', { level: 2 }) ? 'bg-muted' : ''}`}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          >
            <Type className="h-4 w-4" />
            <span className="ml-1 text-xs">H2</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={`p-1 ${editor.isActive('heading', { level: 3 }) ? 'bg-muted' : ''}`}
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          >
            <Type className="h-4 w-4" />
            <span className="ml-1 text-xs">H3</span>
          </Button>
        </div>

        <div className="border-l border-input mx-1"></div>

        {/* Text alignment */}
        <div className="flex flex-wrap gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={`p-1 ${editor.isActive({ textAlign: 'left' }) ? 'bg-muted' : ''}`}
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={`p-1 ${editor.isActive({ textAlign: 'center' }) ? 'bg-muted' : ''}`}
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={`p-1 ${editor.isActive({ textAlign: 'right' }) ? 'bg-muted' : ''}`}
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
          >
            <AlignRight className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={`p-1 ${editor.isActive({ textAlign: 'justify' }) ? 'bg-muted' : ''}`}
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          >
            <AlignJustify className="h-4 w-4" />
          </Button>
        </div>

        <div className="border-l border-input mx-1"></div>

        {/* Color and text style */}
        <div className="flex flex-wrap gap-1">
          <div className="relative">
            <input 
              type="color"
              onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
              className="w-0 h-0 opacity-0 absolute"
              id="text-color-picker"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="p-1"
              onClick={() => document.getElementById('text-color-picker')?.click()}
            >
              <Palette className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="border-l border-input mx-1"></div>

        {/* Media: Links, Images, Videos */}
        <div className="flex flex-wrap gap-1">
          {/* <div className="relative">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={`p-1 ${editor.isActive('link') ? 'bg-muted' : ''}`}
              onClick={() => {
                if (editor.isActive('link')) {
                  editor.chain().focus().unsetLink().run();
                } else {
                  setShowLinkInput(!showLinkInput);
                  setShowImageInput(false);
                  setShowVideoInput(false);
                }
              }}
            >
              <LinkIcon className="h-4 w-4" />
            </Button>
            {showLinkInput && (
              <div className="absolute left-0 top-8 z-10 bg-background border border-input p-2 rounded-md shadow-md flex items-center gap-2">
                <input
                  type="text"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="px-2 py-1 border border-input rounded-md text-sm w-48"
                />
                <Button size="sm" variant="secondary" onClick={setLink}>
                  Ajouter
                </Button>
              </div>
            )}
          </div> */}

          <div className="relative">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="p-1"
              onClick={() => {
                setShowImageInput(!showImageInput);
                setShowLinkInput(false);
                setShowVideoInput(false);
              }}
            >
              <ImageIcon className="h-4 w-4" />
            </Button>
            {showImageInput && (
              <div className="absolute left-0 top-8 z-10 bg-background border border-input p-2 rounded-md shadow-md flex flex-col gap-2">
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="URL de l'image"
                  className="px-2 py-1 border border-input rounded-md text-sm w-48"
                />
                <Button size="sm" variant="secondary" onClick={addImage} className="w-full">
                  Ajouter
                </Button>
              </div>
            )}
          </div>

          {/* <div className="relative">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="p-1"
              onClick={() => {
                setShowVideoInput(!showVideoInput);
                setShowLinkInput(false);
                setShowImageInput(false);
              }}
            >
              <Youtube className="h-4 w-4" />
            </Button>
            {showVideoInput && (
              <div className="absolute left-0 top-8 z-10 bg-background border border-input p-2 rounded-md shadow-md flex items-center gap-2">
                <input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="URL YouTube"
                  className="px-2 py-1 border border-input rounded-md text-sm w-48"
                />
                <Button size="sm" variant="secondary" onClick={addVideo}>
                  Ajouter
                </Button>
              </div>
            )}
          </div> */}
        </div>

        <div className="border-l border-input mx-1"></div>

        {/* History: Undo, Redo */}
        <div className="flex flex-wrap gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="p-1"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="p-1"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <EditorContent 
        editor={editor} 
        className="border border-t-0 border-input rounded-b-md"
      />
    </div>
  );
};
