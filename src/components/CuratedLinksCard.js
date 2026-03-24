import Link from 'next/link'

export default function CuratedLinksCard({ items }) {
  return (
    <div className="curated-card">
      <h3 className="curated-title">اقرأ أيضاً</h3>

      <ul className="curated-list">
        {items.map((item) => (
          <li key={item.id}>
            <Link href={`/article/${item.slug}`}>
              {item.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}