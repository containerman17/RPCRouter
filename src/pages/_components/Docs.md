RPCRouter is an open-source project that consolidates multiple blockchain RPC endpoints into a single, high-availability, low-latency endpoint, ensuring optimal and reliable RPC services for your applications.

# Get started with RPCRouter

Save this file as docker-compose.yml, cd to the directory and run `docker compose pull && docker-compose up -d` to start the router.

```yaml
services:
  rpcrouter:
    container_name: rpcrouter
    image: "containerman17/rpcrouter:v1.0.0" # make sure to run docker-compose pull to get the latest version
    restart: always
    ports:
      - "3024:3024" # or "127.0.0.1:3024:3024" if you want to bind to localhost only
    environment:
      - "RPCROUTER_CROSS_CHECKS=0" # 0 - disable, 1 - double check (1 extra), 2 - triple check (2 extra)
      # the format is "RPCROUTER_URL_<network>_<index>=<url>"
      - "RPCROUTER_URL_fuji_1=https://ava-testnet.public.blastapi.io/ext/bc/C/rpc"
      - "RPCROUTER_URL_fuji_2=https://rpc.ankr.com/avalanche_fuji"
      - "RPCROUTER_URL_fuji_3=https://avalanche-fuji.blockpi.network/v1/rpc/public"
      # another network
      - "RPCROUTER_URL_fantom_1=https://rpc.ankr.com/fantom"
      - "RPCROUTER_URL_fantom_2=https://rpc.fantom.network"
      - "RPCROUTER_URL_fantom_3=https://fantom.blockpi.network/v1/rpc/public"
```

We recommend co-locating your router with your code. For frontend applications, you should deploy RPCRouter on fly.io in multiple regions.

## Configuration
The configuration for RPCRouter is done through environment variables. Below is a description of the configuration options used in the example above:

- `RPCROUTER_CROSS_CHECKS`: This variable controls the cross-checking mechanism. It can be set to:
  - `0`: Disable cross-checks.
  - `1`: Enable double-checking (one extra check).
  - `2`: Enable triple-checking (two extra checks).

- `RPCROUTER_URL_<network>_<index>`: These variables define the RPC endpoints for different networks. The format is `RPCROUTER_URL_<network>_<index>=<url>`, where:
  - `<network>` is a string representing the name of the blockchain network (e.g., `network1`, `network2`).
  - `<index>` is a unique index for each endpoint of the network.
  - `<url>` is the URL of the RPC endpoint.

In the example provided, the following endpoints are configured:

- For the `network1`:
  - `RPCROUTER_URL_network1_1=https://example1.com/rpc`
  - `RPCROUTER_URL_network1_2=https://example2.com/rpc`
  - `RPCROUTER_URL_network1_3=https://example3.com/rpc`

- For the `network2`:
  - `RPCROUTER_URL_network2_1=https://example4.com/rpc`
  - `RPCROUTER_URL_network2_2=https://example5.com/rpc`
  - `RPCROUTER_URL_network2_3=https://example6.com/rpc`

These environment variables should be set in the `docker-compose.yml` file to configure RPCRouter with the desired endpoints and cross-checking behavior.


## Replace Your Current Endpoints
RPCRouter endpoints seamlessly integrate with your web3 application as standard endpoints. No modifications are necessary to amalgamate multiple RPC endpoints into a singular, reliable, and low-latency endpoint.

### JS/TS web3.js
```js
import Web3 from 'web3';
const routerUrl = "http://127.0.0.1:3034/r/fuji"
const web3 = new Web3(
    new Web3.providers.HttpProvider(routerUrl),
);
```

### JS/TS ethers.js
```js
import { ethers } from "ethers";
const routerUrl = "http://127.0.0.1:3034/r/fuji"
const provider = new ethers.providers.JsonRpcProvider(routerUrl);
```

### Bash + curl
```bash
curl http://127.0.0.1:3034/r/TOKEN \
  -X POST \
  -H "Content-Type: application/json" \
  --data '{"method":"eth_chainId","params":[],"id":1,"jsonrpc":"2.0"}'
```

### Python web3.py
```python
from web3 import Web3
routerUrl = "http://127.0.0.1:3034/r/TOKEN"
web3 = Web3(Web3.HTTPProvider(routerUrl))
```

## Websocket Support


### Regular requests

RPCRouter works in HTTP->WebSocket, WebSocket->HTTP, HTTP->HTTP, and WebSocket->WebSocket modes.

Protocol concerns are eliminated, as RPCRouter establishes dual HTTP/WS connections to each node, optimizing through a latency prediction model.

**Quick tip:** Opt for WS endpoints when available — they reduce latency by milliseconds effortlessly.

### eth_subscribe and eth_unsubscribe

Subscribe and unsubscribe methods are not available yet.

## Latency prediction
RPCRouter keeps track of the last 10 requests to each endpoint, measuring success and response time. For every request, an endpoint with the lowest latency is chosen. Retries are treated as long-running requests. To prevent the router from getting stuck in a local optimum, stats are discarded after 5 minutes.

## Response Cross-Check (Advanced)

Fine-grained control for DeFi, bridges, and scenarios where data integrity is critical.  RPCRouter mitigates stale or malicious RPC responses via consensus validation against multiple endpoints.

Configuration Options:

- **No Cross-Check:** (Default) RPCRouter returns the first valid response received. `RPCROUTER_CROSS_CHECKS=0`
- **Double-Check:** RPCRouter returns the first response corroborated by a second matching response. `RPCROUTER_CROSS_CHECKS=1`
- **Triple-Check:** RPCRouter returns the first response confirmed by two additional matching responses. `RPCROUTER_CROSS_CHECKS=2`

**Important Note:** Cross-checking introduces additional request overhead and may increase response times. This feature is primarily intended for use cases where data reliability outweighs speed concerns.

## HTTP or WS

Most blockchain RPC providers offer two types of endpoints: HTTP and WS.

### Connecting to Your RPCRouter 
Always include **both the HTTP and WS endpoints** when connecting to your RPCRouter. While WS generally offers faster performance due to its persistent connection and the lightweight nature of the WebSocket protocol, HTTP can provide greater stability in some cases.

### Recommendations for Your Code
**Prioritize WS endpoints** for optimal performance. Only use HTTP in situations where WebSocket support is unavailable, such as in cloud functions or environments that don't support the protocol (e.g., when making requests with curl).