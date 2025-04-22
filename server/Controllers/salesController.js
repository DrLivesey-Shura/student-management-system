const Product = require("../models/Product");
const Customer = require("../models/Customer");
const Sale = require("../models/Sale");

// Get all sales with pagination
exports.getSales = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;

    // Build query based on filters
    const query = {};

    if (req.query.startDate && req.query.endDate) {
      query.date = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate),
      };
    }

    if (req.query.region) {
      query.region = req.query.region;
    }

    if (req.query.status) {
      query.status = req.query.status;
    }

    if (req.query.product) {
      query.product = req.query.product;
    }

    const total = await Sale.countDocuments(query);

    const sales = await Sale.find(query)
      .populate("product", "name price category")
      .populate("customer", "name email customerType")
      .sort({ date: -1 })
      .skip(startIndex)
      .limit(limit);

    res.json({
      sales,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching sales:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get a single sale by ID
exports.getSaleById = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate("product")
      .populate("customer");

    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }

    res.json(sale);
  } catch (error) {
    console.error("Error fetching sale:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Create a new sale
exports.createSale = async (req, res) => {
  try {
    const {
      product: productId,
      customer: customerId,
      quantity,
      totalPrice,
      region,
      paymentMethod,
      status,
    } = req.body;

    // Verify product exists and has enough stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.stockQuantity < quantity) {
      return res.status(400).json({ message: "Not enough product in stock" });
    }

    // Verify customer exists
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Create the sale
    const newSale = new Sale({
      product: productId,
      customer: customerId,
      quantity,
      totalPrice,
      region,
      paymentMethod,
      status,
    });

    // Update product stock
    product.stockQuantity -= quantity;
    await product.save();

    const savedSale = await newSale.save();

    res.status(201).json(savedSale);
  } catch (error) {
    console.error("Error creating sale:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update a sale
exports.updateSale = async (req, res) => {
  try {
    const { status } = req.body;

    const sale = await Sale.findById(req.params.id);
    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }

    // Only allow updating status for simplicity
    sale.status = status;

    const updatedSale = await sale.save();

    res.json(updatedSale);
  } catch (error) {
    console.error("Error updating sale:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a sale
exports.deleteSale = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);
    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }

    // Return product to stock
    const product = await Product.findById(sale.product);
    if (product) {
      product.stockQuantity += sale.quantity;
      await product.save();
    }

    await sale.remove();

    res.json({ message: "Sale removed" });
  } catch (error) {
    console.error("Error deleting sale:", error);
    res.status(500).json({ message: "Server error" });
  }
};
