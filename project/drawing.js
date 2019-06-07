var canvas;
var gl = null;

var shaderProgram = new Array(2); //Two handles, one for each shaders' couple. 0 = goureaud; 1 = phong

var shaderDir = "http://127.0.0.1:8887/shaders/";
var modelsDir = "http://127.0.0.1:8887/models/";

var perspectiveMatrix,
  viewMatrix;

var gameData = new GameData();
var simulation = null;

var vertexNormalHandle = new Array(2);
var vertexPositionHandle = new Array(2);
var vertexUVHandle = new Array(2);
var textureFileHandle = new Array(2);
var textureInfluenceHandle = new Array(2);
var ambientLightInfluenceHandle = new Array(2);
var ambientLightColorHandle = new Array(2);

var matrixPositionHandle = new Array(2);
var materialDiffColorHandle = new Array(2);
var lightDirectionHandle = new Array(2);
var lightPositionHandle = new Array(2);
var lightColorHandle = new Array(2);
var lightTypeHandle = new Array(2);
var eyePositionHandle = new Array(2);
var materialSpecColorHandle = new Array(2);
var materialSpecPowerHandle = new Array(2);
var objectSpecularPower = 20.0;

//Parameters for light definition (directional light)
var dirLightAlpha = -utils.degToRad(60);
var dirLightBeta = -utils.degToRad(120);
//Use the Utils 0.2 to use mat3
var lightDirection = [Math.cos(dirLightAlpha) * Math.cos(dirLightBeta),
  Math.sin(dirLightAlpha),
  Math.cos(dirLightAlpha) * Math.sin(dirLightBeta),
];
var lightPosition = [0.0, 3.0, 0.0];
var lightColor = new Float32Array([1.0, 1.0, 1.0, 1.0]);
var moveLight = 0; //0 : move the camera - 1 : Move the lights

var sceneObjects = 0; //total number of nodes
var currentLoadedObj = 0;

// The following arrays have sceneObjects as dimension.
var vertexBufferObjectId = new Array();
var indexBufferObjectId = new Array();
var objectWorldMatrix = new Array();
var projectionMatrix = new Array();
var facesNumber = new Array();
var diffuseColor = new Array(); //diffuse material colors of objs
var specularColor = new Array();
var diffuseTextureObj = new Array(); //Texture material
var nTexture = new Array(); //Number of textures per object

//Parameters for Camera
var cx = 0.0;
var cy = 5.0;
var cz = 0.0;
var elevation = -90.0;
var angle = 0.0;

var delta = 2.0;

// Eye parameters;
// We need now 4 eye vector, one for each cube
// As well as 4 light direction vectors for the same reason
var observerPositionObj = new Array();
var lightDirectionObj = new Array();
var lightPositionObj = new Array();

var currentLightType = 1;
var currentShader = 0;
var textureInfluence = 0.0;
var ambientLightInfluence = 1.0;
var ambientLightColor = [1.0, 1.0, 1.0, 1.0];

// texture loader callback
var textureLoaderCallback = function() {
  var textureId = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0 + this.txNum);
  gl.bindTexture(gl.TEXTURE_2D, textureId);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this);
  // set the filtering so we don't need mips
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
}

function loadShaders() {
  utils.loadFiles([shaderDir + 'vs_p.glsl',
      shaderDir + 'fs_p.glsl',
      shaderDir + 'vs_g.glsl',
      shaderDir + 'fs_g.glsl'
    ],
    function(shaderText) {
      // odd numbers are VSs, even are FSs
      var numShader = 0;
      for (i = 0; i < shaderText.length; i += 2) {
        var vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShader, shaderText[i]);
        gl.compileShader(vertexShader);
        if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
          alert("ERROR IN VS SHADER : " + gl.getShaderInfoLog(vertexShader));
        }
        var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShader, shaderText[i + 1]);
        gl.compileShader(fragmentShader);
        if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
          alert("ERROR IN FS SHADER : " + gl.getShaderInfoLog(fragmentShader));
        }
        shaderProgram[numShader] = gl.createProgram();
        gl.attachShader(shaderProgram[numShader], vertexShader);
        gl.attachShader(shaderProgram[numShader], fragmentShader);
        gl.linkProgram(shaderProgram[numShader]);
        if (!gl.getProgramParameter(shaderProgram[numShader], gl.LINK_STATUS)) {
          alert("Unable to initialize the shader program...");
        }
        numShader++;
      }

    });

  //*** Getting the handles to the shaders' vars
  for (i = 0; i < 2; i++) {


    vertexPositionHandle[i] = gl.getAttribLocation(shaderProgram[i], 'inPosition');
    vertexNormalHandle[i] = gl.getAttribLocation(shaderProgram[i], 'inNormal');
    vertexUVHandle[i] = gl.getAttribLocation(shaderProgram[i], 'inUVs');

    matrixPositionHandle[i] = gl.getUniformLocation(shaderProgram[i], 'wvpMatrix');

    materialDiffColorHandle[i] = gl.getUniformLocation(shaderProgram[i], 'mDiffColor');
    materialSpecColorHandle[i] = gl.getUniformLocation(shaderProgram[i], 'mSpecColor');
    materialSpecPowerHandle[i] = gl.getUniformLocation(shaderProgram[i], 'mSpecPower');
    textureFileHandle[i] = gl.getUniformLocation(shaderProgram[i], 'textureFile');

    textureInfluenceHandle[i] = gl.getUniformLocation(shaderProgram[i], 'textureInfluence');
    ambientLightInfluenceHandle[i] = gl.getUniformLocation(shaderProgram[i], 'ambientLightInfluence');
    ambientLightColorHandle[i] = gl.getUniformLocation(shaderProgram[i], 'ambientLightColor');

    eyePositionHandle[i] = gl.getUniformLocation(shaderProgram[i], 'eyePosition');

    lightDirectionHandle[i] = gl.getUniformLocation(shaderProgram[i], 'lightDirection');
    lightPositionHandle[i] = gl.getUniformLocation(shaderProgram[i], 'lightPosition');
    lightColorHandle[i] = gl.getUniformLocation(shaderProgram[i], 'lightColor');
    lightTypeHandle[i] = gl.getUniformLocation(shaderProgram[i], 'lightType');

  }

}



function loadModel(modelName) {

  utils.get_json(modelsDir + modelName, function(loadedModel) {
    sceneObjects += loadedModel.meshes.length;

    console.log("Found " + loadedModel.meshes.length + " objects...");

    //preparing to store objects' world matrix & the lights & material properties per object
    for (i = currentLoadedObj; i < sceneObjects; i++) {
      objectWorldMatrix[i] = new utils.identityMatrix();
      projectionMatrix[i] = new utils.identityMatrix();
      diffuseColor[i] = [1.0, 1.0, 1.0, 1.0];
      specularColor[i] = [1.0, 1.0, 1.0, 1.0];
      observerPositionObj[i] = new Array(3);
      lightDirectionObj[i] = new Array(3);
      lightPositionObj[i] = new Array(3);
    }

    for (i = currentLoadedObj; i < sceneObjects; i++) {
      j = i - currentLoadedObj
      //Creating the vertex data.
      console.log("Object[" + j + "]:");
      console.log("MeshName: " + loadedModel.rootnode.children[j].name);
      console.log("Vertices: " + loadedModel.meshes[j].vertices.length);
      console.log("Normals: " + loadedModel.meshes[j].normals.length);
      if (loadedModel.meshes[j].texturecoords) {
        console.log("UVss: " + loadedModel.meshes[j].texturecoords[0].length);
      } else {
        console.log("No UVs for this mesh!");
      }

      var meshMatIndex = loadedModel.meshes[j].materialindex;

      var UVFileNamePropertyIndex = -1;
      var diffuseColorPropertyIndex = -1;
      var specularColorPropertyIndex = -1;
      for (n = 0; n < loadedModel.materials[meshMatIndex].properties.length; n++) {
        if (loadedModel.materials[meshMatIndex].properties[n].key == "$tex.file") UVFileNamePropertyIndex = n;
        if (loadedModel.materials[meshMatIndex].properties[n].key == "$clr.diffuse") diffuseColorPropertyIndex = n;
        if (loadedModel.materials[meshMatIndex].properties[n].key == "$clr.specular") specularColorPropertyIndex = n;
      }


      //*** Getting vertex and normals
      var objVertex = [];
      for (n = 0; n < loadedModel.meshes[j].vertices.length / 3; n++) {
        objVertex.push(loadedModel.meshes[j].vertices[n * 3],
          loadedModel.meshes[j].vertices[n * 3 + 1],
          loadedModel.meshes[j].vertices[n * 3 + 2]);
        objVertex.push(loadedModel.meshes[j].normals[n * 3],
          loadedModel.meshes[j].normals[n * 3 + 1],
          loadedModel.meshes[j].normals[n * 3 + 2]);
        if (UVFileNamePropertyIndex >= 0) {
          objVertex.push(loadedModel.meshes[j].texturecoords[0][n * 2],
            loadedModel.meshes[j].texturecoords[0][n * 2 + 1]);

        } else {
          objVertex.push(0.0, 0.0);
        }
      }

      facesNumber[i] = loadedModel.meshes[j].faces.length;
      console.log("Face Number: " + facesNumber[i]);

      s = 0;

      if (UVFileNamePropertyIndex >= 0) {

        nTexture[i] = true;

        console.log(loadedModel.materials[meshMatIndex].properties[UVFileNamePropertyIndex].value);
        var imageName = loadedModel.materials[meshMatIndex].properties[UVFileNamePropertyIndex].value;

        var getTexture = function(image_URL) {


          var image = new Image();
          image.webglTexture = false;
          utils.requestCORSIfNotSameOrigin(image, image_URL);

          image.onload = function(e) {
            var texture = gl.createTexture();

            gl.bindTexture(gl.TEXTURE_2D, texture);

            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.generateMipmap(gl.TEXTURE_2D);

            gl.bindTexture(gl.TEXTURE_2D, null);
            image.webglTexture = texture;
          };

          image.src = image_URL;
          return image;
        };

        diffuseTextureObj[i] = getTexture(modelsDir + imageName);

        console.log("TXT filename: " + diffuseTextureObj[i]);
        console.log("TXT src: " + diffuseTextureObj[i].src);
        console.log("TXT loaded?: " + diffuseTextureObj[i].webglTexture);

      } else {
        nTexture[i] = false;
      }

      //*** mesh color
      diffuseColor[i] = loadedModel.materials[meshMatIndex].properties[diffuseColorPropertyIndex].value; // diffuse value

      diffuseColor[i].push(1.0); // Alpha value added

      specularColor[i] = loadedModel.materials[meshMatIndex].properties[specularColorPropertyIndex].value;
      console.log("Specular: " + specularColor[i]);

      //vertices, normals and UV set 1
      vertexBufferObjectId[i] = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferObjectId[i]);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(objVertex), gl.STATIC_DRAW);

      //Creating index buffer
      facesData = [];
      for (n = 0; n < loadedModel.meshes[j].faces.length; n++) {

        facesData.push(loadedModel.meshes[j].faces[n][0],
          loadedModel.meshes[j].faces[n][1],
          loadedModel.meshes[j].faces[n][2]
        );
      }

      indexBufferObjectId[i] = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufferObjectId[i]);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(facesData), gl.STATIC_DRAW);

      //creating the objects' world matrix
      objectWorldMatrix[i] = loadedModel.rootnode.children[j].transformation;
    }
    currentLoadedObj = sceneObjects;
  });
}


function initInteraction() {
  var keyFunction = function(e) {
    var map = {};
    e = e || event; // to deal with IE
    map[e.keyCode] = e.type == 'keydown';
    const step = 16;

    if (map[37]) { // Left arrow
      //	if(moveLight == 0) cx -=delta;
      //	else lightPosition[0] -=delta;
      gameData.andrea.position.x += gameData.tableSize.width / step
      gameData.andrea.position.x = Math.min(Math.max(-gameData.tableSize.width / 2 + gameData.andrea.radius, gameData.andrea.position.x), gameData.tableSize.width / 2 - gameData.andrea.radius)
    }
    if (map[39]) { // Right arrow
      //	if(moveLight == 0)cx  +=delta;
      //	else lightPosition[0] +=delta;
      gameData.andrea.position.x -= gameData.tableSize.width / step
      gameData.andrea.position.x = Math.min(Math.max(-gameData.tableSize.width / 2 + gameData.andrea.radius, gameData.andrea.position.x), gameData.tableSize.width / 2 - gameData.andrea.radius)
    }
    if (map[40]) { // Up arrow
      //	if(moveLight == 0)  cz-=delta;
      //	else lightPosition[2] -=delta;
      gameData.andrea.position.z -= gameData.tableSize.width / step
      gameData.andrea.position.z = Math.max(gameData.andrea.position.z, -gameData.tableSize.depth / 2 + gameData.andrea.radius + gameData.goalSize.depth)
    }
    if (map[38]) { // Down arrow
      //	if(moveLight == 0)  cz+=delta;
      //	else lightPosition[2] +=delta;
      gameData.andrea.position.z += gameData.tableSize.depth / step
      gameData.andrea.position.z = Math.min(gameData.andrea.position.z, 0 - gameData.andrea.radius)
    }
    if (map[107]) { // Add
      //	if(moveLight == 0)  cy+=delta;
      //	else lightPosition[1] +=delta;
    }
    if (map[109]) { // Subtract
      //	if(moveLight == 0)  cy-=delta;
      //	else lightPosition[1] -=delta;
    }

    if (map[65]) { // a
      //	if(moveLight == 0)angle-=delta * 10.0;
      //	else{
      //		lightDirection[0] -= 0.1 * Math.cos(utils.degToRad(angle));
      //		lightDirection[2] -= 0.1 * Math.sin(utils.degToRad(angle));
      //	}
      gameData.luke.position.x -= gameData.tableSize.width / step
      gameData.luke.position.x = Math.max(-gameData.tableSize.width / 2 + gameData.luke.radius, gameData.luke.position.x)
    }
    if (map[68]) { // d
      //	if(moveLight == 0)angle+=delta * 10.0;
      //	else{
      //		lightDirection[0] += 0.1 * Math.cos(utils.degToRad(angle));
      //		lightDirection[2] += 0.1 * Math.sin(utils.degToRad(angle));
      //	}
      gameData.luke.position.x += gameData.tableSize.width / step
      gameData.luke.position.x = Math.min(gameData.luke.position.x, gameData.tableSize.width / 2 - gameData.luke.radius)
    }
    if (map[87]) { // w
      //	if(moveLight == 0)elevation+=delta * 10.0;
      //	else{
      //		lightDirection[0] += 0.1 * Math.sin(utils.degToRad(angle));
      //		lightDirection[2] -= 0.1 * Math.cos(utils.degToRad(angle));
      //	}
      gameData.luke.position.z -= gameData.tableSize.depth / step
      gameData.luke.position.z = Math.max(0.0 + gameData.luke.radius, gameData.luke.position.z)
    }
    if (map[83]) { // s
      //	if(moveLight == 0)elevation-=delta*10.0;
      //	else{
      //		lightDirection[0] -= 0.1 * Math.sin(utils.degToRad(angle));
      //		lightDirection[2] += 0.1 * Math.cos(utils.degToRad(angle));
      //	}
      gameData.luke.position.z += gameData.tableSize.depth / step
      gameData.luke.position.z = Math.min(gameData.luke.position.z, gameData.tableSize.depth / 2 - gameData.luke.radius - gameData.goalSize.depth)
    }
    //console.log(" ("+cx + "/" + cy + "/" + cz + ") - "+ elevation + "." + angle);
  }

  window.addEventListener("keyup", keyFunction, false);
  window.addEventListener("keydown", keyFunction, false);
}


function computeMatrices() {

  if (gameData.camera == GameData.CAMERAS.ANDREA) {
    cx = 0.0;
    cy = 5.0;
    cz = 0.0;
    elevation = -90.0;
    angle = 0.0;
  } else if (gameData.camera == GameData.CAMERAS.LUKE) {
    cx = 0;
    cy = 2.5 + gameData.tableSize.height;
    cz = gameData.tableSize.depth;
    elevation = -45.0;
    angle = 0.0;
  } else {

  }

  viewMatrix = utils.MakeView(cx, cy, cz, elevation, angle);

  var eyeTemp = [cx, cy, cz];

  /* TABLE */
  objectWorldMatrix[0] = utils.MakeWorld(0.0, gameData.tableSize.height, 0.0, 90.0, 0.0, 0.0, 0.196)
  objectWorldMatrix[1] = utils.MakeWorld(0.0, gameData.tableSize.height, 0.0, 90.0, 0.0, 0.0, 0.196)
  objectWorldMatrix[2] = utils.MakeWorld(0.0, gameData.tableSize.height, 0.0, 90.0, 0.0, 0.0, 0.196)
  objectWorldMatrix[3] = utils.MakeWorld(0.0, gameData.tableSize.height, 0.0, 90.0, 0.0, 0.0, 0.196)

  /* PADDLE PLAYER 1 */
  objectWorldMatrix[4] = utils.MakeWorld(gameData.luke.position.x,
    gameData.luke.position.y,
    gameData.luke.position.z,
    0.0, 0.0, 0.0, 0.077)
  /* PADDLE PLAYER 2 */
  objectWorldMatrix[5] = utils.MakeWorld(gameData.andrea.position.x,
    gameData.andrea.position.y,
    gameData.andrea.position.z,
    0.0, 0.0, 0.0, 0.077)
  /* PUCK */
  objectWorldMatrix[6] = utils.MakeWorld(gameData.puck.position.x,
    gameData.puck.position.y,
    gameData.puck.position.z,
    0.0, 0.0, 0.0, 0.039)

  for (i = 0; i < sceneObjects; i++) {
    projectionMatrix[i] = utils.multiplyMatrices(viewMatrix, objectWorldMatrix[i]);
    projectionMatrix[i] = utils.multiplyMatrices(perspectiveMatrix, projectionMatrix[i]);

    lightDirectionObj[i] = utils.multiplyMatrix3Vector3(utils.transposeMatrix3(utils.sub3x3from4x4(objectWorldMatrix[i])), lightDirection);

    lightPositionObj[i] = utils.multiplyMatrix3Vector3(utils.invertMatrix3(utils.sub3x3from4x4(objectWorldMatrix[i])), lightPosition);

    observerPositionObj[i] = utils.multiplyMatrix3Vector3(utils.invertMatrix3(utils.sub3x3from4x4(objectWorldMatrix[i])), eyeTemp);
  }

}


function drawScene() {

  computeNewEvents();
  computeMatrices();

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.useProgram(shaderProgram[currentShader]);

  for (i = 0; i < sceneObjects; i++) {
    gl.uniformMatrix4fv(matrixPositionHandle[currentShader], gl.FALSE, utils.transposeMatrix(projectionMatrix[i]));

    gl.uniform1f(textureInfluenceHandle[currentShader], textureInfluence);
    gl.uniform1f(ambientLightInfluenceHandle[currentShader], ambientLightInfluence);

    gl.uniform1i(textureFileHandle[currentShader], 0); //Texture channel 0 used for diff txt
    if (nTexture[i] == true && diffuseTextureObj[i].webglTexture) {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, diffuseTextureObj[i].webglTexture);
    }

    gl.uniform4f(lightColorHandle[currentShader], lightColor[0], lightColor[1], lightColor[2], lightColor[3]);
    gl.uniform4f(materialDiffColorHandle[currentShader], diffuseColor[i][0], diffuseColor[i][1], diffuseColor[i][2], diffuseColor[i][3]);

    gl.uniform4f(materialSpecColorHandle[currentShader], specularColor[i][0], specularColor[i][1], specularColor[i][2], specularColor[i][3]);
    gl.uniform4f(ambientLightColorHandle[currentShader], ambientLightColor[0], ambientLightColor[1], ambientLightColor[2], ambientLightColor[3]);

    gl.uniform1f(materialSpecPowerHandle[currentShader], objectSpecularPower);


    gl.uniform3f(lightDirectionHandle[currentShader], lightDirectionObj[i][0],
      lightDirectionObj[i][1],
      lightDirectionObj[i][2]);
    gl.uniform3f(lightPositionHandle[currentShader], lightPositionObj[i][0],
      lightPositionObj[i][1],
      lightPositionObj[i][2]);

    gl.uniform1i(lightTypeHandle[currentShader], currentLightType);

    gl.uniform3f(eyePositionHandle[currentShader], observerPositionObj[i][0],
      observerPositionObj[i][1],
      observerPositionObj[i][2]);


    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferObjectId[i]);

    gl.enableVertexAttribArray(vertexPositionHandle[currentShader]);
    gl.vertexAttribPointer(vertexPositionHandle[currentShader], 3, gl.FLOAT, gl.FALSE, 4 * 8, 0);

    gl.enableVertexAttribArray(vertexNormalHandle[currentShader]);
    gl.vertexAttribPointer(vertexNormalHandle[currentShader], 3, gl.FLOAT, gl.FALSE, 4 * 8, 4 * 3);

    gl.vertexAttribPointer(vertexUVHandle[currentShader], 2, gl.FLOAT, gl.FALSE, 4 * 8, 4 * 6);
    gl.enableVertexAttribArray(vertexUVHandle[currentShader]);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufferObjectId[i]);
    gl.drawElements(gl.TRIANGLES, facesNumber[i] * 3, gl.UNSIGNED_SHORT, 0);

    gl.disableVertexAttribArray(vertexPositionHandle[currentShader]);
    gl.disableVertexAttribArray(vertexNormalHandle[currentShader]);
  }


  window.requestAnimationFrame(drawScene);
}

function computeNewEvents() {
  if (gameData.state === GameData.STATES.LOADING) {
    return;
  }

  if (gameData.state === GameData.STATES.PLAYING) {
    simulation.updatePaddles();
    simulation.simulate();
  }

}
