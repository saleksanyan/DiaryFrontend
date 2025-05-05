'use client'

import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
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
  Pilcrow,
} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  className?: string
}

export const TextEditor = ({ content, onChange, className }: RichTextEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({
        openOnClick: false,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  if (!editor) {
    return <div className={`p-4 rounded-lg border ${className}`}>Loading editor...</div>
  }

  return (
    <div className={`rounded-lg border overflow-hidden ${className}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-muted">
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

        {/* Headings - FIXED */}
        <Select
          onValueChange={(value) => {
            if (value === 'paragraph') {
              editor.chain().focus().setParagraph().run()
            } else {
              const level = parseInt(value.replace('heading', ''))
              editor.chain().focus().run()
            }
          }}
          value={
            editor.isActive('heading', { level: 1 }) 
              ? 'heading1' 
              : editor.isActive('heading', { level: 2 }) 
                ? 'heading2' 
                : editor.isActive('heading', { level: 3 }) 
                  ? 'heading3' 
                  : 'paragraph'
          }
        >
          <SelectTrigger className="w-[120px] h-9">
            <SelectValue placeholder="Text" />
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
                <span>Heading 1</span>
              </div>
            </SelectItem>
            <SelectItem value="heading2">
              <div className="flex items-center gap-2">
                <Heading2 className="h-4 w-4" />
                <span>Heading 2</span>
              </div>
            </SelectItem>
            <SelectItem value="heading3">
              <div className="flex items-center gap-2">
                <Heading3 className="h-4 w-4" />
                <span>Heading 3</span>
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
          className={editor.isActive('bulletList') ? 'bg-accent' : ''}
        >
          <List className="h-4 w-4" />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'bg-accent' : ''}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>

        {/* Link - FIXED */}
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
                <p className="text-sm text-muted-foreground">
                  Enter the URL you want to link to
                </p>
              </div>
              <div className="grid gap-2">
                <Input
                  id="link-url"
                  placeholder="https://example.com"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const url = e.currentTarget.value
                      if (url) {
                        editor.chain().focus().setLink({ href: url }).run()
                      }
                    }
                  }}
                />
                <Button
                  onClick={() => {
                    const url = (document.getElementById('link-url') as HTMLInputElement)?.value
                    if (url) {
                      editor.chain().focus().setLink({ href: url }).run()
                    }
                  }}
                >
                  Apply
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Image - FIXED */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
            >
              <ImageIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Insert Image</h4>
                <p className="text-sm text-muted-foreground">
                  Enter the image URL
                </p>
              </div>
              <div className="grid gap-2">
                <Input
                  id="image-url"
                  placeholder="https://example.com/image.jpg"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const url = e.currentTarget.value
                      if (url) {
                        editor.chain().focus().setImage({ src: url }).run()
                      }
                    }
                  }}
                />
                <Button
                  onClick={() => {
                    const url = (document.getElementById('image-url') as HTMLInputElement)?.value
                    if (url) {
                      editor.chain().focus().setImage({ src: url }).run()
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

      {/* Bubble menu - FIXED */}
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
                const previousUrl = editor.getAttributes('link').href
                const url = window.prompt('URL', previousUrl)
                if (url === null) return
                if (url === '') {
                  editor.chain().focus().unsetLink().run()
                  return
                }
                editor.chain().focus().setLink({ href: url }).run()
              }}
              className={editor.isActive('link') ? 'bg-accent' : ''}
            >
              <Link2 className="h-4 w-4" />
            </Button>
          </div>
        </BubbleMenu>
      )}

      {/* Editor content */}
      <EditorContent
        editor={editor}
        className={`min-h-[300px] p-4 focus:outline-none ${className}`}
      />
    </div>
  )
}