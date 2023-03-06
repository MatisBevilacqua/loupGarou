const buttonSubmitName = document.querySelector('#buttonSubmitName');
const inputWriteName = document.querySelector('#inputWriteName');
const inputWriteMessage = document.querySelector('#inputWriteMessage');
const buttonSubmitMessage = document.querySelector('#buttonSubmitMessage');
const containerSpawnOnGame = document.querySelector('#container');
const containerMessageSpawn = document.querySelector('#spawnMessage');
const msgSpawnContainer = document.querySelector('#msgSpawnContainer');
const msgSpawn = document.querySelector('#msgSpwan');
const roleTitle = document.querySelector('#roleTitle');
const notTurnContainer = document.querySelector('#notTurn');
const cardParent = document.querySelector('.card__container');
let arrChoice = [];
let ws = new WebSocket("ws://localhost:3000");

const send = (data) => {
    ws.send(JSON.stringify(data))
}

const sendMessageToServer = () => {
    const token = localStorage.getItem('token');
    const message = { token: token, message: inputWriteMessage.value }
    send({event:"message", data: message})
    inputWriteMessage.value = ''
}

buttonSubmitMessage.addEventListener('click', sendMessageToServer)

const sendNameToServer = () => {
    const token = localStorage.getItem('token');
    const nameUserWithToken = { token: token, name: inputWriteName.value}
    send({ event: "name", data: nameUserWithToken})
    inputWriteName.value = ''
}

buttonSubmitName.addEventListener('click', sendNameToServer)

const displayMessage = (data, name, message) => {
    let onMessage = document.createElement('div')
    let h1 = document.createElement('h1')
    let p = document.createElement('p')
    onMessage.className = 'onMessage'
    containerMessageSpawn.appendChild(onMessage)
    containerMessageSpawn.appendChild(b)
    h1.textContent = data.messageReadyNameAndMessage.name
    p.textContent = data.messageReadyNameAndMessage.message
    onMessage.appendChild(h1)
    onMessage.appendChild(p)
}

const validateChoice = (card__container, e) => {
    arrChoice.push(card__container[e].textContent)
}

const sendChoice = () => {
    let token = localStorage.getItem('token');
    const choice = { token:token, name: arrChoice}
    send({ event: "choiceCard", data: choice})
}

const clickCard = (data) => {
    // Creation des cartes
    let card;
    for(let i = 0; i < data.length; i++){
        card = document.createElement("div");
        card.className = "card";
        card.textContent = data[i]
        cardParent.appendChild(card);
    }
    // Clicker sur les cartes
    const card__container = document.querySelectorAll('.card')
    for(let e = 0; e < card__container.length; e++){
        card__container[e].addEventListener('click', () => {
            validateChoice(card__container, e)
        })
    }

    // Creation du bouton pour valider le choix
    let buttonValidate = document.createElement('button')
    buttonValidate.textContent = 'Valider'
    buttonValidate.className = 'validate'
    cardParent.appendChild(buttonValidate)
    buttonValidate.addEventListener('click', sendChoice)
}

ws.onmessage = function (msg) {
    try{
        let { event, data } = JSON.parse(msg.data)
        switch(event){
            case "init":
                localStorage.setItem("token", data.token)
                break;

            case "ready":
                // Une fois que le user à bien rentrer son nom le serveur renvoie ready, console.log(data);
                containerSpawnOnGame.style.display = "block"
                roleTitle.textContent = data.role
                break;

            case "messageReady":
                // Le client recois le message envoyer du chat ( passer par le serveur ), console.log(data);
                displayMessage(data)
                break;

            case "numberUser":
                //Afficher le nombre de user connecter console.log(data);
                msgSpawnContainer.style.display = data !== 6 ? "block" : "none"
                msgSpawn.textContent = data
                break;

            case "yourTurn":
                // C'est a tel carte de jouer, console.log("C'est ton tour")
                break;

            case "notTurn":
                notTurnContainer.style.display = "block"
                notTurnContainer.textContent = "Ce n'est pas ton tour"
            break;

            case "yourTurnCupidon":
                notTurnContainer.style.display = "none"
                msgSpawnContainer.style.display = "block"
                clickCard(data)
                break;

            case "yourTurnLoup":
                notTurnContainer.style.display = "none"
                msgSpawnContainer.style.display = "block"
                clickCard(data)
                break;

            case "yourTurnSorciere":
                notTurnContainer.style.display = "none"
                msgSpawnContainer.style.display = "block"
                clickCard(data)
                break;
        }
    }catch(error){
        console.log(error)
    }
}
