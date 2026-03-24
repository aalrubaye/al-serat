import Header from '../../components/Header'
import Sidebar from '../../components/Sidebar'
import PublicBackButton from '../../components/PublicBackButton'
import ContactForm from '../../components/ContactForm'

export const metadata = {
  title: 'اتصل بنا | الصراط',
}

export default function ContactPage() {
  return (
    <div>
      <Header />

      <div className="layout">
        <Sidebar />

        <main className="main">
          <div className="home-content-wrap">
            <div className="page-top-actions">
              <PublicBackButton fallbackHref="/" />
            </div>

            <div className="topic-page-header">
              <h1 className="page-title">اتصل بنا</h1>
            </div>

            <p className="contact-page-intro">
              إذا كانت لديك ملاحظة، أو استفسار، أو اقتراح يتعلق بموقع الصراط،
              فيمكنك مراسلتنا عبر النموذج التالي.
            </p>

            <ContactForm />
          </div>
        </main>
      </div>
    </div>
  )
}
