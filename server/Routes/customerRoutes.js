const express = require("express");
const customersController = require("../Controllers/customerController");
const router = express.Router();

router.get("/", customersController.getCustomers);
router.get("/:id", customersController.getCustomerById);
router.post("/", customersController.createCustomer);
router.put("/:id", customersController.updateCustomer);
router.delete("/:id", customersController.deleteCustomer);

module.exports = router;
