// const express = require("express");
// const socket = require("socket.io");
// const http = require("http");
// const path = require("path");
// const { Chess } = require("chess.js");
// const { title } = require("process");
// const { log } = require("console");

// const app = express();
// const server = http.createServer(app);
// const io = socket(server);

// const chess = new Chess();

// let players = {};
// let currentplayer = "w";

// app.set("view engine", "ejs");
// app.use(express.static(path.join((__dirname, "public"))));
// app.get("/", (req, res) => {
//   res.render("index", { title: "Chess Game" });
// });

// io.on("connection", function (uniquesocket) {
//   console.log("connected");

//   //assigning side
//   if (!players.white) {
//     players.white = uniquesocket.id;
//     uniquesocket.emit("playerrole", "w");
//   } else if (!players.black) {
//     players.black = uniquesocket.id;
//     uniquesocket.emit("playerrole", "b");
//   } else {
//     uniquesocket.emit("spectatorrole");
//   }

//   //deleting if one of the users are disconnected
//   uniquesocket.on("disconnect", function () {
//     if (uniquesocket.id === players.white) {
//       delete players.white;
//     } else if (uniquesocket.id === players.black) {
//       delete players.black;
//     }
//   });

//   //for verifying specific move if its moving in a right manner or not
//   uniquesocket.on("move", function (move) {
//     try {
//       if (chess.turn() === "w" && uniquesocket.id !== players.white) return;
//       if (chess.turn() === "b" && uniquesocket.id !== players.black) return;

//       const result = chess.move(move);
//       if (result) {
//         currentplayer = chess.turn();

//         io.emit("move", move);
//         //for current state of board
//         io.emit("boardstate", chess.fen());
//       } else {
//         console.log("Invalid move: ", move);
//         uniquesocket.emit("invalidmove", move);
//       }
//     } catch (err) {
//       console.log(err);
//       uniquesocket.emit("Invalid move: ", move);
//     }
//   });
// });

// server.listen(3000);
const express = require("express");
const socket = require("socket.io");
const http = require("http");
const path = require("path");
const { Chess } = require("chess.js");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = socket(server);

const chess = new Chess();

let players = {};
let currentplayer = "w";

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.render("index", { title: "Chess Game" });
});

io.on("connection", function (uniquesocket) {
  console.log("connected");

  // Assigning side
  if (!players.white) {
    players.white = uniquesocket.id;
    uniquesocket.emit("playerrole", "w");
  } else if (!players.black) {
    players.black = uniquesocket.id;
    uniquesocket.emit("playerrole", "b");
  } else {
    uniquesocket.emit("spectatorrole");
  }

  // Deleting if one of the users are disconnected
  uniquesocket.on("disconnect", function () {
    if (uniquesocket.id === players.white) {
      delete players.white;
    } else if (uniquesocket.id === players.black) {
      delete players.black;
    }
  });

  // Verifying specific move if it's moving in a right manner or not
  uniquesocket.on("move", function (move) {
    try {
      if (chess.turn() === "w" && uniquesocket.id !== players.white) return;
      if (chess.turn() === "b" && uniquesocket.id !== players.black) return;

      const result = chess.move(move);
      if (result) {
        currentplayer = chess.turn();

        io.emit("move", move);
        // For current state of board
        io.emit("boardstate", chess.fen());
      } else {
        console.log("Invalid move: ", move);
        uniquesocket.emit("invalidmove", move);
      }
    } catch (err) {
      console.log(err);
      uniquesocket.emit("Invalid move: ", move);
    }
  });
});

server.listen(3000, () => {
  console.log("Server is running on port 3000");
});
