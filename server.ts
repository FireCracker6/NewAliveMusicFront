import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import axios from 'axios';
import http from 'http';
import bodyParser from 'body-parser';
import cors from 'cors';
import WebSocket from 'ws';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { error } from 'console';
import dotenv from 'dotenv';
dotenv.config();
console.log('PAYPAL_CLIENT_ID:', process.env.PAYPAL_CLIENT_ID);

const app = express();
app.use(cors()); // Enable CORS

app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`Received request: ${req.method} ${req.url}`);
  next();
});

app.get('/api/paypal-client-id', (req, res) => {
  console.log('Sending PayPal client ID:', process.env.PAYPAL_CLIENT_ID);
  res.send({ clientId: process.env.PAYPAL_CLIENT_ID });
});

app.use('/api', createProxyMiddleware({ 
  target: 'http://192.168.1.80:5053', 
  changeOrigin: true 
}));



app.use(bodyParser.json({ limit: '100mb' }));



app.post('/fetchData', (req: Request, res: Response) => {
  const url = `/api/Track/${req.body.trackId}`;
  console.log('Fetching data from:', url)
  const apiKey = '2555cad4-34a6-427a-a2e8-965f848f69fc';
  axios({
    method: 'get',
    url: url,
    baseURL: 'http://localhost:3001', // Use the local server as the base URL
    headers: {'Authorization': apiKey}
  }).then(response => {
    console.log(response.headers);
    res.json(response.data);
  }).catch(error => {
    console.error('Error in /fetchData:', error);
    if (error.response) {
      res.status(error.response.status).json({ error: error.response.data });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  });
});


app.post('/fetchResult', async (req: Request, res: Response) => {
  const resultUrl = req.body.url;
  try {
    const response = await axios.get(resultUrl, { responseType: 'blob' });
    res.send(response.data);
  } catch (error) {
    console.error('Error in /fetchResult:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
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
    if (response.data && response.data.$values) {
      // Filter out reference objects and get track IDs
      const trackIds = response.data.$values
        .filter((track: any) => !track.$ref)
        .map((track: any) => track.trackID);
      console.log('trackIds:', trackIds);
  
    // Simulate a 'track liked' event every 5 seconds
    setInterval(async () => {
      const trackId = trackIds[Math.floor(Math.random() * trackIds.length)]; // Select a random track ID from the array
      const likesCountResponse = await axios.get(`http://192.168.1.80:5053/api/Likes/${trackId}/likescount`);
      const likesCount = likesCountResponse.data;
  
      // Fetch comments for the track
      const commentsResponse = await axios.get(`http://192.168.1.80:5053/api/Comments/track/${trackId}/comments`);
      const comments = commentsResponse.data.$values;
  
      // Fetch commentLikes for the comments and replies
      let commentslikesCount: { [key: string]: any } = {}; // Change index signature to string
      try {
        const response = await axios.get(`http://192.168.1.80:5053/api/CommentLikes/track/${trackId}/likescount`);
        commentslikesCount = response.data;
        delete commentslikesCount['$id']; // Ignore $id property
  
        // Log likes count for each comment
        for (const commentId in commentslikesCount) {
          if (commentslikesCount.hasOwnProperty(commentId)) {
         //   console.log(`Likes count for comment ${commentId} in track ${trackId}:`, commentslikesCount[commentId]);
          }
        }
      } catch (error) {
        console.error('Error fetching likes count:', error);
      }

const message = JSON.stringify({
  trackId: trackId,
  likesCount: likesCount,
  comments: comments, 
  commentslikesCount: commentslikesCount // Include comments in the WebSocket message
});

ws.send(message);
    }, 5000);
  }
  });

  

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});