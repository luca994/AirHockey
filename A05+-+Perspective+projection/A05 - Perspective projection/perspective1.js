function perspective() {
    // Build a perspective projection matrix, for a 16/9 viewport, with fov-y=90, near plane n=0.1, and far plane f=100.
    var n = 0.1;
    var a = 16 / 9;
    var fov = 90;
    var f = 100;


    // U persp
    var out = [1/a/Math.tan(fov/2), 0, 0, 0,
			        0, 1/Math.tan(fov/2), 0, 0,
			        0, 0, (f+n)/(n-f), (2*f*n)/(n-f),
			        0, 0, -1, 0
			    ];


    // var out = [0.56, 0, 0, 0,
    //     0, 1, 0, 0,
    //     0, 0, -1, -0.2,
    //     0, 0, -1, 0
    // ];

    return out;
}