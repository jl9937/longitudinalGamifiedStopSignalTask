VASScreen.prototype = Object.create(View.prototype);

//Generic VAS Screen: takes a question and two scale ends and generates a VAS response
function VASScreen(_session, _questionnaireTitle, _question, _shortQuestion, _lowend, _highend, _nextScreenToGoTo)
{
    View.call(this);
    this.questionnaireTitle = _questionnaireTitle;
    this.session = _session;
    this.question = _question;
    this.shortQuestion = _shortQuestion;
    this.lowend = _lowend;
    this.highend = _highend;
    this.buttonText = "Next";
    this.nextScreenToGoTo = _nextScreenToGoTo || "";
}

VASScreen.prototype.create = function (stage, db, session)
{
    this.createBasic(stage, db, session);
    this.createScreenText(this.question);
    this.vas = new VAS(Main.SCREEN_HEIGHT / 2, Main.SCREEN_WIDTH / 2, this.lowend, this.highend, this.showButton.bind(this));
    this.addChild(this.vas);
}

VASScreen.prototype.createScreenText = function (text)
{
    var instructions = new PIXI.Text(text, { align: "center", font: "30px Arial", fill: "#FFFFFF"});
    instructions.anchor = new PIXI.Point(0.5, 0.5);
    instructions.x = Main.SCREEN_WIDTH / 2;
    instructions.y = Main.SCREEN_HEIGHT / 2 - 300;
    this.addChild(instructions);
}

VASScreen.prototype.showButton = function ()
{
    this.nextButton = new ClickButton(Main.SCREEN_HEIGHT - 30, this.buttonText, this.buttonClicked.bind(this, this.nextScreenToGoTo), Main.SCREEN_WIDTH - 210, 0.65);
    this.addChild(this.nextButton);
}

VASScreen.prototype.buttonClicked = function (nextScreenToGoTo)
{
    this.db.saveQuestionnaireResultToDb(this.session, this.questionnaireTitle, this.shortQuestion, this.vas.mark);
    this.moveToScreen = nextScreenToGoTo;
}
