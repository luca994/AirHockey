function shaders() {
    // The shader can find the required informations in the following variables:

    //vec3 fs_pos;			// Position of the point in 3D space
    //
    //vec3 LAPos;			// Position of first (or single) light
    //vec3 LADir;			// Direction of first (or single) light
    //float LAConeOut;		// Outer cone (in degree) of the light (if spot)
    //float LAConeIn;		// Inner cone (in percentage of the outher cone) of the light (if spot)
    //float LADecay;		// Decay factor (0, 1 or 2)
    //float LATarget;		// Target distance
    //vec4 LAlightColor;	// color of the first light
    //
    //vec3 LBPos;			// Same as above, but for the second light
    //vec3 LBDir;
    //float LBConeOut;
    //float LBConeIn;
    //float LBDecay;
    //float LBTarget;
    //vec4 LBlightColor;
    //
    //vec3 LCPos;			// Same as above, but for the third one
    //vec3 LCDir;
    //float LCConeOut;
    //float LCConeIn;
    //float LCDecay;
    //float LCTarget;
    //vec4 LClightColor;
    //
    //vec4 ambientLightColor;		// Ambient light color. For hemispheric, this is the color on the top
    //vec4 ambientLightLowColor;	// For hemispheric ambient, this is the bottom color
    //vec3 ADir;					// For hemispheric ambient, this is the up direction
    //
    //float SpecShine;				// specular coefficient for both blinn and phong
    //float DToonTh;				// Threshold for diffuse in a toon shader
    //float SToonTh;				// Threshold for specular in a toon shader
    //
    //vec4 diffColor;				// diffuse color
    //vec4 ambColor;				// material ambient color
    //vec4 specularColor;			// specular color
    //vec4 emit;					// emitted color
    //
    //vec3 normalVec;				// direction of the normal vecotr to the surface
    //vec3 eyedirVec;				// looking direction
    //
    //
    // Final color is returned into:
    //vec4 out_color;

    // Single directional light, Lambert diffuse only: no specular, no ambient, no emission
    var S1 = `
	vec3 lightDir = LADir;
	vec4 lightCol = LAlightColor;
	vec4 diffuse = lightCol * clamp(dot(normalVec, lightDir), 0.0, 1.0) * diffColor;
	out_color = clamp(diffuse, 0.0, 1.0);
`;

    // Single point light with decay, Lambert diffuse, Blinn specular, no ambient and no emission
    var S2 = `
	vec3 lightDir = normalize(LAPos - fs_pos);
	vec4 lightCol = LAlightColor * pow(LATarget / length(LAPos - fs_pos), LADecay);
	vec4 diffuse = lightCol * clamp(dot(normalVec, lightDir),0.0,1.0) * diffColor;
	vec3 halfVec = normalize(lightDir + eyedirVec);
	vec4 specular = lightCol * pow(max(dot(normalVec, halfVec), 0.0), SpecShine) * specularColor;

	out_color = clamp(diffuse + specular, 0.0, 1.0);
`;

    // Single directional light, Lambert diffuse, Phong specular, constant ambient and emission
    var S3 = `
	vec3 lightDir = LADir;
	vec4 lightCol = LAlightColor;
	vec4 diffuse = lightCol * clamp(dot(normalVec, lightDir),0.0,1.0) * diffColor;
	vec3 reflection = -reflect(lightDir, normalVec);
	vec4 specular = lightCol * pow(max(dot(reflection, eyedirVec), 0.0), SpecShine) * specularColor;
	vec4 ambient = ambientLightColor * ambColor;

	out_color = clamp(diffuse + specular + ambient + emit, 0.0, 1.0);
`;

    // Single spot light (with decay), Lambert diffuse, Blinn specular, no ambient and no emission
    var S4 = `
	vec3 lightDir = normalize(LAPos - fs_pos);
	float CosAngle = dot(lightDir, LADir);
	float LCosOut = cos(radians(LAConeOut / 2.0));
	float LCosIn = cos(radians(LAConeOut * LAConeIn / 2.0));
	vec4 lightCol = LAlightColor * pow(LATarget / length(LAPos - fs_pos), LADecay) *
						clamp((CosAngle - LCosOut) / (LCosIn - LCosOut), 0.0, 1.0);
	vec4 diffuse = lightCol * clamp(dot(normalVec, lightDir),0.0,1.0) * diffColor;
	vec3 halfVec = normalize(lightDir + eyedirVec);
	vec4 specular = lightCol * pow(max(dot(normalVec, halfVec), 0.0), SpecShine) * specularColor;

	out_color = clamp(diffuse + specular, 0.0, 1.0);
`;

    // Single directional light, Cartoon diffuse, Cartoon specular, no ambient but emission
    var S5 = `
	vec3 lightDir = LADir;
	vec4 lightCol = LAlightColor;

	vec4 ToonCol;
	if(dot(normalVec, lightDir) > DToonTh) {
		ToonCol = diffColor;
	} else {
		ToonCol = vec4(0.0, 0.0, 0.0, 1.0);
	}
	vec4 diffuse = lightCol * ToonCol;

	vec3 reflection = -reflect(lightDir, normalVec);
	vec4 ToonSpecPCol;
	if(dot(reflection, eyedirVec) > SToonTh) {
		ToonSpecPCol = specularColor;
	} else {
		ToonSpecPCol = vec4(0.0, 0.0, 0.0, 1.0);
	}
	vec4 specular = lightCol * ToonSpecPCol;

	out_color = clamp(diffuse + specular + emit, 0.0, 1.0);
`;

    // Single directional light, no diffuse, phong specular, hemispheric ambient and no emission
    var S6 = `
	vec3 lightDir = LADir;
	vec4 lightCol = LAlightColor;
	vec3 reflection = -reflect(lightDir, normalVec);
	vec4 specular = lightCol * pow(max(dot(reflection, eyedirVec), 0.0), SpecShine) * specularColor;
	float amBlend = (dot(normalVec, ADir) + 1.0) / 2.0;
	vec4 ambient = (ambientLightColor * amBlend + ambientLightLowColor * (1.0 - amBlend)) * ambColor;

	out_color = clamp(specular + ambient, 0.0, 1.0);
`;

    // Three lights: a directional, a point and a spot. Lambert diffuse, phong specular, constant ambient and no emission
    var S7 = `
	vec3 lightDirA = LADir;
	vec4 lightColA = LAlightColor;
	vec3 lightDirB = normalize(LBPos - fs_pos);
	vec4 lightColB = LBlightColor * pow(LBTarget / length(LBPos - fs_pos), LBDecay);
	vec3 lightDirC = normalize(LCPos - fs_pos);
	float CosAngle = dot(lightDirC, LCDir);
	float LCosOut = cos(radians(LCConeOut / 2.0));
	float LCosIn = cos(radians(LCConeOut * LCConeIn / 2.0));
	vec4 lightColC = LClightColor * pow(LCTarget / length(LCPos - fs_pos), LCDecay) *
						clamp((CosAngle - LCosOut) / (LCosIn - LCosOut), 0.0, 1.0);

	vec4 diffuseA = lightColA * clamp(dot(normalVec, lightDirA),0.0,1.0) * diffColor;
	vec4 diffuseB = lightColB * clamp(dot(normalVec, lightDirB),0.0,1.0) * diffColor;
	vec4 diffuseC = lightColC * clamp(dot(normalVec, lightDirC),0.0,1.0) * diffColor;
	vec4 diffuse = diffuseA + diffuseB + diffuseC;

	vec3 reflectionA = -reflect(lightDirA, normalVec);
	vec4 specularA = lightColA * pow(max(dot(reflectionA, eyedirVec), 0.0), SpecShine) * specularColor;
	vec3 reflectionB = -reflect(lightDirB, normalVec);
	vec4 specularB = lightColB * pow(max(dot(reflectionB, eyedirVec), 0.0), SpecShine) * specularColor;
	vec3 reflectionC = -reflect(lightDirC, normalVec);
	vec4 specularC = lightColC * pow(max(dot(reflectionC, eyedirVec), 0.0), SpecShine) * specularColor;
	vec4 specular = specularA + specularB + specularC;

	vec4 ambient = ambientLightColor * ambColor;

	out_color = clamp(diffuse + specular + ambient, 0.0, 1.0);

`;
    return [S1, S2, S3, S4, S5, S6, S7];
}