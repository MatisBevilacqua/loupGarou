const express = require('express');
const app = express();
let expressWs = require('express-ws')(app);
const port = 3000;
const storageUser = {}
const storageAllUser = []
const cupidon = []
const die = []
let token;
let r;
let userTurn = 0;
const roles = [ 'Villageois', 'Loup Garou', 'Sorciere', 'Cupidon', 'Loup Garou', 'Loup Garou']

function send(ws, event, data) {
    ws.send(JSON.stringify({ event, data }));
}

app.use('/static', express.static('../client/assets/'));

app.get('/', (req, res) => {
    res.sendFile('index.html', { root: '../client' });
})

const shuffle = (array) => {
    array.sort(() => Math.random() - 0.5);
}

const getRandomNumber = (max) => {
    return Math.floor(Math.random() * max);
}
const postUserStorage = (token, ws) => {
    storageUser[token] = { connection: ws, message: []}
}

const userTurnAccrement = () => {
    userTurn += 1;
    console.log(userTurn)
    for(const e in storageUser){
        if(storageUser[e].turn === userTurn){
            if(userTurn === 1){
                const arrPlayerCupidon =  Object.values(storageUser)
                const arrPlayerResultCupidon = arrPlayerCupidon.filter(arr => arr.turn !== userTurn)
                console.log(arrPlayerResultCupidon);
                send(storageUser[e].connection, "yourTurnCupidon",  { arrPlayerResultCupidon })
            }else if( userTurn === 2){
                const arrPlayerLoup =  Object.values(storageUser)
                const arrPlayerResultLoup = arrPlayerLoup.filter(arr => arr.turn !== userTurn)
                console.log(arrPlayerResultLoup);
                send(storageUser[e].connection, "yourTurnLoup", { arrPlayerResultLoup })
            }else if( userTurn === 3){
                const arrPlayerSorciere =  Object.values(storageUser)
                const arrPlayerResultSorciere = arrPlayerSorciere.filter(arr => arr.turn !== userTurn)
                console.log(arrPlayerResultSorciere);
                send(storageUser[e].connection, "yourTurnSorciere", { arrPlayerResultSorciere })
            }
        }
    }
}

app.ws('/', function (ws, req) {
    storageAllUser.push(ws)
    token = Math.random().toString(36).substr(2);
    userLenght = storageAllUser.length;
    send(ws, "init", { token });
    postUserStorage(token, ws);
    ws.on('message', function (msg) {
        try {
            let { event, data } = JSON.parse(msg);
            switch(event){
                case "name":
                    storageUser[data.token].name = data.name;
                    const userReady = storageUser[data.token].connection
                    shuffle(roles)
                    r = getRandomNumber(roles.length)
                    storageUser[data.token].role = roles[r]
                    const role = storageUser[data.token].role
                    roles.splice(r, 1)

                    if(storageUser[data.token].role === "Cupidon"){
                        storageUser[data.token].turn = 1
                    }

                    else if(storageUser[data.token].role === "Loup Garou"){
                        storageUser[data.token].turn = 2
                    }

                    else if(storageUser[data.token].role === "Sorciere"){
                        storageUser[data.token].turn = 3
                    }

                    else if(storageUser[data.token].role === "Villageois"){
                        storageUser[data.token].turn = 4
                    }
                    console.log(storageAllUser.length);
                    let userLenght = storageAllUser.length;
                    for(const i of storageAllUser){
                        if(userLenght !== 7){
                            send(i, "numberUser", userLenght)
                        }
                    }
                    if(userLenght === 6){
                        userTurnAccrement();
                        for(let i = 1; i < 6; i++){
                            setTimeout( () => {
                                userTurnAccrement();
                            }, 15000 * i)
                        }
                    }
                    send(userReady, "ready", { role })
                    break;

                case "message":
                    storageUser[data.token].message.push(data.message)
                    const name = storageUser[data.token].name
                    const messageReadyNameAndMessage = { name: name, message: data.message}
                    for(const i of storageAllUser){
                        send(i, "messageReady", { messageReadyNameAndMessage } )
                    }
                    break;
            }
        } catch (error) {
            console.log(error);
        }
    })
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
