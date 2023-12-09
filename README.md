# Interactive Drawing Board with Socket.io (Typescript)

This project is an interactive drawing board that allows multiple users to collaborate in real-time on a shared HTML5 canvas. Users can draw using different tools, choose colors, and adjust brush sizes. The application is built using React (with Typescript) and a Socket.IO client for the client-side and Node.js with Socket.IO for the server-side to enable real-time communication between users.

## Features

- **Real-time Drawing:** Users can draw on the canvas in real-time, and changes are instantly synchronized across all connected clients.
- **Color Picker:** Choose a color from the color picker to customize your drawing color.
- **Brush Size Slider:** Adjust the brush size using the slider for thicker or thinner lines.
- **Clear Canvas:** Clear the entire canvas with the "Clear" button.
- **Brush and Eraser Tools:** Toggle between the brush and eraser tools for different drawing modes.

## Technologies Used

- **Frontend:** React, HTML5 Canvas, React Router, Socket.IO-client
- **Backend:** Node.js, Socket.IO
- **Other:** Express, CORS

## How It Works

- Users access the application through a unique URL generated using a Short UUID when navigating to the root path ("/").
- Each unique URL corresponds to a specific drawing room identified by a room ID.
- Drawing states for each room are saved on the server and shared with new users upon joining a room, ensuring that they see the existing drawing when they join.
- The drawing state is automatically cleared from the server's memory when all users leave the room.
- Real-time communication is facilitated through Socket.IO, allowing changes made by one user to be instantly reflected on the canvases of all connected users in the same room.

 ## Socket.io Events

 #### Client-Side
 
- **`connect`:** Triggered when a client connects to the Socket.io server. It emits a join-room event to join a specific drawing room.
- **`join-room`:** Sent to the server to join a specific drawing room.
- **`draw`:** Emits and receives drawing updates. Clients send their canvas state to the server, which broadcasts it to all other clients in the room.
- **`disconnect`:** Triggered when a client disconnects from the Socket.io server.

#### Server-Side
- **`connection`:** Triggered on a new client connection. Sets up event listeners for the newly connected client.
- **`join-room`:** Handles client requests to join a room. Adds the client to the room, increments the count of connected clients, and sends the current drawing state to the new client.
- **`draw`:** Handles drawing updates from clients. Broadcasts the received state to all other clients in the same room.
- **`disconnect`:** Triggered on client disconnection. Updates server-side state, such as decrementing the client count and clearing the room's drawing state if 0 clients are connected.

## Getting Started

### Prerequisites
- Node.js installed on your machine
- A modern web browser that supports HTML5 Canvas API

1. Clone the repository:
```
git clone https://github.com/1mt4y/Interactive-Drawing-Board.git
```
2. Navigate to the project directory:
```
cd Interactive-Drawing-Board
```
3. Install dependencies for both client and server:
```
cd drawing-board-client
npm install

cd ../drawing-board-server
npm install
```
4. Run the client and server separately:
```
# In the client directory
npm start

# In the server directory
npm start
```
5. Open your browser and visit **`http://localhost:5173/`** to use the interactive drawing board.


## Additional Notes
- The server runs on http://localhost:10000 by default. Make sure to adjust the URL in the client code if needed.
