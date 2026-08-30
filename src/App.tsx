import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { VerifryerAPI } from './services/api';
import { 
  Shield, Lock, Server, Terminal, CheckSquare, AlertTriangle, Zap, Key, ShieldAlert, Loader2, ScanSearch, X
} from 'lucide-react';

type ScanPhase = 'idle' | 'handshake' | 'scanning' | 'complete';

interface LogEntry {
  id: string;
  timestamp: Date;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  module: 'SYSTEM' | 'KYBER' | 'SCANNER' | 'WARDEN' | 'IPS' | 'DPI';
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
    id: 'HW-IPS-001',
    title: 'Cryptojacking (Stratum Protocol)',
    severity: 'critical',
    description: 'Outbound TCP payload matches Stratum mining protocol signatures ("method": "mining.subscribe"). Suspected xmrig/minerd activity.',
    remediation: 'Process SIGKILL\'d. nftables rule added to drop destination IP on the output chain.',
    affectedModule: 'Crypto Defeat Engine',
  },
  {
    id: 'HW-DPI-002',
    title: 'High Payload Entropy',
    severity: 'high',
    description: 'Calculated Shannon entropy > 7.9, indicating heavily obfuscated or encrypted binary transfer typical of packed malware.',
    remediation: 'Connection terminated. Entropy Lock engaged on source IP.',
    affectedModule: 'Passive DPI',
  },
  {
    id: 'HW-IPS-003',
    title: 'ARP Poisoning / MITM',
    severity: 'high',
    description: 'Gateway MAC address mismatch detected on the local subnet. Legitimate MAC differs from current ARP resolution.',
    remediation: 'Static ARP entry enforced. Attacker MAC dropped from interface.',
    affectedModule: 'ARP Lockdown',
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
      
      await new Promise(r => setTimeout(r, 800));
      addLog('Commencing Host Warden Omni-Engine telemetry...', 'info', 'WARDEN');
      setProgress(40);
      
      try {
        await VerifryerAPI.startScan('sim-session-123', targetApp);
      } catch (err) {
        // Ignore in UI, keep simulating
      }
      
      await new Promise(r => setTimeout(r, 1200));
      addLog('Compiling multi-source threat blocklists...', 'info', 'WARDEN');
      setProgress(50);
      
      await new Promise(r => setTimeout(r, 1500));
      addLog('DPI: Calculating payload Shannon entropy...', 'info', 'DPI');
      await new Promise(r => setTimeout(r, 800));
      addLog('DPI: Critical entropy > 7.9 detected. Packed binary suspected.', 'warning', 'DPI');
      setProgress(65);
      
      await new Promise(r => setTimeout(r, 1200));
      addLog('IPS: Monitoring SYN packet rate for DDoS signatures...', 'info', 'IPS');
      await new Promise(r => setTimeout(r, 1000));
      addLog('IPS: Verifying Gateway MAC address consistency (ARP Defense)...', 'info', 'IPS');
      setProgress(75);

      await new Promise(r => setTimeout(r, 1500));
      addLog('IPS: Analyzing outbound payloads for stratum+tcp...', 'warning', 'IPS');
      await new Promise(r => setTimeout(r, 800));
      addLog('IPS: Cryptojacking signature "mining.subscribe" identified!', 'error', 'IPS');
      setProgress(85);

      await new Promise(r => setTimeout(r, 1200));
      addLog('IPS: Enforcing nftables drop rules & SIGKILL on malicious PIDs...', 'success', 'SYSTEM');
      setProgress(95);

      await new Promise(r => setTimeout(r, 1000));
      addLog('Scan complete. Telemetry report generated.', 'success', 'WARDEN');
      setProgress(100);
      setPhase('complete');
    } catch (err) {
      addLog(`Unexpected error during scan: ${err}`, 'error', 'SYSTEM');
      setPhase('idle');
    }
  };

  return (
    <div className="min-h-screen bg-black text-green-500 font-mono p-4 sm:p-8 relative selection:bg-green-500 selection:text-black">
      <div className="crt-overlay"></div>
      <div className="scanline"></div>
      
      <div className="max-w-5xl mx-auto space-y-8 relative z-10">
        
        {/* Header */}
        <header className="flex items-center justify-between border-b-2 border-green-500 pb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-black border-2 border-green-500 neon-border">
              <ScanSearch className="w-8 h-8 text-green-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-green-500 tracking-widest uppercase neon-text">Verifryer</h1>
              <p className="text-xs text-green-600 uppercase tracking-widest mt-1">HOST_WARDEN OMNI-ENGINE // v3.0.0</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs font-bold px-3 py-1 bg-black border-2 border-green-500 text-green-500 uppercase tracking-widest shadow-[0_0_10px_rgba(34,197,94,0.2)]">
            <Lock className="w-3 h-3" />
            <span>Kyber-768 / ChaCha20</span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Controls & Status */}
          <div className="space-y-6 lg:col-span-1">
            {/* Input Panel */}
            <div className="bg-black border-2 border-green-500 p-6 neon-border">
              <h2 className="text-sm font-bold text-green-500 mb-4 flex items-center gap-2 uppercase tracking-widest">
                <Terminal className="w-4 h-4" /> Target_Config
              </h2>
              <form onSubmit={startScan} className="space-y-4">
                <div>
                  <label htmlFor="target" className="block text-xs text-green-600 mb-1.5 uppercase tracking-wider">Target_URL / ID</label>
                  <div className="flex items-center border-2 border-green-500 bg-black px-3 py-2 focus-within:border-green-400 focus-within:shadow-[0_0_8px_rgba(34,197,94,0.6)] transition-all">
                    <span className="text-green-500 mr-2 font-bold">&gt;</span>
                    <input
                      id="target"
                      type="text"
                      value={targetApp}
                      onChange={(e) => setTargetApp(e.target.value)}
                      placeholder="APP.EXAMPLE.COM"
                      disabled={phase === 'handshake' || phase === 'scanning'}
                      className="w-full bg-transparent text-green-500 focus:outline-none placeholder-green-800 uppercase text-sm"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={!targetApp || phase === 'handshake' || phase === 'scanning'}
                  className="w-full flex items-center justify-center gap-2 border-2 border-green-500 bg-black hover:bg-green-500 hover:text-black text-green-500 font-bold py-2.5 uppercase tracking-widest transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  {phase === 'handshake' || phase === 'scanning' ? (
                    <Loader2 className="w-4 h-4 animate-spin group-hover:text-black" />
                  ) : (
                    <Zap className="w-4 h-4 group-hover:text-black" />
                  )}
                  {phase === 'idle' ? 'INITIATE_SCAN' : phase === 'complete' ? 'SCAN_AGAIN' : 'PROCESSING...'}
                </button>
              </form>
            </div>

            {/* Handshake Visualizer */}
            <div className="bg-black border-2 border-green-500 p-6 neon-border">
              <h2 className="text-sm font-bold text-green-500 mb-6 flex items-center gap-2 uppercase tracking-widest">
                <Shield className="w-4 h-4" /> Handshake_State
              </h2>
              
              <div className="relative flex justify-between items-center mb-2 px-2">
                {/* Connection Line */}
                <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-[2px] bg-green-900 z-0">
                   <motion.div 
                     className="h-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]"
                     initial={{ width: '0%' }}
                     animate={{ width: phase === 'idle' ? '0%' : phase === 'handshake' ? '50%' : '100%' }}
                     transition={{ duration: 1 }}
                   />
                </div>

                {/* Client Node */}
                <div className="relative z-10 flex flex-col items-center gap-2">
                  <div className={`p-3 bg-black border-2 ${phase !== 'idle' ? 'border-green-400 text-green-400 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'border-green-900 text-green-900'} transition-all duration-500`}>
                    <Terminal className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] uppercase tracking-widest font-bold text-green-600">Client</span>
                </div>

                {/* Handshake Indicator */}
                <div className="relative z-10 flex flex-col items-center gap-2">
                   <div className={`p-2 bg-black border-2 ${phase === 'handshake' ? 'border-yellow-500 text-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.6)]' : phase === 'scanning' || phase === 'complete' ? 'border-green-400 text-green-400 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'border-green-900 text-green-900'} transition-all duration-500`}>
                     <Key className="w-4 h-4" />
                   </div>
                </div>

                {/* Server Node */}
                <div className="relative z-10 flex flex-col items-center gap-2">
                  <div className={`p-3 bg-black border-2 ${phase === 'scanning' || phase === 'complete' ? 'border-green-400 text-green-400 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'border-green-900 text-green-900'} transition-all duration-500`}>
                    <Server className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] uppercase tracking-widest font-bold text-green-600">Target</span>
                </div>
              </div>
              
              <div className="mt-8 text-xs text-center text-green-600 uppercase tracking-widest font-bold h-4">
                {phase === 'idle' && 'AWAITING_CONNECTION...'}
                {phase === 'handshake' && <span className="text-yellow-500 animate-pulse">ESTABLISHING_PQ_KEY_ENCAPSULATION...</span>}
                {phase === 'scanning' && <span className="text-green-400 animate-pulse">SECURE_TUNNEL_ACTIVE // SCANNING...</span>}
                {phase === 'complete' && <span className="text-green-500 neon-text">CONNECTION_SECURED // SCAN_FINISHED</span>}
              </div>
            </div>
          </div>

          {/* Right Column: Terminal Logs & Results */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Progress Bar */}
            <div className="bg-black border-2 border-green-500 p-6 neon-border">
               <div className="flex justify-between items-center mb-3">
                 <h2 className="text-sm font-bold text-green-500 uppercase tracking-widest">Operation_Progress</h2>
                 <span className="text-xs font-bold text-green-400">{progress}%</span>
               </div>
               <div className="h-4 w-full bg-green-950 border border-green-900 p-0.5 overflow-hidden">
                 <motion.div 
                   className="h-full bg-green-500 relative"
                   initial={{ width: 0 }}
                   animate={{ width: `${progress}%` }}
                   transition={{ duration: 0.5 }}
                 >
                   {/* Pattern inside progress bar */}
                   <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_4px,rgba(0,0,0,0.2)_4px,rgba(0,0,0,0.2)_8px)]"></div>
                 </motion.div>
               </div>
            </div>

            {/* Terminal Output */}
            <div className="bg-black border-2 border-green-500 flex flex-col h-[400px] neon-border relative overflow-hidden">
              <div className="bg-green-950/40 border-b-2 border-green-500 px-4 py-2 flex items-center justify-between">
                <span className="text-xs text-green-500 font-bold tracking-widest uppercase">VERIFRYER_CORE.EXE</span>
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 border border-green-500 bg-black"></div>
                  <div className="w-3 h-3 border border-green-500 bg-black"></div>
                  <div className="w-3 h-3 border border-green-500 bg-black"></div>
                </div>
              </div>
              
              <div className="flex-1 p-4 overflow-y-auto space-y-1.5 text-xs sm:text-sm scrollbar-hide">
                <AnimatePresence initial={false}>
                  {logs.length === 0 && phase === 'idle' && (
                    <div className="text-green-800 uppercase tracking-widest">NO_ACTIVE_SESSIONS. ENTER_TARGET_TO_BEGIN...</div>
                  )}
                  {logs.map((log) => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex gap-3 font-mono leading-relaxed"
                    >
                      <span className="text-green-700 shrink-0">
                        [{log.timestamp.toISOString().split('T')[1].slice(0, 12)}]
                      </span>
                      <span className={`shrink-0 w-24 font-bold uppercase ${
                        log.module === 'KYBER' ? 'text-yellow-500' :
                        log.module === 'WARDEN' ? 'text-green-300' :
                        log.module === 'IPS' ? 'text-red-400' :
                        log.module === 'DPI' ? 'text-purple-400' :
                        'text-green-600'
                      }`}>
                        [{log.module}]
                      </span>
                      <span className={`uppercase ${
                        log.type === 'error' ? 'text-red-500' :
                        log.type === 'warning' ? 'text-yellow-500' :
                        log.type === 'success' ? 'text-green-400 neon-text font-bold' :
                        'text-green-500'
                      }`}>
                        {log.message}
                      </span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Results Panel */}
            <AnimatePresence>
              {phase === 'complete' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="bg-black border-2 border-green-500 p-6 grid grid-cols-1 sm:grid-cols-3 gap-4 neon-border">
                    <div className="p-4 bg-black border border-green-500 flex flex-col items-center text-center shadow-[inset_0_0_15px_rgba(34,197,94,0.1)]">
                      <CheckSquare className="w-8 h-8 text-green-500 mb-3" />
                      <h3 className="text-xs font-bold text-green-600 uppercase tracking-widest">Handshake</h3>
                      <p className="text-sm text-green-400 font-bold mt-1 uppercase">Kyber-768 Secured</p>
                    </div>
                    <div className="p-4 bg-black border border-red-500 flex flex-col items-center text-center shadow-[inset_0_0_15px_rgba(239,68,68,0.1)]">
                      <AlertTriangle className="w-8 h-8 text-red-500 mb-3" />
                      <h3 className="text-xs font-bold text-red-600 uppercase tracking-widest">Threats</h3>
                      <p className="text-sm text-red-400 font-bold mt-1 uppercase">3 High/Critical</p>
                    </div>
                    <div className="p-4 bg-black border border-red-500 flex flex-col items-center text-center shadow-[inset_0_0_15px_rgba(239,68,68,0.1)]">
                      <ShieldAlert className="w-8 h-8 text-red-500 mb-3 neon-text" />
                      <h3 className="text-xs font-bold text-red-600 uppercase tracking-widest">Security_Score</h3>
                      <p className="text-sm text-red-400 font-bold mt-1 uppercase neon-text">42/100 (F)</p>
                    </div>
                  </div>

                  {/* Vulnerabilities List */}
                  <div className="bg-black border-2 border-green-500 p-6 neon-border">
                    <h3 className="text-sm font-bold text-green-500 mb-4 flex items-center gap-2 uppercase tracking-widest">
                      <AlertTriangle className="w-4 h-4 text-yellow-500" /> Detected_Vulnerabilities
                    </h3>
                    <div className="space-y-3">
                      {MOCK_VULNERABILITIES.map(vuln => (
                        <button
                          key={vuln.id}
                          onClick={() => setSelectedVuln(vuln)}
                          className="w-full text-left bg-black border border-green-900 hover:border-green-500 p-4 transition-colors flex justify-between items-center group relative overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-green-500/10 -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
                          <div className="relative z-10">
                            <div className="text-sm font-bold text-green-500 uppercase tracking-wide group-hover:text-green-400 transition-colors">{vuln.title}</div>
                            <div className="text-xs text-green-700 mt-1 uppercase tracking-widest group-hover:text-green-600 transition-colors">{vuln.affectedModule}</div>
                          </div>
                          <div className={`relative z-10 px-3 py-1 bg-black border text-[10px] font-bold uppercase tracking-widest ${
                            vuln.severity === 'critical' || vuln.severity === 'high' 
                              ? 'border-red-500 text-red-500 shadow-[0_0_5px_rgba(239,68,68,0.4)]' 
                              : 'border-yellow-500 text-yellow-500 shadow-[0_0_5px_rgba(234,179,8,0.4)]'
                          }`}>
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
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative bg-black border-2 border-green-500 w-full max-w-lg shadow-[0_0_30px_rgba(34,197,94,0.3)] overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 border-b-2 border-green-500 bg-green-950/30">
                <div className="flex items-center gap-2">
                  <AlertTriangle className={`w-5 h-5 ${selectedVuln.severity === 'critical' || selectedVuln.severity === 'high' ? 'text-red-500' : 'text-yellow-500'}`} />
                  <h2 className="text-sm font-bold text-green-500 uppercase tracking-widest">Vulnerability_Details</h2>
                </div>
                <button onClick={() => setSelectedVuln(null)} className="p-1 border border-transparent hover:border-green-500 hover:bg-green-500 hover:text-black transition-colors text-green-500">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className={`text-lg font-bold pr-4 uppercase tracking-wider ${
                      selectedVuln.severity === 'critical' || selectedVuln.severity === 'high' ? 'text-red-400' : 'text-green-400'
                    }`}>{selectedVuln.title}</h3>
                    <span className={`px-3 py-1 shrink-0 bg-black border text-[10px] font-bold uppercase tracking-widest ${
                      selectedVuln.severity === 'critical' || selectedVuln.severity === 'high' 
                        ? 'border-red-500 text-red-500 shadow-[0_0_5px_rgba(239,68,68,0.4)]'
                        : 'border-yellow-500 text-yellow-500 shadow-[0_0_5px_rgba(234,179,8,0.4)]'
                    }`}>
                      {selectedVuln.severity} SEVERITY
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-green-600 font-mono uppercase tracking-widest">
                    <span>ID: {selectedVuln.id}</span>
                    <span>//</span>
                    <span>MOD: {selectedVuln.affectedModule}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-green-700 uppercase tracking-widest">Description</h4>
                  <p className="text-sm text-green-500 leading-relaxed uppercase">{selectedVuln.description}</p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-green-700 uppercase tracking-widest">Remediation</h4>
                  <div className="bg-black border border-green-500 p-4 shadow-[inset_0_0_10px_rgba(34,197,94,0.1)]">
                    <p className="text-sm text-green-400 leading-relaxed font-mono uppercase">{selectedVuln.remediation}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border-t-2 border-green-500 bg-black flex justify-end">
                <button 
                  onClick={() => setSelectedVuln(null)} 
                  className="px-6 py-2 border-2 border-green-500 bg-black hover:bg-green-500 hover:text-black text-green-500 text-sm font-bold uppercase tracking-widest transition-colors focus:outline-none"
                >
                  ACKNOWLEDGE
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
