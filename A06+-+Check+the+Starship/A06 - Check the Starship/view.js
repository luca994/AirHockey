function view(cx, cy, cz, alpha, beta, rho) {
	// Create a view matrix for a camera in position cx, cy and cz, looking in the direction specified by
	// alpha, beta and rho, as outlined in the course slides.
	// move and rotate the objects instead of the camera
	
	//Mv = (Mc)^-1 = R z (− ρ )⋅ Rx (−β )⋅ Ry (− α )⋅ T (−c x , −c y , −c z )
	var out = utils.multiplyMatrices(utils.MakeRotateYMatrix(-alpha),utils.MakeTranslateMatrix(-cx,-cy,-cz));
	out = utils.multiplyMatrices(utils.MakeRotateXMatrix(-beta), out);
	out = utils.multiplyMatrices(utils.MakeRotateZMatrix(-rho), out);			   

	return out;
}
