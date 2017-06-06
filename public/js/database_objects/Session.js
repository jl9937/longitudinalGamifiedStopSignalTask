/// <reference path="../pixi.js-master/bin/pixi.js" />
/// <reference path="*.js" /> 

//Sessio container object. Stores all info on the participant session and also grabs browser/os data
function Session(_id, _condition, _db)
{
    this.id = _id;
    this.sessionNum = "?";
    
    this.date = Date.now().toString("dd-MM-yyyy");
    this.condition = _condition;
    this.duration = -1;
    this.sessionCompleted =false;
    this.browser = getBrowser();
    this.OS = getOS();
    this.db = _db;
    this.newHighscore = -1;

    this.medianRT = -1;
    this.SSRT = -1;
    this.stopAccuracy = -1;
    this.goAccuracy = -1;
    this.levelNum = -1;
    this.dayNum = -1;
    this.levelName = "N/A";
    this.score = -1;

    var self = this;
    this.db.getParticipantDetails(this.id, function (details)
    {
        var dateRegistered = Date.parseExact(details.datetimeRegistered, "dd-MM-yyyy HH:mm:ss");
        var today = Date.now();
        var timeDiff = Math.abs(today.getTime() - dateRegistered.getTime());
        self.dayNum = Math.ceil(timeDiff / (1000 * 3600 * 24));


        if (details.sessionsBegun === undefined)
            self.sessionNum = 1;
        else
            self.sessionNum = details.sessionsBegun + 1;
        self.timeStarted = new Date().getTime();

        self.print();
        self.db.saveSession(self, 0);
    });


}

Session.prototype.print = function ()
{
    //console.log("S: " + this.id, this.sessionNum, this.date, this.condition, this.duration, this.sessionCompleted, this.browser, this.OS);
}

Session.prototype.endOfSession = function()
{
    this.duration = new Date().getTime() - this.timeStarted;
    var self = this;
    this.db.getAllTrialData(this, function(trials)
    {
        var summaries = calculateSummaries(trials);
        //console.log(summaries);
        self.medianRT = summaries.medianRT || 0;
        self.SSRT = summaries.SSRT || 0;
        self.stopAccuracy = summaries.stopAccuracy || 0;
        self.goAccuracy = summaries.goAccuracy || 0;

        self.sessionCompleted = true;
        self.db.updateParticipantData_CompleteSession(self.id);
        self.db.saveSession(self, 1);

        if (self.levelNum === Main.STUDYLENGTH)
        {
            self.db.getParticipantDetails(id,
                function(details)
                {
                    var participantData = {
                        "id": id,
                        "condition": condition || "",
                        "sessionsBegun": details.sessionsBegun || "",
                        "sessionsCompleted": details.sessionsCompleted || "",
                        "moneyEarned": details.moneyEarned || "",
                        "lastSessionCompleted": details.lastSessionCompleted || "",
                        "datetimeRegistered": details.datetimeRegistered,
                        "dateCompleted": Date.now().toString("dd-MM-yyyy HH:mm:ss")
                    }
                    self.db.participantCompleted(id, participantData);
                });
        }
    });
}



////////////////////Functions to detect browser and OS////////////////

function getBrowser()
{
    var nAgt = navigator.userAgent;
    var browserName = navigator.appName;
    var fullVersion = '' + parseFloat(navigator.appVersion);
    var majorVersion = parseInt(navigator.appVersion, 10);
    var nameOffset, verOffset, ix;

    // In Opera 15+, the true version is after "OPR/" 
    if ((verOffset = nAgt.indexOf("OPR/")) !== -1)
    {
        browserName = "Opera";
        fullVersion = nAgt.substring(verOffset + 4);
    }
        // In older Opera, the true version is after "Opera" or after "Version"
    else if ((verOffset = nAgt.indexOf("Opera")) !== -1)
    {
        browserName = "Opera";
        fullVersion = nAgt.substring(verOffset + 6);
        if ((verOffset = nAgt.indexOf("Version")) !== -1)
            fullVersion = nAgt.substring(verOffset + 8);
    }
        // In MSIE, the true version is after "MSIE" in userAgent
    else if ((verOffset = nAgt.indexOf("MSIE")) !== -1)
    {
        browserName = "Microsoft Internet Explorer";
        fullVersion = nAgt.substring(verOffset + 5);
    }
        // In Chrome, the true version is after "Chrome" 
    else if ((verOffset = nAgt.indexOf("Chrome")) !== -1)
    {
        browserName = "Chrome";
        fullVersion = nAgt.substring(verOffset + 7);
    }
        // In Safari, the true version is after "Safari" or after "Version" 
    else if ((verOffset = nAgt.indexOf("Safari")) !== -1)
    {
        browserName = "Safari";
        fullVersion = nAgt.substring(verOffset + 7);
        if ((verOffset = nAgt.indexOf("Version")) !== -1)
            fullVersion = nAgt.substring(verOffset + 8);
    }
        // In Firefox, the true version is after "Firefox" 
    else if ((verOffset = nAgt.indexOf("Firefox")) !== -1)
    {
        browserName = "Firefox";
        fullVersion = nAgt.substring(verOffset + 8);
    }
        // In most other browsers, "name/version" is at the end of userAgent 
    else if ((nameOffset = nAgt.lastIndexOf(' ') + 1) <
              (verOffset = nAgt.lastIndexOf('/')))
    {
        browserName = nAgt.substring(nameOffset, verOffset);
        fullVersion = nAgt.substring(verOffset + 1);
        if (browserName.toLowerCase() === browserName.toUpperCase())
        {
            browserName = navigator.appName;
        }
    }
    // trim the fullVersion string at semicolon/space if present
    if ((ix = fullVersion.indexOf(";")) !== -1)
        fullVersion = fullVersion.substring(0, ix);
    if ((ix = fullVersion.indexOf(" ")) !== -1)
        fullVersion = fullVersion.substring(0, ix);

    majorVersion = parseInt('' + fullVersion, 10);
    if (isNaN(majorVersion))
    {
        fullVersion = '' + parseFloat(navigator.appVersion);
        majorVersion = parseInt(navigator.appVersion, 10);
    }
    return browserName + ':' + fullVersion;
}

function getOS()
{
    var os = navigator.appVersion;
    os = os.substring(0, os.indexOf(')')+1);
    return os;
}

function calculateSummaries(trials)
{
    var summaries = {}
    //console.log(trials);

    var GoRTs = [];
    var NoGoAcc = [];
    var GoAcc = [];
    var NoGoTrials = [];
    var SSDs = [];
    for (var i = 0; i < trials.length; i++)
    {
        if (trials[i].stopTrial === false)
        {
            GoAcc.push(trials[i].correct);
            if (trials[i].responseTime !== -1)
                GoRTs.push(trials[i].responseTime);
        } else
        {
            if (trials[i].hiddenStopTrial === 1)
                NoGoAcc.push(trials[i].correct);
            SSDs.push(trials[i].SSD);
            NoGoTrials.push({
                "SSD": trials[i].SSD,
                "Correct": trials[i].correct
            });
        }
    }
    //get median RT
    GoRTs.sort(compareNumbers);
    summaries.medianRT = GoRTs[Math.floor(GoRTs.length / 2)];
    //get stop accuracy
    var sum = NoGoAcc.reduce(add, 0);
    summaries.stopAccuracy = Math.round((sum / NoGoAcc.length) * 100, 2);
    //get Go Accuracy
    var sum = GoAcc.reduce(add, 0);
    summaries.goAccuracy = Math.round((sum / GoAcc.length) * 100, 2);

    //getSSRT
    SSDs.sort(compareNumbers);
    SSDs.filter(onlyUnique);
    NoGoTrials.sort(compareKeys);
    var SSDAcc = [];
    for (var i = 0; i < SSDs.length; i++)
    {
        var SSD = SSDs[i];
        var SSDaccuracys = [];
        for (var j = 0; j < NoGoTrials.length; j++)
        {
            if (NoGoTrials[j].SSD === SSD)
                SSDaccuracys.push(NoGoTrials[j].Correct);
        }
        var sum = SSDaccuracys.reduce(add, 0);
        var PRes = 1- (sum / SSDaccuracys.length);

        var n = round(GoRTs.length * PRes, 0);
        //console.log(n);
        var nthRT = GoRTs[n];
        var SSRT = nthRT - SSD;

        SSDAcc.push(
        {
            "SSD": SSD,
            "PRes": PRes,
            "nthRT": nthRT,
            "weight": SSDaccuracys.length,
            "SSRT": SSRT
        });
    }
    var SSRTsum = 0;
    var SSRTCount = 0;
    for (var k = 0; k < SSDAcc.length; k++)
    {
        if (SSDAcc[k].SSRT > 0)
        {
            SSRTsum = SSRTsum + (SSDAcc[k].SSRT * SSDAcc[k].weight);
            SSRTCount = SSRTCount + SSDAcc[k].weight;
        }
    }
    summaries.SSRT = round(SSRTsum / SSRTCount,0);
    return summaries;
}

function compareKeys(a, b)
{
    return a.SSD - b.SSD;
}

function compareNumbers(a, b)
{
    return a - b;
}

function add(a, b)
{

    return a + b;
}

function onlyUnique(value, index, self) { 
    return self.indexOf(value) === index;
}