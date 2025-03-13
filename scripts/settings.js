verein = "FTT Hartmannshofen 1987";
pin = "";

document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('verein')) {
        verein = JSON.parse(localStorage.getItem('verein'));
    }
    if (localStorage.getItem('pin')) {
        pin = JSON.parse(localStorage.getItem('pin'));
        if (pin != '') {
            console.log(pin);
            document.getElementById('pin-form').style.display = 'block';
        } else {
            document.getElementById('delete-pin-button').textContent = 'Kein Pin';
            document.getElementById('settings-page').style.display = 'block';
        }
    } else {
        document.getElementById('settings-page').style.display = 'block';
        document.getElementById('delete-pin-button').textContent = 'Kein Pin';
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

function submitPin() {
    const tempPin = document.getElementById('pin');
    const realPin = tempPin.value.trim();
    if (realPin) {
        let pin = realPin;
        localStorage.setItem('pin', JSON.stringify(pin));
        tempPin.value = '';
    }
}

function validatePin() {
    enteredPin = document.getElementById('entered-pin');
    if (enteredPin.value.trim() == pin) {
        document.getElementById('pin-form').style.display = 'none';
        document.getElementById('settings-page').style.display = 'block';
    } else {
        const label = document.querySelector('label[for="entered-pin"]');
        label.textContent = "Falsche Pin, bitte erneut versuchen";
    }
}

function deletePin() {
    localStorage.setItem('pin', JSON.stringify(""));
    document.getElementById('delete-pin-button').textContent = 'Kein Pin';
    pin = "";
    console.log("Pin gelöscht");
}

function closeSettings() {
    window.location.href = "index.html";
}

