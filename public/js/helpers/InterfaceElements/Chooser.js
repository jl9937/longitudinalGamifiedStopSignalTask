Chooser.prototype = Object.create(PIXI.Graphics.prototype);

Chooser.MARGIN = 10;

//Two big buttons that cycle through a valueArray
function Chooser(_yCenter, _xCenter, _valueArray, scroll, _callbackOnValueSet)
{
    PIXI.Graphics.call(this);

    Chooser.MARGIN = 10;
    this.valueArray = _valueArray;


    var longestInArray = 0;
    for (var i = 0; i < this.valueArray.length; i++)
    {
        if (this.valueArray[i].length > this.valueArray[longestInArray].length)
            longestInArray = i;
    }
    this.text = new PIXI.Text(this.valueArray[longestInArray], { font: "25px Arial", fill: "#FFFFFF" });

    this.xCorner = _xCenter - this.text.width/2;
    this.xWidth = this.text.width + Chooser.MARGIN * 2;
    this.yHeight = this.text.height + Chooser.MARGIN * 2;
    this.yCorner = _yCenter - 20;

    this.lineStyle(2, 0x000000);
    this.beginFill(ClickButton.DOWN_COLOUR);
    this.drawRect(this.xCorner - Chooser.MARGIN, this.yCorner - Chooser.MARGIN, this.xWidth, this.yHeight);

    this.callbackOnValueSet = _callbackOnValueSet;

    var upButton = new ClickButton(_yCenter - 50, "/resources/interface/up.png", this.buttonClicked.bind(this, +1), "", 0.5);
    var downButton = new ClickButton(_yCenter + 85, "/resources/interface/down.png", this.buttonClicked.bind(this, -1), "", 0.5);
    if(scroll)
        this.mousewheelEventListener = document.addEventListener("mousewheel", this.mouseWheelHandler.bind(this, this.mousewheelEventListener), false);

    this.value = 0;

    this.updateText();
    this.addChild(this.text);

    this.addChild(upButton);
    this.addChild(downButton);
}

Chooser.prototype.updateText = function ()
{
    this.text.text = this.valueArray[this.value];
    this.text.x = Math.round(this.xCorner + (this.xWidth - this.text.width - Chooser.MARGIN * 2) / 2, 0);
    this.text.y = Math.round(this.yCorner, 0);
    this.callbackOnValueSet();
}

Chooser.prototype.mouseWheelHandler = function(e)
{
    var e = window.event || e; // old IE support
    var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
    this.buttonClicked(delta);
}

Chooser.prototype.buttonClicked =function(modifier)
{
    this.value = this.value + modifier;
    if (this.value >= this.valueArray.length)
        this.value = 0;
    if (this.value < 0)
        this.value = this.valueArray.length - 1;

    this.updateText();
    
}

