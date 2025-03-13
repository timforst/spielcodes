import PyPDF2
import json

def readPins(pdf_location, erste = True):
    with open(pdf_location, 'rb') as file:
        reader = PyPDF2.PdfReader(file)
        text = ""
        for page in reader.pages:
            text += page.extract_text()
    data = text.split('\n')[6:-1]
    dates = []
    pins = []
    gegner = []
    heimspiel = []
    for i in range(len(data)):
        data_list = data[i].split(' ')
        dates.append(data_list[1])
        pins.append(data_list[-1])
        if "v" in data_list:
            if data_list[6] == "FTT":
                heimspiel.append(True)
                if erste:
                    gegner.append(" ".join(data_list[9:-1]))
                else:
                    gegner.append(" ".join(data_list[10:-1]))
            else:
                heimspiel.append(False)
                if erste:
                    gegner.append(" ".join(data_list[6:-4]))
                else:
                    gegner.append(" ".join(data_list[6:-5]))
        elif "t" in data_list:
            if data_list[4] == "FTT":
                heimspiel.append(True)
                if erste:
                    gegner.append(" ".join(data_list[7:-1]))
                else:
                    gegner.append(" ".join(data_list[8:-1]))
            else:
                heimspiel.append(False)
                if erste:
                    gegner.append(" ".join(data_list[4:-4]))
                else:
                    gegner.append(" ".join(data_list[4:-5]))
        else:
            if data_list[5] == "FTT":
                heimspiel.append(True)
                if erste:
                    gegner.append(" ".join(data_list[8:-1]))
                else:
                    gegner.append(" ".join(data_list[9:-1]))
            else:
                heimspiel.append(False)
                if erste:
                    gegner.append(" ".join(data_list[5:-4]))
                else:
                    gegner.append(" ".join(data_list[5:-5]))

    return [dates, pins, gegner, heimspiel]

def readCodes(pdf_location, erste = True):
    with open(pdf_location, 'rb') as file:
        reader = PyPDF2.PdfReader(file)
        text = ""
        for page in reader.pages:
            text += page.extract_text()
    data = text.split('\n')[10:-1]
    dates = []
    gegner = []
    codes = []
    for i in range(len(data)):
        data_list = data[i].split(' ')
        dates.append(".".join(data_list[0].split('.')[1:]))
        codes.append(data_list[-1])
        if erste:
            heim_index = data_list.index('1987')
        else :
            heim_index = data_list.index('1987')+1
        gegner.append(" ".join(data_list[heim_index+1:-1]))
    return [dates, codes, gegner]

def writeToJS(output_file, lists):
    with open(output_file, "w") as f:
        f.write(f"const data = {json.dumps(lists, indent=2)};")


# def main(pins_file, codes_file, output_file, erste = True):
def main(herren=-1, jugend=-1):
    if herren != -1:
        pins_file = f"SpielPinsHerren{herren}.pdf"
        codes_file = f"SpielCodesHerren{herren}.pdf"
        output_file = f"Herren{herren}.js"
    elif jugend != -1:
        pins_file = f"SpielPinsJugend{jugend}.pdf"
        codes_file = f"SpielCodesJugend{jugend}.pdf"
        output_file = f"Jugend{jugend}.js"
    else:
        print("Setze herren oder jugend auf die entsprechende Mannschaft")
        return
    if herren == 1 or jugend == 1:
        erste = True
    else:
        erste = False
    pin_list = readPins(pdf_location = pins_file, erste = erste)
    code_list = readCodes(pdf_location = codes_file, erste = erste)
    data_list = pin_list + code_list
    writeToJS(output_file, data_list)

if __name__ == '__main__':
    main(herren=3, jugend=-1)

