#version 300 es

in vec3 inPosition;
in vec3 inNormal;
in vec2 inUVs;

uniform mat4 pMatrix;
uniform mat4 wMatrix;

out vec3 fsPosition;
out vec3 fsNormal;
out vec2 fsUVs;

void main() {
	fsPosition = (wMatrix * vec4(inPosition, 1.0)).xyz;
	fsNormal = inNormal;
	fsUVs = inUVs;
	gl_Position = pMatrix * vec4(inPosition, 1.0);
}
