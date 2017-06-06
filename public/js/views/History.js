History.prototype = Object.create(View.prototype);

function History(_session, _condition)
{
    View.call(this);
    this.condition = _condition;
}

History.prototype.create = function (stage, db, session)
{
    this.createBasic(stage, db, session);
    this.createHistory();
}

History.prototype.createHistory = function ()
{
    var backButton = new ClickButton(Main.SCREEN_HEIGHT - 30, "Main Menu", this.buttonClicked.bind(this, "LOGIN"), Main.SCREEN_WIDTH - 210, 0.65);
    this.addChild(backButton);

    this.createTitleText();

    var tableStartX = 50;
    var tableStarty = 140;
    var columnLeftEdges = [tableStartX, tableStartX + 135, tableStartX + 315, tableStartX + 440, tableStartX + 565, tableStartX + 755, tableStartX + 920];

    

    if (this.session.condition === Main.CONDITION_POINTS)
    {
        tableStartX = 20;
        columnLeftEdges = [tableStartX, tableStartX + 115, tableStartX + 285, tableStartX + 385, tableStartX + 495, tableStartX + 660, tableStartX + 820, tableStartX + 980];
    }
        
    this.createHistoryHeaders(columnLeftEdges);
    this.createHistoryText(columnLeftEdges, tableStarty);
    
}

History.prototype.createHistoryHeaders = function (columnLeftEdges)
{
    this.rolloverText = new PIXI.Text("Hover over a column heading for more info", { align: "Left", font: "20px Arial", fill: "#FFFFFF" });
    this.rolloverText.x = 20;
    this.rolloverText.y = Main.SCREEN_HEIGHT - 100;
    this.addChild(this.rolloverText);
    
    this.createIndivHistoryHeader("Session#", columnLeftEdges[0], columnLeftEdges[1], "The Session Number column indicates the\nnumber of sessions you have completed");
    this.createIndivHistoryHeader("Session Date", columnLeftEdges[1], columnLeftEdges[2], "The Session Date column shows the dates on\nwhich you have completed a test session");
    this.createIndivHistoryHeader("RT", columnLeftEdges[2], columnLeftEdges[3], "The Reaction Time column shows the average time, in milliseconds, which it took\nyou to respond to the circles appearing in each session. A lower reaction time\nis better, though humans rarely get below 250. ");
    this.createIndivHistoryHeader("SSRT", columnLeftEdges[3], columnLeftEdges[4], "The Stop Signal Reaction Time column shows the average time, in milliseconds,\nwhich you took to stop yourself from responding to stimuli in each session.\nIn other words, if you have this much warning then you should be able to\nstop yourself 50% of the time");
    this.createIndivHistoryHeader("Stop Accuracy", columnLeftEdges[4], columnLeftEdges[5], "The Stop Accuracy column shows the percentage of stop trials which you\nsuccessfully managed to not respond to in each session. Don't worry if it seems low,\nthe task is designed to get harder as you get better at stopping!");
    this.createIndivHistoryHeader("Go Accuracy", columnLeftEdges[5], columnLeftEdges[6], "The Go Accuracy column shows the percentage of trials on which you\nsuccessfully sorted the balls to the matching coloured zone.");

    if (this.session.condition === Main.CONDITION_POINTS)
        this.createIndivHistoryHeader("Score", columnLeftEdges[6], columnLeftEdges[7], "The Score column shows your score on each session.\nAre you getting better over time? Can YOU be the Stopmaster?");

}

History.prototype.createIndivHistoryHeader = function (text, x, columnEndX, rolloverText)
{
    var tableheader = new PIXI.Text(text, { align: "Left", font: "22px Arial", fill: "#ffc000", stroke: "#000000", strokeThickness: 2 });
    tableheader.x = x + Math.round((columnEndX - x - tableheader.width) / 2, 0);
    tableheader.y = 140;
    tableheader.interactive = true;
    tableheader.mouseover = this.displayRolloverText.bind(this, rolloverText);
    tableheader.mouseout = this.clearRolloverText.bind(this);
    this.addChild(tableheader);
}

History.prototype.createHistoryText = function (columnLeftEdges, tableStarty)
{
    var self = this;
    var yStart = 190;
    this.db.getSessionSummaries(this.session.id, function(summaries)
    {
        summaries.sort(compareSeshNums);
        for (var i = 0; i < summaries.length; i++)
        {
            var session = summaries[i];
            var sessionID = i + 1;
            self.createCellText(sessionID, columnLeftEdges[0], yStart + i * 30, self, columnLeftEdges[1]);
            self.createCellText(session.date, columnLeftEdges[1], yStart + i * 30, self, columnLeftEdges[2]);
            self.createCellText(session.medianRT + "ms", columnLeftEdges[2], yStart + i * 30, self, columnLeftEdges[3]);
            self.createCellText(session.SSRT + "ms", columnLeftEdges[3], yStart + i * 30, self, columnLeftEdges[4]);
            self.createCellText(session.stopAccuracy + "%", columnLeftEdges[4], yStart + i * 30, self, columnLeftEdges[5]);
            self.createCellText(session.goAccuracy + "%", columnLeftEdges[5], yStart + i * 30, self, columnLeftEdges[6]);
            if (self.session.condition === Main.CONDITION_POINTS)
                self.createCellText(session.score, columnLeftEdges[6], yStart + i * 30, self, columnLeftEdges[7]);
        }
        self.createBorders(columnLeftEdges, tableStarty, summaries.length);
    });
}

History.prototype.createCellText = function(text, x, y, self, columnEndX)
{
    var historyText = new PIXI.Text(text, { align: "center", font: "26px Arial", fill: "#FFFFFF" });
    historyText.x = x + Math.round((columnEndX  - x - historyText.width) / 2, 0);
    historyText.y = y;
    self.addChild(historyText);


}

History.prototype.createBorders = function (columnLeftEdges, tableStarty, rows)
{
    var borders = new PIXI.Graphics();
    borders.lineStyle(0, 0x000000);
    borders.beginFill(0xffc000);
    for (var i = 1; i < columnLeftEdges.length-1; i++)
        borders.drawRect(columnLeftEdges[i], tableStarty, 3, (33+ (rows * 40)));
    borders.drawRect(columnLeftEdges[0], tableStarty + 30, (columnLeftEdges[columnLeftEdges.length - 1] - columnLeftEdges[0]), 3);
    this.addChild(borders);
}

History.prototype.displayRolloverText = function (text)
{
    this.rolloverText.text = text;
}

History.prototype.clearRolloverText = function (textObject)
{
    this.rolloverText.text = "Hover over a column heading for more info";
}

function compareSeshNums(a, b)
{
    return a.sessionNum - b.sessionNum;
}

History.prototype.createTitleText = function ()
{
    var instructions = new PIXI.Text("Your History",
                                    { align: "center", font: "60px Verdana", fill: "#ffc000", stroke: "#000000", strokeThickness: 8 });
    instructions.anchor = new PIXI.Point(0.5, 0)
    instructions.x = Main.SCREEN_WIDTH / 2;
    instructions.y = 20;

    this.addChild(instructions);
}