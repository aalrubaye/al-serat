'use client'

export default function PrintButton() {
  function handlePrint(event) {
    event.preventDefault()
    event.stopPropagation()
    window.print()
  }

  return (
    <button
      type="button"
      className="print-icon-btn"
      onClick={handlePrint}
      aria-label="طباعة"
      title="طباعة"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M7 3.75h10a1.25 1.25 0 0 1 1.25 1.25v3H5.75V5A1.25 1.25 0 0 1 7 3.75Zm-1.25 9.5h12.5v5a1.25 1.25 0 0 1-1.25 1.25H7A1.25 1.25 0 0 1 5.75 18.25v-5Zm12.5-1.5h1a1 1 0 0 0 1-1V9.5A2.75 2.75 0 0 0 17.5 6.75h-11A2.75 2.75 0 0 0 3.75 9.5v1.25a1 1 0 0 0 1 1h1V9h12.5v2.75ZM8 15h8v1.5H8V15Z"
          fill="currentColor"
        />
      </svg>
      <span>طباعة</span>
    </button>
  )
}
