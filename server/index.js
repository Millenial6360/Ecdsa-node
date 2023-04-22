// const balances = {
//   //13c19c0ec2024075ebf64f175822896116a82cc2a60ffecfd3871c87e38b0576
//   "04fdeab0eaf806dc54341774107cebcb4aae7ee1e6b8769b0edfb0d039b790a3b7ff5450563adb76a21b93ba618b41964bfafce530d530c23a47abf446ef553b4f": 100,

//   //53945d2516f9bee1e143642cec9373e61788bbdc299926f7b1b336508c2fd3e2
//   "0497277765addc0018853e32206a0566b037b1a1e2a7cfec2067f03852607f9b5de010a1c3031a4b904faadca86a12c5eec38979f555c047ef34fdf59ad471e201": 50,

//   //721e1b56cfe1f0672075e4bdaae06cfd202d3629d0d36697e338a4a00fb85260
//   "04f529740b8ac467ce28ba6b1bf05f0d284b7d2fa149bf55da75bce270eda61e669e5522e0df84602d40e1244392e712043f042e86a18511a24eafe9cf63e0d21a": 75,
// };

const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;

const secp = require("ethereum-cryptography/secp256k1");
const { keccak256 } = require("ethereum-cryptography/keccak");
const { toHex } = require("ethereum-cryptography/utils");
let addressToNonceServer = {};
app.use(cors());
app.use(express.json());

const balances = {
  //  Private Key 13c19c0ec2024075ebf64f175822896116a82cc2a60ffecfd3871c87e38b0576
  "0x1c7984634a4525f89888": 100,
  // Private Key 53945d2516f9bee1e143642cec9373e61788bbdc299926f7b1b336508c2fd3e2
  "0xb92d6900a94096d62cc8": 50,
  // Private Key 721e1b56cfe1f0672075e4bdaae06cfd202d3629d0d36697e338a4a00fb85260
  "0xa33d1c22c12cc57d728f": 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.get("/accounts", (req, res) => {
  // console.log("hello") ;
  const accounts = [
    {
      privateKey:
        "13c19c0ec2024075ebf64f175822896116a82cc2a60ffecfd3871c87e38b0576",
    },
    {
      privateKey:
        "53945d2516f9bee1e143642cec9373e61788bbdc299926f7b1b336508c2fd3e2",
    },
    {
      privateKey:
        "721e1b56cfe1f0672075e4bdaae06cfd202d3629d0d36697e338a4a00fb85260",
    },
  ];
  Object.entries(balances).forEach(([address, balance], index) => {
    accounts[index] = {
      ...accounts[index],
      address,
      balance,
    };
  });
  console.log(accounts);
  res.json(accounts);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
app.post("/send", (req, res) => {
  const { signature, recoveryBit, amount, recipient, nextNonce } = req.body;
  const uint8ArrayMsg = Uint8Array.from([amount, recipient]);
  const messageHash = toHex(uint8ArrayMsg);

  // recovering public key from signature
  const publicKey = secp.recoverPublicKey(messageHash, signature, recoveryBit);

  // hash public key to get address
  const publicKeyHash = toHex(keccak256(publicKey));
  const sender = `0x${publicKeyHash.slice(-20)}`;
  //We take last 20 bits from publickeyHash as our address

  //Verification Step
  const isValidSign = secp.verify(signature, messageHash, toHex(publicKey));
  const doesAddressExists = !sender in addressToNonceServer;
  if (!doesAddressExists) {
    addressToNonceServer = { ...addressToNonceServer, [sender]: 0 };
  }
  let isNonceValid = nextNonce === addressToNonceServer[sender] + 1;
//   setInitialBalance(sender);
//   setInitialBalance(recipient);

  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  }
  else if (!isValidSign) {
    res.status(400).send({ message: "Invalid Signature" });
  } 
  else if (!isNonceValid) {
    res.status(400).send({ message: "Invalid Nonce" });
  } 
  else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    addressToNonceServer = {
      ...addressToNonceServer,
      [sender]: addressToNonceServer[sender] + 1,
    };
    res.send({
      balance: balances[sender],
      sender: sender,
      nonceFromServer: addressToNonceServer[sender],
    });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});
