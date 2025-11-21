import { NeynarAPIClient } from "@neynar/nodejs-sdk";
import { createWalletClient, http, parseEther } from "viem";
import { base } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";

const CONTRACT = "0x735e836E25f16cA8F123B02D264246574EC2CCC0"; // contract của bro
const ABI = [
  {
    "inputs": [
      { "name": "fid", "type": "uint256" },
      { "name": "avatarUrl", "type": "string" }
    ],
    "name": "mint",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  }
];

// dùng PK ví chủ để gửi tx mint thay user
const OWNER_PK = process.env.PRIVATE_KEY;

export default async function handler(req, res) {
  try {
    const { untrustedData } = req.body;
    const fid = untrustedData.fid;

    // 1. Lấy avatar từ Neynar
    const client = new NeynarAPIClient(process.env.NEYNAR_API_KEY);
    const user = await client.lookupUserByFid(fid);
    const avatar = user.result.user.pfp.url;

    // 2. Tạo ví gửi tx
    const account = privateKeyToAccount(`0x${OWNER_PK}`);
    const wallet = createWalletClient({
      account,
      chain: base,
      transport: http()
    });

    // 3. Gửi giao dịch mint
    const tx = await wallet.writeContract({
      address: CONTRACT,
      abi: ABI,
      functionName: "mint",
      args: [fid, avatar],
      value: parseEther("0.00001")
    });

    // 4. Trả lại kết quả cho MiniApp
    return res.json({
      type: "frame",
      image: avatar,
      buttons: [
        { label: "View Transaction", action: "link", target: `https://basescan.org/tx/${tx}` },
        { label: "View NFT", action: "link", target: `https://opensea.io/assets/base/${CONTRACT}/${fid}` }
      ],
      post_url: ""
    });

  } catch (err) {
    console.error(err);
    res.json({
      type: "frame",
      image: "https://i.imgur.com/LfCU6Dy.png",
      buttons: [{ label: "Error. Try again", action: "post" }]
    });
  }
}
