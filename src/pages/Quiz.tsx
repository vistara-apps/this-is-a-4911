import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Trophy, Star } from 'lucide-react'
import { useApp } from '../context/AppContext'
import QuizQuestion from '../components/QuizQuestion'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import ProgressTracker from '../components/ui/ProgressTracker'

export default function Quiz() {
  const { moduleId } = useParams<{ moduleId: string }>()
  const navigate = useNavigate()
  const { state, dispatch } = useApp()
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [showResults, setShowResults] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)
  
  const module = state.modules.find(m => m.moduleId === moduleId)
  const existingAttempt = state.attempts.find(a => a.moduleId === moduleId)
  
  useEffect(() => {
    if (existingAttempt) {
      setAnswers(existingAttempt.answers)
      setShowResults(true)
      setQuizCompleted(true)
    }
  }, [existingAttempt])
  
  if (!module) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold text-text-primary mb-4">
            Module not found
          </h2>
          <Button onClick={() => navigate('/app')}>
            Back to Dashboard
          </Button>
        </Card>
      </div>
    )
  }
  
  const currentQuestion = module.questions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === module.questions.length - 1
  const hasAnsweredCurrent = answers[currentQuestion.id] !== undefined
  
  const handleAnswer = (answer: string | boolean) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: answer
    }))
  }
  
  const handleNext = () => {
    if (isLastQuestion) {
      completeQuiz()
    } else {
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }
  
  const handlePrevious = () => {
    setCurrentQuestionIndex(prev => prev - 1)
  }
  
  const completeQuiz = () => {
    // Calculate score
    const correctAnswers = module.questions.filter(q => 
      answers[q.id] === q.correctAnswer
    ).length
    const score = Math.round((correctAnswers / module.questions.length) * 100)
    
    // Create quiz attempt
    const attempt = {
      attemptId: `attempt-${Date.now()}`,
      userId: state.user!.userId,
      moduleId: module.moduleId,
      score,
      completionDate: new Date().toISOString(),
      answers
    }
    
    dispatch({ type: 'COMPLETE_QUIZ', payload: attempt })
    setShowResults(true)
    setQuizCompleted(true)
  }
  
  const getScore = () => {
    const correctAnswers = module.questions.filter(q => 
      answers[q.id] === q.correctAnswer
    ).length
    return Math.round((correctAnswers / module.questions.length) * 100)
  }
  
  const getScoreMessage = (score: number) => {
    if (score >= 90) return { message: "Excellent work! 🎉", badge: "gold" }
    if (score >= 80) return { message: "Great job! 👍", badge: "silver" }
    if (score >= 70) return { message: "Good effort! 👌", badge: "bronze" }
    return { message: "Keep learning! 📚", badge: null }
  }
  
  if (showResults) {
    const score = existingAttempt ? existingAttempt.score : getScore()
    const { message, badge } = getScoreMessage(score)
    
    return (
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-6">
          <Button
            variant="outline"
            onClick={() => navigate('/app')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold text-text-primary">
            {module.title} - Results
          </h1>
        </div>
        
        {/* Score Card */}
        <Card className="p-8 text-center mb-6">
          <div className="mb-6">
            <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-primary mb-2">
              {score}%
            </h2>
            <p className="text-lg text-text-secondary mb-4">{message}</p>
            {badge && (
              <div className="inline-block">
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                  badge === 'gold' ? 'bg-yellow-100 text-yellow-800' :
                  badge === 'silver' ? 'bg-gray-100 text-gray-800' :
                  'bg-orange-100 text-orange-800'
                }`}>
                  🏆 {badge.charAt(0).toUpperCase() + badge.slice(1)} Badge Earned!
                </span>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">
                {module.questions.filter(q => answers[q.id] === q.correctAnswer).length}
              </p>
              <p className="text-text-secondary">Correct</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-500">
                {module.questions.filter(q => answers[q.id] !== q.correctAnswer).length}
              </p>
              <p className="text-text-secondary">Incorrect</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-accent">
                +{score >= 80 ? module.points : Math.round(module.points * 0.5)}
              </p>
              <p className="text-text-secondary">Points</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => navigate('/app')}>
              Back to Dashboard
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                setShowResults(false)
                setCurrentQuestionIndex(0)
              }}
            >
              Review Answers
            </Button>
          </div>
        </Card>
        
        {/* Question Review */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-text-primary">
            Answer Review
          </h3>
          {module.questions.map((question, index) => (
            <QuizQuestion
              key={question.id}
              question={question}
              onAnswer={() => {}}
              showExplanation={true}
              userAnswer={answers[question.id]}
            />
          ))}
        </div>
      </div>
    )
  }
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <Button
          variant="outline"
          onClick={() => navigate('/app')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-text-primary">
            {module.title}
          </h1>
          <p className="text-text-secondary">{module.description}</p>
        </div>
      </div>
      
      {/* Progress */}
      <Card className="p-6 mb-6">
        <ProgressTracker
          current={currentQuestionIndex + 1}
          total={module.questions.length}
          variant="detailed"
        />
      </Card>
      
      {/* Question */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text-primary">
            Question {currentQuestionIndex + 1} of {module.questions.length}
          </h2>
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-accent">
              +{Math.round(module.points / module.questions.length)} points
            </span>
          </div>
        </div>
        
        <QuizQuestion
          question={currentQuestion}
          onAnswer={handleAnswer}
          userAnswer={answers[currentQuestion.id]}
        />
      </div>
      
      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
        >
          Previous
        </Button>
        
        <Button
          onClick={handleNext}
          disabled={!hasAnsweredCurrent}
        >
          {isLastQuestion ? 'Complete Quiz' : 'Next Question'}
        </Button>
      </div>
    </div>
  )
}