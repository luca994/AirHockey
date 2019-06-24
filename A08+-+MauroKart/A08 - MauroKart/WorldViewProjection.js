function worldViewProjection(carx, cary, carz, cardir, camx, camy, camz, aspectRatio) {
    // Computes the world, view and projection matrices for the game.

    // carx, cary and carz encodes the position of the car.
    // Since the game is basically in 2D, camdir contains the rotation about the y-axis to orient the car

    // The camera is placed at position camx, camy and camz. The view matrix should be computed using the
    // LookAt camera matrix procedure, with the correct up-vector.

    // The projection matrix is perspective projection matrix, with the aspect ratio written in parameter
    // aspectRatio, a vertical Fov-y of 60 degrees, and with near and far planes repsectively at 0.1 and 1000.0

    // Ry(cardir)*T(carx,cary,carz)^-1
    // console.log(carx + ' ' + cary + ' ' + carz)
    //
    //-175 0 5
    var world = [1, 0, 0, carx,
        0, 1, 0, cary,
        0, 0, 1, carz,
        0, 0, 0, 1
    ];
    world = utils.multiplyMatrices(world, utils.MakeRotateYMatrix(cardir));

    var view = [1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ];
    // need cross products here:
    // cx=ay∗bz−az∗by, cy=az∗bx−ax∗bz, cz=ax∗by−ay∗bx
    // but utils makes the calculations with just the three param vectors
    let viewMatrixPosition = [camx, camy, camz];
    let viewMatrixTarget = [carx, cary, carz];
    let viewMatrixUpVector = [0, 1, 0];
    view = utils.multiplyMatrices(view, utils.MakeLookAt(viewMatrixPosition, viewMatrixTarget, viewMatrixUpVector));

    //try lookin instead of lookAt
    let rot = cardir -180;
    view = utils.invertMatrix(utils.multiplyMatrices(utils.MakeTranslateMatrix(carx, cary + 3, carz), utils.MakeRotateYMatrix(rot)));

    var projection = utils.MakePerspective(60, aspectRatio, 0.1, 1000.0);

    return [world, view, projection];
}