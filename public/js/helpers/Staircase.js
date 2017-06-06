function Staircase(_startingSSD, _goal)
{
    this.startingSSD = _startingSSD;
    this.SSD = this.startingSSD;
    this.goal = _goal;
    this.previousTrialCorrect = undefined;
    this.step = 50;
    this.reversals = 0;
    this.direction = 0;
}

Staircase.prototype.getSSD = function ()
{
    return this.SSD;
}


Staircase.prototype.adjust = function(currentTrialCorrect)
{
    var stepUp = undefined;

    //Determine staircase type and whether it should move up or down
    if (this.goal === 0.5)
    {
        if (currentTrialCorrect)
            stepUp = true;
        else
            stepUp = false;
    }
    else if (this.goal === 0.25)
    {
        if (currentTrialCorrect === true && this.previousTrialCorrect === true)
            stepUp = true;
        else
            stepUp = false;
    }
    else if (this.goal === 0.75)
    {
        if (currentTrialCorrect === false && this.previousTrialCorrect === false)
            stepUp = false;
        else
            stepUp = true;
    }

    //Determine if there's been a change in direction 
    var newDirection = undefined;
    if (stepUp)
    {
        this.SSD = this.SSD + this.step;
        newDirection = 1;
    }
    else
    {
        this.SSD = this.SSD - this.step;
        newDirection = -1;
    }
    //If there has, record it and maybe act on it 
    if (newDirection !== this.direction)
    {
        //console.log("Staircase reversal")
        this.reversals = this.reversals + 1;
        this.direction = newDirection;
        if (this.reversals > 2)
        {
           // console.log("Step size changed");
            this.step = 25;
        }
    }

    //Set the staircase to within bounds
    if (this.SSD <= 0)
    {
        this.reversals = this.reversals + 1;
        this.SSD = 25;
    }
    if (this.SSD > 750)
        this.SSD = 750;

    this.previousTrialCorrect = currentTrialCorrect;
}