import { MasHubSDK } from "../src/client"
import { jest, expect } from '@jest/globals'

// Complete mock fetch implementation
const mockFetch = jest.fn()
global.fetch = mockFetch as jest.MockedFunction<typeof fetch>

function createMockResponse(body: any, status: number = 200) {
  const headers = new Map()
  headers.set('content-type', 'application/json')
  
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 401 ? 'Unauthorized' : 'OK',
    headers: {
      get: (key: string) => headers.get(key),
      forEach: (fn: (value: string, key: string) => void) => headers.forEach(fn)
    },
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(JSON.stringify(body)),
  })
}

describe("MasHubSDK", () => {
  let client: MasHubSDK;
  const mockConfig = {
    apiKey: "test-api-key",
    baseUrl: "https://api.mas-hub.vercel.app",
  }

  beforeEach(() => {
    client = new MasHubSDK(mockConfig)
    jest.clearAllMocks()
  })

  describe("request", () => {
    it("should make successful API requests", async () => {
      mockFetch.mockImplementation(() => createMockResponse(
        { success: true, data: "test" },
        200
      ))

      const response = await client.request("/test", {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })
      expect(response).toEqual({
        success: true,
        data: {
          success: true,
          data: "test"
        },
        status: 200,
        headers: {
          "content-type": "application/json"
        }
      })
    })

    it("should handle API errors", async () => {
      mockFetch.mockImplementation(() => createMockResponse(
        { message: "Unauthorized" },
        401
      ))

      await expect(client.request("/test", {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })).rejects.toThrow("Unauthorized")
    })
  })

  describe("ping", () => {
    it("should return true for successful ping", async () => {
      mockFetch.mockImplementation(() => createMockResponse(
        { success: true },
        200
      ))

      const result = await client.ping()
      expect(result).toBe(true)
    })
  })
})
