const secp = require("ethereum-cryptography/secp256k1") ;
const { toHex } = require("ethereum-cryptography/utils") ;
const { keccak256 } = require("ethereum-cryptography/keccak");

// const privateKey = secp.utils.randomPrivateKey();
const privateKey = "721e1b56cfe1f0672075e4bdaae06cfd202d3629d0d36697e338a4a00fb85260";

console.log("this is private key", privateKey) ;

//generating public key from private key
const publicKey = secp.getPublicKey(privateKey) ;
const publicKeyHash = toHex(keccak256(publicKey));
// We are gonna slive 20 bits (taking last 20 bits) ;

console.log("this is public key after processing", `0x${publicKeyHash.slice(-20)}`) ;