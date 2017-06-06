FreeTextScreen.prototype = Object.create(View.prototype);

//Generic VAS Screen: takes a question and two scale ends and generates a VAS response
function FreeTextScreen(_session, _questionnaireTitle, _question, _shortQuestion, _nextScreenToGoTo)
{
    View.call(this);
    this.session = _session;
    this.questionnaireTitle = _questionnaireTitle;
    this.question = _question;
    this.shortQuestion = _shortQuestion;
    this.buttonText = "Next";
    this.nextScreenToGoTo = _nextScreenToGoTo || "";
}

FreeTextScreen.prototype.create = function (stage, db, session)
{
    this.createBasic(stage, db, session);
    this.createScreenText(this.question);
    var options = {
        text: { font: "15px Arial" },
        valign: "middle",
        borderRadius: 5,
        borderWidth: 2,
        backgroundColor: "#d9d9d9",
        padding: 10,
        type: "text",
        maxlength: 300,
        width: Main.SCREEN_WIDTH * 0.9,
        align: "left",
        height: 10
}
    this.textInput = new PIXI.Input(options, 1);
    this.textInput.x = Main.SCREEN_WIDTH / 2 - 0.5 * Main.SCREEN_WIDTH * 0.9 -10;
    this.textInput.y = Main.SCREEN_HEIGHT / 2;
    this.addChild(this.textInput);
    this.textInput.focus();

    this.nextButton = new ClickButton(Main.SCREEN_HEIGHT - 30, this.buttonText, this.buttonClicked.bind(this, this.nextScreenToGoTo), Main.SCREEN_WIDTH - 210, 0.65);
    this.addChild(this.nextButton);
}

FreeTextScreen.prototype.createScreenText = function (text)
{
    var instructions = new PIXI.Text(text, { align: "center", font: "26px Arial", fill: "#FFFFFF" });
    instructions.anchor = new PIXI.Point(0.5, 0.5);
    instructions.x = Math.round(Main.SCREEN_WIDTH / 2,0) ;
    instructions.y = Math.round(Main.SCREEN_HEIGHT / 2 - 100,0);
    this.addChild(instructions);
}

FreeTextScreen.prototype.buttonClicked = function (nextScreenToGoTo)
{
    this.db.saveQuestionnaireResultToDb(this.session, this.questionnaireTitle, this.shortQuestion, this.textInput.value);
    this.moveToScreen = nextScreenToGoTo;
}
