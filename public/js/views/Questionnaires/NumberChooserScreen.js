NumberChooserScreen.prototype = Object.create(ComboBoxScreen.prototype);

//Extension of ComboBoxScreen that creates a chooser between two numbers
function NumberChooserScreen(_session, _questionnaireTitle, _question, _shortQuestion, lowend, highend, _nextScreenToGoTo)
{
    ComboBoxScreen.call(this);
    this.session = _session;
    this.question = _question;
    this.questionnaireTitle = _questionnaireTitle;
    this.shortQuestion = _shortQuestion;
    this.buttonText = "Next";
    this.nextScreenToGoTo = _nextScreenToGoTo || "";

    this.valueArray = [];
    for (var i = lowend; i < highend+1; i++)
        this.valueArray.push(i);
}