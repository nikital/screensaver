Number.prototype.mod = function (n) {
    return ((this % n) + n) % n;
};
Math.floorToZero = function (n) {
    if (n < 0) return Math.ceil (n);
    return Math.floor (n);
};
Math.sign = function (n) {
    if (n == 0) return 1;
    return Math.abs (n) / n;
};

(() => {
    let ball = document.getElementsByClassName ("ball")[0];
    let x = 300,
        y = 300,
        v = 2,
        dx, dy;

    let manuevering = false,
        manueveringRadius = 100,
        manueveringAngle, manueveringTargetAngle,
        w, mx, my;
    function startManuever ()
    {
        let side = Math.sign (Math.random ());
        let mdx = -side * dy,
            mdy = +side * dx;

        manueveringAngle = Math.atan2 (-mdy, -mdx);
        manueveringTargetAngle = manueveringAngle + side * Math.PI;

        mx = x + mdx * manueveringRadius;
        my = y + mdy * manueveringRadius;
        w = side * 1 / manueveringRadius;

        manuevering = true;
    }
    function finishManuever ()
    {
        manuevering = false;
    }

    let width, height;
    function getRandomAngle () {
        const slope = 0.2, segments = 4;
        // Plug this equation into desmos to understand :)
        let random = Math.random ();
        let discreteRandom = slope * random + (1 - slope) * Math.floor (segments * random) / segments;
        return 2 * Math.PI * discreteRandom + Math.PI / 4;
    }
    function calculateDirection () {
        // const dist = 3000 * Math.random () + 2000;
        const dist = width;

        let angle = getRandomAngle ();
        // Prefer more diagonal angles
        let tx = x + Math.cos (angle) * dist,
            ty = y + Math.sin (angle) * dist,
            qx = Math.round (tx / width) * width - x,
            qy = Math.round (ty / height) * height - y,
            qdistance = Math.sqrt (qx * qx + qy * qy);
        dx = qx / qdistance;
        dy = qy / qdistance;
        manuevering = false;
    }
    function calculateClientDimentions () {
        width = document.body.clientWidth - ball.clientWidth;
        height = document.body.clientHeight - ball.clientHeight;
        x = Math.random () * width;
        y = Math.random () * height;
        calculateDirection ();
    }
    calculateClientDimentions ();

    function nextCollisionDistance () {
        let nextx = Math.floorToZero (x / width + Math.sign (dx)) * width - x;
        let nexty = Math.floorToZero (y / height + Math.sign (dy)) * height - y;
        let d = Math.sqrt (nextx * nextx + nexty * nexty);
        if ((nextx * dx + nexty * dy) / d > 0.999)
            return d;
        return Infinity;
    }

    function frame (ms) {
        if (!manuevering) {
            x += v * dx;
            y += v * dy;
            if (nextCollisionDistance () < manueveringRadius) startManuever ();
        } else {
            manueveringAngle += v * w;
            x = mx + Math.cos (manueveringAngle) * manueveringRadius;
            y = my + Math.sin (manueveringAngle) * manueveringRadius;
            if (w > 0 ? (manueveringAngle > manueveringTargetAngle) : (manueveringAngle < manueveringTargetAngle))
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

    frame ();
})();
