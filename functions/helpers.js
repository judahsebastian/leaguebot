const tftJson = require('../assets/tft.json');

//Valid champs
let validChamps = ['camille', 'jayce', 'jinx', 'vi', 'aatrox', 'ahri', 'akali', 'anivia', 'ashe', 'aurelionsol', 'blitzcrank', 'brand', 'braum',
    'chogath', 'darius', 'draven', 'elise', 'evelynn', 'fiora', 'gangplank', 'garen', 'gnar', 'graves', 'karthus', 'kassadin', 'katarina', 'kayle', 'kennen',
    'khazix', 'kindred', 'leona', 'lissandra', 'lucian', 'lulu', 'missfortune', 'mordekaiser', 'morgana', 'nidalee', 'pantheon', 'poppy', 'pyke', 'reksai', 'rengar', 'sejuani', 'shen',
    'shyvana', 'swain', 'tristana', 'twistedfate', 'varus', 'vayne', 'veigar', 'volibear', 'warwick', 'yasuo', 'zed'
]



let rankLinks = {
    iron:'https://imgur.com/RDxvdaN',
    bronze:'https://imgur.com/a/3DP5UzI',
    challenger:'https://imgur.com/3W4Apzd',
    diamond:'https://imgur.com/YCZrldl',
    gold:'https://imgur.com/nqd1IxB',
    grandmaster:'https://imgur.com/8jSRzIE',
    iron:'https://imgur.com/2SIIyKc',
    master:'https://imgur.com/5EhsSZB',
    platinum:'https://imgur.com/DbfhsxK',
    silver:'https://imgur.com/7Kn24Kq'
}

module.exports = {
    //Processes name of commander
    nameBuild: function (userInput) {
        let name = userInput[1];
        if (userInput.length > 2) {
            name = '';
            for (let i = 1; i < userInput.length; i++) {
                if(i < userInput.length-1){
                    name += userInput[i]+' ';
                }
                else{
                    name += userInput[i];
                }
            }
        name = name.split(' ').join('%20');
        console.log(name);
        }
        return name;
    },

    //Processes name of commander
    rankImg: function (userInput) {
        let link = '';
        let rank = userInput.toLowerCase();
        if (rank == 'iron') {
            link = rankLinks.iron;
        }
        else if(rank == 'bronze'){
            link = rankLinks.bronze;
        }
        else if(rank == 'silver'){
            link = rankLinks.silver;
        }
        else if(rank == 'gold'){
            link = rankLinks.gold;
        }
        else if(rank == 'platinum'){
            link = rankLinks.platinum;
        }
        else if(rank == 'diamond'){
            link = rankLinks.diamond;
        }
        else if(rank == 'master'){
            link = rankLinks.master;
        }
        else if(rank == 'grandmaster'){
            link = rankLinks.grandmaster;
        }
        else if(rank == 'challenger'){
            link = rankLinks.challenger
        }
        else{
            link = rankLinks.iron;
        }
        console.log(link);
        return link;
    },

    //Parses text object data
    parseData: function (rawData){
        cleanString = rawData.split('%').join('');
        let responseObj = {

        };
        let numericData = [];
        let textData = cleanString.split(' ');
        for(let x = 0; x < textData.length; x++){
            if(!isNaN(textData[x])){
                numericData.push(textData[x]);
            }
        }
        numericData = numericData.filter(function(str){
            return /\S/.test(str);
        });
        
        console.log(numericData.toString());
        responseObj = {
            wins:numericData[0],
            losses:numericData[1],
            winpercent:numericData[2],
            matches:numericData[3],
            lp:numericData[4]
        }
        return responseObj;
    },

    //Returns appropriate items for each TFT champ
    tftItems: function (champList){
        champArray = [];
        responseArray = [];
        let itemString = '';
        //Only keeps valid champion names
        for(let x = 0; x < champList.length; x++){
            if(validChamps.includes(champList[x].toLowerCase())){
                champArray.push(champList[x].toLowerCase());
            }
        }
        //Saves response for each
        for(let x = 0; x < champArray.length; x++){
            itemString = `**${champArray[x]}**: \n${tftJson[`${champArray[x]}`].item1}\n${tftJson[`${champArray[x]}`].item2}\n${tftJson[`${champArray[x]}`].item3}`
            responseArray.push(`\n${itemString}`);
        }
        return responseArray;
    },

    validChamps:validChamps
}
