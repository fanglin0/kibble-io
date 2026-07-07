// for index.html
const arrows = document.querySelectorAll('.arrow');
const playable = document.getElementById('playable');
// choose between avaters, maybe upgrade this to be any draiwng of dog from quickdraw api
arrows.forEach(arrow => {
    arrow.addEventListener('click', () => {
        if (arrow.classList.contains('right-arrow')) {
            playable.src = 'assets/dog2.jpg';
        } else if (arrow.classList.contains('left-arrow')) {
            playable.src = 'assets/dog1.jpg';
        }
    });
});
// modal pop up when hovering over dice
const dice = document.getElementById('dice');
const modal = document.getElementById('hoverModal');

dice.addEventListener('mouseenter', () => {
    modal.style.display = 'block';
})

dice.addEventListener('mouseleave', () => {
    modal.style.display = 'none';
})

// for game.html
const word = "elephant";//try random word request
let wordLength = word.length;
let wordDash = "_".repeat(wordLength);
document.getElementById("wordDash").textContent = wordDash;


// drawing area
const canvas = documentgetElementById('drawing-board');
const drawTools = document.getElementById('drawTools');
const ctx = canvas.getContext('2d');

const canvasOffsetX = canvas.offsetLeft;
const canvasOffsetY = window.innerHeight - canvasOffsetY;

let isPainting = false;
let lineWidth = 5;
letStartX;
let StartU;

drawTools.addEventListener('click', e=> {
    if (e.target == 'clear') {
        ctx.clearRect(0,0, canvas.width, canvas.height);
    }
});

drawTools.addEventListener('change', e => {
    if(e.target.id === 'stroke') {
        ctx.strokeStyle = e.target.value;
    }
    if (e.target.id === 'lineWidth') {
        lineWidth = e.target.value;
    }
});

const draw = (e) => {
    if (!isPainting ) {
        return;
    }

    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';

    ctx.lineTo(e.clientX - canvasOffsetX, e.clientY);
    ctx.stroke();
}
canvas.addEventListener('mousedown', (e)=> {
    isPainting = true;
    startX = e.clientX;
    startY = e.clientY; 
});
canvas.addEventListener('mouseup', e=> {
    isPainting = false;
    ctx.stroke();
    ctx.beginPath();
});
canvas.addEventListener('mousemove', draw);

