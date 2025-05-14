# API Test Scripts

This directory contains scripts for testing API connectivity and mock servers for development.

## Mock Positions API Server

The `mock-positions-server.js` script provides a simple server that simulates the positions API for frontend development and testing.

### Prerequisites

Make sure you have the required packages installed:

```bash
npm install express cors
```

### Running the server

From the project root directory, run:

```bash
node scripts/mock-positions-server.js
```

The server will start on port 5056 and provide the following endpoints:

- `GET http://localhost:5056/positions` - Returns mock position data that changes slightly on each request

### Testing API connectivity

You can also test connectivity to the real API server using the test script:

```bash
node scripts/test-positions-api.js
```

This script will attempt to connect to the API and report whether it was successful.

## Troubleshooting

If you see a warning in the positions page that says "Currently showing mock data", it means that either:

1. The API server at `http://localhost:5056` is not running
2. The API server is running but is returning the default mock data structure

Check that:
- The server is running on port 5056
- There are no network issues or firewall restrictions
- The API is correctly configured and returning data

If you're using the mock server for development, make sure to restart it if you make changes to the script. 