//server/src/index.js
//
//Entry point for the Inkwell API server
//
// Entry point. As of Lecture 5, this file's only job is to
//assemble middleware and mount routers - it contains no business
//logic itself, consistent with ADR-001's layered architecture.

import express from "express";
import healthRoutes from "./routes/health.routes.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use("/api", healthRoutes);

app.get("/api/health", (req, res) => {
    res.status(200).json({status:"ok", service: "inkwell-api"});
});

app.get("/api/version", (req, res) => {
    res.json({status: "ok", version: "0.1.0"});
});

app.listen(PORT, () => {
    console.log(`Inkwell API listening on port ${PORT}`);
});