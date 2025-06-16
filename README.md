# MAS Hub SDK

Official TypeScript SDK for interacting with the MAS Hub blockchain platform.

## Features

- Smart contract management (deploy, interact, query)
- Tokenization services
- Compliance (KYC/AML) integration
- Real-time analytics
- Type-safe API interactions

## Installation

```bash
npm install mas-hub-sdk
# or
yarn add mas-hub-sdk
```

## Basic Usage

```typescript
import { MasHubSDK } from 'mas-hub-sdk'

const sdk = new MasHubSDK({
  apiKey: 'your-api-key',
  environment: 'production' // or 'staging', 'development'
})

// Example: Create a smart contract project
const project = await sdk.contracts.createProject({
  project_name: 'MyContract',
  description: 'My first smart contract'
})
```

## Modules

- **Contracts**: Smart contract lifecycle management
- **Tokens**: Asset tokenization
- **Compliance**: KYC/AML verification
- **Analytics**: Platform metrics and insights

## Documentation

Full API documentation available at [mas-hub.vercel.app/docs](https://mas-hub.vercel.app/docs)

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](LICENSE)
