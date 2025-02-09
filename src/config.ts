import { Wallet } from "@project-serum/anchor";
import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import { Connection, Keypair } from "@solana/web3.js";
import { config } from "dotenv";

config();

export const RPC_URL = process.env.SOLANA_RPC_URL || "";

export const connection = new Connection(RPC_URL);

export const wallet = new Wallet(Keypair.fromSecretKey(bs58.decode(process.env.PRIVATE_KEY || '')));

export const jito_engine = "https://amsterdam.mainnet.block-engine.jito.wtf:443";

export const jito_fee: number = parseFloat(process.env.JITO_FEES || '0.0005');

export const jito_tip_account = '96gYZGLnJYVFmbjzopPSU6QiEV5fGqZNyN9nmNhvrZU5';

export const juipter_quote_url = 'https://api.jup.ag/swap/v1/quote';

export const juipter_swap_url = `https://api.jup.ag/swap/v1/swap`;

export const coin_gecko_api = process.env.COIN_GECKO_API || ""