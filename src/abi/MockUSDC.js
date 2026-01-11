// const MockUSDC_ABI = [
//   // Metadata
//   "function name() view returns (string)",
//   "function symbol() view returns (string)",
//   "function decimals() view returns (uint8)",

//   // Balances
//   "function balanceOf(address owner) view returns (uint256)",

//   // Allowance
//   "function allowance(address owner, address spender) view returns (uint256)",
//   "function approve(address spender, uint256 amount) returns (bool)",

//   // Transfers
//   "function transfer(address to, uint256 amount) returns (bool)",
//   "function transferFrom(address from, address to, uint256 amount) returns (bool)"
// ];

// export default MockUSDC_ABI;

// const MockUSDC_ABI = [
//   "function transfer(address to, uint256 amount)",
//   "function transferFrom(address from, address to, uint256 amount)",
//   "function approve(address spender, uint256 amount)",
//   "function allowance(address owner, address spender) view returns (uint256)",
//   "function decimals() view returns (uint8)"
// ];

// export default MockUSDC_ABI;

//FINAL
const MockUSDC_ABI = [
  // ERC20 basics
  "function decimals() view returns (uint8)",
  "function balanceOf(address owner) view returns (uint256)",

  // Allowance
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",

  // Transfers
  "function transfer(address to, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)"
];

export default MockUSDC_ABI;
