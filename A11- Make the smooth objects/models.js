function buildGeometry() {
	var i,j,k;

	// Draws a cube
	var vert1 = [[-1.0,-1.0,1.0], [1.0,-1.0,1.0], [1.0,1.0,1.0], [-1.0,1.0,1.0],
				 [1.0,-1.0,1.0], [1.0,-1.0,-1.0], [1.0,1.0,1.0], [1.0,1.0,-1.0],
				 [1.0,-1.0,-1.0], [1.0,1.0,-1.0], [-1.0,-1.0,-1.0], [-1.0,1.0,-1.0],
				 [-1.0,-1.0,-1.0], [-1.0,1.0,-1.0], [-1.0,-1.0,1.0], [-1.0,1.0,1.0],
				 [1.0,1.0,1.0], [-1.0,1.0,1.0], [1.0,1.0,-1.0], [-1.0,1.0,-1.0],
				 [-1.0,-1.0,-1.0], [-1.0,-1.0,1.0], [1.0,-1.0,-1.0], [1.0,-1.0,1.0]];
	var norm1 = [[ 0.0, 0.0,1.0], [0.0, 0.0,1.0], [0.0,0.0,1.0], [ 0.0,0.0,1.0],
				 [ 1.0, 0.0,0.0], [1.0, 0.0,0.0], [1.0,0.0,0.0], [ 1.0,0.0,0.0],
				 [ 0.0, 0.0,-1.0], [0.0, 0.0,-1.0], [0.0,0.0,-1.0], [ 0.0,0.0,-1.0],
				 [-1.0, 0.0,0.0], [-1.0, 0.0,0.0], [-1.0,0.0,0.0], [-1.0,0.0,0.0],
				 [ 0.0, 1.0,0.0], [0.0, 1.0,0.0], [0.0,1.0,0.0], [ 0.0,1.0,0.0],
				 [ 0.0, -1.0,0.0], [0.0, -1.0,0.0], [0.0,-1.0,0.0], [ 0.0,-1.0,0.0]];
	var ind1 = [0,1,3,  1,2,3, 4,5,6, 5,7,6, 8,10,9, 10,11,9, 12,14,13, 14,15,13,  16,18,17, 18,19,17, 20,22,21, 22,23,21];
	var color1 = [0.0, 0.0, 1.0];
	addMesh(vert1, norm1, ind1, color1);

	// Draws a Cylinder
	var vert2 = [];
	var norm2 = [];
	var ind2 = [];
	var color2 = [1.0, 0.0, 1.0];
	var slices2 = 90;
	for(i = 0; i < slices2; i++) {
		vert2[2*i] = [Math.cos(2*Math.PI / slices2 * i), -1.0, Math.sin(2*Math.PI / slices2 * i)];
		norm2[2*i] = [Math.cos(2*Math.PI / slices2 * i), -1.0, Math.sin(2*Math.PI / slices2 * i)];
		vert2[2*i+1] = [Math.cos(2*Math.PI / slices2 * i), 1.0, Math.sin(2*Math.PI / slices2 * i)];
		norm2[2*i+1] = [Math.cos(2*Math.PI / slices2 * i), 1.0, Math.sin(2*Math.PI / slices2 * i)];
		norm2[2*i]  =  normalize(norm2[2*i]);
		norm2[2*i+1] = normalize(norm2[2*i+1]);
	}
	j=0
	// Lateral area
	for(i=0; i<slices2; i++){
		ind2[j] = 2*i;
	  	ind2[j+1] = 2*i+1;
	  	ind2[j+2] = (i < slices2-1 ) ? 2*i+2 : 0;
	  	ind2[j+3] = (i < slices2-1 ) ? 2*i+2 : 0;
	  	ind2[j+4] = 2*i+1;
	  	ind2[j+5] = (i < slices2-1 ) ? 2*i+3 : 1;
	  	j+=6;
	}

	vert2[2*slices2] = [0.0,1.0,0.0];
	norm2[2*slices2] = [0.0,1.0,0.0];
	j = 2*slices2+1;
	for(i = 0; i < slices2; i++) {
		vert2[j] = [Math.cos(2*Math.PI / slices2 * i), 1.0, Math.sin(2*Math.PI / slices2 * i)];
		norm2[j] = [0.0, 1.0, 0.0];
		j++;
	}
	ckpt = j;
	// Top area
	j = 6*slices2;
	for(i=0; i<slices2; i++){
		ind2[j]   = 2*slices2;
		ind2[j+1] = (i < slices2-1) ? 2*slices2+i+2 : 2*slices2+1;
		ind2[j+2] = 2*slices2+i+1;
		j+=3
	}

	vert2[ckpt] = [0.0,-1.0,0.0];
	norm2[ckpt] = [0.0,-1.0,0.0];
	j = ckpt+1;
	for(i = 0; i < slices2; i++) {
		vert2[j] = [Math.cos(2*Math.PI / slices2 * i), -1.0, Math.sin(2*Math.PI / slices2 * i)];
		norm2[j] = [0.0, -1.0, 0.0];
		j++;
	}
	// Bottom area
	j = 9*slices2;
	for(i=0; i<slices2; i++){
		ind2[j]   = ckpt;
		ind2[j+1] = ckpt+1+i;
		ind2[j+2] = (i < slices2-1) ? ckpt+2+i : ckpt+1;
		j+=3
	}
	addMesh(vert2, norm2, ind2, color2);


	// Draws a Cone
	var vert3 = [[0.0, 1.0, 0.0]];
	var norm3 = [[0.0, 1.0, 0.0]];
	var ind3 = [];
	var color3 = [1.0, 1.0, 0.0];
	var slices3 = 90;
	for(i = 0; i < slices3; i++) {
		vert3[i+1] = [Math.cos(2*Math.PI / slices3 * i), -1.0, Math.sin(2*Math.PI / slices3 * i)];
		norm3[i+1] = [Math.cos(2*Math.PI / slices3 * i), 0.0, Math.sin(2*Math.PI / slices3 * i)];
		norm3[i+1] = normalize(norm3[i+1]);
	}
	// Lateral area
	j = 0
	for(i=0; i < slices3; i++){
		ind3[j]   = 0;
		ind3[j+1] = (i < slices3-1) ? i+2 : 1;
		ind3[j+2] = i+1;
	  	j+=3
	}
	vert3[slices3+1] = [0.0, -1.0, 0.0]
	norm3[slices3+1] = [0.0, -1.0, 0.0]
	j = slices3+1;
	for(i = 0; i < slices3; i++) {
		vert3[j] = [Math.cos(2*Math.PI / slices3 * i), -1.0, Math.sin(2*Math.PI / slices3 * i)];
		norm3[j] = [0.0, -1.0, 0.0];
		j++;
	}
	j = 0
	// Bottom area
	for(i = 0; i < slices3; i++) {
		ind3[3*slices3+j]   = slices3+1;
		ind3[3*slices3+j+1] = slices3+i;
		ind3[3*slices3+j+2] = (i < slices3-1) ? slices3+i+1 : 1;
		j+=3
	}
	addMesh(vert3, norm3, ind3, color3);

	// Draws a Sphere
	var phi,theta;
	var vert4 = [];
	var norm4 = [];
	var ind4 = [];
	var color4 = [0.0, 1.0, 1.0];
	var sectors = 64;
	var stacks = 64;
	var ray = 1;
	for(i = 0; i < sectors; i++)
	  for(k = 0; k <= stacks; k++){
		phi = (Math.PI/2)-Math.PI*k/stacks
		theta = (2*Math.PI)*i/sectors
		vert4[stacks*i+k] = [(ray*Math.cos(phi)*Math.cos(theta)),ray*Math.sin(phi),(ray*Math.cos(phi)*Math.sin(theta))];
		norm4[stacks*i+k] = [(ray*Math.cos(phi)*Math.cos(theta)),ray*Math.sin(phi),(ray*Math.cos(phi)*Math.sin(theta))];
		norm4[stacks*i+k] = normalize(norm4[stacks*i+k]);
	}
	j=0
	// Top lateral area
	for(k=0; k<stacks-1; k++){
		for(i=0; i<sectors; i++){
			ind4[j] = (i < sectors-1 ) ? stacks*i+k+stacks : 0+k;
			ind4[j+1] = stacks*i+k+1;
			ind4[j+2] = stacks*i+k;
			ind4[j+3] = (i < sectors-1 ) ? stacks*i+k+stacks+1 : 1+k;
			ind4[j+4] = stacks*i+k+1;
			ind4[j+5] = (i < sectors-1 ) ? stacks*i+k+stacks : 0+k;
			j+=6
		}
	}
	for(i=0;i<sectors;i++){
		ind4[j] = stacks*sectors
		ind4[j+1] = (i+1)*stacks-1
		ind4[j+2] = (i < sectors-1 ) ? (i+2)*stacks-1 : stacks-1
		j+=3
	}
	addMesh(vert4, norm4, ind4, color4);
}



function normalize(v){
	var len = Math.sqrt(v[0]*v[0]+v[1]*v[1]+v[2]*v[2]);
	var out = len > 0 ? [v[0]/len, v[1]/len, v[2]/len] : v;
	return out;
}
