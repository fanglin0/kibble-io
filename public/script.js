// =========================
// KIBBLE.IO
// Single file for:
// - index.html
// - game.html
// - multiplayer drawing (Socket.io)
// - placeholder AI guesses
// =========================

// -------------------------
// SOCKET.IO
// -------------------------

let socket = null;

if (typeof io !== "undefined") {
  socket = io();
}

// =========================
// INDEX.HTML
// =========================

const playable = document.getElementById("playable");
const leftArrow = document.querySelector(".left-arrow");
const rightArrow = document.querySelector(".right-arrow");

if (playable && leftArrow && rightArrow) {
  leftArrow.addEventListener("click", () => {
    playable.src = "assets/dog1.jpg";
  });

  rightArrow.addEventListener("click", () => {
    playable.src = "assets/dog2.jpg";
  });
}

// -------------------------
// Dice tooltip
// -------------------------

const dice = document.getElementById("dice");
const modal = document.getElementById("hoverModal");

if (dice && modal) {
  dice.addEventListener("mouseenter", () => {
    modal.style.display = "block";
  });

  dice.addEventListener("mouseleave", () => {
    modal.style.display = "none";
  });
}

// =========================
// GAME.HTML
// =========================

const canvas = document.getElementById("drawing-board");

if (canvas) {
  const ctx = canvas.getContext("2d");

  // -------------------------
  // Canvas setup
  // -------------------------

  canvas.width = 700;
  canvas.height = 500;

  ctx.lineCap = "round";
  ctx.strokeStyle = "#000000";

  let isPainting = false;
  let lineWidth = 5;

  // -------------------------
  // Word display
  // -------------------------

  const word = "elephant";
  const wordDash = document.getElementById("ai-guess");

  // if (wordDash) {
  //   wordDash.textContent =
  //     "_ ".repeat(word.length);
  // }

  // =========================
  // DRAWING
  // =========================

  function startPosition(e) {
    isPainting = true;

    ctx.beginPath();

    ctx.moveTo(
      e.offsetX,
      e.offsetY
    );

    // Tell others where our stroke begins
    if (socket) {
      socket.emit("start", {
        x: e.offsetX,
        y: e.offsetY
      });
    }
  }

  function endPosition() {
    isPainting = false;
    ctx.beginPath();

    if (socket) {
      socket.emit("end");
    }
  }

  function draw(e) {
    if (!isPainting) {
      return;
    }

    const point = {
      x: e.offsetX,
      y: e.offsetY,
      color: ctx.strokeStyle,
      width: lineWidth
    };

    ctx.lineWidth = lineWidth;

    ctx.lineTo(
      point.x,
      point.y
    );

    ctx.stroke();

    ctx.beginPath();

    ctx.moveTo(
      point.x,
      point.y
    );

    // Multiplayer
    if (socket) {
      socket.emit("draw", point);
    }
  }

  canvas.addEventListener(
    "mousedown",
    startPosition
  );

  canvas.addEventListener(
    "mouseup",
    endPosition
  );

  canvas.addEventListener(
    "mouseleave",
    endPosition
  );

  canvas.addEventListener(
    "mousemove",
    draw
  );

  // =========================
  // DRAW TOOLS
  // =========================

  const strokeInput =
    document.getElementById("stroke");

  if (strokeInput) {
    strokeInput.addEventListener(
      "change",
      (e) => {
        ctx.strokeStyle =
          e.target.value;
      }
    );
  }

  const lineWidthInput =
    document.getElementById("lineWidth");

  if (lineWidthInput) {
    lineWidthInput.addEventListener(
      "change",
      (e) => {
        lineWidth =
          Number(e.target.value);

        if (lineWidth < 1) {
          lineWidth = 1;
        }
      }
    );
  }

  const clearButton =
    document.getElementById("clear");

  if (clearButton) {
    clearButton.addEventListener(
      "click",
      () => {
        ctx.clearRect(
          0,
          0,
          canvas.width,
          canvas.height
        );

        if (socket) {
          socket.emit("clear");
        }
      }
    );
  }

  // =========================
  // MULTIPLAYER DRAWING
  // =========================

  if (socket) {
    socket.on("start", (point) => {
      ctx.beginPath();

      ctx.moveTo(
        point.x,
        point.y
      );
    });

    socket.on("draw", (point) => {
      ctx.strokeStyle =
        point.color;

      ctx.lineWidth =
        point.width;

      ctx.lineTo(
        point.x,
        point.y
      );

      ctx.stroke();

      ctx.beginPath();

      ctx.moveTo(
        point.x,
        point.y
      );
    });

    socket.on("end", () => {
      ctx.beginPath();
    });

    socket.on("clear", () => {
      ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
      );
    });
    socket.on(
      "drawing",
      (point)=> {
        ctx.lineTo(
          point.x,
          point.y
        );
        ctx.stroke();
      }
    );
    socket.on(
      "prediction",
      (data)=>{
        const aiGuessEl = document.getElementById("aiGuess");

        if (aiGuessEl) {
          const pct = Math.round((data.confidence || 0) * 100);
          aiGuessEl.textContent = `AI thinks: ${data.word} (${pct}%)`;
        }
      }
    )
  }

  // =========================
  // AI GUESS CAPTURE
  // =========================

  // Track whether anything has been drawn since the last clear, so we
  // don't spam the server (and spawn python processes) guessing a
  // blank canvas every 2 seconds before the user starts drawing.
  let hasDrawnSinceClear = false;

  canvas.addEventListener("mousedown", () => {
    hasDrawnSinceClear = true;
  });

  if (clearButton) {
    clearButton.addEventListener("click", () => {
      hasDrawnSinceClear = false;
    });
  }

  if (socket) {
    setInterval(() => {
      if (!hasDrawnSinceClear) {
        return;
      }

      const dataUrl = canvas.toDataURL("image/png");
      socket.emit("guess-request", dataUrl);
    }, 2000);
  }
}

  // =========================
  // PLACEHOLDER AI
  // =========================

const guesses = [
  "dog 🐶 (92%)",
  "cat 🐱 (81%)",
  "house 🏠 (78%)",
  "tree 🌳 (84%)",
  "car 🚗 (73%)",
  "elephant 🐘 (88%)",
  "pizza 🍕 (69%)",
  "fish 🐟 (76%)"
];

setInterval(() => {
  const randomGuess =
    guesses[
      Math.floor(
        Math.random() *
          guesses.length
      )
    ];

  if (wordDash) {
    wordDash.textContent =
      "AI thinks: " +
      randomGuess;
  }
}, 3000);



// const python = spawn(
//   "python",
//   [
//     "predictor.py",
//     JSON.stringify(image)
//   ]
// );

// python.stdout.on("data", (data)=> {
//   const prediction = JSON.parse(data);

//   socket.emit(
//     "prediction",
//     prediction
//   );
// });

let seconds = 80;

const timer =
document.getElementById("time");

setInterval(() => {

    if (seconds <= 0)
        return;

    seconds--;

    timer.textContent =
        seconds;

}, 1000);

let currentRound = 1;
let totalRounds = 3;

document.getElementById(
    "currentRound"
).textContent = currentRound;

document.getElementById(
    "totalRound"
).textContent = totalRounds;