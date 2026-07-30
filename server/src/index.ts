// Blokus server — STUB.
//
// The local 2-player game (M2) runs entirely in the browser and needs no server.
// This process exists only to reserve the shape of the online phase (M3), where it
// will become the *authoritative* referee: it will import @blokus/engine and validate
// every move server-side (never trusting the client) over Socket.IO rooms.
import { createServer } from 'node:http';

const PORT = Number(process.env.PORT ?? 3001);

const server = createServer((_req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(
    JSON.stringify({
      service: 'blokus-server',
      status: 'stub',
      note: 'Online multiplayer arrives in M3.',
    }),
  );
});

server.listen(PORT, () => {
  console.log(`[blokus-server] stub listening on http://localhost:${PORT}`);
});
