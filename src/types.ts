// Extended RequestInit with timeout
export interface RequestInitWithTimeout extends RequestInit {
  timeout?: number
}

// Core SDK Configuration
export interface MasHubConfig {
  apiKey: string
  baseUrl?: string
  environment?: "development" | "staging" | "production"
  timeout?: number
  retries?: number
  debug?: boolean
}

// API Response wrapper
export interface MasHubResponse<T = any> {
  success: boolean
  data: T
  status: number
  headers: Record<string, string>
}

// Smart Contract Types
export interface SmartContractProject {
  id: string
  project_name: string
  slug: string
  description?: string
  version?: string
  last_deployed_at?: string
  created_at: string
  updated_at: string
}

export interface SmartContractVersion {
  id: string
  status: "draft" | "compiling" | "compiled" | "deployed" | "failed"
  compile_type: string
  version: string
  slug: string
  compiler_settings: {
    solidity: {
      version: string
      settings?: {
        optimizer?: {
          enabled: boolean
          runs: number
        }
      }
    }
  }
  packages: string[]
  contract_files?: Array<{
    filename: string
    url: string
  }>
  artifacts?: Array<{
    id: number
    contract_name: string
    contract_abi: any[]
    bytecode: string
    source_code: string
  }>
  created_at: string
  updated_at: string
}

export interface DeployedContract {
  contract_address: string
  deployment_params: any[]
  contract_name: string
  project_name: string
  version: string
  deployed_at: string
}

export interface DeploymentRequest {
  wallet_options: {
    type: "organisation" | "end_user" | "non_custodial"
    address: string
  }
  deployment_params: Array<{
    sc_artifact_id: number
    params?: Record<string, any>
    order: number
    signed_trx?: string
  }>
  callback_url?: string
}

// Tokenization Types
export interface TokenizationRequest {
  asset_type: "PHYSICAL" | "DIGITAL" | "FINANCIAL"
  metadata: {
    name: string
    description: string
    image?: string
    attributes?: Array<{
      trait_type: string
      value: string | number
    }>
    quantity: number
    custom_metadata?: Record<string, any>
  }
  tenant_id?: string
}

export interface Token {
  id: string
  tenant_id: string
  asset_type: string
  metadata: {
    name: string
    description: string
    quantity: number
    custom_metadata?: Record<string, any>
  }
  tx_hash: string
  status: "pending" | "confirmed" | "failed"
  created_at: string
}

// Compliance Types
export interface KYCRequest {
  wallet_address: string
  user_id?: string
  document_type?: "passport" | "drivers_license" | "national_id"
  document_number?: string
  full_name?: string
  date_of_birth?: string
}

export interface KYCResult {
  wallet_address: string
  risk_score: number
  risk_level: "low_risk" | "medium_risk" | "high_risk"
  verified: boolean
  verification_id: string
  created_at: string
}

// Analytics Types
export interface AnalyticsQuery {
  metric: "transactions" | "contracts" | "tokens" | "users"
  timeframe: "1h" | "24h" | "7d" | "30d" | "90d"
  filters?: Record<string, any>
}

export interface AnalyticsResult {
  metric: string
  value: number
  change: number
  timeframe: string
  data_points: Array<{
    timestamp: string
    value: number
  }>
}

// Webhook Types
export interface WebhookEvent {
  id: string
  event_type: string
  transaction_hash?: string
  contract_address?: string
  payload: Record<string, any>
  timestamp: string
}
