const fetch = require("node-fetch")
const Caver = require('caver-js');
const caver = new Caver('https://public-node-api.klaytnapi.com/v1/cypress')

const testWalletAddress = '0x29235E03736Ee9E9CC4FaC94886E0850EE2C267B';
const testWalletPrivKey = '0xe88d20384cd1cb99e5e27c3a47d90eb92d65085f617270cd6eda81680f70d081';

// per와 동일한 코드로 배포한 contract address
const testTokenAddress = '0xAdd79497B4875a9226345925a6EBa52B026A3963'
const burnAbi = [
    {
        "constant": false,
        "inputs": [
            {
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "burn",
        "outputs": [
            {
                "name": "success",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    }
]
const burnContract = new caver.klay.Contract(burnAbi, testTokenAddress);





// kas api를 통한 getBalance
KASgetBalance = () => {
    fetch(`https://kip7-api.klaytnapi.com/v1/contract/${testTokenAddress}/account/${testWalletAddress}/balance`, {
        method: 'GET',
        headers: {
            Authorization: "Basic S0FTS0lWWVdOUjg3TlVJMFhZUk5GQ0tJOlRBRVRBaENtb1cxZWtaOVRBUUUrem1SZlB4a2tNZWlhd1FoRDZ5REk=",
            "Content-Type": "application/json",
            "X-Chain-Id": "8217"
        },
    })
        .then((response) => response.json())
        .then((responseJson) => {
            console.log(`현재 밸런스 :${caver.utils.hexToNumberString(responseJson.balance)}`)
            // testBurn()
        })
        .catch((error) => {
            console.log(error)
        })
}


// per와 동일한 코드로 배포한 토큰 컨트랙트 burn 실행 함수
testBurn = async () => {
    const account = caver.klay.accounts.createWithAccountKey(
        testWalletAddress,
        testWalletPrivKey,
    );

    let abiBurn = burnContract.methods
        .burn(1000000000000000)
        .encodeABI();

    let spender = await caver.wallet.getKeyring(testWalletAddress);

    if (spender == undefined) {
        try {
            spender = caver.wallet.newKeyring(testWalletAddress, testWalletPrivKey);
        } catch (err) {
            console.log(err);
        }
    }

    let tokenTransferTx = new caver.transaction.smartContractExecution(
        {
            from: account.address,
            to: testTokenAddress,
            input: abiBurn,
            gas: 90000,
        },
    );

    try {
        await caver.wallet.sign(testWalletAddress, tokenTransferTx);
        const receipt = await caver.rpc.klay.sendRawTransaction(
            tokenTransferTx.getRLPEncoding(),
        );
        const TX_HASH = receipt.transactionHash;
        console.log(TX_HASH);
    } catch (err) {
        console.log(err);
    }
}



// 실행 스크립트
const run = async () => {
    await KASgetBalance();
    await testBurn();
    await KASgetBalance();
}



run()