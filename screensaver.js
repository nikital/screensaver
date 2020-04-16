// SPDX-License-Identifier: MIT

Number.prototype.mod = function (n) {
    return ((this % n) + n) % n;
};
Math.roundInDirection = function (n, direction) {
    if (direction < 0) return Math.floor (n);
    return Math.ceil (n);
};

(() => {
    const V = 100 / 1000,
          MIN_DIST = 2000, MAX_DIST = 6000,
          ANGLE_VARIANCE = 0.25, // Between 0 and 1
          ABORT_TIME = 1.2 * 1000,
          ABORT_DISTANCE = 50,
          ABORT_JITTER = 5;

    const ball = document.getElementsByClassName ("ball")[0];

    let x, y, dx, dy,
        width, height,
        abortRemaining = 0;

    function getRandomDiagonalAngle () {
        const slope = ANGLE_VARIANCE, segments = 4,
              // Plug this equation into desmos to understand :)
              random = Math.random (),
              discreteRandom = slope * random + (1 - slope) * Math.floor (segments * random) / segments;
        return 2 * Math.PI * discreteRandom + Math.PI / 4;
    }
    function calculateDirection () {
        const dist = (MAX_DIST - MIN_DIST) * Math.random () + MIN_DIST,
              angle = getRandomDiagonalAngle (),
              // Choose a point somewhere away from us
              tx = x + Math.cos (angle) * dist,
              ty = y + Math.sin (angle) * dist,
              // Quantize it to the nearest corner
              qx = Math.round (tx / width) * width - x,
              qy = Math.round (ty / height) * height - y,
              qdistance = Math.sqrt (qx * qx + qy * qy);
        // calculate direction to reach that corner
        dx = qx / qdistance;
        dy = qy / qdistance;
    }
    function calculateClientDimentions () {
        const world = document.getElementsByClassName ("world")[0];
        width = world.clientWidth - ball.clientWidth;
        height = world.clientHeight - ball.clientHeight;
        x = Math.random () * width;
        y = Math.random () * height;
        calculateDirection ();
    }
    calculateClientDimentions ();

    function nextCollisionDistance () {
        const nextx = Math.roundInDirection (x / width, dx) * width - x,
              nexty = Math.roundInDirection (y / height, dy) * height - y,
              d = Math.sqrt (nextx * nextx + nexty * nexty);
        if ((nextx * dx + nexty * dy) / d > 0.999)
            return d;
        return Infinity;
    }

    let prevTime = 0;
    function frame (time) {
        const dt = time - prevTime;
        prevTime = time;
        if (abortRemaining <= 0) {
            x += V * dx * dt;
            y += V * dy * dt;
            if (nextCollisionDistance () < ABORT_DISTANCE) abortRemaining = ABORT_TIME;
        } else {
            const jitterAngle = Math.random() * Math.PI * 2;
            x += Math.cos (jitterAngle) * ABORT_JITTER;
            y += Math.sin (jitterAngle) * ABORT_JITTER;
            abortRemaining -= dt;
            if (abortRemaining <= 0)
                calculateDirection ();
        }

        let realx = x.mod (width),
            realy = y.mod (height),
            stepsx = Math.floor (x / width),
            stepsy = Math.floor (y / height);
        if (stepsx.mod (2))
            realx = width - realx;
        if (stepsy.mod (2))
            realy = height - realy;

        const colors = ["teal", "tomato", "seagreen", "hotpink"];
        ball.style.position = "relative";
        ball.style.left = (realx) + "px";
        ball.style.top = (realy) + "px";
        ball.style.background = colors[(stepsx + stepsy).mod (colors.length)];

        requestAnimationFrame (frame);
    }

    frame (0);
    window.addEventListener ("resize", calculateClientDimentions);
})();
