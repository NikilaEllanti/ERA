'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TEMPLATE_LIBRARY, TEMPLATE_CATEGORIES } from '@/lib/templates-library';
import styles from './dashboard.module.css';

interface User {
  name: string;
  email: string;
  id: string;
}

interface Board {
  id: string;
  name: string;
  template: string;
  updatedAt: number;
  nodeCount: number;
  thumbnail?: string;
}

const RECENT_BOARDS_KEY = 'era_boards';

function getBoards(): Board[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(RECENT_BOARDS_KEY) || '[]');
  } catch { return []; }
}

function saveBoard(board: Board): void {
  const boards = getBoards();
  const existing = boards.findIndex(b => b.id === board.id);
  if (existing >= 0) boards[existing] = board;
  else boards.unshift(board);
  localStorage.setItem(RECENT_BOARDS_KEY, JSON.stringify(boards.slice(0, 20)));
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [boards, setBoards] = useState<Board[]>([]);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'recent' | 'templates'>('recent');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const userData = localStorage.getItem('era_user');
    if (!userData) { router.push('/'); return; }
    setUser(JSON.parse(userData));
    setBoards(getBoards());
  }, [router]);

  const createBoard = (templateId: string, templateName: string) => {
    const id = `board-${Date.now()}`;
    const template = TEMPLATE_LIBRARY.find(t => t.id === templateId);
    const board: Board = {
      id,
      name: templateName,
      template: templateId,
      updatedAt: Date.now(),
      nodeCount: template?.nodes.length || 0,
    };
    saveBoard(board);
    router.push(`/canvas/${id}?template=${templateId}`);
  };

  const openBoard = (board: Board) => {
    router.push(`/canvas/${board.id}?template=${board.template}`);
  };

  const logout = () => {
    localStorage.removeItem('era_user');
    router.push('/');
  };

  const filteredTemplates = TEMPLATE_LIBRARY.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.tags.some(tag => tag.includes(search.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || t.difficulty === selectedDifficulty;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const filteredBoards = boards.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  const formatTime = (ts: number) => {
    const diff = Date.now() - ts;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  if (!mounted) return null;

  return (
    <div className={styles.dashboard}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo}>
          <span className={styles.logoText}>ERA</span>
        </div>

        <nav className={styles.sidebarNav}>
          <button
            className={`${styles.navItem} ${activeTab === 'recent' ? styles.navItemActive : ''}`}
            onClick={() => setActiveTab('recent')}
            id="nav-recent"
          >
            <span>🗂️</span> Recent Boards
          </button>
          <button
            className={`${styles.navItem} ${activeTab === 'templates' ? styles.navItemActive : ''}`}
            onClick={() => setActiveTab('templates')}
            id="nav-templates"
          >
            <span>📐</span> Templates ({TEMPLATE_LIBRARY.length})
          </button>
        </nav>

        <div className={styles.sidebarDivider} />

        <div className={styles.sidebarFooter}>
          {user && (
            <div className={styles.userInfo}>
              <div className={styles.userAvatar}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className={styles.userDetails}>
                <span className={styles.userName}>{user.name}</span>
                <span className={styles.userEmail}>{user.email}</span>
              </div>
            </div>
          )}
          <button className={styles.logoutBtn} onClick={logout} id="logout-btn">
            ⬅ Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className={styles.main}>
        {/* Top bar */}
        <div className={styles.topBar}>
          <div className={styles.topBarLeft}>
            <h1 className={styles.pageTitle}>
              {activeTab === 'recent' ? 'Your Boards' : 'Architecture Templates'}
            </h1>
          </div>
          <div className={styles.topBarRight}>
            <input
              className={`input ${styles.searchInput}`}
              placeholder="Search boards or templates..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              id="dashboard-search"
            />
            <button
              className="btn btn-primary"
              onClick={() => createBoard('blank', 'Untitled Architecture')}
              id="create-board-btn"
            >
              + New Board
            </button>
          </div>
        </div>

        {/* Stats bar */}
        <div className={styles.statsBar}>
          {[
            { label: 'Boards', value: boards.length.toString(), icon: '🗂️', color: '#4f8ef7' },
            { label: 'Components', value: boards.reduce((s, b) => s + (b.nodeCount || 0), 0).toString(), icon: '⚙️', color: '#00d4ff' },
            { label: 'Templates Available', value: TEMPLATE_LIBRARY.length.toString(), icon: '📐', color: '#7c3aed' },
            { label: 'Simulations Run', value: boards.length > 0 ? (boards.length * 3).toString() : '0', icon: '⚡', color: '#10b981' },
          ].map(stat => (
            <div key={stat.label} className={styles.statCard}>
              <span className={styles.statIcon}>{stat.icon}</span>
              <div>
                <div className={styles.statValue} style={{color: stat.color}}>{stat.value}</div>
                <div className={styles.statLabel}>{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'recent' ? (
          <div className={styles.content}>
            {filteredBoards.length === 0 ? (
              <div className={styles.empty}>
                <div className={styles.emptyIcon}>🎨</div>
                <h3 className={styles.emptyTitle}>No boards yet</h3>
                <p className={styles.emptyDesc}>Create a new board or start from a template to design your first architecture</p>
                <div style={{display:'flex',gap:12,marginTop:16}}>
                  <button className="btn btn-primary" onClick={() => createBoard('blank', 'My Architecture')}>
                    + Create Blank Board
                  </button>
                  <button className="btn btn-secondary" onClick={() => setActiveTab('templates')}>
                    Browse Templates
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.boardsGrid}>
                {/* New board card */}
                <button
                  className={styles.newBoardCard}
                  onClick={() => createBoard('blank', 'Untitled Architecture')}
                  id="new-board-card"
                >
                  <div className={styles.newBoardIcon}>+</div>
                  <span>New Board</span>
                </button>

                {filteredBoards.map(board => (
                  <div
                    key={board.id}
                    className={styles.boardCard}
                    onClick={() => openBoard(board)}
                  >
                    <div className={styles.boardThumbnail}>
                      <div className={styles.boardThumbnailContent}>
                        {TEMPLATE_LIBRARY.find(t => t.id === board.template)?.icon || '🗂️'}
                      </div>
                    </div>
                    <div className={styles.boardInfo}>
                      <h3 className={styles.boardName}>{board.name}</h3>
                      <div className={styles.boardMeta}>
                        <span>{board.nodeCount || 0} nodes</span>
                        <span>•</span>
                        <span>{formatTime(board.updatedAt)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className={styles.content}>
            {/* Category Chips */}
            <div className={styles.templateCategories} style={{ flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
              {TEMPLATE_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  className="chip"
                  onClick={() => setSelectedCategory(cat.id)}
                  style={{
                    background: selectedCategory === cat.id ? 'rgba(79,142,247,0.25)' : 'rgba(255,255,255,0.04)',
                    color: selectedCategory === cat.id ? '#4f8ef7' : 'rgba(240,244,255,0.8)',
                    border: selectedCategory === cat.id ? '1px solid #4f8ef7' : '1px solid transparent',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>

            {/* Difficulty Filter */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Difficulty:</span>
              {['all', 'beginner', 'intermediate', 'advanced'].map(diff => (
                <button
                  key={diff}
                  className="chip"
                  onClick={() => setSelectedDifficulty(diff)}
                  style={{
                    textTransform: 'capitalize',
                    background: selectedDifficulty === diff ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.03)',
                    color: selectedDifficulty === diff ? '#9d68f5' : 'rgba(240,244,255,0.8)',
                    border: selectedDifficulty === diff ? '1px solid #9d68f5' : '1px solid transparent',
                    cursor: 'pointer'
                  }}
                >
                  {diff}
                </button>
              ))}
            </div>

            <div className={styles.templatesGrid}>
              {filteredTemplates.map(template => (
                <div key={template.id} className={styles.templateCard}>
                  <div className={styles.templateHeader}>
                    <span className={styles.templateIcon}>{template.icon}</span>
                    <span className={`badge ${
                      template.difficulty === 'beginner' ? 'badge-green' :
                      template.difficulty === 'intermediate' ? 'badge-orange' :
                      'badge-red'
                    }`}>
                      {template.difficulty}
                    </span>
                  </div>
                  <h3 className={styles.templateName}>{template.name}</h3>
                  <p className={styles.templateDesc}>{template.description}</p>
                  <div className={styles.templateTags}>
                    {template.tags.map(tag => (
                      <span key={tag} className="chip" style={{fontSize:'0.7rem', padding:'2px 8px'}}>#{tag}</span>
                    ))}
                  </div>
                  <div className={styles.templateStats}>
                    <span>⚙️ {template.nodes.length} nodes</span>
                    <span>🔗 {template.edges.length} edges</span>
                  </div>
                  <button
                    className={`btn btn-primary ${styles.templateBtn}`}
                    onClick={() => createBoard(template.id, template.name)}
                    id={`use-template-${template.id}`}
                  >
                    Use Template →
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
