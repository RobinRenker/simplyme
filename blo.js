var blo = {
    ctx: undefined,
    sky: {
        cloud_spawn_rate: 5,
        line_counter: 0,
        cloud_id: [
            {img:document.getElementById('cloud_frag_1'), width: 500}
        ],
        moving: []
    },
    init: function () {
        var c = document.getElementById("blo");
        this.ctx = c.getContext("2d");
        this.resize_canvas(this.ctx);



        setInterval(function () {
            blo.spawn();
        }, 1000/2);
        setInterval(function () {
            blo.move();
        }, 1000/60);
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
        for(var i = 0; i < this.sky.moving.length; i++){
            ctx.drawImage(this.sky.moving[i].img, this.sky.moving[i].x, this.sky.moving[i].y);
        }
        ctx.closePath();
    },
    move: function () {
        this.move_sky();
    },
    spawn: function () {
        if((Math.floor(Math.random() * 100) + 1) <= this.sky.cloud_spawn_rate && this.sky.cloud_spawn_rate != 0){
            this.spawn_cloud();
        }
    },
    move_sky: function () {
        this.sky.line_counter++;
        for(var i = 0; i < this.sky.moving.length; i++){
            this.sky.moving[i].start -= this.sky.moving[i].additionalSpeed;
            var x = this.sky.line_counter - this.sky.moving[i].start;
            this.sky.moving[i].x = x;
            console.log(x);
        }
    },
    spawn_cloud: function () {
        var cloud = this.sky.cloud_id[Math.floor(Math.random() * (this.sky.cloud_id.length))];
        this.sky.moving.push({
            img: cloud.img,
            x: 0,
            y: 0,
            additionalSpeed: Math.floor(Math.random() * 5),
            start: this.sky.line_counter+cloud.width,
            width: cloud.width,
        });
    }
}
blo.init()