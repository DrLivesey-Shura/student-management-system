const express = require("express");
const salesController = require("../Controllers/salesController");
const router = express.Router();

router.get("/", salesController.getSales);
router.get("/:id", salesController.getSaleById);
router.post("/", salesController.createSale);
router.put("/:id", salesController.updateSale);
router.delete("/:id", salesController.deleteSale);

module.exports = router;
