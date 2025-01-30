const express = require('express');
const mongoose = require('mongoose');
const app = express();

// Body parser middleware
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.send('Hello from Backend!');
});

// Database connection
mongoose.connect("mongodb+srv://rajapakshalista41:pAfDjUKDCOxI3or3@cluster0.1rcni.mongodb.net/Hotel_DB?retryWrites=true&w=majority&appName=Cluster0", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Database connected'))
  .catch((err) => console.log('Error connecting to database', err));

// Start the server
const port = 5000;
app.listen(port, () => {
  console.log(`Backend is running on http://localhost:${port}`);
});
