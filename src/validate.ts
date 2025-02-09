import { PublicKey } from "@solana/web3.js";

export const validateSolanaAddress = (address:string) => {
  try {
    new PublicKey(address);
    return true;
  } catch (e) {
    return false;
  }
};