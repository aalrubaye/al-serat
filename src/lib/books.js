import booksManifest from '../../public/books/manifest.json'

function cloneBook(book) {
  return {
    ...book,
  }
}

export async function getAllBooks() {
  return Array.isArray(booksManifest) ? booksManifest.map(cloneBook) : []
}

export async function getBookBySlug(slug) {
  const books = await getAllBooks()
  return books.find((book) => book.slug === slug) || null
}
