function FormField({
  id,
  name,
  label,
  guide,
  guideId,
  guideClassName = '',
  helperClassName = '',
  type = 'text',
  value,
  placeholder,
  autoComplete,
  error = '',
  disabled = false,
  required = false,
  maxLength,
  onChange,
  onBlur,
  className = '',
}) {
  const helperId = `${id}-helper`
  const resolvedGuideId = guideId || `${id}-guide`
  const groupClassName = ['form-group', className].filter(Boolean).join(' ')
  const helperClasses = ['helper-text', helperClassName]
    .filter(Boolean)
    .join(' ')
  const describedBy = [guide ? resolvedGuideId : '', error ? helperId : '']
    .filter(Boolean)
    .join(' ')

  return (
    <div className={groupClassName}>
      <label htmlFor={id}>{label}</label>
      {guide && (
        <p className={guideClassName} id={resolvedGuideId}>
          {guide}
        </p>
      )}
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        disabled={disabled}
        required={required}
        maxLength={maxLength}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy || undefined}
        onChange={onChange}
        onBlur={onBlur}
      />
      <p className={helperClasses} id={helperId}>
        {error}
      </p>
    </div>
  )
}

export default FormField
