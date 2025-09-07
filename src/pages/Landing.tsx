
import { Link } from 'react-router-dom'
import { Play, CheckCircle, Users, BarChart3 } from 'lucide-react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'

export default function Landing() {
  const features = [
    {
      icon: Play,
      title: 'Gamified Learning',
      description: 'Interactive quizzes and challenges that make compliance training engaging and memorable.'
    },
    {
      icon: CheckCircle,
      title: 'Knowledge Tracking',
      description: 'Track progress and ensure new hires understand critical policies and their rights.'
    },
    {
      icon: Users,
      title: 'Easy Management',
      description: 'HR dashboard to monitor new hire progress and identify knowledge gaps.'
    },
    {
      icon: BarChart3,
      title: 'Analytics & Insights',
      description: 'Detailed reporting on training effectiveness and compliance readiness.'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-purple-600 to-accent">
      {/* Header */}
      <header className="relative z-10 p-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xl font-bold text-white">OnboardWise</span>
          </div>
          <Link to="/auth">
            <Button variant="outline" className="bg-white text-primary hover:bg-gray-50">
              Sign In
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 px-6 py-16">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            Gamify your compliance training and understand your rights
          </h1>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Transform boring compliance training into engaging, interactive experiences that help new hires learn their rights and company policies effectively.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/app">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-white">
                Try Demo
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="bg-white text-primary hover:bg-gray-50">
              Learn More
            </Button>
          </div>
        </div>
      </main>

      {/* Features Grid */}
      <section className="relative z-10 px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Why Choose OnboardWise?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={index} className="p-6 text-center animate-fade-in">
                  <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-text-secondary">
                    {feature.description}
                  </p>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* App Preview */}
      <section className="relative z-10 px-6 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-8">
            See It In Action
          </h2>
          <Card className="p-8 bg-white/95 backdrop-blur">
            <div className="bg-gray-100 rounded-lg p-6 mb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Employee Rights Quiz</h3>
                <span className="text-sm text-text-secondary">3 of 10 questions</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div className="bg-primary h-2 rounded-full w-1/3"></div>
              </div>
              <div className="text-left">
                <p className="font-medium mb-4">What is the minimum notice period for termination?</p>
                <div className="space-y-2">
                  <div className="p-2 border rounded hover:bg-gray-50 cursor-pointer">1 week</div>
                  <div className="p-2 border-2 border-primary bg-primary/5 rounded">2 weeks</div>
                  <div className="p-2 border rounded hover:bg-gray-50 cursor-pointer">1 month</div>
                </div>
              </div>
            </div>
            <p className="text-text-secondary">
              Interactive quizzes make learning engaging and help ensure knowledge retention.
            </p>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Onboarding?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Start with our free tier and see the difference gamified training makes.
          </p>
          <Link to="/auth">
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-white">
              Start Free Trial
            </Button>
          </Link>
        </div>
      </section>

      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-10 -right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-10 w-64 h-64 bg-accent/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-1/3 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl"></div>
      </div>
    </div>
  )
}
