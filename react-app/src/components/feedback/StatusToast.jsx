function StatusToast({ isVisible, className = '', children }) {
  return (
    <p className={className} role="status" hidden={!isVisible}>
      {children}
    </p>
  )
}

export default StatusToast
