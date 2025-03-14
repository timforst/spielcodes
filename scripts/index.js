let globalNameList = ["Herren", "Damen", "Jugend", "Bambini", "Senioren", "Seniorinnen"];
let globalNumberList = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV", ""];
let listOfPins = [];
let listOfCodes = [];
let listOfNames = [];
let listOfNumbers = [];
let password = "";

document.addEventListener('DOMContentLoaded', () => {
    loadInitialButtons();
    if (localStorage.getItem('listOfPins')) {
        listOfPins = JSON.parse(localStorage.getItem('listOfPins'));
        listOfCodes = JSON.parse(localStorage.getItem('listOfCodes'));
        listOfNames = JSON.parse(localStorage.getItem('listOfNames'));
        listOfNumbers = JSON.parse(localStorage.getItem('listOfNumbers'));
        loadInitialButtons();
    }
    if (localStorage.getItem('password')) {
        password = JSON.parse(localStorage.getItem('password'));
    }
});

function loadInitialButtons() {
    const container = document.getElementById("initial-buttons");
    for (let i = 0; i < listOfNames.length; i++) {
        const btn = document.createElement("button");
        btn.textContent = `${globalNameList[listOfNames[i]]} ${globalNumberList[listOfNumbers[i]]}`;
        btn.onclick = () => location.href = `codes.html?team=${i}`;
        btn.onclick = (function(index) {
            return () => location.href = `codes.html?team=${index}`;
        })(i);
        container.appendChild(btn); 
    }
}

function passwordToSettings() {
    if (password != "") {
        passwordModalSettings.style.display = 'flex';
        document.querySelectorAll("body > *:not(#passwordModalSettings)").forEach(element => {
            element.classList.add("blur");
        });
        passwordInputSettings.focus();
    } else {
        window.location.href = 'settings.html';
    }
}

function passwordToEdit() {
    if (password != "") {
        passwordModalEdit.style.display = 'flex';
        document.querySelectorAll("body > *:not(#passwordModalEdit)").forEach(element => {
            element.classList.add("blur");
        });
        passwordInputEdit.focus();
    } else {
        window.location.href = 'edit.html';
    }
}

function backToMain() {
    passwordModalSettings.style.display = 'none';
    passwordModalEdit.style.display = 'none';
    document.querySelectorAll("body > *").forEach(element => {
        element.classList.remove("blur");
    });
}

function validatePasswordSettings() {
    enteredPassword = document.getElementById('passwordInputSettings');
    if (enteredPassword.value.trim() == password) {
        window.location.href = 'settings.html';
    } else {
        passwordHeadline = document.getElementById('password-headline-settings');
        passwordHeadline.textContent = "Erneut Versuchen";
    }
}

function validatePasswordEdit() {
    enteredPassword = document.getElementById('passwordInputEdit');
    if (enteredPassword.value.trim() == password) {
        window.location.href = 'edit.html';
    } else {
        passwordHeadline = document.getElementById('password-headline-edit');
        passwordHeadline.textContent = "Erneut Versuchen";
    }
}
