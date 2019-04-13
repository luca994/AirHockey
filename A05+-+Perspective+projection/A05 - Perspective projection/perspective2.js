var firstTime = 0

function perspective(w, h, fov) {
	// Build a perspective projection matrix, for a viewport whose size is determined by parameters w (width) and h (height), and whose fov-y is passed in parameter fov. Near plane is n=0.1, and far plane f=100.
	const near = 0.1
	const far = 100
	var t, b, l, r;

  t = near * Math.tan(fov/2);
  b = -t;
  r = t * (w/h);
  l = -r;

	// var out = utils.MakePerspective(fov, w/h, 0.1, 100)
	var out = [((2*near)/(r-l)),		0.0,		((r+l)/(r-l)),		0.0,
					   0.0,		((2*near)/(t-b)),		((t+b)/(t-b)),		0.0,
					   0.0,		0.0,		((near+far)/(near-far)),		(2*near*far/(near-far)),
					   0.0,		0.0,		-1.0,		0.0];

	//to debug
	if (firstTime == 0) {
		firstTime = 1
		console.log(out)
		console.log('w/h:'+ w/h )
		console.log(t + ' - ' + b + ' - ' + r + ' - ' + l)
	}

	return out;
}
