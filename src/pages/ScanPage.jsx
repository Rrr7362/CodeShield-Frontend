// ScanPage.jsx
// Page-level component. Owns the useScan hook.
// Conditionally renders child components based on scan state.

import { useScan } from '../hooks/useScan.js';
import ScanForm from '../Components/ScanForm/ScanForm.jsx';
import ProgressTracker from '../Components/ProgressTracker/ProgressTracker.jsx';
import ReportDashboard from '../Components/ReportDashboard/ReportDashboard.jsx';

export default function ScanPage() {
  const scan = useScan();

  return (
    <div className="scan-page">

      {/* Header — always visible */}
      <header className="app-header">
        <h1>🛡️ CodeShield</h1>
        <p>AI-Powered GitHub Security Analyzer</p>
      </header>

      {/* Scan Form — visible when idle or error */}
      {(scan.isIdle || scan.isError) && (
        <ScanForm
          onSubmit={scan.startScan}
          isLoading={scan.isConnecting}
          error={scan.error}
          onReset={scan.resetScan}
        />
      )}

      {/* Progress — visible while connecting or scanning */}
      {(scan.isConnecting || scan.isScanning) && (
        <ProgressTracker
          progress={scan.progress}
          stage={scan.stage}
          message={scan.message}
          scanState={scan.scanState}
        />
      )}

      {/* Report — visible when complete */}
      {scan.isComplete && (
        <ReportDashboard
          report={scan.report}
          onNewScan={scan.resetScan}
        />
      )}

    </div>
  );
}

