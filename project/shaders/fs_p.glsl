#version 300 es
precision highp float;

in vec3 fsPosition;
in vec3 fsNormal;
in vec2 fsUVs;

uniform vec4 mDiffColor;
uniform vec4 mSpecColor;
uniform float mSpecPower;

uniform sampler2D textureFile;
uniform float textureInfluence;

uniform float ambientLightInfluence;
uniform vec4 ambientLightColor;

uniform int lightType;
uniform vec3 lightDirection;
uniform vec3 lightPosition;
uniform vec4 lightColor;

uniform vec3 eyePosition;

out vec4 color;

void main() {

	vec4 texcol = texture(textureFile, fsUVs);
	vec4 diffColor = mDiffColor * (1.0-textureInfluence) + texcol * textureInfluence;
	vec4 ambColor = ambientLightColor * (1.0-textureInfluence) + texcol * textureInfluence;
	float targetDistance = 5.0; // The distance at which light intensity is maximum
    float LDecay = 1.0;

	vec3 normalVec = normalize(fsNormal);
	vec3 eyedirVec = normalize(eyePosition - fsPosition);

	float lCone,lDim;
    vec3 lightDir = lightDirection;
    vec4 lightCol = lightColor;



    if(lightType == 1) { 	    //Directional light
        lightDir = -normalize(lightDirection);
        lightCol = lightColor;
    } else if(lightType == 2) {	//Point light
        lightDir = normalize(lightPosition - fsPosition);
        lightCol = lightColor;
    } else if(lightType == 3) {	//Point light (decay)
        lightDir = normalize(lightPosition - fsPosition);
        lightCol = lightColor * pow(targetDistance / length(lightPosition - fsPosition), LDecay);
    } else if(lightType == 4) {	//Spot light
        lightDir = normalize(lightPosition - fsPosition);
        lCone = -dot(lightDir, lightDirection);
		if(lCone < 0.4) {
			lDim = 0.0;
		} else if(lCone > 0.7) {
				lDim = 1.0;
		} else {
			lDim = (lCone - 0.5) / 0.2;
		}
        lightCol = lightColor * lDim;
    }

    // Lambert diffuse
    vec4 diffuse = lightCol * clamp(dot(normalVec, lightDir),0.0,1.0) * diffColor;

    // Phong specular
    vec3 reflection = -reflect(lightDir, normalVec);
    vec4 specular = lightCol * pow(max(dot(reflection, eyedirVec), 0.0), mSpecPower) * mSpecColor;

    // Ambient light
    vec4 ambient = ambientLightColor * ambientLightInfluence;

    vec4 out_color = clamp(ambient + diffuse + specular, 0.0, 1.0);

    color = vec4(out_color.rgb, 1.0);

}
