/*

Messages format

{ type: 'message', 'username': 'Anonymous', 'text': 'my text', token: 'asd' }
{ type: 'registration', 'username': 'Anonymous' }

*/


const WebsocketServer = require('ws').Server;
const wss = new WebsocketServer({
  host: 'localhost',
  port: 8082
}, () => {
  console.log('Server is avalible on port 8082');
});

const crypto = require('crypto');

let clients = [];

wss.on('connection', (ws) => {
  ws.on('message', wsOnMessage.bind(this, [ws]));
});

function wsOnMessage (ws, message) {
  let msg;

  try {
    msg = JSON.parse(message);

    switch (msg.type) {
      case 'registration':
        userRegistrate(ws, msg);
      break;

      case 'message':
        sendMessage(msg);
      break;

      default:
      break;
    }
  } catch (err) {
    console.log(err);
  }
}

function userRegistrate (ws, message) {
  const token = crypto.randomBytes(64).toString('hex');

  let user = {
    ...message,
    socket: ws[0],
    token: token
  }

  clients.push(user);

  user.socket.send(JSON.stringify(user));
}

function sendMessage (msg) {
  broadcastMsg(msg.username, msg.text, msg.token);
  return false;
}

function broadcastMsg (username, text, token) {
  clients.forEach((client) => {
    try {
      client.socket.send(JSON.stringify({
        type: 'message',
        username: username,
        text: text,
        token: token
      }));
    } catch (err) {
      // delete user
    }
  });
}