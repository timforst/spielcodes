verein = "FTT Hartmannshofen 1987";
password = "";

document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('verein')) {
        verein = JSON.parse(localStorage.getItem('verein'));
    }
    if (localStorage.getItem('password')) {
        password = JSON.parse(localStorage.getItem('password'));
    } else {
        document.getElementById('delete-password-button').textContent = 'Kein Passwort';
    }
    if (localStorage.getItem('listOfNames')) {
        document.getElementById('delete-teams-button').textContent = 'Löschen';
    } else {
        document.getElementById('delete-teams-button').textContent = 'Gelöscht';
    }
});

function submitVereinsName() {
    const vereinsName = document.getElementById('verein');
    const name = vereinsName.value.trim();
    if (name) {
        let verein = name;
        localStorage.setItem('verein', JSON.stringify(verein));
        vereinsName.value = '';
    }
}

function submitPassword() {
    const tempPassword = document.getElementById('password');
    const realPassword = tempPassword.value.trim();
    if (realPassword) {
        let password = realPassword;
        localStorage.setItem('password', JSON.stringify(password));
        tempPassword.value = '';
        document.getElementById('delete-password-button').textContent = 'Löschen';
    }
}

function deletePassword() {
    localStorage.setItem('password', JSON.stringify(""));
    document.getElementById('delete-password-button').textContent = 'Kein Passwort';
    password = "";
    console.log("Passwort gelöscht");
}

function deleteTeams() {
    localStorage.removeItem('listOfNames');
    localStorage.removeItem('listOfCodes');
    localStorage.removeItem('listOfPins');
    document.getElementById('delete-teams-button').textContent = 'Gelöscht';
}

function closeSettings() {
    window.location.href = "index.html";
}

