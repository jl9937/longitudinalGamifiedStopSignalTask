FallingBall.prototype = Object.create(PIXI.Sprite.prototype);

function FallingBall(_stage)
{
    this.stage = _stage;
    var colour = Math.random() > 0.5 ? "b" : "y";
    if (colour === "b")
        var texture = PIXI.Texture.fromImage("../resources/taskElements/blue.png");
    else
        var texture = PIXI.Texture.fromImage("../resources/taskElements/yellow.png");

    PIXI.Sprite.call(this, texture);


    this.anchor = new PIXI.Point(0.5, 0);
    this.scale = new PIXI.Point(0.3, 0.3);
    this.y = -30;
    this.x = 60;
    this.vy = 0;
    this.vx = 0;

    this.limit = 580;
    this.atFloor = false;

    this.stage.addChild(this);
}

FallingBall.prototype.update = function()
{
    if (this.y > Main.SCREEN_HEIGHT && this.x > Main.SCREEN_WIDTH)
    {
        this.stage.removeChild(this);
        return;
    }

    //gravity
    if (this.atFloor === false)
        this.vy += 1.2;
    else
    {
        this.vx += 0.1;
        this.vy += 0.005 ;
    }

    this.y += this.vy;
    this.x += this.vx;

    if (this.x >= 905)
    {
        this.atFloor = false;
    }

    if (this.y >= this.limit)
    {
        this.atFloor = true;
        this.vy = 0;
        this.y = this.limit;
        this.limit = 10000;
    }


}

