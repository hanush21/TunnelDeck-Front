export type ExposureProtocol = 'http' | 'https'

export type ExposureDTO = {
  id: string
  containerName: string
  hostname: string
  protocol: ExposureProtocol
  targetHost: string
  port: number
  enabled: boolean
  createdBy: string
  createdAt: string
  updatedAt: string
}

export type UpsertExposureInput = {
  containerName: string
  hostname: string
  protocol: ExposureProtocol
  targetHost: string
  port: number
  enabled: boolean
}

export type ExposureMutationInput = UpsertExposureInput & {
  totpCode?: string
}
