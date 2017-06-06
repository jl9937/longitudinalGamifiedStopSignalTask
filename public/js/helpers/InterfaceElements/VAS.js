VAS.prototype = Object.create(PIXI.Graphics.prototype);

//Generic big horizontal button that changes colour on click.
//You can input the vertical postion, it's text, and what happens when you click it.
function VAS(_yCenter, _xCenter, _lowend, _highend, _callbackOnValueSet)
{
    PIXI.Graphics.call(this);

    this.lowend = _lowend;
    this.highend = _highend;
    this.mark = -1;

    this.yLowerBound = _yCenter - 200;
    this.yHeight = 400;
    this.xLowerBound = _xCenter - 250 ;
    this.xWidth = 500 ;
    this.lineY = _yCenter - 2;

    this.lineStyle(2, 0x000000);
    this.beginFill(ClickButton.DOWN_COLOUR);
    this.drawRect(this.xLowerBound, this.lineY, this.xWidth, 6);

    this.callbackOnValueSet = _callbackOnValueSet;

    this.hitArea = new PIXI.Rectangle(this.xLowerBound, this.yLowerBound, this.xWidth, this.yHeight);
    this.interactive = true;
    var self = this;
    this.holding = false;
    this.touchstart = this.mousedown = function(e) { self.clickDown(e); };
    this.touchend = this.mouseup = this.mouseout = function(e) { self.clickUp(e); };
    this.touchmove = this.mousemove = function (e) { self.drag(e); };

    var lowendText = new PIXI.Text(this.lowend, { font: "25px Arial", fill: "#FFFFFF" });
    lowendText.anchor = new PIXI.Point(1, 0.5);
    lowendText.x = this.xLowerBound - 15;
    lowendText.y = _yCenter;

    var highendText = new PIXI.Text(this.highend, { font: "25px Arial", fill: "#FFFFFF" });
    highendText.anchor = new PIXI.Point(0, 0.5);
    highendText.x = this.xLowerBound + this.xWidth +15;
    highendText.y = _yCenter;

    this.addChild(lowendText);
    this.addChild(highendText);

    this.markerGraphic = new PIXI.Graphics();
    this.addChild(this.markerGraphic);
}


VAS.prototype.placeMarker = function(x)
{
    this.markerGraphic.clear();
    this.markerGraphic.lineStyle(2, 0x000000);
    this.markerGraphic.beginFill(0xffc000);

    x = x < this.xLowerBound ? this.xLowerBound : x;
    x = x > (this.xLowerBound + this.xWidth) ? (this.xLowerBound + this.xWidth) : x;

    this.markerGraphic.drawCircle(x, this.lineY + 2.5, 10);
    this.mark = round((x - this.xLowerBound) / this.xWidth * 100, 2);
    this.callbackOnValueSet();
}

VAS.prototype.clickDown = function(mouseData)
{
    this.holding = true;
    this.placeMarker(mouseData.data.getLocalPosition(this).x);
}

VAS.prototype.clickUp = function (mouseData)
{
    this.holding = false;
}

VAS.prototype.drag = function(mouseData)
{
    if(this.holding === true)
        this.placeMarker(mouseData.data.getLocalPosition(this).x);
}

function round(value, exp)
{
    if (typeof exp === 'undefined' || +exp === 0)
        return Math.round(value);

    value = +value;
    exp = +exp;

    if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0))
        return NaN;

    // Shift
    value = value.toString().split('e');
    value = Math.round(+(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp)));

    // Shift back
    value = value.toString().split('e');
    return +(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp));
}