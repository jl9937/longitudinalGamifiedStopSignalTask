//This is the login screen. Handles the creation of the login interface and the login process itself.

MainMenu.prototype = Object.create(View.prototype);

function MainMenu(_session)
{
    View.call(this);
    this.session = _session;
    this.condition = this.session.condition;
}

MainMenu.prototype.create = function (stage, db, session)
{
    this.createBasic(stage, db, session);

    if (this.session.condition === Main.CONDITION_THEME)
    {
        this.backgroundFile = "themeLoginBackground.jpg";
        this.createBackground();
    }
    else if (this.session.condition === Main.CONDITION_POINTS)
    {
        this.backgroundFile = "pointsbackground.png";
        this.createBackground();
    }
    this.createBottomBar();
    this.createMainMenu();
    this.displayed = true;
    if (this.condition === Main.CONDITION_POINTS)
        this.createPointsDetails();
}

MainMenu.prototype.createPointsDetails = function()
{
    var instructions = new PIXI.Text("How well can you control your actions?", { align: "center", font: "20px Verdana", fill: "#FFFFFF", stroke: "#000000", strokeThickness: 3, mitrelimit: 20 });
    instructions.anchor = new PIXI.Point(0.5, 0);
    instructions.x = Main.SCREEN_WIDTH / 2;
    instructions.y = 140;
    this.addChild(instructions);

    this.balls = [];
    this.createBallLoop(0);
}

MainMenu.prototype.createBallLoop = function(slot)
{
    if (this.displayed === true)
    {
    
    var ball = new FallingBall(this);
    this.addChildAt(ball, 4);
    this.balls[slot] = ball;

    var timeout = Math.floor(Math.random() * 4000) + 800;
    setTimeout(this.createBallLoop.bind(this, (slot + 1 % 8)), timeout);
    }
}
MainMenu.prototype.mainLoop = function ()
{
    if (this.condition === Main.CONDITION_POINTS)
    {
        for(var i=0 ;i<this.balls.length; i++)
            this.balls[i].update();
    }
}

MainMenu.prototype.createBottomBar = function ()
{
    var sprite = new PIXI.Sprite.fromImage("../resources/interface/bottombar.png");
    sprite.x = 0;
    sprite.y = 689;
    this.addChild(sprite);
}

MainMenu.prototype.createMainMenu = function ()
{
    this.createTitleText();
    this.createUserDataText(Main.SCREEN_HEIGHT / 2 - 118);

    if (this.session.levelNum === 0)
        var startButton = new ClickButton(Main.SCREEN_HEIGHT / 2 + 20, this.startButtonText, this.buttonClicked.bind(this, "CONSENT"));
    else if(this.session.condition === Main.CONDITION_THEME && this.session.levelNum > 0)
        var startButton = new ClickButton(Main.SCREEN_HEIGHT / 2 + 20, this.startButtonText, this.buttonClicked.bind(this, "INSTRUCTIONS2"));
    else
        var startButton = new ClickButton(Main.SCREEN_HEIGHT / 2 + 20, this.startButtonText, this.buttonClicked.bind(this, "INSTRUCTIONS1"));

    var historyButton = new ClickButton(Main.SCREEN_HEIGHT / 2 + 160, this.historyButtonText, this.buttonClicked.bind(this, "HISTORYMAP"));
    


    this.addChild(startButton);
    this.addChild(historyButton);


    var self = this;
    this.db.getParticipantDetails(this.session.id, function (details)
    {
        if (dateIsToday(details.lastSessionCompleted))
                startButton.disable();
        });
}

MainMenu.prototype.createUserDataText = function (y)
{
    var self = this;
    this.db.getParticipantDetails(this.session.id, function (details)
        {
            var text = "User ID: " + self.session.id + "\nSessions Completed: " + details.sessionsCompleted + "\nReimbursement due: £" + details.moneyEarned.toFixed(2);
            if (details.freeze === true)
                text = "It has been " + Main.STUDYLENGTH + " days since you registered for this study. Your part in the study is now finished.\nYou will be paid shortly for all completed sessions.\nIf not, please contact jim.lumsden@bristol.ac.uk";
            if (details.sessionsCompleted === 0)
                text = text + "\n\nWelcome to the study. Please\npress Start in order to read\ninstructions and begin";
        if (dateIsToday(details.lastSessionCompleted))
                text = text + "\n\nToday's session completed";
            
            var dataText = new PIXI.Text(text, { align: "center", font: "17px Arial", fill: "#FFFFFF" });
            dataText.x = Main.SCREEN_WIDTH / 2;
            dataText.anchor = new PIXI.Point(0.5, 0);
            dataText.y = Math.round(y - (dataText.height/2));
            self.addChild(dataText);
        });
}

MainMenu.prototype.createTitleText = function ()
{
    var instructions = new PIXI.Text(this.titleText, { align: "center", font: "100px Verdana", fill: "#ffc000", stroke: "#000000", strokeThickness: 8, mitrelimit: 20});
    instructions.anchor = new PIXI.Point(0.5, 0);
    instructions.x = Main.SCREEN_WIDTH / 2;
    instructions.y = 20;
    this.addChild(instructions);
}

function dateIsToday(date)
{
    if (date !== "" && date !== null && date !== undefined)
    {
        var dateObject = Date.parseExact(date, "dd-MM-yyyy").clearTime();
        var today = Date.now().clearTime();
        if (dateObject.equals(today))
            return true;
    }
    return false;
}
