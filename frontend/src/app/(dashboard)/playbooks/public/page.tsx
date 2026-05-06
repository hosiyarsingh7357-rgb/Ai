'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Star, User, Clock, ChevronRight, Search } from 'lucide-react'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/apiClient'
import { cn } from '@/lib/utils'

interface Playbook {
  id: string
  name: string
  description: string
  setupType: string
  isFeatured: boolean
  createdAt: string
  user: {
    name: string
    subscriptionTier: string
  }
}

export default function PublicPlaybooksPage() {
  const { data: playbooks, isLoading } = useQuery({
    queryKey: ['public-playbooks'],
    queryFn: async () => {
      const { data } = await apiClient.get('/playbooks/public')
      return data.data as Playbook[]
    }
  })

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Strategy Library</h1>
          <p className="text-muted-foreground">Learn from proven trading setups and curated community playbooks.</p>
        </div>
        <div className="flex gap-4">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input className="pl-10" placeholder="Search strategies..." />
          </div>
        </div>
      </header>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {playbooks?.map((playbook, idx) => (
            <motion.div
              key={playbook.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="h-full group hover:border-primary/50 transition-colors">
                <CardBody className="p-6 h-full flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div className={cn(
                      "p-2 rounded-lg",
                      playbook.isFeatured ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                    )}>
                      <BookOpen size={20} />
                    </div>
                    {playbook.isFeatured && (
                      <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-primary border border-primary/20 px-2 py-0.5 rounded">
                        <Star size={10} fill="currentColor" /> Featured
                      </div>
                    )}
                  </div>

                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{playbook.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-6 flex-grow">
                    {playbook.description || "No description provided for this setup."}
                  </p>

                  <div className="mt-auto space-y-4">
                    <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-4">
                      <div className="flex items-center gap-2">
                        <User size={14} />
                        <span>{playbook.user?.name || "System"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={14} />
                        <span>{new Date(playbook.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <Button variant="secondary" size="sm" className="w-full justify-between items-center group/btn">
                      View Details
                      <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {playbooks?.length === 0 && (
        <div className="text-center py-20 bg-muted/20 rounded-3xl border-2 border-dashed border-border">
          <BookOpen className="mx-auto mb-4 text-muted-foreground" size={48} />
          <h3 className="text-xl font-semibold">No public strategies yet</h3>
          <p className="text-muted-foreground">Keep an eye out for curated playbooks arriving soon.</p>
        </div>
      )}
    </div>
  )
}
