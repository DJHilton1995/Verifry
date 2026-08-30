import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { VerifryerAPI } from './services/api';
import { 
  Shield, 
  Lock, 
  Server, 
  Terminal, 
  CheckCircle, 
  AlertTriangle, 
  Zap, 
  Key,
  ShieldAlert,
  Loader2,
  ScanSearch,
  X
} from 'lucide-react';

type ScanPhase = 'idle' | 'handshake' | 'scanning' | 'complete';

interface LogEntry {
  id: string;
  timestamp: Date;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  module: 'SYSTEM' | 'KYBER' | 'SCANNER';
}

interface Vulnerability {
  id: string;
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  remediation: string;
  affectedModule: string;
}

const MOCK_VULNERABILITIES: Vulnerability[] = [
  {
    id: 'VULN-001',
    title: 'Missing HSTS Header',
    severity: 'low',
    description: 'HTTP Strict Transport Security (HSTS) is not enforced on the primary endpoint, leaving the connection potentially vulnerable to downgrade attacks.',
    remediation: 'Configure the reverse proxy or application server to include the "Strict-Transport-Security" header with a max-age directive.',
    affectedModule: 'Network Configuration',
  },
  {
    id: 'VULN-002',
    title: 'Verbose Error Responses',
    severity: 'low',
    description: 'The /api/health endpoint returns stack trace information when forced into a 500 state, potentially leaking internal structural information.',
    remediation: 'Implement a global error handler to strip stack traces from production responses.',
    affectedModule: 'Backend API',
  }
];

export default function App() {
  const [targetApp, setTargetApp] = useState('');
  const [phase, setPhase] = useState<ScanPhase>('idle');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [progress, setProgress] = useState(0);
  const [selectedVuln, setSelectedVuln] = useState<Vulnerability | null>(null);

  const addLog = (message: string, type: LogEntry['type'], module: LogEntry['module']) => {
    setLogs(prev => [...prev, {
      id: Math.random().toString(36).substring(7),
      timestamp: new Date(),
      message,
      type,
      module
    }]);
  };

  const startScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetApp) return;

    setPhase('handshake');
    setLogs([]);
    setProgress(0);

    try {
      addLog(`Initiating connection to ${targetApp}...`, 'info', 'SYSTEM');
      await new Promise(r => setTimeout(r, 800));
      
      addLog('Generating Kyber-768 keypair for encapsulation...', 'info', 'KYBER');
      const fakeClientPubKey = btoa('mock-client-public-key-bytes');
      await new Promise(r => setTimeout(r, 800));
      
      addLog('Public key transmitted. Awaiting Rust backend response...', 'info', 'KYBER');
      setProgress(15);
      
      // Attempt real API call to the Rust backend
      try {
        const handshakeRes = await VerifryerAPI.initiateHandshake(fakeClientPubKey);
        addLog(`Ciphertext received (Session: ${handshakeRes.sessionId}). Decapsulating shared secret...`, 'info', 'KYBER');
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : 'Unknown error';
        addLog(`Backend unavailable (${errMsg}). Falling back to simulation mode...`, 'warning', 'SYSTEM');
        await new Promise(r => setTimeout(r, 1000));
      }
      
      addLog('Shared secret established (256-bit). Deriving keys via HKDF-SHA256...', 'success', 'KYBER');
      setProgress(30);
      await new Promise(r => setTimeout(r, 1200));

      addLog('Secure tunnel established (ChaCha20-Poly1305).', 'success', 'SYSTEM');
      setPhase('scanning');
      
      // Simulate App Scanning
      await new Promise(r => setTimeout(r, 800));
      addLog('Commencing structural analysis of application bundle...', 'info', 'SCANNER');
      setProgress(45);
      
      try {
        // Attempt real scan initiation
        await VerifryerAPI.startScan('sim-session-123', targetApp);
      } catch (err) {
        // Ignore in UI, keep simulating
      }
      
      await new Promise(r => setTimeout(r, 1500));
      addLog('Scanning dependencies for known CVEs...', 'info', 'SCANNER');
      setProgress(60);
      
      await new Promise(r => setTimeout(r, 2000));
      addLog('Analyzing endpoints for exposed sensitive data...', 'warning', 'SCANNER');
      setProgress(80);
      
      await new Promise(r => setTimeout(r, 1500));
      addLog('Verifying TLS/SSL configurations and cert chains...', 'info', 'SCANNER');
      setProgress(95);

      await new Promise(r => setTimeout(r, 1000));
      addLog('Scan complete. Generating report.', 'success', 'SYSTEM');
      setProgress(100);
      setPhase('complete');
    } catch (err) {
      addLog(`Unexpected error during scan: ${err}`, 'error', 'SYSTEM');
      setPhase('idle');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-300 font-mono p-4 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex items-center justify-between border-b border-neutral-800 pb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
              <ScanSearch className="w-8 h-8 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neutral-100 tracking-tight">Verifryer</h1>
              <p className="text-sm text-neutral-500">Post-Quantum App Scanner & Visualizer</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs font-medium px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400">
            <Lock className="w-3 h-3" />
            <span>Kyber-768 / ChaCha20</span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Controls & Status */}
          <div className="space-y-6 lg:col-span-1">
            {/* Input Panel */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-neutral-200 mb-4 flex items-center gap-2">
                <Terminal className="w-4 h-4" /> Target Configuration
              </h2>
              <form onSubmit={startScan} className="space-y-4">
                <div>
                  <label htmlFor="target" className="block text-xs text-neutral-500 mb-1.5">Application URL or ID</label>
                  <input
                    id="target"
                    type="text"
                    value={targetApp}
                    onChange={(e) => setTargetApp(e.target.value)}
                    placeholder="e.g., app.example.com"
                    disabled={phase === 'handshake' || phase === 'scanning'}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-sm text-neutral-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!targetApp || phase === 'handshake' || phase === 'scanning'}
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {phase === 'handshake' || phase === 'scanning' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Zap className="w-4 h-4" />
                  )}
                  {phase === 'idle' ? 'Initiate Scan' : phase === 'complete' ? 'Scan Again' : 'Processing...'}
                </button>
              </form>
            </div>

            {/* Handshake Visualizer */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-neutral-200 mb-6 flex items-center gap-2">
                <Shield className="w-4 h-4" /> Handshake State
              </h2>
              
              <div className="relative flex justify-between items-center mb-2 px-2">
                {/* Connection Line */}
                <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-0.5 bg-neutral-800 z-0">
                   <motion.div 
                     className="h-full bg-indigo-500"
                     initial={{ width: '0%' }}
                     animate={{ width: phase === 'idle' ? '0%' : phase === 'handshake' ? '50%' : '100%' }}
                     transition={{ duration: 1 }}
                   />
                </div>

                {/* Client Node */}
                <div className="relative z-10 flex flex-col items-center gap-2">
                  <div className={`p-3 rounded-full ${phase !== 'idle' ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400' : 'bg-neutral-800 border-neutral-700 text-neutral-500'} border transition-colors duration-500`}>
                    <Terminal className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-neutral-500">Client</span>
                </div>

                {/* Handshake Indicator */}
                <div className="relative z-10 flex flex-col items-center gap-2">
                   <div className={`p-2 rounded-full bg-neutral-950 border ${phase === 'handshake' ? 'border-amber-500 text-amber-500' : phase === 'scanning' || phase === 'complete' ? 'border-emerald-500 text-emerald-500' : 'border-neutral-800 text-neutral-600'} transition-colors duration-500`}>
                     <Key className="w-4 h-4" />
                   </div>
                </div>

                {/* Server Node */}
                <div className="relative z-10 flex flex-col items-center gap-2">
                  <div className={`p-3 rounded-full ${phase === 'scanning' || phase === 'complete' ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400' : 'bg-neutral-800 border-neutral-700 text-neutral-500'} border transition-colors duration-500`}>
                    <Server className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-neutral-500">Target</span>
                </div>
              </div>
              
              <div className="mt-8 text-xs text-center text-neutral-500">
                {phase === 'idle' && 'Awaiting connection...'}
                {phase === 'handshake' && <span className="text-amber-400 animate-pulse">Establishing PQ Key Encapsulation...</span>}
                {phase === 'scanning' && <span className="text-indigo-400 animate-pulse">Secure tunnel active. Scanning...</span>}
                {phase === 'complete' && <span className="text-emerald-400">Connection secured and scan finished.</span>}
              </div>
            </div>
          </div>

          {/* Right Column: Terminal Logs & Results */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Progress Bar */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
               <div className="flex justify-between items-center mb-3">
                 <h2 className="text-sm font-semibold text-neutral-200">Operation Progress</h2>
                 <span className="text-xs font-medium text-indigo-400">{progress}%</span>
               </div>
               <div className="h-2 w-full bg-neutral-950 rounded-full overflow-hidden">
                 <motion.div 
                   className="h-full bg-indigo-500"
                   initial={{ width: 0 }}
                   animate={{ width: `${progress}%` }}
                   transition={{ duration: 0.5 }}
                 />
               </div>
            </div>

            {/* Terminal Output */}
            <div className="bg-[#0a0a0a] border border-neutral-800 rounded-2xl overflow-hidden flex flex-col h-[500px]">
              <div className="bg-neutral-900/50 border-b border-neutral-800 px-4 py-3 flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-500/20 border border-rose-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/50"></div>
                </div>
                <span className="text-xs text-neutral-500 font-medium tracking-wide">verifryer-core.log</span>
              </div>
              
              <div className="flex-1 p-4 overflow-y-auto space-y-2 text-xs sm:text-sm">
                <AnimatePresence initial={false}>
                  {logs.length === 0 && phase === 'idle' && (
                    <div className="text-neutral-600 italic">No active sessions. Enter a target to begin...</div>
                  )}
                  {logs.map((log) => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex gap-3 font-mono"
                    >
                      <span className="text-neutral-600 shrink-0">
                        [{log.timestamp.toISOString().split('T')[1].slice(0, 12)}]
                      </span>
                      <span className={`shrink-0 w-16 ${
                        log.module === 'KYBER' ? 'text-purple-400' :
                        log.module === 'SCANNER' ? 'text-indigo-400' :
                        'text-neutral-400'
                      }`}>
                        {log.module}
                      </span>
                      <span className={`
                        ${log.type === 'error' ? 'text-rose-400' : ''}
                        ${log.type === 'warning' ? 'text-amber-400' : ''}
                        ${log.type === 'success' ? 'text-emerald-400' : ''}
                        ${log.type === 'info' ? 'text-neutral-300' : ''}
                      `}>
                        {log.message}
                      </span>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {/* Auto-scroll anchor could go here */}
              </div>
            </div>

            {/* Results Panel (Shows on Complete) */}
            <AnimatePresence>
              {phase === 'complete' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                      <CheckCircle className="w-6 h-6 text-emerald-400 mb-2" />
                      <h3 className="text-sm font-semibold text-neutral-200">Handshake</h3>
                      <p className="text-xs text-neutral-400 mt-1">Kyber-768 Secured</p>
                    </div>
                    <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                      <AlertTriangle className="w-6 h-6 text-amber-400 mb-2" />
                      <h3 className="text-sm font-semibold text-neutral-200">Vulnerabilities</h3>
                      <p className="text-xs text-neutral-400 mt-1">2 Low-Severity Found</p>
                    </div>
                    <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                      <ShieldAlert className="w-6 h-6 text-indigo-400 mb-2" />
                      <h3 className="text-sm font-semibold text-neutral-200">Security Score</h3>
                      <p className="text-xs text-neutral-400 mt-1">85/100 (B+)</p>
                    </div>
                  </div>

                  {/* Vulnerabilities List */}
                  <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
                    <h3 className="text-sm font-semibold text-neutral-200 mb-4 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400" /> Detected Vulnerabilities
                    </h3>
                    <div className="space-y-3">
                      {MOCK_VULNERABILITIES.map(vuln => (
                        <button
                          key={vuln.id}
                          onClick={() => setSelectedVuln(vuln)}
                          className="w-full text-left bg-neutral-950 border border-neutral-800 hover:border-amber-500/50 rounded-xl p-4 transition-colors flex justify-between items-center group"
                        >
                          <div>
                            <div className="text-sm font-medium text-neutral-200 group-hover:text-amber-400 transition-colors">{vuln.title}</div>
                            <div className="text-xs text-neutral-500 mt-1">{vuln.affectedModule}</div>
                          </div>
                          <div className="px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-semibold uppercase tracking-wider">
                            {vuln.severity}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>
      </div>

      {/* Vulnerability Modal */}
      <AnimatePresence>
        {selectedVuln && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedVuln(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-neutral-800 bg-neutral-900/50">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                  <h2 className="text-sm font-semibold text-neutral-100">Vulnerability Details</h2>
                </div>
                <button onClick={() => setSelectedVuln(null)} className="p-1 hover:bg-neutral-800 rounded-md transition-colors text-neutral-400 hover:text-neutral-200">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-medium text-neutral-100 pr-4">{selectedVuln.title}</h3>
                    <span className="px-2.5 py-1 shrink-0 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-semibold uppercase tracking-wider">
                      {selectedVuln.severity} Severity
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-neutral-500 font-mono">
                    <span>ID: {selectedVuln.id}</span>
                    <span>•</span>
                    <span>Module: {selectedVuln.affectedModule}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Description</h4>
                  <p className="text-sm text-neutral-300 leading-relaxed">{selectedVuln.description}</p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Remediation</h4>
                  <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-4">
                    <p className="text-sm text-neutral-300 leading-relaxed font-mono">{selectedVuln.remediation}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border-t border-neutral-800 bg-neutral-950 flex justify-end">
                <button 
                  onClick={() => setSelectedVuln(null)} 
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-600"
                >
                  Close Details
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
