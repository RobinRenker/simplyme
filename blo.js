var blo = {
    ctx: undefined,
    line: 0,
    config: {
        sky: {
            cloud_spawn_rate: 30,
            cloud_max_spawns: 10,
            cloud_max_y: 100,
            cloud_min_y: -200,
        }
    },
    parts: {
        clouds: [
            {img: document.getElementById('cloud_frag_1'), width: 500},
            {img: document.getElementById('cloud_frag_2'), width: 220},
            {img: document.getElementById('cloud_frag_3'), width: 280},
            {img: document.getElementById('cloud_frag_4'), width: 190},
        ],
        isles: [
            {img: document.getElementById('ground_frag_1'), width: 1500, height: 600},
            {img: document.getElementById('ground_spacer_1'), width: 500, height: 1000, leftHor: 300, rightHor: 250},
            {img: document.getElementById('ground_spacer_2'), width: 500, height: 1000, leftHor: 320, rightHor: 600},
        ]
    },
    moving: {
        sky: [],
        ground: [],
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
        for (var i = 0; i < this.moving.sky.length; i++) {
            ctx.drawImage(this.moving.sky[i].img, this.moving.sky[i].x, this.moving.sky[i].y);
        }
        for (var i = 0; i < this.moving.ground.length; i++) {
            ctx.drawImage(this.moving.ground[i].img, this.moving.ground[i].x, this.moving.ground[i].y);
        }
        ctx.closePath();
    },
    move: function () {
        this.line++;
        this.move_sky();
        this.move_ground();
    },
    spawn: function () {
        if ((Math.floor(Math.random() * 100) + 1) <= this.config.sky.cloud_spawn_rate &&
            this.config.sky.cloud_spawn_rate != 0 &&
            this.moving.sky.length < this.config.sky.cloud_max_spawns) {
            this.spawn_cloud();
        }
        if (this.moving.ground.length == 0) {
            this.spawn_ground();
        }
    },
    move_sky: function () {
        for (var i = 0; i < this.moving.sky.length; i++) {
            this.moving.sky[i].start -= this.moving.sky[i].additionalSpeed;
            var x = this.line - this.moving.sky[i].start;
            this.moving.sky[i].x = x;
            if (x > this.ctx.canvas.width) {
                this.moving.sky.splice(i, 1);
            }
        }
    },
    move_ground: function () {
        for (var i = 0; i < this.moving.ground.length; i++) {
            this.moving.ground[i].y = this.ctx.canvas.height - this.moving.ground[i].height;
        }
    },
    spawn_cloud: function () {
        var cloud = this.parts.clouds[Math.floor(Math.random() * (this.parts.clouds.length))];
        this.moving.sky.push({
            img: cloud.img,
            x: -cloud.width,
            y: Math.floor(Math.random() * Math.abs(this.config.sky.cloud_min_y - this.config.sky.cloud_max_y)) + this.config.sky.cloud_min_y,
            additionalSpeed: Math.floor(Math.random() * 3),
            start: this.line + cloud.width,
            width: cloud.width,
        });
    },
    spawn_ground: function () {
        var ground = this.parts.isles[Math.floor(Math.random() * (this.parts.isles.length))];
        this.moving.ground.push({
            img: ground.img,
            height: ground.height,
            x: 0,
            y: 0,
        });
    }
}
blo.init()