Map.prototype = Object.create(View.prototype);

function Map(_session, _condition)
{
    View.call(this);
    this.condition = _condition;
}

Map.prototype.create = function (stage, db, session)
{
    this.createBasic(stage, db, session);
    this.createHistory();
}

Map.prototype.createHistory = function ()
{
    var mapImage = new PIXI.Sprite.fromImage("../resources/theme/themeMisc/Map.png");
    this.addChild(mapImage);

    var progressLine = new PIXI.Sprite.fromImage("../resources/theme/themeMisc/progressLine" + (this.session.levelNum) + ".png");
    this.addChild(progressLine);

    var backButton = new ClickButton(Main.SCREEN_HEIGHT - 15, "Main Menu", this.buttonClicked.bind(this, "LOGIN"), Main.SCREEN_WIDTH - 170, 0.5);
    this.addChild(backButton);

    this.createInstructionText();

    this.createMapRolloverZones();
}

Map.prototype.createMapRolloverZones = function ()
{
    var self = this;
    this.dataArray = [];
    this.db.getSessionSummaries(this.session.id, function (summaries)
    {
        summaries.sort(compareSeshNums);
        for (var i = 0; i < summaries.length; i++)
        {
            var session = summaries[i];
            self.dataArray.push({
                "Location": session.levelName,
                "Session_Date": session.date,
                "Reaction_Time": session.medianRT,
                "Sorting_Accuracy": session.goAccuracy,
                "Stopping_Time": session.SSRT,
                "Stop_Accuracy": session.stopAccuracy
            });
        }
        switch (summaries.length)
        {
            case 10:self.createIndivRolloverZone(865, 24, 100, 150, "International Space Station", 9);
            case 9: self.createIndivRolloverZone(615, 90, 140, 100, "Tokyo Central", 8);
            case 8: self.createIndivRolloverZone(300, 50, 160, 150, "Nepal Monastary", 7);
            case 7: self.createIndivRolloverZone(90, 75, 120, 75, "Moroccan Market", 6);
            case 6: self.createIndivRolloverZone(130, 280, 120, 90, "Hawaii Beach Bar", 5);
            case 5: self.createIndivRolloverZone(465, 240, 140, 110, "Chalet Swiss", 4);
            case 4: self.createIndivRolloverZone(700, 250, 120, 150, "Red Square", 3);
            case 3: self.createIndivRolloverZone(748, 490, 150, 170, "The Dockyard", 2);
            case 2: self.createIndivRolloverZone(340, 370, 130, 150, "City of Lights", 1);
            case 1: self.createIndivRolloverZone(120, 490, 120, 150, "Packville Factory", 0);
        default: break;
        }
    });
    
}

Map.prototype.createIndivRolloverZone =function(xPos, yPos, _width, _height, name, dataArrayIndex)
{
    var markout = new PIXI.Sprite.fromImage("../resources/interface/transparent.png");
    markout.width = _width;
    markout.height = _height;
    markout.x = xPos;
    markout.alpha = 0.7;
    markout.y = yPos;
    markout.interactive = true;
    
    if (name === "The Dockyard" || name === "Red Square" || name === "International Space Station")
        markout.mouseover = this.displayRollover.bind(this, xPos, yPos, name, dataArrayIndex, 1);
    else
        markout.mouseover = this.displayRollover.bind(this, xPos + _width, yPos, name, dataArrayIndex, 0);
    
    markout.mouseout = this.clearRollover.bind(this);
    this.addChild(markout);
}

Map.prototype.displayRollover = function (xPos, yPos, name, dataArrayIndex, invert)
{
    var sessionData = this.dataArray[dataArrayIndex];
    var text = "<h>Location:</h><b>  "            + name                          + "</b>\n" +
                "<h>Session Date:</h><b>  " + sessionData.Session_Date + "</b>\n" +
                "<h>Reaction Time:</h><b>  " + sessionData.Reaction_Time + "ms</b>\n" +
                "<h>Sorting Accuracy:</h><b>  " + sessionData.Sorting_Accuracy + "%</b>\n" +
                "<h>Stopping Time:</h><b>  " + sessionData.Stopping_Time + "ms</b>\n" +
                "<h>Stop Accuracy:</h><b>  " + sessionData.Stop_Accuracy + "%</b>\n";


    this.rolloverText = new PIXI.MultiStyleText(text, { h: { align: "left", font: "24px Arial", fill: "#ffc000" }, b: { align: "left", font: "20px Arial", fill: "#000000" } });

    if (invert)
        xPos = xPos - this.rolloverText.width - 30;

    this.rolloverText.x = xPos + 15;
    this.rolloverText.y = yPos + 15;

    this.rolloverBox = new PIXI.Graphics();
    this.rolloverBox.lineStyle(4, 0x000000);
    this.rolloverBox.beginFill(0xffffff);
    this.rolloverBox.drawRoundedRect(xPos, yPos, this.rolloverText.width + 30, this.rolloverText.height -20, 20);

    this.addChild(this.rolloverBox);
    this.addChild(this.rolloverText);
}

Map.prototype.clearRollover = function ()
{
    this.removeChild(this.rolloverBox);
    this.removeChild(this.rolloverText);
}

Map.prototype.createInstructionText = function ()
{
    var instructions = new PIXI.Text("Rollover the image for more details",
                                    { align: "left", font: "25px Arial", fill: "#000000" });
    instructions.x = Main.SCREEN_WIDTH/2 -60;
    instructions.y = Main.SCREEN_HEIGHT - 55;

    this.addChild(instructions);
}