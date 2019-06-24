function anim(cx, cy, cz, qx, qy, qz, qw, alpha) {
    // cx, cy, cz are arrays of four points
    // qx, qy, qz, qw are arrays of four quaternions
    // 
    // returns transform matrix with rotation and translation given
    // by Bezier interpolation of the input positions
    // according to parameter alpha (0 <= alpha <= 1)

    var factor = 1 - alpha;
    var c0 = Math.pow(factor, 3);
    var c1 = 3 * Math.pow(factor, 2) * alpha;
    var c2 = 3 * factor * Math.pow(alpha, 2);
    var c3 = Math.pow(alpha, 3);

    var MT = utils.MakeTranslateMatrix(cx[0] * c0 + cx[1] * c1 + cx[2] * c2 + cx[3] * c3,
        cy[0] * c0 + cy[1] * c1 + cy[2] * c2 + cy[3] * c3,
        cz[0] * c0 + cz[1] * c1 + cz[2] * c2 + cz[3] * c3);

    // Create the quaternions
    var qa0 = new Quaternion(qw[0], qx[0], qy[0], qz[0]);
    var qa1 = new Quaternion(qw[1], qx[1], qy[1], qz[1]);
    var qa2 = new Quaternion(qw[2], qx[2], qy[2], qz[2]);
    var qa3 = new Quaternion(qw[3], qx[3], qy[3], qz[3]);

    // Call slerp function from quaternions library
    var q01 = qa0.slerp(qa1)(alpha);
    var q12 = qa1.slerp(qa2)(alpha);
    var q23 = qa2.slerp(qa3)(alpha);
    var q012 = q01.slerp(q12)(alpha);
    var q123 = q12.slerp(q23)(alpha);
    var qalpha = q012.slerp(q123)(alpha);
    var MR = qalpha.toMatrix4();

    return utils.multiplyMatrices(MT, MR);
}