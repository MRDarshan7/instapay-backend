console.log("--TRANSFER.JS FILE LOADED--");
import express from "express";
import { sendMockUSDC } from "../services/transferService.js";
import { assessRecipientRisk } from "../services/riskAssessment.js";

const router = express.Router();

console.log(
  "RELAYER KEY LENGTH:",
  process.env.RELAYER_PRIVATE_KEY?.length
);

router.post("/send", async (req, res) => {
  try {
    // ===========================================
    // DEBUG: Log received data
    // ===========================================
    console.log("\n=== INCOMING REQUEST ===");
    console.log("Full request body:", JSON.stringify(req.body, null, 2));
    console.log("sender:", req.body.sender);
    console.log("recipient:", req.body.recipient);
    console.log("amount:", req.body.amount);
    console.log("amount type:", typeof req.body.amount);
    console.log("========================\n");
    
    const { sender, recipient, amount } = req.body;

    if (!sender || !recipient || !amount) {
      console.log("Validation failed - missing fields");
      return res.status(400).json({
        error: "sender, recipient and amount are required",
        received: { sender, recipient, amount }
      });
    }

    // ============================================
    // INCO RISK ASSESSMENT - Intelligence Layer
    // ============================================
    console.log("[INCO] Starting confidential risk assessment...");
    
    const riskAssessment = await assessRecipientRisk(recipient);
    
    console.log(`[INCO] Risk Level: ${riskAssessment.riskLevel}`);
    console.log(`[INCO] Reason: ${riskAssessment.reason}`);
    
    // Block HIGH RISK transactions
    if (!riskAssessment.safe) {
      console.log("[INCO] Transaction BLOCKED");
      return res.status(403).json({
        error: "Transaction blocked by security layer",
        riskLevel: riskAssessment.riskLevel,
        reason: riskAssessment.reason,
        message: "This recipient address has been flagged as high risk. Transaction prevented to protect your funds."
      });
    }
    
    // Log warning for MEDIUM RISK but allow transaction
    if (riskAssessment.riskLevel === "MEDIUM") {
      console.log("[INCO] Transaction allowed with warning");
    }
    
    console.log("[INCO] Risk assessment passed - proceeding with transfer\n");
    // ============================================

    console.log("Calling sendMockUSDC with:", { sender, recipient, amount });
    
    // CRITICAL: Pass as object with curly braces
    const result = await sendMockUSDC({ sender, recipient, amount });

    res.json({
      success: true,
      ...result,
      riskAssessment: {
        level: riskAssessment.riskLevel,
        checked: true
      }
    });
  } catch (err) {
    console.error("Error in /send route:", err);
    res.status(500).json({
      error: err.message || "Transfer failed"
    });
  }
});

export default router;