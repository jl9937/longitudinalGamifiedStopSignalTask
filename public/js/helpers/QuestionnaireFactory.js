function createQuestionnaire(type, session, nextScreenNumber)
{
    var questionnaireArray;
    var questionnaireScreenNumber;
    var questionnaireFinalScreenNumber;
    if (type === "engagement")
    {
        questionnaireArray = createEngagementQuestionnaire(session);
        questionnaireScreenNumber = "QUEST_ENGAGEMENT";
        questionnaireFinalScreenNumber = "QUEST_ENGAGEMENT11";
    }
    else if (type === "shortengagement")
    {
        questionnaireArray = createShortEngagementQuestionnaire(session);
        questionnaireScreenNumber = "QUEST_ENGAGEMENT_SHORT";
        questionnaireFinalScreenNumber = "QUEST_ENGAGEMENT_SHORT6";
    }
    else if (type === "free")
    {
        questionnaireArray = createFreeTextQuestionnaire(session);
        questionnaireScreenNumber = "QUEST_FREETEXT";
        questionnaireFinalScreenNumber = "QUEST_FREETEXT4";
    }
    else if (type === "perseverance")
    {
        questionnaireArray = createPerseverenceQuestionnaire(session);
        questionnaireScreenNumber = "QUEST_PERSEVERANCE";
        questionnaireFinalScreenNumber = "QUEST_PERSEVERANCE11";
    }
    else if (type === "demographics")
    {
        questionnaireArray = createDemographicsQuestionnaire(session);
        questionnaireScreenNumber = "QUEST_DEMOGRAPHICS";
        questionnaireFinalScreenNumber = "QUEST_DEMOGRAPHICS6";
    }

    shuffleArray(questionnaireArray);
    for (var i = 0; i < questionnaireArray.length - 1; i++)
        questionnaireArray[i].nextScreenToGoTo = questionnaireScreenNumber + (2 + i);
    questionnaireArray[questionnaireArray.length - 1].nextScreenToGoTo = questionnaireFinalScreenNumber;

    var postQuestionnaireScreen = new GenericScreen(session.condition, {text: "Thank you for your responses\n\n", buttonText: "Next", nextScreenToGoTo: nextScreenNumber, buttonYPos: Main.SCREEN_HEIGHT - 80});
    questionnaireArray.push(postQuestionnaireScreen);

    return questionnaireArray;
}

//length 10
function createPerseverenceQuestionnaire(session)
{
    var questionnaireArray = []; 
    questionnaireArray[0] = new VASScreen(session, "perseverence", "I generally like to see things through to the end",                                        "seeThingsThrough",    "I disagree",   "I agree");
    questionnaireArray[1] = new VASScreen(session, "perseverence", "I tend to give up easily", "giveUpEasily", "I disagree", "I agree");
    questionnaireArray[2] = new VASScreen(session, "perseverence", "Unfinished tasks really bother me", "unfinishedTask", "I disagree", "I agree");
    questionnaireArray[3] = new VASScreen(session, "perseverence", "Once I get going on something I hate to stop", "hateToStop", "I disagree", "I agree");
    questionnaireArray[4] = new VASScreen(session, "perseverence", "I concentrate easily", "concentrateEasily", "I disagree", "I agree");
    questionnaireArray[5] = new VASScreen(session, "perseverence", "I finish what I start", "finishWhatIStart", "I disagree", "I agree");
    questionnaireArray[6] = new VASScreen(session, "perseverence", "I'm pretty good about pacing myself so as to get things done on time", "pacingMyself", "I disagree", "I agree");
    questionnaireArray[7] = new VASScreen(session, "perseverence", "I am a productive person who always gets the job done", "productivePerson", "I disagree", "I agree");
    questionnaireArray[8] = new VASScreen(session, "perseverence", "Once I start a project, I almost always finish it", "alwaysFinish", "I disagree", "I agree");
    questionnaireArray[9] = new VASScreen(session, "perseverence", "There are so many little jobs that need to be done\nthat I sometimes just ignore them all", "ignoreLittleJobs", "I disagree", "I agree");
    return questionnaireArray;
}

//length 10
function createEngagementQuestionnaire(session)
{
    var questionnaireArray = []; 
    questionnaireArray[0] = new VASScreen(session, "engagementLong", "How enjoyable did you find that?",                                  "enjoyable",            "Not very enjoyable",       "Very enjoyable");
    questionnaireArray[1] = new VASScreen(session, "engagementLong", "How frustrating did you find that?", "frustrating", "Not very frustrating", "Very frustrating");
    questionnaireArray[2] = new VASScreen(session, "engagementLong", "How difficult was it to concentrate for the duration of that?", "concentrate", "Not very difficult", "Very difficult");
    questionnaireArray[3] = new VASScreen(session, "engagementLong", "How well do you think you performed on that?", "performance", "Not very well", "Very well");
    questionnaireArray[4] = new VASScreen(session, "engagementLong", "How mentally stimulating did you find that?", "stimulating", "Not very stimulating", "Very stimulating");
    questionnaireArray[5] = new VASScreen(session, "engagementLong", "How boring did you find that?", "boring", "Not very boring", "Very boring");
    questionnaireArray[6] = new VASScreen(session, "engagementLong", "How much effort did you put in throughout that?", "effort", "Not much effort", "Lots of effort");
    questionnaireArray[7] = new VASScreen(session, "engagementLong", "How repetitive did you find that?", "repetative", "Not very repetitive", "Very repetitive");
    questionnaireArray[8] = new VASScreen(session, "engagementLong", "How willing would you be to do that again tomorrow?", "willingToRepeat", "Not very willing", "Very willing");
    questionnaireArray[9] = new VASScreen(session, "engagementLong", "How willing would you be to recommend the study to a friend?", "willingToRecommend", "Not very willing", "Very willing");
    return questionnaireArray;
}

//length 5
function createShortEngagementQuestionnaire(session)
{
    var questionnaireArray = [];
    questionnaireArray[0] = new VASScreen(session, "engagementShort", "How enjoyable did you find that?",                         "enjoyableShort",            "Not very enjoyable",       "Very enjoyable");
    questionnaireArray[1] = new VASScreen(session, "engagementShort", "How frustrating did you find that?", "frustratingShort", "Not very frustrating", "Very frustrating");
    questionnaireArray[2] = new VASScreen(session, "engagementShort", "How mentally stimulating did you find that?", "stimulatingShort", "Not very stimulating", "Very stimulating");
    questionnaireArray[3] = new VASScreen(session, "engagementShort", "How repetitive did you find that?", "repetativeShort", "Not very repetitive", "Very repetitive");
    questionnaireArray[4] = new VASScreen(session, "engagementShort", "How willing would you be to do that again tomorrow?", "willingToRepeatShort", "Not very willing", "Very willing");
    return questionnaireArray;
}

//length 5
function createDemographicsQuestionnaire(session)
{
    var questionnaireArray = [];
    questionnaireArray[0] = new NumberChooserScreen(session, "demographics", "What is your age?", "age", 18, 70);
    questionnaireArray[1] = new ComboBoxScreen(session, "demographics", "What is your sex?", "sex", ["Male", "Female"]);
    questionnaireArray[2] = new ComboBoxScreen(session, "demographics", "What is your ethnicity?", "ethnicity", ["Caucasian", "Central Asian", "South Asian", "East Asian", "Afro-carribean", "Hispanic", "Other"]);
    questionnaireArray[3] = new ComboBoxScreen(session, "demographics", "What is the highest level of education you have attained?", "education", ["None", "GCSEs/High School", "A-levels/Higher Education", "Bachelors Degree/University", "Postgraduate Degree"]);
    questionnaireArray[4] = new NumberChooserScreen(session, "demographics", "Roughly how many hours a week do you spend playing video games?", "videogamehours", 0, 100);
    return questionnaireArray;
}

//length 3
function createFreeTextQuestionnaire(session)
{
    var questionnaireArray = [];
    questionnaireArray[0] = new FreeTextScreen(session, "freeText", "Have you noticed any bugs or errors in the experiment so far?", "bugsFreeText");
    questionnaireArray[1] = new FreeTextScreen(session, "freeText", "Are you enjoying the experiment so far? Is there anything you would change?", "enjoyedFreeText");
    questionnaireArray[2] = new FreeTextScreen(session, "freeText", "What has motivated you to take part in the experiment so far?", "motivationFreeText");
    return questionnaireArray;
}

function shuffleArray(array)
{
    for (var i = 0; i < array.length; i++)
    {
        var swapIndex = i + Math.floor(Math.random() * (array.length - i));
        var temp = array[i];
        array[i] = array[swapIndex];
        array[swapIndex] = temp;
    }
}