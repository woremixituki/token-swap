import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  VersionedTransaction,
} from "@solana/web3.js";
import fetch from "cross-fetch";
import {
  coin_gecko_api,
  connection,
  jito_engine,
  jito_fee,
  jito_tip_account,
  juipter_quote_url,
  juipter_swap_url,
  wallet,
} from "./config";
import { Wallet } from "@project-serum/anchor";
import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import axios from "axios";
import { convertBase64ToBase58 } from "./utils";
import { validateSolanaAddress } from "./validate";

// Fetch the decimal places for a given token mint address
const getDecimal = async (mintAddress: string): Promise<number> => {
  const response = await axios.get(
    `https://pro-api.coingecko.com/api/v3/onchain/networks/solana/tokens/${mintAddress}/info`,
    {
      headers: {
        accept: "application/json",
        "x-cg-pro-api-key": coin_gecko_api,
      },
    }
  );
  return response.data.data.attributes.decimals;
};

// Create a transaction to tip the Jito network
const createTipTransaction = async (
  wallet: Wallet,
  connection: Connection
): Promise<Transaction> => {
  if (!wallet?.publicKey || typeof wallet.signTransaction !== "function") {
    throw new Error("Invalid wallet object");
  }

  const tipTx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: wallet.publicKey,
      toPubkey: new PublicKey(jito_tip_account),
      lamports: jito_fee * LAMPORTS_PER_SOL,
    })
  );

  tipTx.feePayer = wallet.publicKey;
  tipTx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

  try {
    await wallet.signTransaction(tipTx);
  } catch (error) {
    console.error("%cError signing transaction.", "color: red;", error);
    throw error;
  }
  return tipTx;
};

// Send a bundle of transactions to the Jito network
const sendTransactionBundle = async (transactions: string[]): Promise<void> => {
  const url = `${jito_engine}/api/v1/bundles`;
  const data = {
    id: 1,
    jsonrpc: "2.0",
    method: "sendBundle",
    params: [transactions],
  };

  try {
    const response = await axios.post(url, data, {
      headers: { "Content-Type": "application/json" },
    });
    if (response.data.result) {
      console.log(
        `%chttps://explorer.jito.wtf/bundle/${response.data.result}`,
        "color: green;"
      );
    } else {
      console.log("%c⚠️ No result in response data", "color: orange;");
    }
  } catch (error) {
    console.error("%cError sending transaction bundle.", "color: red;", error);
  }
};

// Get Transaction using Jupiter API
const performTokenSwap = async (
  inputToken: string,
  outputToken: string,
  amount: number,
  decimal: number
): Promise<{ transactionBinary: string; estimatedAmount: number }> => {
  const swapAmount = amount * 10 ** decimal;

  const quoteResponse = await (
    await fetch(
      `${juipter_quote_url}?inputMint=${inputToken}&outputMint=${outputToken}&amount=${swapAmount}&slippageBps=50&restrictIntermediateTokens=true`
    )
  ).json();

  const swapResponse = await (
    await fetch(juipter_swap_url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        quoteResponse,
        userPublicKey: wallet.publicKey.toString(),
        dynamicComputeUnitLimit: true,
        dynamicSlippage: true,
        prioritizationFeeLamports: {
          priorityLevelWithMaxLamports: {
            maxLamports: 1000000,
            priorityLevel: "veryHigh",
          },
        },
      }),
    })
  ).json();

  const transactionBase64 = swapResponse.swapTransaction;
  const transaction = VersionedTransaction.deserialize(
    Buffer.from(transactionBase64, "base64")
  );

  transaction.sign([wallet.payer]);

  return {
    transactionBinary: bs58.encode(transaction.serialize()),
    estimatedAmount: quoteResponse.outAmount,
  };
};

// Create and serialize a tip transaction
const createAndSerializeTipTransaction = async (
  wallet: Wallet,
  connection: Connection
): Promise<string> => {
  const tipTx = await createTipTransaction(wallet, connection);
  const b64tipTx = tipTx.serialize().toString("base64");
  return convertBase64ToBase58(b64tipTx);
};

// Execute a token swap and send the transactions as a bundle
const executeSwap = async (
  tokenA: string,
  tokenB: string,
  amount: number
): Promise<void> => {
  const decimal = await getDecimal(tokenA);

  const { estimatedAmount, transactionBinary: firstTx } =
    await performTokenSwap(tokenA, tokenB, amount, decimal);
  const { transactionBinary: secondTx } = await performTokenSwap(
    tokenB,
    tokenA,
    estimatedAmount / 10 ** decimal,
    decimal
  );

  const jitoTipTx = await createAndSerializeTipTransaction(wallet, connection);

  await sendTransactionBundle([firstTx, secondTx, jitoTipTx]);
};

// Validate token addresses and execute the swap
const validateAndExecuteSwap = async (
  tokenA: string,
  tokenB: string,
  amount: number
): Promise<void> => {
  if (!validateSolanaAddress(tokenA) || !validateSolanaAddress(tokenB)) {
    throw new Error("Invalid token address");
  }
  await executeSwap(tokenA, tokenB, amount);
};

// Example usage
validateAndExecuteSwap(
  "So11111111111111111111111111111111111111112",
  "CLoUDKc4Ane7HeQcPpE3YHnznRxhMimJ4MyaUqyHFzAu",
  0.005
);
