ComboBoxScreen.prototype = Object.create(View.prototype);

//Generic VAS Screen: takes a question and two scale ends and generates a VAS response
function ComboBoxScreen(_session, _questionnaireTitle, _question, _shortQuestion, _valueArray, _nextScreenToGoTo)
{
    View.call(this);
    this.session = _session;
    this.questionnaireTitle = _questionnaireTitle;
    this.question = _question;
    this.shortQuestion = _shortQuestion;
    this.valueArray = _valueArray;
    this.buttonText = "Next";
    this.nextScreenToGoTo = _nextScreenToGoTo || "";
}

ComboBoxScreen.prototype.create = function (stage, db, session)
{
    this.createBasic(stage, db, session);
    this.createScreenText(this.question);
    var scroll = this.valueArray.length > 4 ? true : false;
    this.chooser = new Chooser(Main.SCREEN_HEIGHT / 2, Main.SCREEN_WIDTH / 2, this.valueArray, scroll, this.showButton.bind(this));
    this.addChild(this.chooser);
}

ComboBoxScreen.prototype.createScreenText = function (text)
{
    var instructions = new PIXI.Text(text, { align: "center", font: "30px Arial", fill: "#FFFFFF"});
    instructions.anchor = new PIXI.Point(0.5, 0.5);
    instructions.x = Main.SCREEN_WIDTH / 2;
    instructions.y = Main.SCREEN_HEIGHT / 2 - 300;
    this.addChild(instructions);
}

ComboBoxScreen.prototype.showButton =function()
{
    this.nextButton = new ClickButton(Main.SCREEN_HEIGHT - 30, this.buttonText, this.buttonClicked.bind(this, this.nextScreenToGoTo), Main.SCREEN_WIDTH - 210, 0.65);
    this.addChild(this.nextButton);
}


ComboBoxScreen.prototype.buttonClicked = function (nextScreenToGoTo)
{
    this.db.saveQuestionnaireResultToDb(this.session, this.questionnaireTitle, this.shortQuestion, this.valueArray[this.chooser.value]);
    document.removeEventListener("mousewheel", this.chooser.mousewheelEventListener);
    this.moveToScreen = nextScreenToGoTo;
}
