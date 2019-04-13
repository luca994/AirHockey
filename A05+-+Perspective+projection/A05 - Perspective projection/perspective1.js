function perspective() {
	// Build a perspective projection matrix, for a 16/9 viewport, with fov-y=90, near plane n=0.1, and far plane f=100.
	var out = [0.56, 0, 0, 0,
			 				0, 1, 0, 0,
							0, 0, -1, -0.2,
							0, 0, -1, 0];

	return out;
}
