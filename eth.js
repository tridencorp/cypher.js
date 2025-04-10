import { ethers } from 'ethers';

class Address {
  constructor() {
    // TODO: encrypt priv key before returning it
    const wallet = ethers.Wallet.createRandom();

    this.address = wallet.address;
    this.prv = wallet.privateKey;
    this.pub = wallet.publicKey;
  }
}

// Generate public address with priv/pub keys.
export function address() {
  return new Address();
}
