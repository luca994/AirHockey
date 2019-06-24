#version 300 es

in vec3 inPosition;
in vec3 inNormal;
in vec2 inUVs;

uniform mat4 wvpMatrix;
uniform mat4 wMatrix;
uniform mat4 nMatrix;

uniform vec4 mSpecColor;
uniform float mSpecPower;

uniform vec3 lightDirection;
uniform vec3 lightPosition;
uniform vec4 lightColor;
uniform int lightType;

uniform vec4 ambientLightColor;
uniform float ambientLightInfluence;

uniform vec3 eyePosition;

out vec2 fsUVs;

//We have to separate the components that require the texture from the others.
out vec4 goureaudSpecular;
out vec4 goureaudDiffuse;
out vec4 goureaudAmbient;


void main() {
    vec3 fsPosition = (wMatrix * vec4(inPosition, 1.0)).xyz;
    vec3 fsNormal = mat3(nMatrix) * inNormal;

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
    vec4 diffuse = lightCol * clamp(dot(normalVec, lightDir),0.0,1.0);

    // Phong specular
    vec3 reflection = -reflect(lightDir, normalVec);
    vec4 specular = lightCol * pow(max(dot(reflection, eyedirVec), 0.0), mSpecPower) * mSpecColor;

    // Ambient light
    vec4 ambient = ambientLightColor * ambientLightInfluence;

    goureaudSpecular = specular;
    goureaudDiffuse = diffuse;
    goureaudAmbient = ambient;

    fsUVs = inUVs;

    gl_Position = wvpMatrix * vec4(inPosition, 1.0);

}
