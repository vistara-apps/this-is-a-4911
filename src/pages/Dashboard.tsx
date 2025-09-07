
import { useNavigate } from 'react-router-dom'
import { Play, Star, Trophy, CheckCircle, Clock } from 'lucide-react'
import { useApp } from '../context/AppContext'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import ProgressTracker from '../components/ui/ProgressTracker'
import Badge from '../components/ui/Badge'

export default function Dashboard() {
  const { state } = useApp()
  const navigate = useNavigate()
  
  const completedModules = state.attempts.length
  const totalModules = state.modules.length
  const averageScore = state.attempts.length > 0 
    ? Math.round(state.attempts.reduce((sum, attempt) => sum + attempt.score, 0) / state.attempts.length)
    : 0

  const getModuleStatus = (moduleId: string) => {
    const attempt = state.attempts.find(a => a.moduleId === moduleId)
    return attempt ? 'completed' : 'not-started'
  }

  const getModuleScore = (moduleId: string) => {
    const attempt = state.attempts.find(a => a.moduleId === moduleId)
    return attempt?.score || 0
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">
          Welcome back, {state.user?.name}! 👋
        </h1>
        <p className="text-text-secondary">
          Continue your compliance training journey and unlock your potential.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">Progress</p>
              <p className="text-2xl font-bold text-primary">
                {Math.round((completedModules / totalModules) * 100)}%
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-primary" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">Total Points</p>
              <p className="text-2xl font-bold text-accent">{state.totalPoints}</p>
            </div>
            <Star className="w-8 h-8 text-accent" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">Average Score</p>
              <p className="text-2xl font-bold text-primary">{averageScore}%</p>
            </div>
            <Trophy className="w-8 h-8 text-primary" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">Modules Left</p>
              <p className="text-2xl font-bold text-text-primary">
                {totalModules - completedModules}
              </p>
            </div>
            <Clock className="w-8 h-8 text-text-secondary" />
          </div>
        </Card>
      </div>

      {/* Progress Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-4">
              Your Progress
            </h2>
            <ProgressTracker 
              current={completedModules} 
              total={totalModules} 
              variant="detailed"
            />
            <div className="mt-4 text-sm text-text-secondary">
              {completedModules === totalModules 
                ? '🎉 Congratulations! You\'ve completed all modules!'
                : `Keep going! You're ${totalModules - completedModules} modules away from completion.`
              }
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <h2 className="text-xl font-semibold text-text-primary mb-4">
            Your Badges
          </h2>
          {state.userBadges.length > 0 ? (
            <div className="space-y-3">
              {state.userBadges.map((badge, index) => (
                <div key={index} className="flex items-center justify-between">
                  <Badge variant={badge as any} />
                  <span className="text-xs text-text-secondary">Earned</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-text-secondary text-sm">
                Complete quizzes to earn badges!
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* Available Modules */}
      <div>
        <h2 className="text-xl font-semibold text-text-primary mb-4">
          Training Modules
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {state.modules.map((module) => {
            const status = getModuleStatus(module.moduleId)
            const score = getModuleScore(module.moduleId)
            
            return (
              <Card 
                key={module.moduleId}
                className="p-6 hover:scale-105 transition-transform cursor-pointer"
                onClick={() => navigate(`/app/quiz/${module.moduleId}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-text-primary">
                    {module.title}
                  </h3>
                  {status === 'completed' && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                </div>
                
                <p className="text-text-secondary text-sm mb-4 line-clamp-2">
                  {module.description}
                </p>
                
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-text-secondary">
                    {module.questions.length} questions
                  </span>
                  <span className="text-sm font-medium text-accent">
                    +{module.points} points
                  </span>
                </div>
                
                {status === 'completed' && (
                  <div className="mb-4 p-2 bg-green-50 rounded text-center">
                    <span className="text-sm font-medium text-green-800">
                      Score: {score}%
                    </span>
                  </div>
                )}
                
                <Button
                  className="w-full"
                  variant={status === 'completed' ? 'outline' : 'primary'}
                >
                  <Play className="w-4 h-4 mr-2" />
                  {status === 'completed' ? 'Review' : 'Start Module'}
                </Button>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
