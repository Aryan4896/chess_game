const socket = io();
const chess = new Chess();
const boardelement = document.querySelector(".chessboard");

let draggedpiece = null;
let sourcesquare = null;
let playerrole = null;

const renderboard = () => {
  const board = chess.board();
  boardelement.innerHTML = "";
  board.forEach((row, rowindex) => {
    row.forEach((square, squareindex) => {
      const squareelement = document.createElement("div");
      squareelement.classList.add(
        "square",
        (rowindex + squareindex) % 2 === 0 ? "light" : "dark"
      );
      squareelement.dataset.row = rowindex;
      squareelement.dataset.col = squareindex;

      if (square) {
        const pieceelement = document.createElement("div");
        pieceelement.classList.add(
          "piece",
          square.color === "w" ? "white" : "black"
        );
        pieceelement.innerText = getpieceunicode(square);
        pieceelement.draggable = playerrole === square.color;
        pieceelement.addEventListener("dragstart", (e) => {
          if (pieceelement.draggable) {
            draggedpiece = pieceelement;
            sourcesquare = { row: rowindex, col: squareindex };
            e.dataTransfer.setData("text/plain", " ");
          }
        });
        pieceelement.addEventListener("dragend", (e) => {
          draggedpiece = null;
          sourcesquare = null;
        });

        squareelement.appendChild(pieceelement);
      }
      squareelement.addEventListener("dragover", function (e) {
        e.preventDefault();
      });
      squareelement.addEventListener("drop", function (e) {
        e.preventDefault();
        if (draggedpiece) {
          const targetsquare = {
            row: parseInt(squareelement.dataset.row),
            col: parseInt(squareelement.dataset.col),
          };
          handlemove(sourcesquare, targetsquare);
        }
      });
      boardelement.appendChild(squareelement);
    });
  });
  if (playerrole === "b") {
    boardelement.classList.add("flipped");
  } else {
    boardelement.classList.remove("flipped");
  }
};

const handlemove = (source, target) => {
  const move = {
    from: `${String.fromCharCode(97 + source.col)}${8 - source.row}`,
    to: `${String.fromCharCode(97 + target.col)}${8 - target.row}`,
    promotion: "q", //  promoting queen for simplicity
  };

  const legalmove = chess.move(move);
  if (legalmove) {
    socket.emit("move", move);
    renderboard();
  }
};

const getpieceunicode = (piece) => {
  const unicodepieces = {
    p: "♙",
    r: "♖",
    n: "♘",
    b: "♗",
    q: "♕",
    k: "♔",
    P: "♟",
    R: "♜",
    N: "♞",
    B: "♝",
    Q: "♛",
    K: "♚",
  };

  return unicodepieces[piece.type] || "";
};

socket.on("playerrole", function (role) {
  playerrole = role;
  renderboard();
});

socket.on("spectatorrole", function () {
  playerrole = null;
  renderboard();
});

socket.on("boardstate", function (fen) {
  chess.load(fen);
  renderboard();
});

socket.on("move", function (move) {
  chess.move(move);
  renderboard();
});

renderboard();
