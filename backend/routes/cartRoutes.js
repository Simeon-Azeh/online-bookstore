const express = require("express");
const { body, param, validationResult } = require("express-validator");
const router = express.Router();
const Cart = require("../utils/Cart");

// Swagger tags and schemas
/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: Shopping cart management
 *
 * components:
 *   schemas:
 *     BookRef:
 *       type: object
 *       required:
 *         - _id
 *         - price
 *       properties:
 *         _id:
 *           type: string
 *           description: Book ID
 *         price:
 *           type: number
 *           description: Price of the book
 *     CartItem:
 *       type: object
 *       properties:
 *         book:
 *           $ref: '#/components/schemas/BookRef'
 *         quantity:
 *           type: integer
 *           description: Quantity of the book in the cart
 */

// Simulate one shared cart instance (will reset on server restart)
const cart = new Cart();

// Validation middleware for checking request data and params
const validateAddItem = [
  body("book").exists().withMessage("book object is required"),
  body("book._id").isString().withMessage("book._id must be a string"),
  body("book.price").isNumeric().withMessage("book.price must be a number"),
  body("quantity").optional().isInt({ min: 1 }).withMessage("quantity must be a positive integer"),
];

const validateBookIdParam = [
  param("bookId").isString().withMessage("bookId must be a string"),
];

const validateUpdateQuantity = [
  body("quantity").isInt({ min: 0 }).withMessage("quantity must be a non-negative integer"),
];

// Helper to check for validation errors
function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

/**
 * @swagger
 * /api/cart/add:
 *   post:
 *     summary: Add item to cart
 *     tags: [Cart]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - book
 *             properties:
 *               book:
 *                 $ref: '#/components/schemas/BookRef'
 *               quantity:
 *                 type: integer
 *                 default: 1
 *     responses:
 *       200:
 *         description: Item added to cart
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 cart:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CartItem'
 *       400:
 *         description: Validation error
 */
router.post("/add", validateAddItem, handleValidationErrors, (req, res) => {
  const { book, quantity } = req.body;

  cart.addItem(book, quantity || 1);
  res.json({ message: "Item added to cart", cart: cart.getItems() });
});

/**
 * @swagger
 * /api/cart/remove/{bookId}:
 *   delete:
 *     summary: Remove item from cart
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Item removed from cart
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 cart:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CartItem'
 *       400:
 *         description: Validation error
 */
router.delete("/remove/:bookId", validateBookIdParam, handleValidationErrors, (req, res) => {
  const { bookId } = req.params;

  cart.removeItem(bookId);
  res.json({ message: "Item removed from cart", cart: cart.getItems() });
});

/**
 * @swagger
 * /api/cart/update/{bookId}:
 *   put:
 *     summary: Update item quantity
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Quantity updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 cart:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CartItem'
 *       400:
 *         description: Validation error
 */
router.put(
  "/update/:bookId",
  [...validateBookIdParam, ...validateUpdateQuantity],
  handleValidationErrors,
  (req, res) => {
    const { bookId } = req.params;
    const { quantity } = req.body;

    cart.updateQuantity(bookId, quantity);
    res.json({ message: "Quantity updated", cart: cart.getItems() });
  }
);

/**
 * @swagger
 * /api/cart/clear:
 *   delete:
 *     summary: Clear cart
 *     tags: [Cart]
 *     responses:
 *       200:
 *         description: Cart cleared
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.delete("/clear", (req, res) => {
  cart.clearCart();
  res.json({ message: "Cart cleared" });
});

/**
 * @swagger
 * /api/cart/summary:
 *   get:
 *     summary: Get cart summary
 *     tags: [Cart]
 *     responses:
 *       200:
 *         description: Cart summary
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CartItem'
 *                 total:
 *                   type: number
 *                 itemCount:
 *                   type: integer
 */
router.get("/summary", (req, res) => {
  res.json({
    items: cart.getItems(),
    total: cart.getTotal(),
    itemCount: cart.getItemCount(),
  });
});

module.exports = router;
