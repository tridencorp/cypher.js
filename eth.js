import { ethers } from 'ethers';

class Address {
  constructor() {
    // TODO: encrypt priv key before returning it
    this.wallet = ethers.Wallet.createRandom();

    this.address = this.wallet.address;
    this.prv = this.wallet.privateKey;
    this.pub = this.wallet.publicKey;
  }
  
  // Sign data with private key
  sign(message) {
    return this.wallet.signMessage(message)
  }
}

// Generate public address with priv/pub keys.
export function address() {
  return new Address();
}
