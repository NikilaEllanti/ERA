import { NodeType, SimNode, SimEdge } from './simulation-engine';

export interface TemplateEntry {
  id: string;
  name: string;
  icon: string;
  description: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: 'web' | 'ecommerce' | 'social' | 'media' | 'data' | 'realtime' | 'ai-ml' | 'fintech' | 'infrastructure' | 'iot' | 'healthcare' | 'gaming' | 'security' | 'blockchain';
  nodes: Omit<SimNode, 'metrics' | 'status'>[];
  edges: Omit<SimEdge, 'throughput'>[];
}

export const TEMPLATE_CATEGORIES = [
  { id: 'all', label: 'All Templates', icon: '📦' },
  { id: 'web', label: 'Web & API', icon: '🌐' },
  { id: 'ecommerce', label: 'E-Commerce', icon: '🛒' },
  { id: 'social', label: 'Social & Comms', icon: '💬' },
  { id: 'media', label: 'Media & Streaming', icon: '🎬' },
  { id: 'data', label: 'Data & Analytics', icon: '📊' },
  { id: 'realtime', label: 'Real-time Systems', icon: '⚡' },
  { id: 'ai-ml', label: 'AI & Machine Learning', icon: '🧠' },
  { id: 'fintech', label: 'FinTech & Ledger', icon: '💰' },
  { id: 'infrastructure', label: 'Infrastructure & DevOps', icon: '🔧' },
  { id: 'iot', label: 'IoT & Edge', icon: '📡' },
  { id: 'healthcare', label: 'Healthcare Systems', icon: '🏥' },
  { id: 'gaming', label: 'Gaming Architecture', icon: '🎮' },
  { id: 'security', label: 'Security & SIEM', icon: '🔒' },
  { id: 'blockchain', label: 'Blockchain & DeFi', icon: '⛓️' },
];

const n = (id: string, type: NodeType, label: string, x: number, y: number, config: any = {}): Omit<SimNode, 'metrics' | 'status'> => ({
  id,
  type,
  label,
  position: { x, y },
  config: { replicas: 1, latencyMs: 10, maxQPS: 1000, ...config }
});

const e = (id: string, source: string, target: string, label?: string, protocol: SimEdge['protocol'] = 'http'): Omit<SimEdge, 'throughput'> => ({
  id, source, target, label, protocol
});

// Programmatic Template Definitions to generate 150+ rich templates
const METADATA_DEFS: {
  id: string;
  name: string;
  icon: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: TemplateEntry['category'];
  tags: string[];
  recipe: 'cached-web' | 'event-driven' | 'analytics' | 'multi-region' | 'mesh' | 'iot-ingest' | 'blockchain-node' | 'realtime' | 'basic-api';
}[] = [
  // === Web & API (20) ===
  { id: 'url-shortener', name: 'URL Shortener', icon: '🔗', description: 'High read QPS shortlink service with aggressive caching.', difficulty: 'beginner', category: 'web', tags: ['caching', 'reads', 'sql'], recipe: 'cached-web' },
  { id: 'blog-platform', name: 'Dev.to Blog Clone', icon: '📝', description: 'Blogging platform with rich content distribution and caching.', difficulty: 'beginner', category: 'web', tags: ['cms', 'cdn', 'redis'], recipe: 'cached-web' },
  { id: 'graphql-federation', name: 'GraphQL Federation Gateway', icon: '🕸️', description: 'Consolidates multiple microservice APIs behind a unified schema gateway.', difficulty: 'intermediate', category: 'web', tags: ['api', 'gateway', 'graphql'], recipe: 'mesh' },
  { id: 'oauth-provider', name: 'OAuth2 Identity Server', icon: '🔑', description: 'Centralized token issue and validation server.', difficulty: 'intermediate', category: 'web', tags: ['auth', 'jwt', 'security'], recipe: 'cached-web' },
  { id: 'webhook-relay', name: 'Reliable Webhook Relay', icon: '📯', description: 'Ingests webhooks and retries delivery with exponential backoff.', difficulty: 'intermediate', category: 'web', tags: ['async', 'queue', 'reliability'], recipe: 'event-driven' },
  { id: 'api-marketplace', name: 'Developer API Marketplace', icon: '🛍️', description: 'Monetized API gateway with real-time rate limiting and quota verification.', difficulty: 'advanced', category: 'web', tags: ['gateway', 'billing', 'redis'], recipe: 'cached-web' },
  { id: 'saas-multi-tenant', name: 'Multi-tenant SaaS Workspace', icon: '🏢', description: 'SaaS control plane handling database isolation per tenant.', difficulty: 'advanced', category: 'web', tags: ['saas', 'multi-tenant', 'postgres'], recipe: 'mesh' },
  { id: 'browser-push', name: 'Browser Push Notification Engine', icon: '💬', description: 'WebPush notification broker using persistent service connections.', difficulty: 'intermediate', category: 'web', tags: ['push', 'websockets', 'redis'], recipe: 'event-driven' },
  { id: 'sitemap-generator', name: 'Automated Sitemap Crawler', icon: '🗺️', description: 'Scans pages asynchronously and stores index metadata in a DB.', difficulty: 'beginner', category: 'web', tags: ['crawler', 'workers', 'queues'], recipe: 'event-driven' },
  { id: 'cdn-landing-page', name: 'Static Site Landing Engine', icon: '📄', description: 'Globally optimized CDN architecture serving static landing pages.', difficulty: 'beginner', category: 'web', tags: ['cdn', 's3', 'cache'], recipe: 'basic-api' },
  { id: 'form-builder-backend', name: 'Dynamic Form Builder', icon: '📋', description: 'Saves flexible form layouts and user responses in MongoDB.', difficulty: 'beginner', category: 'web', tags: ['mongodb', 'nosql', 'dynamic'], recipe: 'cached-web' },
  { id: 'link-aggregator', name: 'Hacker News Clone', icon: '📰', description: 'Social bookmarking tool with ranking algorithms.', difficulty: 'intermediate', category: 'web', tags: ['caching', 'sql', 'ranking'], recipe: 'cached-web' },
  { id: 'url-redirector', name: 'Fast URL Redirector', icon: '🔄', description: 'Ultra-low latency geolocated short URL redirect tool.', difficulty: 'beginner', category: 'web', tags: ['cdn', 'redis', 'redirect'], recipe: 'basic-api' },
  { id: 'sso-platform', name: 'Enterprise Single Sign-On (SSO)', icon: '🛡️', description: 'Federated SAML/OIDC identity validation network.', difficulty: 'advanced', category: 'web', tags: ['auth', 'security', 'enterprise'], recipe: 'mesh' },
  { id: 'site-uptime-monitor', name: 'Uptime Monitoring Agent', icon: '📈', description: 'Pings endpoints periodically, checking availability and SSL certificates.', difficulty: 'intermediate', category: 'web', tags: ['cron', 'worker', 'postgres'], recipe: 'event-driven' },
  { id: 'image-hosting', name: 'Imgur-style Image Hosting', icon: '🖼️', description: 'Uploads images, resizes them via workers, and serves via CDN.', difficulty: 'intermediate', category: 'web', tags: ['cdn', 's3', 'workers'], recipe: 'event-driven' },
  { id: 'wiki-platform', name: 'Collaborative Wiki System', icon: '📚', description: 'Versioned document management system with fast index searches.', difficulty: 'intermediate', category: 'web', tags: ['search', 'postgres', 'caching'], recipe: 'cached-web' },
  { id: 'file-sharing-portal', name: 'WeTransfer Clone', icon: '📁', description: 'Temporary large file storage links with expiration policies.', difficulty: 'intermediate', category: 'web', tags: ['s3', 'expired-links', 'db'], recipe: 'event-driven' },
  { id: 'pdf-converter', name: 'Online PDF Document Converter', icon: '🖨️', description: 'Queue-based asynchronous PDF generation service.', difficulty: 'beginner', category: 'web', tags: ['queue', 'workers', 'pdf'], recipe: 'event-driven' },
  { id: 'survey-analyzer', name: 'Real-time Survey & Quiz Engine', icon: '🗳️', description: 'Ingests votes and aggregates survey results in real time.', difficulty: 'intermediate', category: 'web', tags: ['redis', 'analytics', 'websockets'], recipe: 'analytics' },

  // === E-Commerce (15) ===
  { id: 'ecommerce-store', name: 'Simple E-Store Backend', icon: '🛒', description: 'Relational database architecture for shopping carts and inventory.', difficulty: 'beginner', category: 'ecommerce', tags: ['sql', 'transactions', 'cart'], recipe: 'cached-web' },
  { id: 'ecommerce-marketplace', name: 'Amazon-style Marketplace', icon: '🏬', description: 'Multi-vendor e-commerce platform with search indices and order queues.', difficulty: 'advanced', category: 'ecommerce', tags: ['search', 'microservices', 'orders'], recipe: 'event-driven' },
  { id: 'inventory-system', name: 'Real-time Inventory Monitor', icon: '📦', description: 'Prevents double-booking stock during high-traffic checkout.', difficulty: 'intermediate', category: 'ecommerce', tags: ['locking', 'redis', 'inventory'], recipe: 'cached-web' },
  { id: 'payment-gateway', name: 'Payment Processor Service', icon: '💳', description: 'Secure credit card authorization with fallback logic.', difficulty: 'intermediate', category: 'ecommerce', tags: ['security', 'pci', 'transactions'], recipe: 'basic-api' },
  { id: 'shopping-cart-cache', name: 'Distributed Shopping Cart', icon: '🛍️', description: 'Maintains cart state in Redis cluster with session stickiness.', difficulty: 'beginner', category: 'ecommerce', tags: ['redis', 'session', 'scaling'], recipe: 'cached-web' },
  { id: 'product-search-catalog', name: 'Searchable Product Catalog', icon: '🔍', description: 'Faceted search filters with Elasticsearch synchronization.', difficulty: 'intermediate', category: 'ecommerce', tags: ['elasticsearch', 'search', 'sync'], recipe: 'analytics' },
  { id: 'order-processing-pipeline', name: 'Order Processing Pipeline', icon: '⚙️', description: 'Asynchronous event driven validation, invoice, and logistics.', difficulty: 'advanced', category: 'ecommerce', tags: ['kafka', 'workers', 'saga'], recipe: 'event-driven' },
  { id: 'shipping-tracker', name: 'Real-time Courier Tracking', icon: '🚚', description: 'Ingests geolocations from courier apps and displays live path.', difficulty: 'intermediate', category: 'ecommerce', tags: ['geospatial', 'redis', 'websockets'], recipe: 'iot-ingest' },
  { id: 'price-comparison-engine', name: 'Price Scraper & Comparison', icon: '📊', description: 'Aggregates product prices across major portals.', difficulty: 'intermediate', category: 'ecommerce', tags: ['scraping', 'cron', 'mongodb'], recipe: 'analytics' },
  { id: 'subscription-box-service', name: 'Subscription Box Billing', icon: '🎁', description: 'Recurring billing engine linked with payment gateways.', difficulty: 'intermediate', category: 'ecommerce', tags: ['billing', 'cron', 'postgres'], recipe: 'cached-web' },
  { id: 'flash-sale-system', name: 'Flash Sale Flashpoint', icon: '⚡', description: 'Handles high concurrency checkout utilizing Redis pre-validation.', difficulty: 'advanced', category: 'ecommerce', tags: ['concurrency', 'redis-lua', 'flashsale'], recipe: 'cached-web' },
  { id: 'coupon-promo-engine', name: 'Coupon & Promotion Engine', icon: '🎫', description: 'Calculates dynamic basket discounts and validate coupon rules.', difficulty: 'beginner', category: 'ecommerce', tags: ['rules', 'logic', 'postgres'], recipe: 'cached-web' },
  { id: 'product-reviews', name: 'Faceted Review System', icon: '⭐', description: 'Stores user ratings, review content, and helpful votes.', difficulty: 'beginner', category: 'ecommerce', tags: ['reviews', 'sql', 'aggregates'], recipe: 'cached-web' },
  { id: 'wishlist-sharing', name: 'Social Wishlist Platform', icon: '💖', description: 'Saves items and enables external shareable links.', difficulty: 'beginner', category: 'ecommerce', tags: ['social', 'sharing', 'db'], recipe: 'basic-api' },
  { id: 'returns-management', name: 'Reverse Logistics & Returns', icon: '↩️', description: 'Workflow validation for customer product returns.', difficulty: 'intermediate', category: 'ecommerce', tags: ['workflow', 'approval', 'postgres'], recipe: 'mesh' },

  // === Social & Communication (15) ===
  { id: 'twitter-clone', name: 'Twitter/X Scale Feed', icon: '🐦', description: 'Fan-out write path for push/pull user feeds.', difficulty: 'advanced', category: 'social', tags: ['fanout', 'redis-cache', 'scale'], recipe: 'event-driven' },
  { id: 'instagram-stories', name: 'Ephemeral Stories System', icon: '📸', description: 'Serves short-lived video/photo media stories globally.', difficulty: 'intermediate', category: 'social', tags: ['cdn', 's3', 'cache'], recipe: 'cached-web' },
  { id: 'reddit-forum', name: 'Reddit-style Discussion Forum', icon: '🤖', description: 'Subreddit indexing, post votes, and threaded comments.', difficulty: 'intermediate', category: 'social', tags: ['hierarchy', 'votes', 'postgres'], recipe: 'cached-web' },
  { id: 'discord-clone', name: 'Discord Channels Engine', icon: '👾', description: 'WebSocket servers managing live chat guild channels.', difficulty: 'advanced', category: 'social', tags: ['realtime', 'websockets', 'redis-pubsub'], recipe: 'realtime' },
  { id: 'whatsapp-chat', name: 'WhatsApp-style Direct Messaging', icon: '💬', description: 'End-to-end messaging showing delivered and read receipts.', difficulty: 'intermediate', category: 'social', tags: ['realtime', 'offline-queues', 'dynamodb'], recipe: 'realtime' },
  { id: 'slack-workspaces', name: 'Slack Workspaces', icon: '💬', description: 'Enterprise workspace communication hub with search integration.', difficulty: 'advanced', category: 'social', tags: ['realtime', 'elasticsearch', 'websockets'], recipe: 'realtime' },
  { id: 'linkedin-feed', name: 'Professional Social Network Feed', icon: '💼', description: 'Activity feed scoring system sorting by professional relevance.', difficulty: 'advanced', category: 'social', tags: ['feed', 'neo4j', 'scoring'], recipe: 'mesh' },
  { id: 'tiktok-feed', name: 'TikTok-style Video Swiper', icon: '🎵', description: 'Serves short videos dynamically based on user swiping signals.', difficulty: 'advanced', category: 'social', tags: ['streaming', 'ml-recommendation', 'cdn'], recipe: 'multi-region' },
  { id: 'clubhouse-audio', name: 'Live Drop-in Audio Rooms', icon: '🎙️', description: 'Broker system distributing audio signals via WebRTC.', difficulty: 'advanced', category: 'social', tags: ['webrtc', 'liveaudio', 'scaling'], recipe: 'realtime' },
  { id: 'dating-app-matching', name: 'Geo-proximity Swipe & Match', icon: '🔥', description: 'Calculates nearby partners utilizing geo-sharding database indices.', difficulty: 'intermediate', category: 'social', tags: ['geospatial', 'redis', 'matching'], recipe: 'cached-web' },
  { id: 'social-graph-service', name: 'User Follows Graph Service', icon: '🕸️', description: 'Stores user connections and degree-of-separation lookup.', difficulty: 'advanced', category: 'social', tags: ['graph-database', 'neo4j', 'scalability'], recipe: 'mesh' },
  { id: 'comment-box-widget', name: 'Embeddable Comment Box', icon: '💬', description: 'Universal comment widgets optimized for speed and nested replies.', difficulty: 'beginner', category: 'social', tags: ['nested', 'sql', 'caching'], recipe: 'cached-web' },
  { id: 'reaction-engine', name: 'Real-time Emoji Reaction Engine', icon: '❤️', description: 'Aggregates millions of thumbs up and heart clicks per second.', difficulty: 'intermediate', category: 'social', tags: ['counters', 'redis', 'websockets'], recipe: 'analytics' },
  { id: 'group-chat-manager', name: 'Large-scale Group Messaging', icon: '👥', description: 'Broadcasts single messages to groups with up to 10k users.', difficulty: 'intermediate', category: 'social', tags: ['broadcast', 'websockets', 'redis'], recipe: 'realtime' },
  { id: 'activity-history', name: 'User Profile Activity History', icon: '📜', description: 'Tracks and displays login, comments, and posts chronologically.', difficulty: 'beginner', category: 'social', tags: ['timeline', 'postgres', 'history'], recipe: 'cached-web' },

  // === Media & Streaming (10) ===
  { id: 'netflix-clone', name: 'Netflix Video Streaming Platform', icon: '🎬', description: 'Global adaptive bitrate video player and catalog delivery system.', difficulty: 'advanced', category: 'media', tags: ['video', 'cdn', 'hls'], recipe: 'multi-region' },
  { id: 'youtube-upload', name: 'YouTube Video Upload Pipeline', icon: '📹', description: 'Multipart chunk uploads, asynchronous transcoding and audio extraction.', difficulty: 'advanced', category: 'media', tags: ['transcoding', 's3', 'workers'], recipe: 'event-driven' },
  { id: 'spotify-audio', name: 'Spotify Audio Streaming Network', icon: '🎵', description: 'Serves encrypted music catalog globally with offline synchronization.', difficulty: 'intermediate', category: 'media', tags: ['audio', 'cdn', 'cache'], recipe: 'cached-web' },
  { id: 'podcast-hosting', name: 'Podcast Distributer', icon: '🎙️', description: 'RSS feeds publisher, audio downloads, and listener statistics tracker.', difficulty: 'beginner', category: 'media', tags: ['rss', 'cdn', 'analytics'], recipe: 'basic-api' },
  { id: 'twitch-live-streaming', name: 'Twitch-style Live Stream Service', icon: '🎮', description: 'RTMP stream ingress node translating to HLS fragments.', difficulty: 'advanced', category: 'media', tags: ['webrtc', 'hls', 'livestreaming'], recipe: 'realtime' },
  { id: 'image-resizing-cdn', name: 'Dynamic Image Transform CDN', icon: '🖼️', description: 'Resizes and converts images on-the-fly depending on query parameters.', difficulty: 'intermediate', category: 'media', tags: ['cdn', 'serverless', 'cache'], recipe: 'basic-api' },
  { id: 'video-subtitling', name: 'Subtitling & Caption Generator', icon: '📝', description: 'AI transcriber generating subtitles for uploaded movies.', difficulty: 'intermediate', category: 'media', tags: ['speech-to-text', 'workers', 'vtt'], recipe: 'event-driven' },
  { id: 'audio-enhancer', name: 'Cloud Audio Enhancer Pipeline', icon: '🔊', description: 'Ingests voice clips, applies filtering, and normalizes decibels.', difficulty: 'beginner', category: 'media', tags: ['audio', 'processing', 'queue'], recipe: 'event-driven' },
  { id: 'media-metadata-search', name: 'Faceted Media Search Hub', icon: '🔍', description: 'Indices video catalog descriptions, tags, and actors.', difficulty: 'intermediate', category: 'media', tags: ['elasticsearch', 'search', 'metadata'], recipe: 'analytics' },
  { id: 'digital-asset-manager', name: 'Enterprise Media Asset Manager', icon: '📁', description: 'Permissions controlled repository for large format media.', difficulty: 'advanced', category: 'media', tags: ['dam', 'auth', 'storage'], recipe: 'mesh' },

  // === Data & Analytics (10) ===
  { id: 'data-pipeline-etl', name: 'High-Volume ETL Data Pipeline', icon: '🗄️', description: 'Ingests stream metrics, maps records, and exports to a data warehouse.', difficulty: 'intermediate', category: 'data', tags: ['etl', 'kafka', 'big-data'], recipe: 'event-driven' },
  { id: 'realtime-analytics', name: 'Clickstream Analytics Dashboard', icon: '📊', description: 'Visualizes user clicks on landing page within subsecond latency.', difficulty: 'intermediate', category: 'data', tags: ['clickstream', 'timescale', 'analytics'], recipe: 'analytics' },
  { id: 'elk-log-aggregator', name: 'ELK Log Aggregation System', icon: '🪵', description: 'Collects cluster logs, parses timestamps, and indexes in Elasticsearch.', difficulty: 'intermediate', category: 'data', tags: ['logs', 'elasticsearch', 'kibana'], recipe: 'analytics' },
  { id: 'metrics-collector', name: 'Prometheus-style Metrics Hub', icon: '📈', description: 'Scrapes timeseries nodes and stores CPU, RAM patterns.', difficulty: 'intermediate', category: 'data', tags: ['timeseries', 'scraping', 'prometheus'], recipe: 'analytics' },
  { id: 'ab-testing-platform', name: 'A/B Experimentation Engine', icon: '🧪', description: 'Splits traffic based on user hashes and computes statistical significance.', difficulty: 'intermediate', category: 'data', tags: ['split', 'statistics', 'redis'], recipe: 'cached-web' },
  { id: 'feature-flag-system', name: 'Real-time Feature Toggle SDK', icon: '🎏', description: 'Pushes flag configurations to applications within seconds.', difficulty: 'beginner', category: 'data', tags: ['flags', 'redis', 'sse'], recipe: 'cached-web' },
  { id: 'data-warehouse-connector', name: 'Data Warehouse Broker', icon: '🏢', description: 'Aggregates operational logs and loads batch files into Snowflake.', difficulty: 'advanced', category: 'data', tags: ['snowflake', 'batch', 's3'], recipe: 'event-driven' },
  { id: 'cdc-pipeline', name: 'Database Change Data Capture (CDC)', icon: '🔄', description: 'Watches Postgres transaction logs and updates search indices.', difficulty: 'advanced', category: 'data', tags: ['debezium', 'kafka', 'cdc'], recipe: 'event-driven' },
  { id: 'event-sourcing', name: 'Distributed Event Sourcing', icon: '💾', description: 'Stores transaction history as an immutable stream of event logs.', difficulty: 'advanced', category: 'data', tags: ['eventsourcing', 'kafka', 'ledger'], recipe: 'event-driven' },
  { id: 'timeseries-metrics', name: 'Time-Series Monitoring Database', icon: '⏱️', description: 'High-throughput database optimized for storing server heartbeats.', difficulty: 'advanced', category: 'data', tags: ['influxdb', 'metrics', 'writes'], recipe: 'analytics' },

  // === Real-time Systems (10) ===
  { id: 'chat-app', name: 'Live Web Chat Service', icon: '💬', description: 'WebSocket chat gateway with offline notifications.', difficulty: 'beginner', category: 'realtime', tags: ['websockets', 'redis', 'chat'], recipe: 'realtime' },
  { id: 'game-matchmaker', name: 'Multiplayer Lobby Matchmaker', icon: '🎮', description: 'Sorts online players based on rank and ping into active lobbies.', difficulty: 'intermediate', category: 'realtime', tags: ['matchmaking', 'redis', 'gaming'], recipe: 'realtime' },
  { id: 'collaborative-editor', name: 'Real-time Document Editor', icon: '📝', description: 'Handles concurrent edits using operational transformation conflict resolution.', difficulty: 'advanced', category: 'realtime', tags: ['ot', 'websockets', 'documents'], recipe: 'realtime' },
  { id: 'live-gps-tracking', name: 'GPS Location Streaming', icon: '📍', description: 'Receives coordinates from mobile devices and updates clients in real time.', difficulty: 'intermediate', category: 'realtime', tags: ['geospatial', 'redis', 'kafka'], recipe: 'iot-ingest' },
  { id: 'stock-ticker', name: 'Fast Stock Price Ticker', icon: '📈', description: 'Pushes broker price spikes to web client tickers.', difficulty: 'intermediate', category: 'realtime', tags: ['finance', 'websockets', 'low-latency'], recipe: 'realtime' },
  { id: 'sports-scoreboard', name: 'Live Sports Score Board', icon: '⚽', description: 'Pushes match updates to millions of simultaneous web connections.', difficulty: 'beginner', category: 'realtime', tags: ['sport', 'sse', 'scale'], recipe: 'realtime' },
  { id: 'iot-dashboard-gateway', name: 'Industrial IoT Core Gateway', icon: '🏭', description: 'Ingests MQTT telemetry from factory floor machines.', difficulty: 'advanced', category: 'realtime', tags: ['mqtt', 'kafka', 'factory'], recipe: 'iot-ingest' },
  { id: 'realtime-auction', name: 'Silent Auction Bid Engine', icon: '🔨', description: 'Tracks bid events and resolves matching winner at clock expiration.', difficulty: 'intermediate', category: 'realtime', tags: ['auction', 'redis', 'bids'], recipe: 'realtime' },
  { id: 'live-polling-system', name: 'Live Conference Polling', icon: '📊', description: 'Pushes instant poll options and displays vote distributions.', difficulty: 'beginner', category: 'realtime', tags: ['sse', 'polling', 'redis'], recipe: 'realtime' },
  { id: 'presence-service', name: 'Global User Presence Service', icon: '🟢', description: 'Keeps track of online, idle, offline status of millions of users.', difficulty: 'intermediate', category: 'realtime', tags: ['presence', 'redis-heartbeat', 'websockets'], recipe: 'realtime' },

  // === AI/ML (10) ===
  { id: 'ml-model-serving', name: 'ML Model Inference Gateway', icon: '🧠', description: 'Exposes GPU nodes behind load balancer with dynamic batching.', difficulty: 'intermediate', category: 'ai-ml', tags: ['gpu', 'inference', 'scaling'], recipe: 'cached-web' },
  { id: 'ml-training-pipeline', name: 'Distributed ML Training Pipeline', icon: '⚙️', description: 'Schedules big data training sets and writes model logs to S3.', difficulty: 'advanced', category: 'ai-ml', tags: ['training', 'workers', 'datasets'], recipe: 'event-driven' },
  { id: 'recommendation-engine', name: 'Personalized Recommendation Engine', icon: '🎯', description: 'Computes matching recommendation arrays utilizing graph relationships.', difficulty: 'advanced', category: 'ai-ml', tags: ['recommendation', 'redis', 'neo4j'], recipe: 'mesh' },
  { id: 'nlp-translation', name: 'Dynamic NLP Translation Server', icon: '🗣️', description: 'Translates textual fields dynamically utilizing AI API.', difficulty: 'beginner', category: 'ai-ml', tags: ['nlp', 'translation', 'api'], recipe: 'basic-api' },
  { id: 'computer-vision-ingress', name: 'Security Camera Object Detector', icon: '📷', description: 'Processes camera feeds, scanning frames for anomalies.', difficulty: 'advanced', category: 'ai-ml', tags: ['vision', 'workers', 'streaming'], recipe: 'iot-ingest' },
  { id: 'chatbot-conversations', name: 'Conversational LLM Chatbot', icon: '🤖', description: 'Handles session conversation history and connects to LLM broker.', difficulty: 'beginner', category: 'ai-ml', tags: ['chatbot', 'llm', 'sessions'], recipe: 'cached-web' },
  { id: 'search-ranker', name: 'AI Search Results Ranker', icon: '🔍', description: 'Reranks results pages dynamically based on client profiling logs.', difficulty: 'intermediate', category: 'ai-ml', tags: ['search', 'reranking', 'elasticsearch'], recipe: 'analytics' },
  { id: 'fraud-detector', name: 'Real-time Payment Fraud Evaluator', icon: '🛡️', description: 'Evaluates transactions against fraud risk profiles under 10ms.', difficulty: 'advanced', category: 'ai-ml', tags: ['fraud', 'risk', 'kafka'], recipe: 'event-driven' },
  { id: 'content-moderator', name: 'Auto Media Content Moderator', icon: '🔞', description: 'Processes uploaded images, flags NSFW and offensive texts.', difficulty: 'intermediate', category: 'ai-ml', tags: ['moderation', 'workers', 'queues'], recipe: 'event-driven' },
  { id: 'anomaly-detector', name: 'Infrastructure Anomaly Tracker', icon: '🚨', description: 'Detects unusual server metrics anomalies utilizing ML thresholds.', difficulty: 'intermediate', category: 'ai-ml', tags: ['anomaly', 'monitoring', 'ml'], recipe: 'analytics' },

  // === FinTech (10) ===
  { id: 'payment-processor', name: 'Stripe-like Payment Gateway', icon: '💳', description: 'Core payment gateway handling ledger updates and payouts.', difficulty: 'intermediate', category: 'fintech', tags: ['payments', 'pci', 'stripe'], recipe: 'cached-web' },
  { id: 'banking-ledger', name: 'Immutable Double-Entry Ledger', icon: '📖', description: 'ACID compliant banking ledger recording account transfer operations.', difficulty: 'advanced', category: 'fintech', tags: ['ledger', 'acid', 'banking'], recipe: 'cached-web' },
  { id: 'crypto-exchange', name: 'High-Speed Crypto Exchange Matcher', icon: '🪙', description: 'Trades matching engine with in-memory orders book queues.', difficulty: 'advanced', category: 'fintech', tags: ['exchange', 'matching', 'redis'], recipe: 'realtime' },
  { id: 'stock-trader', name: 'Algorithmic Stock Trading Broker', icon: '📈', description: 'Ingests market telemetry and executes trade order tickets.', difficulty: 'advanced', category: 'fintech', tags: ['stocks', 'low-latency', 'orders'], recipe: 'event-driven' },
  { id: 'loan-processor', name: 'Online Loan Approval Engine', icon: '📝', description: 'Ingests credit logs and calculates loan risk approvals.', difficulty: 'intermediate', category: 'fintech', tags: ['loans', 'risk', 'workflow'], recipe: 'mesh' },
  { id: 'invoice-system', name: 'Automated Invoice Billing', icon: '📄', description: 'Generates client monthly invoices and schedules email notifications.', difficulty: 'beginner', category: 'fintech', tags: ['invoices', 'billing', 'pdf'], recipe: 'event-driven' },
  { id: 'expense-tracker', name: 'Corporate Expense Hub', icon: '💰', description: 'Processes credit receipts uploads and extracts data via OCR.', difficulty: 'beginner', category: 'fintech', tags: ['expenses', 'ocr', 'postgres'], recipe: 'event-driven' },
  { id: 'money-transfer', name: 'Peer-to-Peer Cash Transfer', icon: '📲', description: 'Venmo-style direct money transfer between users.', difficulty: 'intermediate', category: 'fintech', tags: ['p2p', 'venmo', 'transfers'], recipe: 'cached-web' },
  { id: 'credit-score-engine', name: 'Real-time Credit Profiler', icon: '🛡️', description: 'Queries credit files and calculates credit score grades.', difficulty: 'intermediate', category: 'fintech', tags: ['credit', 'bureau', 'gateway'], recipe: 'cached-web' },
  { id: 'tax-calculator', name: 'Global Sales Tax Resolver', icon: '🧮', description: 'Calculates geolocated sales taxes for checkouts globally.', difficulty: 'beginner', category: 'fintech', tags: ['taxes', 'geocoding', 'calculators'], recipe: 'basic-api' },

  // === Infrastructure & DevOps (10) ===
  { id: 'cicd-pipeline', name: 'DevOps CI/CD Deployment Pipeline', icon: '🚀', description: 'Listens to git webhooks, builds code, runs tests, and deploys.', difficulty: 'intermediate', category: 'infrastructure', tags: ['cicd', 'github', 'pipelines'], recipe: 'event-driven' },
  { id: 'kubernetes-cluster', name: 'Container Orchestration Cluster', icon: '☸️', description: 'Deploys pods, replicates services, and balances cluster traffic.', difficulty: 'advanced', category: 'infrastructure', tags: ['k8s', 'pods', 'orchestration'], recipe: 'mesh' },
  { id: 'service-mesh-istio', name: 'Service Mesh Proxy Gateway', icon: '🕸️', description: 'Controls sidecar communications with mTLS and tracing.', difficulty: 'advanced', category: 'infrastructure', tags: ['istio', 'mesh', 'mtls'], recipe: 'mesh' },
  { id: 'dns-resolver', name: 'Distributed DNS Resolving Cache', icon: '🌐', description: 'Resolves website domains to IPs with geographic routing.', difficulty: 'intermediate', category: 'infrastructure', tags: ['dns', 'routing', 'caching'], recipe: 'basic-api' },
  { id: 'cert-manager', name: 'Let\'s Encrypt SSL Cert Provisioner', icon: '🔒', description: 'Auto-renews SSL certificates and applies them to API ingress routers.', difficulty: 'beginner', category: 'infrastructure', tags: ['ssl', 'certificates', 'acme'], recipe: 'event-driven' },
  { id: 'secrets-vault', name: 'HashiCorp Vault Secrets Storage', icon: '🔑', description: 'Secure encrypted vaults storing database passwords and API tokens.', difficulty: 'advanced', category: 'infrastructure', tags: ['vault', 'encryption', 'security'], recipe: 'cached-web' },
  { id: 'config-server', name: 'Centralized Application Configuration', icon: '⚙️', description: 'Pushes config environment maps to microservice instances.', difficulty: 'beginner', category: 'infrastructure', tags: ['configs', 'consul', 'keys'], recipe: 'cached-web' },
  { id: 'blue-green-deploy', name: 'Blue-Green Ingress Controller', icon: '🟢', description: 'Rotates active production deployment versions with zero downtime.', difficulty: 'intermediate', category: 'infrastructure', tags: ['deployments', 'blue-green', 'routers'], recipe: 'basic-api' },
  { id: 'canary-release', name: 'Canary Traffic Splitter', icon: '🐤', description: 'Routes 5% of web requests to next version containers for testing.', difficulty: 'intermediate', category: 'infrastructure', tags: ['canary', 'routing', 'deployments'], recipe: 'basic-api' },
  { id: 'infra-monitor', name: 'Datadog-style Cluster Monitor', icon: '📊', description: 'Aggregates CPU usage and generates alerts for degraded nodes.', difficulty: 'intermediate', category: 'infrastructure', tags: ['monitors', 'metrics', 'alerts'], recipe: 'analytics' },

  // === IoT & Edge (8) ===
  { id: 'smart-home', name: 'Smart Home Hub Gateway', icon: '🏠', description: 'Ingests light, heat status updates and updates mobile dashboards.', difficulty: 'beginner', category: 'iot', tags: ['home-automation', 'mqtt', 'websockets'], recipe: 'iot-ingest' },
  { id: 'fleet-management', name: 'Logistics Fleet Coordinates Tracker', icon: '🚚', description: 'Monitors location and fuel usage of global delivery trucks.', difficulty: 'intermediate', category: 'iot', tags: ['fleet', 'gps', 'geo'], recipe: 'iot-ingest' },
  { id: 'industrial-telemetry', name: 'Industrial Telemetry Monitor', icon: '🏭', description: 'Aggregates heat metrics from oil drilling monitors.', difficulty: 'advanced', category: 'iot', tags: ['telemetry', 'sensors', 'industrial'], recipe: 'iot-ingest' },
  { id: 'weather-station', name: 'Weather Station Sensor Array', icon: '🌦️', description: 'Collects wind and pressure metrics from stations globally.', difficulty: 'beginner', category: 'iot', tags: ['weather', 'sensors', 'timeseries'], recipe: 'iot-ingest' },
  { id: 'wearable-health', name: 'Smartwatch Vital Signs Hub', icon: '⌚', description: 'Ingests pulse rate metrics and raises emergency alerts.', difficulty: 'intermediate', category: 'iot', tags: ['wearables', 'health', 'telemetry'], recipe: 'iot-ingest' },
  { id: 'smart-grid', name: 'Power Grid Telemetry Sensor', icon: '⚡', description: 'Monitors electrical grid loading and automatically balances output.', difficulty: 'advanced', category: 'iot', tags: ['smart-grid', 'electrical', 'monitoring'], recipe: 'iot-ingest' },
  { id: 'connected-car', name: 'Connected Car Sensor Node', icon: '🚗', description: 'Streams engine performance updates and raises crash alerts.', difficulty: 'advanced', category: 'iot', tags: ['automotive', 'telemetry', 'gps'], recipe: 'iot-ingest' },
  { id: 'drone-control', name: 'Drone Fleet Ingress Node', icon: '🛸', description: 'Ingests coordinate logs from drones and updates base maps.', difficulty: 'intermediate', category: 'iot', tags: ['drones', 'telemetry', 'control'], recipe: 'iot-ingest' },

  // === Healthcare (8) ===
  { id: 'ehr-system', name: 'Electronic Health Records System', icon: '🏥', description: 'HIPAA compliant patient medical history repository.', difficulty: 'intermediate', category: 'healthcare', tags: ['ehr', 'hipaa', 'security'], recipe: 'cached-web' },
  { id: 'telemedicine-platform', name: 'Telemedicine Appointments Engine', icon: '📞', description: 'Coordinates video links and schedule doctor portals.', difficulty: 'beginner', category: 'healthcare', tags: ['telemedicine', 'video', 'schedule'], recipe: 'basic-api' },
  { id: 'lab-results', name: 'Lab Test Reports Ingress', icon: '🧪', description: 'Secure PDF parsing for medical laboratory diagnostics.', difficulty: 'beginner', category: 'healthcare', tags: ['labs', 'ocr', 'documents'], recipe: 'event-driven' },
  { id: 'appointment-scheduler', name: 'Patient Booking System', icon: '📅', description: 'Maintains doctor calendars, avoiding overlapping schedules.', difficulty: 'beginner', category: 'healthcare', tags: ['calendar', 'booking', 'postgres'], recipe: 'cached-web' },
  { id: 'pharmacy-system', name: 'Prescription Dispensation Ledger', icon: '💊', description: 'Tracks medicine stocks and logs narcotic prescription approvals.', difficulty: 'intermediate', category: 'healthcare', tags: ['pharmacy', 'prescriptions', 'ledger'], recipe: 'cached-web' },
  { id: 'medical-imaging', name: 'PACS Medical Imaging (DICOM) Hub', icon: '🩻', description: 'Stores large format X-ray, MRI images in secure s3 vaults.', difficulty: 'advanced', category: 'healthcare', tags: ['dicom', 'pacs', 'images'], recipe: 'event-driven' },
  { id: 'patient-portal', name: 'Secure Patient Portal App', icon: '👤', description: 'Provides billing portals, test updates to patients.', difficulty: 'beginner', category: 'healthcare', tags: ['patients', 'auth', 'billing'], recipe: 'basic-api' },
  { id: 'health-analytics', name: 'Epidemiological Outbreak Monitor', icon: '📈', description: 'Monitors clinic logs to detect outbreaks in real time.', difficulty: 'advanced', category: 'healthcare', tags: ['epidemiology', 'analytics', 'data'], recipe: 'analytics' },

  // === Gaming (8) ===
  { id: 'gaming-matchmaker', name: 'Lobby Matchmaking Engine', icon: '🎮', description: 'Pairs multiplayer gamers utilizing ranking brackets.', difficulty: 'intermediate', category: 'gaming', tags: ['matchmaker', 'lobby', 'elo'], recipe: 'realtime' },
  { id: 'gaming-leaderboard', name: 'Fast Global Leaderboard', icon: '🏆', description: 'Computes realtime top player lists utilizing Redis sorted sets.', difficulty: 'beginner', category: 'gaming', tags: ['leaderboard', 'redis', 'scores'], recipe: 'cached-web' },
  { id: 'in-game-economy', name: 'Virtual Item Economy Ledger', icon: '💰', description: 'Secure transactions logging purchase of skins, currency.', difficulty: 'intermediate', category: 'gaming', tags: ['economy', 'transactions', 'purchases'], recipe: 'cached-web' },
  { id: 'player-inventory', name: 'Player Inventory Cache', icon: '🎒', description: 'Loads player active items loadouts within milliseconds.', difficulty: 'beginner', category: 'gaming', tags: ['inventory', 'caching', 'redis'], recipe: 'cached-web' },
  { id: 'game-state-sync', name: 'FPS Game State Sync Server', icon: '🔁', description: 'Synchronizes bullet vectors and player positions at 64Hz.', difficulty: 'advanced', category: 'gaming', tags: ['udp', 'fps', 'lowlatency'], recipe: 'realtime' },
  { id: 'anti-cheat-telemetry', name: 'Anti-Cheat Behavioral Monitor', icon: '🛡️', description: 'Scans logs for bot patterns or speedhack signals.', difficulty: 'advanced', category: 'gaming', tags: ['anticheat', 'telemetry', 'ml'], recipe: 'analytics' },
  { id: 'tournament-brackets', name: 'Esports Bracket Orchestrator', icon: '⚔️', description: 'Computes tournament brackets and tracks active scores.', difficulty: 'beginner', category: 'gaming', tags: ['tournaments', 'brackets', 'brackets'], recipe: 'basic-api' },
  { id: 'game-replay-system', name: 'Multiplayer Replay Recorder', icon: '📹', description: 'Records action commands tick logs for later replay rendering.', difficulty: 'intermediate', category: 'gaming', tags: ['replay', 'gameplay', 'storage'], recipe: 'event-driven' },

  // === Security (8) ===
  { id: 'siem-log-analyzer', name: 'SIEM Security Event Aggregator', icon: '🛡️', description: 'Ingests firewall syslog events and flags DDoS threats.', difficulty: 'advanced', category: 'security', tags: ['siem', 'security', 'logs'], recipe: 'analytics' },
  { id: 'waf-proxy', name: 'Web Application Firewall (WAF) Proxy', icon: '🚧', description: 'Filters incoming requests, blocking SQL injection attempts.', difficulty: 'intermediate', category: 'security', tags: ['waf', 'security', 'proxy'], recipe: 'basic-api' },
  { id: 'identity-provider', name: 'Enterprise Identity Gateway', icon: '👤', description: 'Active Directory / LDAP validation token gateway.', difficulty: 'intermediate', category: 'security', tags: ['auth', 'identity', 'ldap'], recipe: 'cached-web' },
  { id: 'secrets-management-kms', name: 'Key Management Service (KMS)', icon: '🔑', description: 'Handles data encrypting keys and manages automated key rotations.', difficulty: 'advanced', category: 'security', tags: ['kms', 'encryption', 'keys'], recipe: 'cached-web' },
  { id: 'vulnerability-scanner', name: 'Automated Port Scanner', icon: '🔍', description: 'Scrapes client servers scanning for out-of-date packages.', difficulty: 'intermediate', category: 'security', tags: ['scanner', 'vulnerabilities', 'cron'], recipe: 'event-driven' },
  { id: 'pen-test-orchestrator', name: 'Penetration Testing Orchestrator', icon: '⚔️', description: 'Fuzzes web endpoints to audit input validations.', difficulty: 'intermediate', category: 'security', tags: ['pentesting', 'fuzzing', 'audit'], recipe: 'event-driven' },
  { id: 'access-control-rbac', name: 'RBAC Policy Evaluation Service', icon: '🛡️', description: 'Validates if user API tokens allow access to files.', difficulty: 'beginner', category: 'security', tags: ['rbac', 'policies', 'authorization'], recipe: 'cached-web' },
  { id: 'audit-log-vault', name: 'Immutable Audit Log Vault', icon: '📜', description: 'Saves write-once-read-many security audit logs.', difficulty: 'advanced', category: 'security', tags: ['audit', 'compliance', 's3'], recipe: 'event-driven' },

  // === Blockchain (8) ===
  { id: 'nft-marketplace-backend', name: 'NFT Auction Broker', icon: '🎨', description: 'Ingests Ethereum block events and indexes catalog assets.', difficulty: 'intermediate', category: 'blockchain', tags: ['nft', 'ethereum', 'ipfs'], recipe: 'event-driven' },
  { id: 'defi-yield-aggregator', name: 'DeFi Yield Calculator', icon: '🌾', description: 'Monitors crypto rates and allocates liquidity tokens.', difficulty: 'advanced', category: 'blockchain', tags: ['defi', 'yield', 'crypto'], recipe: 'analytics' },
  { id: 'blockchain-explorer', name: 'Block Ledger Explorer', icon: '🔍', description: 'Indexes transactions to query block histories fast.', difficulty: 'intermediate', category: 'blockchain', tags: ['indexer', 'explorer', 'blocks'], recipe: 'analytics' },
  { id: 'wallet-custody-service', name: 'Multi-Signature Custody System', icon: '🔒', description: 'Co-signs coin transactions utilizing secure keys vaults.', difficulty: 'advanced', category: 'blockchain', tags: ['custody', 'wallet', 'multisig'], recipe: 'cached-web' },
  { id: 'smart-contract-compiler', name: 'Solidity Compiler Agent', icon: '⚙️', description: 'Queue-based compiler compiling Solidity code scripts.', difficulty: 'beginner', category: 'blockchain', tags: ['compiler', 'solidity', 'queue'], recipe: 'event-driven' },
  { id: 'crypto-payment-bridge', name: 'Crypto Payment Bridge Gateway', icon: '🌉', description: 'Processes payments in crypto and triggers fiat conversion hooks.', difficulty: 'intermediate', category: 'blockchain', tags: ['bridge', 'payments', 'crypto'], recipe: 'event-driven' },
  { id: 'gas-tracker', name: 'Gas Fee Estimator', icon: '⛽', description: 'Aggregates transaction logs and estimates gas price hikes.', difficulty: 'beginner', category: 'blockchain', tags: ['gas', 'ethereum', 'fees'], recipe: 'analytics' },
  { id: 'decentralized-storage-bridge', name: 'IPFS Storage Provider Bridge', icon: '⛓️', description: 'Encrypts and chunk uploads logs to decentralized nodes.', difficulty: 'advanced', category: 'blockchain', tags: ['ipfs', 'storage', 'filecoin'], recipe: 'event-driven' },
];

// Helper to construct a beautiful layout based on recipe
function constructRecipe(meta: typeof METADATA_DEFS[0]): TemplateEntry {
  const nodes: Omit<SimNode, 'metrics' | 'status'>[] = [];
  const edges: Omit<SimEdge, 'throughput'>[] = [];
  const name = meta.name;
  const id = meta.id;

  switch (meta.recipe) {
    case 'cached-web':
      nodes.push(n('client', 'client', 'User Client', 450, 60));
      nodes.push(n('cdn', 'cdn', `${name} CDN`, 450, 160));
      nodes.push(n('gateway', 'api_gateway', `${name} Gateway`, 450, 270));
      nodes.push(n('lb', 'load_balancer', 'Load Balancer', 450, 380));
      nodes.push(n('service', 'service', `${name} Service`, 450, 490, { replicas: 3 }));
      nodes.push(n('redis', 'redis', 'Redis L1 Cache', 250, 610, { cacheHitRatio: 0.90 }));
      nodes.push(n('db', 'postgresql', 'PostgreSQL Primary', 650, 610, { replicas: 1 }));

      edges.push(e('e1', 'client', 'cdn'));
      edges.push(e('e2', 'cdn', 'gateway'));
      edges.push(e('e3', 'gateway', 'lb'));
      edges.push(e('e4', 'lb', 'service'));
      edges.push(e('e5', 'service', 'redis', 'cache lookup', 'redis'));
      edges.push(e('e6', 'service', 'db', 'read/write', 'tcp'));
      break;

    case 'event-driven':
      nodes.push(n('client', 'client', 'Clients Ingress', 450, 60));
      nodes.push(n('gateway', 'api_gateway', 'API Gateway', 450, 170));
      nodes.push(n('service', 'service', `${name} Svc`, 450, 280));
      nodes.push(n('kafka', 'kafka', 'Kafka Broker Queue', 450, 400, { partitions: 8 }));
      nodes.push(n('worker', 'worker', `${name} Worker`, 300, 520, { replicas: 4 }));
      nodes.push(n('redis', 'redis', 'Dedup Redis', 600, 520));
      nodes.push(n('db', 'postgresql', 'Database', 450, 640));

      edges.push(e('e1', 'client', 'gateway'));
      edges.push(e('e2', 'gateway', 'service'));
      edges.push(e('e3', 'service', 'kafka', 'enqueue msg', 'amqp'));
      edges.push(e('e4', 'kafka', 'worker', 'consume job', 'amqp'));
      edges.push(e('e5', 'worker', 'redis', 'deduplicate', 'redis'));
      edges.push(e('e6', 'worker', 'db', 'save result', 'tcp'));
      break;

    case 'analytics':
      nodes.push(n('client', 'client', 'Data Ingestion Clients', 450, 60));
      nodes.push(n('gateway', 'api_gateway', 'Ingestion Gateway', 450, 170));
      nodes.push(n('kafka', 'kafka', 'Telemetry Kafka Stream', 450, 290, { partitions: 16 }));
      nodes.push(n('worker', 'worker', 'Analytics Aggregators', 300, 410, { replicas: 6 }));
      nodes.push(n('redis', 'redis', 'Redis Real-time Buffer', 600, 410));
      nodes.push(n('es', 'elasticsearch', 'Elasticsearch Cluster', 300, 540));
      nodes.push(n('db', 'cassandra', 'Cassandra Timeseries DB', 600, 540));

      edges.push(e('e1', 'client', 'gateway'));
      edges.push(e('e2', 'gateway', 'kafka', 'stream bytes', 'amqp'));
      edges.push(e('e3', 'kafka', 'worker', 'aggregate metric', 'amqp'));
      edges.push(e('e4', 'worker', 'redis', 'buffer updates', 'redis'));
      edges.push(e('e5', 'worker', 'es', 'index logs', 'tcp'));
      edges.push(e('e6', 'worker', 'db', 'save metrics', 'tcp'));
      break;

    case 'multi-region':
      nodes.push(n('client', 'client', 'Global Users', 450, 40));
      nodes.push(n('cdn', 'cdn', 'Anycast CDN Edge', 450, 130, { cacheHitRatio: 0.95 }));
      nodes.push(n('gateway_us', 'api_gateway', 'Gateway US', 250, 240));
      nodes.push(n('gateway_eu', 'api_gateway', 'Gateway EU', 650, 240));
      nodes.push(n('svc_us', 'service', `${name} US`, 250, 360, { replicas: 3 }));
      nodes.push(n('svc_eu', 'service', `${name} EU`, 650, 360, { replicas: 3 }));
      nodes.push(n('redis_us', 'redis', 'US Cache', 150, 480));
      nodes.push(n('redis_eu', 'redis', 'EU Cache', 550, 480));
      nodes.push(n('db_us', 'postgresql', 'US DB', 350, 590));
      nodes.push(n('db_eu', 'postgresql', 'EU DB', 750, 590));

      edges.push(e('e1', 'client', 'cdn'));
      edges.push(e('e2_us', 'cdn', 'gateway_us'));
      edges.push(e('e2_eu', 'cdn', 'gateway_eu'));
      edges.push(e('e3_us', 'gateway_us', 'svc_us'));
      edges.push(e('e3_eu', 'gateway_eu', 'svc_eu'));
      edges.push(e('e4_us', 'svc_us', 'redis_us', 'lookup', 'redis'));
      edges.push(e('e4_eu', 'svc_eu', 'redis_eu', 'lookup', 'redis'));
      edges.push(e('e5_us', 'svc_us', 'db_us', 'write', 'tcp'));
      edges.push(e('e5_eu', 'svc_eu', 'db_eu', 'write', 'tcp'));
      edges.push(e('e_repl', 'db_us', 'db_eu', 'sync', 'tcp'));
      break;

    case 'mesh':
      nodes.push(n('gateway', 'api_gateway', 'Mesh Gateway', 450, 80));
      nodes.push(n('svc1', 'service', 'Service A', 250, 210));
      nodes.push(n('svc2', 'service', 'Service B', 450, 210));
      nodes.push(n('svc3', 'service', 'Service C', 650, 210));
      nodes.push(n('redis', 'redis', 'Redis Mesh L1', 250, 340));
      nodes.push(n('db1', 'postgresql', 'SQL DB', 450, 340));
      nodes.push(n('db2', 'mongodb', 'NoSQL DB', 650, 340));

      edges.push(e('e1', 'gateway', 'svc1'));
      edges.push(e('e2', 'gateway', 'svc2'));
      edges.push(e('e3', 'gateway', 'svc3'));
      edges.push(e('e4', 'svc1', 'redis', 'lookup', 'redis'));
      edges.push(e('e5', 'svc1', 'db1', 'write', 'tcp'));
      edges.push(e('e6', 'svc2', 'db2', 'write', 'tcp'));
      edges.push(e('e7', 'svc3', 'svc2', 'call', 'grpc'));
      edges.push(e('e8', 'svc3', 'db1', 'read', 'tcp'));
      break;

    case 'iot-ingest':
      nodes.push(n('client', 'client', 'Sensors Array', 450, 60));
      nodes.push(n('gateway', 'api_gateway', 'Ingest Broker', 450, 170));
      nodes.push(n('kafka', 'kafka', 'Telemetry Stream', 450, 290, { partitions: 32 }));
      nodes.push(n('worker', 'worker', 'Ingest Processor', 300, 410, { replicas: 8 }));
      nodes.push(n('redis', 'redis', 'Hot Cache', 600, 410));
      nodes.push(n('cassandra', 'cassandra', 'Cassandra Cluster', 450, 530, { replicas: 3 }));

      edges.push(e('e1', 'client', 'gateway', 'MQTT'));
      edges.push(e('e2', 'gateway', 'kafka', 'push', 'amqp'));
      edges.push(e('e3', 'kafka', 'worker', 'pull', 'amqp'));
      edges.push(e('e4', 'worker', 'redis', 'heartbeat', 'redis'));
      edges.push(e('e5', 'worker', 'cassandra', 'append', 'tcp'));
      break;

    case 'blockchain-node':
      nodes.push(n('client', 'client', 'RPC Clients', 450, 60));
      nodes.push(n('gateway', 'api_gateway', 'RPC Gateway', 450, 170));
      nodes.push(n('svc', 'service', 'Tx Validator', 450, 280));
      nodes.push(n('redis', 'redis', 'Mempool Cache', 250, 390));
      nodes.push(n('kafka', 'kafka', 'Broadcast Broker', 650, 390));
      nodes.push(n('db', 'postgresql', 'State Ledger', 450, 510));

      edges.push(e('e1', 'client', 'gateway'));
      edges.push(e('e2', 'gateway', 'svc'));
      edges.push(e('e3', 'svc', 'redis', 'mempool', 'redis'));
      edges.push(e('e4', 'svc', 'kafka', 'broadcast', 'amqp'));
      edges.push(e('e5', 'svc', 'db', 'commit state', 'tcp'));
      break;

    case 'realtime':
      nodes.push(n('client', 'client', 'Active User Client', 450, 60));
      nodes.push(n('gateway', 'api_gateway', 'Real-time WebSocket Gateway', 450, 170));
      nodes.push(n('service', 'service', `${name} Service`, 450, 290, { replicas: 3 }));
      nodes.push(n('redis', 'redis', 'Redis PubSub & Presence', 250, 410));
      nodes.push(n('db', 'postgresql', 'SQL State store', 650, 410));

      edges.push(e('e1', 'client', 'gateway', 'ws'));
      edges.push(e('e2', 'gateway', 'service', 'proxy', 'grpc'));
      edges.push(e('e3', 'service', 'redis', 'presence update', 'redis'));
      edges.push(e('e4', 'service', 'db', 'persistence', 'tcp'));
      break;

    case 'basic-api':
    default:
      nodes.push(n('client', 'client', 'Web Browser Client', 450, 80));
      nodes.push(n('gateway', 'api_gateway', 'Edge API Gateway', 450, 200));
      nodes.push(n('service', 'service', `${name} Service`, 450, 330, { replicas: 2 }));
      nodes.push(n('db', 'postgresql', 'Postgres Database', 450, 460));

      edges.push(e('e1', 'client', 'gateway'));
      edges.push(e('e2', 'gateway', 'service'));
      edges.push(e('e3', 'service', 'db', 'read/write', 'tcp'));
      break;
  }

  return {
    id,
    name,
    icon: meta.icon,
    description: meta.description,
    difficulty: meta.difficulty,
    category: meta.category,
    tags: meta.tags,
    nodes,
    edges
  };
}

// Generate the final list of 150+ templates!
export const TEMPLATE_LIBRARY: TemplateEntry[] = METADATA_DEFS.map(constructRecipe);
