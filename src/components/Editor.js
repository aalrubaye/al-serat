'use client'

import { useRef, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Underline from '@tiptap/extension-underline'
import Youtube from '@tiptap/extension-youtube'
import { uploadAdminMediaFile } from '../lib/adminMediaUpload'

const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      dataSize: {
        default: 'medium',
        parseHTML: (element) => element.getAttribute('data-size') || 'medium',
        renderHTML: (attributes) => ({
          'data-size': attributes.dataSize || 'medium',
        }),
      },
    }
  },
})

const CustomYoutube = Youtube.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      dataSize: {
        default: 'medium',
        parseHTML: (element) => element.getAttribute('data-size') || 'medium',
        renderHTML: (attributes) => ({
          'data-size': attributes.dataSize || 'medium',
        }),
      },
    }
  },
})

export default function Editor({ value, onChange }) {
  const fileInputRef = useRef(null)
  const [isImageActive, setIsImageActive] = useState(false)
  const [currentImageSize, setCurrentImageSize] = useState('medium')
  const [isVideoActive, setIsVideoActive] = useState(false)
  const [currentVideoSize, setCurrentVideoSize] = useState('medium')

  const editor = useEditor({
    extensions: [
      StarterKit,
      CustomImage,
      Underline,
      CustomYoutube.configure({
        width: 640,
        height: 360,
      }),
    ],
    content: value || '<p></p>',
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose-mirror-editor',
      },
    },
    onCreate({ editor }) {
      const imageActive = editor.isActive('image')
      const videoActive = editor.isActive('youtube')
      setIsImageActive(imageActive)
      setCurrentImageSize(editor.getAttributes('image').dataSize || 'medium')
      setIsVideoActive(videoActive)
      setCurrentVideoSize(editor.getAttributes('youtube').dataSize || 'medium')
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML())
    },
    onSelectionUpdate({ editor }) {
      const imageActive = editor.isActive('image')
      const videoActive = editor.isActive('youtube')
      setIsImageActive(imageActive)
      setCurrentImageSize(editor.getAttributes('image').dataSize || 'medium')
      setIsVideoActive(videoActive)
      setCurrentVideoSize(editor.getAttributes('youtube').dataSize || 'medium')
    },
  })

  async function handleLocalImageChange(e) {
    const file = e.target.files?.[0]
    if (!file || !editor) return
    e.target.value = ''

    try {
      const src = await uploadAdminMediaFile(file, 'content')
      editor.chain().focus().setImage({ src, dataSize: 'medium' }).run()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'تعذر رفع الصورة')
    }
  }

  function handleImageLink() {
    if (!editor) return
    const url = prompt('Image URL')
    if (!url) return
    editor.chain().focus().setImage({ src: url, dataSize: 'medium' }).run()
  }

  function handleYoutubeLink() {
    if (!editor) return
    const url = prompt('YouTube URL')
    if (!url) return
    editor.commands.setYoutubeVideo({ src: url, dataSize: 'medium' })
  }

  function setImageSize(size) {
    if (!editor || !editor.isActive('image')) return
    editor.chain().focus().updateAttributes('image', { dataSize: size }).run()
    setCurrentImageSize(size)
  }

  function setVideoSize(size) {
    if (!editor || !editor.isActive('youtube')) return
    editor.chain().focus().updateAttributes('youtube', { dataSize: size }).run()
    setCurrentVideoSize(size)
  }

  if (!editor) return null

  return (
    <div className="editor">
      <div className="editor-toolbar">
        <button
          type="button"
          className={editor.isActive('bold') ? 'is-active' : ''}
          onClick={() => editor.chain().focus().toggleBold().run()}
          aria-label="Bold"
          title="Bold"
        >
          <span className="editor-icon editor-icon-bold">B</span>
        </button>

        <button
          type="button"
          className={editor.isActive('italic') ? 'is-active' : ''}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          aria-label="Italic"
          title="Italic"
        >
          <span className="editor-icon editor-icon-italic">I</span>
        </button>

        <button
          type="button"
          className={editor.isActive('underline') ? 'is-active' : ''}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          aria-label="Underline"
          title="Underline"
        >
          <span className="editor-icon editor-icon-underline">U</span>
        </button>

        <button
          type="button"
          onClick={handleYoutubeLink}
          aria-label="YouTube Link"
          title="YouTube Link"
        >
          <span className="editor-icon editor-icon-text">YouTube Link</span>
        </button>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          aria-label="Upload Image"
          title="Upload Image"
        >
          <span className="editor-icon editor-icon-text">Upload Image</span>
        </button>

        <button
          type="button"
          onClick={handleImageLink}
          aria-label="Image Link"
          title="Image Link"
        >
          <span className="editor-icon editor-icon-text">Image Link</span>
        </button>

        {isImageActive && (
          <>
            <div className="editor-divider" aria-hidden="true" />

            <div className="editor-media-size-wrap">
              <span className="editor-media-size-label">حجم الصورة</span>

              <div className="editor-image-size-group is-active" aria-label="حجم الصورة">
                <button
                  type="button"
                  className={currentImageSize === 'large' ? 'is-active' : ''}
                  onClick={() => setImageSize('large')}
                >
                  <span className="editor-icon editor-icon-text">كبير</span>
                </button>

                <button
                  type="button"
                  className={currentImageSize === 'medium' ? 'is-active' : ''}
                  onClick={() => setImageSize('medium')}
                >
                  <span className="editor-icon editor-icon-text">متوسط</span>
                </button>

                <button
                  type="button"
                  className={currentImageSize === 'small' ? 'is-active' : ''}
                  onClick={() => setImageSize('small')}
                >
                  <span className="editor-icon editor-icon-text">صغير</span>
                </button>
              </div>
            </div>
          </>
        )}

        {isVideoActive && (
          <>
            <div className="editor-divider" aria-hidden="true" />

            <div className="editor-media-size-wrap">
              <span className="editor-media-size-label">حجم الفيديو</span>

              <div className="editor-image-size-group is-active" aria-label="حجم الفيديو">
                <button
                  type="button"
                  className={currentVideoSize === 'large' ? 'is-active' : ''}
                  onClick={() => setVideoSize('large')}
                >
                  <span className="editor-icon editor-icon-text">كبير</span>
                </button>

                <button
                  type="button"
                  className={currentVideoSize === 'medium' ? 'is-active' : ''}
                  onClick={() => setVideoSize('medium')}
                >
                  <span className="editor-icon editor-icon-text">متوسط</span>
                </button>

                <button
                  type="button"
                  className={currentVideoSize === 'small' ? 'is-active' : ''}
                  onClick={() => setVideoSize('small')}
                >
                  <span className="editor-icon editor-icon-text">صغير</span>
                </button>
              </div>
            </div>
          </>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="editor-file-input"
          onChange={handleLocalImageChange}
        />
      </div>

      <EditorContent editor={editor} />
    </div>
  )
}
