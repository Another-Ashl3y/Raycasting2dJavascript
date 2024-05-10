let width;
let height;

let board;
let light;
let cars;
let night = true;

let SCALE = 4;

let frames = 0;
let lastFrame = Date.now();
let NORM = 10;
let FPS = 10;
let delta = 0;

let background = greyify(0,11,0);
let colourRed = greyify(255,0,0);
let colourGreen = greyify(0,255,0);
let colourBlue = greyify(0,0,255);
let colourWhite = greyify(255,255,255);
let colourGrey = greyify(140,140,140);

let canvas;
let context;

console.log("begin script");
// alert("Weird wobble is because of d += 2 line 98")

window.onload = function ready() {
    width = 256;
    height = 256;

    board = make_board()
    light = new Light(width/2,height/2, 30);

    cars = [new Car(width/2, height/2),new Car(width/2, height/2)];

    document.onkeydown = move;

    canvas = document.getElementById("canvas");

    if (canvas) {
        context = canvas.getContext("2d");
        canvas.width = width*SCALE;
        canvas.height = height*SCALE;
        setInterval(update, 0);
    }
}

function greyify(r,g,b) {
    let out = (Math.max(r,g,b) + Math.min(r,g,b))/2;
    return out;
}
function toRGB(x) {
    return "rgb("+x.join(",")+")"; 
}
function make_board() {
    let guide = [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,1,1,3,3,3,3,2,2,0,0,0,1],
        [1,0,0,0,1,0,0,0,0,0,0,2,0,0,0,1],
        [1,0,0,0,3,0,0,0,0,0,0,3,0,0,0,1],
        [1,0,0,0,3,0,4,4,4,4,4,3,0,0,0,1],
        [1,0,0,0,1,0,4,4,4,4,4,3,0,0,0,1],
        [1,0,0,0,1,1,4,4,4,4,4,3,0,0,0,1],
        [1,0,0,0,0,1,0,4,4,4,4,1,0,0,0,1],
        [1,0,0,0,0,3,0,0,0,1,1,1,0,0,0,1],
        [1,0,0,0,0,3,3,3,3,1,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ]
    let cell_size = height/guide.length;
    let b = [];
    for (let y=0; y < height; y++) {
        b[y] = [];
        for (let x=0; x < width; x++) {
            let mini_y = Math.floor((y)/cell_size);
            let mini_x = Math.floor((x)/cell_size);
            let t = guide[mini_y][mini_x];
            switch(t) {
                case 0:
                    b[y][x] = new Tile();
                    break;
                case 1: // Wall
                    b[y][x] = new Tile(
                        solid=true,
                        opaque=true,
                        colour=[200,200,200]
                    );
                    break;
                case 2: // Glass
                    b[y][x] = new Tile(
                        solid = true,
                        opaque= false,
                        fluid= false,
                        road = false,
                        colour = [255,255,255]
                    );
                    break;
                case 3: // Water
                    b[y][x] = new Tile(
                        opaque = false,
                        solid = false,
                        fluid = true,
                        road = false,
                        colour = [0,0,255]
                    );
                    break;
                case 4: // Road
                    b[y][x] = new Tile(
                        solid=false,
                        opaque=false,
                        fluid = false,
                        road = true,
                        colour = [100,100,100]
                    );
                    break;
            }
        }
    }
    return b
}
function update() {

    thisFrame = Date.now();
    let current_FPS = 1/((thisFrame - lastFrame)/1000)
    delta = ((NORM)/current_FPS);
    // console.log("DELTA:",Math.round(delta),"- FPS:",Math.round(current_FPS));
    delta = 1;
    lastFrame = thisFrame;

    let current_view = make_board();
    current_view[Math.round(light.y)][Math.round(light.x)] = new Tile(false,false,false);

    // console.log("update");
    // Background
    context.fillStyle = toRGB([0,background,0]);
    context.fillRect(0,0,width*SCALE,height*SCALE);

    // Visible items
    for (let i = 0; i < cars.length; i ++) {
        cars[i].move(current_view);
    }
    light.draw(current_view,255,255,255);
    window.scrollTo(light.x*SCALE,light.y*SCALE-(SCALE*40));

    if (night != true) {
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let t = current_view[y][x];
                context.fillStyle = toRGB([t.red,t.green,t.blue]);
                if (t.solid && t.opaque) {
                    context.fillRect(x*SCALE,y*SCALE,SCALE,SCALE);
                } else if (t.solid) {
                    context.fillRect(x*SCALE,y*SCALE,SCALE,SCALE);
                } else if (t.fluid) {
                    context.fillRect(x*SCALE,y*SCALE,SCALE,SCALE);
                }
            }
        }
    }
}
function degToRad(a) {
    return Math.PI * (a/180);
}
function line(x0,y0,x1,y1) {
    context.beginPath();
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.stroke();
}
function move(e) {
    let key = e.keyCode;
    let vx = Math.cos(degToRad(light.angle))*delta;
    let vy = Math.sin(degToRad(light.angle))*delta;
    let x = light.x;
    let y = light.y;
    if (key == 83 && x-vx < width && x-vx > 0 && y-vy < height && y-vy > 0) {
        if (board[Math.round(y-vy)][Math.round(x-vx)].solid == false) {
            light.y -= vy;
            light.x -= vx;
        }
    }
    if (key == 87 && x+vx < width && x+vx > 0 && y-vy < height && y+vy > 0) {
        if (board[Math.round(y+vy)][Math.round(x+vx)].solid == false) {
            light.y += vy;
            light.x += vx;
        }
    }
    if (key == 65) {
        light.angle -= 3*delta;
    }
    if (key == 68) {
        light.angle += 3*delta;
    }
}
function multiplyMatrices(m1, m2) {

    var result = [];
    for (var i = 0; i < m1.length; i++) {
        result[i] = [];
        for (var j = 0; j < m2[0].length; j++) {
            var sum = 0;
            for (var k = 0; k < m1[0].length; k++) {
                sum += m1[i][k] * m2[k][j];
            }
            result[i][j] = sum;
        }
    }
    return result;
}

class Light {
    constructor(x, y, view_angle=60) {
        this.x = x;
        this.y = y;
        this.visabiliy = 50;
        this.angle = 50;
        this.lines = 100;
        this.view_angle = view_angle;
        this.angles = [];
        let focus = view_angle/(this.lines/2);// view_angle/(this.lines/2);
        for (let i = -view_angle; i < view_angle; i+=focus) {
            this.angles[this.angles.length] = i; 
        }
        console.log(this.angles.length);
    }
    draw (brd, r, g, b, addon=0) {
        context.fillStyle = "white";
        context.fillRect(this.x*SCALE,this.y*SCALE,1*SCALE,1*SCALE);
        for (let i = 0; i < this.angles.length; i++) {
            let angle = this.angles[i];
            for (let d = 2; d < (this.visabiliy*(night)+3); d++) {
                let x = Math.round((d*Math.cos(degToRad(angle+this.angle+addon)))+this.x+Math.random());
                let y = Math.round((d*Math.sin(degToRad(angle+this.angle+addon)))+this.y+Math.random());
                context.fillStyle = "rgba("+[r,g,b,((this.visabiliy-d)/this.visabiliy)].join(",")+")";
                if (x < width && x > 0 && y < height && y > 0){
                    let t = brd[y][x];
                    context.fillStyle = toRGB([t.red,t.green,t.blue]);
                    if ((i == 0 || i == this.angles.length-1) && this.view_angle < 180) {
                        context.fillRect(x*SCALE,y*SCALE,0.75,0.75);
                    } 
                    else {
                        context.fillRect((0.5+x)*SCALE,(y+0.5)*SCALE,0.25,0.2);
                    }
                    if ((t.solid || t.fluid && x != this.x & y != this.y)){
                        context.strokeStyle = "green";
                        // context.fillStyle = toRGB([t.red,t.green,t.blue]);
                        if (t.solid&&t.opaque) {
                            context.fillRect(x*SCALE,y*SCALE,SCALE,SCALE);
                        } else if (t.solid) {
                            context.fillRect(x*SCALE,y*SCALE,0.75*SCALE,0.75*SCALE);

                        }
                        else if (t.fluid) {
                            context.fillRect(x*SCALE,y*SCALE,1,1);
                        }
                        else if (t.road) {
                            context.fillRect(x*SCALE,y*SCALE,SCALE,SCALE);
                        }
                        if (brd[y][x].opaque) {
                            break;
                        }
                    }
                    if (d == this.visabiliy-1) {
                        context.strokeStyle = "green";
                        context.fillStyle = "green";
                        context.lineWidth = 0.1;
                        context.fillRect(x*SCALE,y*SCALE,0.5,0.5);
                    }
                }
            }
        }
    }
}
class Car {
    constructor(x,y) {
        this.x = x;
        this.y = y;
        this.light = new Light(x,y, 180);
        this.light.visabiliy = 20;
        this.angle = 90;
        this.sight = 30;
        this.speed = 2;
        this.angles = [-45,-30,-15,0,15,30,45];
    }
    move(b) {
        let collided = false;
        for (let i = 0; i < this.angles.length; i++) {
            let angle = this.angles[i];
            for (let d = 2; d < this.sight; d++) {
                let x = Math.round((d*Math.cos(degToRad(angle+this.angle)))+this.x);
                let y = Math.round((d*Math.sin(degToRad(angle+this.angle)))+this.y);
                // context.fillStyle = "white";
                // context.fillRect(x*SCALE,y*SCALE,1,1);
                if (y < height && y > 0 && x < width && x > 0) {
                    if (b[y][x].road==false) {
                        collided = true;
                        this.angle -= (i - (this.angles.length/2)) * 5*delta;
                        break;
                    }
                }
            }
            if (collided) {
                break;
            }
        }
        if (collided == false) {
            this.angle += (Math.random()-0.5) * 15*delta;
        }
        this.x += this.speed*Math.cos(degToRad(this.angle))*delta;
        this.y += this.speed*Math.sin(degToRad(this.angle))*delta;
        this.show(b);
    }
    show(b) {
        for (let i = -2; i < 2; i++) {
            for (let j = -5; j < 5; j++) {
                let positions = [
                    [j],
                    [i]
                ];
                let rotation = [
                    [Math.cos(degToRad(this.angle)), -Math.sin(degToRad(this.angle))],
                    [Math.sin(degToRad(this.angle)),  Math.cos(degToRad(this.angle))]
                ];
                let rotated = multiplyMatrices(rotation,positions);
                let x = Number(rotated[0]) + this.x;
                let y = Number(rotated[1]) + this.y;
                b[Math.round(y)][Math.round(x)] = new Tile(
                    solid=true,
                    opaque = false,
                    fluid = false,
                    road=false,
                    colour = [255,0,0]
                );
            }
        }
        this.light.x = this.x;
        this.light.y = this.y;
        this.light.angle = this.angle;
        // this.light.draw(b, 0, colourGrey, 0);
    } 
}
class Tile {
    constructor(solid=false, opaque=false, fluid=false, road=false,colour = [255,255,255]) {
        this.solid = solid;
        this.opaque = opaque;
        this.fluid = fluid;
        this.road = road;
        this.red = colour[0];
        this.green = colour[1];
        this.blue = colour[2];
    }
}







