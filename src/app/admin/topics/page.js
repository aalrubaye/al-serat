'use client'

import { useEffect, useState } from 'react'
import AdminLogoutButton from '../../../components/AdminLogoutButton'
import AdminBackLink from '../../../components/AdminBackLink'

export default function AdminTopicsPage() {
  const [topics, setTopics] = useState([])
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')

  async function loadTopics() {
    const res = await fetch('/api/admin/topics', { method: 'GET' })
    const data = await res.json()

    if (!res.ok) {
      alert(data.error || 'حدث خطأ أثناء تحميل المواضيع')
      setTopics([])
      setLoading(false)
      return
    }

    setTopics(data || [])
    setLoading(false)
  }

  useEffect(() => {
    loadTopics()
  }, [])

  async function handleCreate(e) {
    e.preventDefault()

    if (!name.trim()) return

    setSaving(true)

    const res = await fetch('/api/admin/topics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    })

    const data = await res.json()
    setSaving(false)

    if (!res.ok) {
      alert(data.error || 'حدث خطأ أثناء إنشاء الموضوع')
      return
    }

    setName('')
    loadTopics()
  }

  async function handleUpdate(id) {
    if (!editName.trim()) return

    const res = await fetch(`/api/admin/topics/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: editName }),
    })

    const data = await res.json()

    if (!res.ok) {
      alert(data.error || 'حدث خطأ أثناء تعديل الموضوع')
      return
    }

    setEditingId(null)
    setEditName('')
    loadTopics()
  }

  async function handleDelete(id) {
    const ok = window.confirm('هل أنت متأكد من حذف هذا الموضوع؟')

    if (!ok) return

    const res = await fetch(`/api/admin/topics/${id}`, {
      method: 'DELETE',
    })

    const data = await res.json()

    if (!res.ok) {
      alert(data.error || 'حدث خطأ أثناء حذف الموضوع')
      return
    }

    loadTopics()
  }

  return (
    <main className="admin-page">
      <div className="admin-card wide">
        <div className="admin-page-topbar">
          <h1>إدارة الأقسام</h1>

          <div className="admin-topbar-actions">
            <AdminLogoutButton />

            <AdminBackLink />
          </div>
        </div>

        <form className="admin-form admin-topics-form" onSubmit={handleCreate}>
          <input
            type="text"
            placeholder="اسم القسم"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <button type="submit" disabled={saving}>
            {saving ? 'جاري الحفظ...' : 'إضافة قسم'}
          </button>
        </form>

        <div className="admin-topics-list">
          {loading ? (
            <p>جاري التحميل...</p>
          ) : topics.length ? (
            topics.map((topic) => (
              <div key={topic.id} className="admin-topic-row">
                {editingId === topic.id ? (
                  <>
                    <div className="admin-topic-main">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                      />
                    </div>

                    <div className="admin-actions">
                      <button
                        type="button"
                        className="admin-action-btn admin-update-btn"
                        onClick={() => handleUpdate(topic.id)}
                      >
                        حفظ
                      </button>
                      <button
                        type="button"
                        className="admin-action-btn admin-cancel-btn"
                        onClick={() => {
                          setEditingId(null)
                          setEditName('')
                        }}
                      >
                        إلغاء
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="admin-topic-main">
                      <strong>{topic.name}</strong>
                    </div>

                    <div className="admin-actions">
                      <button
                        type="button"
                        className="admin-action-btn admin-update-btn"
                        onClick={() => {
                          setEditingId(topic.id)
                          setEditName(topic.name)
                        }}
                      >
                        تعديل
                      </button>
                      <button
                        type="button"
                        className="admin-action-btn admin-delete-btn"
                        onClick={() => handleDelete(topic.id)}
                      >
                        حذف
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          ) : (
            <p>لا توجد مواضيع بعد</p>
          )}
        </div>
      </div>
    </main>
  )
}
