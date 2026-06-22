// ReportDashboard.jsx
// Renders the complete vulnerability report.
// Composed of: summary cards, vulnerability list, positives.

import './ReportDashboard.css';

const SEVERITY_CONFIG = {
  critical: { color: '#FF4444', bg: '#FF444415', label: 'Critical', icon: '🔴' },
  high:     { color: '#FF8800', bg: '#FF880015', label: 'High',     icon: '🟠' },
  medium:   { color: '#FFAA00', bg: '#FFAA0015', label: 'Medium',   icon: '🟡' },
  low:      { color: '#00AA44', bg: '#00AA4415', label: 'Low',      icon: '🟢' },
};

const OWASP_URLS = {
  'A01:2021': 'https://owasp.org/Top10/A01_2021-Broken_Access_Control/',
  'A02:2021': 'https://owasp.org/Top10/A02_2021-Cryptographic_Failures/',
  'A03:2021': 'https://owasp.org/Top10/A03_2021-Injection/',
  'A04:2021': 'https://owasp.org/Top10/A04_2021-Insecure_Design/',
  'A05:2021': 'https://owasp.org/Top10/A05_2021-Security_Misconfiguration/',
  'A06:2021': 'https://owasp.org/Top10/A06_2021-Vulnerable_and_Outdated_Components/',
  'A07:2021': 'https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/',
  'A08:2021': 'https://owasp.org/Top10/A08_2021-Software_and_Data_Integrity_Failures/',
  'A09:2021': 'https://owasp.org/Top10/A09_2021-Security_Logging_and_Monitoring_Failures/',
  'A10:2021': 'https://owasp.org/Top10/A10_2021-Server_Side_Request_Forgery_%28SSRF%29/',
};

// ── Sub-components ───────────────────────────────────────────

function SummaryCard({ severity, count }) {
  const config = SEVERITY_CONFIG[severity];
  return (
    <div
      className="summary-card"
      style={{ borderColor: config.color, background: config.bg }}
    >
      <span className="summary-icon">{config.icon}</span>
      <span className="summary-count" style={{ color: config.color }}>
        {count}
      </span>
      <span className="summary-label">{config.label}</span>
    </div>
  );
}

function VulnCard({ vuln }) {
  const config = SEVERITY_CONFIG[vuln.severity] || SEVERITY_CONFIG.medium;

  return (
    <div
      className="vuln-card"
      style={{ borderLeftColor: config.color }}
    >
      {/* Header */}
      <div className="vuln-header">
        <div className="vuln-title-row">
          <span
            className="severity-badge"
            style={{ background: config.bg, color: config.color }}
          >
            {config.icon} {config.label}
          </span>

          <h3 className="vuln-title">{vuln.title}</h3>
        </div>

        <div className="vuln-meta">
          <a
            href={OWASP_URLS[vuln.category] || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="owasp-badge"
          >
            {vuln.category} · {vuln.categoryName}
          </a>

          <span className="vuln-file">
            📄 {vuln.file}
            {vuln.lineNumber && `:${vuln.lineNumber}`}
          </span>
        </div>
      </div>

      {/* Vulnerable Code */}
      {vuln.vulnerableCode && (
        <div className="vuln-section">
          <h4>Vulnerable Code</h4>
          <pre className="code-block">
            <code>{vuln.vulnerableCode}</code>
          </pre>
        </div>
      )}

      {/* Description */}
      <div className="vuln-section">
        <h4>Description</h4>
        <p>{vuln.description}</p>
      </div>

      {/* Impact */}
      <div className="vuln-section">
        <h4>⚡ Impact</h4>
        <p>{vuln.impact}</p>
      </div>

      {/* Remediation */}
      <div className="vuln-section remediation">
        <h4>✅ Remediation</h4>
        <p>{vuln.remediation}</p>
      </div>
    </div>
  );
}
// ── Main Dashboard ────────────────────────────────────────────

export default function ReportDashboard({ report, onNewScan }) {
  if (!report) return null;

  const { summary, vulnerabilities, positives, disclaimer } = report;

  // Sort vulnerabilities: critical first, then high, medium, low
  const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  const sortedVulns = [...vulnerabilities].sort(
    (a, b) => (severityOrder[a.severity] ?? 4) - (severityOrder[b.severity] ?? 4)
  );

  return (
    <div className="report-dashboard">

      {/* Report Header */}
      <div className="report-header">
        <div className="report-title-row">
          <h2>Security Report</h2>
          <button onClick={onNewScan} className="new-scan-btn">
            + New Scan
          </button>
        </div>
        <p className="report-repo">📦 {report.repository}</p>
        <p className="report-meta">
          {report.scannedFiles} files analyzed ·{' '}
          {new Date(report.scannedAt).toLocaleString()}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="summary-grid">
        <SummaryCard severity="critical" count={summary.critical} />
        <SummaryCard severity="high"     count={summary.high} />
        <SummaryCard severity="medium"   count={summary.medium} />
        <SummaryCard severity="low"      count={summary.low} />
      </div>

      {/* Total Issues Banner */}
      <div className="total-banner">
        {summary.totalIssues === 0
          ? '✅ No vulnerabilities detected'
          : `⚠️ ${summary.totalIssues} vulnerabilit${summary.totalIssues === 1 ? 'y' : 'ies'} found`
        }
      </div>

      {report.truncated && (
       <div className="truncation-banner">
       ⚠️ This repository contains more vulnerabilities than shown.
       Displaying the top 20 most severe findings. Consider scanning
       smaller subdirectories for complete coverage.
       </div>
      )}

      {/* Vulnerability List */}
      {sortedVulns.length > 0 && (
        <div className="vuln-section-container">
          <h3 className="section-title">Vulnerabilities</h3>
          <div className="vuln-list">
            {sortedVulns.map((vuln) => (
              <VulnCard key={vuln.id} vuln={vuln} />
            ))}
          </div>
        </div>
      )}

      {/* Positives */}
      {positives?.length > 0 && (
        <div className="positives-container">
          <h3 className="section-title">✅ Security Strengths</h3>
          <ul className="positives-list">
            {positives.map((positive, i) => (
              <li key={i} className="positive-item">
                {positive}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Disclaimer */}
      <p className="disclaimer">{disclaimer}</p>

    </div>
  );
}