import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { VerifryerAPI } from './services/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  Shield, Lock, Server, Terminal, CheckSquare, AlertTriangle, Zap, Key, ShieldAlert, Loader2, ScanSearch, X, Download, Skull, Flame, Activity
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

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

// Using dynamic vulnerabilities from the real backend instead of mocks

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

  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
  const [score, setScore] = useState<number | null>(null);
  const [grade, setGrade] = useState<string | null>(null);

  const generatePDF = () => {
    const doc = new jsPDF();
    const dateStr = new Date().toLocaleString();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(239, 68, 68); // red-500
    doc.text('VERIFRYER SCAN REPORT', 14, 20);
    
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Target: ${targetApp}`, 14, 30);
    doc.text(`Date: ${dateStr}`, 14, 37);
    
    // Score Summary
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(`Security Score: ${score}/100 (${grade})`, 14, 50);
    doc.text(`Total Vulnerabilities: ${vulnerabilities.length}`, 14, 57);

    // Vulnerabilities Table
    const tableData = vulnerabilities.map(v => [
      v.id,
      v.title,
      v.severity.toUpperCase(),
      v.affectedModule
    ]);

    autoTable(doc, {
      startY: 65,
      head: [['ID', 'Title', 'Severity', 'Module']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [239, 68, 68], textColor: 255 },
      styles: { fontSize: 10, cellPadding: 4 },
      columnStyles: {
        0: { cellWidth: 35 },
        2: { cellWidth: 30 }
      }
    });

    const safeTarget = targetApp ? targetApp.replace(/[^a-z0-9]/gi, '_') : 'report';
    doc.save(`Verifryer_Report_${safeTarget}.pdf`);
  };

  const startScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetApp) return;

    setPhase('handshake');
    setLogs([]);
    setProgress(0);
    setVulnerabilities([]);
    setScore(null);
    setGrade(null);

    try {
      addLog(`Securing ECDH Restraints on target domain...`, 'info', 'SYSTEM');
      
      const fakeClientPubKey = btoa('client-public-key-exchange');
      const handshakeRes = await VerifryerAPI.initiateHandshake(fakeClientPubKey);
      
      addLog(`Restraints locked. Execution key established: ${handshakeRes.sessionId}`, 'success', 'KYBER');
      addLog('Death warrant active.', 'success', 'SYSTEM');
      setProgress(10);
      setPhase('scanning');
      
      addLog('Pulling the switch. Dispatching execution sequence to engine...', 'info', 'SCANNER');
      
      const scanRes = await VerifryerAPI.startScan(handshakeRes.sessionId, targetApp);
      
      if (!scanRes.jobId) throw new Error('Failed to retrieve job ID');
      
      // Polling Loop
      let completed = false;
      let lastLogCount = 0;

      while (!completed) {
        await new Promise(r => setTimeout(r, 600)); // Poll every 600ms
        
        const status = await VerifryerAPI.getScanStatus(scanRes.jobId);
        
        // Append only new logs
        if (status.logs.length > lastLogCount) {
          const newLogs = status.logs.slice(lastLogCount).map(l => ({
            id: l.id,
            timestamp: new Date(l.timestamp),
            message: l.message,
            type: l.level as any,
            module: l.module
          }));
          setLogs(prev => [...prev, ...newLogs]);
          lastLogCount = status.logs.length;
        }

        setProgress(status.progress);

        if (status.status === 'complete' || status.status === 'failed') {
          completed = true;
          setPhase('complete');
          if (status.results) {
             setVulnerabilities(status.results.findings as any[]);
             setScore(status.results.score);
             setGrade(status.results.grade);
          }
        }
      }

    } catch (err: any) {
      addLog(`Fatal Error: ${err.message || err}`, 'error', 'SYSTEM');
      setPhase('idle');
    }
  };

  const chartData = [
    { name: 'Critical', value: vulnerabilities.filter(v => v.severity === 'critical').length, color: '#dc2626' },
    { name: 'High', value: vulnerabilities.filter(v => v.severity === 'high').length, color: '#ef4444' },
    { name: 'Medium', value: vulnerabilities.filter(v => v.severity === 'medium').length, color: '#f59e0b' },
    { name: 'Low', value: vulnerabilities.filter(v => v.severity === 'low').length, color: '#eab308' },
  ].filter(d => d.value > 0);

  const hasCriticalVuln = phase === 'complete' && vulnerabilities.some(v => v.severity === 'critical');

  return (
    <div className={`min-h-screen bg-black text-red-500 font-mono p-4 sm:p-8 relative selection:bg-red-500 selection:text-black ${phase === 'scanning' ? 'electrocution-shake' : ''}`}>
      {phase === 'scanning' && <div className="voltage-flash-overlay"></div>}
      {hasCriticalVuln && (
        <>
          <div className="critical-vignette"></div>
          <div className="critical-arc-overlay">
            <div className="arc-beam arc-1"></div>
            <div className="arc-beam arc-2"></div>
            <div className="arc-beam arc-3"></div>
            <div className="arc-beam arc-4"></div>
          </div>
        </>
      )}
      <div className="dystopian-bg"></div>
      <div className="retro-grid"></div>
      <div className="grid-fade"></div>
      <div className="crt-overlay"></div>
      <div className="scanline"></div>
      
      <div className="max-w-5xl mx-auto space-y-8 relative z-10">
        
        {/* Header */}
        <header className="flex items-center justify-between border-b-2 border-red-500 pb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-black border-2 border-red-500 neon-border">
              <ScanSearch className="w-8 h-8 text-red-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-red-500 tracking-widest uppercase neon-text flex items-center gap-3">
                <Skull className="w-8 h-8" /> VERIFRYER
              </h1>
              <p className="text-xs text-red-600 uppercase tracking-widest mt-1">EXECUTION CHAMBER // HIGH VOLTAGE</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs font-bold px-3 py-1 bg-black border-2 border-red-500 text-red-500 uppercase tracking-widest shadow-[0_0_10px_rgba(239,68,68,0.2)]">
            <Activity className="w-3 h-3" />
            <span>LETHAL VOLTAGE LIVE</span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Controls & Status */}
          <div className="space-y-6 lg:col-span-1">
            {/* Input Panel */}
            <div className="bg-black border-2 border-red-500 p-6 neon-border">
              <h2 className="text-sm font-bold text-red-500 mb-4 flex items-center gap-2 uppercase tracking-widest">
                <Terminal className="w-4 h-4" /> Target_Config
              </h2>
              <form onSubmit={startScan} className="space-y-4">
                <div>
                  <label htmlFor="target" className="block text-xs text-red-600 mb-1.5 uppercase tracking-wider">Target_URL / ID</label>
                  <div className="flex items-center border-2 border-red-500 bg-black px-3 py-2 focus-within:border-red-400 focus-within:shadow-[0_0_8px_rgba(239,68,68,0.6)] transition-all">
                    <span className="text-red-500 mr-2 font-bold">&gt;</span>
                    <input
                      id="target"
                      type="text"
                      value={targetApp}
                      onChange={(e) => setTargetApp(e.target.value)}
                      placeholder="APP.EXAMPLE.COM"
                      disabled={phase === 'handshake' || phase === 'scanning'}
                      className="w-full bg-transparent text-red-500 focus:outline-none placeholder-red-800 uppercase text-sm"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={!targetApp || phase === 'handshake' || phase === 'scanning'}
                  className="w-full flex items-center justify-center gap-2 border-2 border-red-500 bg-black hover:bg-red-500 hover:text-black text-red-500 font-bold py-2.5 uppercase tracking-widest transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  {phase === 'handshake' || phase === 'scanning' ? (
                    <Loader2 className="w-4 h-4 animate-spin group-hover:text-black" />
                  ) : (
                    <Zap className="w-4 h-4 group-hover:text-black" />
                  )}
                  {phase === 'idle' ? 'PULL_THE_SWITCH' : phase === 'complete' ? 'EXECUTE_AGAIN' : 'ELECTROCUTING...'}
                </button>
              </form>
            </div>

            {/* Handshake Visualizer */}
            <div className="bg-black border-2 border-red-500 p-6 neon-border">
              <h2 className="text-sm font-bold text-red-500 mb-6 flex items-center gap-2 uppercase tracking-widest">
                <Zap className="w-4 h-4" /> Execution_Circuit
              </h2>
              
              <div className="relative flex justify-between items-center mb-2 px-2">
                {/* Connection Line */}
                <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-[2px] bg-red-900 z-0">
                   <motion.div 
                     className="h-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"
                     initial={{ width: '0%' }}
                     animate={{ width: phase === 'idle' ? '0%' : phase === 'handshake' ? '50%' : '100%' }}
                     transition={{ duration: 1 }}
                   />
                </div>

                {/* Client Node */}
                <div className="relative z-10 flex flex-col items-center gap-2">
                  <div className={`p-3 bg-black border-2 ${phase !== 'idle' ? 'border-red-400 text-red-400 shadow-[0_0_8px_rgba(239,68,68,0.6)]' : 'border-red-900 text-red-900'} transition-all duration-500`}>
                    <Terminal className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] uppercase tracking-widest font-bold text-red-600">Client</span>
                </div>

                {/* Handshake Indicator */}
                <div className="relative z-10 flex flex-col items-center gap-2">
                   <div className={`p-2 bg-black border-2 ${phase === 'handshake' ? 'border-yellow-500 text-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.6)]' : phase === 'scanning' || phase === 'complete' ? 'border-red-400 text-red-400 shadow-[0_0_8px_rgba(239,68,68,0.6)]' : 'border-red-900 text-red-900'} transition-all duration-500`}>
                     <Key className="w-4 h-4" />
                   </div>
                </div>

                {/* Server Node */}
                <div className="relative z-10 flex flex-col items-center gap-2">
                  <div className={`p-3 bg-black border-2 ${phase === 'scanning' || phase === 'complete' ? 'border-red-400 text-red-400 shadow-[0_0_8px_rgba(239,68,68,0.6)]' : 'border-red-900 text-red-900'} transition-all duration-500`}>
                    <Server className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] uppercase tracking-widest font-bold text-red-600">Target</span>
                </div>
              </div>
              
              <div className="mt-8 text-xs text-center text-red-600 uppercase tracking-widest font-bold h-4">
                {phase === 'idle' && 'AWAITING_CONNECTION...'}
                {phase === 'handshake' && <span className="text-yellow-500 animate-pulse">ESTABLISHING_PQ_KEY_ENCAPSULATION...</span>}
                {phase === 'scanning' && <span className="text-red-400 animate-pulse">SECURE_TUNNEL_ACTIVE // SCANNING...</span>}
                {phase === 'complete' && <span className="text-red-500 neon-text">CONNECTION_SECURED // SCAN_FINISHED</span>}
              </div>
            </div>
          </div>

          {/* Right Column: Terminal Logs & Results */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Progress Bar */}
            <div className="bg-black border-2 border-red-500 p-6 neon-border">
               <div className="flex justify-between items-center mb-3">
                 <h2 className="text-sm font-bold text-red-500 uppercase tracking-widest">Operation_Progress</h2>
                 <span className="text-xs font-bold text-red-400">{progress}%</span>
               </div>
               <div className="h-4 w-full bg-red-950 border border-red-900 p-0.5 overflow-hidden">
                 <motion.div 
                   className="h-full bg-red-500 relative"
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
            <div className="bg-black border-2 border-red-500 flex flex-col h-[400px] neon-border relative overflow-hidden">
              <div className="bg-red-950/40 border-b-2 border-red-500 px-4 py-2 flex items-center justify-between">
                <span className="text-xs text-red-500 font-bold tracking-widest uppercase">EXECUTION_SEQUENCE.EXE</span>
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 border border-red-500 bg-black"></div>
                  <div className="w-3 h-3 border border-red-500 bg-black"></div>
                  <div className="w-3 h-3 border border-red-500 bg-black"></div>
                </div>
              </div>
              
              <div className="flex-1 p-4 overflow-y-auto space-y-1.5 text-xs sm:text-sm scrollbar-hide">
                <AnimatePresence initial={false}>
                  {logs.length === 0 && phase === 'idle' && (
                    <div className="text-red-800 uppercase tracking-widest">CHAMBER_EMPTY. AWAITING_TARGET_FOR_EXECUTION...</div>
                  )}
                  {logs.map((log) => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex gap-3 font-mono leading-relaxed"
                    >
                      <span className="text-red-700 shrink-0">
                        [{log.timestamp.toISOString().split('T')[1].slice(0, 12)}]
                      </span>
                      <span className={`shrink-0 w-24 font-bold uppercase ${
                        log.module === 'KYBER' ? 'text-yellow-500' :
                        log.module === 'WARDEN' ? 'text-red-300' :
                        log.module === 'IPS' ? 'text-red-400' :
                        log.module === 'DPI' ? 'text-purple-400' :
                        'text-red-600'
                      }`}>
                        [{log.module}]
                      </span>
                      <span className={`uppercase ${
                        log.type === 'error' ? 'text-red-500' :
                        log.type === 'warning' ? 'text-yellow-500' :
                        log.type === 'success' ? 'text-red-400 neon-text font-bold' :
                        'text-red-500'
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
                  <div className="bg-black border-2 border-red-500 p-6 grid grid-cols-1 sm:grid-cols-3 gap-4 neon-border">
                    <div className="p-4 bg-black border border-red-500 flex flex-col items-center text-center shadow-[inset_0_0_15px_rgba(239,68,68,0.1)]">
                      <Lock className="w-8 h-8 text-red-500 mb-3" />
                      <h3 className="text-xs font-bold text-red-600 uppercase tracking-widest">Restraints</h3>
                      <p className="text-sm text-red-400 font-bold mt-1 uppercase">Lethal Voltage Locked</p>
                    </div>
                    <motion.div 
                      animate={vulnerabilities.filter(v => v.severity === 'high' || v.severity === 'critical').length > 0 ? {
                        boxShadow: ['inset 0 0 15px rgba(239,68,68,0.1)', 'inset 0 0 60px rgba(239,68,68,0.7)', 'inset 0 0 15px rgba(239,68,68,0.1)'],
                        borderColor: ['#ef4444', '#f87171', '#ef4444']
                      } : {}}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      className="p-4 bg-black border border-red-500 flex flex-col items-center text-center shadow-[inset_0_0_15px_rgba(239,68,68,0.1)]"
                    >
                      <Flame className="w-8 h-8 text-red-500 mb-3" />
                      <h3 className="text-xs font-bold text-red-600 uppercase tracking-widest">Execution_Queue</h3>
                      <p className="text-sm text-red-400 font-bold mt-1 uppercase">{vulnerabilities.filter(v => v.severity === 'high' || v.severity === 'critical').length} Lethal</p>
                    </motion.div>
                    <div className={`p-4 bg-black border flex flex-col items-center text-center ${score !== null && score >= 80 ? 'border-red-500 shadow-[inset_0_0_15px_rgba(239,68,68,0.1)]' : 'border-red-500 shadow-[inset_0_0_15px_rgba(239,68,68,0.1)]'}`}>
                      <Skull className={`w-8 h-8 mb-3 neon-text ${score !== null && score >= 80 ? 'text-red-500' : 'text-red-500'}`} />
                      <h3 className={`text-xs font-bold uppercase tracking-widest ${score !== null && score >= 80 ? 'text-red-600' : 'text-red-600'}`}>Survival_Probability</h3>
                      <p className={`text-sm font-bold mt-1 uppercase neon-text ${score !== null && score >= 80 ? 'text-red-400' : 'text-red-400'}`}>{score ?? '?'}/100 ({grade ?? '?'})</p>
                    </div>
                  </div>

                  {/* Severity Distribution Chart */}
                  {chartData.length > 0 && (
                    <div className="bg-black border-2 border-red-500 p-6 neon-border h-72 flex flex-col">
                      <h3 className="text-sm font-bold text-red-500 mb-2 flex items-center gap-2 uppercase tracking-widest shrink-0">
                        <AlertTriangle className="w-4 h-4 text-red-500" /> Severity_Distribution
                      </h3>
                      <div className="flex-1 min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={chartData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                              stroke="none"
                            >
                              {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#000', borderColor: '#ef4444', borderRadius: 0, textTransform: 'uppercase', fontFamily: 'monospace' }}
                              itemStyle={{ color: '#ef4444', fontWeight: 'bold' }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  {/* Vulnerabilities List */}
                  <div className="bg-black border-2 border-red-500 p-6 neon-border">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-red-500 flex items-center gap-2 uppercase tracking-widest">
                        <Flame className="w-4 h-4 text-yellow-500" /> Fried_Subroutines // Lethal_Faults
                      </h3>
                      <button
                        onClick={generatePDF}
                        className="flex items-center gap-2 text-xs border border-red-500 hover:bg-red-500 hover:text-black text-red-500 px-3 py-1 uppercase tracking-widest transition-colors focus:outline-none"
                      >
                        <Download className="w-3 h-3" /> EXPORT_PDF
                      </button>
                    </div>
                    <div className="space-y-3">
                      {vulnerabilities.map(vuln => (
                        <button
                          key={vuln.id}
                          onClick={() => setSelectedVuln(vuln)}
                          className="w-full text-left bg-black border border-red-900 hover:border-red-500 p-4 transition-colors flex justify-between items-center group relative overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-red-500/10 -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
                          <div className="relative z-10">
                            <div className="text-sm font-bold text-red-500 uppercase tracking-wide group-hover:text-red-400 transition-colors">{vuln.title}</div>
                            <div className="text-xs text-red-700 mt-1 uppercase tracking-widest group-hover:text-red-600 transition-colors">{vuln.affectedModule}</div>
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
              className="relative bg-black border-2 border-red-500 w-full max-w-lg shadow-[0_0_30px_rgba(239,68,68,0.3)] overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 border-b-2 border-red-500 bg-red-950/30">
                <div className="flex items-center gap-2">
                  <Skull className={`w-5 h-5 ${selectedVuln.severity === 'critical' || selectedVuln.severity === 'high' ? 'text-red-500' : 'text-yellow-500'}`} />
                  <h2 className="text-sm font-bold text-red-500 uppercase tracking-widest">Lethal_Fault_Details</h2>
                </div>
                <button onClick={() => setSelectedVuln(null)} className="p-1 border border-transparent hover:border-red-500 hover:bg-red-500 hover:text-black transition-colors text-red-500">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className={`text-lg font-bold pr-4 uppercase tracking-wider ${
                      selectedVuln.severity === 'critical' || selectedVuln.severity === 'high' ? 'text-red-400' : 'text-red-400'
                    }`}>{selectedVuln.title}</h3>
                    <span className={`px-3 py-1 shrink-0 bg-black border text-[10px] font-bold uppercase tracking-widest ${
                      selectedVuln.severity === 'critical' || selectedVuln.severity === 'high' 
                        ? 'border-red-500 text-red-500 shadow-[0_0_5px_rgba(239,68,68,0.4)]'
                        : 'border-yellow-500 text-yellow-500 shadow-[0_0_5px_rgba(234,179,8,0.4)]'
                    }`}>
                      {selectedVuln.severity} SEVERITY
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-red-600 font-mono uppercase tracking-widest">
                    <span>ID: {selectedVuln.id}</span>
                    <span>//</span>
                    <span>MOD: {selectedVuln.affectedModule}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-red-700 uppercase tracking-widest">Description</h4>
                  <p className="text-sm text-red-500 leading-relaxed uppercase">{selectedVuln.description}</p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-red-700 uppercase tracking-widest">Remediation</h4>
                  <div className="bg-black border border-red-500 p-4 shadow-[inset_0_0_10px_rgba(239,68,68,0.1)]">
                    <p className="text-sm text-red-400 leading-relaxed font-mono uppercase">{selectedVuln.remediation}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border-t-2 border-red-500 bg-black flex justify-end">
                <button 
                  onClick={() => setSelectedVuln(null)} 
                  className="px-6 py-2 border-2 border-red-500 bg-black hover:bg-red-500 hover:text-black text-red-500 text-sm font-bold uppercase tracking-widest transition-colors focus:outline-none"
                >
                  SIGN_DEATH_WARRANT
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
