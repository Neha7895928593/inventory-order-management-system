function FlashBanner({ flash, onRetry, onClose }) {
  if (!flash.message) {
    return null
  }

  return (
    <div className={`flash-banner ${flash.type}`} role="status" aria-live="polite">
      <div className="flash-banner-copy">
        <strong>{flash.type === 'error' ? 'Error' : 'Success'}</strong>
        <span>{flash.message}</span>
      </div>
      <div className="flash-banner-actions">
        {flash.type === 'error' && onRetry ? (
          <button type="button" className="button-secondary" onClick={onRetry}>
            Retry
          </button>
        ) : null}
        <button
          type="button"
          className="icon-button flash-close-button"
          onClick={onClose}
          aria-label="Dismiss notification"
        >
          ×
        </button>
      </div>
    </div>
  )
}

export default FlashBanner
