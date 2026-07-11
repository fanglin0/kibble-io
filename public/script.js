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

const canvas = document.getElementById("canvas");

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
  const wordDash = document.getElementById("wordDash");

  if (wordDash) {
    wordDash.textContent =
      "_ ".repeat(word.length);
  }

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
}