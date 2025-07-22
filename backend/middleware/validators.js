const { body, validationResult } = require("express-validator");

const validateOrder = [
  body("userId").isMongoId().withMessage("Invalid user ID"),
  body("items").isArray({ min: 1 }).withMessage("Items must be an array with at least one item"),
  body("items.*.bookId").isMongoId().withMessage("Invalid book ID"),
  body("items.*.quantity").isInt({ min: 1 }).withMessage("Quantity must be at least 1"),
  body("shippingAddress").optional().isString().withMessage("Shipping address must be a string"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

module.exports = { validateOrder };
