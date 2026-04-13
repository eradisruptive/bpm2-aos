import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { partMap } from '../data/bmp2Parts'
import { pickRandomQuestions, testQuestions } from '../data/testQuestions'
import type { QuizQuestion } from '../types/bmp2'

function arraysMatch(left: number[], right: number[]) {
  if (left.length !== right.length) return false
  const sortedLeft = [...left].sort((a, b) => a - b)
  const sortedRight = [...right].sort((a, b) => a - b)
  return sortedLeft.every((value, index) => value === sortedRight[index])
}

export default function Test() {
  const [sessionQuestions, setSessionQuestions] = useState<QuizQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number[]>>({})
  const [submitted, setSubmitted] = useState(false)

  const currentQuestion = sessionQuestions[currentIndex] ?? null

  const score = useMemo(() => {
    return sessionQuestions.reduce((sum, question) => {
      const selected = answers[question.id] ?? []
      return sum + (arraysMatch(selected, question.correctAnswers) ? 1 : 0)
    }, 0)
  }, [answers, sessionQuestions])

  const startQuiz = () => {
    setSessionQuestions(pickRandomQuestions(20))
    setCurrentIndex(0)
    setAnswers({})
    setSubmitted(false)
  }

  const updateAnswer = (question: QuizQuestion, optionIndex: number, checked: boolean) => {
    setAnswers((current) => {
      const existing = current[question.id] ?? []

      if (question.type === 'single') {
        return {
          ...current,
          [question.id]: [optionIndex],
        }
      }

      const next = checked ? [...existing, optionIndex] : existing.filter((item) => item !== optionIndex)
      return {
        ...current,
        [question.id]: next.sort((a, b) => a - b),
      }
    })
  }

  const completion = sessionQuestions.length ? Math.round(((currentIndex + 1) / sessionQuestions.length) * 100) : 0

  return (
    <main className="test-shell">
      <section className="panel test-overview-panel">
        <p className="eyebrow">Learning Control</p>
        <h2>BMP-2 knowledge test</h2>
        <p className="muted-text">
          The current bank contains {testQuestions.length} generated questions. Each session selects 20 at random and mixes single-choice and multiple-choice tasks.
        </p>
        <div className="button-row">
          <button type="button" className="primary-button" onClick={startQuiz}>
            {sessionQuestions.length ? 'Restart test' : 'Start test'}
          </button>
          <Link className="secondary-button" to="/parts">
            Review lecture pages
          </Link>
        </div>
      </section>

      {sessionQuestions.length ? (
        <>
          <section className="panel test-progress-panel">
            <div>
              <p className="eyebrow">Progress</p>
              <h2>
                Question {currentIndex + 1} of {sessionQuestions.length}
              </h2>
              <p className="muted-text">{submitted ? `Final score: ${score}/${sessionQuestions.length}` : `Completion: ${completion}%`}</p>
            </div>
            <div className="progress-bar">
              <span style={{ width: `${completion}%` }} />
            </div>
          </section>

          {currentQuestion && !submitted ? (
            <section className="panel test-question-panel">
              <p className="eyebrow">{currentQuestion.type === 'single' ? 'Single Choice' : 'Multiple Choice'}</p>
              <h2>{currentQuestion.question}</h2>
              {currentQuestion.partId ? (
                <p className="muted-text">Related lecture: {partMap[currentQuestion.partId]?.name ?? currentQuestion.partId}</p>
              ) : null}
              <div className="option-list">
                {currentQuestion.options.map((option, optionIndex) => {
                  const selected = answers[currentQuestion.id] ?? []
                  const checked = selected.includes(optionIndex)
                  return (
                    <label key={`${currentQuestion.id}-${optionIndex}`} className={checked ? 'option-card checked' : 'option-card'}>
                      <input
                        type={currentQuestion.type === 'single' ? 'radio' : 'checkbox'}
                        name={currentQuestion.id}
                        checked={checked}
                        onChange={(event) => updateAnswer(currentQuestion, optionIndex, event.target.checked)}
                      />
                      <span>{option}</span>
                    </label>
                  )
                })}
              </div>
              <div className="button-row">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setCurrentIndex((value) => Math.max(value - 1, 0))}
                  disabled={currentIndex === 0}
                >
                  Previous
                </button>
                {currentIndex < sessionQuestions.length - 1 ? (
                  <button
                    type="button"
                    className="primary-button"
                    onClick={() => setCurrentIndex((value) => Math.min(value + 1, sessionQuestions.length - 1))}
                  >
                    Next question
                  </button>
                ) : (
                  <button type="button" className="primary-button" onClick={() => setSubmitted(true)}>
                    Finish test
                  </button>
                )}
              </div>
            </section>
          ) : null}

          {submitted ? (
            <section className="results-list">
              {sessionQuestions.map((question, index) => {
                const selected = answers[question.id] ?? []
                const correct = arraysMatch(selected, question.correctAnswers)
                return (
                  <article key={question.id} className={correct ? 'panel result-card correct' : 'panel result-card incorrect'}>
                    <p className="eyebrow">Question {index + 1}</p>
                    <h2>{question.question}</h2>
                    <p className="result-status">{correct ? 'Correct' : 'Needs review'}</p>
                    <ul className="answer-review-list">
                      {question.options.map((option, optionIndex) => {
                        const isCorrectAnswer = question.correctAnswers.includes(optionIndex)
                        const wasSelected = selected.includes(optionIndex)
                        return (
                          <li
                            key={`${question.id}-review-${optionIndex}`}
                            className={isCorrectAnswer ? 'answer-line correct' : wasSelected ? 'answer-line incorrect' : 'answer-line'}
                          >
                            <span>{option}</span>
                            <strong>
                              {isCorrectAnswer ? 'Correct answer' : wasSelected ? 'Your selection' : 'Not selected'}
                            </strong>
                          </li>
                        )
                      })}
                    </ul>
                    {question.explanation ? <p className="muted-text">{question.explanation}</p> : null}
                  </article>
                )
              })}
            </section>
          ) : null}
        </>
      ) : null}
    </main>
  )
}
