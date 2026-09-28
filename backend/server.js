import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 3000);
const distPath = path.resolve(__dirname, '../frontend/dist');

const app = express();
app.use(express.json());

app.get('/api/health', (_request, response) => {
  response.status(200).json({ status: 'ok', service: 'soleflow-api' });
});

app.use('/api', (_request, response) => {
  response.status(404).json({ error: 'Not found' });
});

app.use(express.static(distPath));

app.get('*', (_request, response) => {
  response.sendFile(path.join(distPath, 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`SoleFlow server listening on http://0.0.0.0:${port}`);
});

