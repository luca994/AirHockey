#version 300 es
precision highp float;

uniform sampler2D textureFile;

uniform float textureInfluence;

uniform vec4 mDiffColor;

in vec2 fsUVs;

in vec4 goureaudSpecular;
in vec4 goureaudDiffuse;
in vec4 goureaudAmbient;

out vec4 color;


void main() {

	vec4 texcol = texture(textureFile, fsUVs);
	vec4 diffColor = mDiffColor * (1.0-textureInfluence) + texcol * textureInfluence;

	vec4 ambient = goureaudAmbient * (1.0-textureInfluence) + texcol * textureInfluence;
	vec4 diffuse = goureaudDiffuse * diffColor;
	vec4 specular = goureaudSpecular;

	vec4 out_color = clamp(ambient + diffuse + specular, 0.0, 1.0);

	color = vec4(out_color.rgb, 1.0);
}
