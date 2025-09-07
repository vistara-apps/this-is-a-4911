import { useState } from 'react'
import { Search, FileText, Filter } from 'lucide-react'
import { useApp } from '../context/AppContext'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

export default function PolicyLibrary() {
  const { state } = useApp()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [expandedPolicy, setExpandedPolicy] = useState<string | null>(null)
  
  const categories = ['all', ...new Set(state.policies.map(p => p.category))]
  
  const filteredPolicies = state.policies.filter(policy => {
    const matchesSearch = policy.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         policy.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || policy.category === selectedCategory
    return matchesSearch && matchesCategory
  })
  
  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">
          Policy Library
        </h1>
        <p className="text-text-secondary">
          Search and browse company policies and legal information.
        </p>
      </div>
      
      {/* Search and Filters */}
      <div className="mb-6 space-y-4 sm:space-y-0 sm:flex sm:items-center sm:space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary w-4 h-4" />
          <input
            type="text"
            placeholder="Search policies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary w-4 h-4" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent appearance-none bg-white"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Results Count */}
      <div className="mb-6">
        <p className="text-text-secondary">
          {filteredPolicies.length} {filteredPolicies.length === 1 ? 'policy' : 'policies'} found
        </p>
      </div>
      
      {/* Policies Grid */}
      <div className="space-y-6">
        {filteredPolicies.length === 0 ? (
          <Card className="p-8 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              No policies found
            </h3>
            <p className="text-text-secondary">
              Try adjusting your search terms or filters.
            </p>
          </Card>
        ) : (
          filteredPolicies.map((policy) => (
            <Card key={policy.policyId} className="overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-text-primary mb-2">
                      {policy.title}
                    </h3>
                    <span className="inline-block px-3 py-1 text-xs font-medium text-primary bg-primary/10 rounded-full">
                      {policy.category}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setExpandedPolicy(
                      expandedPolicy === policy.policyId ? null : policy.policyId
                    )}
                  >
                    {expandedPolicy === policy.policyId ? 'Collapse' : 'Read More'}
                  </Button>
                </div>
                
                <p className="text-text-secondary mb-4">
                  {policy.summary}
                </p>
                
                {expandedPolicy === policy.policyId && (
                  <div className="mt-4 pt-4 border-t border-gray-200 animate-slide-up">
                    <h4 className="font-semibold text-text-primary mb-3">
                      Full Policy Details
                    </h4>
                    <div className="prose prose-sm max-w-none text-text-secondary">
                      {policy.content.split('\n').map((paragraph, index) => (
                        <p key={index} className="mb-3">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
