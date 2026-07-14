import { TEMPLATES } from './templates';
import { SimNode, SimEdge, NodeType } from './simulation-engine';


export interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  type?: 'analysis' | 'critique' | 'interview' | 'faq' | 'general';
}

export interface ArchitectureAnalysis {
  score: {
    scalability: number;
    availability: number;
    consistency: number;
    costEfficiency: number;
    overall: number;
  };
  bottlenecks: string[];
  recommendations: string[];
  capTradeoffs: string;
  singlePointsOfFailure: string[];
  estimatedCost: string;
}

export interface InterviewQuestion {
  question: string;
  category: 'scalability' | 'availability' | 'consistency' | 'performance' | 'cost' | 'design';
  followUps: string[];
  hints?: string[];
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface DynamicFAQ {
  question: string;
  answer: string;
  category: string;
  triggerCondition: string;
}

// Simulated AI responses for demo (replace with real API calls)
const ARCH_ANALYSIS_TEMPLATES: ArchitectureAnalysis[] = [
  {
    score: { scalability: 82, availability: 91, consistency: 78, costEfficiency: 65, overall: 79 },
    bottlenecks: [
      'Single PostgreSQL primary is a write bottleneck — consider read replicas or CQRS',
      'No rate limiting on API Gateway exposes to DDoS vulnerability',
      'Redis has no persistence configured — session loss on restart'
    ],
    recommendations: [
      'Add a read replica for PostgreSQL to distribute read traffic',
      'Implement circuit breaker pattern between services',
      'Configure Redis AOF persistence for durability',
      'Add health check endpoints with proper timeouts',
      'Consider adding a message queue for async operations'
    ],
    capTradeoffs: 'Current design chooses CP (Consistency + Partition Tolerance). In a network partition, your PostgreSQL primary will refuse writes rather than risk inconsistency. This is correct for financial data but may cause availability issues.',
    singlePointsOfFailure: ['PostgreSQL primary', 'API Gateway (single instance)', 'Redis (no sentinel/cluster)'],
    estimatedCost: '$2,400/month on AWS (est.)'
  },
  {
    score: { scalability: 94, availability: 89, consistency: 71, costEfficiency: 58, overall: 78 },
    bottlenecks: [
      'Kafka consumer lag detected — fan-out workers may not keep up at peak',
      'Cross-region latency adds 80-150ms to global users',
      'Elasticsearch memory pressure at high write throughput'
    ],
    recommendations: [
      'Increase Kafka consumer group partitions to match worker count',
      'Use Kafka consumer lag monitoring with auto-scaling workers',
      'Consider Cassandra for write-heavy workloads instead of Elasticsearch for primary storage',
      'Add CDN for static assets to reduce origin load'
    ],
    capTradeoffs: 'Cassandra gives you AP (Availability + Partition Tolerance). Timeline reads may show stale data for up to 5 seconds. This is acceptable for social feeds but not for payment systems.',
    singlePointsOfFailure: ['No regional failover for databases', 'Kafka has single replication factor'],
    estimatedCost: '$8,500/month on AWS (est.)'
  }
];

const INTERVIEW_QUESTIONS: InterviewQuestion[] = [
  {
    question: 'How would your system handle a 100x traffic spike during a viral event?',
    category: 'scalability',
    followUps: [
      'What is your autoscaling strategy? How fast does it kick in?',
      'What happens to queued requests during scale-up?',
      'How do you protect your database from being overwhelmed?'
    ],
    hints: ['Consider horizontal scaling, circuit breakers, queue-based load leveling'],
    difficulty: 'medium'
  },
  {
    question: 'Your Redis cache goes down suddenly. Walk me through the failure cascade.',
    category: 'availability',
    followUps: [
      'What is your fallback strategy?',
      'How do you prevent the thundering herd problem?',
      'How long would it take to recover?'
    ],
    hints: ['Think: DB load spike, cache stampede, circuit breaker, probabilistic early expiry'],
    difficulty: 'hard'
  },
  {
    question: 'How do you ensure consistency when a user follows another user in a distributed system?',
    category: 'consistency',
    followUps: [
      'What consistency model are you using? Strong vs eventual?',
      'How do you handle read-your-writes consistency?',
      'What happens if the write succeeds but the cache update fails?'
    ],
    difficulty: 'hard'
  },
  {
    question: 'Estimate the storage requirements for storing 1 billion tweets per year.',
    category: 'design',
    followUps: [
      'How does your estimate change if each tweet can have media?',
      'What is your data retention policy?',
      'How would you shard the storage?'
    ],
    difficulty: 'medium'
  },
  {
    question: 'Design the API contract for your service. What endpoints do you expose?',
    category: 'design',
    followUps: [
      'How do you handle pagination?',
      'What is your versioning strategy?',
      'How do you handle backward compatibility?'
    ],
    difficulty: 'easy'
  },
  {
    question: 'Your Kafka consumer is lagging by 10 minutes. How do you diagnose and fix it?',
    category: 'performance',
    followUps: [
      'What metrics would you look at first?',
      'How do you increase throughput without losing ordering?',
      'How do you handle poison pill messages?'
    ],
    difficulty: 'hard'
  },
  {
    question: 'What is the estimated monthly AWS cost for this architecture and how would you optimize it?',
    category: 'cost',
    followUps: [
      'Which component is the most expensive?',
      'What is your Reserved Instance strategy?',
      'How would you reduce cost by 30% without impacting SLA?'
    ],
    difficulty: 'medium'
  },
];

const DYNAMIC_FAQS: Record<string, DynamicFAQ[]> = {
  redis_added: [
    {
      question: 'What cache eviction policy should I use for Redis?',
      answer: 'For a URL shortener use allkeys-lru (evict least recently used when full). For session data use volatile-lru (only evict keys with TTL). For leaderboards use volatile-ttl.',
      category: 'Caching Strategy',
      triggerCondition: 'redis_added'
    },
    {
      question: 'How do I prevent cache stampede with Redis?',
      answer: 'Use probabilistic early expiry (PER): before a key expires, compute: if (rand() < (1/β) * log(1 - ttl/max_ttl)), refresh early. Alternatively use mutex/lock: only one thread regenerates, others wait.',
      category: 'Caching Strategy',
      triggerCondition: 'redis_added'
    }
  ],
  kafka_added: [
    {
      question: 'How many Kafka partitions should I use?',
      answer: 'Rule of thumb: partitions ≥ (target throughput in MB/s) / (throughput per partition ≈ 10MB/s). For ordering within an entity (user events), partition by user_id. More partitions = more parallelism but more consumer overhead.',
      category: 'Messaging',
      triggerCondition: 'kafka_added'
    },
    {
      question: 'Should I use Kafka or a database for event sourcing?',
      answer: 'Use Kafka when: fanout to multiple consumers, high write throughput, event replay needed, loose coupling required. Use DB when: strong consistency needed, small event volume, transactional guarantees required.',
      category: 'Messaging',
      triggerCondition: 'kafka_added'
    }
  ],
  postgresql_added: [
    {
      question: 'When should I switch from PostgreSQL to Cassandra?',
      answer: 'Switch when: write throughput exceeds ~10k writes/sec, you need linear horizontal scale, you can tolerate eventual consistency, your access patterns are predictable (no ad-hoc queries). Keep Postgres for: ACID, foreign keys, complex joins, financial data.',
      category: 'Database Selection',
      triggerCondition: 'postgresql_added'
    },
    {
      question: 'How do I scale PostgreSQL reads?',
      answer: 'Step 1: Add read replicas with streaming replication. Step 2: Use PgBouncer for connection pooling. Step 3: Add Redis cache for hot data. Step 4: Partition large tables. Step 5: Consider CQRS — separate read/write models.',
      category: 'Database Scaling',
      triggerCondition: 'postgresql_added'
    }
  ],
  load_balancer_added: [
    {
      question: 'L4 vs L7 Load Balancing — which should I use?',
      answer: 'L4 (TCP/UDP): faster, lower overhead, used for non-HTTP services, no content inspection. L7 (HTTP): smarter routing based on URL/headers/cookies, SSL termination, WebSocket support, sticky sessions. Use L7 for web apps, L4 for databases/game servers.',
      category: 'Load Balancing',
      triggerCondition: 'load_balancer_added'
    }
  ],
  api_gateway_added: [
    {
      question: 'What should the API Gateway handle vs individual services?',
      answer: 'Gateway should handle: auth/JWT validation, rate limiting, request routing, SSL termination, CORS, request/response transformation, API versioning. Services should handle: business logic, service-specific caching, domain validation.',
      category: 'API Design',
      triggerCondition: 'api_gateway_added'
    }
  ],
  failure_injected: [
    {
      question: 'How do I implement circuit breaker pattern?',
      answer: 'States: CLOSED (normal) → OPEN (failing, reject requests) → HALF-OPEN (test recovery). Open circuit when: error rate > threshold (e.g., 50%) for N requests. Use: Resilience4j (Java), Polly (.NET), resilience (Go), pybreaker (Python).',
      category: 'Reliability Patterns',
      triggerCondition: 'failure_injected'
    },
    {
      question: 'What is the retry strategy for distributed systems?',
      answer: 'Never retry immediately — use exponential backoff with jitter: delay = min(cap, base * 2^attempt) + rand(0, base). Cap retries at 3-5 attempts. Add per-request timeout. Use idempotency keys for POST/PUT. Never retry on 400/401/403.',
      category: 'Reliability Patterns',
      triggerCondition: 'failure_injected'
    }
  ],
  simulation_running: [
    {
      question: 'What does P99 latency mean and why does it matter?',
      answer: 'P99 = 99th percentile latency. 1 in 100 requests take this long or longer. In a microservice chain of 10 services each with P99=100ms, your end-to-end P99 can exceed 1s. Focus on P99 for SLA design, not mean/P50 — those hide outliers.',
      category: 'Performance',
      triggerCondition: 'simulation_running'
    }
  ]
};

// AI architecture generation from prompt (simulated for demo)
export async function generateArchitectureFromPrompt(
  prompt: string,
  onToken?: (token: string) => void
): Promise<{
  explanation: string;
  nodeTypes: string[];
  nodes?: Omit<SimNode, 'metrics' | 'status'>[];
  edges?: Omit<SimEdge, 'throughput'>[];
}> {
  const templates: Record<string, { explanation: string; nodeTypes: string[]; templateId: string }> = {
    'url': {
      explanation: `## URL Shortener Architecture\n\n**Strategy:** Read-heavy system (100:1 read:write ratio). Aggressive caching at CDN + Redis levels.\n\n**Key Design Decisions:**\n- **CDN** caches 85%+ of redirect traffic at edge\n- **Redis** stores URL→short_code mapping with high hit ratio\n- **PostgreSQL** as source of truth for URL metadata\n- **Load Balancer** distributes across stateless redirect services\n\n**Scaling Approach:** Horizontal scaling of redirect services. Partition URL space by hash prefix for database sharding at 100B+ URLs.`,
      nodeTypes: ['client', 'cdn', 'api_gateway', 'load_balancer', 'service', 'redis', 'postgresql'],
      templateId: 'url-shortener'
    },
    'messag|chat|whatsapp': {
      explanation: `## Real-Time Messaging Architecture\n\n**Strategy:** Low-latency delivery, presence tracking, message ordering guarantees.\n\n**Key Design Decisions:**\n- **WebSocket connections** maintained per user via connection servers\n- **Kafka** for async message fan-out to multiple recipients\n- **Cassandra** optimized for time-series message storage\n- **Redis** for online presence and message queue\n- **Push notifications** for offline users via Notification Service`,
      nodeTypes: ['client', 'api_gateway', 'load_balancer', 'service', 'redis', 'kafka', 'cassandra', 'notification'],
      templateId: 'notification-service'
    },
    'netflix|video|stream': {
      explanation: `## Video Streaming Architecture\n\n**Strategy:** Content delivery at scale, adaptive bitrate, recommendation ML.\n\n**Key Design Decisions:**\n- **CDN** handles 95%+ of video traffic — never hits origin\n- **Cassandra** for viewing history (write-heavy, time-series)\n- **Kafka** streams play events to ML recommendation pipeline\n- **Elasticsearch** powers content search\n- **Redis** for session management and catalog caching`,
      nodeTypes: ['client', 'cdn', 'api_gateway', 'service', 'redis', 'kafka', 'cassandra', 'elasticsearch', 'postgresql'],
      templateId: 'netflix-clone'
    },
  };

  // Find best match
  let matchedKey = '';
  for (const pattern of Object.keys(templates)) {
    if (new RegExp(pattern, 'i').test(prompt)) {
      matchedKey = pattern;
      break;
    }
  }

  let result: {
    explanation: string;
    nodeTypes: string[];
    nodes?: Omit<SimNode, 'metrics' | 'status'>[];
    edges?: Omit<SimEdge, 'throughput'>[];
  };

  if (matchedKey) {
    const tmplInfo = templates[matchedKey];
    const fullTemplate = TEMPLATES.find(t => t.id === tmplInfo.templateId);
    result = {
      explanation: tmplInfo.explanation,
      nodeTypes: tmplInfo.nodeTypes,
      nodes: fullTemplate?.nodes,
      edges: fullTemplate?.edges,
    };
  } else {
    // Default template fallback with complete nodes and edges flow
    const defaultNodes = [
      { id: 'client', type: 'client' as NodeType, label: 'Client', position: { x: 400, y: 50 }, config: { replicas: 1 } },
      { id: 'api_gateway', type: 'api_gateway' as NodeType, label: 'API Gateway', position: { x: 400, y: 170 }, config: { maxQPS: 10000 } },
      { id: 'service', type: 'service' as NodeType, label: 'Core Service', position: { x: 400, y: 290 }, config: { replicas: 2 } },
      { id: 'redis', type: 'redis' as NodeType, label: 'Redis Cache', position: { x: 250, y: 410 }, config: { cacheHitRatio: 0.9 } },
      { id: 'postgresql', type: 'postgresql' as NodeType, label: 'PostgreSQL DB', position: { x: 550, y: 410 }, config: { replicas: 1 } },
    ];
    const defaultEdges = [
      { id: 'e1', source: 'client', target: 'api_gateway', label: 'HTTP Request' },
      { id: 'e2', source: 'api_gateway', target: 'service', label: 'Route RPC' },
      { id: 'e3', source: 'service', target: 'redis', label: 'Read cache' },
      { id: 'e4', source: 'service', target: 'postgresql', label: 'Write fallback' },
    ];

    result = {
      explanation: `## Generated Microservices Architecture\n\nBased on your prompt, I've designed a standard microservices setup featuring:\n- **API Gateway** for centralized traffic entry and routing.\n- **Core Service** scaled out horizontally with replicas.\n- **Redis Cache** to offload database query volumes.\n- **PostgreSQL** for primary relational storage consistency.\n\nThis setup provides a highly available design with caching to optimize response times.`,
      nodeTypes: ['client', 'api_gateway', 'service', 'redis', 'postgresql'],
      nodes: defaultNodes,
      edges: defaultEdges,
    };
  }

  // Simulate streaming response
  if (onToken) {
    const words = result.explanation.split(' ');
    for (const word of words) {
      await new Promise(r => setTimeout(r, 20));
      onToken(word + ' ');
    }
  }

  return result;
}

// Get contextual analysis based on current architecture
export function analyzeArchitecture(nodeTypes: string[]): ArchitectureAnalysis {
  const hasRedis = nodeTypes.includes('redis');
  const hasKafka = nodeTypes.includes('kafka');
  const hasCDN = nodeTypes.includes('cdn');
  const hasDB = nodeTypes.some(t => ['postgresql', 'mongodb', 'cassandra'].includes(t));
  const hasLB = nodeTypes.includes('load_balancer');

  let score = { scalability: 60, availability: 60, consistency: 70, costEfficiency: 70, overall: 65 };
  
  if (hasRedis) score.scalability += 10;
  if (hasKafka) { score.scalability += 12; score.availability += 8; }
  if (hasCDN) { score.scalability += 15; score.availability += 5; }
  if (hasDB) score.consistency += 10;
  if (hasLB) { score.availability += 10; score.scalability += 8; }

  score.overall = Math.round((score.scalability + score.availability + score.consistency + score.costEfficiency) / 4);

  const analysis = ARCH_ANALYSIS_TEMPLATES[nodeTypes.length > 6 ? 1 : 0];
  return { ...analysis, score };
}

// Get interview questions based on architecture
export function getInterviewQuestions(nodeTypes: string[], count = 3): InterviewQuestion[] {
  const relevant = INTERVIEW_QUESTIONS.filter(q => {
    if (q.category === 'scalability') return nodeTypes.includes('load_balancer') || nodeTypes.includes('kafka');
    if (q.category === 'availability') return nodeTypes.includes('redis') || nodeTypes.includes('postgresql');
    if (q.category === 'performance') return nodeTypes.includes('kafka');
    return true;
  });

  // Shuffle and pick count
  const shuffled = [...relevant].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// Get dynamic FAQs based on what changed
export function getDynamicFAQs(trigger: string): DynamicFAQ[] {
  return DYNAMIC_FAQS[trigger] || DYNAMIC_FAQS['simulation_running'] || [];
}

// Score interview answer
export function scoreAnswer(question: string, answer: string): {
  score: number;
  feedback: string;
  improvements: string[];
} {
  const wordCount = answer.split(' ').length;
  const hasNumbers = /\d/.test(answer);
  const hasTradeoffs = /tradeoff|vs\.|versus|however|but|although/i.test(answer);
  const hasExamples = /example|such as|like|e\.g\.|for instance/i.test(answer);

  let score = 40;
  if (wordCount > 50) score += 15;
  if (wordCount > 100) score += 10;
  if (hasNumbers) score += 10;
  if (hasTradeoffs) score += 15;
  if (hasExamples) score += 10;

  score = Math.min(100, score);

  const feedback = score >= 80
    ? "Excellent answer! You demonstrated deep understanding of the tradeoffs."
    : score >= 60
    ? "Good answer. You covered the main points but could go deeper on tradeoffs."
    : "Decent start. Try to quantify your estimates and discuss tradeoffs explicitly.";

  const improvements: string[] = [];
  if (!hasNumbers) improvements.push("Add specific numbers (e.g., QPS, storage GB, latency ms)");
  if (!hasTradeoffs) improvements.push("Explicitly discuss tradeoffs of your design choices");
  if (!hasExamples) improvements.push("Give concrete examples from real systems (Redis, Kafka, etc.)");
  if (wordCount < 50) improvements.push("Elaborate more — good system design answers are thorough");

  return { score, feedback, improvements };
}

// Copilot chat responses
export async function getCopilotResponse(
  userMessage: string,
  context: { nodeTypes: string[]; activeFailures: string[]; metrics?: Record<string, number> },
  onToken?: (token: string) => void
): Promise<string> {
  const responses: Record<string, string> = {
    bottleneck: `**Bottleneck Analysis** 🔍\n\nLooking at your current architecture:\n\n1. **Primary bottleneck**: Your ${context.nodeTypes.includes('postgresql') ? 'PostgreSQL write path' : 'service layer'} is the likely bottleneck at scale\n2. **Cache miss cascade**: Without proper caching, DB load will be proportional to request volume\n3. **Recommendation**: Add Redis with allkeys-lru eviction, target 90%+ hit ratio\n\nWant me to show you what a cache stampede looks like? Try injecting a Redis failure.`,
    
    scale: `**Scaling Strategy** 📈\n\nFor your architecture to handle 10x load:\n\n**Horizontal Scaling** (stateless services):\n- Add replicas behind load balancer\n- Use consistent hashing for session affinity\n\n**Database Scaling**:\n- Read replicas for read-heavy workloads (80/20 rule)\n- Sharding if write throughput > 10k/s\n\n**Caching Layer**:\n- CDN for static content (80%+ offload)\n- Redis for hot data (L1 cache)\n\nYour estimated cost at 10x: **$${Math.round(Math.random() * 20000 + 5000)}/month**`,
    
    cap: `**CAP Theorem Analysis** ⚖️\n\nYour current architecture chooses:\n\n${context.nodeTypes.includes('cassandra') ? 
      '**AP — Availability + Partition Tolerance** (Cassandra)\n\n✅ Always returns data (may be stale)\n✅ Survives network partitions\n❌ Data may be inconsistent for seconds to minutes\n\n**Best for**: Social feeds, recommendations, non-financial data' :
      '**CP — Consistency + Partition Tolerance** (PostgreSQL)\n\n✅ Always returns correct data\n✅ Survives network partitions\n❌ May refuse requests during partition (availability suffers)\n\n**Best for**: Financial data, inventory, user accounts'
    }\n\n**Real-world implication**: If a network partition happens, your system will ${context.nodeTypes.includes('cassandra') ? 'continue serving (possibly stale) data' : 'reject writes to maintain consistency'}.`,
    
    failure: `**Failure Analysis** 💥\n\nActive failures detected: **${context.activeFailures.join(', ') || 'None'}**\n\nFailure impact cascade:\n1. **Immediate**: Latency spikes, error rate increases\n2. **Secondary**: Connection pool exhaustion, queue backup\n3. **Tertiary**: Retry storms amplify the original failure\n\n**Recovery playbook**:\n- Enable circuit breakers immediately\n- Shed non-critical load\n- Scale out healthy components\n- Monitor queue depth — don't let Kafka lag grow unboundedly\n\nCurrent estimated recovery time: **2-8 minutes**`,
  };

  let responseKey = 'bottleneck';
  if (/scale|traffic|load/i.test(userMessage)) responseKey = 'scale';
  if (/cap|consistenc|availabilit|partition/i.test(userMessage)) responseKey = 'cap';
  if (/fail|outage|down|error/i.test(userMessage)) responseKey = 'failure';

  const response = responses[responseKey];

  if (onToken) {
    const chars = response.split('');
    for (const char of chars) {
      await new Promise(r => setTimeout(r, 8));
      onToken(char);
    }
  }

  return response;
}
