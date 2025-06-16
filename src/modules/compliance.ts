import type { MasHubSDK } from "../client"
import type { KYCRequest, KYCResult } from "../types"

export class ComplianceModule {
  constructor(private sdk: MasHubSDK) {}

  /**
   * Perform KYC verification
   */
  async performKYC(request: KYCRequest): Promise<KYCResult> {
    const response = await this.sdk.request<KYCResult>("/compliance/kyc", {
      method: "POST",
      body: JSON.stringify(request),
    })
    return response.data
  }

  /**
   * Get KYC status
   */
  async getKYCStatus(walletAddress: string): Promise<KYCResult> {
    const response = await this.sdk.request<KYCResult>(`/compliance/kyc/${walletAddress}`)
    return response.data
  }

  /**
   * Log audit event
   */
  async logAuditEvent(event: {
    action: string
    user_id?: string
    details: Record<string, any>
    ip_address?: string
    user_agent?: string
  }): Promise<any> {
    const response = await this.sdk.request("/audit/log", {
      method: "POST",
      body: JSON.stringify(event),
    })
    return response.data
  }

  /**
   * Export audit logs
   */
  async exportAuditLogs(filters?: {
    start_date?: string
    end_date?: string
    action?: string
    user_id?: string
  }): Promise<any> {
    const params = new URLSearchParams()
    if (filters?.start_date) params.append("start_date", filters.start_date)
    if (filters?.end_date) params.append("end_date", filters.end_date)
    if (filters?.action) params.append("action", filters.action)
    if (filters?.user_id) params.append("user_id", filters.user_id)

    const queryString = params.toString()
    const endpoint = `/audit/export${queryString ? `?${queryString}` : ""}`

    const response = await this.sdk.request(endpoint)
    return response.data
  }
}
