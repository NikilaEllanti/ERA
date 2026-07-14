'use client';
import { SimulationState } from '@/lib/simulation-engine';
import styles from './SimulationControls.module.css';

interface SimulationControlsProps {
  simState: SimulationState;
  onStart: () => void;
  onPause: () => void;
  onStop: () => void;
  onSpeedChange: (speed: number) => void;
}

export default function SimulationControls({
  simState,
  onStart,
  onPause,
  onStop,
  onSpeedChange,
}: SimulationControlsProps) {
  const { running, speed } = simState;

  return (
    <div className={styles.controls}>
      {running ? (
        <button className={`${styles.btn} ${styles.pauseBtn}`} onClick={onPause} id="sim-pause">
          <span>⏸</span> Pause
        </button>
      ) : (
        <button className={`${styles.btn} ${styles.playBtn}`} onClick={onStart} id="sim-start">
          <span>▶</span> Run Simulation
        </button>
      )}

      <button
        className={`${styles.btn} ${styles.stopBtn}`}
        onClick={onStop}
        disabled={!running && simState.globalQPS === 0}
        id="sim-stop"
      >
        <span>⏹</span> Stop
      </button>

      <div className={styles.divider} />

      <div className={styles.speedGroup}>
        {([
          { label: '1x', val: 1 },
          { label: '2x', val: 2 },
          { label: '5x', val: 5 },
        ] as { label: string; val: number }[]).map(s => (
          <button
            key={s.val}
            className={`${styles.speedBtn} ${speed === s.val ? styles.speedBtnActive : ''}`}
            onClick={() => onSpeedChange(s.val)}
            id={`sim-speed-${s.val}`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className={styles.status}>
        <span className={`${styles.statusIndicator} ${running ? styles.running : ''}`} />
        <span className={styles.statusText}>{running ? 'Simulating' : 'Idle'}</span>
      </div>
    </div>
  );
}
