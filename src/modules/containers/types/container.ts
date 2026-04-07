export type ContainerDTO = {
  id: string
  name: string
  image: string
  state: string
  status: string
  ports: string[]
  uptime: string
  createdAt: string
  startedAt: string | null
}
