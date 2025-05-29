export interface JobStatus {
  id: string
  name: string
  email: string
  status: "running" | "completed" | "failed"
  total_profiles: number
  processed_profiles?: number
  successful_profiles?: number
  failed_profiles?: number
  selected_nodes: string[]
  created_at: string
  updated_at?: string
  completed_at?: string
  estimated_completion?: string
  download_path?: string
  error_message?: string
  nodeProgress?: NodeProgress[]
  progress?: string
}

export interface NodeProgress {
  nodeId: number | string
  completed: number
  total: number
  progress: number
}

export interface EnrichmentStartResponse {
  success: boolean
  data: {
    jobId: string
    message: string
    totalProfiles: number
    estimatedCompletionMinutes: number
    requestsPerMinute: number
    batchDistribution: BatchDistribution[]
    status: string
  }
}

export interface BatchDistribution {
  nodeId: number | string
  profileCount: number
  estimatedMinutes: number
}
