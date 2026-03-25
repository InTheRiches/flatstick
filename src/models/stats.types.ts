// export interface RoundStats {
//   scoring: ScoringStats
//   driving: DrivingStats
//   approach: ApproachStats
//   shortGame: ShortGameStats
//   putting: PuttingStats
//   dispersion: DispersionStats
//   distance: DistanceStats
//   intentComparison: IntentComparisonStats
//   liePerformance: LiePerformanceStats
//   clubPerformance: ClubPerformanceStats
//   penalties: PenaltyStats
// }

export interface RoundStats {
  score: number
  scoreToPar: number
  birdies: number
  pars: number
  bogeys: number
  doubleBogeys: number
  triplePlus: number

  putts: number
  puttsPerHole: number
  onePutts: number
  threePutts: number

  fairwaysHit: number
  fairwayPercentage: number

  gir: number
  girPercentage: number

  upAndDowns: number

  penalties: number

  longestDrive: number
  longestPutt: number

  strokesGained: {
    total: number
    putting: number
  }
}

export interface PenaltyStats {
  penalties: number

  outOfBounds: number
  water: number
  unplayable: number

  penalties: number
}

export interface ScoringStats {
  totalScore: number
  scoreToPar: number

  birdies: number
  pars: number
  bogeys: number
  doubleBogeys: number
  tripleOrWorse: number

  holesPlayed: number

  par3ScoreAvg: number
  par4ScoreAvg: number
  par5ScoreAvg: number

  bestHoleScore: number
  worstHoleScore: number
}

export interface ShortGameStats {
  shots: number

  upAndDownAttempts: number
  upAndDownSuccess: number
  upAndDownPercentage: number

  sandShots: number
  sandSaves: number
  sandSavePercentage: number

  averageLeaveDistance: number
}

export interface DrivingStats {
  drives: number

  fairwaysHit: number
  fairwaysMissed: number

  fairwayHitPercentage: number

  missLeft: number
  missRight: number
  missLong: number
  missShort: number

  averageDriveDistance: number
  longestDrive: number
}

export interface ApproachStats {
  approachShots: number

  greensInRegulation: number
  girPercentage: number

  proximityAverage: number
  proximityMedian: number

  missedLeft: number
  missedRight: number
  missedLong: number
  missedShort: number
}

export interface PuttingStats {
  putts: number
  puttsPerHole: number

  onePutts: number
  twoPutts: number
  threePutts: number
  fourPutts: number

  averagePuttDistance: number
  averageLeaveDistance: number

  makePercentageByDistance: Record<string, number>

  longestMadePutt: number

  leftMisses: number
  rightMisses: number
  shortMisses: number
  longMisses: number

  breakBias: number
  slopeBias: number
}

export interface DispersionStats {
  overall: DispersionCluster

  drives: DispersionCluster
  approaches: DispersionCluster
  wedges: DispersionCluster
  putts: DispersionCluster
}

export interface DispersionCluster {
  avgOffline: number
  avgDistanceError: number

  leftBias: number
  rightBias: number

  standardDeviation: number
}

export interface DistanceStats {
  totalDistanceWalked: number

  averageCarryByClub: Record<string, number>
  longestShotByClub: Record<string, number>

  approachDistanceAverage: number
}

export interface IntentComparisonStats {
  shotShapeMatches: number
  shotShapeMismatch: number

  averageShapeError: number

  intendedFadeActualDraw: number
  intendedDrawActualFade: number

  intendedStraightMissLeft: number
  intendedStraightMissRight: number
}

export interface LiePerformanceStats {
  tee: LieStat
  fairway: LieStat
  rough: LieStat
  bunker: LieStat
  fringe: LieStat
  green: LieStat
}

export interface LieStat {
  shots: number
  averageDistance: number
  averageOffline: number
}

export interface ClubPerformanceStats {
  [club: string]: {
    shots: number
    avgDistance: number
    avgOffline: number
    missLeft: number
    missRight: number
  }
}