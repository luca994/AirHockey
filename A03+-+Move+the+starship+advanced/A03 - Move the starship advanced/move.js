//qui ha senso utilizzare le funzioni di utils dato che il succo non sono i calcoli ma quali matrici combinare per ottenere la trasformazione voluta

function move() {
	// Rotate 30 degrees around an arbitrary axis passing through (1,1,0). The x-axis can be aligned to the arbitrary axis after a rotation of 15 (γ) degrees around the z-axis, and then 45 (β) degrees around the y-axis.
	// T(1,1,0)*Ry(45)*Rz(15)* Rx ( α )⋅ R z ( γ )−1 ⋅ Ry ( β )−1 ⋅ T ( p x , p y , pz )−1
	var R1 = utils.multiplyMatrices(utils.invertMatrix(utils.MakeRotateYMatrix(45)),utils.invertMatrix(utils.MakeTranslateMatrix(1,1,0)));
	R1 = utils.multiplyMatrices(utils.invertMatrix(utils.MakeRotateZMatrix(15)), R1);
	R1 = utils.multiplyMatrices(utils.MakeRotateXMatrix(30), R1);
	R1 = utils.multiplyMatrices(utils.MakeRotateZMatrix(15), R1);
	R1 = utils.multiplyMatrices(utils.MakeRotateYMatrix(45),R1);
	R1 = utils.multiplyMatrices(utils.MakeTranslateMatrix(1,1,0),R1);

	// Double the size of an object, using as fixed point (1,1,0)
	// T ( p x , py , pz )⋅ S(s x , s y , sz )⋅ T ( p x , p y , pz )−1
	var S1 = utils.multiplyMatrices(utils.MakeScaleMatrix(2), utils.invertMatrix(utils.MakeTranslateMatrix(1,1,0)));
	S1 = utils.multiplyMatrices(utils.MakeTranslateMatrix(1,1,0), S1);

	// Mirror the starship along a plane passing through (1,2,0), and obtained rotating 38 degree around the y axis the xy plane
	// T(1,2,0)*Ry(38)*S(1,1,-1)*Ry(38)^*T(1,2,0)^
	var S2 = utils.multiplyMatrices(utils.invertMatrix(utils.MakeRotateYMatrix(-76)), utils.invertMatrix(utils.MakeTranslateMatrix(1,2,0)));
	S2 = utils.multiplyMatrices(utils.MakeScaleMatrix(1,1,-1), S2);
	// S2 = utils.multiplyMatrices(utils.MakeRotateYMatrix(80), S2);
	S2 = utils.multiplyMatrices(utils.MakeTranslateMatrix(1,2,0), S2);


	// var S2 = utils.multiplyMatrices(utils.MakeTranslateMatrix(1,2,0), utils.MakeRotateYMatrix(38));
	// S2 = utils.multiplyMatrices(S2, utils.MakeScaleNuMatrix(1,1,-1));
	// S2 = utils.multiplyMatrices(S2, utils.MakeRotateYMatrix(-38));
	// S2 = utils.multiplyMatrices(S2, utils.MakeTranslateMatrix(-1,2,0));

	// The ship has been doubled in size, rotated 45 degrees around the x axis, 30 degrees around the y axis, and moved to (1,1,-2). Return the ship in its original position
	//(T(1,1,-2)*Ry(30)*Rx(45)*S(2))^-1
	var I1 = utils.multiplyMatrices(utils.MakeRotateXMatrix(45), utils.MakeScaleMatrix(2));
	I1 = utils.multiplyMatrices(utils.MakeRotateYMatrix(30), I1);
	I1 = utils.multiplyMatrices(utils.MakeTranslateMatrix(1,1,-2), I1);
	I1 = utils.invertMatrix(I1);

	return [R1, S1, S2, I1];
}
