const express = require('express');
const path = require('path');
const _ = require('lodash');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server, {
  path: '/soc'
});

app.use(express.static(path.join(__dirname, 'build')));

let socket;
io.on('connection', (s) => {
  socket = s;
  // socket.on('start', (data) => {
  //   socket.emit('starting', {});

  //   if (!_.includes(data.url, 'digilib.nalis')) {
  //     socket.emit('oops', { error: 'Unsupported URL' });
  //     return;
  //   }

  //   downloadAndCreatePDF(socket, data.url)
  //     .then(() => socket.emit('done', { path: `/done/${socket.id}/book.pdf` }))
  //     .catch(err => socket.emit('oops', { error: err.message }));
  // });
  // socket.on('disconnect', () => {
  //   cleanup(socket);
  // });
});

app.get('/video', (req, res) => {
  const range = req.headers.range
  if (range) {
    const parts = range.replace(/bytes=/, "").split("-")
    const start = parseInt(parts[0], 10)
    const end = parts[1]
      ? parseInt(parts[1], 10)
      : start + 300 // TODO: max
    // const file = fs.createReadStream(path, { start, end })
    socket.emit('fetch', {
      start, end
    }, (data) => {
      console.log(start, end, data.size)
      const head = {
        'Content-Range': `bytes ${start}-${end}/${data.size}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': (Math.max(end, data.size) - start) + 1,
        'Content-Type': 'video/mp4', // TODO:
      }
      res.writeHead(206, head);
      res.end(data.data)
    })
  } else {
    // const head = {
    //   'Content-Length': fileSize,
    //   'Content-Type': 'video/mp4',
    // }
    // res.writeHead(200, head)
    // fs.createReadStream(path).pipe(res)
  }
});

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'build', 'index.html')));

server.listen(process.env.PORT || 8080);
