'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

const PARTICLES = Array.from({length: 60}, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 3 + 1,
  speed: Math.random() * 0.3 + 0.1,
  opacity: Math.random() * 0.5 + 0.1,
  color: ['#4f8ef7','#00d4ff','#7c3aed','#10b981'][Math.floor(Math.random()*4)]
}));

const FEATURES = [
  { icon: '⚡', label: 'AI Architecture Generator', desc: 'Generate full system designs from a single prompt — services, DBs, queues auto-placed' },
  { icon: '🔬', label: 'Deterministic Simulation', desc: 'Event-driven engine simulates real distributed system behavior, no LLM dependency' },
  { icon: '🤖', label: 'AI Engineering Copilot', desc: 'Explains bottlenecks, CAP tradeoffs, scaling strategies in real-time' },
  { icon: '💥', label: 'Failure Injection', desc: 'Chaos engineering: Redis failures, Kafka outages, network partitions, region outages' },
  { icon: '🎯', label: 'Interview Mode', desc: 'Company-style prompts with dynamic FAQ after every architectural change + scoring' },
  { icon: '📊', label: 'Live Metrics', desc: 'Real-time QPS, latency, cache hit ratio, queue depth, error rates on canvas' },
];

const TEMPLATES = [
  { name: 'URL Shortener', icon: '🔗', color: '#4f8ef7' },
  { name: 'Netflix Clone', icon: '🎬', color: '#ef4444' },
  { name: 'Uber Architecture', icon: '🚗', color: '#f59e0b' },
  { name: 'Twitter/X Scale', icon: '🐦', color: '#00d4ff' },
  { name: 'WhatsApp Messaging', icon: '💬', color: '#10b981' },
  { name: 'E-Commerce Platform', icon: '🛒', color: '#7c3aed' },
  { name: 'Notification Service', icon: '🔔', color: '#ec4899' },
  { name: 'Search Engine', icon: '🔍', color: '#f97316' },
];

export default function LandingPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'none'|'login'|'signup'>('none');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setMounted(true);
    const user = localStorage.getItem('era_user');
    if (user) router.push('/dashboard');
  }, [router]);

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => setCursorPos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    await new Promise(r => setTimeout(r, 1000));
    if (!email || !password) { setError('Please fill all fields'); setLoading(false); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); setLoading(false); return; }
    const user = { email, name: name || email.split('@')[0], id: Date.now().toString() };
    localStorage.setItem('era_user', JSON.stringify(user));
    setLoading(false);
    router.push('/dashboard');
  };

  if (!mounted) return null;

  return (
    <div className={styles.landing}>
      <div
        className={styles.cursorGlow}
        style={{ left: cursorPos.x, top: cursorPos.y }}
      />
      <div className={styles.particles}>
        {PARTICLES.map(p => (
          <div
            key={p.id}
            className={styles.particle}
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              opacity: p.opacity,
              background: p.color,
              animationDuration: `${p.speed * 20 + 10}s`,
              animationDelay: `${p.id * 0.1}s`,
            }}
          />
        ))}
      </div>
      <div className={styles.gridBg} />

      {/* Nav */}
      <nav className={styles.nav}>
        <div className={styles.logo}>
          <span className={styles.logoText}>ERA</span>
          <span className={styles.logoSub}>Architecture Reasoning Engine</span>
        </div>
        <div className={styles.navActions}>
          <button className="btn btn-ghost btn-sm" onClick={() => setMode('login')}>Sign In</button>
          <button className="btn btn-primary btn-sm" onClick={() => setMode('signup')}>Get Started →</button>
        </div>
      </nav>

      {/* Hero */}
      <main className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroLabel}>
            <span className={styles.heroDot} />
            AI-Native System Design Platform
          </div>

          <h1 className={styles.heroTitle}>
            <span className={styles.eraBig}>ERA</span>
            <span className={styles.heroTagline}>Architecture Reasoning Engine</span>
          </h1>

          <p className={styles.heroDesc}>
            Design distributed systems visually. Simulate real behavior under load and failures.
            Get AI-powered engineering critique, interview coaching, and optimization — all in one canvas.
          </p>

          <div className={styles.heroCtas}>
            <button className="btn btn-primary btn-lg" id="hero-get-started-btn" onClick={() => setMode('signup')}>
              🚀 Start Designing Free
            </button>
            <button className="btn btn-secondary btn-lg" onClick={() => setMode('login')}>
              Sign In
            </button>
          </div>

          <div className={styles.heroStats}>
            {[['50+', 'Components'], ['12', 'Failure Types'], ['∞', 'Canvas Scale'], ['AI', 'Copilot']].map(([v, l]) => (
              <div key={l} className={styles.heroStat}>
                <span className={styles.heroStatValue}>{v}</span>
                <span className={styles.heroStatLabel}>{l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Hero Visual — Architecture Preview */}
        <div className={styles.heroVisual}>
          <div className={styles.archPreview}>
            {/* Scan line effect */}
            <div className={styles.scanLine} />
            
            <div className={styles.archNode} style={{top:'8%',left:'50%',background:'rgba(30,58,95,0.9)'}}>
              🌐 Client App
            </div>
            <div className={styles.archNode} style={{top:'24%',left:'50%',background:'rgba(26,45,74,0.9)'}}>
              ⚡ API Gateway
            </div>
            <div className={styles.archNode} style={{top:'42%',left:'22%',background:'rgba(30,45,61,0.9)'}}>
              ⚖️ Load Balancer
            </div>
            <div className={styles.archNode} style={{top:'42%',left:'72%',background:'rgba(26,45,74,0.9)'}}>
              🔑 Auth Service
            </div>
            <div className={styles.archNode} style={{top:'62%',left:'12%',background:'rgba(30,36,71,0.9)'}}>
              🗄️ PostgreSQL
            </div>
            <div className={styles.archNode} style={{top:'62%',left:'50%',background:'rgba(29,41,24,0.9)'}}>
              ⚡ Redis Cache
            </div>
            <div className={styles.archNode} style={{top:'62%',left:'82%',background:'rgba(45,30,30,0.9)'}}>
              📨 Kafka
            </div>

            <svg className={styles.archSvg} viewBox="0 0 400 300" preserveAspectRatio="none">
              <defs>
                <marker id="arr" markerWidth="5" markerHeight="5" refX="3" refY="2.5" orient="auto">
                  <path d="M0,0 L0,5 L5,2.5 z" fill="rgba(79,142,247,0.6)" />
                </marker>
              </defs>
              <line x1="200" y1="40" x2="200" y2="72" stroke="rgba(79,142,247,0.5)" strokeWidth="1.5" markerEnd="url(#arr)" strokeDasharray="5,3" className={styles.svgLine} />
              <line x1="185" y1="95" x2="95" y2="128" stroke="rgba(79,142,247,0.4)" strokeWidth="1.5" markerEnd="url(#arr)" strokeDasharray="5,3" className={styles.svgLine} />
              <line x1="215" y1="95" x2="285" y2="128" stroke="rgba(79,142,247,0.4)" strokeWidth="1.5" markerEnd="url(#arr)" strokeDasharray="5,3" className={styles.svgLine} />
              <line x1="85" y1="152" x2="55" y2="190" stroke="rgba(0,212,255,0.4)" strokeWidth="1.5" markerEnd="url(#arr)" strokeDasharray="5,3" className={styles.svgLine} />
              <line x1="100" y1="152" x2="195" y2="190" stroke="rgba(16,185,129,0.4)" strokeWidth="1.5" markerEnd="url(#arr)" strokeDasharray="5,3" className={styles.svgLine} />
              <line x1="290" y1="152" x2="320" y2="190" stroke="rgba(239,68,68,0.4)" strokeWidth="1.5" markerEnd="url(#arr)" strokeDasharray="5,3" className={styles.svgLine} />
            </svg>

            {/* Moving data particles */}
            <div className={styles.dataParticle} style={{animationDelay:'0s', top:'16%', left:'50%'}} />
            <div className={styles.dataParticle} style={{animationDelay:'0.7s', top:'34%', left:'30%', background:'#00d4ff'}} />
            <div className={styles.dataParticle} style={{animationDelay:'1.4s', top:'52%', left:'55%', background:'#10b981'}} />
            <div className={styles.dataParticle} style={{animationDelay:'2.1s', top:'34%', left:'68%', background:'#7c3aed'}} />

            {/* Live status */}
            <div className={styles.archLive}>
              <span className={styles.heroDot} /> LIVE SIM
            </div>
          </div>

          {/* Metrics overlay */}
          <div className={styles.metricsOverlay}>
            <div className={styles.metricPill}>
              <span style={{color:'#10b981'}}>●</span> 99.9% uptime
            </div>
            <div className={styles.metricPill}>
              <span style={{color:'#4f8ef7'}}>●</span> 12.3k QPS
            </div>
            <div className={styles.metricPill}>
              <span style={{color:'#f59e0b'}}>●</span> p99: 45ms
            </div>
          </div>
        </div>
      </main>

      {/* Features Grid */}
      <section className={styles.featuresSection}>
        <h2 className={styles.sectionTitle}>
          Everything you need to reason about architecture
        </h2>
        <p className={styles.sectionDesc}>
          ERA = ARE reversed. Because architecture reasoning is not just forward thinking — it&apos;s about reasoning backwards from failure to design.
        </p>
        <div className={styles.featuresGrid}>
          {FEATURES.map((f, i) => (
            <div key={f.label} className={styles.featureCard} style={{animationDelay:`${i*0.08}s`}}>
              <div className={styles.featureIcon}>{f.icon}</div>
              <h3 className={styles.featureLabel}>{f.label}</h3>
              <p className={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Templates */}
      <section className={styles.templatesSection}>
        <h2 className={styles.sectionTitle}>Start from real-world architectures</h2>
        <div className={styles.templatesRow}>
          {TEMPLATES.map(t => (
            <div key={t.name} className={styles.templateChip} onClick={() => setMode('signup')}>
              <span>{t.icon}</span>
              <span>{t.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Auth Modal */}
      {mode !== 'none' && (
        <div className={styles.modalOverlay} onClick={() => setMode('none')}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalLogo}>
                <span className={styles.modalLogoText}>ERA</span>
              </div>
              <button className={styles.modalClose} onClick={() => setMode('none')}>✕</button>
            </div>

            <h2 className={styles.modalTitle}>
              {mode === 'login' ? 'Welcome back' : 'Start reasoning'}
            </h2>
            <p className={styles.modalSub}>
              {mode === 'login'
                ? 'Sign in to your ERA workspace'
                : 'Create your free ERA account — no credit card needed'
              }
            </p>

            <div className={styles.modeTabs}>
              <button
                className={`${styles.modeTab} ${mode === 'login' ? styles.modeTabActive : ''}`}
                onClick={() => { setMode('login'); setError(''); }}
              >Sign In</button>
              <button
                className={`${styles.modeTab} ${mode === 'signup' ? styles.modeTabActive : ''}`}
                onClick={() => { setMode('signup'); setError(''); }}
              >Sign Up</button>
            </div>

            <form className={styles.form} onSubmit={handleAuth}>
              {mode === 'signup' && (
                <div className={styles.formGroup}>
                  <label className={styles.label}>Full Name</label>
                  <input
                    className="input"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                </div>
              )}
              <div className={styles.formGroup}>
                <label className={styles.label}>Email</label>
                <input
                  className="input"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Password</label>
                <input
                  className="input"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && <div className={styles.formError}>{error}</div>}

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                id="auth-submit-btn"
                style={{width:'100%', justifyContent:'center', padding:'12px', marginTop:4}}
              >
                {loading ? (
                  <span style={{display:'flex',alignItems:'center',gap:8}}>
                    <span style={{animation:'spin 1s linear infinite',display:'inline-block'}}>⚙</span>
                    Authenticating...
                  </span>
                ) : (
                  mode === 'login' ? 'Sign In →' : 'Create Account →'
                )}
              </button>

              <p className={styles.formHint}>
                {mode === 'login'
                  ? <><span>No account? </span><button type="button" className={styles.linkBtn} onClick={() => setMode('signup')}>Sign up free</button></>
                  : <><span>Already have one? </span><button type="button" className={styles.linkBtn} onClick={() => setMode('login')}>Sign in</button></>
                }
              </p>
            </form>

            <div className={styles.demoHint}>
              <span>💡</span>
              <span>Use any email + password (6+ chars) for demo access</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
