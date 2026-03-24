import { readFile } from 'fs/promises'
import path from 'path'
import Header from '../../components/Header'
import Sidebar from '../../components/Sidebar'
import PublicBackButton from '../../components/PublicBackButton'

const socialLinks = [
  {
    href: 'https://www.facebook.com/jameelalrubaiee',
    label: 'فيسبوك',
    className: 'is-facebook',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M13.5 21v-7h2.4l.4-3h-2.8V9.2c0-.9.3-1.6 1.7-1.6h1.2V5a15.7 15.7 0 0 0-2.1-.2c-2.1 0-3.6 1.3-3.6 3.8V11H8.4v3h2.3v7h2.8Z" />
      </svg>
    ),
  },
  {
    href: 'https://t.me/Jameelalrubaiee',
    label: 'تلغرام',
    className: 'is-telegram',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20.7 4.3 3.9 10.8c-1.1.4-1.1 1 .2 1.4l4.3 1.3 1.7 5.2c.2.6.1.8.8.8.5 0 .7-.2 1-.5l2.4-2.3 5 3.7c.9.5 1.5.2 1.7-.8l2.9-13.8c.3-1.2-.4-1.8-1.5-1.3ZM9.1 13.2l9-5.6c.5-.3.9-.1.5.2l-7.5 6.8-.3 3.3-1.7-4.7Z" />
      </svg>
    ),
  },
  {
    href: 'https://www.youtube.com/@jameelalrubaiee',
    label: 'يوتيوب',
    className: 'is-youtube',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M21.1 7.2a2.7 2.7 0 0 0-1.9-1.9C17.5 5 12 5 12 5s-5.5 0-7.2.3a2.7 2.7 0 0 0-1.9 1.9C2.6 8.9 2.6 12 2.6 12s0 3.1.3 4.8a2.7 2.7 0 0 0 1.9 1.9C6.5 19 12 19 12 19s5.5 0 7.2-.3a2.7 2.7 0 0 0 1.9-1.9c.3-1.7.3-4.8.3-4.8s0-3.1-.3-4.8ZM10.2 15.3V8.7l5.7 3.3-5.7 3.3Z" />
      </svg>
    ),
  },
]

async function readParagraphs(filename) {
  const filePath = path.join(process.cwd(), 'src/content', filename)
  const text = await readFile(filePath, 'utf8')

  return text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
}

async function readRichTextBlocks(filename) {
  const filePath = path.join(process.cwd(), 'src/content', filename)
  const text = await readFile(filePath, 'utf8')
  const lines = text.split('\n')
  const blocks = []
  let paragraphBuffer = []
  let bulletBuffer = []
  let inBulletMode = false

  const flushParagraph = () => {
    const paragraph = paragraphBuffer.join(' ').trim()

    if (paragraph) {
      blocks.push({ type: 'paragraph', content: paragraph })
    }

    paragraphBuffer = []
  }

  const flushBullets = () => {
    if (bulletBuffer.length) {
      blocks.push({ type: 'bullets', items: bulletBuffer })
    }

    bulletBuffer = []
  }

  for (const rawLine of lines) {
    const line = rawLine.trim()

    if (line === '[bullet points]') {
      flushParagraph()
      inBulletMode = true
      continue
    }

    if (line === '[bullet points ended]') {
      flushBullets()
      inBulletMode = false
      continue
    }

    if (!line) {
      if (inBulletMode) {
        flushBullets()
      } else {
        flushParagraph()
      }
      continue
    }

    if (inBulletMode) {
      bulletBuffer.push(line)
    } else {
      paragraphBuffer.push(line)
    }
  }

  if (inBulletMode) {
    flushBullets()
  } else {
    flushParagraph()
  }

  return blocks
}

function renderTextBlocks(blocks) {
  return blocks.map((block, index) => {
    if (block.type === 'bullets') {
      return (
        <ul key={`bullets-${index}`} className="about-bullet-list">
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )
    }

    return <p key={`paragraph-${index}`}>{block.content}</p>
  })
}

export default async function AboutPage() {
  const [aboutSummary, aboutSiteMessage, authorIntro, authorBooks, authorBio] =
    await Promise.all([
      readParagraphs('about_summary.txt'),
      readParagraphs('about_site_message.txt'),
      readParagraphs('author_intro.txt'),
      readRichTextBlocks('author_books.txt'),
      readParagraphs('author.txt'),
    ])

  return (
    <div>
      <Header />

      <div className="layout">
        <Sidebar />

        <main className="main">
          <div className="about-page-wrap">
            <div className="page-top-actions">
              <PublicBackButton fallbackHref="/" />
            </div>

            <div className="topic-page-header">
              <h1 className="page-title">عن الصراط</h1>
            </div>

            <section className="about-overview-card">
              <div className="about-logo-placeholder" aria-hidden="true">
                <img
                  src="/site logo.png"
                  alt="شعار موقع الصراط"
                  className="about-site-logo"
                />
              </div>

              <div className="about-overview-text">
                <div className="about-section-header">
                  <h2>نبذة عن الموقع</h2>
                </div>

                {aboutSummary.map((paragraph, index) => (
                  <p
                    key={paragraph}
                    className={index === 0 ? 'about-lead' : undefined}
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>

            <section className="about-section">
              <div className="about-section-header">
                <h2>رسالة الموقع</h2>
              </div>

              {aboutSiteMessage.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </section>

            <section className="about-author-card">
              <div className="about-author-text">
                <div className="about-section-header">
                  <h2>الشيخ جميل الربيعي</h2>
                </div>

                <div className="about-author-image-block">
                  <img
                    src="/author.jpg"
                    alt="صورة الشيخ جميل الربيعي"
                    className="about-author-mini-image"
                  />
                </div>

                <div className="about-author-subsection">
                  {authorIntro.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>

                <div className="about-author-subsection">
                  <div className="about-section-header">
                    <h2>المؤلفات</h2>
                  </div>

                  {renderTextBlocks(authorBooks)}

                  <div className="about-book-covers" aria-label="أغلفة مؤلفات الشيخ جميل الربيعي">
                    <img
                      src="/book1.png"
                      alt="غلاف الكتاب الأول"
                      className="about-book-cover-image"
                    />
                    <img
                      src="/book2.png"
                      alt="غلاف الكتاب الثاني"
                      className="about-book-cover-image"
                    />
                    <img
                      src="/book3.png"
                      alt="غلاف الكتاب الثالث"
                      className="about-book-cover-image"
                    />
                  </div>
                </div>

                <div className="about-author-subsection">
                  <div className="about-section-header">
                    <h2>تاريخ الشيخ جميل الربيعي</h2>
                  </div>

                  {authorBio.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </div>
            </section>

            <section className="about-follow-section">
              <p className="about-follow-text">
                يمكن متابعة الشيخ جميل الربيعي عبر المنصات التالية.
              </p>

              <div className="about-follow-grid">
                {socialLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className={`about-follow-card ${link.className}`}
                  >
                    <span className="about-follow-icon">{link.icon}</span>
                    <span className="about-follow-name">{link.label}</span>
                  </a>
                ))}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}
