const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Stripe = require("stripe");

const app = express();
const PORT = process.env.PORT || 5000;

// JWT secret key
const JWT_SECRET = process.env.JWT_SECRET || "my_secret_key";

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Atlas Connection
// const mongoURI =
//   "mongodb+srv://rajapakshalista41:pAfDjUKDCOxI3or3@cluster0.1rcni.mongodb.net/Hotel_DB?retryWrites=true&w=majority&appName=Cluster0";

// Stripe Initialization
const stripe = Stripe("sk_test_51Qcl5rGzX1rLyJV9nzPbMaMbPUYlZEf70G5jMJaDa4IOiq5lfKSmyEuKAodw5xUUnN60gCz7W1Mmu5g14JD3nMrN00iyXkDt0I"); // Replace with your Stripe secret key

if (process.env.NODE_ENV !== 'test') {
  mongoose
    .connect(process.env.MONGODB_URI || "mongodb+srv://rajapakshalista41:pAfDjUKDCOxI3or3@cluster0.1rcni.mongodb.net/Hotel_DB?retryWrites=true&w=majority&appName=Cluster0", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.log(err));
}

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  status: { type: Number, default: 1 },
});

const User = mongoose.model("User", userSchema);

// Message Schema
const messageSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

// Routes
app.get("/", (req, res) => {
  res.send("Welcome to the backend server!");
});

// Signup Route
app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: "Email already exists." });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({ name, email, password: hashedPassword, status: 1 });
  try {
    await newUser.save();
    res.status(201).json({ message: "User registered successfully." });
  } catch (err) {
    res.status(500).json({ message: "Error registering user." });
  }
});

// Login Route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, error: "Invalid email." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ success: false, error: "Invalid password." });
    }

    if (user.status === 2) {
      return res.status(403).json({
        success: false,
        error: "Your account has been deactivated by the admin."
      });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "1h" });

    // Respond with token and user details
    res.json({
      success: true,
      message: "Login successful!",
      token,
      user: {
        userId: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "An error occurred during login." });
  }
});

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Access denied. Token missing." });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token." });
    }
    req.user = user;
    next();
  });
};




// contact us msg backend

// Contact Us Route (Without Authentication)
app.post("/contact-us", async (req, res) => {
  const { email, message, name, userId } = req.body;

  if (!email || !message || !name) {
    return res.status(400).json({ error: "All fields are required." });
  }

  if (!userId) {
    return res.status(400).json({ error: "User is not logged in." });
  }

  try {
    // Create the message and optionally associate it with a user
    const newMessage = new Message({
      userId, // If userId exists, associate it
      name,
      email,
      message,
    });

    await newMessage.save();
    res.status(200).json({ success: true, message: "Your message has been sent!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred while saving the message." });
  }
});

// Get messages sent by the logged-in user
app.get("/messages", authenticateToken, async (req, res) => {
  try {
    const messages = await Message.find({ userId: req.user.userId }).exec();

    if (!messages || messages.length === 0) {
      return res.status(404).json({ success: false, message: "No messages found." });
    }

    res.json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ success: false, message: "An error occurred while fetching messages." });
  }
});



// user profile update

app.put("/update-profile", authenticateToken, async (req, res) => {
  const userId = req.user.userId; // Retrieved from token by the authenticateToken middleware
  const { name, email } = req.body;

  // Validate input
  if (!name || !email) {
    return res.status(400).json({ message: "Name and email are required." });
  }

  try {
    // Find the user and update their details
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    user.name = name;
    user.email = email;

    await user.save();

    res.status(200).json({
      message: "Profile updated successfully.",
      user: { name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "An error occurred while updating the profile." });
  }
});

// Start Room Management
// Set up storage for images using multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Directory to save uploaded images
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({ storage });

const roomSchema = new mongoose.Schema({
  room_id: String,
  room_name: String,
  capacity: Number,
  price: Number,
  size: Number,
  room_type: String,
  pets: Boolean,
  breakfast: Boolean,
  description: String,
  extras: [String],
  images: [String],
  status: { type: Number, default: 1 }, // 1: Active, 3: Removed
});

const Room = mongoose.model('Room', roomSchema);

// Add Room Route with image upload
app.post('/api/rooms', upload.array('images', 10), async (req, res) => {
  const { room_id, room_name, capacity, price, size, room_type, pets, breakfast, description, extras } = req.body;
  const images = req.files ? req.files.map(file => file.path) : [];

  try {
    const room = new Room({
      room_id,
      room_name,
      capacity: parseInt(capacity),
      price: parseFloat(price),
      size: parseInt(size),
      room_type,
      pets: pets === 'true',
      breakfast: breakfast === 'true',
      description,
      extras: extras ? extras.split(',') : [],
      images,
    });
    await room.save();
    res.json(room);
  } catch (err) {
    res.status(500).json({ message: 'Error saving room', error: err });
  }
});

//Update Room
app.put('/api/rooms/:id', upload.array('images', 10), async (req, res) => {
  const { id } = req.params;
  const { room_id, room_name, capacity, price, size, room_type, pets, breakfast, description, extras } = req.body;
  const images = req.files ? req.files.map(file => file.path) : [];

  try {
    const updatedRoom = await Room.findByIdAndUpdate(id, {
      room_id,
      room_name,
      capacity: parseInt(capacity),
      price: parseFloat(price),
      size: parseInt(size),
      room_type,
      pets: pets === 'true',
      breakfast: breakfast === 'true',
      description,
      extras: extras ? extras.split(',') : [],
      images: [...images],
    }, { new: true });

    res.json(updatedRoom);
  } catch (err) {
    res.status(500).json({ message: 'Error updating room', error: err });
  }
});

// Fetch All Rooms Route (Only status = 1)
app.get("/api/rooms", async (req, res) => {
  try {
    const rooms = await Room.find({ status: 1 }); // Only fetch rooms with status = 1
    res.status(200).json(rooms);
  } catch (err) {
    res.status(500).json({ error: "Error fetching rooms." });
  }
});

// Remove a room (Update status to 3)
app.post('/api/update-room-status', (req, res) => {
  const { id, status } = req.body;

  if (!id || status === undefined) {
    return res.status(400).json({ error: 'Room id and status are required.' });
  }

  let currentData;
  try {
    currentData = require(dataFilePath);
  } catch (error) {
    console.error('Error loading details.js:', error);
    return res.status(500).json({ error: 'Failed to load data.js file' });
  }

  const roomIndex = currentData.findIndex((room) => room.sys.id === id);

  if (roomIndex === -1) {
    return res.status(404).json({ error: 'Room not found.' });
  }

  currentData[roomIndex].fields.status = status;
  console.log(`Updated status of room with id: ${id} to status: ${status}`);

  try {
    fs.writeFileSync(dataFilePath, `module.exports = ${JSON.stringify(currentData, null, 2)};`, 'utf8');
    console.log('Room status updated successfully');
    res.status(200).json({ message: 'Room status updated successfully' });
  } catch (error) {
    console.error('Error writing to details.js file:', error);
    return res.status(500).json({ error: 'Failed to write to details.js file' });
  }
});

// Serve static files from uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
const dataFilePath = path.join(__dirname, 'details.js');

// API endpoint to update the data.js file
app.post('/api/update-local-data', (req, res) => {
  const newRoomData = req.body;

  if (!newRoomData.sys || !newRoomData.fields) {
    return res.status(400).json({ error: 'Invalid room data format' });
  }

  newRoomData.fields.images = newRoomData.fields.images.map((img) => {
    const imageUrl = img.fields.file.url;
    const imageName = path.basename(imageUrl).replace(/^\d+_/, "");
    return { fields: { file: { url: imageName } } };
  });

  console.log('Received new room data:', newRoomData);

  // Step 1: Load current data
  let currentData;
  try {
    currentData = require(dataFilePath);
  } catch (error) {
    console.error('Error loading details.js:', error);
    return res.status(500).json({ error: 'Failed to parse data.js file' });
  }

  // Step 2: Check if room with the same id exists
  const existingRoomIndex = currentData.findIndex(
    (room) => room.sys.id === newRoomData.sys.id
  );

  if (existingRoomIndex !== -1) {
    // Overwrite existing room data
    currentData[existingRoomIndex] = newRoomData;
    console.log(`Updated room with id: ${newRoomData.sys.id}`);
  } else {
    // Append new room data if id does not exist
    currentData.push(newRoomData);
    console.log(`Added new room with id: ${newRoomData.sys.id}`);
  }

  // Step 3: Write back to the file
  try {
    fs.writeFileSync(dataFilePath, `module.exports = ${JSON.stringify(currentData, null, 2)};`, 'utf8');
    console.log('Data updated successfully');
    res.status(200).json({ message: 'Data updated successfully' });
  } catch (error) {
    console.error('Error writing to data.js file:', error);
    return res.status(500).json({ error: 'Failed to write to data.js file' });
  }
});


// API endpoint to fetch the whole data.js
app.get('/api/get-room-data', (req, res) => {
  fs.readFile(dataFilePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to read data.js file' });
    }

    res.status(200).json(JSON.parse(data)); // Send the data to the frontend
  });
});

// Serve the details.js file when requested
app.get('/api/details', (req, res) => {
  try {
    // Load the array from details.js
    const rooms = require('./details');
    res.json(rooms); // Send the array as a JSON response
  } catch (error) {
    console.error('Error loading room details:', error);
    res.status(500).send('Error loading room details');
  }
});
//End Room Management

// Start Guest Management
// Fetch all users
app.get("/api/guestManagement", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users." });
  }
});

// Update user details and status
app.put("/api/guestManagement/:id", async (req, res) => {
  const { name, email, status } = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, status },
      { new: true }
    );
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: "Error updating user." });
  }
});
// End Guest Management


// Step 1: Define the Booking Schema
const bookingSchema = new mongoose.Schema({
  guestName: String,
  userId: String,
  bookingId: String,
  roomName: String,
  price: Number,
  guests: Number,
  checkIn: Date,
  checkOut: Date,
  status: { type: Number, default: 1 }, // Default value for status
});

const Booking = mongoose.model('Booking', bookingSchema);

// Step 2: Create the Booking Route
// POST /api/bookings - To create a new booking
app.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount } = req.body; // Amount in cents

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
    });

    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

// Booking creation endpoint
app.post('/api/bookings', async (req, res) => {
  try {
    const bookingDetails = req.body;
    
    if (!bookingDetails.guestName || !bookingDetails.roomName || !bookingDetails.price) {
      return res.status(400).json({ message: "Missing booking details" });
    }

    // Create new booking in the database
    const booking = new Booking(bookingDetails);
    await booking.save();

    res.status(201).json({ message: "Booking saved successfully", booking });
  } catch (error) {
    console.error("Error saving booking:", error);
    res.status(500).json({ message: "Error saving booking", error: error.message });
  }
});
// Backend - Express login route (server.js)



  // Fetch only active bookings (status: 1)
app.get('/api/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find({ status: 1 }); // Fetch bookings with status: 1
    res.status(200).json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
});


  // Update Booking Details (PUT)
  app.put('/api/bookings/:id', async (req, res) => {
  try {
    const bookingId = req.params.id;
    const updatedBooking = req.body;

    const booking = await Booking.findOneAndUpdate(
      { bookingId },
      updatedBooking,
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json({ message: 'Booking updated successfully', booking });
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ message: 'Error updating booking', error: error.message });
  }
  });

  // Delete Booking (soft delete)
  app.delete('/api/bookings/:id', async (req, res) => {
  try {
    const bookingId = req.params.id;
    const booking = await Booking.findOneAndUpdate(
      { bookingId },
      { status: 3 },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({ message: 'Error deleting booking', error: error.message });
  }
  });



  

// Fetch all messages
app.get("/api/messages", async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 }).exec();
    res.status(200).json({ success: true, messages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred while fetching messages." });
  }
});

// Edit a message by ID
app.put("/api/messages/:id", async (req, res) => {
  const { id } = req.params;
  const { message } = req.body; // The updated message content from the request body

  try {
    const updatedMessage = await Message.findByIdAndUpdate(
      id,
      { message }, // Only update the message field
      { new: true } // Return the updated document
    );

    if (!updatedMessage) {
      return res.status(404).json({ error: "Message not found." });
    }

    res.status(200).json({ success: true, message: updatedMessage });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred while updating the message." });
  }
});

// Delete a message by ID
app.delete("/api/messages/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const deletedMessage = await Message.findByIdAndDelete(id);

    if (!deletedMessage) {
      return res.status(404).json({ error: "Message not found." });
    }

    res.status(200).json({ success: true, message: "Message deleted successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred while deleting the message." });
  }
});


if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;  // Export for testing

