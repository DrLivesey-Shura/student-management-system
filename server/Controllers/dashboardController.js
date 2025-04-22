const Sale = require("../models/Sale");
const Product = require("../models/Product");
const Customer = require("../models/Customer");
const mongoose = require("mongoose");

// Get sales overview stats
exports.getSalesOverview = async (req, res) => {
  try {
    // Default to last 30 days if no date range provided
    const endDate = req.query.endDate
      ? new Date(req.query.endDate)
      : new Date();
    const startDate = req.query.startDate
      ? new Date(req.query.startDate)
      : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Total sales amount in date range
    const totalSales = await Sale.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: endDate },
          status: "Completed",
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalPrice" },
          count: { $sum: 1 },
        },
      },
    ]);

    // Sales by region
    const salesByRegion = await Sale.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: endDate },
          status: "Completed",
        },
      },
      {
        $group: {
          _id: "$region",
          total: { $sum: "$totalPrice" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { total: -1 },
      },
    ]);

    // Sales by payment method
    const salesByPaymentMethod = await Sale.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: endDate },
          status: "Completed",
        },
      },
      {
        $group: {
          _id: "$paymentMethod",
          total: { $sum: "$totalPrice" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { total: -1 },
      },
    ]);

    // Top selling products
    const topProducts = await Sale.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: endDate },
          status: "Completed",
        },
      },
      {
        $group: {
          _id: "$product",
          total: { $sum: "$totalPrice" },
          quantity: { $sum: "$quantity" },
        },
      },
      {
        $sort: { quantity: -1 },
      },
      {
        $limit: 5,
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      {
        $unwind: "$productDetails",
      },
      {
        $project: {
          _id: 1,
          name: "$productDetails.name",
          category: "$productDetails.category",
          total: 1,
          quantity: 1,
        },
      },
    ]);

    // Daily sales trend
    const dailySales = await Sale.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: endDate },
          status: "Completed",
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          total: { $sum: "$totalPrice" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    res.json({
      totalSales:
        totalSales.length > 0 ? totalSales[0] : { total: 0, count: 0 },
      salesByRegion,
      salesByPaymentMethod,
      topProducts,
      dailySales,
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get customer insights
exports.getCustomerInsights = async (req, res) => {
  try {
    // Customer overview
    const customerCount = await Customer.countDocuments();

    // Customers by type
    const customersByType = await Customer.aggregate([
      {
        $group: {
          _id: "$customerType",
          count: { $sum: 1 },
        },
      },
    ]);

    // New customers this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const newCustomers = await Customer.countDocuments({
      createdAt: { $gte: startOfMonth },
    });

    // Top customers by sales
    const topCustomers = await Sale.aggregate([
      {
        $match: {
          status: "Completed",
        },
      },
      {
        $group: {
          _id: "$customer",
          totalSpent: { $sum: "$totalPrice" },
          purchaseCount: { $sum: 1 },
        },
      },
      {
        $sort: { totalSpent: -1 },
      },
      {
        $limit: 5,
      },
      {
        $lookup: {
          from: "customers",
          localField: "_id",
          foreignField: "_id",
          as: "customerDetails",
        },
      },
      {
        $unwind: "$customerDetails",
      },
      {
        $project: {
          _id: 1,
          name: "$customerDetails.name",
          email: "$customerDetails.email",
          customerType: "$customerDetails.customerType",
          totalSpent: 1,
          purchaseCount: 1,
        },
      },
    ]);

    res.json({
      customerCount,
      customersByType,
      newCustomers,
      topCustomers,
    });
  } catch (error) {
    console.error("Error fetching customer insights:", error);
    res.status(500).json({ message: "Server error" });
  }
};
