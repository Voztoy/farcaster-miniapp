export default function handler(req, res) {
  res.json({
    type: "frame",
    image: "https://i.imgur.com/M3ps7Ya.png", // ảnh banner mint
    buttons: [
      { label: "Mint NFT Avatar", action: "post", target: "/api/mint" }
    ],
    post_url: "/api/mint"
  });
}
