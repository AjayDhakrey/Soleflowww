import { createServer } from 'node:http';

const port = Number(process.env.API_PORT || 4000);

const server = createServer((request, response) => {
  if (request.url === '/api/health' && request.method === 'GET') {
    response.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
    response.end(JSON.stringify({ status: 'ok', service: 'soleflow-api' }));
    return;
  }

  response.writeHead(404, { 'content-type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(port, '0.0.0.0', () => {
  console.log(`SoleFlow API listening on http://localhost:${port}`);
});
