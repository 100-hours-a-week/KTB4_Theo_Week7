import Header from './Header.jsx'

function AppLayout({
  children,
  pageClassName = '',
  headerClassName = '',
  mainClassName = '',
  headerProps,
}) {
  const mainClasses = ['main', mainClassName].filter(Boolean).join(' ')

  return (
    <div className={pageClassName}>
      <div className="page">
        <Header className={headerClassName} {...headerProps} />
        <main className={mainClasses}>{children}</main>
      </div>
    </div>
  )
}

export default AppLayout
