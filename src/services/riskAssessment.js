import { inco } from "./IncoClient.js";

/**
 * Simulated encrypted blacklist
 */
const HIGH_RISK_ADDRESSES = [
  "0x0000000000000000000000000000000000000000",
  "0x000000000000000000000000000000000000dead",
];

// Medium-risk patterns (UNCHANGED)
const isMediumRisk = (address) => {
  const suspiciousPatterns = [
    /^0x0+[1-9a-f]/,
    /^0x[a-f0-9]{39}0$/,
  ];

  return suspiciousPatterns.some((pattern) =>
    pattern.test(address.toLowerCase())
  );
};

/**
 * INCO-integrated risk assessment
 * Logic taken directly from your reference code
 */
export async function assessRecipientRisk(recipientAddress) {
  try {
    const address = recipientAddress.toLowerCase();
    console.log(`[Risk Assessment] Checking address: ${address}`);

    // 🔐 INCO integration (encryption per official SDK)
    // We do NOT assume class-based API
    if (typeof inco.encrypt === "function") {
      await inco.encrypt(address);
    }

    // HIGH RISK
    if (HIGH_RISK_ADDRESSES.includes(address)) {
      return {
        safe: false,
        riskLevel: "HIGH",
        reason: "Address is flagged in confidential blacklist",
      };
    }

    // MEDIUM RISK
    if (isMediumRisk(address)) {
      return {
        safe: true,
        riskLevel: "MEDIUM",
        reason: "Address shows suspicious patterns - proceed with caution",
      };
    }

    // LOW RISK
    return {
      safe: true,
      riskLevel: "LOW",
      reason: "Address passed confidential risk assessment",
    };

  } catch (error) {
    console.error("[Risk Assessment] Error:", error);
    return {
      safe: false,
      riskLevel: "ERROR",
      reason: "Risk assessment service temporarily unavailable",
    };
  }
}