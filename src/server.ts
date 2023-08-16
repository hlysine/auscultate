import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import heartApi from './lib/heart/api';
import breathApi from './lib/breath/api';
import {
  readPatients as readHeartPatients,
  patients as heartPatients,
} from './lib/heart/data';
import {
  readCases as readBreathCases,
  cases as breathCases,
} from './lib/breath/data';
import cors from 'cors';
import { isBoom } from '@hapi/boom';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { PORT = 7860 } = process.env;

const app = express();

// Enable cross-origin resource sharing
app.use(cors());

// Middleware that parses json and looks at requests where the Content-Type header matches the type option.
app.use(express.json());

// Serve API requests from the router
app.use('/api/heart', heartApi);
app.use('/api/breath', breathApi);

// Serve app production bundle
app.use(express.static('dist/app'));

app.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) {
    return next(err);
  }
  if (isBoom(err)) {
    return res.status(err.output.statusCode).json(err.output.payload);
  }
  next(err);
});

// Handle client routing, return all requests to the app
app.get('*', (_req, res) => {
  res.sendFile(join(__dirname, 'app/index.html'));
});

Promise.all([
  (async () => {
    await readHeartPatients();
    console.log(`Heart sounds: ${heartPatients.length} patients loaded`);
  })(),
  (async () => {
    await readBreathCases();
    console.log(`Breath sounds: ${breathCases.length} cases loaded`);
  })(),
]).then(() => {
  app.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}`);
  });
});
