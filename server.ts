const express = require('express');
const path = require('path');
const app = express();

app.use((req: any, res: any, next: any) => {
//  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  next();
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'build')));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
