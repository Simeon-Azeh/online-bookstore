const Cart = require("../utils/Cart");

// Use a map of carts keyed by user email
const carts = new Map();

// Get or create cart for a user
function getUserCart(email) {
  if (!carts.has(email)) {
    carts.set(email, new Cart());
  }
  return carts.get(email);
}

// Get cart for user
exports.getCart = (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: "Email is required" });

  const cart = getUserCart(email);
  res.json({
    items: cart.getItems(),
    total: cart.getTotal(),
    itemCount: cart.getItemCount(),
  });
};

// Add to cart
exports.addToCart = (req, res) => {
  const { email, book, quantity } = req.body;
  if (!email || !book || !book._id || !book.price)
    return res.status(400).json({ error: "Invalid input" });

  const cart = getUserCart(email);
  cart.addItem(book, quantity || 1);

  res.status(200).json({ message: "Added to cart", cart: cart.getItems() });
};

// Clear cart
exports.clearCart = (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  const cart = getUserCart(email);
  cart.clearCart();

  res.status(200).json({ message: "Cart cleared." });
};
