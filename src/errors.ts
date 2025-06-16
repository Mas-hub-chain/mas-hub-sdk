export class MasHubError extends Error {
  public readonly code: string
  public readonly statusCode?: number

  constructor(message: string, code = "MASHUB_ERROR", statusCode?: number) {
    super(message)
    this.name = "MasHubError"
    this.code = code
    this.statusCode = statusCode
  }
}

export class AuthenticationError extends MasHubError {
  constructor(message = "Authentication failed") {
    super(message, "AUTHENTICATION_ERROR", 401)
    this.name = "AuthenticationError"
  }
}

export class NetworkError extends MasHubError {
  constructor(message = "Network request failed") {
    super(message, "NETWORK_ERROR")
    this.name = "NetworkError"
  }
}

export class ValidationError extends MasHubError {
  constructor(message = "Validation failed") {
    super(message, "VALIDATION_ERROR", 400)
    this.name = "ValidationError"
  }
}

export class RateLimitError extends MasHubError {
  constructor(message = "Rate limit exceeded") {
    super(message, "RATE_LIMIT_ERROR", 429)
    this.name = "RateLimitError"
  }
}
