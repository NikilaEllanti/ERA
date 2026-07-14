'use client';
import { useState, useEffect, useRef } from 'react';
import { SimulationState } from '@/lib/simulation-engine';
import styles from './PresentationMode.module.css';

interface PresentationModeProps {
  nodes: any[];
  edges: any[];
  simState: SimulationState;
  onClose: () => void;
}

export default function PresentationMode({
  nodes,
  edges,
  simState,
  onClose,
}: PresentationModeProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [spotlightIndex, setSpotlightIndex] = useState<number | null>(null);
  const [hideUI, setHideUI] = useState(false);
  const [presenterNotesOpen, setPresenterNotesOpen] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const presenterWindowRef = useRef<Window | null>(null);

  // Synced shortcuts
  useEffect(() => {
    const handleKeys = (e: KeyboardEvent) => {
      if (e.key === 'r' || e.key === 'R') toggleRecording();
      if (e.key === 'f' || e.key === 'F') toggleFullscreen();
      if (e.key === 'p' || e.key === 'P') openPresenterNotes();
      if (e.key === 's' || e.key === 'S') toggleSpotlight();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeys);
    return () => window.removeEventListener('keydown', handleKeys);
  }, [isRecording, spotlightIndex, presenterNotesOpen]);

  // Sync talking points directly into open notes window
  useEffect(() => {
    if (presenterWindowRef.current && !presenterWindowRef.current.closed) {
      updatePresenterNotesWindowContent();
    }
  }, [nodes, spotlightIndex]);

  // Recording timer
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingSeconds(s => s + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setRecordingSeconds(0);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRecording]);

  const toggleRecording = async () => {
    if (isRecording) {
      // Stop recording
      if (mediaRecorderRef.current) mediaRecorderRef.current.stop();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
      setIsRecording(false);
    } else {
      try {
        // Request Screen Capture & Audio
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        let combinedStream = screenStream;
        
        try {
          const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const tracks = [...screenStream.getVideoTracks(), ...audioStream.getAudioTracks()];
          combinedStream = new MediaStream(tracks);
        } catch {
          console.warn("Audio mic access denied, recording video only.");
        }

        streamRef.current = combinedStream;
        chunksRef.current = [];

        const recorder = new MediaRecorder(combinedStream, { mimeType: 'video/webm;codecs=vp9' });
        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
        };

        recorder.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `era-session-${Date.now()}.webm`;
          a.click();
          URL.revokeObjectURL(url);
        };

        mediaRecorderRef.current = recorder;
        recorder.start();
        setIsRecording(true);
      } catch (err) {
        console.error("Screen recording setup failed:", err);
      }
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const toggleSpotlight = () => {
    if (spotlightIndex === null) {
      setSpotlightIndex(0);
      highlightNodeOnCanvas(nodes[0]?.id);
    } else if (spotlightIndex < nodes.length - 1) {
      setSpotlightIndex(idx => idx! + 1);
      highlightNodeOnCanvas(nodes[spotlightIndex + 1]?.id);
    } else {
      setSpotlightIndex(null);
      resetNodeHighlights();
    }
  };

  const highlightNodeOnCanvas = (nodeId: string) => {
    if (!nodeId) return;
    const elements = document.querySelectorAll('.react-flow__node');
    elements.forEach((el) => {
      const htmlEl = el as HTMLElement;
      if (htmlEl.getAttribute('data-id') === nodeId) {
        htmlEl.style.opacity = '1';
        htmlEl.style.transform = 'scale(1.15)';
        htmlEl.style.zIndex = '1000';
        htmlEl.style.boxShadow = '0 0 30px #4f8ef7';
      } else {
        htmlEl.style.opacity = '0.25';
        htmlEl.style.transform = 'scale(0.9)';
        htmlEl.style.boxShadow = 'none';
      }
    });
  };

  const resetNodeHighlights = () => {
    const elements = document.querySelectorAll('.react-flow__node');
    elements.forEach((el) => {
      const htmlEl = el as HTMLElement;
      htmlEl.style.opacity = '1';
      htmlEl.style.transform = 'none';
      htmlEl.style.boxShadow = 'none';
    });
  };

  // Build presenter script talking notes
  const getSpeakingNotes = () => {
    if (nodes.length === 0) return "<p>Add components to generate speaking notes.</p>";
    
    return nodes.map((node, index) => {
      const type = node.data?.nodeType || 'service';
      const label = node.data?.label || 'Component';
      const isHighlighted = spotlightIndex === index;

      return `
        <div class="note-section ${isHighlighted ? 'highlighted' : ''}">
          <h3>${index + 1}. ${label} (${type})</h3>
          <p><strong>Speaking Script:</strong> Let's take a look at the ${label} here. In our architecture layout, this functions as a critical ${type} layer to process inbound requests.</p>
          <ul>
            <li><strong>Design rationale:</strong> Selected to optimize distributed path throughput.</li>
            <li><strong>Failover metric:</strong> Keep an eye on p99 processing spikes under load tests.</li>
          </ul>
        </div>
      `;
    }).join('');
  };

  const openPresenterNotes = () => {
    const popup = window.open('', 'ERAPresenterConsole', 'width=500,height=600,scrollbars=yes');
    if (popup) {
      presenterWindowRef.current = popup;
      setPresenterNotesOpen(true);
      
      popup.document.write(`
        <html>
          <head>
            <title>ERA Presenter Script Console</title>
            <style>
              body {
                background: #0f1629;
                color: #f0f4ff;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                padding: 20px;
                margin: 0;
              }
              h2 { color: #4f8ef7; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px; }
              .note-section {
                padding: 12px;
                border-radius: 8px;
                background: rgba(255,255,255,0.03);
                border: 1px solid rgba(255,255,255,0.06);
                margin-bottom: 14px;
                transition: all 0.3s;
              }
              .highlighted {
                border-color: #4f8ef7;
                background: rgba(79, 142, 247, 0.15);
                box-shadow: 0 0 15px rgba(79, 142, 247, 0.2);
              }
              h3 { margin: 0 0 6px 0; font-size: 1rem; color: #fff; }
              p { font-size: 0.85rem; line-height: 1.4; color: rgba(255,255,255,0.7); }
              ul { margin: 8px 0 0 0; padding-left: 20px; font-size: 0.8rem; color: rgba(255,255,255,0.5); }
            </style>
          </head>
          <body>
            <h2>🎙️ ERA Presenter Console Script</h2>
            <div id="notes-container"></div>
          </body>
        </html>
      `);
      popup.document.close();
      updatePresenterNotesWindowContent();
    }
  };

  const updatePresenterNotesWindowContent = () => {
    if (presenterWindowRef.current) {
      const container = presenterWindowRef.current.document.getElementById('notes-container');
      if (container) {
        container.innerHTML = getSpeakingNotes();
      }
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className={styles.container}>
      {/* Dim Overlay when Spotlight is active */}
      {spotlightIndex !== null && (
        <div className={styles.dimBg} />
      )}

      {/* Control Toolbar Floating Console */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarBrand}>
          <span>🎙️ PRESENTING</span>
        </div>

        <div className={styles.toolbarGroup}>
          {/* Recording controls */}
          <button
            className={`${styles.recBtn} ${isRecording ? styles.recordingActive : ''}`}
            onClick={toggleRecording}
            title="Toggle Session Recording (R)"
          >
            <span className={styles.dot} />
            {isRecording ? formatTime(recordingSeconds) : 'Record'}
          </button>

          <button
            className={styles.toolBtn}
            onClick={openPresenterNotes}
            title="Open Presenter Console Notes (P)"
          >
            📋 Presenter Console
          </button>

          <button
            className={`${styles.toolBtn} ${spotlightIndex !== null ? styles.activeTool : ''}`}
            onClick={toggleSpotlight}
            title="Step-through Spotlight Focus (S)"
          >
            🔦 Spotlight {spotlightIndex !== null ? `(${spotlightIndex + 1}/${nodes.length})` : ''}
          </button>

          <button
            className={styles.toolBtn}
            onClick={() => {
              setHideUI(prev => !prev);
              const elements = ['aside', '.react-flow__controls', '.react-flow__minimap', `.${styles.toolbarBrand}`];
              elements.forEach(sel => {
                const el = document.querySelector(sel);
                if (el) {
                  (el as HTMLElement).style.display = hideUI ? 'flex' : 'none';
                }
              });
            }}
            title="Toggle Layout Clean (C)"
          >
            🖥️ {hideUI ? 'Show UI Panels' : 'Clean Presentation View'}
          </button>
        </div>

        <button className={styles.exitBtn} onClick={() => {
          resetNodeHighlights();
          onClose();
        }}>
          Exit Presentation
        </button>
      </div>
    </div>
  );
}
