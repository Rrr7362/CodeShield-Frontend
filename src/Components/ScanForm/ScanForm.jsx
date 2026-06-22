// ScanForm.jsx
// URL input form with validation feedback and error display.

import { useState } from 'react';
import './ScanForm.css';

export default function ScanForm({ onSubmit, isLoading, error, onReset }) {
  const [url, setUrl] = useState('');
  const [validationError, setValidationError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    // Client-side pre-validation
    // Catches obvious errors before hitting the server
    if (!url.trim()) {
      setValidationError('Please enter a GitHub repository URL.');
      return;
    }

    if (!url.includes('github.com')) {
      setValidationError('Please enter a valid GitHub URL (e.g. https://github.com/owner/repo)');
      return;
    }

    onSubmit(url.trim());
  };

  // Format retryAfter seconds into minutes:seconds
  const formatRetryAfter = (seconds) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  return (
    <div className="scan-form-container">
      <form onSubmit={handleSubmit} className="scan-form">
        <div className="input-group">
          <input
            type="url"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setValidationError(''); // clear error on type
            }}
            placeholder="https://github.com/owner/repository"
            className={`url-input ${validationError ? 'input-error' : ''}`}
            disabled={isLoading}
            aria-label="GitHub repository URL"
          />
          <button
            type="submit"
            disabled={isLoading || !url.trim()}
            className="scan-button"
          >
            {isLoading ? 'Starting...' : '🔍 Scan Repository'}
          </button>
        </div>

        {/* Client-side validation error */}
        {validationError && (
          <p className="error-text">{validationError}</p>
        )}

        {/* Server-side error */}
        {error && (
          <div className="error-banner">
            <span className="error-icon">⚠️</span>
            <div className="error-content">
              <p className="error-message">{error.message}</p>
              {error.retryAfter && (
                <p className="retry-text">
                  Try again in {formatRetryAfter(error.retryAfter)}
                </p>
              )}
            </div>
            <button onClick={onReset} className="error-dismiss">
              ✕
            </button>
          </div>
        )}
      </form>

      <p className="form-hint">
        Analyzes public GitHub repositories for OWASP Top 10 vulnerabilities
      </p>
    </div>
  );
}