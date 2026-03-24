import ThemeToggle from './ThemeToggle'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-copy">
          <span className="site-footer-copy-ar">جميع الحقوق محفوظة لموقع الصراط © 2006</span>
          <span className="site-footer-separator">-</span>
          <span className="site-footer-copy-en">al-serat.com</span>
        </div>

        <div className="site-footer-actions">
          <ThemeToggle />
        </div>
      </div>
    </footer>
  )
}
