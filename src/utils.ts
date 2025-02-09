// Import the bs58 utility from the @project-serum/anchor package
import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";

// Function to convert a Base64 encoded string to a Base58 encoded string
export const convertBase64ToBase58 = (base64String: string) => 
    // Decode the Base64 string to a Buffer, then encode it to a Base58 string
    bs58.encode(Buffer.from(base64String, "base64"));