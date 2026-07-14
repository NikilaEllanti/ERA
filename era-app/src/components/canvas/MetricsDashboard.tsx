'use client';
import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { SimulationState, SimNode } from '@/lib/simulation-engine';
import styles from './MetricsDashboard.module.css';

interface MetricsDashboardProps {
  simState: SimulationState;
  simNodes: SimNode[];
  onClose: () => void;
}

interface HistoricalData {
  time: string;
  qps: number;
  latency: number;
  errorRate: number;
}

export default function MetricsDashboard({ simState, simNodes, onClose }: MetricsDashboardProps) {
  const [history, setHistory] = useState<HistoricalData[]>([]);

  // Collect historical metrics when running
  useEffect(() => {
    if (!simState.running) return;

    const interval = setInterval(() => {
      setHistory(prev => {
        const next = [...prev, {
          time: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          qps: simState.globalQPS,
          latency: simState.globalLatencyP99,
          errorRate: simState.globalErrorRate * 100,
        }];
        // Keep last 15 points
        return next.slice(-15);
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [simState.running, simState.globalQPS, simState.globalLatencyP99, simState.globalErrorRate]);

  // Node CPU / Memory stats
  const nodeStats = simNodes.map(n => ({
    name: n.label,
    cpu: Math.round(n.metrics.cpuPercent || 0),
    qps: Math.round(n.metrics.qps || 0),
  })).filter(n => n.qps > 0);

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <div className={styles.headerTitle}>
          <span>📊</span>
          <div>
            <h3>Metrics Dashboard</h3>
            <span className={styles.subtitle}>Real-time system telemetry</span>
          </div>
        </div>
        <button className={styles.closeBtn} onClick={onClose}>×</button>
      </div>

      <div className={styles.scrollable}>
        {/* Core KPIs */}
        <div className={styles.kpiGrid}>
          <div className={styles.kpiCard}>
            <span className={styles.kpiLabel}>QPS (Load)</span>
            <span className={styles.kpiValue} style={{color: '#4f8ef7'}}>
              {simState.globalQPS.toFixed(0)}
            </span>
          </div>
          <div className={styles.kpiCard}>
            <span className={styles.kpiLabel}>p99 Latency</span>
            <span className={styles.kpiValue} style={{color: simState.globalLatencyP99 > 400 ? '#ef4444' : '#10b981'}}>
              {simState.globalLatencyP99.toFixed(1)}ms
            </span>
          </div>
          <div className={styles.kpiCard}>
            <span className={styles.kpiLabel}>Error Rate</span>
            <span className={styles.kpiValue} style={{color: simState.globalErrorRate > 0.05 ? '#ef4444' : '#94a3b8'}}>
              {(simState.globalErrorRate * 100).toFixed(2)}%
            </span>
          </div>
          <div className={styles.kpiCard}>
            <span className={styles.kpiLabel}>Availability</span>
            <span className={styles.kpiValue} style={{color: simState.globalAvailability < 99 ? '#ef4444' : '#10b981'}}>
              {simState.globalAvailability.toFixed(3)}%
            </span>
          </div>
        </div>

        {/* Charts */}
        {history.length > 1 ? (
          <div className={styles.chartsContainer}>
            <div className={styles.chartWrapper}>
              <h4 className={styles.chartTitle}>Throughput (QPS)</h4>
              <div style={{ width: '100%', height: 140 }}>
                <ResponsiveContainer>
                  <AreaChart data={history} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorQps" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f8ef7" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#4f8ef7" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 9 }} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 9 }} />
                    <Tooltip contentStyle={{ background: '#0a0e1a', borderColor: 'rgba(255,255,255,0.1)', fontSize: 11 }} />
                    <Area type="monotone" dataKey="qps" stroke="#4f8ef7" fillOpacity={1} fill="url(#colorQps)" strokeWidth={1.5} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className={styles.chartWrapper}>
              <h4 className={styles.chartTitle}>p99 Latency (ms)</h4>
              <div style={{ width: '100%', height: 140 }}>
                <ResponsiveContainer>
                  <AreaChart data={history} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 9 }} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 9 }} />
                    <Tooltip contentStyle={{ background: '#0a0e1a', borderColor: 'rgba(255,255,255,0.1)', fontSize: 11 }} />
                    <Area type="monotone" dataKey="latency" stroke="#10b981" fillOpacity={1} fill="url(#colorLatency)" strokeWidth={1.5} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {nodeStats.length > 0 && (
              <div className={styles.chartWrapper}>
                <h4 className={styles.chartTitle}>Load distribution (QPS per service)</h4>
                <div style={{ width: '100%', height: 140 }}>
                  <ResponsiveContainer>
                    <BarChart data={nodeStats} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 8 }} />
                      <YAxis tick={{ fill: '#64748b', fontSize: 9 }} />
                      <Tooltip contentStyle={{ background: '#0a0e1a', borderColor: 'rgba(255,255,255,0.1)', fontSize: 11 }} />
                      <Bar dataKey="qps" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className={styles.empty}>
            <span>⚡</span>
            <p>Start simulation to begin collecting telemetry metrics</p>
          </div>
        )}
      </div>
    </div>
  );
}
