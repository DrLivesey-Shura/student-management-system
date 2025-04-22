const Product = require("../models/Product");
const Customer = require("../models/Customer");
const sale = require("../models/Sale");

// Get all customers with pagination
exports.getCustomers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;

    const total = await Customer.countDocuments();

    const customers = await Customer.find()
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    res.json({
      customers,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get a single customer by ID
exports.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    res.json(customer);
  } catch (error) {
    console.error("Error fetching customer:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Create a new customer
exports.createCustomer = async (req, res) => {
  try {
    const { name, email, customerType } = req.body;
    const newCustomer = new Customer({
      name,
      email,
      customerType,
    });
    await newCustomer.save();
    res.status(201).json(newCustomer);
  } catch (error) {
    console.error("Error creating customer:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update a customer
exports.updateCustomer = async (req, res) => {
  try {
    const { name, email, customerType } = req.body;
    const updatedCustomer = await Customer.findByIdAndUpdate(
      req.params.id,
      { name, email, customerType },
      { new: true }
    );
    if (!updatedCustomer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    res.json(updatedCustomer);
  } catch (error) {
    console.error("Error updating customer:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a customer
exports.deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Delete associated sales
    await sale.deleteMany({ customer: req.params.id });

    await customer.remove();
    res.json({ message: "Customer deleted" });
  } catch (error) {
    console.error("Error deleting customer:", error);
    res.status(500).json({ message: "Server error" });
  }
};
