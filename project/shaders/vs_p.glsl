#version 300 es

in vec3 inPosition;
in vec3 inNormal;
in vec2 inUVs;

uniform mat4 wvpMatrix;
uniform mat4 wMatrix;
uniform mat4 nMatrix;

out vec3 fsPosition;
out vec3 fsNormal;
out vec2 fsUVs;

void main() {
	fsPosition = (wMatrix * vec4(inPosition, 1.0)).xyz;
	fsNormal = mat3(nMatrix) * inNormal;
	fsUVs = inUVs;
	gl_Position = wvpMatrix * vec4(inPosition, 1.0);
}
