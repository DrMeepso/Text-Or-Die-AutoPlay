const fs = require("fs")

fs.readFile('./AiAnswers.txt', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return;
    }

     ProcessData(data)


});

function ProcessData(data){

    var ClumpData = []

    var questions = data.split("\n")[0].split(",")
    var answers = data.replace(questions, "").replaceAll("\r","").split("\n")

    questions.forEach(question => {

        ClumpData.push( { "question": question.toLocaleUpperCase(), "answers": [] } )
        
    });

    answers.forEach( line => {

        line.split(",").forEach( (subQuestion, index) => {

            if(subQuestion == undefined || subQuestion == "") return
            if (ClumpData[index] == undefined) return

            ClumpData[index].answers.push(subQuestion)

        })

    })

    console.log(ClumpData)

    fs.writeFile('./questions.json', JSON.stringify(ClumpData), err => {
        if (err) {
          console.error(err);
        }
        // file written successfully
    });

}

setInterval(() => {
    
}, 50);