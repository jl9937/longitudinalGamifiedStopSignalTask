//Version Base 2.0

//todo enter the URL of your  Firebase DB URL here
Main.DBURL = "https://XXXXXXX.firebaseio.com";
//todo enter the URL of your  Firebase app URL here
Main.URL = "XXXXXX.firebaseapp.com";

Main.SCREEN_WIDTH = 1024;
Main.SCREEN_HEIGHT = 730;
Main.CONDITION_NONGAME = 0;
Main.CONDITION_POINTS = 1;
Main.CONDITION_THEME = 2;

Main.BASEPAY = 4;
Main.SESHPAY = 0.5;
Main.STUDYLENGTH = 10;
//todo  fill in a completion URL here
Main.COMPLETION_LINK = "XXXXXXXXXXXXXXXX";

Main.THEME_DATA = ["Packville",  "Paris", "GBDocks", "Russia", "Alps", "Hawaii", "Morocco", "Nepal", "Tokyo", "ISS"];

var fps = 70;
var now;
var then = Date.now();
var interval = 1000 / fps;
//60 fps gives average delta of 21 (great)
//30 fps gives average delta of 45
var delta;
var idealDelta = 21;


Main.prototype.resize =function()
{
    var yScale = window.innerHeight / 734;

    if (yScale <= 1)
    {
        this.stage.scale.y = yScale;
        this.stage.scale.x = yScale;
    }
}
function Main()
{
    this.stage = new PIXI.Container();
    this.renderer = PIXI.autoDetectRenderer(Main.SCREEN_WIDTH, Main.SCREEN_HEIGHT, { view: document.getElementById("game-canvas") });
    this.renderer.backgroundColor = 0x060606;
    this.resize();
    window.onresize = this.resize.bind(this);
    this.db = new DBInterface();
    this.login();
};

Main.prototype.login = function ()
{
    //If URL contains an ID parameter, extract it.
    var urlid = getUrlVars(["prolific_pid", "id"]);
    urlid = urlid.prolific_pid || urlid.id;

    if (urlid)
    {
        var self = this;
        if (urlid.length !== 24)
        {
            alert("Are you sure you entered your Prolific ID correctly? It's not the correct length!\nPlease check the URL contains your full Prolific ID");
            window.location.href = "https://" + Main.URL + "/index.html";
        }
        //Check whether user ID exists already
        this.db.logUserIn(urlid, function (idExists, id, condition)
        {
            //if their ID doesn't exist, then assign them to a condition
            if (!idExists)
            {
                console.log("New Participant: Assigning to condition");
                self.db.assignToCondition(function (newlyAssignedcondition)
                {
                    //Once assigned to a condition, create a database entry for that participant, create a session and start the task
                    self.db.createNewParticipant(newlyAssignedcondition, urlid);
                    self.setupTask(urlid, newlyAssignedcondition, self.db);
                });
            } else
            {
                console.log("Returning Participant: Logging in");
                //check Timeout: if 10 days have passed, then move to Completed table for payment
                self.checkTimeout(id, condition, self.db);
                //If their ID already exists, then simply create a session and start the task
                self.setupTask(id, condition, self.db);
            }
        });
    }
    else
    {
        //the link had no ID var as a parameter and so the task cannot load.
        var instructions = new PIXI.Text("Error: Invalid link \n\nMake sure you entered the URL correctly.\nIf the problem persists please contact\njim.lumsden@bristol.ac.uk",
                                        { align: "center", font: "40px Arial", fill: "#ff0000", stroke: "#000000", strokeThickness: 2});
        instructions.x = Main.SCREEN_WIDTH / 2;
        instructions.y = Main.SCREEN_HEIGHT / 2;
        instructions.anchor = new PIXI.Point(0.5, 0.5);
        this.stage.addChild(instructions);
        this.renderer.render(this.stage);
    }
}
Main.prototype.checkTimeout =function(id, condition, db)
{
    db.getParticipantDetails(id, function(details)
        {
            var dateRegistered = Date.parseExact(details.datetimeRegistered, "dd-MM-yyyy HH:mm:ss");
            var today = Date.now();
            var timeDiff = Math.abs(today.getTime() - dateRegistered.getTime());
            var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

           if (diffDays > Main.STUDYLENGTH)
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
                db.participantCompleted(id, participantData);
            }
        });
}

Main.prototype.setupTask = function (id, condition, db)
{
    var self = this;
    if (this.session === undefined)
        this.session = new Session(id, condition, db);
    db.getParticipantDetails(this.session.id, function(details)
    {
        self.session.levelNum = details.sessionsCompleted;
        if (self.session.levelNum > 9)
        {
            console.log("Additional session underway, no payment for this session");
            self.session.levelNum = 0;
        }
        self.setupAllScreens();
    });
}
Main.prototype.setupAllScreens = function ()
{
    this.viewManager = new VMan(this.stage, this.db, this);
    VMan.addScreen("LOGIN", new MainMenu(this.session));
    VMan.addScreen("ENGINE", new Engine(this.session.condition));
    var self = this;
    switch (this.session.condition)
    {
        case Main.CONDITION_NONGAME:
            setupNonGameScreens();
            break;
        case Main.CONDITION_POINTS:
            setupPointsScreens();
            break;
        case Main.CONDITION_THEME:
            setupThemeScreens();
            break;
    }
    //decide schedule now
    var posttaskButtonDestination = createSchedule(this.session.levelNum);

    VMan.addScreen("POSTTASK", new GenericScreen(this.session.condition, {
        text: "You did it, well done!\n\n\We now have a short questionnaire for you to complete",
        buttonText: "Begin",
        nextScreenToGoTo: posttaskButtonDestination,
        buttonYPos: Main.SCREEN_HEIGHT - 80
    }));
    
    VMan.addScreen("POSTSESSION", new GenericScreen(this.session.condition, {
        text: "Task completed, well done!\n\nYou have completed today's session.\nPerhaps see you tomorrow?\n\nPlease BOOKMARK this page so that you return easily",
        buttonText: "Next",
        nextScreenToGoTo: "HISTORYMAP",
        buttonYPos: Main.SCREEN_HEIGHT - 160
    }));
    this.loadSprites(this.session.condition, this.session.levelNum);

    function setupNonGameScreens()
    {
        VMan.addScreens("INSTRUCTIONS", [
                new GenericScreen(self.session.condition, {
                    picture1: "../resources/interface/instructions1.png",
                    buttonText: "Next page",
                    nextScreenToGoTo: "INSTRUCTIONS2",
                    buttonYPos: Main.SCREEN_HEIGHT - 30,
                    buttonXPos: Main.SCREEN_WIDTH - 210,
                    buttonScale: 0.65
                }),
                new GenericScreen(self.session.condition, {
                    picture1: "../resources/interface/instructions2.png",
                    buttonText: "Next page",
                    nextScreenToGoTo: "INSTRUCTIONS3",
                    buttonYPos: Main.SCREEN_HEIGHT - 30,
                    buttonXPos: Main.SCREEN_WIDTH - 210,
                    buttonScale: 0.65
                }),
                new GenericScreen(self.session.condition, {
                    picture1: "../resources/interface/instructions3.png",
                    buttonText: "Start!",
                    nextScreenToGoTo: "ENGINE",
                    buttonYPos: Main.SCREEN_HEIGHT - 70
                })
        ]);
        VMan.addScreen("HISTORYMAP", new History(self.session.condition));
    }
    function setupPointsScreens()
    {
        VMan.addScreens("INSTRUCTIONS", [
                new GenericScreen(self.session.condition, {
                    background: "../resources/interface/background.png",
                    picture1: "../resources/interface/Points_instructions1.png",
                    buttonText: "Next page",
                    nextScreenToGoTo: "INSTRUCTIONS2",
                    buttonYPos: Main.SCREEN_HEIGHT - 30,
                    buttonXPos: Main.SCREEN_WIDTH - 210,
                    buttonScale: 0.65
                }),
                new GenericScreen(self.session.condition, {
                    background: "../resources/interface/background.png",
                    picture1: "../resources/interface/Points_instructions2.png",
                    buttonText: "Next page",
                    nextScreenToGoTo: "INSTRUCTIONS3",
                    buttonYPos: Main.SCREEN_HEIGHT - 30,
                    buttonXPos: Main.SCREEN_WIDTH - 210,
                    buttonScale: 0.65
                }),
                new GenericScreen(self.session.condition, {
                    background: "../resources/interface/background.png",
                    picture1: "../resources/interface/Points_instructions3.png",
                    buttonText: "Next page",
                    nextScreenToGoTo: "INSTRUCTIONS4",
                    buttonYPos: Main.SCREEN_HEIGHT - 30,
                    buttonXPos: Main.SCREEN_WIDTH - 210,
                    buttonScale: 0.65
                }),
                new GenericScreen(self.session.condition, {
                    background: "../resources/interface/background.png",
                    picture1: "../resources/interface/Points_instructions4.png",
                    buttonText: "Start!",
                    nextScreenToGoTo: "ENGINE",
                    buttonYPos: Main.SCREEN_HEIGHT - 60,
                    buttonScale: 0.8
                })
        ]);
        VMan.addScreen("HISTORYMAP", new History(self.session.condition));
    }
    function setupThemeScreens()
    {
        var todaysBackground = "../resources/theme/" + Main.THEME_DATA[self.session.levelNum] + ".png";
        var todaysTextFilePath = "../resources/theme/screenText/" + Main.THEME_DATA[self.session.levelNum] + ".txt";
        self.session.levelName = Main.THEME_DATA[self.session.levelNum];

        VMan.addScreens("INSTRUCTIONS", [
            new GenericScreen(self.session.condition, {
                picture1: "../resources/interface/Theme_instructions1.png",
                buttonText: "Next page",
                nextScreenToGoTo: "INSTRUCTIONS2",
                buttonYPos: Main.SCREEN_HEIGHT - 30,
                buttonXPos: Main.SCREEN_WIDTH - 210,
                buttonScale: 0.65
            }),
            new GenericScreen(self.session.condition, {
                background: todaysBackground,
                picture1: "../resources/interface/themeDarkener.png",
                picture2: "../resources/interface/Theme_instructions2.png",
                buttonText: "Next page",
                nextScreenToGoTo: "INSTRUCTIONS3",
                buttonYPos: Main.SCREEN_HEIGHT - 30,
                buttonXPos: Main.SCREEN_WIDTH - 210,
                buttonScale: 0.65
            }),
            new GenericScreen(self.session.condition, {
                background: todaysBackground, picture1: "../resources/interface/themeDarkener.png",
                picture2: "../resources/interface/Theme_instructions3.png",
                buttonText: "Next page",
                nextScreenToGoTo: "INSTRUCTIONS4",
                buttonYPos: Main.SCREEN_HEIGHT - 30,
                buttonXPos: Main.SCREEN_WIDTH - 210,
                buttonScale: 0.65
            }),
            new GenericScreen(self.session.condition, {
                background: todaysBackground,
                picture1: "../resources/interface/themeDarkener.png",
                picture2: "../resources/interface/Theme_instructions4.png",
                buttonText: "Next page",
                nextScreenToGoTo: "INTRO",
                buttonYPos: Main.SCREEN_HEIGHT - 30,
                buttonXPos: Main.SCREEN_WIDTH - 210,
                buttonScale: 0.65
            })
        ]);
        VMan.addScreen("INTRO", new GenericScreen(self.session.condition, {
            background: todaysBackground,
            picture1: "../resources/interface/textspace.png",
            textFilepath: todaysTextFilePath,
            buttonText: "Start sorting!",
            nextScreenToGoTo: "ENGINE",
            buttonYPos: Main.SCREEN_HEIGHT - 100
        }));
        VMan.addScreen("HISTORYMAP", new Map(self.session.condition));
    }
    function createSchedule(levelNum)
    {
        switch (levelNum)
        {
            case 0:
                VMan.addScreen("CONSENT", new FreeTextScreen(self.session.condition, "CONSENTFORM", 
                    "Before we begin the study proper, we must ask you for your informed consent.\n\n" +
                    "By completing the box below, you confirm you have read the study description\n" +
                    "on Prolific Academic.com and are happy to take part. You also confirm that \n" +
                    "you are over 18 years of age and have English as a first language\n" +
                          "If you are happy to proceed, please type 'I give consent' in the box below.", "consent", "INSTRUCTIONS1"));
                VMan.addScreens("QUEST_DEMOGRAPHICS", createQuestionnaire("demographics", self.session, "QUEST_ENGAGEMENT1"));
                VMan.addScreens("QUEST_ENGAGEMENT", createQuestionnaire("engagement", self.session, "NOTICE"));
                VMan.addScreen("NOTICE", new GenericScreen(self.session.condition, {
                    text: "You have now completed the first session\nof the compulsory four.\n\n" +
                          "When you click the button below it will open a new tab with the completion code. " +
                          "This will reserve your place in the study, but you must complete all four sessions in order to be rewarded.",
                    buttonText: "Submit",
                    nextScreenToGoTo: "POSTSESSION",
                    buttonYPos: Main.SCREEN_HEIGHT - 100,
                    special: Main.COMPLETION_LINK
                }));
                return "QUEST_DEMOGRAPHICS1";
            case 1:
                VMan.addScreens("QUEST_ENGAGEMENT_SHORT", createQuestionnaire("shortengagement", self.session, "QUEST_PERSEVERANCE1"));
                VMan.addScreens("QUEST_PERSEVERANCE", createQuestionnaire("perseverance", self.session, "POSTSESSION"));
                return "QUEST_ENGAGEMENT_SHORT1";
            case 2:
                VMan.addScreens("QUEST_ENGAGEMENT_SHORT", createQuestionnaire("shortengagement", self.session, "QUEST_FREETEXT1"));
                VMan.addScreens("QUEST_FREETEXT", createQuestionnaire("free", self.session, "POSTSESSION"));
                return "QUEST_ENGAGEMENT_SHORT1";
            case 3:
                VMan.addScreens("QUEST_ENGAGEMENT", createQuestionnaire("engagement", self.session, "NOTICE"));
                VMan.addScreen("NOTICE", new GenericScreen(self.session.condition, {
                    text: "You have now completed the compulsory study period.\n\n" +
                          "If you wish, you may continue to take part in the study every day for the next 6 days." +
                          "\n\nAfter 6 days, you will be reimbursed for every session you have completed (up to 10).",
                    buttonText: "Next",
                    nextScreenToGoTo: "LOGIN",
                    buttonYPos: Main.SCREEN_HEIGHT - 100
                }));
                return "QUEST_ENGAGEMENT1";
            case 6:
                VMan.addScreens("QUEST_ENGAGEMENT", createQuestionnaire("engagement", self.session, "POSTSESSION"));
                return "QUEST_ENGAGEMENT1";
            case 9:
                VMan.addScreens("QUEST_ENGAGEMENT", createQuestionnaire("engagement", self.session, "QUEST_FREETEXT1"));
                VMan.addScreens("QUEST_FREETEXT", createQuestionnaire("free", self.session, "NOTICE"));
                VMan.addScreen("NOTICE", new GenericScreen(self.session.condition, {
                    text: "You have completed every test session. Really well done!!\n" +
                            "Thank you for taking part in the study." +
                            "\n\nNote, you will not be reimbursed for completing any further test sessions, however you will be paid for every test session you have completed!" +
                            "\n\nYou may now close this window",
                    buttonText: "Main Menu",
                    nextScreenToGoTo: "LOGIN",
                    buttonYPos: Main.SCREEN_HEIGHT - 100
                }));
                return "QUEST_ENGAGEMENT1";
            default:
                VMan.addScreens("QUEST_ENGAGEMENT_SHORT", createQuestionnaire("shortengagement", self.session, "POSTSESSION"));
                return "QUEST_ENGAGEMENT_SHORT1";
        };
    }
}

Main.prototype.loadSprites = function(condition, levelNum)
{
    var allVariantAssets = [
        "../resources/interface/background.png",
        "../resources/interface/bottombar.png"
    ];
    var nongameAssets = [
        "../resources/interface/instructions1.png"
    ];
    var pointsAssets = [
        "../resources/interface/pointsbackground.png",
        "../resources/interface/Points_instructions1.png"
    ];
    var themeAssets = [
        "../resources/interface/themeLoginBackground.jpg",
        "../resources/theme/themeMisc/Map.png",
        "../resources/interface/themeBackground.png",
        "../resources/interface/Theme_instructions1.png"
    ];

    var levelThemeAssets = [
        ["../resources/theme/themeMisc/progressLine0.png"],
        ["../resources/theme/themeMisc/progressLine1.png"],
        ["../resources/theme/themeMisc/progressLine2.png"],
        ["../resources/theme/themeMisc/progressLine3.png"],
        ["../resources/theme/themeMisc/progressLine4.png"],
        ["../resources/theme/themeMisc/progressLine5.png"],
        ["../resources/theme/themeMisc/progressLine6.png"],
        ["../resources/theme/themeMisc/progressLine7.png"],
        ["../resources/theme/themeMisc/progressLine8.png"],
        ["../resources/theme/themeMisc/progressLine9.png"]
    ];

    //Add the additional assets into the load Array
    Main.themeAssets = levelThemeAssets[levelNum];
    if(condition === 0)
        allVariantAssets.push.apply(allVariantAssets, nongameAssets);
    if (condition === 1)
        allVariantAssets.push.apply(allVariantAssets, pointsAssets);
    if (condition === 2)
    {
        allVariantAssets.push.apply(allVariantAssets, themeAssets);
        allVariantAssets.push.apply(allVariantAssets, Main.themeAssets);
    }


    PIXI.loader.add(allVariantAssets).load(this.spritesLoaded.bind(this));
};
Main.prototype.spritesLoaded = function ()
{
    this.VisabilityMonitor = new VisabilityMonitor(this.session, this, this.db);
    this.viewManager.setScreen("LOGIN");
    requestAnimationFrame(this.update.bind(this));
    this.loadOtherSprites(this.session.condition, this.session.levelNum);
};
Main.prototype.loadOtherSprites = function(condition, levelNum)
{
    var allVariantAssets = [
        "../resources/taskElements/fixation.png",
        "../resources/taskElements/stopsignal.png",
        "../resources/interface/markout.png",
        "../resources/interface/down.png",
        "../resources/interface/up.png"
    ];
    var nongameAssets = [
        "../resources/interface/instructions2.png",
        "../resources/interface/instructions3.png",
        "../resources/taskElements/blue.png",
        "../resources/taskElements/yellow.png",
        "../resources/taskElements/zones.png"
    ];
    var pointsAssets = [
        "../resources/taskElements/blue.png",
        "../resources/taskElements/bonusGlow.png",
        "../resources/taskElements/bonusGlowNew.png",
        "../resources/taskElements/bonusGlowReset.png",
        "../resources/taskElements/yellow.png",
        "../resources/taskElements/zones.png",
        "../resources/interface/Points_instructions2.png",
        "../resources/interface/Points_instructions4.png",
        "../resources/interface/Points_instructions3.png"
    ];

    var themeAssets = [
        "../resources/interface/themeDarkener.png",
        "../resources/interface/Theme_instructions2.png",
        "../resources/interface/Theme_instructions3.png",
        "../resources/interface/Theme_instructions4.png",
        "../resources/theme/themeMisc/overlayer.png",
        "../resources/interface/textspace.png"
    ];
    
    var levelThemeAssets = [
       ["../resources/theme/Packville.png",
       "../resources/theme/objects/BPackville.png",
       "../resources/theme/objects/YPackville.png"],

               ["../resources/theme/Paris.png",
       "../resources/theme/objects/BParis.png",
       "../resources/theme/objects/YParis.png"],

               ["../resources/theme/GBDocks.png",
       "../resources/theme/objects/BGBDocks.png",
       "../resources/theme/objects/YGBDocks.png"],

               ["../resources/theme/Russia.png",
       "../resources/theme/objects/BRussia.png",
       "../resources/theme/objects/YRussia.png"],

               ["../resources/theme/Alps.png",
       "../resources/theme/objects/BAlps.png",
       "../resources/theme/objects/YAlps.png"],

               ["../resources/theme/Hawaii.png",
       "../resources/theme/objects/BHawaii.png",
       "../resources/theme/objects/YHawaii.png"],

               ["../resources/theme/Morocco.png",
       "../resources/theme/objects/BMorocco.png",
       "../resources/theme/objects/YMorocco.png"],

               ["../resources/theme/Nepal.png",
       "../resources/theme/objects/BNepal.png",
       "../resources/theme/objects/YNepal.png"],

               ["../resources/theme/Tokyo.png",
       "../resources/theme/objects/BTokyo.png",
       "../resources/theme/objects/YTokyo.png"],

               ["../resources/theme/ISS.png",
       "../resources/theme/objects/BISS.png",
       "../resources/theme/objects/YISS.png"]
    ];
    Main.themeAssets = levelThemeAssets[levelNum];

    if (condition === 0)
        allVariantAssets.push.apply(allVariantAssets, nongameAssets);
    if (condition === 1)
        allVariantAssets.push.apply(allVariantAssets, pointsAssets);
    if (condition === 2)
    {
        allVariantAssets.push.apply(allVariantAssets, themeAssets);
        allVariantAssets.push.apply(allVariantAssets, Main.themeAssets);
    }
    
    PIXI.loader.add(allVariantAssets).load();
}

//This is the game loop
Main.prototype.update = function ()
{
    requestAnimationFrame(this.update.bind(this));

    now = Date.now();
    delta = now - then;

    if (delta > interval)
    {
        then = now - (delta % interval);
        var speedfactor = delta / idealDelta;

        this.viewManager.currentView.mainLoop(speedfactor);
        this.viewManager.checkAllScreens();
        this.renderer.render(this.stage);

    }
   // this.update();
};

function getUrlVars()
{
    var vars = {};
    window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,
    function (m, key, value)
    {
        vars[key] = value;
    });
    return vars;
}

