const pdfjsLib = window['pdfjs-dist/build/pdf'];
pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.10.111/pdf.worker.min.js";

let globalPins = null;
let globalCodes = null;
let globalList = null;
let globalNameList = ["Herren", "Damen", "Jugend", "Bambini", "Senioren", "Seniorinnen"]
let globalNameIndex = 0;
let globalNumberList = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV"]
let globalNumberIndex = 0;
let verein = "FTT Hartmannshofen 1987";
let pinsRead = false;
let codesRead = false;
let nameEntered = false;
let listOfPins = [];
let listOfCodes = [];
let listOfNames = [];
let listOfNumbers = [];
let pin = "";

document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('listOfPins')) {
        listOfPins = JSON.parse(localStorage.getItem('listOfPins'));
        listOfCodes = JSON.parse(localStorage.getItem('listOfCodes'));
        listOfNames = JSON.parse(localStorage.getItem('listOfNames'));
        listOfNumbers = JSON.parse(localStorage.getItem('listOfNumbers'));
    }
    if (localStorage.getItem('verein')) {
        verein = JSON.parse(localStorage.getItem('verein'));
        console.log(verein);
    }
    if (localStorage.getItem('pin')) {
        console.log("I was here");
        pin = JSON.parse(localStorage.getItem('pin'));
        if (pin != '') {
            console.log(pin);
            document.getElementById('pin-form').style.display = 'block';
        } else {
            document.getElementById('add-team-page').style.display = 'block';
        }
    } else {
        console.log("I was there");
        const addTeamPage = document.getElementById('add-team-page');
        console.log(addTeamPage); 
        if (addTeamPage) {
            addTeamPage.style.display = 'block';
        } else {
            console.log("add-team-page element is not found");
        }
    }
});


async function readPins(pdfFile) {
    const reader = new FileReader();

    return new Promise((resolve, reject) => {
        reader.onload = async function () {
            try {
                const typedArray = new Uint8Array(reader.result);
                const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;
                let dates = [];
                let heim = [];
                let gegner = [];
                let pins = [];

                for (let i = 0; i < pdf.numPages; i++) {
                    const page = await pdf.getPage(i + 1);
                    const content = await page.getTextContent();
                    const contentList = content.items.map(item => item.str)
                    for (let j = 19; j < contentList.length ; j += 12) {
                        dates.push(contentList[j]);
                        if (contentList[j+4].includes(verein)) {
                            heim.push(true);
                        } else {
                            heim.push(false);
                        }
                        gegner.push(content.items.map(item => item.str)[j+6]);
                        pins.push(content.items.map(item => item.str)[j+8]);
                    }
                }

                resolve([dates, pins, gegner, heim]);
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = reject;
        reader.readAsArrayBuffer(pdfFile);
    });
}

async function readCodes(pdfFile) {
    const reader = new FileReader();

    return new Promise((resolve, reject) => {
        reader.onload = async function () {
            try {
                const typedArray = new Uint8Array(reader.result);
                const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;
                let codes = [];
                let gegner = [];

                for (let i = 0; i < pdf.numPages; i++) {
                    const page = await pdf.getPage(i + 1);
                    const content = await page.getTextContent();
                    const contentList = content.items.map(item => item.str)
                    for (let j = 24; j < contentList.length ; j += 12) {
                        codes.push(contentList[j+8]);
                        gegner.push(contentList[j+6]);
                    }
                }
                resolve([codes, gegner]);
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = reject;
        reader.readAsArrayBuffer(pdfFile);
    });
}


document.getElementById('uploadCodes').addEventListener('change', function() {
    const uploadCodes= document.getElementById('uploadCodes');
    const customFileButton = document.getElementById('spielcodes-button');

    if (uploadCodes.files.length > 0) {
        customFileButton.textContent = uploadCodes.files[0].name;
        customFileButton.style.backgroundColor = '#28A745';  // Change color to indicate success
    } else {
        customFileButton.textContent = 'Datei Auswählen';  // Reset text if no file is selected
        customFileButton.style.backgroundColor = '#007BFF'; // Reset color
    }
});

document.getElementById('uploadPins').addEventListener('change', function() {
    const uploadPins= document.getElementById('uploadPins');
    const customFileButton = document.getElementById('spielpins-button');

    if (uploadPins.files.length > 0) {
        customFileButton.textContent = uploadPins.files[0].name;
        customFileButton.style.backgroundColor = '#28A745';  // Change color to indicate success
    } else {
        customFileButton.textContent = 'Datei Auswählen';  // Reset text if no file is selected
        customFileButton.style.backgroundColor = '#007BFF'; // Reset color
    }
});

function printPinsAndCodes() {
    if (pinsRead && codesRead && nameEntered) {
        console.log(globalPins);
        console.log(globalCodes);
        console.log(globalName);
    }
}

function increaseMannschaftsName() {
    globalNameIndex +=1;
    if (globalNameIndex == globalNameList.length) {
        globalNameIndex = 0;
    }
    document.getElementById("name-button").textContent = globalNameList[globalNameIndex];
}

function decreaseMannschaftsName() {
    globalNameIndex -=1;
    if (globalNameIndex == -1) {
        globalNameIndex = globalNameList.length - 1;
    }
    document.getElementById("name-button").textContent = globalNameList[globalNameIndex];
}

function increaseMannschaftsNumber() {
    globalNumberIndex +=1;
    if (globalNumberIndex == globalNumberList.length) {
        globalNumberIndex = 0;
    }
    document.getElementById("number-button").textContent = globalNumberList[globalNumberIndex];
}

function decreaseMannschaftsNumber() {
    globalNumberIndex -=1;
    if (globalNumberIndex == -1) {
        globalNumberIndex = globalNumberList.length - 1;
    }
    document.getElementById("number-button").textContent = globalNumberList[globalNumberIndex];
}

function processSpielCodes() {
    const uploadCodes = document.getElementById('uploadCodes');
    const file = uploadCodes.files[0];
    if (file) {
        readCodes(file).then(data => {
            globalCodes = data;
            codesRead = true;
            console.log("Upload: ", globalCodes);
            document.getElementById('remove-spielcodes-button').style.display = 'block';
            document.getElementById('spielcodes-upload-button').style.display = 'none';
            document.getElementById('spielcodes-button').style.display = 'none';
        }).catch(error => {
            console.error("Error extracting data:", error);
        });
    }
}

function removeSpielCodes() {
    globalCodes = null;
    codesRead = false;
    // localStorage.removeItem('csvData');
    document.getElementById('remove-spielcodes-button').style.display = 'none';
    document.getElementById('spielcodes-upload-button').style.display = 'block';
    document.getElementById('spielcodes-button').style.display = 'block';
    const uploadCodes = document.getElementById('uploadCodes');
    uploadCodes.value = '';
    const customFileButton = document.getElementById('spielcodes-button');
    customFileButton.textContent = 'Datei Auswählen';
    customFileButton.style.backgroundColor = '#007BFF'; 
}

function processSpielPins() {
    const uploadPins = document.getElementById('uploadPins');
    const file = uploadPins.files[0];
    if (file) {
        readPins(file).then(data => {
            globalPins = data;
            pinsRead = true;
            console.log("Upload: ", globalPins);
            document.getElementById('remove-spielpins-button').style.display = 'block';
            document.getElementById('spielpins-upload-button').style.display = 'none';
            document.getElementById('spielpins-button').style.display = 'none';
        }).catch(error => {
            console.error("Error extracting data:", error);
        });
    }
}

function removeSpielPins() {
    globalPins = null;
    pinsRead = false;
    // localStorage.removeItem('csvData');
    document.getElementById('remove-spielpins-button').style.display = 'none';
    document.getElementById('spielpins-upload-button').style.display = 'block';
    document.getElementById('spielpins-button').style.display = 'block';
    const uploadPins = document.getElementById('uploadPins');
    uploadPins.value = '';
    const customFileButton = document.getElementById('spielpins-button');
    customFileButton.textContent = 'Datei Auswählen';
    customFileButton.style.backgroundColor = '#007BFF'; 
}

function addTeam() {
    if (pinsRead && codesRead) {
        listOfPins.push(globalPins);
        listOfCodes.push(globalCodes);
        listOfNames.push(globalNameIndex);
        listOfNumbers.push(globalNumberIndex);
        localStorage.setItem('listOfPins', JSON.stringify(listOfPins));
        localStorage.setItem('listOfCodes', JSON.stringify(listOfCodes));
        localStorage.setItem('listOfNames', JSON.stringify(listOfNames));
        localStorage.setItem('listOfNumbers', JSON.stringify(listOfNumbers));
        console.log("Mannschaft wurde hinzugefügt");
        window.location.href = "index.html";

    } else {
        console.log("PDFs noch nicht vollständig");
    }
}

function validatePin() {
    enteredPin = document.getElementById('entered-pin');
    if (enteredPin.value.trim() == pin) {
        document.getElementById('pin-form').style.display = 'none';
        document.getElementById('add-team-page').style.display = 'block';
    } else {
        const label = document.querySelector('label[for="entered-pin"]');
        label.textContent = "Falsche Pin, bitte erneut versuchen";
    }
}

function closeSettings() {
    window.location.href = "index.html";
}


