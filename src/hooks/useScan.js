// useScan.js
// Custom hook that owns the entire scan lifecycle.
// Manages state, API calls, and socket event handling.

import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api.js';
import socket from '../services/socket.js';

// All possible scan states — explicit state machine
const SCAN_STATES = {
  IDLE:       'idle',        // no scan in progress
  CONNECTING: 'connecting',  // HTTP request sent, awaiting 202
  SCANNING:   'scanning',    // socket connected, pipeline running
  COMPLETE:   'complete',    // report received
  ERROR:      'error',       // something went wrong
};

export function useScan() {
  // ── State ───────────────────────────────────────────────

  const [scanState, setScanState]   = useState(SCAN_STATES.IDLE);
  const [progress, setProgress]     = useState(0);
  const [stage, setStage]           = useState('');
  const [message, setMessage]       = useState('');
  const [report, setReport]         = useState(null);
  const [error, setError]           = useState(null);

  // Store scanId in a ref — we need it in event handlers
  // but changing it should NOT trigger re-renders
  const scanIdRef = useRef(null);

  // ── Socket Event Handlers ────────────────────────────────
  // Defined with useCallback to maintain stable references
  // for addEventListener/removeEventListener

  const handleJoinedScan = useCallback(() => {
    console.log('[scan] Joined scan room — ready for events');
    setScanState(SCAN_STATES.SCANNING);
    setProgress(5);
    setMessage('Connected. Initializing scan...');
  }, []);

  const handleProgress = useCallback((data) => {
    if (data.scanId !== scanIdRef.current) return; // ignore other scans
    setProgress(data.progress);
    setStage(data.stage);
    setMessage(data.message);
  }, []);

  const handleCompleted = useCallback((data) => {
    if (data.scanId !== scanIdRef.current) return;
    setProgress(100);
    setMessage('Scan complete!');
    setReport(data.report);
    setScanState(SCAN_STATES.COMPLETE);

    // Clean up socket after scan completes
    socket.disconnect();
  }, []);

  const handleError = useCallback((data) => {
    if (data.scanId !== scanIdRef.current) return;
    setError(data.error);
    setScanState(SCAN_STATES.ERROR);

    // Clean up socket on error
    socket.disconnect();
  }, []);

  const handleReconnect = useCallback(() => {
    // On reconnection, re-join the scan room
    // Socket gets a new socket.id but we still have the scanId
    if (scanIdRef.current && scanState === SCAN_STATES.SCANNING) {
      console.log('[scan] Reconnected — rejoining scan room');
      socket.emit('join-scan', scanIdRef.current);
    }
  }, [scanState]);

  // ── Effect: Register socket event listeners ───────────────
  // Registered once on mount, cleaned up on unmount.
  // This prevents listener accumulation across renders.

  useEffect(() => {
    socket.on('joined-scan',    handleJoinedScan);
    socket.on('scan-progress',  handleProgress);
    socket.on('scan-completed', handleCompleted);
    socket.on('scan-error',     handleError);
    socket.on('reconnect',      handleReconnect);

    // Cleanup: remove listeners when component unmounts
    // Critical for preventing memory leaks
    return () => {
      socket.off('joined-scan',    handleJoinedScan);
      socket.off('scan-progress',  handleProgress);
      socket.off('scan-completed', handleCompleted);
      socket.off('scan-error',     handleError);
      socket.off('reconnect',      handleReconnect);
    };
  }, [handleJoinedScan, handleProgress, handleCompleted,
      handleError, handleReconnect]);

  // ── startScan Action ─────────────────────────────────────

  const startScan = useCallback(async (githubUrl) => {
    // Reset all state for new scan
    setScanState(SCAN_STATES.CONNECTING);
    setProgress(0);
    setStage('');
    setMessage('Connecting to CodeShield...');
    setReport(null);
    setError(null);
    scanIdRef.current = null;

    try {
      // Step 1: POST to /api/analyze → get scanId
      const response = await api.post('/api/analyze', { githubUrl });
      const { scanId } = response.data.data;

      // Store scanId for event filtering and reconnection
      scanIdRef.current = scanId;

      // Step 2: Connect socket and join room
      // Connect if not already connected
      if (!socket.connected) {
        socket.connect();
      }

      // Wait for socket to be connected before joining room
      // If already connected, join immediately
      if (socket.connected) {
        socket.emit('join-scan', scanId);
      } else {
        // Wait for connection then join
        socket.once('connect', () => {
          socket.emit('join-scan', scanId);
        });
      }

    } catch (err) {
      // HTTP request failed (network error, rate limit, etc.)
      setError({
        code: err.code || 'REQUEST_FAILED',
        message: err.message || 'Failed to start scan.',
        retryAfter: err.retryAfter,
      });
      setScanState(SCAN_STATES.ERROR);
    }
  }, []);

  // ── resetScan Action ─────────────────────────────────────

  const resetScan = useCallback(() => {
    scanIdRef.current = null;
    setScanState(SCAN_STATES.IDLE);
    setProgress(0);
    setStage('');
    setMessage('');
    setReport(null);
    setError(null);

    if (socket.connected) {
      socket.disconnect();
    }
  }, []);

  // ── Return Public API ────────────────────────────────────

  return {
    // State
    scanState,
    progress,
    stage,
    message,
    report,
    error,

    // Derived booleans — convenience for components
    isIdle:      scanState === SCAN_STATES.IDLE,
    isConnecting: scanState === SCAN_STATES.CONNECTING,
    isScanning:  scanState === SCAN_STATES.SCANNING,
    isComplete:  scanState === SCAN_STATES.COMPLETE,
    isError:     scanState === SCAN_STATES.ERROR,

    // Actions
    startScan,
    resetScan,

    // Constants
    SCAN_STATES,
  };
}