import type { MasHubSDK } from "../client"
import type { SmartContractProject, SmartContractVersion, DeployedContract, DeploymentRequest } from "../types"

export class ContractsModule {
  constructor(private sdk: MasHubSDK) {}

  /**
   * Create a new smart contract project
   */
  async createProject(data: {
    project_name: string
    description?: string
  }): Promise<SmartContractProject> {
    const response = await this.sdk.request<SmartContractProject>("/smart-contracts/projects", {
      method: "POST",
      body: JSON.stringify(data),
    })
    return response.data
  }

  /**
   * List all smart contract projects
   */
  async listProjects(page = 1): Promise<{
    projects: SmartContractProject[]
    pagination: any
  }> {
    const response = await this.sdk.request(`/smart-contracts/projects?page=${page}`)
    return {
      projects: response.data.result || [],
      pagination: response.data.pagination || {},
    }
  }

  /**
   * Get project details
   */
  async getProject(projectSlug: string): Promise<SmartContractProject> {
    const response = await this.sdk.request<SmartContractProject>(`/smart-contracts/projects/${projectSlug}`)
    return response.data
  }

  /**
   * Create a new version for a project
   */
  async createVersion(
    projectSlug: string,
    data: {
      version: string
      compiler_settings: any
      contract_files: File[]
      packages?: string[]
    },
  ): Promise<SmartContractVersion> {
    const formData = new FormData()
    formData.append("version", data.version)
    formData.append("compiler_settings", JSON.stringify(data.compiler_settings))

    data.contract_files.forEach((file) => {
      formData.append("contract_files[]", file)
    })

    data.packages?.forEach((pkg) => {
      formData.append("packages[]", pkg)
    })

    const response = await this.sdk.request<SmartContractVersion>(`/smart-contracts/projects/${projectSlug}/versions`, {
      method: "POST",
      body: formData,
      headers: {
        // Remove Content-Type to let browser set it for FormData
        "Content-Type": undefined as any,
      },
    })
    return response.data
  }

  /**
   * Deploy a smart contract version
   */
  async deploy(projectSlug: string, versionSlug: string, deploymentRequest: DeploymentRequest): Promise<any> {
    const response = await this.sdk.request(`/smart-contracts/projects/${projectSlug}/versions/${versionSlug}/deploy`, {
      method: "POST",
      body: JSON.stringify(deploymentRequest),
    })
    return response.data
  }

  /**
   * List deployed contracts
   */
  async listDeployed(filters?: {
    version?: string
    deployment_id?: string
  }): Promise<{
    contracts: DeployedContract[]
    pagination: any
  }> {
    const params = new URLSearchParams()
    if (filters?.version) params.append("filter-version", filters.version)
    if (filters?.deployment_id) params.append("filter-deployment_id", filters.deployment_id)

    const queryString = params.toString()
    const endpoint = `/smart-contracts/deployed${queryString ? `?${queryString}` : ""}`

    const response = await this.sdk.request(endpoint)
    return {
      contracts: response.data.result || [],
      pagination: response.data.pagination || {},
    }
  }

  /**
   * Get contract details by address
   */
  async getContract(contractAddress: string): Promise<any> {
    const response = await this.sdk.request(`/smart-contracts/${contractAddress}`)
    return response.data
  }

  /**
   * Call a smart contract method (read-only)
   */
  async call(
    contractAddress: string,
    request: {
      from: string
      method_name: string
      contract_abi?: any[]
      params?: Record<string, any>
    },
  ): Promise<any> {
    const response = await this.sdk.request(`/smart-contracts/${contractAddress}/call`, {
      method: "POST",
      body: JSON.stringify(request),
    })
    return response.data
  }

  /**
   * Execute a smart contract method (write)
   */
  async execute(
    contractAddress: string,
    request: {
      wallet_options: {
        type: "organisation" | "end_user" | "non_custodial"
        address: string
      }
      method_name: string
      contract_abi?: any[]
      params?: Record<string, any>
      signed_trx?: string
      callback_url?: string
    },
  ): Promise<any> {
    const response = await this.sdk.request(`/smart-contracts/${contractAddress}/execute`, {
      method: "POST",
      body: JSON.stringify(request),
    })
    return response.data
  }
}
