# Good influencer
##  What is it?
Have you ever felt that a simple "thank you" isn't enough for a colleague who consistently 
supports you at work? I've created an app where influencers can receive Ether donations and 
a trophy (ERC20 token) permanently recorded on the Blockchain as proof of their impactful 
contributions to the project.

## Demo
[Link](https://good-influencer.vercel.app/) (A wallet is required to connect)

## Tech stack
* Solidity (+yul)
* Upgradeable contracts
* Hardhat
* Slither
* Unit & integration tests
* Typescript
* Frontend (NextJs)
* Backend (Express & MongoDB)
* Deploy to the testnet (Sepolia)
* Vercel (Frontend & Backend)

## Screenshot
<img src='./fe-screenshot.png' />

# Tests

```shell
npx hardhat test
```

# Run & deploy app
```shell
npx hardhat node
npx hardhat run scripts/deploy.ts
```


