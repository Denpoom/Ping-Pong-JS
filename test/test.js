var canvas = document.getElementById("pongContainer");

document.addEventListener("pongReady", function () {
    pong.initializeGame(canvas);

    pong.setGameOver(function (scores) {
        document.getElementById("p1-score").innerText = scores.p1
        document.getElementById("p2-score").innerText = scores.p2
    })

    addStartListener();
	
		setTimeout(() => {
    	toast("Player 1: use 'A' and 'S' to move paddle");
    	toast("Player 2: use 'Up arrow' and 'Down arrow' to move paddle");
		}, 0)
});
// a
// Sound Class
function sound(id){
      document.getElementById(id).play();
    }

// Ball Class
function Ball(params) {
    var b = this;
    var size = 10;
    var sb2 = size / 2;
    var color = 'rgb(360, 0, 0)';
    var ctx = params.ctx;
    var canvas = params.canvas;
    var x = canvas.width / 2;
    var y = canvas.height / 2;
    var v = 5;
    var deg = 0 * (Math.PI / 180);
    var MAXDEG = 75 * (Math.PI / 180); // To convert degrees to radians

    // Draw the current ball state
    this.draw = function () {
        ctx.fillStyle = color;
        ctx.fillRect(x - sb2, y - sb2, size, size);
    }
    
    // Update the velocity, angle, position of the ball
    this.update = function (p1, p2) {
        // Check collision with paddles
        var p1Bounds = p1.getBounds();
        var p2Bounds = p2.getBounds();

        // Check which side of the board the ball is
        if (x > canvas.width / 2) {
            // Check if the ball is within the paddle area (x-axis)
            if (x + sb2 >= p2Bounds.sleft) {
                // Check if the ball is in the paddle surface region (y-axis)
                if (!(y < p2Bounds.top || y > p2Bounds.bottom)) {
                    rely = y - p2Bounds.y;
                    nory = 2 * rely / p2Bounds.l
                    deg = -(nory * MAXDEG);
                    v = - v;
                    sound('hit');
                } else {
                    sound('miss');
                    return "p1"
                }
            }
        } else {
            // Check if the ball is within the paddle area (x-axis)
            if (x - sb2 <= p1Bounds.sright ) {
                // Check if the ball is in the paddle surface region (y-axis)
                if (!(y < p1Bounds.top || y > p1Bounds.bottom)) {
                    rely = y - p1Bounds.y;
                    nory = 2 * rely / p1Bounds.l
                    deg = (nory * MAXDEG);
                    v = - v;
                    sound('hit');
                } else {
                    sound('miss');
                    return "p2"
                }
            }
        }
        // Check if the ball is within the paddle area (x-axis)
        if (y - sb2 < 0 || y + sb2 > canvas.height) {
            deg = -deg;
        }

        var dx = v * Math.cos(deg);
        var dy = v * Math.sin(deg);

        x += dx;
        y += dy;

        return (x > canvas.width || x < 0);
    }

};

// Paddle Class
function Paddle(pong, player) {
    var p = this;
    var length = 80;
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
    // Private Variables
    var width = 500;
    var height = 300;
    var pong = {};
    var keypressed = false;
    var ball, p1, p2;
    var score = {
        p1: 0,
        p2: 0
    };
    var gameover = null;

    // State machine
    var states = {
        running: "running",
        reset: "reset",
        gameover: "gameover",
        paused: "paused",
        stopped: "stopped",
    }

    var currentState = states.stopped;

    // Private functions
    function drawBoard() {
        pong.ctx.clearRect(0, 0, width, height);
        pong.ctx.beginPath();
        pong.ctx.setLineDash([5]);
        pong.ctx.moveTo(width / 2, 0);
        pong.ctx.lineTo(width / 2, height);
        pong.ctx.stroke();

        // Draw ball and paddles
        ball.draw();
        p1.draw();
        p2.draw();
    }

    /**
     * Sceduler (Private)
     * Self calling function that executes a task from the scheduled list of tasks to execute
     */
    function scheduler() {
        // Check state
        switch (currentState) {
            case "running":
                window.requestAnimationFrame(scheduler)
                
                // Move the paddle
                if (p1.keypressed) {
                    p1.move(p1.keypressed.up);
                }
                if (p2.keypressed) {
                    p2.move(p2.keypressed.up);
                }

                // Move the ball
                var crashed = ball.update(p1, p2);
                if (crashed) {
                    currentState = states.gameover
                    score[crashed]++;
                }

                // Draw the Current board state
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


    // Public funtions
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
                if (e.key == "s" || e.key == "a") {
                    p1.keypressed = {
                        up: (e.key == "s") ? true : false,
                        code: e.key
                    }
                }

                if (e.key == "5" || e.key == "8") {
                    p2.keypressed = {
                        up: (e.key == "8") ? true : false,
                        code: e.key
                    }
                }
            })

            document.addEventListener("keyup", function (e) {
                if (p1.keypressed && e.key == p1.keypressed.code) {
                    p1.keypressed = false;
                }

                if (p2.keypressed && e.key == p2.keypressed.code) {
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
			document.dispatchEvent(new Event("pongReady"));
    }
})(window);

function addStartListener() {
    document.addEventListener("keydown", function startKeystroke(e) {
        var keyPressed = ["s", "a", "Space", "5", "8"].filter(function (key) {
            return key == e.key
        }).length;

        if (keyPressed) {
            pong.start();
            document.removeEventListener("keydown", startKeystroke);
        }
    })
}