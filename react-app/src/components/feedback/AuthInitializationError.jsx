function AuthInitializationError({ onRetry, isRetrying = false }) {
  return (
    <div className="auth-page auth-initialization-page">
      <main className="auth-main auth-initialization-main">
        <section
          className="auth-shell"
          aria-labelledby="auth-initialization-title"
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

          <section
            className="auth-card auth-initialization-card"
            role="alert"
            aria-live="assertive"
          >
            <div
              className="auth-initialization-icon"
              aria-hidden="true"
            >
              !
            </div>

            <p className="auth-initialization-eyebrow">잠시 쉬어가는 한입</p>
            <h1
              className="auth-title"
              id="auth-initialization-title"
            >
              회원정보를 불러오지 못했어요
            </h1>
            <p className="auth-description auth-initialization-description">
              일시적인 연결 문제일 수 있어요.
              <br />
              잠시 후 다시 한 번 시도해주세요.
            </p>

            <button
              type="button"
              className="primary-button active auth-initialization-retry-button"
              onClick={onRetry}
              disabled={isRetrying}
            >
              {isRetrying ? '다시 불러오는 중...' : '다시 시도하기'}
            </button>

            <p className="auth-initialization-hint">
              로그인 상태는 안전하게 유지되고 있어요.
            </p>
          </section>
        </section>
      </main>
    </div>
  )
}

export default AuthInitializationError
