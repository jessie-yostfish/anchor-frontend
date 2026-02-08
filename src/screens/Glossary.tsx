import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Search, ChevronDown, ChevronUp } from 'lucide-react'
import { Card, BottomNav, AppHeader } from '../components'
import { supabase } from '../lib/supabase'

interface GlossaryTerm {
  id: string
  term: string
  category: CategoryType
  definition: string
  spanish_term: string
  spanish_definition: string
  related_terms: string[]
  source: string
  created_at: string
  updated_at: string
}

type CategoryType = 'All' | 'legal' | 'acronym' | 'role' | 'process' | 'general'

const CATEGORIES: CategoryType[] = ['All', 'legal', 'acronym', 'role', 'process', 'general']

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'legal':
      return 'bg-purple-100 text-purple-700'
    case 'acronym':
      return 'bg-blue-100 text-blue-700'
    case 'role':
      return 'bg-green-100 text-green-700'
    case 'process':
      return 'bg-amber-100 text-amber-700'
    case 'general':
      return 'bg-gray-100 text-gray-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

export function Glossary() {
  const navigate = useNavigate()
  const [terms, setTerms] = useState<GlossaryTerm[]>([])
  const [filteredTerms, setFilteredTerms] = useState<GlossaryTerm[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('All')
  const [expandedTermId, setExpandedTermId] = useState<string | null>(null)

  useEffect(() => {
    loadTerms()
  }, [])

  useEffect(() => {
    filterTerms()
  }, [terms, searchQuery, selectedCategory])

  const loadTerms = async () => {
    try {
      const { data, error } = await supabase
        .from('glossary_terms')
        .select('*')
        .order('term', { ascending: true })

      if (error) throw error

      setTerms(data || [])
    } catch (error) {
      console.error('Error loading glossary terms:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterTerms = () => {
    let filtered = terms

    if (selectedCategory !== 'All') {
      filtered = filtered.filter((term) => term.category === selectedCategory)
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (term) =>
          (term.term && term.term.toLowerCase().includes(query)) ||
          (term.definition && term.defin
