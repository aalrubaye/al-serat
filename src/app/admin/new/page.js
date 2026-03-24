'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Editor from '../../../components/Editor'
import TagsInput from '../../../components/TagsInput'
import AdminLogoutButton from '../../../components/AdminLogoutButton'
import AdminBackLink from '../../../components/AdminBackLink'
import { toEnglishSlug } from '../../../lib/slugify'

export default function NewArticlePage() {
  const router = useRouter()
  const thumbnailInputRef = useRef(null)

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [slugDraft, setSlugDraft] = useState('')
  const [slugEditable, setSlugEditable] = useState(false)
  const [slugManual, setSlugManual] = useState(false)

  const [summary, setSummary] = useState('')
  const [thumbnailImage, setThumbnailImage] = useState('')
  const [content, setContent] = useState('')
  const [topicId, setTopicId] = useState('')
  const [tags, setTags] = useState([])
  const [topics, setTopics] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingTopics, setLoadingTopics] = useState(true)
  const [contentType, setContentType] = useState('article')

  useEffect(() => {
    async function loadTopics() {
      const { data } = await supabase
        .from('topics')
        .select('id, name')
        .order('name', { ascending: true })

      setTopics(data || [])
      setLoadingTopics(false)
    }

    loadTopics()
  }, [])

  useEffect(() => {
    if (!slugManual && !slugEditable) {
      const autoSlug = toEnglishSlug(title)
      setSlug(autoSlug)
      setSlugDraft(autoSlug)
    }
  }, [title, slugManual, slugEditable])

  function handleEnableSlugEdit() {
    setSlugDraft(slug)
    setSlugEditable(true)
  }

  function handleSaveSlugChanges() {
    const nextSlug = toEnglishSlug(slugDraft)

    if (!nextSlug) {
      alert('يرجى إدخال slug صالح بالإنجليزية')
      return
    }

    setSlug(nextSlug)
    setSlugDraft(nextSlug)
    setSlugEditable(false)
    setSlugManual(true)
  }

  async function handleThumbnailFileChange(event) {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setThumbnailImage(reader.result)
      }
    }

    reader.readAsDataURL(file)
    event.target.value = ''
  }

  async function saveArticle(status) {
    const effectiveSlug = toEnglishSlug(slugEditable ? slugDraft : slug)

    if (!title.trim()) {
      alert('يرجى إدخال عنوان المقال')
      return
    }

    if (!effectiveSlug.trim()) {
      alert('يرجى إدخال الرابط المختصر للمقال')
      return
    }

    if (!content.trim()) {
      alert('يرجى إدخال محتوى المقال')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/admin/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          slug: effectiveSlug,
          summary,
          image: thumbnailImage.trim(),
          content,
          topicId,
          tagsInput: tags.join(', '),
          status,
          contentType,
        }),
      })

      const data = await res.json()
      setLoading(false)

      if (!res.ok) {
        alert(data.error || 'حدث خطأ أثناء حفظ المقال')
        return
      }

      setSlug(effectiveSlug)
      setSlugDraft(effectiveSlug)
      setSlugEditable(false)
      setSlugManual(true)

      router.push('/admin/dashboard')
    } catch {
      setLoading(false)
      alert('تعذر الاتصال بالخادم')
    }
  }

  return (
    <main className="admin-page">
      <div className="admin-card wide">
        <div className="admin-page-topbar">
          <h1>مقال جديد</h1>

          <div className="admin-topbar-actions">
            <AdminLogoutButton />

            <AdminBackLink />
          </div>
        </div>

        <div className="admin-form">
          <input
            type="text"
            placeholder="عنوان المقال"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div className="admin-inline-settings">
            <div className="admin-inline-setting">
              <div className="slug-field-row">
                <input
                  type="text"
                  placeholder="الرابط"
                  value={slugEditable ? slugDraft : slug}
                  disabled={!slugEditable}
                  onChange={(e) => setSlugDraft(e.target.value)}
                />

                {slugEditable ? (
                  <button
                    type="button"
                    className="slug-edit-btn"
                    onClick={handleSaveSlugChanges}
                  >
                    حفظ التغييرات
                  </button>
                ) : (
                  <button
                    type="button"
                    className="slug-edit-btn"
                    onClick={handleEnableSlugEdit}
                  >
                    تعديل
                  </button>
                )}
              </div>
            </div>

            <div className="admin-inline-setting">
              <div className="admin-radio-group">
                <span className="admin-radio-group-label">نوع الإضافة</span>

                <label className={`admin-radio-pill ${contentType === 'article' ? 'is-selected' : ''}`}>
                  <input
                    type="radio"
                    name="contentType"
                    value="article"
                    checked={contentType === 'article'}
                    onChange={(e) => setContentType(e.target.value)}
                  />
                  <span>مقال</span>
                </label>

                <label className={`admin-radio-pill ${contentType === 'video' ? 'is-selected' : ''}`}>
                  <input
                    type="radio"
                    name="contentType"
                    value="video"
                    checked={contentType === 'video'}
                    onChange={(e) => setContentType(e.target.value)}
                  />
                  <span>فيديو</span>
                </label>
              </div>
            </div>
          </div>

          <textarea
            placeholder="ملخص المقال"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={3}
          />

          <select
            className={!topicId ? 'admin-select-empty' : ''}
            value={topicId}
            onChange={(e) => setTopicId(e.target.value)}
            disabled={loadingTopics}
          >
            <option value="">اختر القسم</option>
            {topics.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.name}
              </option>
            ))}
          </select>

          <TagsInput value={tags} onChange={setTags} />

          <Editor value={content} onChange={setContent} />

          <div className="admin-thumbnail-field">
            <div className="admin-thumbnail-field-head">
              <span className="admin-thumbnail-field-label">الصورة المصغرة</span>
              <button
                type="button"
                className="admin-thumbnail-upload-btn"
                onClick={() => thumbnailInputRef.current?.click()}
              >
                رفع صورة
              </button>
            </div>

            <input
              ref={thumbnailInputRef}
              type="file"
              accept="image/*"
              className="admin-thumbnail-file-input"
              onChange={handleThumbnailFileChange}
            />

            {thumbnailImage ? (
              <div className="admin-thumbnail-preview">
                <img
                  src={thumbnailImage}
                  alt="معاينة الصورة المصغرة"
                  className="admin-thumbnail-preview-image"
                />

                <button
                  type="button"
                  className="admin-thumbnail-clear-btn"
                  onClick={() => setThumbnailImage('')}
                >
                  إزالة الصورة
                </button>
              </div>
            ) : (
              <p className="admin-thumbnail-help">
                اختيارية. إذا أضفتها فستُستخدم كصورة مصغرة للبطاقة.
              </p>
            )}
          </div>

          <div className="admin-actions-row">
            <button
              type="button"
              onClick={() => saveArticle('draft')}
              disabled={loading}
            >
              {loading ? 'جارٍ الحفظ...' : 'حفظ كمسودة'}
            </button>

            <button
              type="button"
              onClick={() => saveArticle('published')}
              disabled={loading}
            >
              {loading ? 'جارٍ الحفظ...' : 'نشر المقال'}
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
