const express = require('express');
const app = express();
let expressWs = require('express-ws')(app);
const port = 3000;
const storageUser = {}
const storageAllUser = []
const cupidon = []
const die = []
let token;
let arrStorageUserNotTurn;
let sendNotPlayerTurn;
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

const getTokenRole = (data) => {
    if(storageUser[data.token].role === 'Loup Garou'){
        die.push(data.name)
        console.log(storageUser[data.token]);
        console.log(die);
    }else if(storageUser[data.token].role === 'Cupidon'){
        cupidon.push(data.name)
        console.log(cupidon);
    }
}
const userTurnAccrement = () => {
    userTurn += 1;
    console.log(userTurn)
    for(const e in storageUser){
        if(storageUser[e].turn === userTurn){
            if(userTurn === 1){
                const arrPlayerCupidon =  Object.values(storageUser)
                const arrPlayerResultCupidon = arrPlayerCupidon.filter(arr => arr.turn !== userTurn)
                cupidonAllPlayers = []
                for(const l in arrPlayerResultCupidon){
                    cupidonAllPlayers.push(arrPlayerResultCupidon[l].name)
                }
                arrStorageUserNotTurn = Object.values(storageUser)
                sendNotPlayerTurn = arrStorageUserNotTurn.filter(x => x.connection !== storageUser[e].connection )
                for(const j in sendNotPlayerTurn){
                    send(sendNotPlayerTurn[j].connection, "notTurn")
                }
                console.log(cupidonAllPlayers);
                send(storageUser[e].connection, "yourTurnCupidon", cupidonAllPlayers)
            }else if( userTurn === 2){
                const arrPlayerLoup =  Object.values(storageUser)
                const arrPlayerResultLoup = arrPlayerLoup.filter(arr => arr.turn !== userTurn)
                const loupAllPlayers = []
                for(const e in arrPlayerResultLoup){
                    loupAllPlayers.push(arrPlayerResultLoup[e].name)
                }
                arrStorageUserNotTurn = Object.values(storageUser)
                sendNotPlayerTurn = arrStorageUserNotTurn.filter(x => x.connection !== storageUser[e].connection )
                for(const g in sendNotPlayerTurn){
                    send(sendNotPlayerTurn[g].connection, "notTurn")
                }
                console.log(loupAllPlayers);
                send(storageUser[e].connection, "yourTurnLoup", loupAllPlayers)
            }else if( userTurn === 3){
                arrStorageUserNotTurn = Object.values(storageUser)
                sendNotPlayerTurn = arrStorageUserNotTurn.filter(x => x.connection !== storageUser[e].connection )
                for(const j in sendNotPlayerTurn){
                    send(sendNotPlayerTurn[j].connection, "notTurn")
                }
                console.log(die)
                send(storageUser[e].connection, "yourTurnSorciere", die)
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
                    storageUser[data.token].life = true
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
                    // console.log(storageAllUser.length);
                    let userLenght = storageAllUser.length;
                    for(const i of storageAllUser){
                        if(userLenght !== 7){
                            send(i, "numberUser", userLenght)
                        }
                    }
                    if(userLenght === 6){
                        // userTurnAccrement();
                        for(let i = 1; i < 6; i++){
                            setTimeout( () => {
                                userTurnAccrement();
                            }, 15000 * i)
                        }
                    }
                    send(userReady, "ready", { role })
                    break       ;

                case "message":
                    storageUser[data.token].message.push(data.message)
                    const name = storageUser[data.token].name
                    const messageReadyNameAndMessage = { name: name, message: data.message}
                    for(const i of storageAllUser){
                        send(i, "messageReady", { messageReadyNameAndMessage } )
                    }
                    break;

                case "choiceCard":
                    getTokenRole(data)
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
