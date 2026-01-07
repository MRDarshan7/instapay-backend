import express from "express";
import { sendMockUSDC } from "../services/transferService.js";

const router = express.Router();

router.post("/send", async (req, res) => {
  try {
    const { recipient, amount } = req.body;

    if (!recipient || !amount) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const result = await sendMockUSDC({ recipient, amount });

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