import { readdir, readFile, stat } from 'fs/promises'
import path from 'path'
import { toEnglishSlug } from './slugify'

const BOOKS_PUBLIC_ROOT = path.join(process.cwd(), 'public', 'books')
const SUMMARY_DIR = path.join(BOOKS_PUBLIC_ROOT, 'summary')
const COVERS_DIR = path.join(BOOKS_PUBLIC_ROOT, 'covers')
const PDFS_DIR = path.join(BOOKS_PUBLIC_ROOT, 'pdfs')

function parseBookSummary(content) {
  const normalized = String(content || '').replace(/\r\n/g, '\n')
  const titleMatch = normalized.match(/title:\s*\n([\s\S]*?)\n\s*executive summary:/i)
  const executiveMatch = normalized.match(
    /executive summary:\s*\n([\s\S]*?)\n\s*long summary:/i
  )
  const longMatch = normalized.match(/long summary:\s*\n([\s\S]*)$/i)

  return {
    title: titleMatch?.[1]?.trim() || '',
    executiveSummary: executiveMatch?.[1]?.trim() || '',
    longSummary: longMatch?.[1]?.trim() || '',
  }
}

function formatArabicNumber(value) {
  return new Intl.NumberFormat('ar-u-nu-arab').format(value)
}

function getBookNumberFromFileName(fileName) {
  const match = String(fileName || '').match(/book(\d+)/i)
  return match ? Number(match[1]) : 0
}

function buildBookSlug(number, title) {
  const titleSlug = toEnglishSlug(title)
  return titleSlug ? `book-${String(number).padStart(2, '0')}-${titleSlug}` : `book-${String(number).padStart(2, '0')}`
}

function buildCoverMap(fileNames) {
  return fileNames.reduce((acc, fileName) => {
    const number = getBookNumberFromFileName(fileName)
    if (!number) return acc
    acc[number] = `/books/covers/${fileName}`
    return acc
  }, {})
}

function buildPdfMap(fileNames) {
  return fileNames.reduce((acc, fileName) => {
    const number = getBookNumberFromFileName(fileName)
    if (!number) return acc
    acc[number] = {
      publicPath: `/books/pdfs/${fileName}`,
      fileName,
      absolutePath: path.join(PDFS_DIR, fileName),
    }
    return acc
  }, {})
}

function formatEnglishDecimal(value, maximumFractionDigits = 1) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits,
  }).format(value)
}

function formatPdfSize(bytes) {
  if (!bytes || bytes <= 0) return ''

  const mb = bytes / (1024 * 1024)

  if (mb >= 1) {
    return `${formatEnglishDecimal(mb)} MB`
  }

  const kb = bytes / 1024
  return `${formatEnglishDecimal(kb)} KB`
}

export async function getAllBooks() {
  const [summaryFiles, coverFiles, pdfFiles] = await Promise.all([
    readdir(SUMMARY_DIR),
    readdir(COVERS_DIR),
    readdir(PDFS_DIR),
  ])

  const coverMap = buildCoverMap(coverFiles)
  const pdfMap = buildPdfMap(pdfFiles)

  const books = await Promise.all(
    summaryFiles
      .filter((fileName) => /\.txt$/i.test(fileName))
      .sort((left, right) => getBookNumberFromFileName(left) - getBookNumberFromFileName(right))
      .map(async (fileName) => {
        const number = getBookNumberFromFileName(fileName)
        const summaryPath = path.join(SUMMARY_DIR, fileName)
        const rawSummary = await readFile(summaryPath, 'utf8')
        const parsed = parseBookSummary(rawSummary)
        const slug = buildBookSlug(number, parsed.title)
        const pdfEntry = pdfMap[number]
        const pdfStats = pdfEntry ? await stat(pdfEntry.absolutePath) : null

        return {
          id: `book${String(number).padStart(2, '0')}`,
          number,
          numberLabel: formatArabicNumber(number),
          slug,
          title: parsed.title,
          executiveSummary: parsed.executiveSummary,
          longSummary: parsed.longSummary,
          coverSrc: coverMap[number] || '',
          pdfSrc: pdfEntry?.publicPath || '',
          fileFormat: pdfEntry ? 'PDF' : '',
          fileSizeLabel: pdfStats ? formatPdfSize(pdfStats.size) : '',
        }
      })
  )

  return books
}

export async function getBookBySlug(slug) {
  const books = await getAllBooks()
  return books.find((book) => book.slug === slug) || null
}
