import React from 'react'
import { Trophy, Star, CheckCircle, Clock, TrendingUp } from 'lucide-react'
import { useApp } from '../context/AppContext'
import Card from '../components/ui/Card'
import ProgressTracker from '../components/ui/ProgressTracker'
import Badge from '../components/ui/Badge'

export default function Progress() {
  const { state } = useApp()
  
  const completedModules = state.attempts.length
  const totalModules = state.modules.length
  const averageScore = state.attempts.length > 0 
    ? Math.round(state.attempts.reduce((sum, attempt) => sum + attempt.score, 0) / state.attempts.length)
    : 0
  
  const getModuleProgress = () => {
    return state.modules.map(module => {
      const attempt = state.attempts.find(a => a.moduleId === module.moduleId)
      return {
        ...module,
        completed: !!attempt,
        score: attempt?.score || 0,
        completionDate: attempt?.completionDate
      }
    })
  }
  
  const moduleProgress = getModuleProgress()
  const recentActivity = state.attempts
    .sort((a, b) => new Date(b.completionDate).getTime() - new Date(a.completionDate).getTime())
    .slice(0, 5)
  
  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">
          Progress Overview
        </h1>
        <p className="text-text-secondary">
          Track your learning journey and achievements.
        </p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">Completion Rate</p>
              <p className="text-2xl font-bold text-primary">
                {Math.round((completedModules / totalModules) * 100)}%
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-primary" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">Average Score</p>
              <p className="text-2xl font-bold text-accent">{averageScore}%</p>
            </div>
            <Star className="w-8 h-8 text-accent" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">Total Points</p>
              <p className="text-2xl font-bold text-primary">{state.totalPoints}</p>
            </div>
            <Trophy className="w-8 h-8 text-primary" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">Badges Earned</p>
              <p className="text-2xl font-bold text-text-primary">{state.userBadges.length}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-text-primary" />
          </div>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Overall Progress */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-text-primary mb-4">
            Overall Progress
          </h2>
          <ProgressTracker 
            current={completedModules} 
            total={totalModules} 
            variant="detailed"
          />
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Modules Completed</span>
              <span className="font-medium">{completedModules}/{totalModules}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Average Score</span>
              <span className="font-medium">{averageScore}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Total Points</span>
              <span className="font-medium">{state.totalPoints}</span>
            </div>
          </div>
        </Card>
        
        {/* Badges & Achievements */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-text-primary mb-4">
            Badges & Achievements
          </h2>
          {state.userBadges.length > 0 ? (
            <div className="space-y-4">
              {state.userBadges.map((badge, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <Badge variant={badge as any} />
                  <span className="text-xs text-text-secondary">Earned</span>
                </div>
              ))}
              <div className="pt-4 border-t">
                <p className="text-sm text-text-secondary">
                  Keep completing quizzes to earn more badges!
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-text-primary mb-2">
                No badges yet
              </h3>
              <p className="text-text-secondary">
                Complete your first quiz with a score of 70% or higher to earn your first badge!
              </p>
            </div>
          )}
        </Card>
      </div>
      
      {/* Module Progress Details */}
      <Card className="p-6 mb-8">
        <h2 className="text-xl font-semibold text-text-primary mb-4">
          Module Progress
        </h2>
        <div className="space-y-4">
          {moduleProgress.map((module) => (
            <div key={module.moduleId} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <h3 className="font-medium text-text-primary">{module.title}</h3>
                <p className="text-sm text-text-secondary">{module.description}</p>
              </div>
              <div className="flex items-center space-x-4">
                {module.completed ? (
                  <>
                    <div className="text-center">
                      <p className="text-sm font-medium text-primary">{module.score}%</p>
                      <p className="text-xs text-text-secondary">Score</p>
                    </div>
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  </>
                ) : (
                  <>
                    <div className="text-center">
                      <p className="text-sm font-medium text-text-secondary">Not started</p>
                    </div>
                    <Clock className="w-6 h-6 text-gray-400" />
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
      
      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-text-primary mb-4">
            Recent Activity
          </h2>
          <div className="space-y-3">
            {recentActivity.map((attempt) => {
              const module = state.modules.find(m => m.moduleId === attempt.moduleId)
              return (
                <div key={attempt.attemptId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-text-primary">{module?.title}</p>
                    <p className="text-sm text-text-secondary">
                      Completed on {new Date(attempt.completionDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-primary">{attempt.score}%</p>
                    <p className="text-xs text-text-secondary">Score</p>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}
    </div>
  )
}