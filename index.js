require('dotenv').config();
const Web3 = require('web3');
const axios = require('axios');

const web3 = new Web3(process.env.RPC_URL);
const { PRIVATE_KEY, WALLET_ADDRESS } = process.env;

const routerAddress = '0x10ED43C718714eb63d5aA57B78B54704E256024E';
const routerAbi = [{"inputs":[{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactETHForTokens","outputs":[{"internalType":"uint256[]","name":"","type":"uint256[]"}],"stateMutability":"payable","type":"function"}];
const router = new web3.eth.Contract(routerAbi, routerAddress);

const tokenIn = '0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82'; // CAKE
const tokenOut = '0x55d398326f99059ff775485246999027b3197955'; // USDT

const limitBuyPrice = 2.58;

async function monitorPriceAndBuy() {
  try {
    const res = await axios.get('https://api.dexscreener.com/latest/dex/pairs/bsc/0x0ed7e52944161450477ee417de9cd3a859b14fd0');
    const price = parseFloat(res.data.pair.priceUsd);
    console.log(`[${new Date().toLocaleTimeString()}] Harga CAKE: $${price}`);

    if (price <= limitBuyPrice) {
      console.log('✅ Harga di bawah limit. Proses pembelian...');

      const amountOutMin = 0;
      const amountIn = web3.utils.toWei('0.01', 'ether');

      const tx = router.methods.swapExactETHForTokens(
        amountOutMin,
        [tokenOut, tokenIn],
        WALLET_ADDRESS,
        Math.floor(Date.now() / 1000) + 60 * 10
      );

      const gas = await tx.estimateGas({ from: WALLET_ADDRESS, value: amountIn });
      const data = tx.encodeABI();
      const nonce = await web3.eth.getTransactionCount(WALLET_ADDRESS);

      const signedTx = await web3.eth.accounts.signTransaction(
        {
          to: routerAddress,
          data,
          gas,
          value: amountIn,
          nonce,
        },
        PRIVATE_KEY
      );

      const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
      console.log('✅ Transaksi berhasil:', receipt.transactionHash);
    }
  } catch (err) {
    console.error('❌ Gagal:', err.message);
  }
}

setInterval(monitorPriceAndBuy, 30000);
