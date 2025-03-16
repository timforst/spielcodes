let globalTeam = -1
let dataList = null;
let showingOld = false;
let listOfPins = [];
let listOfCodes = [];
let listOfNames = [];

function getQueryParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
  }

  document.addEventListener("DOMContentLoaded", () => {
    let team = parseInt(getQueryParam("team"));
    team = isNaN(team) ? -1 : team;
    globalTeam = team;
    if (localStorage.getItem('listOfPins')) {
        listOfPins = JSON.parse(localStorage.getItem('listOfPins'));
        listOfCodes = JSON.parse(localStorage.getItem('listOfCodes'));
        listOfNames = JSON.parse(localStorage.getItem('listOfNames'));
        generateButtons(globalTeam, showOld = false)
    }
  });

function loadData(scriptName, callback) {
    const script = document.createElement("script");
    script.src = scriptName;  
    script.onload = function () {
        console.log("Script loaded!");
        dataList = data;
        if (typeof callback === "function") {
            callback(dataList); 
        }
    };
    document.body.appendChild(script);
}

function addCodeButton(buttonsContainer, gegner, date, link = null, heimspiel = false) {
    const button = document.createElement("button");
    let baseUrl = "https://ttde-apps.liga.nu/nuliga/nuscore-tt/meetings-list?gamecode=";
    buttonText = `${gegner}<br>${date}`
    button.innerHTML = buttonText;
    if (heimspiel == true){
        button.style.backgroundColor = "#50b36d";
    }
    if (link) {
        button.onclick = function() {
            openLink(`${baseUrl}${link}`);
        };
    } else {
        button.onclick = function() {
            copyText("Auswärtsspiel");
        };
    }
    buttonsContainer.appendChild(button);
}

function addPinButton(buttonsContainer, text, heimspiel = false) {
    const button = document.createElement("button");
    let baseUrl = "https://ttde-apps.liga.nu/nuliga/nuscore-tt/meetings-list?gamecode=";
    button.innerHTML = text;
    if (heimspiel == true){
        button.style.backgroundColor = "#50b36d";
    }
    button.onclick = function() {
        copyText(text);
    };
    buttonsContainer.appendChild(button);
}

function notPastDate(dateString) {
    const [day, month, year] = dateString.split('.');
    const date = new Date(year, month - 1, day); 
    const currentDate = new Date();
    currentDate.setHours(currentDate.getHours() - 24);
    return date >= currentDate; 
}

function showPastGames(team) {
    const showOldButton = document.getElementById('show-old-button');
    if (showingOld) {
        generateButtons(globalTeam, showOld = false);
        showOldButton.textContent = 'Alle';
        showingOld = false;
    } else {
        generateButtons(globalTeam, showOld = true);
        showOldButton.textContent = 'Aktuell';
        showingOld = true;
    }
}



function generateButtons(team, showOld = false) {
    console.log(team);
    name = listOfNames[team];
    console.log(name);
    pins = listOfPins[team];
    // console.log(listOfPins);
    codes = listOfCodes[team];
    const headline = document.getElementById('headline');
    headline.textContent = name;
    document.getElementById('back-button').style.display = 'block';
    document.getElementById('show-old-button').style.display = 'block';
    const newButtonsContainer = document.getElementById('new-buttons');
    newButtonsContainer.innerHTML = "";
    newButtonsContainer.style.display = 'grid';
    newButtonsContainer.style.gridTemplateColumns = 'repeat(2, 1fr)';
    newButtonsContainer.style.gap = '10px';

    let j = 0;
    if (showOld) {
        for(let i = 0; i < pins[3].length; i++) {
            if (pins[3][i]) {
                addCodeButton(newButtonsContainer, pins[2][i], pins[0][i], codes[0][j], heimspiel = true);
                addPinButton(newButtonsContainer, pins[1][i], heimspiel = true);
                j += 1;
            } else {
                addCodeButton(newButtonsContainer, pins[2][i], pins[0][i], heimspiel = false);
                addPinButton(newButtonsContainer, pins[1][i], heimspiel = false);
            }
        }
    } else {
        let k = 0;
        for(let i = 0; i < pins[3].length; i++) {
            if (notPastDate(pins[0][i]) && k < 10) {
                k +=1;
                if (pins[3][i]) {
                    addCodeButton(newButtonsContainer, pins[2][i], pins[0][i], codes[0][j], heimspiel = true);
                    addPinButton(newButtonsContainer, pins[1][i], heimspiel = true);
                    j += 1;
                } else {
                    addCodeButton(newButtonsContainer, pins[2][i], pins[0][i], heimspiel = false);
                    addPinButton(newButtonsContainer, pins[1][i], heimspiel = false);
                }
            }
        }
    }
}

function openLink(url) {
   window.open(url, '_blank'); 
}
function copyText(text) {
    navigator.clipboard.writeText(text).catch(err => {
        console.error('Error copying text:', err);
    });
}

