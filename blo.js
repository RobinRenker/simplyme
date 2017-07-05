var blo = {
    ctx: undefined,
    test: 0,
    init: function () {
        var c = document.getElementById("blo");
        this.ctx = c.getContext("2d");
        this.resize_canvas(this.ctx);

        setInterval(function () {
            blo.draw(blo.ctx);
        }, 1000/60);
    },
    resize_canvas: function (ctx) {
        ctx.canvas.width  = window.innerWidth;
        ctx.canvas.height = window.innerHeight;
    },
    draw: function (ctx) {
        ctx.clearRect(0, 0, ctx.canvas.width,ctx.canvas.height);

        ctx.beginPath();
        ctx.strokeStyle="red";
        ctx.moveTo(0+blo.test,0+blo.test);
        ctx.lineTo(200+blo.test,100+blo.test);
        ctx.stroke();
        ctx.closePath();
        this.test++;
    }
}
blo.init()