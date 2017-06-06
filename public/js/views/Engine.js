Engine.LOWITI = 500;
Engine.HIGHITI = 1000;

Engine.FIXATION = 500;
Engine.STIMULI_DUR = 900;
Engine.BLOCKS = 5;
Engine.SUBBLOCKS = 3;
Engine.BREAKLENGTH = 10;
Engine.BONUSSTREAK = 3;
Engine.SCORETEXTY = Main.SCREEN_HEIGHT / 2 + 200;


Engine.TRIALLIMIT = 1000;
Engine.ALLSTOP = 0;

//These two arrays stop the level specific values for animation in the Theme condition
                           //1      2       3       4       5       6       7       8       9       10
Engine.THEME_YCUTOFFS = [   230,   310,    240,    290,    310,    330,    310,    315,    330,    350];
Engine.THEME_XVELOCITY = [  12.5,  13,     12.5,   12.5,   14.5,   13.5,   14,     13,     13.5,   13.3];
Engine.THEME_yADJUSTMENT = [10,    -30,    5,      -35,    10,     -10,    0,      -16,      -10,     0];

/////////////////////////////////////Required////////////////////////////////////////
Engine.prototype = Object.create(View.prototype);
function Engine(_condition)
{
    View.call(this);
    this.condition = _condition;
}
Engine.prototype.create = function(stage, db, session)
{
    this.createBasic(stage, db, session);
    this.setup();
    //console.log(this.session.levelNum);
}

//bug sorting animation sometimes doesn't render on chrome Version 50.0.2661.86 (64-bit) (non-game mode)
//bug check with hardware acceleration off and on on chrome

Engine.prototype.mainLoop = function (speedfactor)
{
    if (this.stimulusSprite !== undefined)
    {
        this.stimulusSprite.x += this.stimulusSprite.vx * speedfactor;
        this.stimulusSprite.y += this.stimulusSprite.vy * speedfactor;

        this.stimulusSprite.alpha += this.stimulusSprite.valpha * speedfactor;
        this.stimulusSprite.vy += this.stimulusSprite.gravity * speedfactor;

        //check for a position then activate rapid fadeout
        if(this.stimulusSprite.x < 280 || this.stimulusSprite.x > Main.SCREEN_WIDTH - 280)
            this.stimulusSprite.valpha = -0.08;
        if (this.stimulusSprite.y > Main.SCREEN_HEIGHT - Engine.THEME_YCUTOFFS[this.session.levelNum])
            this.stimulusSprite.alpha = 0;

    }

    if (this.condition === Main.CONDITION_POINTS)
    {
        if (this.bonusGlow !== null)
        {
            this.bonusGlow.alpha += this.bonusGlow.va;
            if (this.bonusGlow.alpha >= this.bonusGlow.alphaLimit)
                this.bonusGlow.alpha = this.bonusGlow.alphaLimit;
        }
        if (this.bonusGlowRefresh !== null)
        {
            this.bonusGlowRefresh.alpha += this.bonusGlowRefresh.va;
            if (this.bonusGlowRefresh.alpha > 1)
            {
                this.bonusGlowRefresh.alpha = 1;
                this.bonusGlowRefresh.va = -0.05;
            }
        }
        if (this.bonusGlowReset !== null && this.bonusGlowReset!== undefined)
        {
            this.bonusGlowReset.alpha += this.bonusGlowReset.va;
            if (this.bonusGlowReset.alpha > 0.8)
            {
                this.bonusGlowReset.alpha =0.8;
                this.bonusGlowReset.va = -0.01;
            }
        }
    }
}
/////////////////////////////////////////////////////////////////////////////////

Engine.prototype.setup = function ()
{
    this.overallTrialNum = 0;
    this.blockNum = 0;
    this.staircases = [new Staircase(150, 0.25), new Staircase(250, 0.5), new Staircase(350, 0.5), new Staircase(400, 0.75)];
    
    this.zones = new PIXI.Sprite.fromImage("../resources/taskElements/zones.png");
    this.bluePath = "../resources/taskElements/blue.png";
    this.yellowPath = "../resources/taskElements/yellow.png";

    this.progress = new PIXI.Sprite.fromImage("../resources/interface/markout.png");
    this.progress.y = 5;
    this.progress.height = 5;


    if (this.condition === Main.CONDITION_POINTS)
    {
        this.Phighscore = 0;
        this.Pscore = 0;
        this.Pbonus = 1;
        this.bonusCounter = 0;
        this.bonusAlphaStep = 1 / Engine.BONUSSTREAK;
        this.bonusGlowRefresh = null;

        this.bonusGlow = new PIXI.Sprite.fromImage("../resources/taskElements/bonusGlow.png");
        this.bonusGlow.anchor = new PIXI.Point(0.5, 0.5);
        this.bonusGlow.x = Main.SCREEN_WIDTH / 2;
        this.bonusGlow.y = Engine.SCORETEXTY + 45;
        this.bonusGlow.alpha = 0;
        this.bonusGlow.alphaLimit = 0;
        this.bonusGlow.va = 0.01;
        this.addChild(this.bonusGlow);
    }
    else if (this.condition === Main.CONDITION_THEME)
    {
        this.zones = new PIXI.Sprite.fromImage(Main.themeAssets[0]);
        this.overlayer = new PIXI.Sprite.fromImage("../resources/theme/themeMisc/overlayer.png");
        this.bluePath = Main.themeAssets[1];
        this.yellowPath = Main.themeAssets[2];
    }

    this.currentSubBlockSumRT = 0;
    this.baseSubBlockAverageRT = 1000;

    this.createBlock(1);
}

Engine.prototype.createBlock = function(first)
{
    this.addChild(this.zones);
    if (this.condition === Main.CONDITION_THEME)
        this.addChild(this.overlayer);
    else if (this.condition === Main.CONDITION_POINTS)
    {
        this.createPointsText();
    }
    this.addChild(this.progress);

    this.blockTrialNum = 0;
    this.trialArray = getTrialsForBlock(first);
    this.runBlock();
}

Engine.prototype.runBlock = function()
{
    if (this.blockTrialNum < Engine.TRIALLIMIT && this.blockTrialNum < this.trialArray.length)
        this.startTrial(this.trialArray[this.blockTrialNum]);
    else
    {
        //console.log("block complete");
        this.blockNum++;
        if (this.blockNum === Engine.BLOCKS)
        {
            //console.log("Task complete");
            if (this.condition === Main.CONDITION_POINTS)
                this.session.score = this.Pscore;
            this.session.endOfSession();
            this.moveToScreen = "POSTTASK";
        }
        else
            this.displayBreak();
    }
}

Engine.prototype.startTrial = function(trialType)
{
    //Subblock shift
    if (this.overallTrialNum % 16 === 15)
    {
        var currentAVRT = this.currentSubBlockSumRT / 16;
        console.log("Current Av:", currentAVRT, "Limit:", this.baseSubBlockAverageRT + 30, "Lastsubblock:", this.baseSubBlockAverageRT);
        if (currentAVRT >= this.baseSubBlockAverageRT + 30)
        {
            if(this.session.CONDITION_THEME)
                this.showTextForTimeThenClear("Don't drop the pace Commander!", 3000, 130);
            else
                this.showTextForTimeThenClear("Keep sorting as fast as you can!", 3000, 130);
        }
        this.baseSubBlockAverageRT = currentAVRT;
        this.currentSubBlockSumRT = 0;
    }
    
    //////////////Set up trial//////////////
    var stopTrial = 0;
    var SSD = -1;
    if (trialType[0] === "s")
    {
        stopTrial = 1;
        SSD = this.staircases[trialType[2]].getSSD();
    }
    var stimulus = trialType[1] === "Y" ? this.yellowPath : this.bluePath;
    var colour = trialType[1];
    var ITIDuration = Math.floor(Math.random() * (Engine.HIGHITI - Engine.LOWITI)) + Engine.LOWITI;
       
    var trialObject = new Trial(this.session.id, this.overallTrialNum, this.blockTrialNum, this.blockNum, colour, stimulus, stopTrial, SSD, trialType[2], ITIDuration);
    ////////////////////////////////////////
    var yAdjustment = 0;
    if (this.condition === Main.CONDITION_THEME)
        yAdjustment = Engine.THEME_yADJUSTMENT[this.session.levelNum];
    this.showForTimeThenCallback("../resources/taskElements/fixation.png", Engine.FIXATION, this.openResponseWindow.bind(this, trialObject, yAdjustment), yAdjustment);
}

Engine.prototype.openResponseWindow = function (trialObject, yAdjustment)
{
    trialObject.responseWindowOpen = true;
    trialObject.RTTimingStart = +Date.now();
    var stimulusSprite = this.stimulusSprite = this.showForTimeThenCallback(trialObject.stimulusPath, Engine.STIMULI_DUR, this.closeResponseWindow.bind(this, trialObject), yAdjustment); //stimulus displayed here

    var left = keyboard(37);
    var right = keyboard(39);
    var processResponse = this.processResponse.bind(this);
    var self = this;
    left.press = function ()
    {
        deleteKeyboards([left, right]);
        if (processResponse(trialObject, "Y"))
            self.startAnimate(stimulusSprite, -1); //the parameter indicates direction
    };
    right.press = function ()
    {
        deleteKeyboards([left, right]);
        if(processResponse(trialObject, "B"))
            self.startAnimate(stimulusSprite, 1);
    };
    if (trialObject.stopTrial === 1)
        doTimer(trialObject.SSD, this.showForTimeThenCallback.bind(this, "../resources/taskElements/stopsignal.png", (Engine.STIMULI_DUR - trialObject.SSD), null, yAdjustment, trialObject));
}

Engine.prototype.startAnimate = function (stimulusSprite, direction)
{
    if(this.session.condition !== Main.CONDITION_THEME)
        stimulusSprite.vx = direction * 25;
    else
    {
        stimulusSprite.gravity = 1.5;
        stimulusSprite.vx = direction * Engine.THEME_XVELOCITY[this.session.levelNum];
        stimulusSprite.vy = -17;
    }
}

Engine.prototype.closeResponseWindow = function (trialObject)
{
    if (trialObject.responseTime === -1)
        this.processResponse(trialObject, "none");

    if (this.condition === Main.CONDITION_POINTS)
        this.calculatePointsAndUpdatePointsText(trialObject);

    trialObject.saveToDB(this.db, this.session);
    this.showForTimeThenCallback("../resources/taskElements/transparent.png", trialObject.ITIDuration, this.finishTrial.bind(this, trialObject));
}

Engine.prototype.processResponse = function (trialObject, keypressed)
{
    if (trialObject.responseWindowOpen === false)
    {
        //console.log("response window not open?");
        return false;
    }

    var correct = false;

    if (keypressed !== "none")
    {
        var datenow = +Date.now();
        var RT = datenow - trialObject.RTTimingStart;
        this.currentSubBlockSumRT += RT;
    }
    //console.log(keypressed + ": RT: " + datenow + "-" + trialObject.RTTimingStart + "=" + RT + "  S:" + trialObject.stopTrial);

    if (trialObject.stopTrial === 1)
    {
        if (keypressed === "none")
        {
            correct = true;
        } else
        {
            //this should only be set before the brackets appear
            if (trialObject.hiddenStopTrial === 0 )
                trialObject.hiddenStopTrial = -1;
        }
        this.staircases[(trialObject.staircase)].adjust(correct);
    }
    else if (trialObject.stopTrial !== 1 && trialObject.colour === keypressed)
    {
        correct = true;
    }
    
    trialObject.setResponse(keypressed, RT, correct);
    trialObject.responseWindowOpen = false;

    return true;
}

Engine.prototype.finishTrial = function (trialObject)
{
    this.overallTrialNum++;
    this.blockTrialNum++;

    this.progress.width = (Main.SCREEN_WIDTH / (Engine.BLOCKS * Engine.SUBBLOCKS * 16)) * this.overallTrialNum;
    this.runBlock();
}

Engine.prototype.displayBreak = function ()
{
    var darkener = "";
    this.removeChild(this.progress);
    if (this.condition !== Main.CONDITION_THEME)
        this.removeChild(this.zones);
    else
    {
        darkener = new PIXI.Sprite.fromImage("../resources/interface/themeDarkener.png");
        this.addChild(darkener);
    }
    this.removePointsText();
    var time = Engine.BREAKLENGTH;

    

    var breakTextString = "";
    switch(this.session.condition)
    {
        case Main.CONDITION_NONGAME:
            breakTextString = "Block completed:\n\nContinue responding as fast as you can\n\nThe task will continue\nin ";
            break;
        case Main.CONDITION_POINTS:
            breakTextString = "Round completed:\n\nContinue responding as fast as you can\nRemember, sort three balls correctly in a\nrow to grow your multiplier bonus!\n\nThe game will continue\nin ";
            break;
        case Main.CONDITION_THEME:
            breakTextString = "Round completed:\n\nContinue sorting as fast as you can\n\nThe game will continue\nin ";
            break;
    }
    var breakText = new PIXI.Text(breakTextString + time + " seconds",
                                   { align: "center", font: "30px Arial", fill: "#FFFFFF" });
    breakText.x = Main.SCREEN_WIDTH / 2;
    breakText.y = Main.SCREEN_HEIGHT / 2;
    breakText.anchor = new PIXI.Point(0.5, 0.5);
    this.addChild(breakText);


    doTimer(1000, updateBreaktext.bind(this, breakText, 9));
    function updateBreaktext(text, time)
    {
        if (time !== -1)
        {
            breakText.text = breakTextString + time + " seconds";
            doTimer(1000, updateBreaktext.bind(this, breakText, time - 1));
        } else
        {
            this.removeChild(breakText);
            if (darkener != "")
                this.removeChild(darkener);
            this.createBlock();
        }
    }
}

//////////////////////////////////////////////////Points Functions//////////////////////////////////////////////////////////
Engine.prototype.createPointsText = function ()
{
    var highscoretext = new PIXI.Text("High Score: " + this.Phighscore, { align: "right", font: "bold 35px Arial", fill: "#FFFFFF" });
    highscoretext.anchor = new PIXI.Point(1, 0);
    highscoretext.x = Main.SCREEN_WIDTH - 10;
    highscoretext.y = 10;
    this.PhighscoreText = highscoretext;

    var self = this;
    this.db.getHighScore(this.session.id, function(highscorefromDB)
    {
        self.PhighscoreText.text = "High Score: " + highscorefromDB;
        self.Phighscore = highscorefromDB;
        self.addChild(highscoretext);
    });


    var scoretext = new PIXI.Text("Score: " + this.Pscore, { align: "center", font: "bold 60px Arial", fill: "#e3a400" });
    scoretext.anchor = new PIXI.Point(0.5, 0.5);
    scoretext.x = Main.SCREEN_WIDTH / 2;
    scoretext.y = Engine.SCORETEXTY - 10;
    this.PscoreText = scoretext;
    this.addChild(scoretext);

    var bonusText = new PIXI.Text("Bonus: x" + this.Pbonus, { align: "center", font: "bold 30px Arial", fill: "#FFFFFF" });
    bonusText.anchor = new PIXI.Point(0.5, 0.5);
    bonusText.x = Main.SCREEN_WIDTH / 2;
    bonusText.y = Engine.SCORETEXTY + 45;
    this.PbonusText = bonusText;
    this.addChild(bonusText);
}

Engine.prototype.calculatePointsAndUpdatePointsText = function (trialObject)
{
    var pointsGained = 0;
    var originalBonusCounter = this.bonusCounter;
    if ((trialObject.correct === true && trialObject.stopTrial !== 1) || trialObject.hiddenStopTrial === -1 && trialObject.response === trialObject.colour)
    {
        pointsGained = this.Pbonus * Math.floor((Engine.STIMULI_DUR - trialObject.responseTime) / 5);
        this.bonusGlow.alpha = this.bonusAlphaStep * this.bonusCounter;
        this.bonusCounter++;
        this.bonusGlow.alphaLimit = this.bonusAlphaStep * this.bonusCounter;
        if (this.bonusCounter >= Engine.BONUSSTREAK)
        {
            //Todo modify bonus strength here
            this.Pbonus = this.Pbonus + 1 ;
            this.playerBonusUpgradeAnimation();
            this.bonusCounter = 0;
        }
        this.showTextForTimeThenClear("+" + pointsGained, Engine.LOWITI,  Main.SCREEN_HEIGHT / 2 - 55);
    }
    if (trialObject.correct === false && trialObject.stopTrial === 1 && trialObject.hiddenStopTrial === 1)
    {
        this.Pbonus = this.Pbonus - 2;
        if (this.Pbonus <= 0)
            this.Pbonus = 1;
        this.playerBonusResetAnimation();
    }
    if (trialObject.correct === false)
        this.bonusCounter = 0;
    
    if (this.bonusCounter === 0)
    {
        this.bonusGlow.alpha = 0;
        this.bonusGlow.alphaLimit = 0;
    }

    this.Pscore += pointsGained;
    if (this.Pscore > this.Phighscore)
    {
        this.Phighscore = this.Pscore;
        this.session.newHighscore = this.Pscore;
    }

    //update all
    this.PbonusText.text = "Bonus: x" + this.Pbonus;
    this.PhighscoreText.text = "High Score: " + this.Phighscore;
    this.PscoreText.text = "Score: " + this.Pscore;

    //save
    trialObject.pointsGained = pointsGained;
    trialObject.bonus = this.Pbonus;
    trialObject.score = this.Pscore;
}

Engine.prototype.removePointsText = function ()
{
    this.removeChild(this.PhighscoreText);
    this.removeChild(this.PbonusText);
    this.removeChild(this.PscoreText);
}

Engine.prototype.playerBonusUpgradeAnimation = function()
{
    var glow = new PIXI.Sprite.fromImage("../resources/taskElements/bonusGlowNew.png");
    glow.anchor = new PIXI.Point(0.5, 0.5);
    glow.x = Main.SCREEN_WIDTH / 2;
    glow.y = Engine.SCORETEXTY + 45;
    glow.alpha = 0.5;
    glow.va = 0.2;
    this.bonusGlowRefresh = glow;
    this.addChildAt(glow, 2);
}

Engine.prototype.playerBonusResetAnimation = function ()
{
    var glow = new PIXI.Sprite.fromImage("../resources/taskElements/bonusGlowReset.png");
    glow.anchor = new PIXI.Point(0.5, 0.5);
    glow.x = Main.SCREEN_WIDTH / 2;
    glow.y = Engine.SCORETEXTY + 45;
    glow.alpha = 0;
    glow.va = 0.1;
    this.bonusGlowReset = glow;
    this.addChild(glow);
}

//////////////////////////////////////////////////Utility Functions/////////////////////////////////////////////////////////
function getTrialsForBlock(first)
{
    first = first || 0;
    var firstsubblockInit = [
    "gB", "gB", "gB", "gB", "gB", "gB", "gB", "gB",
    "gY", "gY", "gY", "gY", "gY", "gY", "gY", "gY"
    ];
    var subblockInit = [
        "gB", "sB1", "gB", "gB", "gB", "sY3", "gB", "gB",
        "gY", "sY0", "gY", "gY", "sB2", "gY", "gY", "gY"
    ];
    var allTrials = [];
    for (var i = 0; i < Engine.SUBBLOCKS; i++)
    {
        var subblockCopy = subblockInit.slice();
        if (first)
            subblockCopy = firstsubblockInit.slice();
        subblockCopy = shuffleArray(subblockCopy);
        subblockCopy = shuffleArray(subblockCopy);
        subblockCopy = shuffleArray(subblockCopy);
        allTrials.push.apply(allTrials, subblockCopy);
        first = 0;
    }
    return allTrials;

    function shuffleArray(array)
    {
        for (var i = 0; i < array.length; i++)
        {
            var swapIndex = i + Math.floor(Math.random() * (array.length - i));
            var temp = array[i];
            array[i] = array[swapIndex];
            array[swapIndex] = temp;
        }
        return array;
    }
}

function doTimer(length, oncomplete)
{
    //Time resolution adjustments
    var resolution = 100;
    length = length - 10;

    var steps = Math.floor((length / 100) * (resolution / 10)),
        speed = Math.floor(length / steps),
        count = 0,
        start = new Date().getTime();

    function instance()
    {
        if (count++ === steps)
        {
            oncomplete(steps, count);
        } else
        {
            var diff = (new Date().getTime() - start) - (count * speed);
            window.setTimeout(instance, (speed - diff));
        }
    }

    window.setTimeout(instance, speed);
}

function keyboard(keyCode)
{
    var key = {};
    key.code = keyCode;
    key.isDown = false;
    key.isUp = true;
    key.press = undefined;
    key.release = undefined;
    //The `downHandler`
    key.downHandler = function (event)
    {
        if (event.keyCode === key.code)
        {
            if (key.isUp && key.press) key.press();
            key.isDown = true;
            key.isUp = false;
            event.preventDefault();
        }
    };
    //The `upHandler`
    key.upHandler = function (event)
    {
        if (event.keyCode === key.code)
        {
            if (key.isDown && key.release) key.release();
            key.isDown = false;
            key.isUp = true;
            event.preventDefault();
        }
    };

    //Attach event listeners
    key.keydownListenerBind = key.downHandler.bind(key);
    window.addEventListener("keydown", key.keydownListenerBind);
    key.keyupListenerBind = key.upHandler.bind(key);
    window.addEventListener("keyup", key.keyupListenerBind);
    return key;
}

function deleteKeyboards(keys)
{
    for (var i = 0; i < keys.length; i++)
    {
        window.removeEventListener("keydown", keys[i].keydownListenerBind);
        window.removeEventListener("keyup", keys[i].keyupListenerBind);
    }
}

//////////////////////////////////////////////////Generic Display Functions/////////////////////////////////////////////////
Engine.prototype.showForTimeThenCallback = function (picture, time, callback, yAdjustment, _trialObject)
{
    var trialObject = _trialObject || null;
    if (trialObject && trialObject.stopTrial === 1 && trialObject.hiddenStopTrial === -1)
    {
        //console.log("stop trial hidden");
        return null;
    }
   
    yAdjustment = yAdjustment || -55;
    var sprite = new PIXI.Sprite.fromImage(picture);
    sprite.anchor = new PIXI.Point(0.5, 0.5);
    sprite.y = Main.SCREEN_HEIGHT / 2 + yAdjustment;
    sprite.x = Main.SCREEN_WIDTH / 2;
    sprite.vx = 0;

    //Theme properties only:
    sprite.vy = 0;
    sprite.gravity = 0;
    sprite.valpha = 0;
    ////////////////////////////////

    this.addChild(sprite);
    doTimer(time, this.clearPicture.bind(this, sprite, callback));

    if (trialObject && trialObject.stopTrial === 1)
    {
        trialObject.hiddenStopTrial = 1;
    }
    return sprite;
}

Engine.prototype.clearPicture = function (sprite, callback)
{
    this.removeChild(sprite);
    typeof callback == "function" ? callback() : true;
}

Engine.prototype.showTextForTimeThenClear = function (text, time, yPos)
{
    var textObject = new PIXI.Text(text, { align: "center", font: "bold 30px Arial", fill: "#FFFFFF" });
    textObject.anchor = new PIXI.Point(0.5, 0.5);
    textObject.x = Main.SCREEN_WIDTH / 2;
    textObject.y = yPos;
    this.addChild(textObject);
    var outer = this;
    doTimer(time, function () { outer.removeChild(textObject) });
}