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
    const { title, author, description, price } = req.body;

    if (!title || !author || !price) {
      return res.status(400).json({ message: "Title, author, and price are required" });
    }

    const book = new Book({ title, author, description, price });
    const saved = await book.save();

    res.status(201).json(saved);
  } catch (error) {
    console.error("Error creating book:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};
