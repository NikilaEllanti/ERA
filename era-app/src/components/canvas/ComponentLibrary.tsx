'use client';
import { NODE_DEFINITIONS } from '@/lib/templates';
import styles from './ComponentLibrary.module.css';

interface ComponentLibraryProps {
  onAddNode: (type: string) => void;
}

export default function ComponentLibrary({ onAddNode }: ComponentLibraryProps) {
  // Group definitions by category
  const categories = {
    compute: NODE_DEFINITIONS.filter(n => ['client', 'api_gateway', 'load_balancer', 'service', 'serverless'].includes(n.type)),
    database: NODE_DEFINITIONS.filter(n => ['postgresql', 'mongodb', 'cassandra', 'redis'].includes(n.type)),
    messaging: NODE_DEFINITIONS.filter(n => ['kafka', 'rabbitmq'].includes(n.type)),
    other: NODE_DEFINITIONS.filter(n => ['cdn', 'dns', 'firewall', 'elasticsearch', 's3', 'notification'].includes(n.type)),
  };

  return (
    <div className={styles.library}>
      <h3 className={styles.title}>Components</h3>
      <p className={styles.subtitle}>Click a component to place it on the canvas</p>

      {Object.entries(categories).map(([catName, nodes]) => (
        <div key={catName} className={styles.section}>
          <h4 className={styles.sectionHeader}>{catName}</h4>
          <div className={styles.grid}>
            {nodes.map(node => (
              <button
                key={node.type}
                className={styles.card}
                onClick={() => onAddNode(node.type)}
                style={{
                  borderLeft: `3px solid ${node.borderColor}`,
                }}
                id={`add-node-${node.type}`}
              >
                <span className={styles.icon}>{node.icon}</span>
                <div className={styles.info}>
                  <span className={styles.label}>{node.label}</span>
                  <span className={styles.desc}>{node.description}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
