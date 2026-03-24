'use client'

import { useState } from 'react'

function normalizeTag(value) {
  return value.trim()
}

export default function TagsInput({ value = [], onChange }) {
  const [input, setInput] = useState('')

  function addTag() {
    const tag = normalizeTag(input)
    if (!tag) return

    const exists = value.some(
      (item) => item.toLowerCase() === tag.toLowerCase()
    )

    if (!exists) {
      onChange([...value, tag])
    }

    setInput('')
  }

  function removeTag(tagToRemove) {
    onChange(value.filter((tag) => tag !== tagToRemove))
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  return (
    <div className="tags-input-wrap">
      <input
        type="text"
        placeholder="أضف وسماً..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
      />

      {value.length > 0 && (
        <div className="tags-list">
          {value.map((tag) => (
            <button
              key={tag}
              type="button"
              className="tag-chip"
              onClick={() => removeTag(tag)}
            >
              <span>{tag}</span>
              <span className="tag-chip-x">×</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
