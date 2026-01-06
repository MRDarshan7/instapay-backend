import express from "express";
import cors from "cors";
import transferRoute from "./routes/transfer.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (_, res) => {
  res.send("InstaPay Backend – Testnet Mode 🚀");
});

app.use("/api", transferRoute);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
