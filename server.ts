import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import axios from 'axios';
import http from 'http';
import bodyParser from 'body-parser';
import cors from 'cors';
import WebSocket from 'ws';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();
app.use(cors()); // Enable CORS

app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`Received request: ${req.method} ${req.url}`);
  next();
});

app.use('/api', createProxyMiddleware({ 
  target: 'http://192.168.1.80:5053', 
  changeOrigin: true 
}));

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
const server = http.createServer(app);
server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

const wss = new WebSocket.Server({ server });

wss.on('connection', ws => {
  console.log('Client connected');

  // Fetch track IDs from the API
  axios.get('http://192.168.1.80:5053/api/Track').then(response => {
    const trackIds = response.data.map((track: any) => track.trackID);
console.log('trackIds:', trackIds);
    // Simulate a 'track liked' event every 5 seconds
    setInterval(async () => {
      const trackId = trackIds[Math.floor(Math.random() * trackIds.length)]; // Select a random track ID from the array
     const likesCountResponse = await axios.get(`http://192.168.1.80:5053/api/Likes/${trackId}/likescount`);
      const likesCount = likesCountResponse.data;

      const message = JSON.stringify({
        trackId: trackId,
      likesCount: likesCount,
      });

      ws.send(message);
    }, 5000);
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});