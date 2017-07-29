var blo = {
    ctx: undefined,
    line: 0,
    resize_timeout: undefined,
    config: {
        theme_index: 0,
        theme_change_rate: 8,//%
        scale: 1,
        device_size: 0,
        device: [
            {width: 0, id: 0, config:{scale: 0.5}},
            {width: 600, id: 1, config:{scale: 1}},
            {width: 960, id: 2, config:{scale: 1}},
            {width: 1440, id: 3, config:{scale: 1}}
        ],
        weather: {
            weather_index: 0,
            weathers: [
                //{id: "sun", cloud: "light", overlay: [{r:0,g:0,b:0,a:0},{r:0,g:0,b:0,a:0}]},
                {id: "storm", rain: true, cloud: "cover", thunder: true, overlay: [{r:0,g:0,b:0,a:0.8},{r:0,g:0,b:0,a:0}]}
            ],
            change_rate: 3,
            rain: {
                line_x: 0,
                line_y: 0,
                xs: 5,
                ys: 15,
                speed_x: 7,
                speed_y: 30,
                color: "#FFF",
                max_drops: 0.2, //per px
                spawns_per_loop: 0.007, //per px,
                spawn_rate: 50,
            },
            thunder: {
                spawn_rate: 10,
                color1: {r:256,g:256,b:256,a:0},
                color2: {r:256,g:256,b:256,a:1},
            },
            cloud: {
                spawn_rate_storm: 50,
                spawn_rate_light: 10,
                max_storm: 0.02,
                max_light: 0.003,
                max_y: 100,
                min_y: -200,
            }
        },
        background: {
            fade_speed: 1,
            fade_speed_a: 0.1,
            color_change_rate: 30,//%
            themes: [
                {
                    theme: "day",
                    top: [
                        "rgba(224,244,138,0.5)",
                        "rgba(165,235,137,0.5)",
                        "rgba(34,206,163,0.5)",
                    ],
                    bottom: [
                        "rgba(224,244,138,0.5)",
                        "rgba(165,235,137,0.5)",
                        "rgba(34,206,163,0.5)",
                    ]
                },
                {
                    theme: "light evening",
                    top: [
                        "rgba(104,138,196,1)",
                        "rgba(76,123,178,1)",
                        "rgba(139,126,157,1)"
                    ],
                    bottom: [
                        "rgba(250,139,126,1)",
                        "rgba(206,159,41,1)",
                        "rgba(254,235,34,1)",
                    ]
                },
                {
                    theme: "night",
                    top: [
                        "rgba(67,95,138,1)",
                        "rgba(46,30,68,1)",
                        "rgba(87,41,102,1)"
                    ],
                    bottom: [
                        "rgba(254,171,213,1)",
                        "rgba(219,102,192,1)",
                        "rgba(149,67,159,1)"
                    ]
                }
            ]
        },
    },
    parts: {
        clouds: {
            storm: [
                {img: document.getElementById('cloud_frag_1_b'), width: 500},
                {img: document.getElementById('cloud_frag_2_b'), width: 220},
                {img: document.getElementById('cloud_frag_3_b'), width: 280},
                {img: document.getElementById('cloud_frag_4_b'), width: 190},
            ],
            light: [
                {img: document.getElementById('cloud_frag_1'), width: 500},
                {img: document.getElementById('cloud_frag_2'), width: 220},
                {img: document.getElementById('cloud_frag_3'), width: 280},
                {img: document.getElementById('cloud_frag_4'), width: 190},
            ]
        },
        isles: [
            {img: document.getElementById('ground_frag_1'), width: 1500, height: 600, leftHor: 330, rightHor: 350},
            {img: document.getElementById('ground_spacer_1'), width: 500, height: 1000, leftHor: 300, rightHor: 250},
            {img: document.getElementById('ground_spacer_2'), width: 500, height: 1000, leftHor: 320, rightHor: 600},
            {img: document.getElementById('ground_isle_2'), width: 1200, height: 800, leftHor: 320, rightHor: 600},
        ]
    },
    moving: {
        sky: [],
        ground: [],
        background: {
            col1: undefined,
            col2: undefined,
            col1_cur: undefined,
            col2_cur: undefined,
        },
        overlay: {
            col1: undefined,
            col2: undefined,
            col1_cur: undefined,
            col2_cur: undefined,
        },
        thunder: undefined,
        rain: []
    },

    init: function () {
        var c = document.getElementById("blo");
        this.ctx = c.getContext("2d");
        this.resize(this.ctx);

        this.change_theme();
        this.change_weather();
        this.spawn_background_both();
        this.spawn();

        window.onresize = function () {
            blo.resize(blo.ctx);
        };
        setInterval(function () {
            blo.spawn();
        }, 1000 / 2);
        setInterval(function () {
            blo.move();
            blo.draw(blo.ctx);
        }, 1000 / 60);
    },
    resize: function (ctx) {
        if (this.resize_timeout != undefined) {
            lo_clear();
        }
        this.resize_timeout = setTimeout(function () {
            ctx.canvas.width = window.innerWidth;
            ctx.canvas.height = window.innerHeight;

            var index = 0;
            for (var i = 0; i < blo.config.device.length; i++) {
                if (window.innerWidth >= blo.config.device[i].width) {
                    blo.config.device_size = blo.config.device[i].id;
                    index = i;
                }
            }
            blo.config = blo.merge_config(blo.config, blo.config.device[index].config);
            lo_clear();
        }, 50);

        function lo_clear() {
            clearTimeout(blo.resize_timeout);
            blo.resize_timeout = undefined;
        }
    },
    draw: function (ctx) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.beginPath();

        this.draw_overlay(ctx, this.moving.background.col1_cur, this.moving.background.col2_cur);

        ctx.scale(this.config.scale, this.config.scale);

        for (var i = 0; i < this.moving.sky.length; i++) {
            ctx.drawImage(this.moving.sky[i].img, this.moving.sky[i].x, this.moving.sky[i].y);
        }
        for (var i = 0; i < this.moving.ground.length; i++) {
            ctx.drawImage(this.moving.ground[i].img, this.moving.ground[i].x, this.moving.ground[i].y*(1/this.config.scale));
        }

        ctx.scale(1/this.config.scale,1/this.config.scale);

        this.draw_rain(ctx);
        this.draw_overlay(ctx, this.moving.overlay.col1_cur, this.moving.overlay.col2_cur);
        this.draw_thunder(ctx);

        ctx.closePath();
    },
    move: function () {
        this.line++;
        this.move_background();
        this.move_sky();
        this.move_ground();
        this.move_rain();
        this.move_overlay();
    },
    spawn: function () {
        if (Math.floor(Math.random() * 100) + 1 <= this.config.theme_change_rate) {
            this.change_theme();
            console.log("Theme changed " + this.config.background.themes[this.config.theme_index].theme);
        }
        if (this.moving.ground.length == 0) {
            this.spawn_ground();
        }
        if (Math.floor((Math.random() * 100) + 1) <= this.config.background.color_change_rate) {
            var x = true;
            if (Math.floor(Math.random() * 2) == 0) {
                x = false;
            }
            this.spawn_background(x);
        }
        if (Math.floor(Math.random() * 100) + 1 <= this.config.weather.change_rate) {
            this.change_weather();
        }
        this.spawn_cloud();
        this.spawn_thunder();
    },
    draw_overlay: function (ctx, color1, color2) {
        this.draw_gradient(ctx, [
            {pos: 0, color: "rgba(" + color1.r + "," + color1.g + "," + color1.b + "," + color1.a + ")"},
            {pos: 1, color: "rgba(" + color2.r + "," + color2.g + "," + color2.b + "," + color2.a + ")"},
        ]);
    },
    draw_gradient: function (ctx, colors) {
        var background_grad = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
        for (var i = 0; i < colors.length; i++) {
            background_grad.addColorStop(colors[i].pos, colors[i].color);
        }
        ctx.fillStyle = background_grad;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    },
    draw_rain: function (ctx) {
        for (var i = 0; i < this.moving.rain.length; i++) {
            ctx.strokeStyle = this.config.weather.rain.color;
            var x = Math.floor(this.config.weather.rain.line_x - this.moving.rain[i].start_x + this.moving.rain[i].xr);
            var y = Math.floor(this.config.weather.rain.line_y - this.moving.rain[i].start_y);
            ctx.moveTo(x, y);
            ctx.lineTo(x + this.config.weather.rain.xs, y + this.config.weather.rain.ys);
            if (x > ctx.canvas.width || y > ctx.canvas.height) {
                this.moving.rain.splice(i, 1);
            }
            ctx.stroke();
        }
    },
    draw_thunder: function (ctx) {
        if (this.moving.thunder != undefined) {
            var del = 0;
            this.draw_overlay(ctx, this.moving.thunder[0], this.moving.thunder[1]);
            for (var i = 0; i < this.moving.thunder.length; i++) {
                if (this.moving.thunder[i].a > 0) {
                    this.moving.thunder[i].a = this.moving.thunder[i].a - 0.1;    ////????
                    if (this.moving.thunder[i].a < 0) {
                        this.moving.thunder[i].a = 0;
                    }
                }
                if (del < this.moving.thunder[i].a) {
                    del = this.moving.thunder[i].a;
                }
            }
            if (del == 0) {
                this.moving.thunder = undefined;
            }
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
            //this.moving.ground[i].x = this.line - this.moving.ground[i].start - this.moving.ground[i].width;
            this.moving.ground[i].y = this.ctx.canvas.height - (this.moving.ground[i].bottom_offset*this.config.scale);
            this.moving.ground[i].x = (this.ctx.canvas.width*(1/this.config.scale)-this.moving.ground[i].width)/2;
        }
        if (this.moving.ground.length == 0) {
            this.spawn_ground();
        }

    },
    move_overlay_fade: function (aim, cur) {
        cur.r = move_overlay_fade_x(aim.r, cur.r, this.config.background.fade_speed, false);
        cur.g = move_overlay_fade_x(aim.g, cur.g, this.config.background.fade_speed, false);
        cur.b = move_overlay_fade_x(aim.b, cur.b, this.config.background.fade_speed, false);
        cur.a = move_overlay_fade_x(aim.a, cur.a, this.config.background.fade_speed_a, true);

        return cur;

        function move_overlay_fade_x(aim, cur, speed, op) {
            if (cur > aim) {
                cur = cur - speed;
            } else if (cur < aim) {
                cur = cur + speed;
            }

            if(op){
                if(op && cur < 0){
                    cur = 0;
                } else if(op && cur > 1){
                    cur = 1;
                }
                cur = Number(cur.toFixed(1));
            }

            return cur;
        }
    },
    move_background: function () {
        if (this.moving.background.col1_cur == undefined) {
            this.moving.background.col1_cur = this.moving.background.col1;
            this.moving.background.col2_cur = this.moving.background.col2;
        }

        this.moving.background.col1_cur = this.move_overlay_fade(this.moving.background.col1, this.moving.background.col1_cur);
        this.moving.background.col2_cur = this.move_overlay_fade(this.moving.background.col2, this.moving.background.col2_cur);
    },
    move_overlay: function () {
        this.moving.overlay.col1_cur = this.move_overlay_fade(this.moving.overlay.col1, this.moving.overlay.col1_cur);
        this.moving.overlay.col2_cur = this.move_overlay_fade(this.moving.overlay.col2, this.moving.overlay.col2_cur);
    },
    move_rain: function () {
        //console.log(this.ctx.canvas.width * this.config.weather.rain.max_drops + " " + this.moving.rain.length);
        if (this.config.weather.weathers[this.config.weather.weather_index].rain == true
            && this.moving.rain.length < this.ctx.canvas.width * this.config.weather.rain.max_drops
            && Math.floor(Math.random() * 100 <= this.config.weather.rain.spawn_rate)
        ) {
            for(var i = 0; i < Math.floor(this.ctx.canvas.width * this.config.weather.rain.spawns_per_loop); i++){
                var shift = (this.ctx.canvas.height / this.config.weather.rain.speed_y) * this.config.weather.rain.speed_x;
                this.moving.rain.push({
                    xr: Math.floor(Math.random() * (this.ctx.canvas.width + shift) - shift),
                    start_x: this.config.weather.rain.line_x,
                    start_y: this.config.weather.rain.line_y
                });
            }
        }
        if (this.moving.rain.length == 0) {
            this.config.weather.rain.line_x = 0;
            this.config.weather.rain.line_y = 0;
        } else {
            this.config.weather.rain.line_x += this.config.weather.rain.speed_x;
            this.config.weather.rain.line_y += this.config.weather.rain.speed_y;
        }
    },
    change_theme: function () {
        this.config.theme_index = Math.floor(Math.random() * this.config.background.themes.length);
        this.spawn_background_both();
    },
    change_weather: function () {
        this.config.weather.weather_index = Math.floor(Math.random() * this.config.weather.weathers.length);

        this.moving.overlay.col1 = Object.create(this.config.weather.weathers[this.config.weather.weather_index].overlay[0]);
        this.moving.overlay.col2 = Object.create(this.config.weather.weathers[this.config.weather.weather_index].overlay[1]);
        if(this.moving.overlay.col1_cur == undefined){
            this.moving.overlay.col1_cur = Object.create(this.moving.overlay.col1);
            this.moving.overlay.col2_cur = Object.create(this.moving.overlay.col2);
        }
    },
    spawn_cloud: function () {
        var we = undefined;
        var sp = undefined;
        var clouds = undefined;
        if (this.config.weather.weathers[this.config.weather.weather_index].cloud == "cover") {
            we = Math.floor(this.config.weather.cloud.max_storm * this.ctx.canvas.width);
            sp = this.config.weather.cloud.spawn_rate_storm;
            clouds = this.parts.clouds.storm;
        }
        if (this.config.weather.weathers[this.config.weather.weather_index].cloud == "light") {
            we = Math.floor(this.config.weather.cloud.max_light* this.ctx.canvas.width);
            sp = this.config.weather.cloud.spawn_rate_light;
            clouds = this.parts.clouds.light;
        }
        if (we != undefined && this.moving.sky.length < we && sp != undefined && Math.floor(Math.random() * 100) + 1 <= sp) {
            var cloud = clouds[Math.floor(Math.random() * clouds.length)];
            this.moving.sky.push({
                img: cloud.img,
                x: -cloud.width,
                y: Math.floor(Math.random() * Math.abs(this.config.weather.cloud.min_y - this.config.weather.cloud.max_y)) + this.config.weather.cloud.min_y,
                additionalSpeed: Math.floor(Math.random() * 3),
                start: this.line + cloud.width,
                width: cloud.width,
            });
        }
    },
    spawn_ground: function () {
        var ground = this.parts.isles[3];//this.parts.isles[Math.floor(Math.random() * (this.parts.isles.length))];
        this.moving.ground.push({
            img: ground.img,
            height: ground.height,
            width: ground.width,
            bottom_offset: 600,
            x: 0,
            y: 0,
            start: this.line,
        });
    },
    spawn_background: function (top) {
        var color = this.config.background.themes[this.config.theme_index];
        if (top) {
            color = color.top;
        } else {
            color = color.bottom;
        }
        color = color[Math.floor(Math.random() * color.length)];
        var color_batch = color.split("(")[1].split(")")[0].split(",");
        var color_obj = {
            r: Number(color_batch[0]),
            g: Number(color_batch[1]),
            b: Number(color_batch[2]),
            a: 1
        };
        if (color_batch.length == 4) {
            color_obj.a = Number(color_batch[3]);
        }
        if (top) {
            this.moving.background.col1 = color_obj;
        } else {
            this.moving.background.col2 = color_obj;
        }
    },
    spawn_background_both: function () {
        this.spawn_background(true);
        this.spawn_background(false);
    },
    spawn_thunder: function () {
        if (
            Math.floor(Math.random() * 100) + 1 <= this.config.weather.thunder.spawn_rate &&
            this.config.weather.weathers[this.config.weather.weather_index].thunder == true &&
            this.moving.thunder == undefined
        ) {
            this.moving.thunder = [
                Object.create(this.config.weather.thunder.color1),
                Object.create(this.config.weather.thunder.color2)
            ];
        }
    },
    merge_config: function (a, b) {
        for (var key in b) {
            if ((typeof a[key] === "object") && (a[key] !== null)) {
                a[key] = blo.merge_config(a[key], b[key]);
            }
            else if (b.hasOwnProperty(key)) {
                a[key] = b[key];
            }
        }
        return a;
    },
}

blo.init();
setTimeout(function () {
    document.getElementById("loading").style.opacity = 0;
});
