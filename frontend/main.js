const API_BASE = "http://localhost:5001/api";

// --- OOP Classes ---
class Book {
  constructor({ _id, title, author, price, description }) {
    this.id = _id;
    this.title = title;
    this.author = author;
    this.price = price;
    this.description = description;
  }
}

class Customer {
  constructor({ id, name, email }) {
    this.id = id;
    this.name = name;
    this.email = email;
  }
}

class ShoppingCart {
  constructor(customer) {
    this.customer = customer;
    this.items = [];
  }
  async fetchCart() {
    if (!this.customer) return;
    const res = await fetch(`${API_BASE}/cart/summary`);
    const cart = await res.json();
    this.items = cart.items || [];
    return cart;
  }
  async addBook(book, quantity = 1) {
    if (!this.customer) return;
    await fetch(`${API_BASE}/cart/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        book: { _id: book.id, price: book.price },
        quantity,
      }),
    });
    await this.fetchCart();
  }
  async removeBook(bookId) {
    if (!this.customer) return;
    await fetch(`${API_BASE}/cart/remove/${bookId}`, { method: "DELETE" });
    await this.fetchCart();
  }
  async updateQuantity(bookId, quantity) {
    if (!this.customer) return;
    await fetch(`${API_BASE}/cart/update/${bookId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity }),
    });
    await this.fetchCart();
  }
  async clearCart() {
    if (!this.customer) return;
    await fetch(`${API_BASE}/cart/clear`, { method: "DELETE" });
    this.items = [];
  }
  getTotal() {
    return this.items.reduce(
      (total, item) => total + item.book.price * item.quantity,
      0
    );
  }
  getItemCount() {
    return this.items.reduce((count, item) => count + item.quantity, 0);
  }
}

// --- State ---
let currentCustomer = null;
let shoppingCart = null;

// --- User Simulation Logic ---
document.addEventListener("DOMContentLoaded", () => {
  const customerLoginForm = document.getElementById("customerLoginForm");
  const customerEmailInput = document.getElementById("customerEmailInput");
  const currentCustomerDisplay = document.getElementById(
    "currentCustomerDisplay"
  );

  customerLoginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = customerEmailInput.value.trim();
    if (!email) return;
    // Try to find user by email
    const res = await fetch(`${API_BASE}/users`);
    const users = await res.json();
    let user = users.find((u) => u.email === email);
    if (!user) {
      // Auto-create user for simulation
      const createRes = await fetch(`${API_BASE}/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: email.split("@")[0],
          email,
          password: "password123",
        }),
      });
      user = await createRes.json();
    }
    currentCustomer = new Customer({
      id: user._id,
      name: user.name,
      email: user.email,
    });
    shoppingCart = new ShoppingCart(currentCustomer);
    currentCustomerDisplay.textContent = `Logged in as: ${currentCustomer.name} (${currentCustomer.email})`;
    await shoppingCart.fetchCart();
    renderCartItems();
  });

  // --- Books Tab ---
  document
    .getElementById("listBooksButton")
    .addEventListener("click", listAllBooks);
  document.getElementById("addBookForm").addEventListener("submit", addNewBook);

  // --- Users Tab ---
  document
    .getElementById("listUsersButton")
    .addEventListener("click", listAllUsers);
  document.getElementById("addUserForm").addEventListener("submit", addNewUser);

  // --- Cart Tab ---
  document
    .getElementById("getCartItemsButton")
    .addEventListener("click", renderCartItems);
  document
    .getElementById("clearCartButton")
    .addEventListener("click", async () => {
      if (!shoppingCart) return;
      await shoppingCart.clearCart();
      renderCartItems();
    });
  document
    .getElementById("getCartSummaryButton")
    .addEventListener("click", renderCartSummary);
  document
    .getElementById("addCartItemForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!shoppingCart) return;
      const form = e.target;
      const bookId = form.bookId.value;
      const price = parseFloat(form.price.value);
      const quantity = parseInt(form.quantity.value);
      const book = new Book({
        _id: bookId,
        title: "",
        author: "",
        price,
        description: "",
      });
      await shoppingCart.addBook(book, quantity);
      renderCartItems();
      form.reset();
    });
});

// --- Books Logic ---
async function listAllBooks(e) {
  e && e.preventDefault();
  const booksResult = document.getElementById("booksResult");
  booksResult.innerHTML = "<div>Loading...</div>";
  try {
    const res = await fetch(`${API_BASE}/books`);
    const books = await res.json();
    if (!books.length) {
      booksResult.innerHTML =
        '<div class="alert alert-info">No books found.</div>';
      return;
    }
    let html = `<table class="table table-bordered"><thead><tr><th>ID</th><th>Title</th><th>Author</th><th>Price</th><th>Description</th><th>Add to Cart</th></tr></thead><tbody>`;
    books.forEach((b) => {
      html += `<tr><td>${b._id}</td><td>${b.title}</td><td>${
        b.author
      }</td><td>$${b.price.toFixed(2)}</td><td>${
        b.description || ""
      }</td><td><button class="btn btn-sm btn-success addToCartButton" data-id="${
        b._id
      }" data-price="${b.price}">Add</button></td></tr>`;
    });
    html += "</tbody></table>";
    booksResult.innerHTML = html;
    document.querySelectorAll(".addToCartButton").forEach((btn) => {
      btn.addEventListener("click", async () => {
        if (!shoppingCart) return;
        const bookId = btn.getAttribute("data-id");
        const price = parseFloat(btn.getAttribute("data-price"));
        const book = new Book({
          _id: bookId,
          title: "",
          author: "",
          price,
          description: "",
        });
        await shoppingCart.addBook(book, 1);
        renderCartItems();
      });
    });
  } catch (err) {
    booksResult.innerHTML = `<div class="alert alert-danger">Error: ${err.message}</div>`;
  }
}

async function addNewBook(e) {
  e.preventDefault();
  const form = e.target;
  const booksResult = document.getElementById("booksResult");
  const data = {
    title: form.title.value,
    author: form.author.value,
    price: parseFloat(form.price.value),
    description: form.description.value,
  };
  try {
    const res = await fetch(`${API_BASE}/books`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to add book");
    form.reset();
    booksResult.innerHTML =
      '<div class="alert alert-success">Book added successfully!</div>';
    listAllBooks();
  } catch (err) {
    booksResult.innerHTML = `<div class="alert alert-danger">Error: ${err.message}</div>`;
  }
}

// --- Users Logic ---
async function listAllUsers(e) {
  e && e.preventDefault();
  const usersResult = document.getElementById("usersResult");
  usersResult.innerHTML = "<div>Loading...</div>";
  try {
    const res = await fetch(`${API_BASE}/users`);
    const users = await res.json();
    if (!users.length) {
      usersResult.innerHTML =
        '<div class="alert alert-info">No users found.</div>';
      return;
    }
    let html = `<table class="table table-bordered"><thead><tr><th>ID</th><th>Name</th><th>Email</th></tr></thead><tbody>`;
    users.forEach((u) => {
      html += `<tr><td>${u._id}</td><td>${u.name}</td><td>${u.email}</td></tr>`;
    });
    html += "</tbody></table>";
    usersResult.innerHTML = html;
  } catch (err) {
    usersResult.innerHTML = `<div class="alert alert-danger">Error: ${err.message}</div>`;
  }
}

async function addNewUser(e) {
  e.preventDefault();
  const form = e.target;
  const usersResult = document.getElementById("usersResult");
  const data = {
    name: form.name.value,
    email: form.email.value,
    password: form.password.value,
  };
  try {
    const res = await fetch(`${API_BASE}/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create user");
    form.reset();
    usersResult.innerHTML =
      '<div class="alert alert-success">User created successfully!</div>';
    listAllUsers();
  } catch (err) {
    usersResult.innerHTML = `<div class="alert alert-danger">Error: ${err.message}</div>`;
  }
}

// --- Cart Logic ---
async function renderCartItems() {
  const cartResult = document.getElementById("cartResult");
  if (!shoppingCart) {
    cartResult.innerHTML =
      '<div class="alert alert-warning">Please log in as a customer to view cart.</div>';
    return;
  }
  await shoppingCart.fetchCart();
  if (!shoppingCart.items.length) {
    cartResult.innerHTML = '<div class="alert alert-info">Cart is empty.</div>';
    return;
  }
  let html = `<table class="table table-bordered"><thead><tr><th>Book ID</th><th>Price</th><th>Quantity</th><th>Actions</th></tr></thead><tbody>`;
  shoppingCart.items.forEach((item) => {
    html += `<tr>
      <td>${item.book._id}</td>
      <td>$${item.book.price.toFixed(2)}</td>
      <td><input type="number" min="1" value="${
        item.quantity
      }" class="form-control form-control-sm cartQuantityInput" data-id="${
      item.book._id
    }"></td>
      <td><button class="btn btn-danger btn-sm removeCartItemButton" data-id="${
        item.book._id
      }">Remove</button></td>
    </tr>`;
  });
  html += "</tbody></table>";
  cartResult.innerHTML = html;
  document.querySelectorAll(".removeCartItemButton").forEach((btn) => {
    btn.addEventListener("click", async () => {
      await shoppingCart.removeBook(btn.getAttribute("data-id"));
      renderCartItems();
    });
  });
  document.querySelectorAll(".cartQuantityInput").forEach((input) => {
    input.addEventListener("change", async () => {
      await shoppingCart.updateQuantity(
        input.getAttribute("data-id"),
        parseInt(input.value)
      );
      renderCartItems();
    });
  });
}

async function renderCartSummary() {
  const cartSummary = document.getElementById("cartSummary");
  if (!shoppingCart) {
    cartSummary.innerHTML = "";
    return;
  }
  await shoppingCart.fetchCart();
  cartSummary.innerHTML = `<div class="alert alert-info">Total: $${shoppingCart
    .getTotal()
    .toFixed(2)} | Items: ${shoppingCart.getItemCount()}</div>`;
}
