const express = require("express");
const controller = require("../controllers/productController");
const { protect, restrictTo, verifySeller } = require("../middleware/auth");
const upload = require("../middleware/upload");

const router = express.Router();

/* ================= PUBLIC ================= */
router.get("/", controller.getAllProducts);
router.get("/:id", controller.getProduct);

/* ================= REVIEW ================= */
router.post("/:id/reviews", protect, controller.addReview);

/* ================= SELLER / ADMIN ================= */
router.use(protect); // 🔥 must come BEFORE verifySeller

// create product
router.post("/", restrictTo("seller", "admin"), verifySeller, controller.createProduct);

// upload images
router.post(
  "/upload-images",
  restrictTo("seller", "admin"),
  verifySeller,
  upload.array("images", 5),
  controller.uploadImages
);

// seller products
router.get("/seller/my-products", restrictTo("seller", "admin"), controller.getMyProducts);

// update
router.patch("/:id", restrictTo("seller", "admin"), controller.updateProduct);

// delete
router.delete("/:id", restrictTo("seller", "admin"), controller.deleteProduct);

module.exports = router;
