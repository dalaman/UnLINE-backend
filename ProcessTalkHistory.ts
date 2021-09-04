import {
    HEADER_PREFIX,
    HEADER_SUFFIX,
    STAMP_EMOTICON,
    IMAGE,
    VIDEO,
} from "./MetaCharacters";
import kuromoji from "kuromoji";
const TinySegmenter = require("tiny-segmenter");


type DataDict = {
    date: Array<string>,
    time: Array<string>,
    name: Array<string>,
    message: Array<string>
}


type WordChain = {
    [key: string]: {
        [key2: string]: {
            [key3: string]: number
        }
    }
};


class ProcessTalkHistory {
    opponentName: string = "";
    protected dataDict?: DataDict;
    private opponentMessageList: Array<string> = [];
    private myMessageList: Array<string> = [];
    private tinySegmenter = new TinySegmenter();
    protected opponentMarkovChain?: WordChain;
    protected myMarkovChain?: WordChain;


    // constructor(filename: string, data_: string) {       // DEBUG:
        // const data = data_;
    constructor(talkData: string) {

        // FIXME:
        // reading file...
        const data:string = talkData;
        const firstLine:string = talkData.split("\n")[0];
        this.opponentName = firstLine.replace(HEADER_PREFIX, "").replace(HEADER_SUFFIX, "");
        // FIXME:

        this.makeDataDict(data);
        this.getMessageList();
        this.run();
    }


    // remove metaCharacters
    removeNoneString(message: string) {
        if ([HEADER_PREFIX, HEADER_SUFFIX, STAMP_EMOTICON, IMAGE, VIDEO].includes(message)) {
            return "NONE";
        }
        return message;
    }


    makeDataDict(data: string) {
        let dateList: Array<string> = [];
        let timeList: Array<string> = [];
        let nameList: Array<string> = [];
        let messageList: Array<string> = [];

        let date: string = "";
        let time: string = "";
        let name: string = "";
        let message: string = "";

        for (var datum of data.split("\n\n").slice(1)) {     // slice[1:]: remove header
            if (datum === "") continue;

            const lineList = datum.split("\n");
            if (lineList[0] != "")
                date = lineList[0];

            for (var line of lineList.slice(1)) {       // slice[1:]: remove date
                try {
                    // if line === [time, name, message]
                    if (line.split("\t").length === 3) {
                        time = line.split("\t")[0];
                        name = line.split("\t")[1];
                        message = line.split("\t")[2];
                    }
                } catch {
                    continue;
                }

                dateList.push(date);
                timeList.push(time);
                nameList.push(name);

                messageList.push(this.removeNoneString(message));
            }
        }

        this.dataDict = {
            date: dateList, time: timeList,
            name: nameList, message: messageList,
        }
    }


    getMessageList() {
        if (this.dataDict) {
            for (var i = 0; i < this.dataDict.name.length; i++) {
                let name = this.dataDict.name[i];
                let message = this.dataDict.message[i];

                if (name === this.opponentName) {
                    this.opponentMessageList.push(message + "^");       // ^ as end of sentence
                } else {
                    this.myMessageList.push(message + "^");     // ^ as end of sentence
                }
            }
        }
    }


    addWordChain(dict: WordChain, tmpList: Array<string>) {
        const w1: string = tmpList[0];
        const w2: string = tmpList[1];
        const w3: string = tmpList[2];

        if (!Object.keys(dict).includes(w1))
            dict[w1] = {};
        if (!Object.keys(dict[w1]).includes(w2))
            dict[w1][w2] = {};
        if (!Object.keys(dict[w1][w2]).includes(w3))
            dict[w1][w2][w3] = 0;

        dict[w1][w2][w3] += 1;

        return dict;
    }


    makeMarkovChain(messageList?: Array<string>) {
        let dict: WordChain = {};

        if (messageList) {
            for (var message of messageList) {
                if (message !== "NONE^"){       // if not image, video...
                    let tmpList = ["@"];        // @ as beginning of sentence
                    for (var word of this.tinySegmenter.segment(message)) {
                        tmpList.push(word);

                        if (tmpList.length > 3)           // 3 words dict
                            tmpList = tmpList.slice(1);
                        else if (tmpList.length < 3)
                            continue;

                        dict = this.addWordChain(dict, tmpList)
                    }
                }
            }
            return dict;
        }
    }


    run() {
        this.opponentMarkovChain = this.makeMarkovChain(this.opponentMessageList);
        this.myMarkovChain = this.makeMarkovChain(this.myMessageList);
    }
}

export default ProcessTalkHistory;