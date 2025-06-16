import { ContractsModule } from "./modules/contracts"
import { TokensModule } from "./modules/tokens"
import { ComplianceModule } from "./modules/compliance"
import { AnalyticsModule } from "./modules/analytics"
import type { MasHubConfig, MasHubResponse, RequestInitWithTimeout } from "./types"
import { MasHubError, AuthenticationError, NetworkError } from "./errors"

export class MasHubSDK {
  private config: MasHubConfig
  private accessToken?: string
  private lastRequestTime = 0
  private requestQueue: Array<() => Promise<void>> = []
  private isProcessingQueue = false

  // Module instances
  public readonly contracts: ContractsModule
  public readonly tokens: TokensModule
  public readonly compliance: ComplianceModule
  public readonly analytics: AnalyticsModule

  constructor(config: MasHubConfig) {
    this.validateConfig(config)
    this.config = {
      environment: "production",
      timeout: 30000,
      retries: 3,
      ...config,
    }

    // Initialize modules
    this.contracts = new ContractsModule(this)
    this.tokens = new TokensModule(this)
    this.compliance = new ComplianceModule(this)
    this.analytics = new AnalyticsModule(this)
  }

  private validateConfig(config: MasHubConfig): void {
    if (!config.apiKey) {
      throw new MasHubError("API key is required")
    }
    if (!config.baseUrl && !config.environment) {
      throw new MasHubError("Either baseUrl or environment must be specified")
    }
  }

  private getBaseUrl(): string {
    if (this.config.baseUrl) {
      return this.config.baseUrl
    }

    switch (this.config.environment) {
      case "development":
        return "http://localhost:3000"
      case "staging":
        return "https://staging.mas-hub.vercel.app"
      case "production":
        return "https://mas-hub.vercel.app"
      default:
        throw new MasHubError(`Unknown environment: ${this.config.environment}`)
    }
  }

  /**
   * Make authenticated API request
   */
  async request<T = any>(endpoint: string, options: RequestInitWithTimeout = {}): Promise<MasHubResponse<T>> {
    // Rate limiting - max 10 requests per second
    const now = Date.now()
    const timeSinceLastRequest = now - this.lastRequestTime
    
    if (timeSinceLastRequest < 100) { // 100ms = 10 requests/second
      await new Promise(resolve => setTimeout(resolve, 100 - timeSinceLastRequest))
    }

    const url = `${this.getBaseUrl()}/api${endpoint}`
    this.lastRequestTime = Date.now()

    let lastError: Error | undefined
    const maxRetries = options.retries ?? this.config.retries ?? 3
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      if (attempt > 0) {
        // Exponential backoff: 100ms, 200ms, 400ms, etc.
        await new Promise(resolve => setTimeout(resolve, 100 * Math.pow(2, attempt - 1)))
      }
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), options.timeout || this.config.timeout)

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.config.apiKey}`,
      "User-Agent": `MasHub-SDK/1.0.0`,
      ...options.headers,
    }

    const requestOptions: RequestInit = {
      ...options,
      headers,
      signal: controller.signal,
    }

    try {
      const response = await fetch(url, requestOptions)

      if (!response.ok) {
        await this.handleErrorResponse(response)
      }

      const data = await response.json()
      
      // Convert headers to plain object
      const headersObj: Record<string, string> = {}
      response.headers.forEach((value: string, key: string) => {
        headersObj[key] = value
      })

      clearTimeout(timeoutId)
      return {
        success: true,
        data,
        status: response.status,
        headers: headersObj,
      }
    } catch (error: unknown) {
      clearTimeout(timeoutId)
      if (error instanceof MasHubError) {
        if (attempt === maxRetries) {
          throw error
        }
        lastError = error
        continue
      }

      lastError = new NetworkError(`Network request failed: ${error instanceof Error ? error.message : "Unknown error"}`)
      if (attempt === maxRetries) {
        throw lastError
      }
    }
    }

    throw lastError || new NetworkError("Request failed after all retries")
  }

  private async handleErrorResponse(response: Response): Promise<never> {
    const contentType = response.headers.get("content-type")
    let errorData: any = {}

    if (contentType?.includes("application/json")) {
      try {
        errorData = await response.json()
      } catch {
        // Ignore JSON parsing errors
      }
    }

    const message = errorData.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`

    switch (response.status) {
      case 401:
        throw new AuthenticationError(message)
      case 403:
        throw new MasHubError(`Forbidden: ${message}`)
      case 404:
        throw new MasHubError(`Not found: ${message}`)
      case 429:
        throw new MasHubError(`Rate limit exceeded: ${message}`)
      case 500:
        throw new MasHubError(`Server error: ${message}`)
      default:
        throw new MasHubError(message)
    }
  }

  /**
   * Test API connectivity
   */
  async ping(): Promise<boolean> {
    try {
      await this.request("/health")
      return true
    } catch {
      return false
    }
  }

  /**
   * Get SDK configuration
   */
  getConfig(): Readonly<MasHubConfig> {
    return { ...this.config }
  }
}
