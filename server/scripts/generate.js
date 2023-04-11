const secp = require("ethereum-cryptography/secp256k1") ;
const { toHex } = require("ethereum-cryptography/utils") ;

const privateKey = secp.utils.randomPrivateKey();

console.log("this is private key", toHex(privateKey)) ;

//generating public key from private key
const publicKey = secp.getPublicKey(privateKey) ;
console.log("this is public key", toHex(publicKey)) ;