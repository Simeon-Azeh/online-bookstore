| Route        | Method | Description      |
| ------------ | ------ | ---------------- |
| `/api/books` | GET    | Get all books    |
| `/api/books` | POST   | Add new book     |
| `/api/users` | GET    | List users       |
| `/api/users` | POST   | Create a user    |
| `/api/cart`  | GET    | Get cart items   |
| `/api/cart`  | POST   | Add item to cart |
| `/api/cart`  | DELETE | Clear cart       |

| Endpoint          | Method | Description             |
| ----------------- | ------ | ----------------------- |
| `/add`            | POST   | Add book to cart        |
| `/remove/:bookId` | DELETE | Remove item from cart   |
| `/update/:bookId` | PUT    | Change quantity         |
| `/clear`          | DELETE | Clear entire cart       |
| `/summary`        | GET    | Get cart items & totals |
