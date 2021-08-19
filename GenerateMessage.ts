import ProcessTalkHistory from "./ProcessTalkHistory";
// import {data} from "./data";     // DEBUG:

// TODO: fix redundant type
type WordChain = {
    [key: string]: {
        [key2: string]: {
            [key3: string]: number
        }
    }
} | {
    [key2: string]: {
        [key3: string]: number
    }
}
;


class GenerateMessage extends ProcessTalkHistory {
    constructor(filename: string) {
        super(filename);

        // super(filename, data);        // DEBUG:
    }


    // TODO: fix type any
    wordChoise(dict: any) {
        const idx = Math.floor(Math.random() * Object.keys(dict).length);
        const key = Object.keys(dict)[idx];
        return key;
    }


    generateBase(dict?: WordChain) {
        let success = false;        // flag
        let wordOutList: Array<string> = [];

        while (!success && dict) {           // avoid error
            try {
                const fst = dict["@"];      // @ as beginning of sentence
                let w1 = this.wordChoise(fst);
                let w2 = this.wordChoise(fst[w1]);

                wordOutList.push(w1);
                wordOutList.push(w2);

                while (true){
                    const w3 = this.wordChoise(dict[w1][w2]);
                    wordOutList.push(w3);

                    if (w3 === "^"){        // if end of sentence
                        success = true;
                        break;
                    }

                    w1 = w2;
                    w2 = w3;
                }
            }catch(err){
                console.log("err: ", err);
            }
        }

        const wordOut = wordOutList.join("");
        return wordOut.slice(0, wordOut.indexOf("^"));     // return words til ^ got found
    }


    getGeneratedMessage(sender: string): string {
        if (sender === this.opponentName)
            return this.generateBase(this.opponentMarkovChain);
        else
            return this.generateBase(this.myMarkovChain);
    }
}

export default GenerateMessage;