// api.js
import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 4040;
const MONGO_URI = process.env.MONGO_URI;

// MongoDB client
let db;
const client = new MongoClient(MONGO_URI);

async function connectDB() {
  try {
    await client.connect();
    db = client.db("todoApp"); // use the correct DB name from your URI
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
}

// Routes

// Get user by user_id
app.get("/users/:userid", async (req, res) => {
  try {
    const user = await db.collection("users").findOne({ user_id: req.params.userid });
    if (!user) return res.status(404).send({ message: "User not found" });
    res.send(user);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Server error" });
  }
});

// Get all appointments for a user
app.get("/appointments/:userid", async (req, res) => {
  try {
    const appointments = await db.collection("appointments")
      .find({ user_id: req.params.userid })
      .toArray();
    res.send(appointments);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Server error" });
  }
});

// Get single appointment by appointment_id
app.get("/appointment/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const appointment = await db.collection("appointments")
      .findOne({ appointment_id: id });
    if (!appointment) return res.status(404).send({ message: "Appointment not found" });
    res.send(appointment);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Server error" });
  }
});

// Register a new user
app.post("/register-user", async (req, res) => {
  try {
    const user = {
      user_id: req.body.user_id,
      user_name: req.body.user_name,
      password: req.body.password, // optional: hash this before storing
      mobile: req.body.mobile
    };
    await db.collection("users").insertOne(user);
    console.log("User registered");
    res.send({ message: "User registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Error registering user" });
  }
});

// Add new appointment
app.post("/add-appointment", async (req, res) => {
  try {
    const appointment = {
      appointment_id: parseInt(req.body.appointment_id),
      title: req.body.title,
      description: req.body.description,
      date: new Date(req.body.date),
      user_id: req.body.user_id
    };
    await db.collection("appointments").insertOne(appointment);
    console.log("Appointment added");
    res.send({ message: "Appointment added successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Error adding appointment" });
  }
});

// Edit appointment
app.put("/edit-appointment/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updatedAppointment = {
      appointment_id: parseInt(req.body.appointment_id),
      title: req.body.title,
      description: req.body.description,
      date: new Date(req.body.date),
      user_id: req.body.user_id
    };
    const result = await db.collection("appointments").updateOne(
      { appointment_id: id },
      { $set: updatedAppointment }
    );
    if (result.matchedCount === 0) return res.status(404).send({ message: "Appointment not found" });
    console.log("Appointment updated");
    res.send({ message: "Appointment updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Error updating appointment" });
  }
});

// Delete appointment
app.delete("/delete-appointment/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await db.collection("appointments").deleteOne({ appointment_id: id });
    if (result.deletedCount === 0) return res.status(404).send({ message: "Appointment not found" });
    console.log("Appointment deleted");
    res.send({ message: "Appointment deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Error deleting appointment" });
  }
});

// Start server after DB connection
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server started on http://127.0.0.1:${PORT}`);
  });
});
