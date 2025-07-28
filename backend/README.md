# Online Bookstore API

A RESTful API for managing books, users, shopping carts, and orders for an online bookstore.

---

## Table of Contents

- [Features](#features)
- [Database Schema](#database-schema)
- [Setup Instructions](#setup-instructions)
- [API Documentation](#api-documentation)
- [Endpoints](#endpoints)
- [Frontend Usage](#frontend-usage)
- [Deployment](#deployment)
- [License](#license)

---

## Features

- User registration and authentication
- Book management (CRUD)
- Shopping cart operations
- Order placement and management
- API documentation with Swagger UI

---

## Database Schema

### User
- `name`: String
- `email`: String (unique)
- `password`: String (hashed)

### Book
- `title`: String
- `author`: String
- `price`: Number
- `description`: String
- `stock`: Number

### Cart (in-memory, per session)
- `items`: Array of `{ book, quantity }`

### Order
- `user`: User reference
- `items`: Array of `{ book, quantity }`
- `totalPrice`: Number
- `shippingAddress`: String
- `status`: String (`pending`, `processing`, `shipped`, `delivered`, `cancelled`)
- `createdAt`, `updatedAt`: Date

---

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/Simeon-Azeh/online-bookstore.git
cd online-bookstore/backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the `backend` folder:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

### 4. Start the server

```bash
npm start
```
or
```bash
node server.js
```

The API will run at `http://localhost:5000`.

---

## API Documentation

Swagger UI is available at:

```
http://localhost:5000/api-docs
```

---

## Endpoints

### Books

| Route        | Method | Description      |
| ------------ | ------ | ---------------- |
| `/api/books` | GET    | Get all books    |
| `/api/books` | POST   | Add new book     |

### Users

| Route        | Method | Description      |
| ------------ | ------ | ---------------- |
| `/api/users` | POST   | Register user    |
| `/api/users/login` | POST | Login user   |

### Cart

| Route        | Method | Description      |
| ------------ | ------ | ---------------- |
| `/api/cart/add`      | POST   | Add book to cart        |
| `/api/cart/remove/:bookId` | DELETE | Remove item from cart   |
| `/api/cart/update/:bookId` | PUT    | Change quantity         |
| `/api/cart/clear`          | DELETE | Clear entire cart       |
| `/api/cart/summary`        | GET    | Get cart items & totals |

### Orders

| Route                | Method | Description             |
| -------------------- | ------ | ----------------------- |
| `/api/orders`        | POST   | Place a new order       |
| `/api/orders`        | GET    | Get all orders (admin)  |
| `/api/orders/user/:userId` | GET | Get orders for user   |
| `/api/orders/:orderId/status` | PUT | Update order status |

---

## Frontend Usage

If you have a frontend (e.g., in `/frontend`):

1. Open `index.html` in your browser or run a local server.
2. Make sure the backend API (`http://localhost:5000`) is running.
3. The frontend will interact with the API endpoints listed above.

---

## Deployment

- Deploy the backend to services like Render, Heroku, or Vercel.
- Set environment variables in your deployment dashboard.
- For security, Swagger UI should only be enabled in development.

---

## License

MIT

---
