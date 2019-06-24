function axonometry() {
    // Make an isometric view, w = 40, a = 16/9, n = 1, f = 101.
    // project rays perpendicular to the projection plane (screen). It's just a rotation of the parellel projection

    var A1 = utils.multiplyMatrices(utils.MakeParallel(40, 16 / 9, 1, 101), utils.MakeRotateXMatrix(35.26));
    A1 = utils.multiplyMatrices(A1, utils.MakeRotateYMatrix(45));

    // Make a dimetric view, w = 40, a = 16/9, n = 1, f = 101, rotated 20 around the x-axis
    var A2 = utils.multiplyMatrices(utils.MakeParallel(40, 16 / 9, 1, 101), utils.MakeRotateXMatrix(20));
    A2 = utils.multiplyMatrices(A2, utils.MakeRotateYMatrix(45));

    // Make a trimetric view, w = 40, a = 16/9, n = 1, f = 101, rotated -30 around the x-axis and 30 around the y-axis
    var A3 = utils.multiplyMatrices(utils.MakeParallel(40, 16 / 9, 1, 101), utils.MakeRotateXMatrix(-30));
    A3 = utils.multiplyMatrices(A3, utils.MakeRotateYMatrix(30));

    // Make an cavalier projection view, w = 40, a = 16/9, n = 1, f = 101, at 45 degrees
    // Make a shear in the z direction before the parallel projection
    var O1 = utils.multiplyMatrices(utils.MakeParallel(40, 16 / 9, 1, 101), utils.MakeShearZMatrix(-1 * Math.cos(toRad(45)), -1 * Math.sin(toRad(45))));

    // Make a cabinet projection view, w = 40, a = 16/9, n = 1, f = 101, at 60 degrees
    var O2 = utils.multiplyMatrices(utils.MakeParallel(40, 16 / 9, 1, 101), utils.MakeShearZMatrix(-0.5 * Math.cos(toRad(60)), -0.5 * Math.sin(toRad(60))));

    return [A1, A2, A3, O1, O2];
}

function toRad(angle) {
    return angle * Math.PI / 180;
}