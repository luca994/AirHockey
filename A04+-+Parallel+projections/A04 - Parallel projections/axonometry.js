function axonometry() {
	// Make an isometric view, w = 40, a = 16/9, n = 1, f = 101.
	var A1 =  utils.multiplyMatrices(utils.MakeRotateXMatrix(35.26), utils.MakeRotateYMatrix(45));
	A1 = utils.multiplyMatrices(utils.MakeParallel(40, 16/9, 1, 101), A1);

	// Make a dimetric view, w = 40, a = 16/9, n = 1, f = 101, rotated 20 around the x-axis
	var A2 =  utils.multiplyMatrices(utils.MakeRotateXMatrix(20), utils.MakeRotateYMatrix(45));
	A2 = utils.multiplyMatrices(utils.MakeParallel(40, 16/9, 1, 101), A2);

	// Make a trimetric view, w = 40, a = 16/9, n = 1, f = 101, rotated -30 around the x-axis and 30 around the y-axis
	var A3 =  utils.multiplyMatrices(utils.MakeRotateXMatrix(-30), utils.MakeRotateYMatrix(30));
	A3 = utils.multiplyMatrices(utils.MakeParallel(40, 16/9, 1, 101), A3);

	// Make an cavalier projection view, w = 40, a = 16/9, n = 1, f = 101, at 45 degrees
	var O1 =  [1,			0,		-0.707,		0.0,
					   0.0,		1,		-0.707,		0.0,
					   0.0,		0.0,		1,		0.0,
					   0.0,		0.0,		0.0,		1.0];
	O1 = utils.multiplyMatrices(utils.MakeParallel(40, 16/9, 1, 101), O1);

	// Make a cabinet projection view, w = 40, a = 16/9, n = 1, f = 101, at 60 degrees
	var O2 =  [1,			0,		-0.3507,		0.0,
					   0.0,		1,		-0.3507,		0.0,
					   0.0,		0.0,		1,		0.0,
					   0.0,		0.0,		0.0,		1.0];
	O2 = utils.multiplyMatrices(utils.MakeParallel(40, 16/9, 1, 101), O2);

	return [A1, A2, A3, O1, O2];
}
