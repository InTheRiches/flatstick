import { useMemo, useState } from "react"

import { useRounds } from "@/hooks/useRounds"
import type { RoundSession } from "@/models/round.session.types"

export type ScoreFilter = "all" | "under" | "even" | "over"
export type SortOrder = "newest" | "oldest"

export interface RoundsFilterState {
  filteredRounds: RoundSession[]
  searchQuery: string
  setSearchQuery: (q: string) => void
  scoreFilter: ScoreFilter
  setScoreFilter: (f: ScoreFilter) => void
  sort: SortOrder
  setSort: (s: SortOrder) => void
  isLoading: boolean
  refreshRounds: () => Promise<void>
}

export function useRoundsFilter(): RoundsFilterState {
  const { rounds, isLoading, refreshRounds } = useRounds()
  const [searchQuery, setSearchQuery] = useState("")
  const [scoreFilter, setScoreFilter] = useState<ScoreFilter>("all")
  const [sort, setSort] = useState<SortOrder>("newest")

  const filteredRounds = useMemo(() => {
    let list = [...rounds]

    list = list.filter((r) => r.stats !== undefined)

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      list = list.filter(
        (r) =>
          (r.meta.courseName ?? "").toLowerCase().includes(q) ||
          (r.meta.clubName ?? "").toLowerCase().includes(q),
      )
    }

    if (scoreFilter !== "all") {
      list = list.filter((r) => {
        const diff = r.stats?.scoreToPar ?? 0
        if (scoreFilter === "under") return diff < 0
        if (scoreFilter === "even") return diff === 0
        return diff > 0
      })
    }

    list.sort((a, b) => {
      const tA = new Date(a.meta.date).getTime()
      const tB = new Date(b.meta.date).getTime()
      return sort === "newest" ? tB - tA : tA - tB
    })

    return list
  }, [rounds, searchQuery, scoreFilter, sort])

  return {
    filteredRounds,
    searchQuery,
    setSearchQuery,
    scoreFilter,
    setScoreFilter,
    sort,
    setSort,
    isLoading,
    refreshRounds,
  }
}
