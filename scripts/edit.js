const pdfjsLib = window['pdfjs-dist/build/pdf'];
pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.10.111/pdf.worker.min.js";

let globalPins = null;
let globalCodes = null;
let globalList = null;
let globalName = null;
let nameEntered = false;
let newUpload = true
let pinDict = {};
let codeDict = {};
let nameDict = {};
let listOfNames = [];
let currentTeamIndex = -1;
let indexToDelete = -1;

document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('listOfNames')) {
        console.log("load pinDict:", pinDict)
        pinDict = JSON.parse(localStorage.getItem('pinDict'));
        codeDict = JSON.parse(localStorage.getItem('codeDict'));
        nameDict = JSON.parse(localStorage.getItem('nameDict'));
        listOfNames = JSON.parse(localStorage.getItem('listOfNames'));
        createTeamsList();
    }
});

function createTeamsList() {
    console.log("Creating Teams List")
    const teamsList = document.getElementById("teams-list");
    teamsList.innerHTML = '';
    for (i=0; i < listOfNames.length; i++) {
        fullName = listOfNames[i];
        console.log("i:", i)
        console.log("codeDict:", codeDict)
        console.log("pinDict:", pinDict)
        console.log("fullName:", fullName)
        if (fullName in codeDict && fullName in pinDict) {
            const row = document.createElement('li');
            const nameSpan = document.createElement('span');
            nameSpan.textContent = nameDict[listOfNames[i]];
            row.appendChild(nameSpan);
            const deleteButton = document.createElement('button');
            deleteButton.textContent = '🗑️';
            deleteButton.classList.add('deleteButton');
            deleteButton.addEventListener('click', (function(index) {
                return () => {
                    document.getElementById("verificationModalDeleteTeam").style.display = 'flex';
                    document.getElementById("verification-headline-delete-team").textContent = `${listOfNames[index]} löschen?`;
                    indexToDelete = index;
                };
            })(i));
            row.appendChild(deleteButton);
            teamsList.appendChild(row);
        }
    }
}

function splitString(str) {
    const words = str.split(' ');
    
    if (words.length === 1) {
        return [words[0], ''];
    } else {
        return words;
    }
}


function deleteTeam() {
    delete pinDict[listOfNames[indexToDelete]];
    delete codeDict[listOfNames[indexToDelete]];
    listOfNames.splice(indexToDelete, 1);
    localStorage.setItem('pinDict', JSON.stringify(pinDict));
    localStorage.setItem('codeDict', JSON.stringify(codeDict));
    localStorage.setItem('listOfNames', JSON.stringify(listOfNames));
    createTeamsList();
    document.getElementById('verificationModalDeleteTeam').style.display = 'none';
}

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
                    console.log("fullName:", fullName)
                    if (!(fullName in nameDict)) {
                        if (teamName == "Jugend 19") {
                            nameDict[fullName] = `Jugend`;
                        } else if (teamName.startsWith("Jugend 19")) {
                            nameDict[fullName] = `Jugend ${teamName.slice(teamName.lastIndexOf(' ') + 1)}`;
                        } else {
                            nameDict[fullName] = teamName;
                        }
                        localStorage.setItem('nameDict', JSON.stringify(nameDict));
                        console.log("nameDict:", nameDict)
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

document.getElementById('uploadZip').addEventListener('change', async function() {
    const uploadZip= document.getElementById('uploadZip');
    const customFileButton = document.getElementById('zip-button');
    if (listOfNames.length == 0) {
        newUpload = true;
    } else {
        newUpload = false;
    }
    if (uploadZip.files.length > 0) {
        const file = uploadZip.files[0]
        if (file.name.endsWith('.zip')) {
            await processZip(file);
        } else if (file.name.endsWith('.pdf')) {
            await processPDF(file);
        }
        if (newUpload) {
            listOfNames.sort()
            localStorage.setItem('listOfNames', JSON.stringify(listOfNames));
        }
        createTeamsList();
    } else {
        customFileButton.textContent = 'Codes';
        customFileButton.style.color = '#999';
    }
});

async function processZip(zipFile) {
    const jszip = new JSZip();
    const zip = await jszip.loadAsync(zipFile);
    const pdfPromises = [];
    for (const [name, entry] of Object.entries(zip.files)) {
        if (!entry.dir && name.endsWith('.pdf')) {
            const blob = await entry.async('blob');
            const file = new File([blob], name, { type: 'application/pdf' });
            pdfPromises.push(processPDF(file));
        }
    }

    await Promise.all(pdfPromises);
}

async function processPDF(file) {
    const data = await readPDF(file);
    if (data.length == 3) {
        globalCodes = data.slice(0, 2);
        globalName = data[2];
        console.log("Upload: ", globalCodes);
        addCodes();
    } else if (data.length == 5) {
        globalPins = data.slice(0, 4);
        globalName = data[4];
        console.log("Upload: ", globalPins);
        addPins();
    }
}

function backToEdit() {
    document.getElementById('verificationModalDeleteTeam').style.display = 'none';
}

function addCodes() {
    if (listOfNames.includes(globalName)) {
        currentTeamIndex = listOfNames.indexOf(globalName);
        codeDict[globalName] = globalCodes;
        console.log("Mannschaft wurde aktualisiert", currentTeamIndex);
    } else {
        listOfNames.push(globalName);
        codeDict[globalName] = globalCodes;
        console.log(globalName)
        console.log("Mannschaft wurde erstellt");
    }
    localStorage.setItem('codeDict', JSON.stringify(codeDict));
    localStorage.setItem('listOfNames', JSON.stringify(listOfNames));
    globalCodes = null;
}

function addPins() {
    if (listOfNames.includes(globalName)) {
        currentTeamIndex = listOfNames.indexOf(globalName);
        pinDict[globalName] = globalPins;
        console.log("Mannschaft wurde aktualisiert", currentTeamIndex);
    } else {
        listOfNames.push(globalName);
        pinDict[globalName] = globalPins;
        console.log("Mannschaft wurde erstellt", currentTeamIndex);
    }
    localStorage.setItem('pinDict', JSON.stringify(pinDict));
    localStorage.setItem('listOfNames', JSON.stringify(listOfNames));
    globalPins = null;
}

function closeSettings() {
    window.location.href = "index.html";
}


