import express from "express";
import { sendMockUSDC } from "../services/transferService.js";

const router = express.Router();

console.log(
  "RELAYER KEY LENGTH:",
  process.env.RELAYER_PRIVATE_KEY?.length
);


router.post("/send", async (req, res) => {
  try {
    const { sender, recipient, amount } = req.body;

    if (!sender || !recipient || !amount) {
      return res.status(400).json({
        error: "sender, recipient and amount are required"
      });
    }

    const result = await sendMockUSDC({sender, recipient, amount});


    res.json({
      success: true,
      ...result
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: err.message || "Transfer failed"
    });
  }
});

export default router;