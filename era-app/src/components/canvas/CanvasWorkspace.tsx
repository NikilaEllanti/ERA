'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import ReactFlow, {
  Node, Edge, Controls, MiniMap, Background, BackgroundVariant,
  addEdge, Connection, useNodesState, useEdgesState, ReactFlowProvider,
  NodeTypes, Panel, MarkerType, getBezierPath, EdgeProps, BaseEdge, getSimpleBezierPath,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { getSimulationEngine, SimNode, SimulationState, FAILURE_TYPES, FailureType } from '@/lib/simulation-engine';
import { NODE_DEFINITIONS } from '@/lib/templates';
import { TEMPLATE_LIBRARY } from '@/lib/templates-library';
import ComponentLibrary from './ComponentLibrary';
import AIPanel from './AIPanel';
import MetricsDashboard from './MetricsDashboard';
import SimulationControls from './SimulationControls';
import FailureInjectionPanel from './FailureInjectionPanel';
import InterviewMode from './InterviewMode';
import TestingPanel from './TestingPanel';
import PresentationMode from './PresentationMode';
import ArchNode from '../nodes/ArchNode';
import styles from './CanvasWorkspace.module.css';

const NODE_TYPES: NodeTypes = {
  archNode: ArchNode,
};

// Custom animated edge
function AnimatedEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style, markerEnd, data }: EdgeProps) {
  const [edgePath] = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition });
  
  return (
    <>
      <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} style={{
        ...style,
        stroke: data?.active ? '#4f8ef7' : 'rgba(79,142,247,0.35)',
        strokeWidth: data?.active ? 2.5 : 1.5,
        strokeDasharray: '8,4',
        animation: data?.active ? 'dashFlow 1.5s linear infinite' : 'dashFlow 3s linear infinite',
        filter: data?.active ? 'drop-shadow(0 0 4px rgba(79,142,247,0.6))' : undefined,
      }} />
    </>
  );
}

const EDGE_TYPES = {
  animated: AnimatedEdge,
};

type PanelType = 'ai' | 'metrics' | 'failures' | 'interview' | 'testing' | null;

interface CanvasWorkspaceProps {
  boardId: string;
  templateId: string;
}

const BOARD_KEY = (id: string) => `era_board_${id}`;

export default function CanvasWorkspace({ boardId, templateId }: CanvasWorkspaceProps) {
  const engine = getSimulationEngine();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [simState, setSimState] = useState<SimulationState>(engine.getState());
  const [simNodes, setSimNodes] = useState<SimNode[]>([]);
  const [activePanel, setActivePanel] = useState<PanelType>('ai');
  const [isPresenting, setIsPresenting] = useState(false);
  const [boardName, setBoardName] = useState('Untitled Architecture');
  const [editingName, setEditingName] = useState(false);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [isSaved, setIsSaved] = useState(true);
  const autoSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Load template or saved board
  useEffect(() => {
    const saved = localStorage.getItem(BOARD_KEY(boardId));
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setNodes(data.nodes || []);
        setEdges(data.edges || []);
        setBoardName(data.name || 'Untitled Architecture');
        const simNodes: SimNode[] = (data.nodes || []).map((n: Node) => ({
          id: n.id,
          type: n.data?.nodeType || 'service',
          label: n.data?.label || 'Service',
          position: n.position,
          config: n.data?.config || {},
          metrics: n.data?.metrics || {} as SimNode['metrics'],
          status: 'healthy' as const,
        }));
        engine.setNodes(simNodes);
        engine.setEdges(data.edges || []);
        return;
      } catch {}
    }

    // Load from template
    const template = TEMPLATE_LIBRARY.find(t => t.id === templateId);
    if (template && template.nodes.length > 0) {
      setBoardName(template.name);
      const rfNodes = template.nodes.map(sn => ({
        id: sn.id,
        type: 'archNode',
        position: sn.position,
        data: {
          nodeType: sn.type,
          label: sn.label,
          config: sn.config,
          def: NODE_DEFINITIONS.find(d => d.type === sn.type),
        },
      }));
      const rfEdges = template.edges.map(se => ({
        id: se.id,
        source: se.source,
        target: se.target,
        type: 'animated',
        label: se.label,
        markerEnd: { type: MarkerType.ArrowClosed, color: 'rgba(79,142,247,0.6)', width: 15, height: 15 },
        data: { active: false },
      }));
      setNodes(rfNodes);
      setEdges(rfEdges);
      const simNodes: SimNode[] = template.nodes.map(sn => ({
        ...sn,
        metrics: {} as SimNode['metrics'],
        status: 'healthy' as const,
      }));
      engine.setNodes(simNodes);
      engine.setEdges(template.edges.map(e => ({ ...e, throughput: 0 })));
    }
  }, [boardId, templateId]);

  // Subscribe to simulation updates
  useEffect(() => {
    const unsub = engine.subscribe((state, nodes, edges) => {
      setSimState({ ...state });
      setSimNodes(nodes);
      // Update node data with live metrics
      setNodes(prev => prev.map(n => ({
        ...n,
        data: {
          ...n.data,
          metrics: nodes.find(sn => sn.id === n.id)?.metrics,
          status: nodes.find(sn => sn.id === n.id)?.status,
          simRunning: state.running,
        }
      })));
      // Activate edges when sim is running
      if (state.running) {
        setEdges(prev => prev.map(e => ({
          ...e,
          data: { ...e.data, active: true }
        })));
      }
    });
    return unsub;
  }, [engine]);

  // Auto-save
  const save = useCallback(() => {
    const data = { nodes, edges, name: boardName, updatedAt: Date.now() };
    localStorage.setItem(BOARD_KEY(boardId), JSON.stringify(data));
    setIsSaved(true);
  }, [nodes, edges, boardName, boardId]);

  useEffect(() => {
    setIsSaved(false);
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(save, 1500);
  }, [nodes, edges, boardName, save]);

  const onConnect = useCallback((connection: Connection) => {
    const newEdge = {
      ...connection,
      id: `edge-${Date.now()}`,
      type: 'animated',
      markerEnd: { type: MarkerType.ArrowClosed, color: 'rgba(79,142,247,0.6)', width: 15, height: 15 },
      data: { active: simState.running },
    };
    setEdges(prev => addEdge(newEdge, prev));
    if (connection.source && connection.target) {
      engine.setEdges([...engine.getEdges(), {
        id: newEdge.id,
        source: connection.source,
        target: connection.target,
        throughput: 0,
      }]);
    }
  }, [simState.running, engine]);

  const addNodeToCanvas = useCallback((nodeType: string) => {
    const def = NODE_DEFINITIONS.find(d => d.type === nodeType);
    if (!def) return;

    const id = `${nodeType}-${Date.now()}`;
    const newNode: Node = {
      id,
      type: 'archNode',
      position: { x: 300 + Math.random() * 200, y: 200 + Math.random() * 200 },
      data: {
        nodeType: def.type,
        label: def.label,
        config: def.defaultConfig,
        def,
      },
    };
    setNodes(prev => [...prev, newNode]);
    
    // Add to simulation engine
    engine.addNode({
      id,
      type: def.type,
      label: def.label,
      position: newNode.position,
      config: def.defaultConfig,
      metrics: {} as SimNode['metrics'],
      status: 'healthy',
    });

    showToast(`Added ${def.label} to canvas`);
  }, [engine]);

  const loadArchitecture = useCallback((newNodes: any[], newEdges: any[]) => {
    const rfNodes = newNodes.map(sn => ({
      id: sn.id,
      type: 'archNode',
      position: sn.position,
      data: {
        nodeType: sn.type,
        label: sn.label,
        config: sn.config || {},
        def: NODE_DEFINITIONS.find(d => d.type === sn.type),
      },
    }));

    const rfEdges = newEdges.map(se => ({
      id: se.id,
      source: se.source,
      target: se.target,
      type: 'animated',
      label: se.label,
      markerEnd: { type: MarkerType.ArrowClosed, color: 'rgba(79,142,247,0.6)', width: 15, height: 15 },
      data: { active: simState.running },
    }));

    setNodes(rfNodes);
    setEdges(rfEdges);

    // Update simulation engine
    const simNodes: SimNode[] = newNodes.map(sn => ({
      id: sn.id,
      type: sn.type,
      label: sn.label,
      position: sn.position,
      config: sn.config || {},
      metrics: {} as SimNode['metrics'],
      status: 'healthy' as const,
    }));
    engine.setNodes(simNodes);
    engine.setEdges(newEdges.map(e => ({
      id: e.id,
      source: e.source,
      target: e.target,
      label: e.label,
      protocol: e.protocol || 'http',
      throughput: 0,
    })));

    showToast('AI Architecture generated successfully! Flow loaded.');
  }, [engine, simState.running]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node.id);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const deleteSelectedNode = useCallback(() => {
    if (!selectedNode) return;
    setNodes(prev => prev.filter(n => n.id !== selectedNode));
    setEdges(prev => prev.filter(e => e.source !== selectedNode && e.target !== selectedNode));
    engine.removeNode(selectedNode);
    setSelectedNode(null);
  }, [selectedNode, engine]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedNode && !editingName) {
        deleteSelectedNode();
      }
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        save();
        showToast('Saved ✓');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNode, editingName, deleteSelectedNode, save]);

  const nodeTypes = simNodes.length > 0
    ? [...new Set(simNodes.map(n => n.type))]
    : [...new Set(nodes.map(n => n.data?.nodeType).filter(Boolean))];

  return (
    <div className={styles.workspace}>
      {/* ── Top Toolbar ── */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <button className={styles.logoBtn} onClick={() => window.location.href = '/dashboard'}>
            <span className={styles.logoMini}>ERA</span>
          </button>
          <div className={styles.breadcrumb}>
            <span className={styles.breadcrumbSep}>/</span>
            {editingName ? (
              <input
                className={styles.nameInput}
                value={boardName}
                onChange={e => setBoardName(e.target.value)}
                onBlur={() => setEditingName(false)}
                onKeyDown={e => e.key === 'Enter' && setEditingName(false)}
                autoFocus
              />
            ) : (
              <button className={styles.boardName} onClick={() => setEditingName(true)}>
                {boardName}
              </button>
            )}
            <span className={styles.saveStatus}>{isSaved ? '✓' : '...'}</span>
          </div>
        </div>

        <div className={styles.toolbarCenter}>
          {/* Simulation controls */}
          <SimulationControls
            simState={simState}
            onStart={() => engine.start()}
            onPause={() => engine.pause()}
            onStop={() => engine.stop()}
            onSpeedChange={(s) => engine.setSpeed(s)}
          />
        </div>

        <div className={styles.toolbarRight}>
          {/* Panel toggles */}
          {([
            { id: 'ai', icon: '🤖', label: 'AI Copilot' },
            { id: 'metrics', icon: '📊', label: 'Metrics' },
            { id: 'failures', icon: '💥', label: 'Failures' },
            { id: 'interview', icon: '🎯', label: 'Interview' },
            { id: 'testing', icon: '🧪', label: 'Testing' },
          ] as { id: PanelType; icon: string; label: string }[]).map(p => (
            <button
              key={p.id}
              className={`${styles.panelToggle} ${activePanel === p.id ? styles.panelToggleActive : ''}`}
              onClick={() => setActivePanel(activePanel === p.id ? null : p.id)}
              id={`panel-toggle-${p.id}`}
              title={p.label}
            >
              {p.icon}
              <span className={styles.panelToggleLabel}>{p.label}</span>
            </button>
          ))}

          <div className={styles.toolbarDivider} />

          <button
            className={`${styles.toolbarBtn} ${showGrid ? styles.toolbarBtnActive : ''}`}
            onClick={() => setShowGrid(!showGrid)}
            title="Toggle grid"
          >
            ⊞
          </button>

          <button
            className="btn btn-secondary btn-sm"
            style={{ marginRight: '8px' }}
            onClick={() => setIsPresenting(true)}
            id="presentation-btn"
          >
            🎙️ Present
          </button>

          <button
            className="btn btn-secondary btn-sm"
            onClick={() => { save(); showToast('Saved!'); }}
            id="save-btn"
          >
            💾 Save
          </button>
        </div>
      </div>

      <div className={styles.canvasLayout}>
        {/* ── Left: Component Library ── */}
        <ComponentLibrary onAddNode={addNodeToCanvas} />

        {/* ── Center: Canvas ── */}
        <div className={styles.canvasArea}>
          {/* Global metrics bar */}
          {simState.running && (
            <div className={styles.metricsBar}>
              <div className={styles.metricsBarItem}>
                <span className={styles.metricsBarLabel}>QPS</span>
                <span className={styles.metricsBarValue} style={{color:'#4f8ef7'}}>
                  {simState.globalQPS.toFixed(0)}
                </span>
              </div>
              <div className={styles.metricsBarItem}>
                <span className={styles.metricsBarLabel}>p99 Latency</span>
                <span className={styles.metricsBarValue} style={{color: simState.globalLatencyP99 > 500 ? '#ef4444' : '#10b981'}}>
                  {simState.globalLatencyP99.toFixed(1)}ms
                </span>
              </div>
              <div className={styles.metricsBarItem}>
                <span className={styles.metricsBarLabel}>Error Rate</span>
                <span className={styles.metricsBarValue} style={{color: simState.globalErrorRate > 0.05 ? '#ef4444' : '#10b981'}}>
                  {(simState.globalErrorRate * 100).toFixed(2)}%
                </span>
              </div>
              <div className={styles.metricsBarItem}>
                <span className={styles.metricsBarLabel}>Availability</span>
                <span className={styles.metricsBarValue} style={{color: simState.globalAvailability < 99 ? '#ef4444' : '#10b981'}}>
                  {simState.globalAvailability.toFixed(3)}%
                </span>
              </div>
              <div className={styles.metricsBarItem}>
                <span className={styles.metricsBarLabel}>Est. Cost</span>
                <span className={styles.metricsBarValue} style={{color:'#f59e0b'}}>
                  ${simState.estimatedMonthlyCost.toLocaleString()}/mo
                </span>
              </div>
              {simState.activeFailures.length > 0 && (
                <div className={styles.metricsBarFailure}>
                  {simState.activeFailures.map(f => (
                    <span key={f} className={styles.failureBadge}>
                      💥 {(FAILURE_TYPES as Record<string, {label: string}>)[f]?.label || f}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={NODE_TYPES}
            edgeTypes={EDGE_TYPES}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            minZoom={0.1}
            maxZoom={3}
            defaultEdgeOptions={{
              type: 'animated',
              markerEnd: { type: MarkerType.ArrowClosed, color: 'rgba(79,142,247,0.6)', width: 15, height: 15 },
            }}
            className={styles.reactFlow}
          >
            <Background
              variant={showGrid ? BackgroundVariant.Dots : BackgroundVariant.Cross}
              gap={showGrid ? 20 : 40}
              size={showGrid ? 1 : 0.5}
              color="rgba(79,142,247,0.08)"
            />
            <Controls
              style={{
                background: 'rgba(15,22,41,0.9)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 10,
              }}
            />
            <MiniMap
              style={{
                background: 'rgba(15,22,41,0.9)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 10,
              }}
              nodeColor={(node) => {
                const def = NODE_DEFINITIONS.find(d => d.type === node.data?.nodeType);
                return def?.borderColor || '#4f8ef7';
              }}
              maskColor="rgba(6,8,16,0.7)"
            />
            
            {/* Empty state hint */}
            {nodes.length === 0 && (
              <Panel position="top-center">
                <div className={styles.emptyHint}>
                  <span>🤖</span>
                  <span>Type a prompt in the AI panel → or drag components from the left sidebar</span>
                </div>
              </Panel>
            )}
          </ReactFlow>

          {/* Data flow particles overlay */}
          {simState.running && simState.dataPackets.length > 0 && (
            <div className={styles.particleOverlay} style={{pointerEvents:'none', position:'absolute', inset:0}}>
              {/* Particles are rendered by React Flow node animations */}
            </div>
          )}
        </div>

        {/* ── Right: Active Panel ── */}
        {activePanel && (
          <div className={styles.rightPanel}>
            {activePanel === 'ai' && (
              <AIPanel
                nodeTypes={nodeTypes as string[]}
                onAddNodes={addNodeToCanvas}
                onLoadArchitecture={loadArchitecture}
                simState={simState}
                onClose={() => setActivePanel(null)}
              />
            )}
            {activePanel === 'metrics' && (
              <MetricsDashboard
                simState={simState}
                simNodes={simNodes}
                onClose={() => setActivePanel(null)}
              />
            )}
            {activePanel === 'failures' && (
              <FailureInjectionPanel
                simState={simState}
                onInject={(type) => engine.injectFailure(type as FailureType)}
                onClear={(type) => engine.clearFailure(type as FailureType)}
                onClearAll={() => engine.clearAllFailures()}
                onClose={() => setActivePanel(null)}
              />
            )}
            {activePanel === 'interview' && (
              <InterviewMode
                nodeTypes={nodeTypes as string[]}
                simState={simState}
                onClose={() => setActivePanel(null)}
              />
            )}
            {activePanel === 'testing' && (
              <TestingPanel
                simState={simState}
                simNodes={simNodes}
                onInjectFailure={(type) => engine.injectFailure(type as FailureType)}
                onClearAllFailures={() => engine.clearAllFailures()}
                onClose={() => setActivePanel(null)}
              />
            )}
          </div>
        )}
      </div>

      {isPresenting && (
        <PresentationMode
          nodes={nodes}
          edges={edges}
          simState={simState}
          onClose={() => setIsPresenting(false)}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className={styles.toast}>
          {toast}
        </div>
      )}

      <style>{`
        @keyframes dashFlow {
          to { stroke-dashoffset: -24; }
        }
      `}</style>
    </div>
  );
}
