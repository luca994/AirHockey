function buildGeometry() {
	var i;
	
	// Draws a pyramid
	var vert1 = [[-1.0,-1.0,0.0], [1.0,-1.0,0.0], [0.0,1.0,0.0], [0.0,0.0,-1.53]];
	var ind1 = [0,1,2,  0,3,1,  0,2,3,  1,3,2];
	var color1 = [1.0, 0.0, 0.0];
	addMesh(vert1, ind1, color1);

	// Draws a cube
	var vert2 = [[-1.0,-1.0,0.0], [1.0,-1.0,0.0], [1.0,1.0,0.0], [-1.0,1.0,0.0], [-1.0,-1.0,-2.0], [1.0,-1.0,-2.0], [1.0,1.0,-2.0], 
	[-1.0,1.0,-2.0]];
	var ind2 = [0,1,2,  0,2,3,  1,0,4, 4,0,3,  1,5,2,  1,4,5, 2,5,6,  5,4,6,  4,3,7,  4,7,6,  3,2,7,  7,2,6];
	var color2 = [0.0, 0.0, 1.0];
	addMesh(vert2, ind2, color2);

	// Draws a Monopoly house
	var vert3 = [[-1.0,-1.0,0.0], [1.0,-1.0,0.0], [1.0,1.0,0.0], [-1.0,1.0,0.0], [-1.0,-1.0,-2.0], [1.0,-1.0,-2.0], [1.0,1.0,-2.0], 
	[-1.0,1.0,-2.0], [0.0, 1.5, 0.0], [0.0, 1.5, -2.0]];
	var ind3 = [0,1,2,  0,2,3,  1,0,4, 4,0,3,  1,5,2,  1,4,5, 2,5,6,  5,4,6,  4,3,7,  4,7,6,  3,2,7,  7,2,6, 2,8,3, 3,8,7, 8,9,7, 2,6,8 ,6,9,8, 7,9,6];
	var color3 = [0.0, 1.0, 0.0];
	addMesh(vert3, ind3, color3);
	
	// Draws a Cone
	var vert4 = [[0.0, 0.0, 0.0]];
	var ind4 = [];
	var color4 = [1.0, 1.0, 0.0];
	var slices4 = 6;
	for(i = 0; i < slices4; i++) {
		vert4[i+1] = [Math.cos(2*Math.PI / slices4 * i), Math.sin(2*Math.PI / slices4 * i), 0.0];
		ind4[3*i]   = 0;
		ind4[3*i+1] = i+1;
		ind4[3*i+2] = (i < slices4-1) ? i+2 : 1 ;
	}
	vert4.push([0.0,0.0,-2.0]);
	for(i = 1; i < slices4+1; i++) {
			if (i>slices4-1) {
				ind4.push(1, i, slices4+1);
			} else {
				ind4.push(i+1, i, slices4+1);
			}
	}
	addMesh(vert4, ind4, color4);

	// Draws a Cylinder
	var vert5 = [[0.0, 0.0, 0.0]];
	var ind5 = [];
	var color5 = [1.0, 0.0, 1.0];
	var slices5 = 64;
	for(i = 0; i < slices5; i++) {
		vert5[i+1] = [Math.cos(2*Math.PI / slices5 * i), Math.sin(2*Math.PI / slices5 * i), 0.0];
		ind5[3*i]   = 0;
		ind5[3*i+1] = i+1;
		ind5[3*i+2] = (i < slices5-1) ? i+2 : 1 ;
	}
	vert5.push([0.0,0.0,-2.0]);
	for(i = 1; i < slices5+1; i++) {
			if (i>slices5-1) {
				ind5.push(1, i, slices5+1);
			} else {
				ind5.push(i+1, i, slices5+1);
			}
	}
	addMesh(vert5, ind5, color5);

	// Draws a Sphere
	var vert6 = [[0.0, 0.0, 0.0]];
	var ind6 = [];
	var color6 = [0.0, 1.0, 1.0];
	var slices6 = 5;
	for(i = 0; i < slices6; i++) {
		vert6[i+1] = [Math.sin(2*Math.PI / slices6 * i), -Math.cos(2*Math.PI / slices6 * i), 0.0];
		vert6[i+slices6+1] = [2.6*Math.sin(2*Math.PI / slices6 * (i+0.5)), -2.6*Math.cos(2*Math.PI / slices6 * (i+0.5)), 0.0];
		ind6[6*i]   = 0;
		ind6[6*i+1] = i+1;
		ind6[6*i+2] = (i < slices6-1) ? i+2 : 1 ;
		ind6[6*i+4] = i+1;
		ind6[6*i+3] = (i < slices6-1) ? i+2 : 1 ;
		ind6[6*i+5] = slices6 + i + 1;
	}
	addMesh(vert6, ind6, color6);
}

