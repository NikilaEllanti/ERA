import { NodeType, SimNode, SimEdge } from './simulation-engine';

export interface ArchitectureTemplate {
  id: string;
  name: string;
  icon: string;
  description: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  nodes: Omit<SimNode, 'metrics' | 'status'>[];
  edges: Omit<SimEdge, 'throughput'>[];
}

const makeNode = (
  id: string,
  type: NodeType,
  label: string,
  x: number,
  y: number,
  config: SimNode['config'] = {}
): Omit<SimNode, 'metrics' | 'status'> => ({
  id,
  type,
  label,
  position: { x, y },
  config: { replicas: 1, latencyMs: 10, maxQPS: 1000, ...config },
});

const makeEdge = (id: string, source: string, target: string, label?: string, protocol: SimEdge['protocol'] = 'http'): Omit<SimEdge, 'throughput'> => ({
  id, source, target, label, protocol
});

export const TEMPLATES: ArchitectureTemplate[] = [
  {
    id: 'url-shortener',
    name: 'URL Shortener',
    icon: '🔗',
    description: 'Classic TinyURL-style service. High read QPS, simple write path.',
    tags: ['beginner', 'stateless', 'caching'],
    difficulty: 'beginner',
    nodes: [
      makeNode('client', 'client', 'Client', 400, 50),
      makeNode('cdn', 'cdn', 'CDN / Edge', 400, 160, { cacheHitRatio: 0.85 }),
      makeNode('api', 'api_gateway', 'API Gateway', 400, 280, { maxQPS: 50000 }),
      makeNode('lb', 'load_balancer', 'Load Balancer', 400, 390, { replicas: 2 }),
      makeNode('svc1', 'service', 'URL Service 1', 200, 510, { replicas: 1 }),
      makeNode('svc2', 'service', 'URL Service 2', 400, 510, { replicas: 1 }),
      makeNode('svc3', 'service', 'URL Service 3', 600, 510, { replicas: 1 }),
      makeNode('redis', 'redis', 'Redis Cache', 200, 640, { cacheHitRatio: 0.95 }),
      makeNode('db', 'postgresql', 'PostgreSQL', 600, 640, { replicas: 1 }),
    ],
    edges: [
      makeEdge('e1','client','cdn'),
      makeEdge('e2','cdn','api'),
      makeEdge('e3','api','lb'),
      makeEdge('e4','lb','svc1'),
      makeEdge('e5','lb','svc2'),
      makeEdge('e6','lb','svc3'),
      makeEdge('e7','svc1','redis','cache lookup'),
      makeEdge('e8','svc2','redis','cache lookup'),
      makeEdge('e9','svc3','redis','cache lookup'),
      makeEdge('e10','svc1','db','read/write','tcp'),
      makeEdge('e11','svc2','db','read/write','tcp'),
    ],
  },
  {
    id: 'notification-service',
    name: 'Notification Service',
    icon: '🔔',
    description: 'Multi-channel notification system with Kafka, workers, and delivery tracking.',
    tags: ['messaging', 'kafka', 'workers', 'async'],
    difficulty: 'intermediate',
    nodes: [
      makeNode('api', 'api_gateway', 'API Gateway', 400, 50, { maxQPS: 10000 }),
      makeNode('auth', 'auth', 'Auth Service', 150, 160),
      makeNode('rate', 'rate_limiter', 'Rate Limiter', 400, 160),
      makeNode('notif', 'notification', 'Notification Service', 400, 280),
      makeNode('kafka', 'kafka', 'Kafka Cluster', 400, 400, { partitions: 8, replicationFactor: 3 }),
      makeNode('email-w', 'worker', 'Email Worker', 100, 530, { replicas: 3 }),
      makeNode('sms-w', 'worker', 'SMS Worker', 300, 530, { replicas: 2 }),
      makeNode('push-w', 'worker', 'Push Worker', 500, 530, { replicas: 3 }),
      makeNode('redis', 'redis', 'Redis (dedup)', 700, 400, { cacheHitRatio: 0.99 }),
      makeNode('db', 'postgresql', 'PostgreSQL', 400, 650, { replicas: 2 }),
    ],
    edges: [
      makeEdge('e1','api','auth'),
      makeEdge('e2','api','rate'),
      makeEdge('e3','rate','notif'),
      makeEdge('e4','notif','kafka','publish events','amqp'),
      makeEdge('e5','notif','redis','dedup check','redis'),
      makeEdge('e6','kafka','email-w','email topic','amqp'),
      makeEdge('e7','kafka','sms-w','sms topic','amqp'),
      makeEdge('e8','kafka','push-w','push topic','amqp'),
      makeEdge('e9','email-w','db','delivery status','tcp'),
      makeEdge('e10','sms-w','db','delivery status','tcp'),
      makeEdge('e11','push-w','db','delivery status','tcp'),
    ],
  },
  {
    id: 'twitter-scale',
    name: 'Twitter / X Scale',
    icon: '🐦',
    description: 'Social media platform with fan-out, timelines, search, and media.',
    tags: ['social', 'fan-out', 'cache', 'search', 'advanced'],
    difficulty: 'advanced',
    nodes: [
      makeNode('client', 'client', 'Client Apps', 500, 30),
      makeNode('cdn', 'cdn', 'CDN', 500, 120, { cacheHitRatio: 0.7 }),
      makeNode('api', 'api_gateway', 'API Gateway', 500, 220, { maxQPS: 100000 }),
      makeNode('lb', 'load_balancer', 'Load Balancer', 500, 330, { replicas: 4 }),
      makeNode('tweet-svc', 'service', 'Tweet Service', 200, 440, { replicas: 10 }),
      makeNode('timeline', 'service', 'Timeline Service', 450, 440, { replicas: 15 }),
      makeNode('user-svc', 'service', 'User Service', 700, 440, { replicas: 5 }),
      makeNode('redis-timeline', 'redis', 'Redis (Timeline Cache)', 300, 570, { cacheHitRatio: 0.85, memoryGB: 256 }),
      makeNode('kafka', 'kafka', 'Kafka (Fan-out)', 200, 690, { partitions: 32, replicationFactor: 3 }),
      makeNode('fanout-w', 'worker', 'Fan-out Workers', 450, 690, { replicas: 50 }),
      makeNode('search', 'elasticsearch', 'Elasticsearch', 700, 570, { replicas: 6 }),
      makeNode('cassandra', 'cassandra', 'Cassandra (Tweets)', 100, 820, { replicas: 6 }),
      makeNode('pg', 'postgresql', 'PostgreSQL (Users)', 450, 820, { replicas: 2 }),
    ],
    edges: [
      makeEdge('e1','client','cdn'),
      makeEdge('e2','cdn','api'),
      makeEdge('e3','api','lb'),
      makeEdge('e4','lb','tweet-svc'),
      makeEdge('e5','lb','timeline'),
      makeEdge('e6','lb','user-svc'),
      makeEdge('e7','tweet-svc','kafka','new tweet','amqp'),
      makeEdge('e8','kafka','fanout-w','fan-out','amqp'),
      makeEdge('e9','fanout-w','redis-timeline','write timeline','redis'),
      makeEdge('e10','timeline','redis-timeline','read timeline','redis'),
      makeEdge('e11','tweet-svc','cassandra','store tweet','tcp'),
      makeEdge('e12','tweet-svc','search','index tweet'),
      makeEdge('e13','user-svc','pg','user data','tcp'),
    ],
  },
  {
    id: 'netflix-clone',
    name: 'Netflix Architecture',
    icon: '🎬',
    description: 'Video streaming platform with CDN, microservices, and recommendation engine.',
    tags: ['streaming', 'cdn', 'microservices', 'recommendations'],
    difficulty: 'advanced',
    nodes: [
      makeNode('client', 'client', 'Client Apps', 500, 30),
      makeNode('cdn', 'cdn', 'CDN (Video)', 500, 130, { cacheHitRatio: 0.95 }),
      makeNode('api', 'api_gateway', 'API Gateway', 500, 250, { maxQPS: 50000 }),
      makeNode('lb', 'load_balancer', 'Load Balancer', 500, 370),
      makeNode('catalog', 'service', 'Catalog Service', 150, 480, { replicas: 5 }),
      makeNode('stream', 'service', 'Streaming Service', 400, 480, { replicas: 10 }),
      makeNode('user', 'service', 'User Service', 650, 480, { replicas: 5 }),
      makeNode('rec', 'service', 'Recommendation ML', 900, 480, { replicas: 8 }),
      makeNode('redis', 'redis', 'Redis (Sessions)', 300, 610, { cacheHitRatio: 0.92 }),
      makeNode('kafka', 'kafka', 'Kafka (Events)', 600, 610, { partitions: 16 }),
      makeNode('cassandra', 'cassandra', 'Cassandra (Viewing History)', 150, 740),
      makeNode('elastic', 'elasticsearch', 'Search Service', 450, 740),
      makeNode('postgres', 'postgresql', 'PostgreSQL (Users)', 750, 740),
    ],
    edges: [
      makeEdge('e1','client','cdn'),
      makeEdge('e2','cdn','api'),
      makeEdge('e3','api','lb'),
      makeEdge('e4','lb','catalog'),
      makeEdge('e5','lb','stream'),
      makeEdge('e6','lb','user'),
      makeEdge('e7','lb','rec'),
      makeEdge('e8','catalog','elastic','search','http'),
      makeEdge('e9','stream','cassandra','history','tcp'),
      makeEdge('e10','stream','kafka','play events','amqp'),
      makeEdge('e11','kafka','rec','training data','amqp'),
      makeEdge('e12','user','redis','session','redis'),
      makeEdge('e13','user','postgres','user data','tcp'),
      makeEdge('e14','catalog','redis','cache','redis'),
    ],
  },
  {
    id: 'uber-architecture',
    name: 'Uber Architecture',
    icon: '🚗',
    description: 'Ride-sharing platform with real-time location, matching, and surge pricing.',
    tags: ['real-time', 'geospatial', 'matching', 'payments'],
    difficulty: 'advanced',
    nodes: [
      makeNode('client', 'client', 'Rider/Driver Apps', 500, 30),
      makeNode('api', 'api_gateway', 'API Gateway', 500, 150, { maxQPS: 30000 }),
      makeNode('auth', 'auth', 'Auth/JWT Service', 250, 270),
      makeNode('rate', 'rate_limiter', 'Rate Limiter', 500, 270),
      makeNode('dispatch', 'service', 'Dispatch Service', 750, 270, { replicas: 20 }),
      makeNode('location', 'service', 'Location Service', 200, 400, { replicas: 30 }),
      makeNode('matching', 'service', 'Matching Service', 500, 400, { replicas: 15 }),
      makeNode('pricing', 'service', 'Surge Pricing', 800, 400, { replicas: 5 }),
      makeNode('redis', 'redis', 'Redis (Driver Locations)', 200, 540, { cacheHitRatio: 1 }),
      makeNode('kafka', 'kafka', 'Kafka (Location Updates)', 500, 540, { partitions: 64 }),
      makeNode('payment', 'service', 'Payment Service', 800, 540),
      makeNode('cassandra', 'cassandra', 'Cassandra (Trips)', 350, 680),
      makeNode('postgres', 'postgresql', 'PostgreSQL (Users)', 700, 680),
    ],
    edges: [
      makeEdge('e1','client','api'),
      makeEdge('e2','api','auth'),
      makeEdge('e3','api','rate'),
      makeEdge('e4','rate','dispatch'),
      makeEdge('e5','rate','location'),
      makeEdge('e6','dispatch','matching'),
      makeEdge('e7','dispatch','pricing'),
      makeEdge('e8','location','redis','write location','redis'),
      makeEdge('e9','location','kafka','location events','amqp'),
      makeEdge('e10','matching','redis','read locations','redis'),
      makeEdge('e11','kafka','dispatch','location updates','amqp'),
      makeEdge('e12','dispatch','cassandra','trips','tcp'),
      makeEdge('e13','payment','postgres','payments','tcp'),
    ],
  },
  {
    id: 'blank',
    name: 'Blank Canvas',
    icon: '🎨',
    description: 'Start from scratch. Use AI to generate or drag components manually.',
    tags: ['custom'],
    difficulty: 'beginner',
    nodes: [],
    edges: [],
  },
];

export function getTemplate(id: string): ArchitectureTemplate | undefined {
  return TEMPLATES.find(t => t.id === id);
}

// AI-generated architecture prompts
export const AI_PROMPT_EXAMPLES = [
  'Design a URL shortener that handles 100M requests/day',
  'Build a real-time messaging system like WhatsApp',
  'Design a video streaming platform like Netflix',
  'Create a ride-sharing backend like Uber',
  'Design a social media feed system like Twitter',
  'Build a distributed search engine',
  'Design an e-commerce platform with payment processing',
  'Create a notification service for 10M users',
];

// Node type definitions for the component library
export interface NodeDefinition {
  type: NodeType;
  label: string;
  icon: string;
  color: string;
  borderColor: string;
  category: 'ingress' | 'compute' | 'cache' | 'messaging' | 'database' | 'infrastructure';
  description: string;
  defaultConfig: SimNode['config'];
}

export const NODE_DEFINITIONS: NodeDefinition[] = [
  // Ingress
  { type: 'client', label: 'Client', icon: '💻', color: '#1e3a5f', borderColor: '#4f8ef7', category: 'ingress', description: 'End user clients or external systems', defaultConfig: {} },
  { type: 'cdn', label: 'CDN', icon: '🌍', color: '#1a2547', borderColor: '#6366f1', category: 'ingress', description: 'Content delivery network, edge caching', defaultConfig: { cacheHitRatio: 0.85 } },
  { type: 'api_gateway', label: 'API Gateway', icon: '⚡', color: '#1e3a5f', borderColor: '#4f8ef7', category: 'ingress', description: 'API gateway, routing, auth, rate limiting', defaultConfig: { maxQPS: 10000 } },
  { type: 'load_balancer', label: 'Load Balancer', icon: '⚖️', color: '#1e2d3d', borderColor: '#0ea5e9', category: 'ingress', description: 'Distributes traffic across service instances', defaultConfig: { replicas: 2 } },
  { type: 'rate_limiter', label: 'Rate Limiter', icon: '🚦', color: '#1e2d20', borderColor: '#22c55e', category: 'ingress', description: 'Token bucket / sliding window rate limiting', defaultConfig: { maxQPS: 5000 } },
  // Compute
  { type: 'service', label: 'Microservice', icon: '⚙️', color: '#1a2547', borderColor: '#7c3aed', category: 'compute', description: 'Generic microservice / application server', defaultConfig: { replicas: 3, latencyMs: 20 } },
  { type: 'auth', label: 'Auth Service', icon: '🔑', color: '#2d1a47', borderColor: '#9d68f5', category: 'compute', description: 'Authentication & authorization service', defaultConfig: { replicas: 2 } },
  { type: 'worker', label: 'Worker', icon: '🔧', color: '#1e2d20', borderColor: '#16a34a', category: 'compute', description: 'Background job processor, queue consumer', defaultConfig: { replicas: 5 } },
  { type: 'notification', label: 'Notification Svc', icon: '🔔', color: '#2d1a2d', borderColor: '#ec4899', category: 'compute', description: 'Sends push, email, SMS notifications', defaultConfig: { replicas: 3 } },
  // Cache
  { type: 'redis', label: 'Redis Cache', icon: '⚡', color: '#1d2918', borderColor: '#dc2626', category: 'cache', description: 'In-memory cache, session store, pub/sub', defaultConfig: { cacheHitRatio: 0.9, memoryGB: 32 } },
  // Messaging
  { type: 'kafka', label: 'Kafka', icon: '📨', color: '#1d1d20', borderColor: '#525252', category: 'messaging', description: 'Distributed event streaming platform', defaultConfig: { partitions: 8, replicationFactor: 3 } },
  { type: 'rabbitmq', label: 'RabbitMQ', icon: '🐰', color: '#2d2010', borderColor: '#d97706', category: 'messaging', description: 'Message broker with AMQP protocol', defaultConfig: {} },
  // Database
  { type: 'postgresql', label: 'PostgreSQL', icon: '🐘', color: '#1a2547', borderColor: '#336791', category: 'database', description: 'Relational DB, ACID, strong consistency', defaultConfig: { replicas: 2 } },
  { type: 'mongodb', label: 'MongoDB', icon: '🍃', color: '#1d2918', borderColor: '#4db33d', category: 'database', description: 'Document DB, flexible schema, horizontal scale', defaultConfig: { replicas: 3 } },
  { type: 'cassandra', label: 'Cassandra', icon: '💎', color: '#1a1a3d', borderColor: '#4b4bff', category: 'database', description: 'Wide-column DB, AP system, linear scale', defaultConfig: { replicas: 3, replicationFactor: 3 } },
  { type: 'elasticsearch', label: 'Elasticsearch', icon: '🔍', color: '#2d1a1a', borderColor: '#f97316', category: 'database', description: 'Full-text search, analytics, log aggregation', defaultConfig: { replicas: 3 } },
  // Infrastructure
  { type: 'kubernetes', label: 'Kubernetes', icon: '☸️', color: '#1a2547', borderColor: '#326ce5', category: 'infrastructure', description: 'Container orchestration cluster', defaultConfig: { replicas: 3 } },
  { type: 'region', label: 'Cloud Region', icon: '🌐', color: '#0f1629', borderColor: '#475569', category: 'infrastructure', description: 'Geographic cloud region boundary', defaultConfig: {} },
];

export const CATEGORY_LABELS: Record<NodeDefinition['category'], string> = {
  ingress: 'Ingress & Routing',
  compute: 'Compute & Services',
  cache: 'Caching',
  messaging: 'Messaging & Queues',
  database: 'Databases',
  infrastructure: 'Infrastructure',
};
