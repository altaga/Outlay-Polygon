import {sign} from '@noble/ed25519';
import {HeliusAPI} from '@env';
import {Connection, Keypair} from '@solana/web3.js';
import {Elusiv, SEED_MESSAGE} from '@elusiv/sdk';


// Boilerplate code used by all samples

// Helper function to generate params used by all samples, namely a web3js connection, the keypair of the user, and the elusiv instance
export async function getParams(elusiv, keyPair, conn) {
  // Connect to devnet
  const conn = new Connection(
    `https://rpc.helius.xyz/?api-key=${HeliusAPI}`,
    'confirmed',
  );
  const seed = await sign(
    Buffer.from(SEED_MESSAGE, 'utf-8'),
    keyPair.secretKey.slice(0, 32),
  );

  // Create the elusiv instance
  const elusiv = await Elusiv.getElusivInstance(
    seed,
    keyPair.publicKey,
    conn,
    'mainnet-beta',
  );

  return {elusiv, keyPair, conn};
}

export function generatePrivateKey() {
  const kp = Keypair.generate();
  console.log('Private key (add this to constants.ts):');
  console.log(kp.secretKey);
  console.log('Public key (airdrop some sol to this):');
  console.log(kp.publicKey.toBase58());
  return kp;
}
