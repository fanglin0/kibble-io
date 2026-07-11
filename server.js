const express = require("express");
const http = require("http");
const {Server} = require("socket.io");
const axios = require("axios");
const cors = require("cors");
const {spawn} = require("child_process");

const app = express();

app.use(cors());
app.use(express.static("public"));

const server = http.createServer(app);

const io = new Server(server)

async function getWord(){
    const response = await axios.get(
        "https://api.api-ninjas.com/v2/randomword",
        {
            headers:{
                "X-Api-Key":
                "jCKqq8AZmRTaocR3IXQEBtLnPtOe30GtBUw1uDfo"
            }
        }
    );
    return response.data.word;
}

io.on("connection", (socket)=> {
    console.log("player connected");
    socket.on("startGame", async()=>{
        currentWord = await getWord();
        console.log("word:",currentWord);

        socket.emit(
            "word",
            currentWord
        );
    });
    
    socket.on("drawing",(drawing)=>{
        socket.broadcast.emit(
            "drawing",
            drawing
        );
        const python = 
        spawn(
            "python",
            [
                "predictor.py",
                JSON.stringify(drawing)
            ]
        );
        python.stdout.on(
            "data",
            (result)=>{
                socket.emit(
                    "prediction",
                    result.toString()
                );
            }
        );
    });
});

server.listen(
    3001,
    ()=>{
        console.log(
            "server running http://localhost:3000"
        );
    });
