import { Tab } from "@headlessui/react";

const exampleWeb3 = `import Web3 from 'web3';
const routerUrl = "http://127.0.0.1:3034/r/TOKEN"
const web3 = new Web3(
    new Web3.providers.HttpProvider(routerUrl),
);
`

const exampleEhersJs = `import { ethers } from "ethers";
const routerUrl = "http://127.0.0.1:3034/r/TOKEN"
const provider = new ethers.providers.JsonRpcProvider(routerUrl);
`

const exampleCurl = `curl http://127.0.0.1:3034/r/TOKEN \\
  -X POST \\
  -H "Content-Type: application/json" \\
  --data '{"method":"eth_chainId","params":[],"id":1,"jsonrpc":"2.0"}'
`

const web3Py = `from web3 import Web3
routerUrl = "http://127.0.0.1:3034/r/TOKEN"
web3 = Web3(Web3.HTTPProvider(routerUrl))
`

export default function IntegrationCode() {
    return (
        <Tab.Group>
            <div className="px-4 sm:px-0 mx-auto max-w-2xl sm:mx-0 sm:max-w-none">
                <div className="sm:mt-4 overflow-hidden rounded-xl bg-gray-900 ring-1 ring-white/10">
                    <div className="flex bg-gray-800 ring-1 ring-white/5">
                        <Tab.List className="-mb-px flex text-sm font-medium leading-6 text-gray-400">

                            {
                                ["web3.ts", "ethers.ts", "curl.sh", "web3.py"].map((item) => (
                                    <Tab
                                        key={item}
                                        className=" border-r border-gray-600/10 px-4 py-2 outline-none ui-selected:bg-gray-900 ui-selected:text-white"
                                    >
                                        {item}
                                    </Tab>
                                ))
                            }
                            {/* <Tab className="border-r border-gray-600/10 px-4 py-2">ethers.ts</Tab>
                                <Tab className="border-r border-gray-600/10 px-4 py-2">curl.sh</Tab>
                                <Tab className="border-r border-gray-600/10 px-4 py-2">web3.py</Tab> */}
                        </Tab.List>
                    </div>
                    <Tab.Panels>
                        {[exampleWeb3, exampleEhersJs, exampleCurl, web3Py].map((item, index) => (
                            <Tab.Panel key={index} as="pre" className="text-xs px-6 pb-14 pt-6 text-white whitespace-prewrap">{item}</Tab.Panel>
                        ))}
                    </Tab.Panels>
                </div>
            </div>
        </Tab.Group >
    )
}
