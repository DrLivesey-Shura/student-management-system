const mongoose = require("mongoose");

const SaleSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    region: {
      type: String,
      required: true,
      enum: ["North", "South", "East", "West", "Central"],
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["Credit Card", "Debit Card", "PayPal", "Cash", "Bank Transfer"],
    },
    status: {
      type: String,
      required: true,
      enum: ["Completed", "Pending", "Cancelled", "Refunded"],
      default: "Completed",
    },
  },
  { timestamps: true }
);

// Add indexes for better performance with frequent queries
SaleSchema.index({ date: 1 });
SaleSchema.index({ product: 1 });
SaleSchema.index({ customer: 1 });
SaleSchema.index({ region: 1 });

module.exports = mongoose.model("Sale", SaleSchema);
