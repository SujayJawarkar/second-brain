import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import { sse } from "./utils/sse";
// Routes
import authRoutes from "./routes/auth.routes";
import itemRoutes from "./routes/item.routes";
import searchRoutes from "./routes/search.routes";
import graphRoutes from "./routes/graph.routes";
import streamRoutes from "./routes/stream.routes";
const app = express();

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(morgan("dev"));
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/items", itemRoutes);
app.use("/api/v1/search", searchRoutes);
app.use("/api/v1/graph", graphRoutes);
app.use("/api/v1/stream", streamRoutes);

// Start SSE Redis subscriber
sse.startSubscriber();

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(env.port, () => {
  console.log(`Server running on http://localhost:${env.port}`);
});
