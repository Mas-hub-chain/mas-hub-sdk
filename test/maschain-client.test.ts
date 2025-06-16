import { MasChainClient } from "@/lib/maschain/client"

// Mock fetch globally
global.fetch = jest.fn()

describe("MasChainClient", () => {
  let client: MasChainClient
  const mockConfig = {
    apiUrl: "https://api.maschain.com",
    clientId: "test-client-id",
    clientSecret: "test-client-secret",
    network: "testnet" as const,
  }

  beforeEach(() => {
    client = new MasChainClient(mockConfig)
    jest.clearAllMocks()
  })

  describe("createToken", () => {
    it("should create a token successfully", async () => {
      // Mock authentication
      ;(fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ access_token: "mock-token" }),
        })
        // Mock token creation
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              transaction_hash: "0x123456789",
              token_id: "token-123",
            }),
        })

      const request = {
        asset_type: "invoice",
        metadata: {
          name: "Test Invoice",
          description: "Test invoice token",
          quantity: 1,
        },
        tenant_id: "user-123",
      }

      const result = await client.createToken(request)

      expect(result.success).toBe(true)
      expect(result.transaction_hash).toBe("0x123456789")
      expect(fetch).toHaveBeenCalledTimes(2)
    })

    it("should handle authentication failure", async () => {
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: "Invalid credentials" }),
      })

      const request = {
        asset_type: "invoice",
        metadata: {
          name: "Test Invoice",
          description: "Test invoice token",
          quantity: 1,
        },
        tenant_id: "user-123",
      }

      await expect(client.createToken(request)).rejects.toThrow("Invalid credentials")
    })
  })

  describe("performKYC", () => {
    it("should perform KYC verification successfully", async () => {
      // Mock authentication
      ;(fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ access_token: "mock-token" }),
        })
        // Mock KYC verification
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              risk_score: 25.5,
              risk_level: "low_risk",
              verified: true,
            }),
        })

      const request = {
        wallet_address: "0x742d35Cc6634C0532925a3b8D0C9964E8f3a",
      }

      const result = await client.performKYC(request)

      expect(result.success).toBe(true)
      expect(result.data.risk_score).toBe(25.5)
      expect(result.data.verified).toBe(true)
    })
  })
})
