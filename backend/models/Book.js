const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please add a book title"],
      trim: true,
    },
    author: {
      type: String,
      required: [true, "Please add the author's name"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Please add a price"],
      min: [0, "Price must be at least 0"],
    },
    isbn: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, "Stock cannot be negative"],
    },
    description: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Book", bookSchema);
