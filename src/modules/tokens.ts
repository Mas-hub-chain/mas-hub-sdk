import type { MasHubSDK } from "../client"
import type { TokenizationRequest, Token } from "../types"

export class TokensModule {
  constructor(private sdk: MasHubSDK) {}

  /**
   * Create a new token
   */
  async create(request: TokenizationRequest): Promise<Token> {
    const response = await this.sdk.request<Token>("/tokenization", {
      method: "POST",
      body: JSON.stringify(request),
    })
    return response.data
  }

  /**
   * List tokens
   */
  async list(filters?: {
    asset_type?: string
    status?: string
    page?: number
  }): Promise<{
    tokens: Token[]
    pagination: any
  }> {
    const params = new URLSearchParams()
    if (filters?.asset_type) params.append("asset_type", filters.asset_type)
    if (filters?.status) params.append("status", filters.status)
    if (filters?.page) params.append("page", filters.page.toString())

    const queryString = params.toString()
    const endpoint = `/tokenization${queryString ? `?${queryString}` : ""}`

    const response = await this.sdk.request(endpoint)
    return {
      tokens: response.data.result || [],
      pagination: response.data.pagination || {},
    }
  }

  /**
   * Get token details
   */
  async get(tokenId: string): Promise<Token> {
    const response = await this.sdk.request<Token>(`/tokenization/${tokenId}`)
    return response.data
  }

  /**
   * Transfer token
   */
  async transfer(
    tokenId: string,
    data: {
      to: string
      amount: number
      memo?: string
    },
  ): Promise<any> {
    const response = await this.sdk.request(`/tokenization/${tokenId}/transfer`, {
      method: "POST",
      body: JSON.stringify(data),
    })
    return response.data
  }
}
