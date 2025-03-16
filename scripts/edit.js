const pdfjsLib = window['pdfjs-dist/build/pdf'];
pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.10.111/pdf.worker.min.js";

let globalPins = null;
let globalCodes = null;
let globalList = null;
let globalName = "Herren I";
let verein = "FTT Hartmannshofen 1987";
let pinsRead = false;
let codesRead = false;
let nameEntered = false;
let listOfPins = [];
let listOfCodes = [];
let listOfNames = [];
let listOfNumbers = [];
let currentTeamIndex = -1;

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
                            gegner.push(content.items.map(item => item.str)[j+6]);
                        } else {
                            heim.push(false);
                            gegner.push(content.items.map(item => item.str)[j+4]);
                        }
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

document.getElementById('name-selection').addEventListener('change', function() {
    const currentName = document.getElementById('name-selection');
    const currentNumber = document.getElementById('number-selection');
    if (currentNumber == "") {
        globalName = currentName.value;
    } else {
        globalName = `${currentName.value} ${currentNumber.value}`;
    }
});

document.getElementById('number-selection').addEventListener('change', function() {
    const currentName = document.getElementById('name-selection');
    const currentNumber = document.getElementById('number-selection');
    if (currentNumber == "") {
        globalName = currentName.value;
    } else {
        globalName = `${currentName.value} ${currentNumber.value}`;
    }
});

document.getElementById('uploadCodes').addEventListener('change', function() {
    const uploadCodes= document.getElementById('uploadCodes');
    const customFileButton = document.getElementById('spielcodes-button');

    if (uploadCodes.files.length > 0) {
        customFileButton.textContent = uploadCodes.files[0].name;
        let file = uploadCodes.files[0];
        processSpielCodes(file);
        customFileButton.style.color = '#000';
    } else {
        customFileButton.textContent = 'Datei Auswählen';
    }
});

document.getElementById('uploadPins').addEventListener('change', function() {
    const uploadPins= document.getElementById('uploadPins');
    const customFileButton = document.getElementById('spielpins-button');

    if (uploadPins.files.length > 0) {
        customFileButton.textContent = uploadPins.files[0].name;
        let file = uploadPins.files[0];
        processSpielPins(file);
        customFileButton.style.color = '#000';
    } else {
        customFileButton.textContent = 'Datei Auswählen';
    }
});

function processSpielCodes(file) {
    readCodes(file).then(data => {
        globalCodes = data;
        codesRead = true;
        console.log("Upload: ", globalCodes);
    });
}

function processSpielPins(file) {
    readPins(file).then(data => {
        globalPins = data;
        pinsRead = true;
        console.log("Upload: ", globalPins);
    });
}

function addTeam() {
    if (pinsRead && codesRead) {
        if (listOfNames.includes(globalName)) {
            document.getElementById('verificationModalEdit').style.display = 'flex';
        } else {
            listOfPins.push(globalPins);
            listOfCodes.push(globalCodes);
            listOfNames.push(globalName);
            localStorage.setItem('listOfPins', JSON.stringify(listOfPins));
            localStorage.setItem('listOfCodes', JSON.stringify(listOfCodes));
            localStorage.setItem('listOfNames', JSON.stringify(listOfNames));
            console.log("Mannschaft wurde hinzugefügt");
            window.location.href = "index.html";
        }

    } else {
        console.log("PDFs noch nicht vollständig");
    }
}

function backToEdit() {
    document.getElementById('verificationModalEdit').style.display = 'none';
}

function updateTeam() {
    listOfPins[currentTeamIndex] = globalPins;
    listOfCodes[currentTeamIndex] = globalCodes;
    listOfNames[currentTeamIndex] = globalNameIndex;
    listOfNumbers[currentTeamIndex] = globalNumberIndex;
    localStorage.setItem('listOfPins', JSON.stringify(listOfPins));
    localStorage.setItem('listOfCodes', JSON.stringify(listOfCodes));
    localStorage.setItem('listOfNames', JSON.stringify(listOfNames));
    localStorage.setItem('listOfNumbers', JSON.stringify(listOfNumbers));
    console.log("Mannschaft wurde aktualisiert");
    window.location.href = "index.html";
}

function closeSettings() {
    window.location.href = "index.html";
}


