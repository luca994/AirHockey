var firstTime = 0

function perspective(w, h, fov) {
    // Build a perspective projection matrix, for a viewport whose size is determined by parameters w (width) and h (height), and whose fov-y is passed in parameter fov. Near plane is n=0.1, and far plane f=100.
    // 
    let a = w / h;
    const near = 0.1
    const far = 100
    // var t, b, l, r;

    // t = near * Math.tan(fov / 2);
    // b = -t;
    // r = t * (w / h);
    // l = -r;


    var halfFovyRad = (fov / 2) * Math.PI / 180; // {fovy/2} in radiants
    var ct = 1.0 / Math.tan(halfFovyRad);

    // var out = utils.MakePerspective(fov, w / h, 0.1, 100)
    // var out = [ct / a, 0.0, 0.0, 0.0,
    //     ct, 1.0, 0.0, 0.0,
    //     0.0, ((near + far) / (near - far)), ((2 * near * far) / (near - far)), 0.0,
    //     0.0, 0.0, -1.0, 0.0
    // ];
    var out = utils.identityMatrix();
    out[0] = ct / a;
    out[5] = ct;
    out[10] = (far + near) / (near - far);
    out[11] = 2.0 * far * near / (near - far);
    out[14] = -1.0;
    out[15] = 0.0;

    //to debug
    if (firstTime == 0) {
        firstTime = 1
        console.log(out)
        console.log('w/h:' + w / h)
        // console.log(t + ' - ' + b + ' - ' + r + ' - ' + l)
    }

    return out;
}