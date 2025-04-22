const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Product = require("../models/Product");
const Customer = require("../models/Customer");
const Sale = require("../models/sale");
const User = require("../models/User");

dotenv.config();

// Connect to MongoDB
// mongoose
//   .connect(process.env.MONGO_DB_URL, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => console.log("MongoDB connected for seeding..."))
//   .catch((err) => {
//     console.error("MongoDB connection error:", err);
//     process.exit(1);
//   });

// Sample Products
const products = [
  {
    name: "Laptop Pro",
    category: "Electronics",
    price: 1299.99,
    cost: 950.0,
    stockQuantity: 50,
    description: "High-end laptop with the latest specs",
    isActive: true,
  },
  {
    name: "Smartphone X",
    category: "Electronics",
    price: 899.99,
    cost: 600.0,
    stockQuantity: 100,
    description: "Next generation smartphone with advanced features",
    isActive: true,
  },
  {
    name: "Wireless Headphones",
    category: "Audio",
    price: 199.99,
    cost: 89.99,
    stockQuantity: 200,
    description: "Premium noise-cancelling wireless headphones",
    isActive: true,
  },
  {
    name: "Smart Watch",
    category: "Wearables",
    price: 249.99,
    cost: 125.0,
    stockQuantity: 75,
    description: "Feature-rich smartwatch with health monitoring",
    isActive: true,
  },
  {
    name: "Bluetooth Speaker",
    category: "Audio",
    price: 129.99,
    cost: 60.0,
    stockQuantity: 150,
    description: "Portable wireless speaker with premium sound",
    isActive: true,
  },
  {
    name: "Tablet Pro",
    category: "Electronics",
    price: 649.99,
    cost: 400.0,
    stockQuantity: 60,
    description: "High-performance tablet for professionals",
    isActive: true,
  },
  {
    name: "Gaming Console",
    category: "Gaming",
    price: 499.99,
    cost: 350.0,
    stockQuantity: 30,
    description: "Next-gen gaming console with 4K capabilities",
    isActive: true,
  },
  {
    name: "Wireless Charger",
    category: "Accessories",
    price: 49.99,
    cost: 15.0,
    stockQuantity: 300,
    description: "Fast wireless charging pad for compatible devices",
    isActive: true,
  },
  {
    name: "Smart Home Hub",
    category: "Smart Home",
    price: 129.99,
    cost: 70.0,
    stockQuantity: 80,
    description: "Central hub to control all your smart home devices",
    isActive: true,
  },
  {
    name: "Digital Camera",
    category: "Photography",
    price: 799.99,
    cost: 450.0,
    stockQuantity: 40,
    description: "Professional-grade digital camera",
    isActive: true,
  },
];

// Function to generate random sales data
const generateSales = async (productDocs, customerDocs) => {
  const regions = ["North", "South", "East", "West", "Central"];
  const paymentMethods = [
    "Credit Card",
    "Debit Card",
    "PayPal",
    "Bank Transfer",
    "Cash",
  ];
  const statuses = ["Completed", "Pending", "Cancelled", "Refunded"];
  const salesData = [];

  // Generate sales for the last 90 days
  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - 90);

  // Helper to get random element from array
  const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

  // Helper to get random number in range
  const getRandomNumber = (min, max) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

  // Helper to get random date in range
  const getRandomDate = (start, end) => {
    return new Date(
      start.getTime() + Math.random() * (end.getTime() - start.getTime())
    );
  };

  // Create 200 random sales
  for (let i = 0; i < 200; i++) {
    const product = getRandomElement(productDocs);
    const customer = getRandomElement(customerDocs);
    const quantity = getRandomNumber(1, 5);
    const region = getRandomElement(regions);
    const paymentMethod = getRandomElement(paymentMethods);
    // Make most sales completed for better dashboard data
    const status =
      Math.random() < 0.85 ? "Completed" : getRandomElement(statuses);
    const date = getRandomDate(startDate, endDate);

    salesData.push({
      product: product._id,
      customer: customer._id,
      quantity,
      totalPrice: product.price * quantity,
      date,
      region,
      paymentMethod,
      status,
    });
  }

  return salesData;
};

// Seed the database
const seedDatabase = async () => {
  try {
    // Clear existing data
    await Product.deleteMany({});
    await Customer.deleteMany({});
    await Sale.deleteMany({});
    await User.deleteMany({});

    console.log("Previous data cleared");

    // Insert products
    const insertedProducts = await Product.insertMany(products);
    console.log(`${insertedProducts.length} products inserted`);

    // Insert customers
    const insertedCustomers = await Customer.insertMany(customers);
    console.log(`${insertedCustomers.length} customers inserted`);

    // Insert users
    const insertedUsers = await User.insertMany(users);
    console.log(`${insertedUsers.length} users inserted`);

    // Generate and insert sales
    const salesData = await generateSales(insertedProducts, insertedCustomers);
    const insertedSales = await Sale.insertMany(salesData);
    console.log(`${insertedSales.length} sales inserted`);

    console.log("Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

// Sample Users
const users = [
  {
    name: "Admin User",
    email: "admin@example.com",
    password: "password123",
    role: "admin",
    isActive: true,
  },
  {
    name: "Sales Manager",
    email: "manager@example.com",
    password: "password123",
    role: "manager",
    isActive: true,
  },
  {
    name: "Sales Rep",
    email: "sales@example.com",
    password: "password123",
    role: "sales",
    isActive: true,
  },
  {
    name: "View Only",
    email: "viewer@example.com",
    password: "password123",
    role: "viewer",
    isActive: true,
  },
];

// Sample Customers
const customers = [
  {
    name: "John Doe",
    email: "john@example.com",
    phone: "555-123-4567",
    address: {
      street: "123 Main St",
      city: "San Francisco",
      state: "CA",
      zipCode: "94105",
      country: "USA",
    },
    customerType: "Regular",
    joinDate: new Date("2023-01-15"),
  },
  {
    name: "Jane Smith",
    email: "jane@example.com",
    phone: "555-987-6543",
    address: {
      street: "456 Market St",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      country: "USA",
    },
    customerType: "Premium",
    joinDate: new Date("2023-02-20"),
  },
  {
    name: "Bob Johnson",
    email: "bob@example.com",
    phone: "555-555-5555",
    address: {
      street: "789 Oak Ave",
      city: "Chicago",
      state: "IL",
      zipCode: "60601",
      country: "USA",
    },
    customerType: "Business",
    joinDate: new Date("2023-03-10"),
  },
  {
    name: "Sarah Williams",
    email: "sarah@example.com",
    phone: "555-222-3333",
    address: {
      street: "101 Pine Rd",
      city: "Seattle",
      state: "WA",
      zipCode: "98101",
      country: "USA",
    },
    customerType: "Premium",
    joinDate: new Date("2023-01-05"),
  },
  {
    name: "Michael Brown",
    email: "michael@example.com",
    phone: "555-444-5555",
    address: {
      street: "202 Elm St",
      city: "Austin",
      state: "TX",
      zipCode: "78701",
      country: "USA",
    },
    customerType: "Regular",
    joinDate: new Date("2023-04-12"),
  },
  {
    name: "Emily Davis",
    email: "emily@company.com",
    phone: "555-777-8888",
    address: {
      street: "303 Cedar Blvd",
      city: "Boston",
      state: "MA",
      zipCode: "02108",
      country: "USA",
    },
    customerType: "Business",
    joinDate: new Date("2023-02-28"),
  },
  {
    name: "David Wilson",
    email: "david@example.com",
    phone: "555-888-9999",
    address: {
      street: "404 Maple Dr",
      city: "Miami",
      state: "FL",
      zipCode: "33101",
      country: "USA",
    },
    customerType: "Regular",
    joinDate: new Date("2023-03-22"),
  },
  {
    name: "Lisa Anderson",
    email: "lisa@company.org",
    phone: "555-111-2222",
    address: {
      street: "505 Birch Ln",
      city: "Denver",
      state: "CO",
      zipCode: "80201",
      country: "USA",
    },
    customerType: "Premium",
    joinDate: new Date("2023-04-05"),
  },
  {
    name: "Tech Solutions Inc.",
    email: "contact@techsolutions.com",
    phone: "555-999-0000",
    address: {
      street: "606 Corporate Pkwy",
      city: "San Jose",
      state: "CA",
      zipCode: "95110",
      country: "USA",
    },
    customerType: "Business",
    joinDate: new Date("2023-01-10"),
  },
  {
    name: "Global Retail Group",
    email: "orders@globalretail.com",
    phone: "555-333-4444",
    address: {
      street: "707 Commerce Ave",
      city: "Dallas",
      state: "TX",
      zipCode: "75201",
      country: "USA",
    },
    customerType: "Business",
    joinDate: new Date("2023-02-15"),
  },
];

exports.seedDatabase = seedDatabase;
