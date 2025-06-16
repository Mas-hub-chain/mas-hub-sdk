import type { MasHubSDK } from "../client"
import type { AnalyticsQuery, AnalyticsResult } from "../types"

export class AnalyticsModule {
  constructor(private sdk: MasHubSDK) {}

  /**
   * Get analytics data
   */
  async query(query: AnalyticsQuery): Promise<AnalyticsResult> {
    const response = await this.sdk.request<AnalyticsResult>("/analytics/query", {
      method: "POST",
      body: JSON.stringify(query),
    })
    return response.data
  }

  /**
   * Get overview analytics
   */
  async getOverview(timeframe = "24h"): Promise<{
    transactions: AnalyticsResult
    contracts: AnalyticsResult
    tokens: AnalyticsResult
    users: AnalyticsResult
  }> {
    const response = await this.sdk.request(`/analytics/overview?timeframe=${timeframe}`)
    return response.data
  }

  /**
   * Get smart contract analytics
   */
  async getContractAnalytics(contractAddress?: string): Promise<any> {
    const endpoint = contractAddress
      ? `/smart-contracts/analytics?contract=${contractAddress}`
      : "/smart-contracts/analytics"

    const response = await this.sdk.request(endpoint)
    return response.data
  }
}
