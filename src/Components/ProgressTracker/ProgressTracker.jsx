// ProgressTracker.jsx
// Real-time progress display during scan.
// Shows progress bar, current stage, and status message.

import './ProgressTracker.css';

const STAGE_LABELS = {
  'parsing':        '🔍 Validating URL',
  'metadata':       '📡 Connecting to GitHub',
  'resolving':      '🌿 Resolving branch',
  'fetching-tree':  '🌳 Fetching file tree',
  'filtering':      '🔧 Filtering source files',
  'optimizing':     '⚡ Optimizing for analysis',
  'downloading':    '📥 Downloading source files',
  'downloaded':     '✅ Files ready',
  'analyzing':      '🤖 AI Security Analysis',
  'finalizing':     '📋 Generating report',
};

export default function ProgressTracker({ progress, stage, message }) {

  return (
    <div className="progress-container">

      <div className="progress-header">
        <h2>Scanning Repository</h2>
        <span className="progress-percentage">{progress}%</span>
      </div>

      {/* Progress Bar */}
      <div className="progress-bar-track">
        <div
          className="progress-bar-fill"
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>

      {/* Current Stage */}
      {stage && (
        <div className="stage-label">
          {STAGE_LABELS[stage] || stage}
        </div>
      )}

      {/* Status Message */}
      {message && (
        <p className="progress-message">{message}</p>
      )}

      {/* Animated indicator for AI analysis stage */}
      {stage === 'analyzing' && (
        <div className="ai-indicator">
          <div className="pulse-dot" />
          <span>Gemini AI is analyzing your code for vulnerabilities...</span>
        </div>
      )}

    </div>
  );
}