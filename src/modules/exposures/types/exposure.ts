export type ExposureProtocol = 'http' | 'https'

export type ExposureDTO = {
  id: string
  hostname: string
  protocol: ExposureProtocol
  containerId: string
  port: number
  status: string
  createdAt: string
  updatedAt: string
}

export type UpsertExposureInput = {
  hostname: string
  protocol: ExposureProtocol
  containerId: string
  port: number
}

export type ExposureMutationInput = UpsertExposureInput & {
  totpCode?: string
}
