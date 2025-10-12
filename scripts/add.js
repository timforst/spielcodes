const pdfjsLib = window['pdfjs-dist/build/pdf'];
pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.10.111/pdf.worker.min.js";

let globalPins = null;
let globalCodes = null;
let globalList = null;
let globalName = null;
let pinsRead = false;
let codesRead = false;
let nameEntered = false;
let pinDict = {};
let codeDict = {};
let nameDict = {};
let listOfNames = [];
let currentTeamIndex = -1;

document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('listOfNames')) {
        pinDict = JSON.parse(localStorage.getItem('pinDict'));
        codeDict = JSON.parse(localStorage.getItem('codeDict'));
        nameDict = JSON.parse(localStorage.getItem('nameDict'));
        listOfNames = JSON.parse(localStorage.getItem('listOfNames'));
    }
});

function romanNumeral(str) {
    return /^[IVXL]+$/.test(str);
}

async function readPDF(pdfFile) {
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
                let codes = [];
                for (let i = 0; i < pdf.numPages; i++) {
                    const page = await pdf.getPage(i + 1);
                    const content = await page.getTextContent();
                    const contentList = content.items.map(item => item.str)
                    let teamName = contentList[2];
                    let fullName = `${contentList[0]} ${teamName}`;
                    console.log(teamName);
                    if (!(fullName in nameDict)) {
                        if (teamName == "Jugend 19") {
                            nameDict[fullName] = `Jugend`;
                        } else if (teamName.startsWith("Jugend 19")) {
                            nameDict[fullName] = `Jugend ${teamName.slice(teamName.lastIndexOf(' ') + 1)}`;
                        } else {
                            nameDict[fullName] = teamName;
                        }
                        localStorage.setItem('nameDict', JSON.stringify(nameDict));
                    }
                    if (contentList[4] == "Spiel-PINs") {
                        console.log("Spiel-PINs wurden hochgeladen");
                        let homeName;
                        if (romanNumeral(teamName.slice(-1))) {
                            homeName = `${contentList[0]} ${teamName.slice(teamName.lastIndexOf(' ') + 1)}`;
                        } else {
                            homeName = contentList[0];
                        }
                        for (let j = 19; j < contentList.length ; j += 12) {
                            dates.push(contentList[j]);
                            if (contentList[j+4] == homeName) {
                                heim.push(true);
                                gegner.push(content.items.map(item => item.str)[j+6]);
                            } else {
                                heim.push(false);
                                gegner.push(content.items.map(item => item.str)[j+4]);
                            }
                            pins.push(content.items.map(item => item.str)[j+8]);
                        }
                        resolve([dates, pins, gegner, heim, fullName]);
                    } else if (contentList[4] == "Spiel-Erfassungs-Codes") {
                        console.log("Spiel-Erfassungs-Codes wurden hochgeladen");
                        for (let j = 24; j < contentList.length ; j += 12) {
                            codes.push(contentList[j+8]);
                            gegner.push(contentList[j+6]);
                            resolve([codes, gegner, fullName]);
                        }
                    } else {
                        console.log("Falsches Dateiformat: ");
                        console.log(contentList[4]);
                    }
                }
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
        let file = uploadCodes.files[0];
        processPDF(file);
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
        processPDF(file);
        customFileButton.style.color = '#000';
    } else {
        customFileButton.textContent = 'Datei Auswählen';
    }
});

function processPDF(file) {
    readPDF(file).then(data => {
        if (data.length == 3) {
            globalCodes = data.slice(0, 2);
            globalName = data[2];
            console.log(globalName);
            codesRead = true;
            console.log("Upload: ", globalCodes);
        } else if (data.length == 5) {
            globalPins = data.slice(0, 4);
            globalName = data[4];
            console.log(globalName);
            pinsRead = true;
            console.log("Upload: ", globalPins);
        } else {
            console.log("Unbekanntes Format")
        }
    });
}

function addTeam() {
    if (pinsRead && codesRead) {
        if (listOfNames.includes(globalName)) {
            document.getElementById('verificationModalEdit').style.display = 'flex';
            currentTeamIndex = listOfNames.indexOf(globalName);
        } else {
            pinDict[globalName] = globalPins;
            codeDict[globalName] = globalCodes;
            listOfNames.push(globalName);
            localStorage.setItem('pinDict', JSON.stringify(pinDict));
            localStorage.setItem('codeDict', JSON.stringify(codeDict));
            localStorage.setItem('listOfNames', JSON.stringify(listOfNames));
            console.log("Mannschaft wurde hinzugefügt");
            window.location.href = "edit.html";
        }
    } else {
        console.log("PDFs noch nicht vollständig");
    }
}

function backToEdit() {
    document.getElementById('verificationModalEdit').style.display = 'none';
}

function updateTeam() {
    pinDict[currentTeamIndex] = globalPins;
    codeDict[currentTeamIndex] = globalCodes;
    listOfNames[currentTeamIndex] = globalName;
    localStorage.setItem('pinDict', JSON.stringify(pinDict));
    localStorage.setItem('codeDict', JSON.stringify(codeDict));
    localStorage.setItem('listOfNames', JSON.stringify(listOfNames));
    console.log("Mannschaft wurde aktualisiert");
    window.location.href = "edit.html";
}

function closeAdd() {
    window.location.href = "edit.html";
}



