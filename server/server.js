// server/server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const promClient = require("prom-client");
const responseTime = require("response-time");

// Import routes
const salesRoutes = require("./routes/salesRoutes");
const productRoutes = require("./routes/productRoutes");
const customerRoutes = require("./Routes/customerRoutes.js");
const dashboardRoutes = require("./routes/dashboardRoutes");
// const { seedDatabase } = require("./data/seedData.js");

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
// seedDatabase();

// Initialize Prometheus metrics
const collectDefaultMetrics = promClient.collectDefaultMetrics;
collectDefaultMetrics({ prefix: "sales_dashboard_" });

// Custom metrics
const httpRequestDurationMicroseconds = new promClient.Histogram({
  name: "http_request_duration_ms",
  help: "Duration of HTTP requests in ms",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.1, 5, 15, 50, 100, 200, 500, 1000, 2000, 5000, 10000],
});

const totalRequests = new promClient.Counter({
  name: "http_requests_total",
  help: "Total HTTP requests",
  labelNames: ["method", "route", "status_code"],
});

// Middleware
app.use(cors());
app.use(express.json());

app.use(
  responseTime((req, res, time) => {
    const { method, route } = req;
    const path = route ? route.path : req.path;
    const statusCode = res.statusCode;

    httpRequestDurationMicroseconds
      .labels(method, path, statusCode)
      .observe(time);

    totalRequests.labels(method, path, statusCode).inc();
  })
);

// Routes
app.use("/api/sales", salesRoutes);
app.use("/api/products", productRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.post("/reset-metrics", (req, res) => {
  promClient.register.resetMetrics();
  res.send("Metrics reset.");
});
// Metrics endpoint for Prometheus/Grafana
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", promClient.register.contentType);
  res.end(await promClient.register.metrics());
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : {},
  });
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected..."))
  .catch((err) => console.log(err));

const PORT = process.env.PORT || 7000;

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
