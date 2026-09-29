import { app } from './src/app.js';
import { logger } from './src/lib/logger.js';

const port = Number(process.env.PORT || 3000);

app.listen(port, '0.0.0.0', () => {
  logger.info(`SoleFlow production server running on http://0.0.0.0:${port}`);
});
