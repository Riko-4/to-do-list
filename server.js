const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const path = require("path");
const methodOverride = require("method-override");

dotenv.config();
const app = express();

app.use(express.static("public")); // Allows serving static files

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride("_method")); // Allows DELETE requests in forms

// Set EJS as View Engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views")); // Ensures correct views folder

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true, 
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

// Define Mongoose Schema & Model
const taskSchema = new mongoose.Schema({
  task: { type: String, required: true },
});

const Task = mongoose.model("Task", taskSchema);

// Route: Show All Tasks
app.get("/", async (req, res) => {
  try {
    const tasks = await Task.find(); // Fetch all tasks
    res.render("index", { tasks }); // Pass tasks to EJS
  } catch (err) {
    console.error("Error fetching tasks:", err);
    res.status(500).send("Error fetching tasks");
  }
});

// Route: Add a New Task
app.post("/add", async (req, res) => {
  try {
    await Task.create({ task: req.body.task }); // Add new task
    res.redirect("/"); // Redirect back to homepage
  } catch (err) {
    console.error("Error adding task:", err);
    res.status(500).send("Error adding task");
  }
});

// Route: Delete a Task
app.post("/delete/:id", async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id); // Delete task by ID
    res.redirect("/");
  } catch (err) {
    console.error("Error deleting task:", err);
    res.status(500).send("Error deleting task");
  }
});

// Start the Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
