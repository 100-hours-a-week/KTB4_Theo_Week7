function LoadingView() {
  return (
    <div className="auth-page auth-loading-page">
      <main className="auth-main auth-loading-main">
        <section
          className="auth-loading-content"
          role="status"
          aria-live="polite"
          aria-label="인증 정보를 불러오는 중"
        >
          <div className="auth-brand">
            <p className="auth-logo" aria-label="코드 한입">
              <span aria-hidden="true">&lt;/&gt;</span>
              코드 한입
            </p>
            <p className="auth-tagline">
              개발자의 성장 한입, 지식의 공유 한입
            </p>
          </div>

          <div className="auth-loading-spinner" aria-hidden="true" />
          <p className="auth-loading-message">
            회원정보를 불러오는 중이에요.
          </p>
          <p className="auth-loading-hint">잠시만 기다려주세요.</p>
        </section>
      </main>
    </div>
  )
}

export default LoadingView
