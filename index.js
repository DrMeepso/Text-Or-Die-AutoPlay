const { exec } = require("child_process");
const ReadText = require('text-from-image')
const QuestionsJson = require("./questions.json")
const Keys = require("./keys.json")
const Jimp = require('jimp');

function getScreenShot(){

    return new Promise( (res, rej) => {

        exec(`adb.exe shell screencap /sdcard/devscreenshots/screen.png`, () => {

            exec(`del screen.png`)
            exec(`adb.exe pull /sdcard/devscreenshots/screen.png screen.png`, () => {

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
            var queandans = QuestionsJson.find( e => e.question.toLocaleLowerCase() == que.toLocaleLowerCase())
            if(queandans == undefined){

                var queandans = QuestionsJson.find( e => `${e.question.toLocaleLowerCase()} p` == que.toLocaleLowerCase())


            }


            if (queandans == undefined){

                console.log("Error Reading Question, Computor read it as: " + que)

                var key = Keys.find(e => e.key == "n")
                exec(`adb.exe shell input tap ${key.x} ${key.y}`)
                setTimeout(() => {
                    
                    var key = Keys.find(e => e.key == "return")
                    exec(`adb.exe shell input tap ${key.x} ${key.y}`)

                }, 500);

                return

            }

            console.log("Found Answers")

            var WrAns = queandans.answers.sort((a, b) => a.length - b.length)[queandans.answers.length-1].replaceAll(" ","").replaceAll("-","")
            for (let i = 0; i < WrAns.length; i++) {
                setTimeout(() => {
                    
                    var key = Keys.find(e => e.key == WrAns.split("")[i].toLocaleLowerCase())
                    exec(`adb.exe shell input tap ${key.x} ${key.y}`)

                }, i*1500);
            }

            setTimeout(() => {
                
                var key = Keys.find(e => e.key == "return")
                exec(`adb.exe shell input tap ${key.x} ${key.y}`)

            }, (WrAns.length*1500) + 1500);

        }).catch(err => {
            console.log(err);
        })

    }, 1500);

})