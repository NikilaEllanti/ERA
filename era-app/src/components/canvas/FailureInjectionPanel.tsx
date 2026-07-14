'use client';
import { SimulationState, FAILURE_TYPES, FailureType } from '@/lib/simulation-engine';
import styles from './FailureInjectionPanel.module.css';

interface FailureInjectionPanelProps {
  simState: SimulationState;
  onInject: (type: string) => void;
  onClear: (type: string) => void;
  onClearAll: () => void;
  onClose: () => void;
}

export default function FailureInjectionPanel({
  simState,
  onInject,
  onClear,
  onClearAll,
  onClose,
}: FailureInjectionPanelProps) {
  const { activeFailures } = simState;

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <div className={styles.headerTitle}>
          <span>💥</span>
          <div>
            <h3>Chaos Simulator</h3>
            <span className={styles.subtitle}>Inject failures & test resilience</span>
          </div>
        </div>
        <button className={styles.closeBtn} onClick={onClose}>×</button>
      </div>

      <div className={styles.scrollable}>
        <div className={styles.actions}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={onClearAll}
            disabled={activeFailures.length === 0}
            id="clear-all-failures"
          >
            Clear All Failures
          </button>
        </div>

        <div className={styles.failuresGrid}>
          {Object.entries(FAILURE_TYPES).map(([key, def]) => {
            const isActive = activeFailures.includes(key);
            const severity = def.errorRateIncrease > 0.5 || def.latencyMultiplier > 10
              ? 'high'
              : def.errorRateIncrease > 0.2 || def.latencyMultiplier > 3
              ? 'medium'
              : 'low';

            return (
              <div
                key={key}
                className={`${styles.card} ${isActive ? styles.activeCard : ''}`}
                style={{
                  borderLeft: `4px solid ${isActive ? '#ef4444' : 'rgba(255,255,255,0.08)'}`,
                }}
              >
                <div className={styles.cardHeader}>
                  <div className={styles.cardTitleInfo}>
                    <span className={styles.icon}>⚠️</span>
                    <div>
                      <h4 className={styles.cardLabel}>{def.label}</h4>
                      <span className={styles.severity} style={{
                        color: severity === 'high' ? '#ef4444' : severity === 'medium' ? '#f59e0b' : '#3b82f6'
                      }}>
                        {severity} severity
                      </span>
                    </div>
                  </div>
                  
                  {isActive ? (
                    <button
                      className={`${styles.actionBtn} ${styles.clearBtn}`}
                      onClick={() => onClear(key)}
                      id={`clear-failure-${key}`}
                    >
                      Clear
                    </button>
                  ) : (
                    <button
                      className={`${styles.actionBtn} ${styles.injectBtn}`}
                      onClick={() => onInject(key)}
                      disabled={!simState.running}
                      id={`inject-failure-${key}`}
                      title={!simState.running ? 'Start simulation to inject failures' : undefined}
                    >
                      Inject
                    </button>
                  )}
                </div>
                <p className={styles.desc}>{def.description}</p>
                
                {isActive && (
                  <div className={styles.impactAlert}>
                    <strong>Impact:</strong> {
                      key === 'redis_down' ? 'Redis requests fail immediately. DB write/read overload!' :
                      key === 'network_partition' ? 'API Gateway isolated from services. Total timeout!' :
                      key === 'packet_loss' ? 'Packets dropped randomly. Latency spike and retries!' :
                      key === 'db_slowdown' ? 'SQL queries take 500ms+. Connection pools exhaust!' :
                      'Incoming request volume multiplies. CPU exhaustion imminent!'
                    }
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
