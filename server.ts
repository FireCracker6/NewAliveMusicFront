import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import axios from 'axios';
import http from 'http';
import bodyParser from 'body-parser';
import cors from 'cors';


const app = express();
app.use(cors()); // Enable CORS

app.use((req: Request, res: Response, next: NextFunction) => {
//  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  console.log('Size of headers: ', JSON.stringify(req.headers).length);
  next();
});



app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`Received request: ${req.method} ${req.url}`);
  next();
});

app.use(bodyParser.json({ limit: '100mb' }));

app.post('/fetchData', (req: Request, res: Response) => {
  const url = req.body.url;
  const apiKey = '2555cad4-34a6-427a-a2e8-965f848f69fc';
  axios({
    method: 'get',
    url: url,
    headers: {'Authorization': apiKey}
  }).then(response => {
    console.log(response.headers);
    res.json(response.data);
  }).catch(error => {
    if (error.response) {
      res.status(error.response.status).json({ error: error.response.data });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  });
});

app.use(express.static(path.join(__dirname, 'build')));

const port = process.env.PORT || 3001; // Change this to a different port than your React app
const server = http.createServer({ maxHeaderSize: 16384 }, app); // maxHeaderSize is now 16 KB
server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});