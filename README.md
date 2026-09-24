# Contact-Management

A full-stack Contact Management System built with React Native, Expo, FastAPI, and MongoDB Atlas.

## Features

- View contacts
- Add new contacts
- Edit existing contacts
- Delete contacts
- Delete confirmation
- Persistent MongoDB storage
- REST API integration
- Horizontal table scrolling
- Vertical table scrolling
- Form validation through FastAPI

## Tech Stack

### Frontend
- React Native
- Expo
- TypeScript
- Axios

### Backend
- FastAPI
- Python
- Pydantic
- Uvicorn

### Database
- MongoDB Atlas

### Deployment
- Frontend: Expo
- Backend: Render
- Database: MongoDB Atlas

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/contacts` | Get all contacts |
| POST | `/contacts` | Create a contact |
| GET | `/contacts/{id}` | Get a contact |
| PUT | `/contacts/{id}` | Update a contact |
| DELETE | `/contacts/{id}` | Delete a contact |

## Backend

The FastAPI backend is deployed on Render:

https://fastapi-contact-api-7bqo.onrender.com

API Documentation:

https://fastapi-contact-api-7bqo.onrender.com/docs

## Running the Frontend

Install dependencies:

npm install

Start the Expo development server:

npx expo start

## Database

The application uses MongoDB Atlas for persistent data storage.

The MongoDB connection string is stored securely as an environment variable and is not included in this repository.

## CRUD Workflow

Create:

React Native → Axios → FastAPI POST → MongoDB

Read:

React Native → Axios → FastAPI GET → MongoDB

Update:

React Native → Axios → FastAPI PUT → MongoDB

Delete:

React Native → Axios → FastAPI DELETE → MongoDB

## Authentication

The application uses HTTP Basic Authentication between the React Native frontend and the FastAPI backend.

### Backend Authentication

The FastAPI backend protects all contact CRUD endpoints with HTTP Basic Authentication.

Protected endpoints:

- GET `/contacts`
- POST `/contacts`
- GET `/contacts/{contact_id}`
- PUT `/contacts/{contact_id}`
- DELETE `/contacts/{contact_id}`

The backend reads the authentication credentials from environment variables:

```env
AUTH_USERNAME=admin
AUTH_PASSWORD=your_password

## License

This project is licensed under the MIT License.
