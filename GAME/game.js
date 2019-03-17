var canvas = document.getElementById("pongContainer");

document.addEventListener("ready", function () {
    pong.initializeGame(canvas);

    pong.setGameOver(function (scores) {
        document.getElementById("p1-score").innerText = scores.p1
        document.getElementById("p2-score").innerText = scores.p2
    })
    addStartListener();
});

function sound(id){
      document.getElementById(id).play();
    }

function myFunction() {
  alert("♦ HOW TO PLAY? \n ♦ Player 1: use 'W' and 'S' to move paddle \n ♦ Player 2: use 'O' and 'L' to move paddle");
}

// Ball Class
function Ball(params) {
    var b = this;
    var size = 10;
    var size2 = size / 2;
    var color = 'rgb(360, 0, 0)';
    var ctx = params.ctx;
    var canvas = params.canvas;
    var x = canvas.width / 2;
    var y = canvas.height / 2;
    var speed = 8;
    var degree = 0 * (Math.PI / 180);
    var maxdg = 75 * (Math.PI / 180);

    this.draw = function () {
        ctx.fillStyle = color;
        ctx.fillRect(x - size2, y - size2, size, size);
    }


    this.update = function (p1, p2) {
        var p1Bounds = p1.getBounds();
        var p2Bounds = p2.getBounds();
        if (x > canvas.width / 2) {
            if (x + size2 >= p2Bounds.sleft) {
                if (!(y < p2Bounds.top || y > p2Bounds.bottom)) {
                    rely = y - p2Bounds.y;
                    nory = 2 * rely / p2Bounds.l
                    degree = -(nory * maxdg);
                    speed = - speed;
                    sound('hit');
                } else {
                    sound('miss');
                    return "p1"
                }
            }
        } else {
            if (x - size2 <= p1Bounds.sright ) {
                if (!(y < p1Bounds.top || y > p1Bounds.bottom)) {
                    rely = y - p1Bounds.y;
                    nory = 2 * rely / p1Bounds.l
                    degree = (nory * maxdg);
                    speed = - speed;
                    sound('hit');
                } else {
                    sound('miss');
                    return "p2"
                }
            }
        }
        if (y - size2 < 0 || y + size2 > canvas.height) {
            degree = -degree;
        }

        var dx = speed * Math.cos(degree);
        var dy = speed * Math.sin(degree);

        x += dx;
        y += dy;

        return (x > canvas.width || x < 0);
    }

};

// Paddle Class
function Paddle(pong, player) {
    var p = this;
    var length = 60;
    var width = 10;
    var lb2 =  length/2;
    var wb2 = width/2;
    var dy = 5;
    var color = "rgb(0,0,0)";
    var x = (player) ? 15 : pong.canvas.width - 15;
    var y = pong.canvas.height/2;
    p.ctx = pong.ctx;
    p.canvas = pong.canvas;
    p.keypressed = false;

    p.draw = function () {
        p.ctx.fillStyle = color;
        p.ctx.fillRect(x - wb2, y - lb2, width, length);
    }

    p.move = function (up) {
        y = (up) ? y - dy : y + dy;
        y = (y - lb2 < 0) ? lb2 : y;
        y = (y + lb2 > p.canvas.height) ? p.canvas.height - lb2 : y;
    }

    p.getBounds = function () {
        return {
            x: x,
            y: y,
            w: width,
            l: length,
            sleft: x - wb2,
            sright: x + wb2,
            top: y - lb2,
            bottom: y + lb2
        }
    }
};

// Pong Functions
(function (window) {
    var width = 350;
    var height = 200;
    var pong = {};
    var keypressed = false;
    var ball, p1, p2;
    var score = {
        p1: 0,
        p2: 0
    };
    var gameover = null;

    var states = {
        running: "running",
        reset: "reset",
        gameover: "gameover",
        paused: "paused",
        stopped: "stopped",
    }

    var currentState = states.stopped;

    function drawBoard() {
        pong.ctx.clearRect(0, 0, width, height);
        pong.ctx.beginPath();
        pong.ctx.setLineDash([5]);
        pong.ctx.moveTo(width / 2, 0);
        pong.ctx.lineTo(width / 2, height);
        pong.ctx.stroke();

        ball.draw();
        p1.draw();
        p2.draw();
    }

    function scheduler() {
        switch (currentState) {
            case "running":
                window.requestAnimationFrame(scheduler)

                if (p1.keypressed) {
                    p1.move(p1.keypressed.up);
                }
                if (p2.keypressed) {
                    p2.move(p2.keypressed.up);
                }


                var hitt = ball.update(p1, p2);
                if (hitt) {
                    currentState = states.gameover
                    score[hitt]++;
                }

                drawBoard();
                break;

            case "reset":
                addStartListener();
                publicFunctions.initializeGame(pong.canvas);
                break;

            case "gameover":
                window.requestAnimationFrame(scheduler)
                currentState = states.reset;
                if (gameover) {
                    gameover(score);
                }

            case "stopped":
                break;

            case "paused":
            default:
                break;
        }
    }

    var publicFunctions = {
        initializeGame: function (canvas) {
            canvas.width = width;
            canvas.height = height;

            pong.canvas = canvas;
            pong.ctx = canvas.getContext('2d');

            ball = new Ball(pong);
            p1 = new Paddle(pong, true);
            p2 = new Paddle(pong, false);

            document.addEventListener("keydown", function (e) {
                if (e.key == "w" || e.key == "s") {
                    p1.keypressed = {
                        up: (e.key == "w") ? true : false,
                        code: e.key
                    }
                }

                 if (e.key == "o" || e.key == "l") {
                    p2.keypressed = {
                        up: (e.key == "o") ? true : false,
                        key: e.key
                    }
                }
            })

            document.addEventListener("keyup", function (e) {
                if (p1.keypressed && e.key == p1.keypressed.code) {
                    p1.keypressed = false;
                }

                if (p2.keypressed && e.key == p2.keypressed.key) {
                    p2.keypressed = false;
                }
            })

            drawBoard();
        },

        start: function () {
            currentState = states.running;
            scheduler();
        },

        setGameOver: function (callback) {
            gameover = callback;
        }
    }

    if (window.pong == undefined) {
			window.pong = publicFunctions
			document.dispatchEvent(new Event("ready"));
    }
})(window);

function addStartListener() {
    document.addEventListener("keydown", function startKeystroke(e) {
        var keyPressed = ["s", "w", "Space", "o", "l"].filter(function (key) {
            return key == e.key
        }).length;

        if (keyPressed) {
            pong.start();
            document.removeEventListener("keydown", startKeystroke);
        }
    })
}