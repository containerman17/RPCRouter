import Web3 from "web3";

var web3 = new Web3("http://localhost:3024/r/fantom")

const pause = 100

async function main() {
    const ACCOUNT = "0xFC00FACE00000000000000000000000000000000"

    // 1 hour from now
    const endAt = Date.now() + 60 * 60 * 1000;

    while (Date.now() < endAt) {
        const loopStart = Date.now();
        try {
            console.time("getBalance");
            await web3.eth.getBalance(ACCOUNT)
            console.timeEnd("getBalance");
        } catch (e) {
            console.log(e);
        }
        await new Promise((resolve) => setTimeout(resolve, pause - (Date.now() - loopStart)));
    }

    console.log("Done");
}

main().catch((e) => { console.log(e) });