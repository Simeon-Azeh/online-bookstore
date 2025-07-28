const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Book = require("../models/Book");
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const { asyncHandler } = require("../middleware/errorMiddleware");

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: API for managing orders
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     OrderItem:
 *       type: object
 *       properties:
 *         book:
 *           type: string
 *           description: Book ID
 *         quantity:
 *           type: integer
 *           description: Quantity ordered
 *     Order:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         user:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             name:
 *               type: string
 *             email:
 *               type: string
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderItem'
 *         totalPrice:
 *           type: number
 *           format: float
 *         shippingAddress:
 *           type: string
 *         status:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - items
 *             properties:
 *               userId:
 *                 type: string
 *                 description: MongoDB user ID
 *               items:
 *                 type: array
 *                 description: List of books and quantities
 *                 items:
 *                   type: object
 *                   required:
 *                     - bookId
 *                     - quantity
 *                   properties:
 *                     bookId:
 *                       type: string
 *                       description: MongoDB book ID
 *                     quantity:
 *                       type: integer
 *               shippingAddress:
 *                 type: string
 *                 description: Shipping address
 *     responses:
 *       201:
 *         description: Order placed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 order:
 *                   $ref: '#/components/schemas/Order'
 *       400:
 *         description: Validation error or insufficient stock
 *       404:
 *         description: User or book not found
 *       500:
 *         description: Server error
 */
router.post(
  "/",
  [
    body("userId").isMongoId().withMessage("Valid userId is required"),
    body("items")
      .isArray({ min: 1 })
      .withMessage("Items must be a non-empty array"),
    body("items.*.bookId").isMongoId().withMessage("Each item must have a valid bookId"),
    body("items.*.quantity")
      .isInt({ min: 1 })
      .withMessage("Each item must have a quantity of at least 1"),
    body("shippingAddress")
      .optional()
      .isString()
      .withMessage("shippingAddress, if provided, must be a string"),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId, items, shippingAddress } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    let totalPrice = 0;

    for (const item of items) {
      const book = await Book.findById(item.bookId);
      if (!book) return res.status(404).json({ error: `Book not found: ${item.bookId}` });
      if (book.stock < item.quantity) {
        return res.status(400).json({ error: `Not enough stock for: ${book.title}` });
      }
      totalPrice += book.price * item.quantity;
    }

    const orderItems = items.map((item) => ({
      book: item.bookId,
      quantity: item.quantity,
    }));

    const order = new Order({
      user: userId,
      items: orderItems,
      totalPrice,
      shippingAddress,
      status: "pending",
    });

    await order.save();

    for (const item of items) {
      await Book.findByIdAndUpdate(item.bookId, { $inc: { stock: -item.quantity } });
    }

    res.status(201).json({ message: "Order placed successfully", order });
  })
);

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Retrieve all orders (admin)
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: List of orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       500:
 *         description: Server error
 */
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("items.book", "title price");
    res.json(orders);
  })
);

/**
 * @swagger
 * /api/orders/user/{userId}:
 *   get:
 *     summary: Get orders for a specific user
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB user ID
 *     responses:
 *       200:
 *         description: List of user's orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       500:
 *         description: Server error
 */
router.get(
  "/user/:userId",
  asyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.params.userId })
      .populate("items.book", "title price")
      .sort({ createdAt: -1 });
    res.json(orders);
  })
);

/**
 * @swagger
 * /api/orders/{orderId}/status:
 *   put:
 *     summary: Update order status
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, processing, shipped, delivered, cancelled]
 *                 description: New status value
 *     responses:
 *       200:
 *         description: Order status updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 order:
 *                   $ref: '#/components/schemas/Order'
 *       400:
 *         description: Invalid status value
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
router.put(
  "/:orderId/status",
  [
    body("status")
      .isIn(["pending", "processing", "shipped", "delivered", "cancelled"])
      .withMessage("Invalid status value"),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json({ message: "Order status updated", order });
  })
);

module.exports = router;
