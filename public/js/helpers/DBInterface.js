//Handles all DB related functionality.

function DBInterface()
{
    this.databaseRef = new Firebase(Main.DBURL);
    //Firebase.enableLogging(true);
};




DBInterface.prototype.getHighScore = function (id, callback)
{
    this.databaseRef.child("Participants").child("id_" + id).child("highScore").once("value", function (snapshot)
    {
        var data = snapshot.val();
        if (!data)
            callback(0);
         else
            callback(snapshot.val());
    });
}

DBInterface.prototype.saveSession = function (session, end)
{
    if (end === 0)
    {
        this.databaseRef.child("Sessions")
            .child("id_" + session.id)
            .child(session.date + "_" + session.sessionNum)
            .set(
            {
                "id": String(session.id),
                "date": session.date,
                "sessionNum": session.sessionNum,
                "condition": session.condition,
                "completed": session.sessionCompleted,
                "browser": session.browser,
                "OS": session.OS,
                "levelNum": session.levelNum,
                "levelName": session.levelName,
                "dayNum": session.dayNum
            });
    } else
    {
        this.databaseRef.child("Sessions")
            .child("id_" + session.id)
            .child(session.date + "_" + session.sessionNum)
            .update(
            {
                "completed": session.sessionCompleted,
                "duration":session.duration,
                "Summary": {
                    "medianRT": session.medianRT,
                    "SSRT": session.SSRT,
                    "stopAccuracy": session.stopAccuracy,
                    "goAccuracy": session.goAccuracy,
                    "score": session.score
                }
            });
        if (session.newHighscore !== -1)
            this.databaseRef.child("Participants")
                .child("id_" + session.id)
                .child("highScore")
                .set(session.newHighscore);
    }
}

DBInterface.prototype.saveTrial = function (session, trial)
{
    this.databaseRef.child("Trials").child("id_" + session.id).child(session.date + "_" + session.sessionNum).child(trial.overallTrialNumber).update(
    {
        "id": trial.id,
        "sessionNum": session.sessionNum,
        "overallTrialNumber": trial.overallTrialNumber,
        "blockTrialNumber": trial.blockTrialNumber,
        "blockNumber": trial.blockNumber,
        "colour": trial.colour,
        "stopTrial": Boolean(trial.stopTrial),
        "SSD": trial.SSD,
        "condition": session.condition,
        "ITIDuration": trial.ITIDuration,
        "date": trial.date,
        "dateTime": trial.dateTime,
        "response": String(trial.response),
        "responseTime": trial.responseTime,
        "correct": Boolean(trial.correct),
        "staircase": String(trial.staircase),
        "hiddenStopTrial": trial.hiddenStopTrial,
        "pointsGained": trial.pointsGained,
        "score": trial.score,
        "bonus": trial.bonus
    });
}

DBInterface.prototype.logUserIn = function(id, callback)
{
    var self = this;
    this.databaseRef.child("Participants").child("id_"+id).once("value", function (snapshot)
    {
        var data = snapshot.val();
        if (!data)
        {
            self.databaseRef.child("Participants").child("id_" + id).update(
            {
                "sessionsBegun": 1
            });
            callback(0);
        } else
        {
            var sessionsBegun = Number(data.sessionsBegun) + 1;
            if (data.sessionsBegun === undefined)
                sessionsBegun = 1;
            self.databaseRef.child("Participants").child("id_" + id).update(
            {
                "sessionsBegun": sessionsBegun
            });
            callback(1, data.id, data.condition);
        }
    });
}

DBInterface.prototype.getAllTrialData = function(session, callback)
{
    this.databaseRef.child("Trials").child("id_" + session.id).child(session.date + "_" + session.sessionNum).once("value", function(snapshot)
    {
        var data = snapshot.val();
        if (data)
            callback(data);
    });
}

DBInterface.prototype.getSessionSummaries = function(id, callback)
{
    var summaries =[];
    this.databaseRef.child("Sessions").child("id_" + id).once("value", function (snapshot)
    {
        snapshot.forEach(function (sessionSnapshot)
        {
            var session = sessionSnapshot.val();
           if (session.completed === true)
            {
                summaries.push(
                {
                    "sessionNum": session.sessionNum,
                    "date": session.date,
                    "medianRT": sessionSnapshot.child("Summary").val().medianRT,
                    "SSRT": sessionSnapshot.child("Summary").val().SSRT,
                    "score": sessionSnapshot.child("Summary").val().score,
                    "stopAccuracy": sessionSnapshot.child("Summary").val().stopAccuracy,
                    "goAccuracy": sessionSnapshot.child("Summary").val().goAccuracy
                });
                
            }
        });
        callback(summaries);
    });
    
}

DBInterface.prototype.assignToCondition = function (callback)
{
    var self = this;
    this.databaseRef.child("Conditions").once("value", function(snapshot)
    {
        var data = snapshot.val();

        var assignedCondition = -1;
        var groupNs = [0, 0, 0];
        var possConditions = [];
        //Is the DB initialised? If not, initialise it
        if (!data)
        {
            self.databaseRef.child("Conditions").update(
            {
                "nonGame": 0,
                "points": 0,
                "theme": 0
            });
        }
        else
           groupNs = [data.nonGame, data.points, data.theme];

        possConditions.push(groupNs.indexOf(Math.min.apply(Math, groupNs)));
        
        if (possConditions.length === 0)
            assignedCondition = Math.floor(Math.random() * 3);
        else if (possConditions.length === 1)
            assignedCondition = possConditions[0];
        else
            assignedCondition = possConditions[Math.floor(Math.random() * possConditions.length)];

        switch (assignedCondition)
        {
        case 0:
            self.databaseRef.child("Conditions").update({ "nonGame": groupNs[0] + 1 });
            break;
        case 1:
            self.databaseRef.child("Conditions").update({ "points": groupNs[1] + 1 });
            break;
        case 2:
            self.databaseRef.child("Conditions").update({ "theme": groupNs[2] + 1 });
            break;
        }

        callback(assignedCondition);
       });
}

DBInterface.prototype.createNewParticipant = function(condition, id)
{
    var id_path = "id_" + id;
    this.databaseRef.child("Participants").child(id_path).update(
                {
                    "condition": condition,
                    "datetimeRegistered": Date.now().toString("dd-MM-yyyy HH:mm:ss"),
                    "id": id,
                    "moneyEarned": 0,
                    "sessionsCompleted": 0
                }
            );
}

DBInterface.prototype.updateParticipantData_CompleteSession = function(id)
{
    //get participant details from database
    var self = this;
    var id_path = "id_" + id;
    this.getParticipantDetails(id, function (details)
    {
        if (details.lastSessionCompleted === undefined || details.lastSessionCompleted !== Date.now().toString("dd-MM-yyyy"))
        {
            var sessionsCompleted = details.sessionsCompleted + 1;
            var moneyEarned = details.moneyEarned;
            if (sessionsCompleted < 4)
                moneyEarned = 0;
            if (sessionsCompleted >= 4)
                moneyEarned = Main.BASEPAY + (sessionsCompleted - 4) * Main.SESHPAY;
            if (sessionsCompleted >= 14)
                moneyEarned = 20;
            self.databaseRef.child("Participants").child(id_path).update(
            {
                "moneyEarned": moneyEarned,
                "lastSessionCompleted": Date.now().toString("dd-MM-yyyy"),
                "sessionsCompleted": sessionsCompleted
            });
        }
    });
}

DBInterface.prototype.getParticipantDetails = function(id, callback)
{
    this.databaseRef.child("Participants").child("id_" + id).once("value", function (snapshot)
    {
        var data = snapshot.val();
        callback(data);
    });
}


DBInterface.prototype.saveQuestionnaireResultToDb = function (session, questionnaire, question, value)
{
    this.databaseRef.child("Questionnaire").child("id_" + session.id).child(session.date + "_" + session.sessionNum).child(questionnaire).child(question).set(value);
}

DBInterface.prototype.participantCompleted = function (id, participantData)
{
    var id_path = "id_" + id;
    this.databaseRef.child("Completed").child(id_path).update(participantData);
    this.databaseRef.child("Participants").child(id_path).update({ "freeze": true });
}

DBInterface.prototype.recordVisabilityActivity = function(session, id, data)
{
    var id_path = "id_" + session.id;
    this.databaseRef.child("Activity")
        .child("id_" + session.id)
        .child(session.date + "_" + session.sessionNum)
        .push(data);
}

