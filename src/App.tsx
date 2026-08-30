import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  ScanSearch
} from 'lucide-react';

type ScanPhase = 'idle' | 'handshake' | 'scanning' | 'complete';

interface LogEntry {
  id: string;
  timestamp: Date;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  module: 'SYSTEM' | 'KYBER' | 'SCANNER';
}

export default function App() {
  const [targetApp, setTargetApp] = useState('');
  const [phase, setPhase] = useState<ScanPhase>('idle');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [progress, setProgress] = useState(0);

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

    // Simulate Post-Quantum Handshake (Kyber)
    addLog(`Initiating connection to ${targetApp}...`, 'info', 'SYSTEM');
    await new Promise(r => setTimeout(r, 800));
    
    addLog('Generating Kyber-768 keypair for encapsulation...', 'info', 'KYBER');
    await new Promise(r => setTimeout(r, 1200));
    
    addLog('Public key transmitted. Awaiting ciphertext...', 'info', 'KYBER');
    setProgress(15);
    await new Promise(r => setTimeout(r, 1500));
    
    addLog('Ciphertext received. Decapsulating shared secret...', 'info', 'KYBER');
    await new Promise(r => setTimeout(r, 1000));
    
    addLog('Shared secret established (256-bit). Deriving keys via HKDF-SHA256...', 'success', 'KYBER');
    setProgress(30);
    await new Promise(r => setTimeout(r, 1200));

    addLog('Secure tunnel established (ChaCha20-Poly1305).', 'success', 'SYSTEM');
    setPhase('scanning');
    
    // Simulate App Scanning
    await new Promise(r => setTimeout(r, 800));
    addLog('Commencing structural analysis of application bundle...', 'info', 'SCANNER');
    setProgress(45);
    
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
                  className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 grid grid-cols-1 sm:grid-cols-3 gap-4"
                >
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
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>
      </div>
    </div>
  );
}
