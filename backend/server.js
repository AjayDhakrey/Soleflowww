import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, './.env') });

import { app } from './src/app.js';
import { logger } from './src/lib/logger.js';

const port = Number(process.env.PORT || 3000);

app.listen(port, '0.0.0.0', () => {
  logger.info(`SoleFlow production server running on http://0.0.0.0:${port}`);
});
