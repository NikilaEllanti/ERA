'use client';
import { useState, useEffect, useRef } from 'react';
import { SimulationState, SimNode, FAILURE_TYPES, FailureType } from '@/lib/simulation-engine';
import styles from './TestingPanel.module.css';

interface TestingPanelProps {
  simState: SimulationState;
  simNodes: SimNode[];
  onInjectFailure: (type: string) => void;
  onClearAllFailures?: () => void;
  onClose: () => void;
}

interface TestReport {
  id: string;
  name: string;
  timestamp: number;
  status: 'passed' | 'failed';
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  persona: string;
  metrics: {
    availability: number;
    p99Latency: number;
    errorRate: number;
    peakQps: number;
  };
  details: string[];
}

interface Persona {
  id: string;
  name: string;
  title: string;
  avatar: string;
  color: string;
  description: string;
  focus: string;
  tests: { name: string; desc: string; failure: FailureType }[];
}

const PERSONAS: Persona[] = [
  {
    id: 'cloud',
    name: 'Sarah',
    title: 'Cloud Architect',
    avatar: '☁️',
    color: '#0ea5e9',
    description: 'Focuses on regional failover, auto-scaling, CDN offloading, and infrastructure cost optimization.',
    focus: 'Scalability & Cloud Cost',
    tests: [
      { name: 'Multi-Region Outage Test', desc: 'Simulate region loss and verify failover routing.', failure: 'region_outage' },
      { name: 'Extreme Scale Test', desc: 'Verify CDN edge cache efficiency under 10x traffic surge.', failure: 'traffic_spike' }
    ]
  },
  {
    id: 'security',
    name: 'Marcus',
    title: 'Security Principal',
    avatar: '🔒',
    color: '#ef4444',
    description: 'Stress-tests API gateway authentication, rate limiting, and DDoS protection resilience.',
    focus: 'Auth & DDoS Protection',
    tests: [
      { name: 'Gateway DDoS Test', desc: 'Flood ingress with traffic & verify rate-limiter shedding.', failure: 'traffic_spike' },
      { name: 'Retry Storm Cascading Test', desc: 'Test client authentication retry behavior during microservices load.', failure: 'retry_storm' }
    ]
  },
  {
    id: 'network',
    name: 'Elena',
    title: 'Network Systems Engineer',
    avatar: '🌐',
    color: '#10b981',
    description: 'Validates packet loss recovery, TCP socket exhaust, and split-brain partition tolerance.',
    focus: 'Packet Loss & Network Partition',
    tests: [
      { name: 'SLA Latency Packet Loss Test', desc: 'Verify TCP retransmission latency spike under 30% packet loss.', failure: 'packet_loss' },
      { name: 'CAP Theorem Split-Brain Test', desc: 'Simulate total network partition and verify database consistency.', failure: 'network_partition' }
    ]
  },
  {
    id: 'database',
    name: 'David',
    title: 'DB Reliability Engineer',
    avatar: '🗄️',
    color: '#f59e0b',
    description: 'Audits replication lag, write thread bottleneck pools, cache stampedes, and failover.',
    focus: 'Database Resilience',
    tests: [
      { name: 'Primary Crash Failover Test', desc: 'Simulate PostgreSQL master crash and replicate to secondary.', failure: 'db_failover' },
      { name: 'Cache Stampede Overload Test', desc: 'Verify DB capacity when L1 Cache expires simultaneously.', failure: 'cache_stampede' }
    ]
  },
  {
    id: 'sre',
    name: 'Alex',
    title: 'Site Reliability Engineer',
    avatar: '🏗️',
    color: '#7c3aed',
    description: 'Enforces strict SLA uptime compliance, MTTR recovery speed, and runbook automations.',
    focus: 'Chaos Day & SLA Compliance',
    tests: [
      { name: 'Slow Consumer Queue Lag Test', desc: 'Verify queue consumption threshold limits.', failure: 'slow_consumer' },
      { name: 'OOM Garbage Collection Test', desc: 'Inject service memory pressure and audit pod recovery.', failure: 'memory_pressure' }
    ]
  },
  {
    id: 'principal',
    name: 'Sophia',
    title: 'Principal Engineer',
    avatar: '👑',
    color: '#ec4899',
    description: 'Consolidated end-to-end reliability audit combining scaling, networking, database and security constraints.',
    focus: 'Full System Audit',
    tests: [
      { name: 'Chaos Game Day Audit', desc: 'Sequential multi-failure injection across all subsystems.', failure: 'traffic_spike' }
    ]
  }
];

export default function TestingPanel({
  simState,
  simNodes,
  onInjectFailure,
  onClearAllFailures,
  onClose,
}: TestingPanelProps) {
  const [activeTab, setActiveTab] = useState<'run' | 'traffic' | 'reports'>('run');
  const [selectedPersona, setSelectedPersona] = useState<string>('cloud');
  const [testing, setTesting] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [reports, setReports] = useState<TestReport[]>([]);
  const consoleEndRef = useRef<HTMLDivElement>(null);

  // Manual Traffic Simulator controls
  const [concurrentUsers, setConcurrentUsers] = useState<number>(10000);
  const [reqsPerUser, setReqsPerUser] = useState<number>(10);
  const [trafficPattern, setTrafficPattern] = useState<'steady' | 'spike' | 'wave' | 'ramp' | 'burst'>('steady');
  const [trafficActive, setTrafficActive] = useState<boolean>(false);
  const trafficIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Manual target SLA controls
  const [targetSla, setTargetSla] = useState<number>(99.9);
  const [targetLatency, setTargetLatency] = useState<number>(300);
  const [targetErrorRate, setTargetErrorRate] = useState<number>(2.0);

  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('era_test_reports');
      if (saved) setReports(JSON.parse(saved));
    } catch {}
  }, []);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  // Run Persona Test Suite
  const runPersonaTestSuite = async () => {
    if (!simState.running) {
      alert('Start the system simulation first using the Play button to inject live traffic!');
      return;
    }

    const persona = PERSONAS.find(p => p.id === selectedPersona);
    if (!persona) return;

    setTesting(true);
    setLogs([]);
    addLog(`🚀 Starting ${persona.focus} Audit with ${persona.name} (${persona.title})...`);
    await new Promise(r => setTimeout(r, 800));

    addLog('📊 Baselining system metrics...');
    await new Promise(r => setTimeout(r, 800));
    addLog(`ℹ️ Base metrics: Latency=${simState.globalLatencyP99.toFixed(1)}ms, Error Rate=${(simState.globalErrorRate * 100).toFixed(2)}%, Availability=${simState.globalAvailability.toFixed(3)}%`);

    let peakError = 0;
    let peakLatency = 0;
    const testDetails: string[] = [];

    for (const test of persona.tests) {
      addLog(`👉 Running: ${test.name}`);
      addLog(`💥 Injecting failure: ${test.failure}`);
      onInjectFailure(test.failure);
      await new Promise(r => setTimeout(r, 2000));

      const latencyVal = simState.globalLatencyP99;
      const errorVal = simState.globalErrorRate;
      peakError = Math.max(peakError, errorVal);
      peakLatency = Math.max(peakLatency, latencyVal);

      addLog(`⚠️ System State: Latency=${latencyVal.toFixed(1)}ms, Error Rate=${(errorVal * 100).toFixed(2)}%`);

      // Evaluate SLA thresholds
      if (latencyVal > targetLatency) {
        addLog(`❌ FAILED: Latency peaked at ${latencyVal.toFixed(0)}ms (SLA target is ${targetLatency}ms)`);
        testDetails.push(`- Latency threshold breach: ${latencyVal.toFixed(0)}ms > ${targetLatency}ms`);
      } else {
        addLog(`✅ PASSED: Latency within parameters.`);
      }

      if (errorVal * 100 > targetErrorRate) {
        addLog(`❌ FAILED: Error rate spiked at ${(errorVal * 100).toFixed(2)}% (SLA target is ${targetErrorRate}%)`);
        testDetails.push(`- Error rate threshold breach: ${(errorVal * 100).toFixed(2)}% > ${targetErrorRate}%`);
      } else {
        addLog(`✅ PASSED: Error rate within limits.`);
      }

      if (onClearAllFailures) {
        onClearAllFailures();
      }
      await new Promise(r => setTimeout(r, 1000));
    }

    const overallAvailability = simState.globalAvailability;
    const passed = peakError * 100 <= targetErrorRate && peakLatency <= targetLatency && overallAvailability >= targetSla;

    // Calculate Grade
    let grade: 'A' | 'B' | 'C' | 'D' | 'F' = 'A';
    if (!passed) {
      if (peakError * 100 > 10 || peakLatency > targetLatency * 2) grade = 'F';
      else if (peakError * 100 > 5) grade = 'D';
      else grade = 'C';
    } else if (peakLatency > targetLatency * 0.7) {
      grade = 'B';
    }

    const newReport: TestReport = {
      id: `report-${Date.now()}`,
      name: `${persona.focus} Audit`,
      timestamp: Date.now(),
      status: passed ? 'passed' : 'failed',
      grade,
      persona: `${persona.name} (${persona.title})`,
      metrics: {
        availability: overallAvailability,
        p99Latency: peakLatency,
        errorRate: peakError,
        peakQps: simState.globalQPS
      },
      details: [
        passed ? `✅ Architecture certified by ${persona.name}.` : `❌ Audit failed to satisfy SLA targets.`,
        `- Peak observed latency: ${peakLatency.toFixed(1)}ms`,
        `- Peak observed error rate: ${(peakError * 100).toFixed(2)}%`,
        `- Target SLA Availability: ${targetSla}% (Observed: ${overallAvailability.toFixed(3)}%)`,
        ...testDetails
      ]
    };

    setReports(prev => {
      const next = [newReport, ...prev];
      localStorage.setItem('era_test_reports', JSON.stringify(next));
      return next;
    });

    addLog(`🏁 Audit completed. Final Grade: [${grade}]`);
    setTesting(false);
  };

  // Manual Traffic Generator
  const toggleTrafficSimulation = () => {
    if (trafficActive) {
      if (trafficIntervalRef.current) clearInterval(trafficIntervalRef.current);
      setTrafficActive(false);
      if (onClearAllFailures) onClearAllFailures();
      addLog('⏹️ Traffic simulator stopped.');
    } else {
      if (!simState.running) {
        alert('Please run the simulator first (Play button) before generating traffic.');
        return;
      }
      setTrafficActive(true);
      addLog(`▶️ Generating real-time traffic: ${concurrentUsers.toLocaleString()} concurrent users...`);

      trafficIntervalRef.current = setInterval(() => {
        // Calculate dynamic QPS based on users & frequency
        const calculatedQps = (concurrentUsers * reqsPerUser) / 60;
        
        // Dynamically inject traffic spikes under load
        if (calculatedQps > 5000) {
          onInjectFailure('traffic_spike');
        }
        
        // Add random burst patterns if selected
        if (trafficPattern === 'burst' && Math.random() > 0.7) {
          onInjectFailure('traffic_spike');
        }
      }, 2000);
    }
  };

  useEffect(() => {
    return () => {
      if (trafficIntervalRef.current) clearInterval(trafficIntervalRef.current);
    };
  }, []);

  const activePersonaObj = PERSONAS.find(p => p.id === selectedPersona) || PERSONAS[0];

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <div className={styles.headerTitle}>
          <span>🧪</span>
          <div>
            <h3>Testing & Verification</h3>
            <span className={styles.subtitle}>SLA constraints & manual traffic</span>
          </div>
        </div>
        <button className={styles.closeBtn} onClick={onClose}>×</button>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'run' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('run')}
        >
          Personas Audit
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'traffic' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('traffic')}
        >
          Traffic Simulator
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'reports' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          Reports ({reports.length})
        </button>
      </div>

      <div className={styles.scrollable}>
        {activeTab === 'run' ? (
          <div className={styles.runSection}>
            {/* SLA Configuration */}
            <div className={styles.sectionCard}>
              <h5>🎯 Target SLA Thresholds</h5>
              <div className={styles.slaGrid}>
                <div className={styles.sliderGroup}>
                  <label>Uptime SLA: {targetSla}%</label>
                  <input
                    type="range"
                    min="95"
                    max="99.999"
                    step="0.01"
                    value={targetSla}
                    onChange={e => setTargetSla(parseFloat(e.target.value))}
                  />
                </div>
                <div className={styles.sliderGroup}>
                  <label>p99 SLA Latency: {targetLatency}ms</label>
                  <input
                    type="range"
                    min="50"
                    max="1000"
                    step="50"
                    value={targetLatency}
                    onChange={e => setTargetLatency(parseInt(e.target.value))}
                  />
                </div>
                <div className={styles.sliderGroup}>
                  <label>Max Error Rate: {targetErrorRate}%</label>
                  <input
                    type="range"
                    min="0.5"
                    max="10"
                    step="0.5"
                    value={targetErrorRate}
                    onChange={e => setTargetErrorRate(parseFloat(e.target.value))}
                  />
                </div>
              </div>
            </div>

            {/* Persona Grid */}
            <div className={styles.personaContainer}>
              <h5>Choose Engineering Persona:</h5>
              <div className={styles.personaGrid}>
                {PERSONAS.map(p => (
                  <button
                    key={p.id}
                    className={`${styles.personaCard} ${selectedPersona === p.id ? styles.personaCardActive : ''}`}
                    onClick={() => setSelectedPersona(p.id)}
                    style={{
                      borderBottom: selectedPersona === p.id ? `3px solid ${p.color}` : 'none'
                    }}
                  >
                    <span className={styles.personaAvatar}>{p.avatar}</span>
                    <div className={styles.personaText}>
                      <span className={styles.personaName}>{p.name}</span>
                      <span className={styles.personaTitle}>{p.title}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Persona Info */}
            <div className={styles.personaDetailCard} style={{ borderColor: activePersonaObj.color }}>
              <div className={styles.personaDetailHeader}>
                <span className={styles.largeAvatar}>{activePersonaObj.avatar}</span>
                <div>
                  <h4>{activePersonaObj.name} • {activePersonaObj.title}</h4>
                  <span className={styles.focusLabel} style={{ color: activePersonaObj.color }}>
                    Focus: {activePersonaObj.focus}
                  </span>
                </div>
              </div>
              <p className={styles.personaDesc}>{activePersonaObj.description}</p>
              
              <div className={styles.testsList}>
                {activePersonaObj.tests.map((t, idx) => (
                  <div key={idx} className={styles.testItem}>
                    <span>🚀 {t.name}</span>
                    <p>{t.desc}</p>
                  </div>
                ))}
              </div>

              <button
                className="btn btn-primary"
                onClick={runPersonaTestSuite}
                disabled={testing}
                style={{ width: '100%', marginTop: '16px', background: activePersonaObj.color }}
              >
                {testing ? 'Auditing Architecture...' : `Run ${activePersonaObj.name}'s Audit`}
              </button>
            </div>

            {/* Console Output */}
            {logs.length > 0 && (
              <div className={styles.consoleWrapper}>
                <h4 className={styles.consoleTitle}>Chaos Auditor Logs</h4>
                <div className={styles.console}>
                  {logs.map((log, i) => (
                    <div key={i} className={styles.consoleLine}>{log}</div>
                  ))}
                  {testing && <div className={styles.cursor} />}
                  <div ref={consoleEndRef} />
                </div>
              </div>
            )}
          </div>
        ) : activeTab === 'traffic' ? (
          <div className={styles.trafficSection}>
            <div className={styles.sectionCard}>
              <h5>📈 Live Traffic Generation</h5>
              <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginBottom: '16px' }}>
                Simulate production load by defining target user concurrency and traffic request patterns.
              </p>

              <div className={styles.sliderGroup} style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <label>Concurrent Users</label>
                  <strong style={{ color: '#4f8ef7' }}>{concurrentUsers.toLocaleString()}</strong>
                </div>
                <input
                  type="range"
                  min="100"
                  max="1000000"
                  step="5000"
                  value={concurrentUsers}
                  onChange={e => setConcurrentUsers(parseInt(e.target.value))}
                />
              </div>

              <div className={styles.sliderGroup} style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <label>Requests per User (per min)</label>
                  <strong style={{ color: '#0ea5e9' }}>{reqsPerUser} requests</strong>
                </div>
                <input
                  type="range"
                  min="1"
                  max="60"
                  step="1"
                  value={reqsPerUser}
                  onChange={e => setReqsPerUser(parseInt(e.target.value))}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem' }}>Traffic Pattern</label>
                <div className={styles.patternGrid}>
                  {[
                    { id: 'steady', label: 'Steady State', desc: 'Flat consistent request rate' },
                    { id: 'spike', label: 'Spike Burst', desc: 'Random massive load peaks' },
                    { id: 'wave', label: 'Diurnal Wave', desc: 'Day/night loading cycles' },
                    { id: 'ramp', label: 'Step Ramp', desc: 'Linear scaling escalation' },
                    { id: 'burst', label: 'Chaos Burst', desc: 'Unpredictable random spikes' }
                  ].map(p => (
                    <button
                      key={p.id}
                      className={`${styles.patternCard} ${trafficPattern === p.id ? styles.patternCardActive : ''}`}
                      onClick={() => setTrafficPattern(p.id as any)}
                    >
                      <strong>{p.label}</strong>
                      <p>{p.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <button
                className={`btn ${trafficActive ? 'btn-danger' : 'btn-primary'}`}
                onClick={toggleTrafficSimulation}
                style={{ width: '100%' }}
              >
                {trafficActive ? '⏹️ Stop Traffic Generator' : '▶️ Run Traffic Generator'}
              </button>
            </div>

            {/* Traffic Load Monitor */}
            {trafficActive && (
              <div className={styles.monitorCard}>
                <div className={styles.liveIndicator}>
                  <span className={styles.livePulse} />
                  <span>TRANSMITTING TRAFFIC</span>
                </div>
                <div className={styles.trafficStats}>
                  <div className={styles.tStat}>
                    <span>Estimated QPS</span>
                    <strong>{((concurrentUsers * reqsPerUser) / 60).toFixed(0)} requests/s</strong>
                  </div>
                  <div className={styles.tStat}>
                    <span>Simulated Load</span>
                    <strong>{(concurrentUsers / 1000).toFixed(1)}k req/min</strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className={styles.reportsSection}>
            {reports.length === 0 ? (
              <div className={styles.empty}>
                <span>📝</span>
                <p>No audit reports generated yet. Run some audits above!</p>
              </div>
            ) : (
              <div className={styles.reportsList}>
                {reports.map(report => (
                  <div key={report.id} className={styles.reportCard}>
                    <div className={styles.reportHeader}>
                      <div>
                        <h4 className={styles.reportName}>{report.name}</h4>
                        <span className={styles.reportDate}>
                          {new Date(report.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div className={styles.gradeBadge} style={{
                        borderColor: report.grade === 'A' ? '#10b981' : report.grade === 'B' ? '#4f8ef7' : report.grade === 'C' ? '#f59e0b' : '#ef4444',
                        color: report.grade === 'A' ? '#10b981' : report.grade === 'B' ? '#4f8ef7' : report.grade === 'C' ? '#f59e0b' : '#ef4444'
                      }}>
                        {report.grade}
                      </div>
                    </div>

                    <div className={styles.reportMeta}>
                      <span>Auditor: <strong>{report.persona}</strong></span>
                    </div>

                    <div className={styles.reportMetrics}>
                      <div>
                        <span>Availability</span>
                        <strong>{report.metrics.availability.toFixed(3)}%</strong>
                      </div>
                      <div>
                        <span>p99 Latency</span>
                        <strong>{report.metrics.p99Latency.toFixed(0)}ms</strong>
                      </div>
                      <div>
                        <span>Error Rate</span>
                        <strong>{(report.metrics.errorRate * 100).toFixed(2)}%</strong>
                      </div>
                    </div>

                    <div className={styles.reportDetails}>
                      {report.details.map((d, i) => <div key={i}>{d}</div>)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
