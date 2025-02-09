# Token Swap on Solana

This project demonstrates how to perform token swaps on the Solana blockchain using various APIs and libraries.

## Prerequisites

- Node.js
- npm or yarn
- Solana CLI
- A Solana wallet with some SOL for transaction fees

## Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/woremixituki/token-swap.git
    cd token-swap
    ```

2. Install dependencies:
    ```sh
    npm install
    # or
    yarn install
    ```

## Configuration

Create a `config.ts` file in the root directory and add the following configuration:

```ts
export const coin_gecko_api = "YOUR_COIN_GECKO_API_KEY";
export const connection = new Connection("https://api.mainnet-beta.solana.com");
export const jito_engine = "https://jito.engine.url";
export const jito_fee = 0.0001; // Fee in SOL
export const jito_tip_account = "JitoTipAccountPublicKey";
export const juipter_quote_url = "https://quote.api.juipter.url";
export const juipter_swap_url = "https://swap.api.juipter.url";
export const wallet = new Wallet("path/to/your/wallet/keypair.json");
```

## Usage

### Fetch Decimal Places for a Token

```ts
const decimal = await getDecimal("TokenMintAddress");
console.log(`Decimal places: ${decimal}`);
```

### Create and Serialize a Tip Transaction

```ts
const serializedTipTx = await createAndSerializeTipTransaction(wallet, connection);
console.log(`Serialized Tip Transaction: ${serializedTipTx}`);
```

### Execute a Token Swap

```ts
await validateAndExecuteSwap(
  "So11111111111111111111111111111111111111112",
  "CLoUDKc4Ane7HeQcPpE3YHnznRxhMimJ4MyaUqyHFzAu",
  0.005
);
```

## Example

To run the example provided in the script:

```sh
npm start
# or
yarn start
```

This will validate the token addresses, perform the token swap, and send the transactions as a bundle to the Jito network.

## License

This project is licensed under the MIT License.