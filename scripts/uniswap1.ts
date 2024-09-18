require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
    const [owner] = await ethers.getSigners();

    // UniswapV2 Router Address 
    const UNISWAP_V2_ROUTER_ADDRESS = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
    
    // ABI for interaction with Uniswap Router
    const UNISWAP_V2_ROUTER_ABI = [
        "function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)",
        "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)"
    ];

    // Connect to the UniswapV2 Router contract
    const uniswapRouter = new ethers.Contract(UNISWAP_V2_ROUTER_ADDRESS, UNISWAP_V2_ROUTER_ABI, owner);

    // Token addresses (For example, DAI and WETH on mainnet)
    const DAI_ADDRESS = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
    const WETH_ADDRESS = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

    // Amount of DAI to swap (in Wei)
    const amountIn = ethers.utils.parseUnits("1", 18); // 1 DAI

    // Create path (DAI -> WETH)
    const path = [DAI_ADDRESS, WETH_ADDRESS];

    // Fetching expected output using getAmountsOut
    const amountsOut = await uniswapRouter.getAmountsOut(amountIn, path);
    console.log(`Expected WETH amount for 1 DAI: ${ethers.utils.formatEther(amountsOut[1])}`);

    // Approve the Uniswap Router to spend the DAI (You'll need to do this for your ERC20 tokens)
    const DAI_ABI = ["function approve(address spender, uint256 amount) external returns (bool)"];
    const daiToken = new ethers.Contract(DAI_ADDRESS, DAI_ABI, owner);
    const txApprove = await daiToken.approve(UNISWAP_V2_ROUTER_ADDRESS, amountIn);
    await txApprove.wait();
    console.log("DAI approved for swapping.");

    // Perform the swap
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from now
    const amountOutMin = ethers.utils.parseUnits("0.01", 18); // Minimal acceptable output
    const tx = await uniswapRouter.swapExactTokensForTokens(
        amountIn, 
        amountOutMin, 
        path, 
        owner.address, 
        deadline
    );
    
    console.log("Swapping DAI for WETH...");
    const receipt = await tx.wait();
    console.log("Transaction completed:", receipt.transactionHash);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
