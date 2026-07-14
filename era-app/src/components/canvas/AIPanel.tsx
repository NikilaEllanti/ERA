'use client';
import { useState, useRef, useEffect } from 'react';
import { generateArchitectureFromPrompt, getCopilotResponse, AIMessage, analyzeArchitecture, getDynamicFAQs } from '@/lib/ai-client';
import { SimulationState } from '@/lib/simulation-engine';
import styles from './AIPanel.module.css';

interface AIPanelProps {
  nodeTypes: string[];
  simState: SimulationState;
  onAddNodes: (type: string) => void;
  onLoadArchitecture?: (nodes: any[], edges: any[]) => void;
  onClose: () => void;
}

export default function AIPanel({ nodeTypes, simState, onAddNodes, onLoadArchitecture, onClose }: AIPanelProps) {
  const [activeSubTab, setActiveSubTab] = useState<'chat' | 'audit'>('chat');
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      role: 'assistant',
      content: "Hello! I am ERA, your distributed systems design copilot. What are you building today? Try typing: `URL Shortener`, `Chat App`, or ask me how to scale your system.",
      timestamp: Date.now(),
      type: 'general'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText]);

  // Compute live analysis
  const analysis = analyzeArchitecture(nodeTypes);

  // Dynamic FAQs based on active components
  const activeFaqs = (() => {
    const faqs = [];
    if (nodeTypes.includes('redis')) faqs.push(...getDynamicFAQs('redis_added'));
    if (nodeTypes.includes('kafka')) faqs.push(...getDynamicFAQs('kafka_added'));
    if (nodeTypes.includes('postgresql')) faqs.push(...getDynamicFAQs('postgresql_added'));
    if (nodeTypes.includes('load_balancer')) faqs.push(...getDynamicFAQs('load_balancer_added'));
    if (nodeTypes.includes('api_gateway')) faqs.push(...getDynamicFAQs('api_gateway_added'));
    if (simState.activeFailures.length > 0) faqs.push(...getDynamicFAQs('failure_injected'));
    // Deduplicate FAQs by question
    const seen = new Set();
    return faqs.filter(f => {
      const duplicate = seen.has(f.question);
      seen.add(f.question);
      return !duplicate;
    });
  })();

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg, timestamp: Date.now() }]);
    setLoading(true);

    try {
      if (/generate|build|create|design/i.test(userMsg) || nodeTypes.length === 0) {
        // Architecture generation flow
        setStreamingText('');
        const result = await generateArchitectureFromPrompt(userMsg, (token) => {
          setStreamingText(prev => prev + token);
        });

        // Add nodes & edges to canvas
        if (result.nodes && result.edges && onLoadArchitecture) {
          onLoadArchitecture(result.nodes, result.edges);
        } else {
          result.nodeTypes.forEach((type, idx) => {
            setTimeout(() => {
              onAddNodes(type);
            }, idx * 150);
          });
        }

        setMessages(prev => [...prev, {
          role: 'assistant',
          content: result.explanation,
          timestamp: Date.now(),
          type: 'analysis'
        }]);
        setStreamingText('');
      } else {
        // General copilot response
        setStreamingText('');
        const response = await getCopilotResponse(
          userMsg,
          {
            nodeTypes,
            activeFailures: simState.activeFailures,
            metrics: {
              qps: simState.globalQPS,
              latency: simState.globalLatencyP99,
              errorRate: simState.globalErrorRate,
            }
          },
          (token) => {
            setStreamingText(prev => prev + token);
          }
        );

        setMessages(prev => [...prev, {
          role: 'assistant',
          content: response,
          timestamp: Date.now(),
          type: 'general'
        }]);
        setStreamingText('');
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Oops! I encountered an error. Please try again.",
        timestamp: Date.now(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  const renderMarkdown = (text: string) => {
    return text.split('\n').map((line, idx) => {
      if (line.startsWith('## ')) {
        return <h3 key={idx} className={styles.mdH3}>{line.replace('## ', '')}</h3>;
      }
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return <li key={idx} className={styles.mdLi}>{line.substring(2)}</li>;
      }
      if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={idx} className={styles.mdP}><strong>{line.replace(/\*\*/g, '')}</strong></p>;
      }
      const parts = line.split(/(\*\*.*?\*\*)/);
      return (
        <p key={idx} className={styles.mdP}>
          {parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={pIdx}>{part.replace(/\*\*/g, '')}</strong>;
            }
            return part;
          })}
        </p>
      );
    });
  };

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <div className={styles.headerTitle}>
          <span>🤖</span>
          <div>
            <h3>ERA Copilot</h3>
            <span className={styles.statusOnline}>Reasoning Engine Ready</span>
          </div>
        </div>
        <button className={styles.closeBtn} onClick={onClose}>×</button>
      </div>

      {/* Sub tabs */}
      <div className={styles.subTabs}>
        <button
          className={`${styles.subTab} ${activeSubTab === 'chat' ? styles.subTabActive : ''}`}
          onClick={() => setActiveSubTab('chat')}
          id="copilot-tab-chat"
        >
          Chat Copilot
        </button>
        <button
          className={`${styles.subTab} ${activeSubTab === 'audit' ? styles.subTabActive : ''}`}
          onClick={() => setActiveSubTab('audit')}
          id="copilot-tab-audit"
        >
          AI Audit ({nodeTypes.length > 0 ? analysis.score.overall : 0}%)
        </button>
      </div>

      {activeSubTab === 'chat' ? (
        <>
          <div className={styles.chatArea}>
            {messages.map((msg, idx) => (
              <div key={idx} className={`${styles.message} ${styles[msg.role]}`}>
                <div className={styles.msgBubble}>
                  {renderMarkdown(msg.content)}
                </div>
                <span className={styles.msgTime}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}

            {streamingText && (
              <div className={`${styles.message} ${styles.assistant}`}>
                <div className={styles.msgBubble}>
                  {renderMarkdown(streamingText)}
                </div>
              </div>
            )}

            {loading && !streamingText && (
              <div className={styles.loader}>
                <div className={styles.dot} />
                <div className={styles.dot} />
                <div className={styles.dot} />
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <form className={styles.inputArea} onSubmit={handleSend}>
            <input
              className={styles.chatInput}
              placeholder="Ask ERA or type prompt to generate..."
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={loading}
              id="copilot-input"
            />
            <button className={styles.sendBtn} type="submit" disabled={loading} id="copilot-send">
              Send
            </button>
          </form>
        </>
      ) : (
        <div className={styles.auditArea}>
          {nodeTypes.length === 0 ? (
            <div className={styles.empty}>
              <span>📐</span>
              <p>Add some component nodes to run the real-time AI architectural audit.</p>
            </div>
          ) : (
            <div className={styles.auditScroll}>
              {/* Overall radial score card */}
              <div className={styles.scoreCard}>
                <div className={styles.scoreRow}>
                  <div className={styles.scoreCircle} style={{
                    borderColor: analysis.score.overall >= 80 ? '#10b981' : analysis.score.overall >= 60 ? '#f59e0b' : '#ef4444'
                  }}>
                    <span>{analysis.score.overall}</span>
                  </div>
                  <div>
                    <h4>Architecture Score</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Evaluated across 4 pillars of engineering
                    </span>
                  </div>
                </div>

                <div className={styles.pillarGrid}>
                  {[
                    { label: 'Scalability', val: analysis.score.scalability },
                    { label: 'Availability', val: analysis.score.availability },
                    { label: 'Consistency', val: analysis.score.consistency },
                    { label: 'Cost Efficiency', val: analysis.score.costEfficiency },
                  ].map(p => (
                    <div key={p.label} className={styles.pillar}>
                      <span className={styles.pillarLabel}>{p.label}</span>
                      <div className={styles.pillarBar}>
                        <div className={styles.pillarFill} style={{ width: `${p.val}%` }} />
                      </div>
                      <span className={styles.pillarVal}>{p.val}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CAP trade-offs */}
              <div className={styles.sectionCard}>
                <h5>⚖️ CAP Tradeoffs Choice</h5>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: 4 }}>
                  {analysis.capTradeoffs}
                </p>
              </div>

              {/* Bottlenecks alerts */}
              {analysis.bottlenecks.length > 0 && (
                <div className={styles.sectionCard}>
                  <h5>⚠️ Critical Bottlenecks</h5>
                  <ul className={styles.bulletList}>
                    {analysis.bottlenecks.map((b, i) => (
                      <li key={i} className={styles.bulletItem} style={{ color: '#f87171' }}>
                        🔴 {b}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendations */}
              {analysis.recommendations.length > 0 && (
                <div className={styles.sectionCard}>
                  <h5>💡 AI Recommendations</h5>
                  <ul className={styles.bulletList}>
                    {analysis.recommendations.map((r, i) => (
                      <li key={i} className={styles.bulletItem}>
                        🔧 {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Contextual FAQs */}
              {activeFaqs.length > 0 && (
                <div className={styles.sectionCard}>
                  <h5>❓ Context FAQs & Insights</h5>
                  <div className={styles.faqList}>
                    {activeFaqs.map((faq, i) => (
                      <div key={i} className={styles.faqItem}>
                        <span className={styles.faqQuestion}>{faq.question}</span>
                        <p className={styles.faqAnswer}>{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
