import React, { useState } from 'react'
import { Question } from '../context/AppContext'
import Button from './ui/Button'
import Card from './ui/Card'

interface QuizQuestionProps {
  question: Question
  onAnswer: (answer: string | boolean) => void
  showExplanation?: boolean
  userAnswer?: string | boolean
}

export default function QuizQuestion({ 
  question, 
  onAnswer, 
  showExplanation = false,
  userAnswer
}: QuizQuestionProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | boolean | null>(userAnswer || null)
  
  const handleSubmit = () => {
    if (selectedAnswer !== null) {
      onAnswer(selectedAnswer)
    }
  }
  
  const isCorrect = selectedAnswer === question.correctAnswer
  
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-text-primary mb-4">
        {question.question}
      </h3>
      
      {question.type === 'multiple-choice' && question.options && (
        <div className="space-y-3 mb-6">
          {question.options.map((option, index) => (
            <label
              key={index}
              className={`flex items-center p-3 rounded-md border cursor-pointer transition-colors ${
                selectedAnswer === option
                  ? showExplanation 
                    ? option === question.correctAnswer
                      ? 'border-green-500 bg-green-50'
                      : 'border-red-500 bg-red-50'
                    : 'border-primary bg-primary/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="answer"
                value={option}
                checked={selectedAnswer === option}
                onChange={(e) => setSelectedAnswer(e.target.value)}
                disabled={showExplanation}
                className="mr-3"
              />
              <span className="text-sm">{option}</span>
            </label>
          ))}
        </div>
      )}
      
      {question.type === 'true-false' && (
        <div className="space-y-3 mb-6">
          {[true, false].map((option) => (
            <label
              key={option.toString()}
              className={`flex items-center p-3 rounded-md border cursor-pointer transition-colors ${
                selectedAnswer === option
                  ? showExplanation 
                    ? option === question.correctAnswer
                      ? 'border-green-500 bg-green-50'
                      : 'border-red-500 bg-red-50'
                    : 'border-primary bg-primary/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="answer"
                value={option.toString()}
                checked={selectedAnswer === option}
                onChange={() => setSelectedAnswer(option)}
                disabled={showExplanation}
                className="mr-3"
              />
              <span className="text-sm">{option ? 'True' : 'False'}</span>
            </label>
          ))}
        </div>
      )}
      
      {showExplanation && (
        <div className={`p-4 rounded-md mb-4 ${
          isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center mb-2">
            <span className={`text-sm font-medium ${
              isCorrect ? 'text-green-800' : 'text-red-800'
            }`}>
              {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
            </span>
          </div>
          <p className="text-sm text-gray-700">{question.explanation}</p>
        </div>
      )}
      
      {!showExplanation && (
        <Button
          onClick={handleSubmit}
          disabled={selectedAnswer === null}
          className="w-full"
        >
          Submit Answer
        </Button>
      )}
    </Card>
  )
}