'use client';
import { Handle, Position, NodeProps } from 'reactflow';
import { NodeDefinition } from '@/lib/templates';
import { NodeMetrics } from '@/lib/simulation-engine';
import styles from './ArchNode.module.css';

interface ArchNodeData {
  nodeType: string;
  label: string;
  config: Record<string, unknown>;
  def?: NodeDefinition;
  metrics?: NodeMetrics;
  status?: 'healthy' | 'degraded' | 'down' | 'recovering';
  simRunning?: boolean;
}

const STATUS_COLORS = {
  healthy: '#10b981',
  degraded: '#f59e0b',
  down: '#ef4444',
  recovering: '#7c3aed',
};

const STATUS_ICONS = {
  healthy: '●',
  degraded: '▲',
  down: '✕',
  recovering: '↻',
};

export default function ArchNode({ data, selected }: NodeProps<ArchNodeData>) {
  const { def, label, metrics, status = 'healthy', simRunning, config } = data;
  const statusColor = STATUS_COLORS[status];
  const borderColor = def?.borderColor || '#4f8ef7';
  const bgColor = def?.color || '#1a2547';
  const replicas = config?.replicas as number | undefined;

  return (
    <div
      className={`${styles.node} ${selected ? styles.selected : ''} ${simRunning && status !== 'healthy' ? styles[status] : ''}`}
      style={{
        background: bgColor,
        borderColor: selected ? borderColor : `${borderColor}55`,
        boxShadow: selected
          ? `0 0 0 2px ${borderColor}40, 0 0 20px ${borderColor}25`
          : simRunning
          ? `0 0 10px ${borderColor}20`
          : 'none',
      }}
    >
      <Handle type="target" position={Position.Top} className={styles.handle} />

      <div className={styles.header}>
        <span className={styles.icon}>{def?.icon || '⚙️'}</span>
        <div className={styles.titleArea}>
          <span className={styles.label}>{label}</span>
          {replicas && Number(replicas) > 1 && (
            <span className={styles.replicas}>×{replicas}</span>
          )}
        </div>
        {simRunning && (
          <span
            className={styles.statusDot}
            style={{ color: statusColor }}
            title={status}
          >
            {STATUS_ICONS[status]}
          </span>
        )}
      </div>

      {simRunning && metrics && (
        <div className={styles.metrics}>
          <div className={styles.metricRow}>
            <span style={{color:'#4f8ef7'}}>QPS</span>
            <span className={styles.metricVal}>{metrics.qps?.toFixed(0)}</span>
          </div>
          <div className={styles.metricRow}>
            <span style={{color: metrics.latencyP99 > 200 ? '#ef4444' : '#10b981'}}>p99</span>
            <span className={styles.metricVal}>{metrics.latencyP99?.toFixed(0)}ms</span>
          </div>
          <div className={styles.metricRow}>
            <span style={{color: metrics.errorRate > 0.05 ? '#ef4444' : '#94a3b8'}}>err</span>
            <span className={styles.metricVal}>{(metrics.errorRate * 100).toFixed(1)}%</span>
          </div>
          {metrics.cacheHitRatio !== undefined && (
            <div className={styles.metricRow}>
              <span style={{color:'#7c3aed'}}>hit</span>
              <span className={styles.metricVal}>{(metrics.cacheHitRatio * 100).toFixed(0)}%</span>
            </div>
          )}
          {metrics.queueDepth !== undefined && (
            <div className={styles.metricRow}>
              <span style={{color:'#f59e0b'}}>Q</span>
              <span className={styles.metricVal}>{metrics.queueDepth?.toFixed(0)}</span>
            </div>
          )}
          {/* CPU bar */}
          <div className={styles.cpuBar}>
            <div
              className={styles.cpuFill}
              style={{
                width: `${Math.min(100, metrics.cpuPercent)}%`,
                background: metrics.cpuPercent > 80 ? '#ef4444' : metrics.cpuPercent > 60 ? '#f59e0b' : '#10b981',
              }}
            />
          </div>
        </div>
      )}

      <div
        className={styles.typeTag}
        style={{ borderColor: `${borderColor}40`, color: borderColor }}
      >
        {data.nodeType?.replace('_', ' ')}
      </div>

      {simRunning && (
        <div className={styles.pulse} style={{ background: statusColor, opacity: status === 'healthy' ? 0.5 : 0.8 }} />
      )}

      <Handle type="source" position={Position.Bottom} className={styles.handle} />
      <Handle type="source" position={Position.Right} className={styles.handleSide} />
      <Handle type="target" position={Position.Left} className={styles.handleSide} />
    </div>
  );
}
