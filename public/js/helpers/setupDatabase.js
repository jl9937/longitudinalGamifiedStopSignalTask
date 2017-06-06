var initialised = null;

//This function checks the admin login is valid before executing database setup demands.
function checkLogin(callback)
{
    
    var id = document.getElementById("username").value;
    var pw = document.getElementById("password").value;
    if (id === "" || pw === "")
    {
        output("Login Failed");
        return;
    }

    if (initialised === null)
    {
        var config = {
            //todo enter your own API key here
            apiKey: "XXXXXXXXXXX",
            authDomain: Main.URL,
            databaseURL: Main.DBURL,
            //todo enter your own API key here
            storageBucket: "XXXXXXXXXXXX"
        };
        initialised = firebase.initializeApp(config);
    }

    var result = firebase.auth().signInWithEmailAndPassword(id, pw).catch(function (error)
    {
        output("Login Failed");
    }
       );
    result.then(function (user)
    {
        if (user)
        {
            var ref = firebase.database().ref();
            output("Login correct");
            output("Drawing from: " + Main.DBURL);
            callback(ref);
        }
    });
}


/////////////////Button functions/////////////////

//Gets all the trials from the database and outputs them as a text file.
function getTrials(ref)
{
    output("Generating trials report, download should start soon");
    var fullText = "ID\t" +
    "SessionNumber\t" +
    "LevelNum\t" +
    "DayNum\t" +
    "SessionCompleted\t" +
    "BlockNumber\t" +
    "BlockTrialNum\t" +
    "OverallTrialNum\t" +
    "DateTime\t" +
    "Condition\t" +
    "Colour\t" +
    "ITIDuration\t" +
    "StopTrial\t" +
    "Response\t" +
    "ResponseTime\t" +
    "Score\t" +
    "Bonus\t" +
    "Staircase\t" +
    "SSD\t" +
    "StopTrialDisplayed?\t" +
    "Correct?\n";

    ref.child("Sessions").once("value", function (allSessionsSnapshot)
    {
        ref.child("Trials").once("value", function (snapshot)
        {
            snapshot.forEach(function (idSnapshot)
            {
                idSnapshot.forEach(function (dateSnapshot)
                {
                    var seshData = allSessionsSnapshot.child(idSnapshot.key).child(dateSnapshot.key).val();
                    dateSnapshot.forEach(function (trialSnapshot)
                    {
                        var trial = trialSnapshot.val();
                        var line = trial.id + "\t"
                            + trial.sessionNum + "\t"
                            + Number(seshData.levelNum) + "\t"
                            + Number(seshData.dayNum) + "\t"
                            + Number(seshData.completed) + "\t"
                            + trial.blockNumber + "\t"
                            + trial.blockTrialNumber + "\t"
                            + trial.overallTrialNumber + "\t"
                            + trial.dateTime + "\t"
                            + trial.condition + "\t"
                            + trial.colour + "\t"
                            + trial.ITIDuration + "\t"
                            + Number(trial.stopTrial) + "\t"
                            + trial.response + "\t"
                            + trial.responseTime + "\t"
                            + trial.score + "\t"
                            + trial.bonus + "\t"
                            + trial.staircase + "\t"
                            + trial.SSD + "\t"
                            + trial.hiddenStopTrial + "\t"
                            + Number(trial.correct) + "\n";
                        fullText += line;
                    });
                });
            });
            saveContent(fullText, "TrialsData.txt");
            output("Report generated: To view, copy the contents of the downloaded file straight into Excel. This will format it correctly");
        });
    }).catch(function (error) { console.log(error) });
}

//Gets all the qustionnaire responses from the database and outputs them as a file.
function getQuestionnaire(ref)
{
    output("Generating questionnaire report, download should start soon");
    var fullText = "ID\t" +
    "SessionNumber\t" +
    "Date\t" +
    "Questionnaire\t" +
    "Question\t" +
    "Response\n";

    ref.child("Questionnaire").once("value", function (snapshot)
    {
        snapshot.forEach(function (idSnapshot)
        {
            var id = idSnapshot.key.split("_")[1];
            idSnapshot.forEach(function (sessionSnapshot)
            {
                var sessionStrings = sessionSnapshot.key.split("_");
                var sessionNum = sessionStrings[1];
                var date = sessionStrings[0];
                sessionSnapshot.forEach(function (questionnaireSnapshot)
                {
                    var questionnaire = questionnaireSnapshot.key;
                    questionnaireSnapshot.forEach(function (question)
                    {
                        var line = id + "\t"
                            + sessionNum + "\t"
                            + date + "\t"
                            + questionnaire + "\t"
                            + question.key + "\t"
                            + question.val() + "\n";
                        fullText += line;
                    });
                });
            });
        });
        saveContent(fullText, "QuestionnaireData.txt");
        output("Report generated: To view, copy the contents of the downloaded file straight into Excel. This will format it correctly");
    }).catch(function (error) { console.log(error) });
}

function getActivity(ref)
{
    output("Generating activity report, download should start soon");

    ref.child("Activity").once("value", function (snapshot)
    {
        var fullText = "ID\t" +
            "SessionNumber\t" +
            "View\t" +
            "OldState\t" +
            "OldStateBegan\t" +
            "NewState\t" +
            "NewStateBegan\t" +
            "DurationOfOldState\n";
        snapshot.forEach(function (idSnapshot)
        {
            idSnapshot.forEach(function (sessionSnapshot)
            {
                sessionSnapshot.forEach(function (activitySnapshot)
                {
                    var activity = activitySnapshot.val();
                    var line = activity.id +
                        "\t" + activity.sessionNum +
                        "\t" + activity.view +
                        "\t" + activity.oldState +
                        "\t" + activity.oldStateBegan +
                        "\t" + activity.newState +
                        "\t" + activity.newStateBegan +
                        "\t" + activity.durationOfOldState +
                        "\n";
                    fullText += line;
                });
            });
        });
        saveContent(fullText, "ActivityData.txt");
        output("Report generated: To view, copy the contents of the downloaded file straight into Excel. This will format it correctly");
    }).catch(function (error) { console.log(error) });
}


//Gets all the sessions from database and outputs them as a text file
function getSessions(ref)
{
    output("Generating sessions report, download should start soon");

    ref.child("Sessions").once("value", function (snapshot)
    {
        var fullText = "ID\t" +
                        "SessionNumber\t" +
                        "LevelNum\t" +
                        "DayNum\t" +
                        "LevelName\t" +
                        "Date\t" +
                        "sumSSRT\t" +
                        "sumMedianRT\t" +
                        "Score\t" +
                        "sumStopAccuracy\t" +
                        "Browser\t" +
                        "Completed\t" +
                        "Condition\t" +
                        "Duration\n";
        snapshot.forEach(function (idSnapshot)
        {
            idSnapshot.forEach(function (sessionSnapshot)
            {
                var SSRT = "", medianRT = "", score = "", stopAccuracy = "";
                var session = sessionSnapshot.val();
                if (session.completed)
                {
                    SSRT = sessionSnapshot.child("Summary").val().SSRT;
                    medianRT = sessionSnapshot.child("Summary").val().medianRT;
                    score = sessionSnapshot.child("Summary").val().score;
                    stopAccuracy = sessionSnapshot.child("Summary").val().stopAccuracy;
                }
                var line = session.id + "\t"
                    + session.sessionNum + "\t"
                    + session.levelNum + "\t"
                    + session.dayNum + "\t"
                    + session.levelName + "\t"
                    + session.date + "\t"

                    + SSRT + "\t"
                    + medianRT + "\t"
                    + score + "\t"
                    + stopAccuracy + "\t"

                    + session.browser + "\t"
                    + session.completed + "\t"
                    + session.condition + "\t"
                    + session.duration + "\n";
                fullText += line;
            });
        });
        saveContent(fullText, "SessionData.txt");
        output("Report generated: To view, copy the contents of the downloaded file straight into Excel. This will format it correctly");
    }).catch(function (error) { console.log(error) });
}

function getCompleted(ref)
{
    output("Generating completed participants report, download should start soon");
    //firebase.database.enableLogging(true);

    ref.child("Completed").once("value", function (snapshot)
    {
        var fullText = "ID\t" +
                        "Condition\t" +
                        "DateTimeRegistered\t" +
                        "SessionsCompleted\t" +
                        "MoneyEarned\t" +
                        "LastSessionCompleted\t" +
                        "DateCompleted\t" +
                        "SessionsBegun\n";
        snapshot.forEach(function (idSnapshot)
        {
            var participant = idSnapshot.val();
            var line = participant.id + "\t"
                + participant.condition + "\t"
                + participant.datetimeRegistered + "\t"
                + participant.sessionsCompleted + "\t"
                + participant.moneyEarned + "\t"
                + participant.lastSessionCompleted + "\t"
                + participant.dateCompleted + "\t"
                + participant.sessionsBegun + "\n";
            fullText += line;
        });
        saveContent(fullText, "CompletedData.txt");
        output("Report generated: To view, copy the contents of the downloaded file straight into Excel. This will format it correctly");
    }).catch(function (error) { console.log(error) });
}

//Gets all blocks from database and outputs to text file
function getParticipants(ref)
{
    output("Generating participants report, download should start soon");

    ref.child("Participants").once("value", function (snapshot)
    {
        var fullText = "ID\t" +
                        "Condition\t" +
                        "DateTimeRegistered\t" +
                        "SessionsCompleted\t" +
                        "MoneyEarned\t" +
                        "SessionsBegun\n";
        snapshot.forEach(function (idSnapshot)
        {
            var participant = idSnapshot.val();
            var line = participant.id + "\t"
                + participant.condition + "\t"
                + participant.datetimeRegistered + "\t"
                + participant.sessionsCompleted + "\t"
                + participant.moneyEarned + "\t"
                + participant.sessionsBegun + "\n";
            fullText += line;
        });
        saveContent(fullText, "ParticipantsData.txt");
        output("Report generated: To view, copy the contents of the downloaded file straight into Excel. This will format it correctly");
    }).catch(function (error) { console.log(error) });
}

/////////////Utility Functions////////////
//Takes text and outputs it to the browser window by appending it to the HTML
function output(text)
{
    var mydiv = document.getElementById("updates");
    var newcontent = document.createElement('div');
    newcontent.innerHTML = "<li>" + text + "</li>";
    while (newcontent.firstChild)
        mydiv.appendChild(newcontent.firstChild);
}

function saveContent(fileContents, fileName)
{
    var blob = new Blob([fileContents], { type: "text/plain;charset=utf-8" });
    saveAs(blob, fileName);
}


function clearAllData()
{
    if (initialised === null)
    {
        var config = {
            //todo enter your own API key here
            apiKey: "XXXXXXXXXXX",
            authDomain: Main.URL,
            databaseURL: Main.DBURL,
            //todo enter your own API key here
            storageBucket: "XXXXXXXXXXXX"
        };
        initialised = firebase.initializeApp(config);
    }

    //you must disable the rules in the DB using firebase
        output("Deleting EVERYTHING");
        var databaseRef = firebase.database().ref();
        databaseRef.child("Trials").set(null);
        databaseRef.child("Activity").remove();
        databaseRef.child("Sessions").remove();
        databaseRef.child("Questionnaire").remove();
        databaseRef.child("Participants").remove();
}