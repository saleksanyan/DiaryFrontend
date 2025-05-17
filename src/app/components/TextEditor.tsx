'use client';

import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextStyle from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import {
  Bold,
  Italic,
  Strikethrough,
  Image as ImageIcon,
  Link2,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  Pilcrow,
  Sparkles,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import Placeholder from '@tiptap/extension-placeholder';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  className?: string;
  placeholder?: string;
}

export const TextEditor = ({
  content,
  onChange,
  className,
  placeholder = 'Pour your thoughts here... ',
}: RichTextEditorProps) => {
  const [isAIEditing, setIsAIEditing] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      BulletList.configure({
        HTMLAttributes: {
          class: 'list-disc pl-4',
        },
      }),
      OrderedList.configure({
        HTMLAttributes: {
          class: 'list-decimal pl-4',
        },
      }),
      ListItem,
      TextStyle,
      Color,
      Image,
      Link.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === 'heading') {
            return 'Heading placeholder';
          }
          return placeholder;
        },
        emptyEditorClass: 'is-editor-empty',
        showOnlyWhenEditable: true,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'min-h-[300px] p-4 focus:outline-none',
      },
    },
  });

  const handleAIEdit = async (makeFancy: boolean) => {
    if (!editor) return;

    try {
      setIsAIEditing(true);
      setNotification(null);
      const textContent = editor.getText();

      if (!textContent.trim()) {
        setNotification({
          message: 'Please add some text to edit',
          type: 'error',
        });
        return;
      }

      const response = await fetch('http://localhost:3000/post/edit-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: textContent,
          makeFancy,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to enhance text');
      }

      const enhancedText = await response.json();

      editor.commands.clearContent();
      editor.commands.insertContent(enhancedText.enhancedText);

      setNotification({
        message: 'Your text has been enhanced',
        type: 'success',
      });
    } catch (error) {
      setNotification({
        message: 'Failed to enhance text. Please try again.',
        type: 'error',
      });
      console.error('AI editing error:', error);
    } finally {
      setIsAIEditing(false);
    }
  };

  if (!editor) {
    return <div className={`p-4 rounded-lg border ${className}`}>Loading editor...</div>;
  }

  return (
    <div className={`rounded-lg border overflow-hidden ${className}`}>
      <style jsx global>{`
        .ProseMirror h1 {
          font-size: 2em;
          font-weight: bold;
          margin: 0.67em 0;
        }
        .ProseMirror h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin: 0.83em 0;
        }
        .ProseMirror h3 {
          font-size: 1.17em;
          font-weight: bold;
          margin: 1em 0;
        }
        .ProseMirror h4 {
          font-size: 1em;
          font-weight: bold;
          margin: 1.33em 0;
        }
        .ProseMirror h5 {
          font-size: 0.83em;
          font-weight: bold;
          margin: 1.67em 0;
        }
        .ProseMirror h6 {
          font-size: 0.67em;
          font-weight: bold;
          margin: 2.33em 0;
        }
        .ProseMirror ul {
          list-style-type: disc;
          padding-left: 1.5rem;
        }
        .ProseMirror ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
        }
      `}</style>

      {/* Notification */}
      {notification && (
        <div
          className={`p-3 flex items-center justify-between ${
            notification.type === 'success'
              ? 'bg-green-50 text-green-800 border-b border-green-100'
              : 'bg-red-50 text-red-800 border-b border-red-100'
          }`}
        >
          <div>{notification.message}</div>
          <button onClick={() => setNotification(null)} className="text-current hover:opacity-70">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-muted">
        {/* AI Edit Button */}
        <Popover>
          <PopoverTrigger asChild>
            <Button type="button" variant="ghost" size="sm" disabled={isAIEditing}>
              {isAIEditing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              <span className="ml-2 hidden sm:inline">AI Enhance</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-60">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">AI Text Enhancement</h4>
                <p className="text-sm text-muted-foreground">Improve your text with AI</p>
              </div>
              <div className="grid gap-2">
                <Button onClick={() => handleAIEdit(false)} disabled={isAIEditing}>
                  {isAIEditing ? 'Processing...' : 'Basic Edit'}
                </Button>
                <Button onClick={() => handleAIEdit(true)} disabled={isAIEditing} variant="outline">
                  {isAIEditing ? 'Processing...' : 'Make Fancy'}
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Text formatting */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'bg-accent' : ''}
        >
          <Bold className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'bg-accent' : ''}
        >
          <Italic className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={!editor.can().chain().focus().toggleStrike().run()}
          className={editor.isActive('strike') ? 'bg-accent' : ''}
        >
          <Strikethrough className="h-4 w-4" />
        </Button>

        {/* Headings with all 6 levels */}
        <Select
          onValueChange={(value) => {
            if (value === 'paragraph') {
              editor.chain().focus().setParagraph().run();
            } else {
              const level = parseInt(value.replace('heading', '')) as 1 | 2 | 3 | 4 | 5 | 6;
              editor.chain().focus().toggleHeading({ level }).run();
            }
          }}
          value={
            editor.isActive('heading', { level: 1 })
              ? 'heading1'
              : editor.isActive('heading', { level: 2 })
                ? 'heading2'
                : editor.isActive('heading', { level: 3 })
                  ? 'heading3'
                  : editor.isActive('heading', { level: 4 })
                    ? 'heading4'
                    : editor.isActive('heading', { level: 5 })
                      ? 'heading5'
                      : editor.isActive('heading', { level: 6 })
                        ? 'heading6'
                        : 'paragraph'
          }
        >
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue placeholder="Text Style" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="paragraph">
              <div className="flex items-center gap-2">
                <Pilcrow className="h-4 w-4" />
                <span>Paragraph</span>
              </div>
            </SelectItem>
            <SelectItem value="heading1">
              <div className="flex items-center gap-2">
                <Heading1 className="h-4 w-4" />
                <span className="text-lg font-bold">Heading 1</span>
              </div>
            </SelectItem>
            <SelectItem value="heading2">
              <div className="flex items-center gap-2">
                <Heading2 className="h-4 w-4" />
                <span className="text-base font-bold">Heading 2</span>
              </div>
            </SelectItem>
            <SelectItem value="heading3">
              <div className="flex items-center gap-2">
                <Heading3 className="h-4 w-4" />
                <span className="text-sm font-bold">Heading 3</span>
              </div>
            </SelectItem>
            <SelectItem value="heading4">
              <div className="flex items-center gap-2">
                <Heading4 className="h-4 w-4" />
                <span className="text-sm">Heading 4</span>
              </div>
            </SelectItem>
            <SelectItem value="heading5">
              <div className="flex items-center gap-2">
                <Heading5 className="h-4 w-4" />
                <span className="text-xs">Heading 5</span>
              </div>
            </SelectItem>
            <SelectItem value="heading6">
              <div className="flex items-center gap-2">
                <Heading6 className="h-4 w-4" />
                <span className="text-xs">Heading 6</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>

        {/* Lists */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          disabled={!editor.can().chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'bg-accent' : ''}
        >
          <List className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          disabled={!editor.can().chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'bg-accent' : ''}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>

        {/* Link */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={editor.isActive('link') ? 'bg-accent' : ''}
            >
              <Link2 className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Insert Link</h4>
                <p className="text-sm text-muted-foreground">Enter the URL you want to link to</p>
              </div>
              <div className="grid gap-2">
                <Input
                  id="link-url"
                  placeholder="https://example.com"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const url = e.currentTarget.value;
                      if (url) {
                        editor.chain().focus().setLink({ href: url }).run();
                      }
                    }
                  }}
                />
                <Button
                  onClick={() => {
                    const url = (document.getElementById('link-url') as HTMLInputElement)?.value;
                    if (url) {
                      editor.chain().focus().setLink({ href: url }).run();
                    }
                  }}
                >
                  Apply
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Image */}
        <Popover>
          <PopoverTrigger asChild>
            <Button type="button" variant="ghost" size="sm">
              <ImageIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Insert Image</h4>
                <p className="text-sm text-muted-foreground">Enter the image URL</p>
              </div>
              <div className="grid gap-2">
                <Input
                  id="image-url"
                  placeholder="https://example.com/image.jpg"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const url = e.currentTarget.value;
                      if (url) {
                        editor.chain().focus().setImage({ src: url }).run();
                      }
                    }
                  }}
                />
                <Button
                  onClick={() => {
                    const url = (document.getElementById('image-url') as HTMLInputElement)?.value;
                    if (url) {
                      editor.chain().focus().setImage({ src: url }).run();
                    }
                  }}
                >
                  Insert
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Bubble menu */}
      {editor && (
        <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
          <div className="flex bg-background shadow-lg border rounded-md overflow-hidden">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={editor.isActive('bold') ? 'bg-accent' : ''}
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={editor.isActive('italic') ? 'bg-accent' : ''}
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                const previousUrl = editor.getAttributes('link').href;
                const url = window.prompt('URL', previousUrl);
                if (url === null) return;
                if (url === '') {
                  editor.chain().focus().unsetLink().run();
                  return;
                }
                editor.chain().focus().setLink({ href: url }).run();
              }}
              className={editor.isActive('link') ? 'bg-accent' : ''}
            >
              <Link2 className="h-4 w-4" />
            </Button>
          </div>
        </BubbleMenu>
      )}

      {/* Editor content */}
      <div className="relative">
        <EditorContent
          editor={editor}
          className={`min-h-[300px] focus:outline-none ${editor?.isEmpty ? 'is-editor-empty' : ''}`}
          data-placeholder={placeholder}
        />
      </div>
    </div>
  );
};
