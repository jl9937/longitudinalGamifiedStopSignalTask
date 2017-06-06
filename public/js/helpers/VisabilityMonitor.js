function VisabilityMonitor(session, main, db)
{
    this.session = session;
    this.main = main;
    this.db = db;

    var hidden, visibilityChange;
    if (typeof document.hidden !== "undefined")
    {
        hidden = "hidden"; visibilityChange = "visibilitychange";
    } else if (typeof document.mozHidden !== "undefined")
    {
        hidden = "mozHidden"; visibilityChange = "mozvisibilitychange";
    } else if (typeof document.msHidden !== "undefined")
    {
        hidden = "msHidden"; visibilityChange = "msvisibilitychange";
    } else if (typeof document.webkitHidden !== "undefined")
    {
        hidden = "webkitHidden"; visibilityChange = "webkitvisibilitychange";
    }

    var self = this;
    this.inFocus = true;

    document.focus = window.onfocus = function () { self.inFocus = true; self.handleScreenVisabilityChange(0); };
    document.onblur = window.onblur = function () { self.inFocus = false; self.handleScreenVisabilityChange(0); };
    document.addEventListener(visibilityChange, this.handleScreenVisabilityChange.bind(this, 0));
};

VisabilityMonitor.prototype.handleScreenVisabilityChange = function(onceRound, screenChange)
{
    var currState = this.state || "";
    if (document.hidden)
        this.state = "hidden";
    else if (onceRound && !document.hidden && !this.inFocus)
        this.state = "nofocus";
    else if (!document.hidden && !this.inFocus)
        setTimeout(this.handleScreenVisabilityChange.bind(this, 1), 15);
    else if (!document.hidden && this.inFocus)
        this.state = "active";

    /////Handle the change
    if (screenChange || (currState !== this.state))
    {
        var delta = Date.now() - this.timeOfLastStateChange;
        var oldStateBegan, currentScreen;

        if (this.timeOfLastStateChange === undefined)
        {
            oldStateBegan = -1;
            delta = -1;
        } else
            oldStateBegan = this.timeOfLastStateChange.toString("dd-MM-yyyy HH:mm:ss");

        if (this.main.viewManager.currentView === undefined)
            currentScreen = "LOGIN";
        else
            currentScreen = this.main.viewManager.currentScreenName;

        var stateChangeData = {
            "sessionNum": this.session.sessionNum,
            "id": this.session.id,
            "view": currentScreen,
            "oldState": currState,
            "oldStateBegan": oldStateBegan,
            "newState": this.state,
            "newStateBegan": Date.now().toString("dd-MM-yyyy HH:mm:ss"),
            "durationOfOldState": delta
        }
        //console.log(stateChangeData);
        this.db.recordVisabilityActivity(this.session, this.session.id, stateChangeData);
        this.timeOfLastStateChange = Date.now();
    }
};
