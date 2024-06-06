const http = require("http");
const { WebSocketServer } = require("ws");

const url = require("url");
const { v4: uuidv4 } = require("uuid");

const server = http.createServer();

const wsServer = new WebSocketServer({ server });
const port = process.env.PORT || 8000;

const connections = {};
const users = {};

const brodcastUsers = () => {
  Object.keys(connections).forEach((uuid) => {
    const connection = connections[uuid];
    const message = JSON.stringify(users);
    connection.send(JSON.stringify(message));
  });
};

const handleMessage = (bytes, uuid) => {
  const message = JSON.parse(bytes.toString());
  const user = users[uuid];
  user.state = message;

  brodcastUsers();

  console.log(
    `${user.username} updated state to ${JSON.stringify(user.state)}`
  );
};

const handleClose = (uuid) => {
  console.log(`${users[uuid].username} disconnected`);
  delete connections[uuid];
  delete users[uuid];

  brodcastUsers();
};

wsServer.on("connection", (connection, request) => {
  // ws://localhost:8000?username=Alex

  const { username } = url.parse(request.url, true).query;
  const uuid = uuidv4();
  console.log(username);
  console.log(uuid);

  connections[uuid] = connection;

  users[uuid] = { username, state: {} };
  connection.on("message", (bytes) => handleMessage(bytes, uuid));
  connection.on("close", () => handleClose(uuid));
});
server.listen(port, () => {
  console.log(` Server started on port ${port}`);
});
