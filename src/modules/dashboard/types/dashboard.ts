export type DashboardSummaryDTO = {
  totalContainers: number
  runningContainers: number
  totalExposures: number
  enabledExposures: number
  cloudflaredStatus: string
  cloudflaredActive: boolean
  cloudflaredConfigExists: boolean
}
