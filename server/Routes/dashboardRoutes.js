const express = require("express");
const dashboardController = require("../Controllers/dashboardController");
const router = express.Router();

router.get("/sales-overview", dashboardController.getSalesOverview);
router.get("/customer-insights", dashboardController.getCustomerInsights);

module.exports = router;
