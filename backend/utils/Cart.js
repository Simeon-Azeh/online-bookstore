class Cart {
  constructor() {
    this.items = [];
  }

  addItem(book, quantity = 1) {
    const existingItem = this.items.find(item => item.book._id === book._id);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.items.push({ book, quantity });
    }
  }

  removeItem(bookId) {
    this.items = this.items.filter(item => item.book._id !== bookId);
  }

  updateQuantity(bookId, quantity) {
    const item = this.items.find(item => item.book._id === bookId);
    if (item) {
      item.quantity = quantity;
    }
  }

  clearCart() {
    this.items = [];
  }

  getTotal() {
    return this.items.reduce((total, item) => total + item.book.price * item.quantity, 0);
  }

  getItems() {
    return this.items;
  }

  getItemCount() {
    return this.items.reduce((count, item) => count + item.quantity, 0);
  }
}

module.exports = Cart;
