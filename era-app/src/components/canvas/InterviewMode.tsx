'use client';
import { useState, useEffect } from 'react';
import { getInterviewQuestions, scoreAnswer, InterviewQuestion } from '@/lib/ai-client';
import { SimulationState } from '@/lib/simulation-engine';
import styles from './InterviewMode.module.css';

interface InterviewModeProps {
  nodeTypes: string[];
  simState: SimulationState;
  onClose: () => void;
}

export default function InterviewMode({ nodeTypes, simState, onClose }: InterviewModeProps) {
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [scoring, setScoring] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    feedback: string;
    improvements: string[];
  } | null>(null);

  useEffect(() => {
    const qs = getInterviewQuestions(nodeTypes, 4);
    setQuestions(qs);
    setCurrentIndex(0);
    setResult(null);
    setAnswer('');
  }, [nodeTypes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim() || scoring) return;

    setScoring(true);
    // Simulate scoring delay
    await new Promise(r => setTimeout(r, 1200));

    const currentQ = questions[currentIndex];
    const scoreResult = scoreAnswer(currentQ.question, answer);
    setResult(scoreResult);
    setScoring(false);
  };

  const handleNext = () => {
    setResult(null);
    setAnswer('');
    setCurrentIndex(prev => (prev + 1) % questions.length);
  };

  const currentQuestion = questions[currentIndex];

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <div className={styles.headerTitle}>
          <span>🎯</span>
          <div>
            <h3>Interview Mode</h3>
            <span className={styles.subtitle}>Test your design knowledge</span>
          </div>
        </div>
        <button className={styles.closeBtn} onClick={onClose}>×</button>
      </div>

      <div className={styles.scrollable}>
        {currentQuestion ? (
          <div className={styles.questionCard}>
            <div className={styles.cardHeader}>
              <span className={`badge ${
                currentQuestion.difficulty === 'easy' ? 'badge-green' :
                currentQuestion.difficulty === 'medium' ? 'badge-orange' :
                'badge-red'
              }`}>
                {currentQuestion.difficulty}
              </span>
              <span className={styles.category}>{currentQuestion.category}</span>
            </div>

            <h4 className={styles.questionText}>{currentQuestion.question}</h4>

            {currentQuestion.hints && currentQuestion.hints.length > 0 && (
              <div className={styles.hintSection}>
                <strong>💡 Hints:</strong>
                <ul>
                  {currentQuestion.hints.map((h, i) => <li key={i}>{h}</li>)}
                </ul>
              </div>
            )}

            {!result ? (
              <form onSubmit={handleSubmit} className={styles.form}>
                <textarea
                  className={styles.textarea}
                  placeholder="Type your system design answer here..."
                  value={answer}
                  onChange={e => setAnswer(e.target.value)}
                  disabled={scoring}
                  id="interview-answer"
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!answer.trim() || scoring}
                  id="interview-submit"
                >
                  {scoring ? 'Scoring answer...' : 'Submit Answer'}
                </button>
              </form>
            ) : (
              <div className={styles.resultSection}>
                <div className={styles.scoreRow}>
                  <div className={styles.scoreCircle} style={{
                    borderColor: result.score >= 80 ? '#10b981' : result.score >= 60 ? '#f59e0b' : '#ef4444'
                  }}>
                    <span className={styles.scoreNum}>{result.score}</span>
                    <span className={styles.scoreMax}>/100</span>
                  </div>
                  <div>
                    <h5 className={styles.resultTitle}>Feedback</h5>
                    <p className={styles.feedback}>{result.feedback}</p>
                  </div>
                </div>

                {result.improvements.length > 0 && (
                  <div className={styles.improvements}>
                    <h5>Suggested Improvements</h5>
                    <ul>
                      {result.improvements.map((imp, idx) => (
                        <li key={idx}>✏️ {imp}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {currentQuestion.followUps && currentQuestion.followUps.length > 0 && (
                  <div className={styles.followUps}>
                    <h5>Follow-up Questions</h5>
                    <ul>
                      {currentQuestion.followUps.map((fq, idx) => (
                        <li key={idx}>❓ {fq}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <button className="btn btn-secondary" onClick={handleNext} id="interview-next">
                  Next Question →
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className={styles.empty}>
            <span>🎯</span>
            <p>No questions generated. Add some component nodes to trigger questions.</p>
          </div>
        )}
      </div>
    </div>
  );
}
