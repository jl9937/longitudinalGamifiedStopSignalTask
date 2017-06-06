ClickButton.DEFAULTWIDTH = 300;
ClickButton.DEFAULTPICWIDTH = 155;
ClickButton.DEFAULTHEIGHT = 100;
ClickButton.DEFAULTRAD = 20;

ClickButton.UP_COLOUR = 0xd9d9d9;
ClickButton.DOWN_COLOUR = 0x7f7f7f;

ClickButton.prototype = Object.create(PIXI.Graphics.prototype);

//Generic big horizontal button that changes colour on click.
//You can input the vertical postion, it's text, and what happens when you click it.
function ClickButton(_ypos, _text, callback, _xpos , scale)
{
    PIXI.Graphics.call(this);

    scale = scale || 1;
    this.text = _text;

    if (this.text.endsWith(".png"))
        this.widthVal = scale * ClickButton.DEFAULTPICWIDTH;
    else
        this.widthVal = scale * ClickButton.DEFAULTWIDTH;
    this.heightVal = scale * ClickButton.DEFAULTHEIGHT;
    this.radVal = scale * ClickButton.DEFAULTRAD;

    this.yposVal = _ypos - ClickButton.DEFAULTHEIGHT / 2;
    this.xposVal = _xpos || ((Main.SCREEN_WIDTH / 2) - (this.widthVal / 2));
    
    this.lineStyle(3, 0x000000);
    this.buttonUp();

    this.hitArea = new PIXI.Rectangle(this.xposVal, this.yposVal, this.widthVal, this.heightVal);
    this.interactive = true;
    this.touchstart = this.mousedown = this.buttonDown.bind(this);
    this.mouseout = this.touchout = this.buttonUp.bind(this);
    this.touchend = this.mouseup = this.buttonUp.bind(this, callback);

    var textsize = 40 * scale;

    if (this.text.endsWith(".png"))
    {
        var buttonPic = new PIXI.Sprite.fromImage(this.text);

        var origHeight = buttonPic.height;
        buttonPic.height = this.heightVal * 0.8;
        buttonPic.width = buttonPic.width * (buttonPic.height / origHeight);

        buttonPic.x = this.xposVal + (this.widthVal-buttonPic.width)/2;
        buttonPic.y = this.yposVal + (this.heightVal - buttonPic.height) / 2;

        this.addChild(buttonPic);
    }
    else
    {
        var buttonText = new PIXI.Text(this.text, { font: textsize + "px Arial" });
        buttonText.x = this.xposVal + Math.round(0.5 * (this.widthVal - buttonText.width), 0);
        buttonText.y = this.yposVal + Math.round(0.5 * (this.heightVal - buttonText.height), 0);
        this.addChild(buttonText);
    }
}

ClickButton.prototype.disable =function()
{
    this.interactive = false;
    this.buttonDown();
}

ClickButton.prototype.buttonDown = function ()
{
    this.beginFill(ClickButton.DOWN_COLOUR);
    this.drawRoundedRect(this.xposVal, this.yposVal, this.widthVal, this.heightVal, this.radVal);
}

ClickButton.prototype.buttonUp = function (callback)
{
    this.beginFill(ClickButton.UP_COLOUR);
    this.drawRoundedRect(this.xposVal, this.yposVal, this.widthVal, this.heightVal, this.radVal);
    if (typeof (callback) == "function")
        callback();
}

String.prototype.endsWith = function (suffix)
{
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};