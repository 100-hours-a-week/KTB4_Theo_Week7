import { Link } from 'react-router'

function AuthLayout({
  title,
  description,
  children,
  footerText,
  footerLinkLabel,
  footerTo,
  backTo,
  backLabel = '이전 페이지로 돌아가기',
  backIconSrc,
  className = '',
  mainClassName = '',
  cardClassName = '',
}) {
  const shellClassName = ['auth-shell', className].filter(Boolean).join(' ')
  const resolvedMainClassName = ['auth-main', mainClassName]
    .filter(Boolean)
    .join(' ')
  const resolvedCardClassName = ['auth-card', 'form-container', cardClassName]
    .filter(Boolean)
    .join(' ')

  return (
    <div className="auth-page">
      <main className={resolvedMainClassName}>
        <section className={shellClassName} aria-labelledby="auth-title">
          <div className="auth-brand">
            <p className="auth-logo" aria-label="코드 한입">
              <span aria-hidden="true">&lt;/&gt;</span>
              코드 한입
            </p>
            <p className="auth-tagline">
              개발자의 성장 한입, 지식의 공유 한입
            </p>
          </div>

          <section className={resolvedCardClassName}>
            {backTo && (
              <Link
                to={backTo}
                className="auth-back-link"
                aria-label={backLabel}
              >
                {backIconSrc ? (
                  <img src={backIconSrc} alt="" aria-hidden="true" />
                ) : (
                  <span aria-hidden="true">←</span>
                )}
              </Link>
            )}

            <h1 className="auth-title" id="auth-title">
              {title}
            </h1>
            <p className="auth-description">{description}</p>

            {children}

            <div className="auth-switch">
              {footerText}{' '}
              <Link to={footerTo} className="text-link">
                {footerLinkLabel}
              </Link>
            </div>
          </section>
        </section>
      </main>
    </div>
  )
}

export default AuthLayout
