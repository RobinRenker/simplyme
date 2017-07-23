var blo = {
    ctx: undefined,
    line: 0,
    config: {
        theme_index: 0,
        theme_change_rate: 3,//%
        sky: {
            cloud_spawn_rate: 30,
            cloud_max_spawns: 10,
            cloud_max_y: 100,
            cloud_min_y: -200,
        },
        background:{
            fade_speed: 1,
            color_change_rate: 30,//%
            themes:[
                {
                    theme:"day",
                    top: [
                        "rgba(224,244,138,0.5)",
                        "rgba(165,235,137,0.5)",
                        "rgba(34,206,163,0.5)",
                    ],
                    bottom:[
                        "rgba(34,206,163,0.5)",
                        "rgba(165,235,137,0.5)",
                        "rgba(53,178,166,0.5)"
                    ]
                },
                {
                    theme:"light evening",
                    top: [
                        "rgba(0,0,0,0.5)",
                        "rgba(0,24,72,0.5)",
                        "rgba(120,144,168,0.5)",
                    ],
                    bottom:[
                        "rgba(53,178,166,1)",
                        "rgba(250,139,126,1)",
                        "rgba(206,159,41,1)"
                    ]
                },
                {
                    theme:"rain",
                    top: [
                        "rgba(0,0,0,0.9)",
                        "rgba(43,40,47,1)",
                        "rgba(64,61,67,1)",
                    ],
                    bottom:[
                        "rgba(58,70,86,1)",
                        "rgba(69,93,124,1)",
                        "rgba(65,49,89,1)"
                    ]
                },
                {
                    theme:"night",
                    top: [
                        "rgba(0,0,0,0.9)",
                        "rgba(43,40,47,1)",
                        "rgba(0,0,0,1)",
                    ],
                    bottom:[
                        "rgba(0,0,0,0.9)",
                        "rgba(43,40,47,1)",
                        "rgba(0,0,0,1)",
                    ]
                }
            ]
        },
        rain:{
            line_x: 0,
            line_y: 0,
            spawn_rate: 80,
            xs: 5,
            ys: 15,
            max_drops: 1000,
            speed_x: 5,
            speed_y: 20,
            color: "#FFF"
        },
        thunder:{
            spawn_rate: 40,
            color1: "256,256,256,",
            color2: "256,256,256,",
            color1_o: 1,
            color2_o: 0,
            color1_p: 0,
            color2_p: 1,
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
            {img: document.getElementById('ground_frag_1'), width: 1500, height: 600, leftHor: 330, rightHor: 350},
            {img: document.getElementById('ground_spacer_1'), width: 500, height: 1000, leftHor: 300, rightHor: 250},
            {img: document.getElementById('ground_spacer_2'), width: 500, height: 1000, leftHor: 320, rightHor: 600},
        ]
    },
    moving: {
        sky: [],
        ground: [],
        background: {
            col1:undefined,
            col2:undefined,
            col1_cur:undefined,
            col2_cur:undefined,
        },
        thunder:undefined,
        rain:[]
    },

    init: function () {
        var c = document.getElementById("blo");
        this.ctx = c.getContext("2d");
        this.resize(this.ctx);

        this.change_theme();
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
        ctx.canvas.width = window.innerWidth;
        ctx.canvas.height = window.innerHeight;
    },
    draw: function (ctx) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.beginPath();

        this.draw_background(ctx);

        for (var i = 0; i < this.moving.sky.length; i++) {
            ctx.drawImage(this.moving.sky[i].img, this.moving.sky[i].x, this.moving.sky[i].y);
        }
        for (var i = 0; i < this.moving.ground.length; i++) {
            ctx.drawImage(this.moving.ground[i].img, this.moving.ground[i].x, this.moving.ground[i].y);
        }

        this.draw_rain(ctx);
        this.draw_thunder(ctx);

        ctx.closePath();
    },
    move: function () {
        this.line++;
        this.move_background();
        this.move_sky();
        this.move_ground();
        this.move_rain();
    },
    spawn: function () {
        if(Math.floor(Math.random() * 100) + 1 <= this.config.theme_change_rate){
            this.change_theme();
            console.log("Theme changed "+this.config.background.themes[this.config.theme_index].theme);
        }
        if ((Math.floor(Math.random() * 100) + 1) <= this.config.sky.cloud_spawn_rate &&
            this.config.sky.cloud_spawn_rate != 0 &&
            this.moving.sky.length < this.config.sky.cloud_max_spawns) {
            this.spawn_cloud();
        }
        if (this.moving.ground.length == 0) {
            this.spawn_ground();
        }
        if(Math.floor((Math.random() * 100) + 1) <= this.config.background.color_change_rate){
            var x = true;
            if(Math.floor(Math.random() * 2) == 0){
                x = false;
            }
            this.spawn_background(x);
        }
        if(Math.floor(Math.random() * 100) + 1 <= this.config.thunder.spawn_rate && this.config.background.themes[this.config.theme_index].theme == 'rain' && this.moving.thunder == undefined){
            this.moving.thunder = [
                {m: this.config.thunder.color1,op: this.config.thunder.color1_o, pos: this.config.thunder.color1_p},
                {m: this.config.thunder.color2,op: this.config.thunder.color2_o, pos: this.config.thunder.color2_p},
            ];
        }
    },
    draw_background: function (ctx) {
        var tmp_1 = this.moving.background.col1_cur;
        var tmp_2 = this.moving.background.col2_cur;
        this.draw_gradient(ctx,[
            {pos: 0, color: "rgba("+tmp_1.r+","+tmp_1.g+","+tmp_1.b+","+tmp_1.a+")"},
            {pos: 1, color: "rgba("+tmp_2.r+","+tmp_2.g+","+tmp_2.b+","+tmp_2.a+")"},
        ])
    },
    draw_gradient: function (ctx, colors) {
        var background_grad = ctx.createLinearGradient(0,0,0, ctx.canvas.height);
        for(var i = 0; i < colors.length; i++){
            background_grad.addColorStop(colors[i].pos, colors[i].color);
        }
        ctx.fillStyle = background_grad;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    },
    draw_rain: function (ctx) {
        ctx.strokeStyle = this.config.rain.color;
        for(var i = 0; i < this.moving.rain.length; i++){
            var x = Math.floor(this.config.rain.line_x - this.moving.rain[i].start_x + this.moving.rain[i].xr);
            var y = Math.floor(this.config.rain.line_y - this.moving.rain[i].start_y);
            ctx.moveTo(x,y);
            ctx.lineTo(x+this.config.rain.xs,y+this.config.rain.ys);
            if(x > ctx.canvas.width || y > ctx.canvas.height){
                this.moving.rain.splice(i, 1);
            }
        }
        ctx.stroke();
    },
    draw_thunder: function (ctx) {
        if(this.moving.thunder != undefined){
            var x = [];
            var del = 0;
            for(var i = 0; i < this.moving.thunder.length; i++){
                x.push({pos: this.moving.thunder[i].pos, color: "rgba("+this.moving.thunder[i].m+this.moving.thunder[i].op+")"})
            }
            this.draw_gradient(ctx, x);
            for(var i = 0; i < this.moving.thunder.length; i++){
                if(this.moving.thunder[i].op > 0){
                    this.moving.thunder[i].op = this.moving.thunder[i].op - 0.1;    ////????
                    if(this.moving.thunder[i].op < 0){
                        this.moving.thunder[i].op = 0;
                    }
                }
                if(del < this.moving.thunder[i].op){
                    del = this.moving.thunder[i].op;
                }
            }
            if(del == 0){
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
            this.moving.ground[i].x = this.line - this.moving.ground[i].start - this.moving.ground[i].width;
            this.moving.ground[i].y = this.ctx.canvas.height - this.moving.ground[i].bottom_offset;
        }
        if(this.moving.ground.length == 0){
            this.spawn_ground();
        }
        var i = this.moving.ground[this.moving.ground.length-1];

    },
    move_background: function () {
        if(this.moving.background.col1_cur == undefined){
            this.moving.background.col1_cur = this.moving.background.col1;
            this.moving.background.col2_cur = this.moving.background.col2;
        }

        this.moving.background.col1_cur = move_background_x(this.moving.background.col1, this.moving.background.col1_cur);
        this.moving.background.col2_cur = move_background_x(this.moving.background.col2, this.moving.background.col2_cur);

        function move_background_x(aim, cur) {
            cur.a = aim.a;

            cur.r = move_background_x_inc(aim.r, cur.r);
            cur.g = move_background_x_inc(aim.g, cur.g);
            cur.b = move_background_x_inc(aim.b, cur.b);

            return cur;
            function move_background_x_inc(aim, cur){
                if(cur > aim){
                    cur = cur - blo.config.background.fade_speed;
                } else if(cur < aim){
                    cur = cur + blo.config.background.fade_speed;
                }
                return cur;
            }
        }
    },
    move_rain: function () {
      if(this.config.background.themes[this.config.theme_index].theme == 'rain'){
        if((Math.floor(Math.random() * 100) + 1) <= this.config.rain.spawn_rate && this.moving.rain.length < this.config.rain.max_drops){
            var shift = (this.ctx.canvas.height / this.config.rain.speed_y)*this.config.rain.speed_x;
            this.moving.rain.push({
                xr: Math.floor(Math.random() * (this.ctx.canvas.width + shift) - shift),
                start_x: this.config.rain.line_x,
                start_y: this.config.rain.line_y
            });
        }
      }
      if(this.moving.rain.length == 0){
          this.config.rain.line_x = 0;
          this.config.rain.line_y = 0;
      } else {
          this.config.rain.line_x += this.config.rain.speed_x;
          this.config.rain.line_y += this.config.rain.speed_y;
      }
    },
    change_theme: function () {
        this.config.theme_index = Math.floor(Math.random() * this.config.background.themes.length);
        this.spawn_background_both();
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
            width: ground.width,
            bottom_offset: 400,
            x: 0,
            y: 0,
            start: this.line,
        });
    },
    spawn_background:function (top) {
        var color = this.config.background.themes[this.config.theme_index];
        if(top){
            color = color.top;
        } else{
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
        if(color_batch.length == 4){
            color_obj.a = Number(color_batch[3]);
        }
        if(top){
            this.moving.background.col1 = color_obj;
        } else {
            this.moving.background.col2 = color_obj;
        }
    },
    spawn_background_both: function () {
        this.spawn_background(true);
        this.spawn_background(false);
    }
}
blo.init();

setTimeout(function () {
    document.getElementById("loading").style.opacity = 0;
});
