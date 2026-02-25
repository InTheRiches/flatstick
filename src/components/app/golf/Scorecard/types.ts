export type ScorecardHole = {
  par: number
  score: number // use -1 for unknown
  // optional: your old “puttData” existence flag
  hasData?: boolean
}

export type ScorecardVariant = "round" | "putts"

export type ScorecardProps = {
  variant?: ScorecardVariant

  // round variant
  holes?: ScorecardHole[]
  front?: boolean

  // putts variant
  puttsByHole?: number[] // -1 for unknown
  strokesGained?: number
  totalPutts?: number

  // UI options
  roundedTop?: boolean
  roundedBottom?: boolean
  topMargin?: boolean

  // optional interaction
  onSelectHole?: (holeNumber: number) => void
}
