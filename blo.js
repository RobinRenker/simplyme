var blo = {
    ctx: undefined,
    line: 0,
    sky_config: {
        cloud_spawn_rate: 30,
        cloud_max_spawns: 10,
        cloud_id: [
            {img: document.getElementById('cloud_frag_1'), width: 500},
            {img: document.getElementById('cloud_frag_2'), width: 220},
            {img: document.getElementById('cloud_frag_3'), width: 280},
            {img: document.getElementById('cloud_frag_4'), width: 190},
        ],
        moving: [],
        cloud_max_y: 100,
        cloud_min_y: -200,
    },
    ground_config: {
        ground_id: [
            {img: document.getElementById('ground_frag_1'), width: 2000, height: 600}
        ],
        moving: [],
    },
    init: function () {
        var c = document.getElementById("blo");
        this.ctx = c.getContext("2d");
        this.resize_canvas(this.ctx);

        window.onresize = function () {
            blo.resize_canvas(blo.ctx);
        };
        setInterval(function () {
            blo.spawn();
        }, 1000 / 2);
        setInterval(function () {
            blo.move();
            blo.draw(blo.ctx);
        }, 1000 / 60);
    },
    resize_canvas: function (ctx) {
        ctx.canvas.width = window.innerWidth;
        ctx.canvas.height = window.innerHeight;
    },
    draw: function (ctx) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        ctx.beginPath();
        for (var i = 0; i < this.sky_config.moving.length; i++) {
            ctx.drawImage(this.sky_config.moving[i].img, this.sky_config.moving[i].x, this.sky_config.moving[i].y);
        }
        for (var i = 0; i < this.ground_config.moving.length; i++) {
            ctx.drawImage(this.ground_config.moving[i].img, this.ground_config.moving[i].x, this.ground_config.moving[i].y);
        }
        ctx.closePath();
    },
    move: function () {
        this.line++;
        this.move_sky();
        this.move_ground();
    },
    spawn: function () {
        if ((Math.floor(Math.random() * 100) + 1) <= this.sky_config.cloud_spawn_rate &&
            this.sky_config.cloud_spawn_rate != 0 &&
            this.sky_config.moving.length < this.sky_config.cloud_max_spawns) {
            this.spawn_cloud();
        }
        if (this.ground_config.moving.length == 0) {
            this.spawn_ground();
        }
    },
    move_sky: function () {
        for (var i = 0; i < this.sky_config.moving.length; i++) {
            this.sky_config.moving[i].start -= this.sky_config.moving[i].additionalSpeed;
            var x = this.line - this.sky_config.moving[i].start;
            this.sky_config.moving[i].x = x;
            if (x > this.ctx.canvas.width) {
                this.sky_config.moving.splice(i, 1);
            }
        }
    },
    move_ground: function () {
        for (var i = 0; i < this.ground_config.moving.length; i++) {
            this.ground_config.moving[i].y = this.ctx.canvas.height - this.ground_config.moving[i].height;
        }
    },
    spawn_cloud: function () {
        var cloud = this.sky_config.cloud_id[Math.floor(Math.random() * (this.sky_config.cloud_id.length))];
        this.sky_config.moving.push({
            img: cloud.img,
            x: -cloud.width,
            y: Math.floor(Math.random() * Math.abs(this.sky_config.cloud_min_y - this.sky_config.cloud_max_y)) + this.sky_config.cloud_min_y,
            additionalSpeed: Math.floor(Math.random() * 3),
            start: this.line + cloud.width,
            width: cloud.width,
        });
    },
    spawn_ground: function () {
        var ground = this.ground_config.ground_id[Math.floor(Math.random() * (this.ground_config.ground_id.length))];
        this.ground_config.moving.push({
            img: ground.img,
            height: ground.height,
            x: 0,
            y: 0,
        });
    }
}
blo.init()