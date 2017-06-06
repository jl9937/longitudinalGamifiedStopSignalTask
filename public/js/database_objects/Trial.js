
//object for a trial: Stores trial data and subsidiary calculation variables.
function Trial(_id, _overallTrialNumber, _blockTrialNumber, _blockNumber, _colour, _stimulusPath, _stopTrial, _SSD, _staircase, _ITIDuration)
{
    this.id = _id;
    this.overallTrialNumber = _overallTrialNumber;
    this.blockTrialNumber = _blockTrialNumber;
    this.blockNumber = _blockNumber;
    this.colour = _colour;
    this.stimulusPath = _stimulusPath;
    this.stopTrial = _stopTrial;
    this.SSD = _SSD;
    this.staircase = _staircase || -1;
    this.ITIDuration = _ITIDuration;
    this.hiddenStopTrial = 0; // 0 = not yet displayed // -1 = deactivated //  1 = displayed

    this.pointsGained = 0;
    this.score = -1;
    this.bonus = -1;

    this.date = Date.now().toString("dd-MM-yyyy");
    this.dateTime = Date.now().toString("dd-MM-yyyy HH:mm:ss");
    

    this.response = -1;
    this.responseTime = -1;
    this.correct = -1;
    
    //calculation only
    this.RTTimingStart = -1;
};

Trial.prototype.print = function (verbose)
{
    verbose = verbose || 0;
    //IF (verbose)
        //.log("T: " + this.id, this.overallTrialNumber, this.blockTrialNumber, this.blockNumber, this.colour, this.stopTrial, this.SSD, this.ITIDuration, this.date, this.dateTime, this.response, this.responseTime, this.correct);
    //else
        //console.log("T: " + this.overallTrialNumber, this.colour + " St:" + this.stopTrial, this.hiddenStopTrial, this.SSD, this.staircase + " Cr:" + this.correct, this.responseTime);
}

Trial.prototype.setResponse = function(_response, _responseTime, _correct)
{
    this.response = _response;
    this.responseTime = _responseTime || this.responseTime;
    this.correct = _correct;
}

Trial.prototype.saveToDB = function (db, session)
{
    this.unixTime = Number(Date.now());
    this.print();
    db.saveTrial(session, this);
}

