import { Lucid, WalletApi } from 'lucid-cardano';

export let lucid: Lucid | null = null;
export let wallet: WalletApi | null = null;
export let address: string | null = null;

export async function initLucid() {
  if (lucid) return lucid;
  
  const customProvider = {
    getProtocolParameters: async () => {
      return {
        minFeeA: 44,
        minFeeB: 155381,
        maxTxSize: 16384,
        maxValSize: 5000,
        keyDeposit: 2000000n,
        poolDeposit: 500000000n,
        priceMem: 0.0577,
        priceStep: 0.0000721,
        maxTxExMem: 14000000n,
        maxTxExSteps: 10000000000n,
        coinsPerUtxoByte: 4310n,
        collateralPercentage: 150,
        maxCollateralInputs: 3,
        costModels: { PlutusV1: {} },
        minfeeRefscriptCostPerByte: 15,
      };
    },
    getUtxos: async (addressOrCredential: any) => {
      if (lucid && wallet) {
        try {
          return await lucid.wallet.getUtxos();
        } catch (e) {
          console.error("Error getting UTXOs from wallet:", e);
          return [];
        }
      }
      return [];
    },
    getUtxosWithUnit: async (addressOrCredential: any, unit: string) => {
      if (lucid && wallet) {
        try {
          const utxos = await lucid.wallet.getUtxos();
          return utxos.filter(utxo => !!utxo.assets[unit]);
        } catch (e) {
          console.error("Error getting UTXOs with unit from wallet:", e);
          return [];
        }
      }
      return [];
    },
    getDatum: async (datumHash: string) => {
      throw new Error("Datum query not supported in local provider");
    },
    awaitTx: async (txHash: string, checkInterval?: number) => {
      return true;
    },
    submitTx: async (tx: string) => {
      if (wallet) {
        return await wallet.submitTx(tx);
      }
      throw new Error("Wallet not connected");
    }
  };

  lucid = await Lucid.new(customProvider as any, 'Preprod');
  return lucid;
}

export async function connectWallet(walletName: string) {
  const cardano = (window as any).cardano;
  
  if (!cardano?.[walletName]) {
    throw new Error(`${walletName} wallet not found. Install Nami or Eternl.`);
  }

  const walletApi: WalletApi = await cardano[walletName].enable();
  const l = await initLucid();
  l.selectWallet(walletApi);

  wallet = walletApi;
  address = await l.wallet.address();

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('cardano-wallet-changed', {
      detail: { address, connected: true }
    }));
  }

  return { wallet, address };
}

export async function disconnectWallet() {
  wallet = null;
  address = null;
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('cardano-wallet-changed', {
      detail: { address: null, connected: false }
    }));
  }
}

export async function signMessage(message: string) {
  if (!lucid || !wallet) throw new Error('Wallet not connected');
  
  const signature = await lucid.newMessage(address!, message).sign();
  return signature;
}

export async function mintNXTP(amount: number): Promise<string> {
  if (!lucid || !address) throw new Error('Wallet not connected');

  // 1. Get the user's Public Key Hash to create a simple Native Minting Policy
  const { paymentCredential } = lucid.utils.getAddressDetails(address);
  if (!paymentCredential?.hash) throw new Error('Could not get payment credential hash');

  const mintingPolicy = lucid.utils.nativeScriptFromJson({
    type: "sig",
    keyHash: paymentCredential.hash,
  });

  const policyId = lucid.utils.mintingPolicyToId(mintingPolicy);

  // 2. Define the token name (hex encoded "NXTP")
  const toHex = (str: string) =>
    Array.from(new TextEncoder().encode(str))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  const tokenName = toHex("NXTP");
  const unit = policyId + tokenName;

  // 3. Gather UTxOs and ensure the wallet has enough lovelace for the transaction
  const utxos = await lucid.wallet.getUtxos();
  const totalLovelace = utxos.reduce((sum, u) => sum + (u.assets.lovelace ?? 0n), 0n);
  
  // In Cardano, every UTxO containing native assets must carry a minimum ADA amount (usually ~1.4 to 1.5 ADA)
  // to prevent spam and ledger bloat. 2,000,000 lovelace (2 ADA) is a safe, standard amount.
  const minAdaForToken = 2_000_000n;
  const safetyBuffer = 3_000_000n; // 3 ADA to cover transaction fees and change output
  const requiredLovelace = minAdaForToken + safetyBuffer;
  
  if (totalLovelace < requiredLovelace) {
    throw new Error(
      `Insufficient ADA in wallet. You have ${Number(totalLovelace) / 1_000_000} ADA, but need at least ${
        Number(requiredLovelace) / 1_000_000
      } ADA (5 ADA) to cover the Cardano min-UTxO requirement and transaction fees.`
    );
  }

  // 4. Build the transaction – spend all gathered UTxOs and return change automatically
  const tx = await lucid
    .newTx()
    .collectFrom(utxos)
    .mintAssets({ [unit]: BigInt(amount) })
    .payToAddress(address, {
      lovelace: minAdaForToken, // minimal ADA for the token output
      [unit]: BigInt(amount),
    })
    .validTo(Date.now() + 100_000) // Valid for roughly 100 seconds
    .attachMintingPolicy(mintingPolicy)
    .complete();

  // 5. Sign and submit
  const signedTx = await tx.sign().complete();
  const txHash = await signedTx.submit();

  return txHash;
}
// 172: Export function to withdraw NXTP tokens to a specified address
export async function withdrawNXTP(toAddress: string, amount: number = 200): Promise<string> {
  if (!lucid || !wallet || !address) throw new Error('Wallet not connected');

  // Derive token unit (policyId + tokenName) based on user's payment credential
  const { paymentCredential } = lucid.utils.getAddressDetails(address);
  if (!paymentCredential?.hash) throw new Error('Could not get payment credential hash');

  const mintingPolicy = lucid.utils.nativeScriptFromJson({
    type: "sig",
    keyHash: paymentCredential.hash,
  });
  const policyId = lucid.utils.mintingPolicyToId(mintingPolicy);
  const toHex = (str: string) =>
    Array.from(new TextEncoder().encode(str))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  const tokenName = toHex("NXTP");
  const unit = policyId + tokenName;

  // Gather UTxOs containing the NXTP token
  const utxos = await lucid.wallet.getUtxos();
  const tokenUtxos = utxos.filter((u) => u.assets[unit] && u.assets[unit] >= BigInt(amount));
  if (tokenUtxos.length === 0) {
    throw new Error('Insufficient NXTP balance to withdraw');
  }

  // Ensure the selected UTxOs also provide enough ADA for the min‑UTxO requirement
  const totalLovelace = tokenUtxos.reduce((sum, u) => sum + (u.assets.lovelace ?? 0n), 0n);
  const minAdaForToken = 2_000_000n; // 2 ADA minimum for token output
  const safetyBuffer = 3_000_000n; // extra to cover fees and change
  const requiredLovelace = minAdaForToken + safetyBuffer;
  if (totalLovelace < requiredLovelace) {
    throw new Error(`Insufficient ADA in wallet. You have ${Number(totalLovelace) / 1_000_000} ADA, but need at least ${Number(requiredLovelace) / 1_000_000} ADA for the transaction.`);
  }

  // Build the transaction to send NXTP (and required ADA) to the NEXTai address
  const tx = await lucid
    .newTx()
    .collectFrom(tokenUtxos)
    .payToAddress(toAddress, { lovelace: minAdaForToken, [unit]: BigInt(amount) })
    .validTo(Date.now() + 100_000)
    .complete();

  const signedTx = await tx.sign().complete();
  const txHash = await signedTx.submit();
  return txHash;
}

// End of file

// Utility to get user's NXTP balance
export async function getNXTPBalance(): Promise<bigint> {
  if (!lucid || !address) throw new Error('Wallet not connected');
  const { paymentCredential } = lucid.utils.getAddressDetails(address);
  if (!paymentCredential?.hash) throw new Error('Could not get payment credential hash');
  const mintingPolicy = lucid.utils.nativeScriptFromJson({
    type: "sig",
    keyHash: paymentCredential.hash,
  });
  const policyId = lucid.utils.mintingPolicyToId(mintingPolicy);
  const toHex = (str: string) =>
    Array.from(new TextEncoder().encode(str))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  const tokenName = toHex("NXTP");
  const unit = policyId + tokenName;
  const utxos = await lucid.wallet.getUtxos();
  const tokenUtxos = utxos.filter((u) => u.assets[unit]);
  const totalToken = tokenUtxos.reduce((sum, u) => sum + (u.assets[unit] ?? 0n), 0n);
  return totalToken;
}

