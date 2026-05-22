export type ConnectionState =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'trade_unlocked'
  | 'error'
  | 'reconnecting'

export interface ConnectionConfig {
  host: string
  port: number
}

export interface ConnectionStatus {
  state: ConnectionState
  message: string | null
  trade_unlocked: boolean
}
