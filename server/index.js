const express   = require('express');
const http      = require('http');
const socketIo  = require('socket.io');
const {
  startTranscriptionStream
} = require('./transcribeStream');

const app    = express();
const server = http.createServer(app);
const io     = socketIo(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

const PORT = process.env.PORT || 3000;

// Health-check endpoint expected by the load balancer
app.get('/', (_req, res) => res.sendStatus(200));

io.on('connection', socket => {
  console.log('Client connected:', socket.id);

  /** @type {PassThrough & { stop?: () => void }} */
  let transcribeStream = null;

  socket.on('startTranscription', ({ language }) => {
    // clean up any half-open previous stream
    transcribeStream?.stop?.();

    // create a *new* stream (returned synchronously!)
    transcribeStream = startTranscriptionStream(({ text, isFinal }) => {
      socket.emit('transcription', { text, isFinal });
    }, language);

    console.log('Starting transcription stream…');
  });

  socket.on('audioData', (data) => {
    if (transcribeStream?.writableEnded) return;        // ignore if closed
    const buf = Buffer.from(new Uint8Array(data));
    transcribeStream?.write(buf);
  });

  socket.on('stopTranscription', () => {
    transcribeStream?.stop?.();
    transcribeStream = null;
    console.log('Stopped transcription stream.');
  });

  socket.on('disconnect', () => {
    transcribeStream?.stop?.();
    transcribeStream = null;
    console.log('Client disconnected');
  });
});

server.listen(PORT, () =>
  console.log(`Server listening on port ${PORT}`)
);
