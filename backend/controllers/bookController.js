const Book = require("../models/Book");

// @desc    Get all books
// @route   GET /api/books
exports.getAllBooks = async (req, res) => {
  try {
    const books = await Book.find();
    res.status(200).json(books);
  } catch (error) {
    console.error("Error fetching books:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Create a new book
// @route   POST /api/books
exports.createBook = async (req, res) => {
  try {
    const { title, author, description, price, stock } = req.body;

    if (!title || !author || !price) {
      return res.status(400).json({ message: "Title, author, and price are required" });
    }

    const book = new Book({ title, author, description, price, stock });
    const saved = await book.save();

    res.status(201).json(saved);
  } catch (error) {
    console.error("Error creating book:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update a book
// @route   PUT /api/books/:id
exports.updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedBook = await Book.findByIdAndUpdate(id, updates, { new: true });

    if (!updatedBook) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.json(updatedBook);
  } catch (error) {
    console.error("Error updating book:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete a book
// @route   DELETE /api/books/:id
exports.deleteBook = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedBook = await Book.findByIdAndDelete(id);

    if (!deletedBook) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.json({ message: "Book deleted successfully" });
  } catch (error) {
    console.error("Error deleting book:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};