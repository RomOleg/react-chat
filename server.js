require("dotenv").config();
const express = require('express');
// создаем express приложение
const app = express();
// создаем сервер-прослойку между app и сервером
const server = require('http').Server(app);
const io = require('socket.io')(server);

const PORT = process.env.PORT || 8080;

// сообщаем серверу что он может получать json данные
// для того, чтобы видеть req.body
app.use(express.json());

// комнаты для чата
const rooms = new Map();

// отправляем запрос при входе юзера в комнату
app.get('/rooms/:id', (req, res) => {
  const { id: roomId } = req.params;
  // если такая комната есть
  const obj = rooms.has(roomId)
    ? {
        users: [...rooms.get(roomId).get('users').values()],
        messages: [...rooms.get(roomId).get('messages').values()],
      }
      // если такой комнаты нет
    : { users: [], messages: [] };
  res.json(obj);
});

// сервер слушает если пришол post запрос, то он выполяет следующее
app.post('/rooms', (req, res) => {
  const { roomId, userName } = req.body;
  // проверили что комната с roomId не существует
  if (!rooms.has(roomId)) {
    // создаем комнату
    rooms.set(
      roomId,
      new Map([
        ['users', new Map()],
        ['messages', []],
      ]),
    );
  }
  // отправляем ответ клиенту, статус 200 
  res.send();
});

// слушаем подключение пользователя
io.on('connection', (socket) => {

  // слущаем сокет запрос по действию ROOM:JOIN
  socket.on('ROOM:JOIN', ({ roomId, userName }) => {
    // отправить сокет в конкретную комнату
    socket.join(roomId);
    // добавляем пользователя в список users
    rooms.get(roomId).get('users').set(socket.id, userName);
    // получаем всех пользователей комнаты
    const users = [...rooms.get(roomId).get('users').values()];
    // оповещаем всех пользователей комнаты, кроме себя, что пользователь подключился
    socket.to(roomId).broadcast.emit('ROOM:SET_USERS', users);
  });

  // слущаем сокет запрос по действию ROOM:NEW_MESSAGE
  socket.on('ROOM:NEW_MESSAGE', ({ roomId, userName, text, dateMessage }) => {
    // сообщение
    const obj = {
      userName,
      // текст сообщения
      text,
      // дата отправки сообщения
      dateMessage,
    };
    // добавляем сообщение в нужную комнату по idroom 
    rooms.get(roomId).get('messages').push(obj);
    // отправляем всем, кроме себя, сообщение в чате
    socket.to(roomId).broadcast.emit('ROOM:NEW_MESSAGE', obj);
  });

  // удаляем юзера из комнаты 
  socket.on('disconnect', () => {
    rooms.forEach((value, roomId) => {
      // проверяем если пользователь с socket.id существует 
      // то удаляем пользователя
      if (value.get('users').delete(socket.id)) {
        const users = [...value.get('users').values()];
        // обновляем список пользователей в чате
        socket.to(roomId).broadcast.emit('ROOM:SET_USERS', users);
      }
    });
  });
});
// слушаем сервер на 9999 порту
server.listen(PORT, (err) => {
  if (err) {
    throw Error(err);
  }
  console.log('Сервер запущен!');
});
