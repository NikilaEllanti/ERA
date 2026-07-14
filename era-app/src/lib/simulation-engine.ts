// ERA Simulation Engine — Deterministic Distributed Systems Simulator
// Pure JavaScript/TypeScript — no LLM dependency

export type NodeType =
  | 'api_gateway' | 'load_balancer' | 'cdn' | 'service' | 'redis'
  | 'kafka' | 'rabbitmq' | 'postgresql' | 'cassandra' | 'mongodb'
  | 'elasticsearch' | 'worker' | 'notification' | 'auth' | 'rate_limiter'
  | 'kubernetes' | 'region' | 'client';

export interface SimNode {
  id: string;
  type: NodeType;
  label: string;
  position: { x: number; y: number };
  config: {
    replicas?: number;
    maxQPS?: number;
    latencyMs?: number;
    cacheHitRatio?: number;
    maxConnections?: number;
    partitions?: number;
    replicationFactor?: number;
    cpuCores?: number;
    memoryGB?: number;
  };
  metrics: NodeMetrics;
  status: 'healthy' | 'degraded' | 'down' | 'recovering';
  failureInjected?: string;
}

export interface SimEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  protocol?: 'http' | 'grpc' | 'tcp' | 'amqp' | 'redis';
  throughput?: number; // current packets/s
}

export interface NodeMetrics {
  qps: number;
  latencyP50: number;
  latencyP95: number;
  latencyP99: number;
  errorRate: number;
  cpuPercent: number;
  memoryPercent: number;
  activeConnections: number;
  cacheHitRatio?: number;
  queueDepth?: number;
  replicationLag?: number;
  throughputMbps: number;
  requestsTotal: number;
  errorsTotal: number;
}

export interface SimulationState {
  running: boolean;
  speed: number; // 1x, 2x, 5x, 10x
  tickCount: number;
  timeElapsed: number; // ms
  globalQPS: number;
  globalLatencyP99: number;
  globalErrorRate: number;
  globalAvailability: number;
  estimatedMonthlyCost: number;
  activeFailures: string[];
  dataPackets: DataPacket[];
}

export interface DataPacket {
  id: string;
  sourceId: string;
  targetId: string;
  progress: number; // 0-1
  color: string;
  size: number;
  type: 'request' | 'response' | 'replication' | 'event';
}

export type FailureType =
  | 'traffic_spike' | 'redis_failure' | 'kafka_failure' | 'cache_stampede'
  | 'hot_partition' | 'db_failover' | 'region_outage' | 'packet_loss'
  | 'network_partition' | 'retry_storm' | 'slow_consumer' | 'memory_pressure';

const FAILURE_CONFIGS: Record<FailureType, {
  label: string;
  icon: string;
  description: string;
  color: string;
  affectsTypes: NodeType[];
  latencyMultiplier: number;
  errorRateIncrease: number;
  qpsEffect: number; // multiplier
  duration: number; // ticks
}> = {
  traffic_spike: {
    label: 'Traffic Spike', icon: '📈', color: '#f59e0b',
    description: '10x traffic surge — tests autoscaling, load balancers, and queues',
    affectsTypes: ['api_gateway', 'load_balancer', 'cdn'],
    latencyMultiplier: 3, errorRateIncrease: 0.15, qpsEffect: 10, duration: 30
  },
  redis_failure: {
    label: 'Redis Failure', icon: '🔴', color: '#ef4444',
    description: 'Redis goes down — all cache misses, DB load spikes, latency explodes',
    affectsTypes: ['redis'],
    latencyMultiplier: 8, errorRateIncrease: 0.35, qpsEffect: 0.6, duration: 25
  },
  kafka_failure: {
    label: 'Kafka Broker Failure', icon: '💥', color: '#dc2626',
    description: 'Kafka broker crash — event queue backs up, consumers stall',
    affectsTypes: ['kafka'],
    latencyMultiplier: 1, errorRateIncrease: 0.4, qpsEffect: 0.4, duration: 35
  },
  cache_stampede: {
    label: 'Cache Stampede', icon: '🌊', color: '#7c3aed',
    description: 'Mass cache expiry — thundering herd problem hits the database',
    affectsTypes: ['redis', 'postgresql', 'mongodb'],
    latencyMultiplier: 12, errorRateIncrease: 0.5, qpsEffect: 0.3, duration: 20
  },
  hot_partition: {
    label: 'Hot Partition', icon: '🔥', color: '#f97316',
    description: 'Single Kafka/DB partition handles disproportionate load',
    affectsTypes: ['kafka', 'cassandra'],
    latencyMultiplier: 5, errorRateIncrease: 0.25, qpsEffect: 0.7, duration: 40
  },
  db_failover: {
    label: 'DB Failover', icon: '🔄', color: '#0ea5e9',
    description: 'Primary DB goes down — failover to replica takes 30-60s',
    affectsTypes: ['postgresql', 'mongodb', 'cassandra'],
    latencyMultiplier: 20, errorRateIncrease: 0.8, qpsEffect: 0.1, duration: 15
  },
  region_outage: {
    label: 'Region Outage', icon: '🌍', color: '#6366f1',
    description: 'Entire cloud region unavailable — tests multi-region failover',
    affectsTypes: ['region', 'service', 'api_gateway'],
    latencyMultiplier: 4, errorRateIncrease: 0.6, qpsEffect: 0.5, duration: 50
  },
  packet_loss: {
    label: 'Packet Loss (30%)', icon: '📡', color: '#94a3b8',
    description: '30% packet loss on network — retries, TCP backoff, latency spikes',
    affectsTypes: ['load_balancer', 'service', 'api_gateway'],
    latencyMultiplier: 3, errorRateIncrease: 0.3, qpsEffect: 0.7, duration: 30
  },
  network_partition: {
    label: 'Network Partition', icon: '🚧', color: '#c026d3',
    description: 'Split-brain scenario — tests CAP theorem in your design',
    affectsTypes: ['service', 'postgresql', 'cassandra'],
    latencyMultiplier: 15, errorRateIncrease: 0.7, qpsEffect: 0.2, duration: 20
  },
  retry_storm: {
    label: 'Retry Storm', icon: '🔁', color: '#16a34a',
    description: 'Cascading retries amplify a minor outage into a major one',
    affectsTypes: ['service', 'api_gateway', 'worker'],
    latencyMultiplier: 6, errorRateIncrease: 0.45, qpsEffect: 5, duration: 25
  },
  slow_consumer: {
    label: 'Slow Consumer', icon: '🐢', color: '#854d0e',
    description: 'Kafka consumers fall behind — queue depth grows unboundedly',
    affectsTypes: ['worker', 'kafka'],
    latencyMultiplier: 2, errorRateIncrease: 0.1, qpsEffect: 0.9, duration: 60
  },
  memory_pressure: {
    label: 'Memory Pressure', icon: '💾', color: '#be123c',
    description: 'Services OOM — GC pauses, pod evictions, cold starts',
    affectsTypes: ['service', 'worker', 'api_gateway'],
    latencyMultiplier: 4, errorRateIncrease: 0.2, qpsEffect: 0.8, duration: 30
  },
};

export const FAILURE_TYPES = FAILURE_CONFIGS;

function randomGaussian(mean: number, stddev: number): number {
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return Math.max(0, mean + stddev * z0);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export class SimulationEngine {
  private nodes: Map<string, SimNode> = new Map();
  private edges: SimEdge[] = [];
  private state: SimulationState;
  private tickInterval: ReturnType<typeof setInterval> | null = null;
  private listeners: ((state: SimulationState, nodes: SimNode[], edges: SimEdge[]) => void)[] = [];
  private activeFailures: Map<string, { type: FailureType; ticksRemaining: number }> = new Map();
  private packetIdCounter = 0;

  constructor() {
    this.state = this.initialState();
  }

  private initialState(): SimulationState {
    return {
      running: false,
      speed: 1,
      tickCount: 0,
      timeElapsed: 0,
      globalQPS: 0,
      globalLatencyP99: 0,
      globalErrorRate: 0,
      globalAvailability: 99.99,
      estimatedMonthlyCost: 0,
      activeFailures: [],
      dataPackets: [],
    };
  }

  setNodes(nodes: SimNode[]): void {
    this.nodes.clear();
    nodes.forEach(n => this.nodes.set(n.id, {
      ...n,
      metrics: n.metrics || this.defaultMetrics(n.type),
    }));
    this.emit();
  }

  setEdges(edges: SimEdge[]): void {
    this.edges = edges;
    this.emit();
  }

  addNode(node: SimNode): void {
    this.nodes.set(node.id, {
      ...node,
      metrics: this.defaultMetrics(node.type),
      status: 'healthy',
    });
    this.emit();
  }

  removeNode(id: string): void {
    this.nodes.delete(id);
    this.emit();
  }

  subscribe(cb: (state: SimulationState, nodes: SimNode[], edges: SimEdge[]) => void): () => void {
    this.listeners.push(cb);
    return () => { this.listeners = this.listeners.filter(l => l !== cb); };
  }

  private emit(): void {
    const nodesArr = Array.from(this.nodes.values());
    this.listeners.forEach(l => l(this.state, nodesArr, this.edges));
  }

  start(): void {
    if (this.state.running) return;
    this.state.running = true;
    const intervalMs = Math.max(50, Math.round(100 / this.state.speed));
    this.tickInterval = setInterval(() => this.tick(), intervalMs);
    this.emit();
  }

  pause(): void {
    this.state.running = false;
    if (this.tickInterval) { clearInterval(this.tickInterval); this.tickInterval = null; }
    this.emit();
  }

  stop(): void {
    this.pause();
    this.state = this.initialState();
    this.activeFailures.clear();
    this.nodes.forEach((node, id) => {
      this.nodes.set(id, { ...node, metrics: this.defaultMetrics(node.type), status: 'healthy', failureInjected: undefined });
    });
    this.emit();
  }

  setSpeed(speed: number): void {
    this.state.speed = speed;
    if (this.state.running) {
      this.pause();
      this.start();
    }
  }

  injectFailure(type: FailureType): void {
    const config = FAILURE_CONFIGS[type];
    if (!config) {
      console.warn(`Attempted to inject unknown failure type: ${type}`);
      return;
    }
    this.activeFailures.set(type, { type, ticksRemaining: config.duration * 10 });
    this.state.activeFailures = Array.from(this.activeFailures.keys());
    
    // Mark affected nodes
    this.nodes.forEach((node) => {
      if (config.affectsTypes.includes(node.type)) {
        node.status = 'degraded';
        node.failureInjected = type;
      }
    });
    this.emit();
  }

  clearFailure(type: FailureType): void {
    this.activeFailures.delete(type);
    this.state.activeFailures = Array.from(this.activeFailures.keys());
    this.nodes.forEach((node) => {
      if (node.failureInjected === type) {
        node.failureInjected = undefined;
        node.status = 'healthy';
      }
    });
    this.emit();
  }

  clearAllFailures(): void {
    this.activeFailures.clear();
    this.state.activeFailures = [];
    this.nodes.forEach((node) => {
      node.failureInjected = undefined;
      node.status = 'healthy';
    });
    this.emit();
  }

  private tick(): void {
    this.state.tickCount++;
    this.state.timeElapsed += 100;

    // Age out failures
    this.activeFailures.forEach((f, type) => {
      f.ticksRemaining -= 1;
      if (f.ticksRemaining <= 0) {
        this.clearFailure(type as FailureType);
      }
    });

    // Update each node's metrics
    this.nodes.forEach((node) => {
      this.updateNodeMetrics(node);
    });

    // Update global metrics
    this.updateGlobalMetrics();

    // Animate data packets
    this.updateDataPackets();

    // Spawn new packets
    if (this.state.tickCount % 3 === 0) {
      this.spawnDataPackets();
    }

    this.emit();
  }

  private updateNodeMetrics(node: SimNode): void {
    const base = this.baseMetricsForType(node.type);
    let latencyMultiplier = 1;
    let errorRateAdd = 0;
    let qpsMultiplier = 1;

    // Apply active failure effects
    this.activeFailures.forEach((f) => {
      const config = FAILURE_CONFIGS[f.type];
      if (config.affectsTypes.includes(node.type)) {
        latencyMultiplier *= config.latencyMultiplier;
        errorRateAdd += config.errorRateIncrease;
        qpsMultiplier *= config.qpsEffect;
        node.status = 'degraded';
      }
    });

    // Simulate jitter
    const jitter = () => (Math.random() - 0.5) * 0.15;

    node.metrics.qps = Math.max(0, base.qps * qpsMultiplier * (1 + jitter()));
    node.metrics.latencyP50 = randomGaussian(base.latencyP50 * latencyMultiplier, base.latencyP50 * 0.1);
    node.metrics.latencyP95 = randomGaussian(base.latencyP95 * latencyMultiplier, base.latencyP95 * 0.15);
    node.metrics.latencyP99 = randomGaussian(base.latencyP99 * latencyMultiplier, base.latencyP99 * 0.2);
    node.metrics.errorRate = Math.min(1, Math.max(0, (base.errorRate + errorRateAdd) * (1 + jitter())));
    node.metrics.cpuPercent = Math.min(100, base.cpuPercent * latencyMultiplier * 0.3 * (1 + jitter()));
    node.metrics.memoryPercent = Math.min(100, lerp(node.metrics.memoryPercent, base.memoryPercent * (1 + errorRateAdd * 0.5), 0.1));
    node.metrics.activeConnections = Math.round(base.activeConnections * qpsMultiplier * (1 + jitter()));
    node.metrics.throughputMbps = Math.max(0, base.throughputMbps * qpsMultiplier * (1 + jitter()));
    node.metrics.requestsTotal = (node.metrics.requestsTotal || 0) + Math.round(node.metrics.qps / 10);
    node.metrics.errorsTotal = (node.metrics.errorsTotal || 0) + Math.round(node.metrics.qps * node.metrics.errorRate / 10);

    if (node.type === 'redis') {
      const hasRedisFailure = this.activeFailures.has('redis_failure') || this.activeFailures.has('cache_stampede');
      node.metrics.cacheHitRatio = hasRedisFailure ? Math.random() * 0.1 : 0.85 + Math.random() * 0.1;
    }

    if (node.type === 'kafka' || node.type === 'rabbitmq') {
      const hasKafkaIssue = this.activeFailures.has('kafka_failure') || this.activeFailures.has('slow_consumer') || this.activeFailures.has('hot_partition');
      node.metrics.queueDepth = hasKafkaIssue
        ? Math.min(100000, (node.metrics.queueDepth || 0) + Math.random() * 5000)
        : Math.max(0, (node.metrics.queueDepth || 0) - Math.random() * 200 + 50);
    }

    if (node.type === 'postgresql' || node.type === 'mongodb' || node.type === 'cassandra') {
      node.metrics.replicationLag = this.activeFailures.has('db_failover')
        ? 30000 + Math.random() * 30000
        : Math.random() * 50;
    }

    // Update status based on metrics
    if (node.metrics.errorRate > 0.5 || node.metrics.cpuPercent > 95) {
      node.status = 'down';
    } else if (node.metrics.errorRate > 0.15 || node.metrics.cpuPercent > 80) {
      node.status = 'degraded';
    } else if (this.activeFailures.size === 0) {
      node.status = 'healthy';
    }
  }

  private updateGlobalMetrics(): void {
    const nodes = Array.from(this.nodes.values());
    if (nodes.length === 0) return;

    this.state.globalQPS = nodes.reduce((sum, n) => sum + (n.type === 'api_gateway' || n.type === 'cdn' ? n.metrics.qps : 0), 0) || nodes[0]?.metrics.qps || 0;
    this.state.globalLatencyP99 = Math.max(...nodes.map(n => n.metrics.latencyP99));
    this.state.globalErrorRate = nodes.reduce((sum, n) => sum + n.metrics.errorRate, 0) / nodes.length;
    this.state.globalAvailability = (1 - this.state.globalErrorRate) * 100;
    this.state.estimatedMonthlyCost = this.estimateCost(nodes);
  }

  private estimateCost(nodes: SimNode[]): number {
    const COST_PER_TYPE: Partial<Record<NodeType, number>> = {
      service: 150, api_gateway: 80, load_balancer: 120, redis: 200,
      kafka: 350, postgresql: 400, mongodb: 300, cassandra: 500,
      elasticsearch: 250, worker: 100, cdn: 50, kubernetes: 600, region: 800,
    };
    return nodes.reduce((sum, n) => sum + (COST_PER_TYPE[n.type] || 100) * (n.config.replicas || 1), 0);
  }

  private updateDataPackets(): void {
    this.state.dataPackets = this.state.dataPackets
      .map(p => ({ ...p, progress: p.progress + 0.05 * this.state.speed }))
      .filter(p => p.progress < 1);
  }

  private spawnDataPackets(): void {
    if (!this.state.running || this.edges.length === 0) return;

    const maxPackets = 30;
    if (this.state.dataPackets.length >= maxPackets) return;

    // Spawn 1-3 packets on random edges
    const count = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < count; i++) {
      const edge = this.edges[Math.floor(Math.random() * this.edges.length)];
      const colors = ['#4f8ef7', '#00d4ff', '#10b981', '#f59e0b', '#7c3aed'];
      const hasFailure = this.activeFailures.size > 0;
      this.state.dataPackets.push({
        id: `pkt-${this.packetIdCounter++}`,
        sourceId: edge.source,
        targetId: edge.target,
        progress: 0,
        color: hasFailure ? '#ef4444' : colors[Math.floor(Math.random() * colors.length)],
        size: hasFailure ? 5 : 3,
        type: 'request',
      });
    }
  }

  private defaultMetrics(type: NodeType): NodeMetrics {
    const base = this.baseMetricsForType(type);
    return {
      ...base,
      latencyP50: base.latencyP50,
      latencyP95: base.latencyP95,
      latencyP99: base.latencyP99,
      requestsTotal: 0,
      errorsTotal: 0,
    };
  }

  private baseMetricsForType(type: NodeType): NodeMetrics {
    const BASES: Record<NodeType, Partial<NodeMetrics>> = {
      api_gateway: { qps: 5000, latencyP50: 8, latencyP95: 25, latencyP99: 50, errorRate: 0.001, cpuPercent: 35, memoryPercent: 45, activeConnections: 2000, throughputMbps: 500 },
      load_balancer: { qps: 10000, latencyP50: 1, latencyP95: 3, latencyP99: 5, errorRate: 0.0005, cpuPercent: 25, memoryPercent: 30, activeConnections: 5000, throughputMbps: 1000 },
      cdn: { qps: 50000, latencyP50: 5, latencyP95: 15, latencyP99: 30, errorRate: 0.0001, cpuPercent: 15, memoryPercent: 20, activeConnections: 10000, cacheHitRatio: 0.92, throughputMbps: 5000 },
      service: { qps: 1000, latencyP50: 20, latencyP95: 60, latencyP99: 120, errorRate: 0.005, cpuPercent: 55, memoryPercent: 60, activeConnections: 200, throughputMbps: 50 },
      redis: { qps: 80000, latencyP50: 0.5, latencyP95: 2, latencyP99: 5, errorRate: 0.0001, cpuPercent: 20, memoryPercent: 70, activeConnections: 500, cacheHitRatio: 0.9, throughputMbps: 200 },
      kafka: { qps: 100000, latencyP50: 5, latencyP95: 20, latencyP99: 50, errorRate: 0.001, cpuPercent: 40, memoryPercent: 55, activeConnections: 1000, queueDepth: 1000, throughputMbps: 800 },
      rabbitmq: { qps: 20000, latencyP50: 10, latencyP95: 30, latencyP99: 80, errorRate: 0.002, cpuPercent: 35, memoryPercent: 45, activeConnections: 300, queueDepth: 500, throughputMbps: 200 },
      postgresql: { qps: 5000, latencyP50: 10, latencyP95: 40, latencyP99: 100, errorRate: 0.002, cpuPercent: 60, memoryPercent: 75, activeConnections: 100, replicationLag: 5, throughputMbps: 100 },
      cassandra: { qps: 20000, latencyP50: 5, latencyP95: 15, latencyP99: 30, errorRate: 0.003, cpuPercent: 50, memoryPercent: 65, activeConnections: 500, replicationLag: 2, throughputMbps: 400 },
      mongodb: { qps: 10000, latencyP50: 8, latencyP95: 25, latencyP99: 60, errorRate: 0.002, cpuPercent: 55, memoryPercent: 70, activeConnections: 200, throughputMbps: 200 },
      elasticsearch: { qps: 3000, latencyP50: 30, latencyP95: 100, latencyP99: 250, errorRate: 0.003, cpuPercent: 65, memoryPercent: 80, activeConnections: 100, throughputMbps: 150 },
      worker: { qps: 500, latencyP50: 100, latencyP95: 500, latencyP99: 2000, errorRate: 0.01, cpuPercent: 70, memoryPercent: 55, activeConnections: 50, queueDepth: 100, throughputMbps: 20 },
      notification: { qps: 2000, latencyP50: 50, latencyP95: 200, latencyP99: 500, errorRate: 0.005, cpuPercent: 40, memoryPercent: 45, activeConnections: 100, throughputMbps: 30 },
      auth: { qps: 2000, latencyP50: 30, latencyP95: 100, latencyP99: 200, errorRate: 0.001, cpuPercent: 45, memoryPercent: 50, activeConnections: 300, throughputMbps: 40 },
      rate_limiter: { qps: 20000, latencyP50: 2, latencyP95: 5, latencyP99: 10, errorRate: 0.0005, cpuPercent: 30, memoryPercent: 35, activeConnections: 1000, throughputMbps: 100 },
      kubernetes: { qps: 0, latencyP50: 0, latencyP95: 0, latencyP99: 0, errorRate: 0, cpuPercent: 20, memoryPercent: 40, activeConnections: 0, throughputMbps: 0 },
      region: { qps: 0, latencyP50: 0, latencyP95: 0, latencyP99: 0, errorRate: 0, cpuPercent: 0, memoryPercent: 0, activeConnections: 0, throughputMbps: 0 },
      client: { qps: 0, latencyP50: 0, latencyP95: 0, latencyP99: 0, errorRate: 0, cpuPercent: 5, memoryPercent: 10, activeConnections: 1, throughputMbps: 1 },
    };

    const base = BASES[type] || {};
    return {
      qps: 0, latencyP50: 0, latencyP95: 0, latencyP99: 0, errorRate: 0,
      cpuPercent: 0, memoryPercent: 0, activeConnections: 0, throughputMbps: 0,
      requestsTotal: 0, errorsTotal: 0,
      ...base,
    };
  }

  getState(): SimulationState { return this.state; }
  getNodes(): SimNode[] { return Array.from(this.nodes.values()); }
  getEdges(): SimEdge[] { return this.edges; }
  getNode(id: string): SimNode | undefined { return this.nodes.get(id); }

  step(): void {
    this.tick();
  }
}

// Singleton instance
let engineInstance: SimulationEngine | null = null;

export function getSimulationEngine(): SimulationEngine {
  if (!engineInstance) {
    engineInstance = new SimulationEngine();
  }
  return engineInstance;
}

export function resetEngine(): void {
  engineInstance = null;
}
