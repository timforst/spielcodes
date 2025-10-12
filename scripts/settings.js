password = "";

document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('verein')) {
        verein = JSON.parse(localStorage.getItem('verein'));
    }
    if (localStorage.getItem('password')) {
        password = JSON.parse(localStorage.getItem('password'));
        if (password == "") {
            document.getElementById('delete-password-button').textContent = 'Kein Passwort';
        }
    } else {
        document.getElementById('delete-password-button').textContent = 'Kein Passwort';
    }
    if (localStorage.getItem('listOfNames')) {
        document.getElementById('delete-teams-button').textContent = 'Löschen';
    } else {
        document.getElementById('delete-teams-button').textContent = 'Gelöscht';
    }
});

const passwordInputField = document.getElementById("password");
passwordInputField.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        submitPassword();
    }
});

function backToEdit() {
    document.getElementById('verificationModalDeleteAll').style.display = 'none';
}

function openVerificationModal() {
    document.getElementById('verificationModalDeleteAll').style.display = 'flex';
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
    localStorage.removeItem('codeDict');
    localStorage.removeItem('pinDict');
    localStorage.removeItem('nameDict');
    document.getElementById('delete-teams-button').textContent = 'Gelöscht';
    document.getElementById('verificationModalDeleteAll').style.display = 'none';
}

function closeSettings() {
    window.location.href = "index.html";
}

