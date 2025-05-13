# Personal Notes API

A secure and персонаlized RESTful API for managing your notes. This application allows users to register, log in, and perform CRUD operations on their own notes, with an additional admin layer for managing all users and notes.

## Features

- **User Authentication:**
  - User registration (`/api/auth/register`)
  - User login (`/api/auth/login`) generating JWT tokens
  - Password hashing (bcrypt) for security
  - Protected routes requiring JWT authentication
- **Note Management (User-Specific):**
  - Create new notes (`POST /api/notes`)
  - Read all personal notes (`GET /api/notes`)
  - Read a single personal note by ID (`GET /api/notes/:noteId`), including author details.
  - Update personal notes (`PUT /api/notes/:noteId`)
  - Delete personal notes (`DELETE /api/notes/:noteId`)
- **Authorization:**
  - Users can only access and modify their own notes.
  - Unauthorized access attempts return appropriate error messages.
- **Admin Role & Privileges:**
  - Special admin user type.
  - Admins can view all notes from all users.
  - Admins can view all user accounts.
  - Admins can update any user's information (e.g., username, email, admin status).
  - Admins can delete any user account.
  - Admins can update or delete any note in the system.
- **Data Storage:**
  - Uses SQLite for lightweight, file-based database storage.
  - Automatic creation of database schema and tables on startup.

## Technology Stack

- **Backend:** Node.js
- **Framework:** Express.js
- **Database:** SQLite3
- **Authentication:** JSON Web Tokens (JWT)
- **Password Hashing:** bcryptjs
- **Environment Variables:** dotenv

## Prerequisites

- Node.js (v14.x or later recommended)
- npm (Node Package Manager, usually comes with Node.js)

## Setup and Installation

1.  **Clone the repository (or download the files):**

    ```bash
    # If you had this in a Git repository:
    # git clone <repository-url>
    # cd personal-notes-api
    ```

    If you received the files directly, ensure they are in a project folder.

2.  **Install dependencies:**
    Navigate to the project directory in your terminal and run:

    ```bash
    npm install
    ```

3.  **Set up Environment Variables:**
    Create a `.env` file in the root of your project directory. Copy the contents of `.env.example` (if provided) or add the following, replacing placeholder values:
    ```env
    PORT=3000
    DATABASE_FILE_PATH=./dev.sqlite3
    JWT_SECRET=your_super_secret_and_long_jwt_key_here
    ```
    - `PORT`: The port the application will run on (default: 3000).
    - `DATABASE_FILE_PATH`: Path to the SQLite database file (e.g., `./dev.sqlite3`).
    - `JWT_SECRET`: A strong, random string for signing JWT tokens. **Change this to a secure value.**

## Running the Application

- **Development Mode (with auto-restarting using nodemon):**
  ```bash
  npm run dev
  ```
- **Production Mode:**
  ```bash
  npm start
  ```
  The API will be accessible at `http://localhost:3000` (or your configured port).

## API Endpoints

The base URL for all API endpoints is `http://localhost:3000/api`.

### Authentication (`/auth`)

| Method   | Endpoint              | Description                        | Protected   | Request Body Example                                    |
| :------- | :-------------------- | :--------------------------------- | :---------- | :------------------------------------------------------ |
| `POST`   | `/auth/register`      | Register a new user                | No          | `{"username": "u", "email": "e@e.co", "password": "p"}` |
| `POST`   | `/auth/login`         | Log in an existing user            | No          | `{"emailOrUsername": "u", "password": "p"}`             |
| `GET`    | `/auth/me`            | Get current logged-in user profile | Yes         | N/A                                                     |
| `GET`    | `/auth/users`         | Get all users (Admin only)         | Yes (Admin) | N/A                                                     |
| `PUT`    | `/auth/users/:userId` | Update a user (Admin only)         | Yes (Admin) | `{"username": "new_u", "email": "new_e@e.co"}`          |
| `DELETE` | `/auth/users/:userId` | Delete a user (Admin only)         | Yes (Admin) | N/A                                                     |

### Notes (`/notes`)

_All note routes below require authentication (Bearer Token in Authorization header)._

| Method   | Endpoint               | Description                                  | Protected   | Request Body Example                                 |
| :------- | :--------------------- | :------------------------------------------- | :---------- | :--------------------------------------------------- |
| `POST`   | `/notes`               | Create a new note                            | Yes         | `{"title": "My Note", "content": "Details..."}`      |
| `GET`    | `/notes`               | Get all notes for the user (or all if Admin) | Yes         | N/A                                                  |
| `GET`    | `/notes/:noteId`       | Get a single note by ID                      | Yes         | N/A                                                  |
| `PUT`    | `/notes/:noteId`       | Update a note by ID                          | Yes         | `{"title": "Updated Title", "content": "New text"}`  |
| `DELETE` | `/notes/:noteId`       | Delete a note by ID                          | Yes         | N/A                                                  |
| `PUT`    | `/notes/admin/:noteId` | Update any note by ID (Admin only)           | Yes (Admin) | `{"title": "Admin Update", "content": "Admin text"}` |
| `DELETE` | `/notes/admin/:noteId` | Delete any note by ID (Admin only)           | Yes (Admin) | N/A                                                  |

**Note on Protection:**

- `Yes`: Requires a valid JWT token from a logged-in user.
- `Yes (Admin)`: Requires a valid JWT token from a user who is flagged as an admin.

## Testing

Use an API testing tool like [Postman](https://www.postman.com/) or [Insomnia](https://insomnia.rest/) to interact with the endpoints.

1.  Register a user to get a JWT token.
2.  For protected routes, include the token in the `Authorization` header: `Bearer <YOUR_JWT_TOKEN>`.
3.  To test admin functionalities:
    - Register a user.
    - Manually update their `is_admin` field to `1` in the `users` table of your `dev.sqlite3` database file (e.g., using DB Browser for SQLite).
    - Log in as this admin user to get an admin-privileged token.

## Project Structure
