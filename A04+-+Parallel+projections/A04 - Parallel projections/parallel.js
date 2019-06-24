function parallel() {
	// Build a parallel projection matrix, for a 16/9 viewport, with halfwidth w=40, near plane n=1, and far plane f=101.
	// we only need to center the object in the middle of the screen (if not already) and scale the coordinates to normalize with screen +-1
	//w = r-l/2 --> with halfwidth means the projection box is already centered (jorizontally and vertically)
	//r=40 l=-40

	//0: 2/r-l = 1/40
	//1:
	//2:
	//3: -l+r/r-l = 0
	//
	//4: a/w = 16/9/40
	//5:
	//6:
	//7:
	//
	//8:
	//9: -2/f-n
	//10: -f+n/f-n
	var out = [0.025, 0, 0, 0,
				0, 0.044, 0, 0,
				0, 0, -0.02, -1.02,
				0, 0, 0, 1];

	return out;
}
