// Simulated cart object
let cart = [];

exports.getCart = (req, res) => {
  res.json(cart);
};

exports.addToCart = (req, res) => {
  const { bookId, quantity } = req.body;
  const existing = cart.find(item => item.bookId === bookId);

  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ bookId, quantity });
  }

  res.status(200).json(cart);
};

exports.clearCart = (req, res) => {
  cart = [];
  res.status(200).json({ message: "Cart cleared." });
};
