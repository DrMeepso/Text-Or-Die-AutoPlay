const { exec } = require("child_process");
const ReadText = require('text-from-image')
const QuestionsJson = require("./questions.json")
const Keys = require("./keys.json")
const Jimp = require('jimp');

function getScreenShot(){

    return new Promise( (res, rej) => {

        exec(`adb shell screencap /sdcard/devscreenshots/screen.png`, () => {

            exec(`del screen.png`)
            exec(`adb pull /sdcard/devscreenshots/screen.png screen.png`, () => {

                res("./screen.png")

            })
        
        })

    })
}

getScreenShot()
.then( (file) => {

    console.log("Got Screenshot")

    Jimp.read(file, (err, lenna) => {
        if (err) throw err;
        lenna
          .crop(0,199,720,169)
          .grayscale()
          .write('Question.png');

        console.log("Saved Croped Image")
      });

    setTimeout(() => {
        
        console.log("Reading Image Text")
        ReadText('./Question.png').then(text => {
            
            var que = text.replaceAll("\n"," ").replaceAll("-","").replace(/\s+/g, ' ').trim().replaceAll(`’`,"")
            
            var queandans = QuestionsJson.find( e => e.question.toLocaleLowerCase().replaceAll("-","") == que.toLocaleLowerCase())
            if(queandans == undefined){
                var queandans = QuestionsJson.find( e => `${e.question.toLocaleLowerCase().replaceAll("-","")} p` == que.toLocaleLowerCase())
            }

            if (queandans == undefined){

                console.log("Error Reading Question, Computor read it as: " + que)

                var key = Keys.find(e => e.key == "n")
                exec(`adb shell input tap ${key.x} ${key.y}`)
                setTimeout(() => {
                    
                    var key = Keys.find(e => e.key == "return")
                    exec(`adb shell input tap ${key.x} ${key.y}`)

                }, 500);

                return

            }

            console.log("Found Answers to question: " + que)

            var WrAns = Fix(queandans.answers.sort((a, b) => a.length - b.length)[queandans.answers.length-1].replaceAll(" ","").replaceAll("-",""))
            TypeOnScreen(WrAns.split(""))

        }).catch(err => {
            console.log(err);
        })

    }, 1500);

})

function TypeOnScreen(Text){

    var textArray = Text

    function DoOneChar(){


        if (textArray[0] == undefined){

            var key = Keys.find(e => e.key == "return")
            exec(`adb shell input tap ${key.x} ${key.y}`)

            return

        }

        var key = Keys.find(e => e.key == textArray[0].toLocaleLowerCase())
        console.log("Pressing " + textArray[0].toLocaleLowerCase())
        exec(`adb shell input tap ${key.x} ${key.y}`, () => {

            textArray.shift()
            DoOneChar()

        })

    }

    DoOneChar()
}

function Fix(string){

    return String(string)
    .replaceAll("1","|1|")
    .replaceAll("2","|2|")
    .replaceAll("3","|3|")
    .replaceAll("4","|4|")
    .replaceAll("5","|5|")
    .replaceAll("6","|6|")
    .replaceAll("7","|7|")
    .replaceAll("8","|8|")
    .replaceAll("9","|9|")
    .replaceAll("0","|0|")

    .replaceAll("-","|-|")
    .replaceAll("/","|/|")
    .replaceAll(":","|:|")
    .replaceAll(";","|;|")
    .replaceAll("(","|(|")
    .replaceAll(")","|)|")
    .replaceAll("$","|$|")
    .replaceAll("&","|&|")
    .replaceAll("*","|*|")
    .replaceAll("\"","|\"|")

    .replaceAll(".","|.|")
    .replaceAll(",","|,|")
    .replaceAll("?","|?|")
    .replaceAll("!","|!|")
    .replaceAll("'","|'|")

    .replaceAll("||","")

}