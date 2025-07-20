# Streamz Server

A Node.js video library application built with Fastify web framework. Streamz allows you to manage and serve videos locally with user authentication and REST API support.

## Features

- Local video management and storage
- User authentication system
- REST API endpoints for video operations
- Web interface for video management
- Secure file upload and serving

## Prerequisites

- Node.js (v18 or higher recommended)
- npm (comes with Node.js)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/rajatxs/streamz-server.git
```

2. Install dependencies:
```bash
npm install
```

## Usage

### Starting the Server

To start the server in development mode:
```bash
npm run dev:start
```

To start the server in production mode:
```bash
npm run start
```

### Creating Admin User

Create an admin user using the following command:
```bash
npm run dev:create-admin
```

## API Endpoints

The server provides RESTful API endpoints for video management. All API endpoints require authentication.

### Authentication

- Basic authentication is used for API endpoints
- User credentials must be provided in the Authorization header

### Available Endpoints

- `GET /api/videos` - List all videos
- `POST /api/videos` - Upload new video
- `GET /api/videos/:id` - Get video details
- `DELETE /api/videos/:id` - Delete video

## Project Structure

```
streamz-server/
├── cmd/           # Command line interface
├── appdata/       # Application data directory
├── src/           # Source code
└── package.json   # Project dependencies
```

## License

ISC License

## Author

Rajat Sharma
- Email: rajatxt@proton.me
- GitHub: https://github.com/rajatxs

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
