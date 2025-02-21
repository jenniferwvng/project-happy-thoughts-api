import express from "express";
import cors from "cors";
import mongoose from "mongoose";

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/project-mongo";
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = Promise;

// Defines the port the app will run on. Defaults to 8080, but can be overridden
// when starting the server. Example command to overwrite PORT env variable value:
// PORT=9000 npm start
const port = process.env.PORT || 8080;
const app = express();

// Add middlewares to enable cors and json body parsing
app.use(cors());
app.use(express.json());

const { Schema } = mongoose;

const thoughtSchema = new Schema({
  message: {
    type: String,
    required: true,
    minLength: 5,
    maxLength: 140
  },
  hearts: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: () => Date.now()
  }
});

const Thought = mongoose.model('Thought', thoughtSchema);

// Start defining your routes here
app.get("/", (req, res) => {
  res.send("[GET]: /thoughts [POST]: /thoughts [POST]: /thoughts/:thoughtId/like");
});

app.get("/thoughts",  async (req, res) => {
  const addedThoughts = await Thought.find().sort({createdAt: 'desc'}).limit(20).exec();
  res.status(200).json(addedThoughts);
});

app.post("/thoughts", async (req, res) => {
  const { message } = req.body;
  
  const newThought = new Thought({ message });

  try {
    const savedThought = await newThought.save();
    res.status(201).json(savedThought);
  } catch(err) {
    res.status(400).json({message: 'Could not save to database', error: err.errors});
  }
})

app.post("/thoughts/:thoughtId/like", async (req, res) => {
  const { thoughtId } = req.params;

  try {
    const thoughtById = await Thought.findByIdAndUpdate(thoughtId, {$inc: {hearts: 1}}, {new: true});
    res.status(200).json(thoughtById);
  } catch(err) {
    res.status(400).json({
      success: false,
      error: 'Id not found'
    })
  }
})

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
