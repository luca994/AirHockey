function parallel() {
	// Build a parallel projection matrix, for a 16/9 viewport, with halfwidth w=40, near plane n=1, and far plane f=101.
	var out = [0.025, 0, 0, 0,
		 				0, 0.044, 0, 0,
						0, 0, -0.02, -1.02,
						0, 0, 0, 1];

	return out;
}
