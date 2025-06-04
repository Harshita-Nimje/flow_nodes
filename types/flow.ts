export type NodeType = "conversation" | "function" | "callTransfer" | "pressDigit" | "ending"

export interface FlowNode {
  id: string
  type: NodeType
  position: { x: number; y: number }
  data: {
    label: string
    instruction?: string
    pauseDelay?: number
    isGlobal?: boolean
    customLLM?: boolean
  }
}

export interface Transition {
  id: string
  source: string
  target: string
  condition?: string
}

export interface FlowState {
  nodes: FlowNode[]
  transitions: Transition[]
}

