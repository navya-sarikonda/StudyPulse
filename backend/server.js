
if (process.env.NODE_ENV !== "production") {
  try {
    const dns = require("dns");
    dns.setServers(["8.8.8.8", "8.8.4.4"]);
  } catch (e) {
    // Ignore DNS setServers error in restricted hosting environments
  }
}

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "studypulse_secure_login_2026_navya_8392";
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://241fa04a83_db_user:NavyaGowtham17@cluster0.h8zmijn.mongodb.net/studypulse?retryWrites=true&w=majority";

const app = express();

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

// HEALTH CHECK
app.get("/health", (req, res) => {
  const states = ["disconnected", "connected", "connecting", "disconnecting"];
  res.json({
    status: "ok",
    mongoConnected: mongoose.connection.readyState === 1,
    mongoState: states[mongoose.connection.readyState] || "unknown",
    hasMongoUri: Boolean(process.env.MONGO_URI),
    timestamp: new Date().toISOString()
  });
});

// USER MODEL
const User = mongoose.model(
  "User",
  new mongoose.Schema({
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true
    }
  })
);

// TASK MODEL
const Task = mongoose.model(
  "Task",
  new mongoose.Schema({
    title: {
      type: String,
      required: true
    },
    subject: String,
    deadline: {
      type: Date,
      required: true
    },
    completed: {
      type: Boolean,
      default: false
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  })
);

// HOME
app.get("/", (req, res) => {
  res.send("StudyPulse Backend is Running!");
});

// SIGNUP
app.post("/api/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Please fill all fields"
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters"
      });
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase()
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already registered"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword
    });

    res.status(201).json({
      message: "Account created successfully"
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

// LOGIN
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Enter email and password"
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase()
    });

    if (!user) {
      return res.status(400).json({
        message: "User not found"
      });
    }

    const validPassword = await bcrypt.compare(
      password,
      user.password
    );

    if (!validPassword) {
      return res.status(400).json({
        message: "Invalid password"
      });
    }

    const token = jwt.sign(
      { id: user._id },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      name: user.name
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

// AUTHENTICATION MIDDLEWARE
const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Please login first"
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      JWT_SECRET
    );

    req.user = decoded;

    next();

  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token"
    });
  }
};

// GET USER'S TASKS
app.get("/api/tasks", verifyToken, async (req, res) => {
  try {
    const tasks = await Task.find({
      userId: req.user.id
    }).sort({ deadline: 1 });

    res.json(tasks);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

// ADD TASK
app.post("/api/tasks", verifyToken, async (req, res) => {
  try {
    const { title, subject, deadline } = req.body;

    if (!title || !deadline) {
      return res.status(400).json({
        message: "Task name and deadline are required"
      });
    }

    // CHECK VALID DATE
    const deadlineDate = new Date(`${deadline}T00:00:00`);

    if (isNaN(deadlineDate.getTime())) {
      return res.status(400).json({
        message: "Invalid Date! Please enter a valid deadline."
      });
    }

    // GET TODAY'S DATE IN INDIA
    const today = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).format(new Date());

    // PREVENT PAST DEADLINES
    if (deadline < today) {
      return res.status(400).json({
        message: "Invalid Date! Past deadlines are not allowed."
      });
    }

    const task = await Task.create({
      title,
      subject,
      deadline: deadlineDate,
      completed: false,
      userId: req.user.id
    });

    res.status(201).json(task);

  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
});

// COMPLETE TASK
app.patch("/api/tasks/:id", verifyToken, async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user.id
      },
      {
        completed: req.body.completed
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!task) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    res.json(task);

  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
});

// DELETE TASK
app.delete("/api/tasks/:id", verifyToken, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!task) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    res.json({
      message: "Task deleted successfully"
    });

  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
});

// DATABASE CONNECTION & SERVER START
const PORT = process.env.PORT || 5000;

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected Successfully!");
  })
  .catch(error => {
    console.error("MongoDB Connection Error:", error);
  });

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
