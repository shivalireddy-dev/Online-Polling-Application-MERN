const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

/* ================= DB ================= */
mongoose.connect("mongodb://127.0.0.1:27017/pollDB")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

/* ================= MODELS ================= */
const UserSchema = new mongoose.Schema({
  email: String,
  password: String,
  voted: { type: Boolean, default: false }
});

const PollSchema = new mongoose.Schema({
  pollId: String,
  question: String,
  options: [
    { optionId: String, text: String, votes: Number }
  ]
});

const User = mongoose.model("User", UserSchema);
const Poll = mongoose.model("Poll", PollSchema);

/* ================= AUTH MIDDLEWARE ================= */
const auth = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: "No token" });

  try {
    const decoded = jwt.verify(token, "SECRET_KEY");
    req.userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};

/* ================= CREATE TEST USER ================= */
(async () => {
  const exists = await User.findOne({ email: "test@gmail.com" });
  if (!exists) {
    const hash = await bcrypt.hash("123456", 10);
    await User.create({ email: "test@gmail.com", password: hash });
    console.log("Test user created");
  }
})();

/* ================= CREATE POLL ================= */
(async () => {
  const poll = await Poll.findOne({ pollId: "poll-123" });
  if (!poll) {
    await Poll.create({
      pollId: "poll-123",
      question: "Which feature matters most in a polling app?",
      options: [
        { optionId: "a", text: "Real-time updates", votes: 0 },
        { optionId: "b", text: "Security", votes: 0 },
        { optionId: "c", text: "UI/UX", votes: 0 },
        { optionId: "d", text: "Scalability", votes: 0 }
      ]
    });
    console.log("Poll created");
  }
})();

/* ================= ROUTES ================= */

// LOGIN
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: "User not found" });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ error: "Wrong password" });

  const token = jwt.sign({ userId: user._id }, "SECRET_KEY");
  res.json({ token });
});

// GET POLL
app.get("/api/polls/:id", async (req, res) => {
  const poll = await Poll.findOne({ pollId: req.params.id });
  res.json(poll);
});

// RESULTS
app.get("/api/polls/:id/results", async (req, res) => {
  const poll = await Poll.findOne({ pollId: req.params.id });
  res.json({ counts: poll.options });
});

// VOTE (ONE USER → ONE VOTE)
app.post("/api/vote", auth, async (req, res) => {
  const { pollId, optionId } = req.body;
  const user = await User.findById(req.userId);
  if (user.voted) return res.json({ error: "Already voted" });

  const poll = await Poll.findOne({ pollId });
  const opt = poll.options.find(o => o.optionId === optionId);
  opt.votes++;

  await poll.save();
  user.voted = true;
  await user.save();

  res.json({ success: true });
});

/* ================= START ================= */
app.listen(4000, () =>
  console.log("Backend running at http://localhost:4000")
);
