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
var objectSpecularPower = 10.0;

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
var cx = 0;
var cy = 0;
var cz = 0;
var elevation = -90.0;
var angle = 0.0;
var keys = [];
var vx = 0.0;
var vy = 0.0;
var vz = 0.0;
var rvx = 0;
var rvy = 0;
var rvz = 0;
var cvz = 0;

var stepCam = 0.0;
var stepCamEl = 0.0;
var delta = 0.0;

// Eye parameters;
// We need now 4 eye vector, one for each cube
// As well as 4 light direction vectors for the same reason
var observerPositionObj = new Array();
var lightDirectionObj = new Array();
var lightPositionObj = new Array();

var textureInfluence = 0.0;
var ambientLightInfluence = 0;
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
  utils.loadFiles([shaderDir + 'vs_g.glsl',
      shaderDir + 'fs_g.glsl',
      shaderDir + 'vs_p.glsl',
      shaderDir + 'fs_p.glsl'
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

      //diffuseColor[i].push(1.0); // Alpha value added

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

function doResize() {
  // set canvas dimensions
  var canvas = document.getElementById("c");
  if ((window.innerWidth > 40) && (window.innerHeight > 240)) {
    canvas.width = window.innerWidth - 16;
    canvas.height = window.innerHeight - 16;
    var w = canvas.clientWidth;
    var h = canvas.clientHeight;

    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.viewport(0.0, 0.0, w, h);
    aspectRatio = w / h;
    perspectiveMatrix = utils.MakePerspective(45, w / h, 0.1, 100.0);
  }
}


var keyFunctionDown = function(e) {
  if (!keys[e.keyCode]) {
    keys[e.keyCode] = true;
    switch (e.keyCode) {
      /* key: "leftarrow" */
      case 37:
        rvx = rvx + 1.0;
        break;
        /* key: "rightarrow" */
      case 39:
        rvx = rvx - 1.0;
        break;
        /* key: "uparrow" */
      case 38:
        rvz = rvz + 1.0;
        break;
        /* key: "downarrow" */
      case 40:
        rvz = rvz - 1.0;
        break;
        /* key: "a" */
      case 65:
        vx = vx - 1.0;
        break;
        /* key: "d" */
      case 68:
        vx = vx + 1.0;
        break;
        /* key: "w" */
      case 87:
        vz = vz - 1.0;
        break;
        /* key: "s" */
      case 83:
        vz = vz + 1.0;
        break;
        /* key: "j" */
      case 74:
        this.gameData.customCamera.cvx = this.gameData.customCamera.cvx - 1.0;
        break;
        /* key: "l" */
      case 76:
        this.gameData.customCamera.cvx = this.gameData.customCamera.cvx + 1.0;
        break;
        /* key: "i" */
      case 73:
        this.gameData.customCamera.cvy = this.gameData.customCamera.cvy - 1.0;
        break;
        /* key: "k" */
      case 75:
        this.gameData.customCamera.cvy = this.gameData.customCamera.cvy + 1.0;
        break;
    }
  }
}

var keyFunctionUp = function(e) {
  if (keys[e.keyCode]) {
    keys[e.keyCode] = false;
    switch (e.keyCode) {
      /* key: "leftarrow" */
      case 37:
        rvx = rvx - 1.0;
        break;
        /* key: "rightarrow" */
      case 39:
        rvx = rvx + 1.0;
        break;
        /* key: "uparrow" */
      case 38:
        rvz = rvz - 1.0;
        break;
        /* key: "downarrow" */
      case 40:
        rvz = rvz + 1.0;
        break;
        /* key: "a" */
      case 65:
        vx = vx + 1.0;
        break;
        /* key: "d" */
      case 68:
        vx = vx - 1.0;
        break;
        /* key: "w" */
      case 87:
        vz = vz + 1.0;
        break;
        /* key: "s" */
      case 83:
        vz = vz - 1.0;
        break;
        /* key: "j" */
      case 74:
        this.gameData.customCamera.cvx = this.gameData.customCamera.cvx + 1.0;
        break;
        /* key: "l" */
      case 76:
        this.gameData.customCamera.cvx = this.gameData.customCamera.cvx - 1.0;
        break;
        /* key: "i" */
      case 73:
        this.gameData.customCamera.cvy = this.gameData.customCamera.cvy + 1.0;
        break;
        /* key: "k" */
      case 75:
        this.gameData.customCamera.cvy = this.gameData.customCamera.cvy - 1.0;
        break;
    }
  }
}
window.addEventListener("keyup", keyFunctionUp, false);
window.addEventListener("keydown", keyFunctionDown, false);


function computeMatrices() {

  if (gameData.camera == GameData.CAMERAS.ANDREA) {
    cx = 0;
    cy = 2.5 + gameData.tableSize.height;
    cz = gameData.tableSize.depth;
    elevation = -45.0;
    angle = 0.0;
    viewMatrix = utils.MakeView(cx, cy, cz, elevation, angle);
  } else if (gameData.camera == GameData.CAMERAS.TOP) {
    cx = 0.0;
    cy = 5.0;
    cz = 0.0;
    elevation = -90.0;
    angle = 0.0;
    viewMatrix = utils.MakeView(cx, cy, cz, elevation, angle);
  } else if (gameData.camera == GameData.CAMERAS.LUKE) {
    cx = 0;
    cy = 2.5 + gameData.tableSize.height;
    cz = gameData.tableSize.depth - 5.7;
    elevation = -45.0;
    angle = -180.0;
    viewMatrix = utils.MakeView(cx, cy, cz, elevation, angle);
  } else if (gameData.camera == GameData.CAMERAS.CUSTOM) {
    var slices = 30;
    cx = (gameData.tableSize.depth + 0.2) * Math.sin(2 * Math.PI / slices * stepCam);
    cy = 2.5 + gameData.tableSize.height + stepCamEl;
    cz = (gameData.tableSize.depth + 0.2) * Math.cos(2 * Math.PI / slices * stepCam);
    viewMatrix = utils.MakeLookAt([cx, cy, cz], [0.0, gameData.tableSize.height, 0.0], [0.0, 1.0, 0.0]);
    stepCam += this.gameData.customCamera.cvx / 10;
    stepCamEl += this.gameData.customCamera.cvy / 10;
  }

  var eyeTemp = [cx, cy, cz];

  /* TEXTURE PLANE */
  objectWorldMatrix[0] = utils.MakeWorld(0.0, gameData.tableSize.height, 0.0, 90.0, 0.0, 0.0, 0.196)

  /* TABLE */
  objectWorldMatrix[1] = utils.MakeWorld(0.0, gameData.tableSize.height, 0.0, 90.0, 0.0, 0.0, 0.196)
  objectWorldMatrix[2] = utils.MakeWorld(0.0, gameData.tableSize.height, 0.0, 90.0, 0.0, 0.0, 0.196)
  objectWorldMatrix[3] = utils.MakeWorld(0.0, gameData.tableSize.height, 0.0, 90.0, 0.0, 0.0, 0.196)
  objectWorldMatrix[4] = utils.MakeWorld(0.0, gameData.tableSize.height, 0.0, 90.0, 0.0, 0.0, 0.196)


  /* PADDLE PLAYER 1 */
  objectWorldMatrix[5] = utils.MakeWorld(gameData.luke.position.x,
    gameData.luke.position.y,
    gameData.luke.position.z,
    0.0, 0.0, 0.0, 0.077)
  dvecmat = objectWorldMatrix[5];
  delta = utils.multiplyMatrixVector(dvecmat, [vx, 0, vz, 0.0]);
  gameData.luke.position.x += delta[0] * 0.5;
  gameData.luke.position.z += delta[2] * 0.5;
  // Limit the movement to remain on the table
  gameData.luke.position.x = utils.clamp(gameData.luke.position.x, -gameData.tableSize.width / 2 + gameData.luke.radius, gameData.tableSize.width / 2 - gameData.luke.radius);
  gameData.luke.position.z = utils.clamp(gameData.luke.position.z, 0 + gameData.luke.radius, gameData.tableSize.depth / 2 - gameData.luke.radius - gameData.goalSize.depth - 0.085);


  /* PADDLE PLAYER 2 */
  objectWorldMatrix[6] = utils.MakeWorld(gameData.andrea.position.x,
    gameData.andrea.position.y,
    gameData.andrea.position.z,
    0.0, 0.0, 0.0, 0.077)
  dvecmat = objectWorldMatrix[6];
  delta = utils.multiplyMatrixVector(dvecmat, [rvx, 0, rvz, 0.0]);
  gameData.andrea.position.x += delta[0] * 0.5;
  gameData.andrea.position.z += delta[2] * 0.5;
  // Limit the movement to remain on the table
  gameData.andrea.position.x = utils.clamp(gameData.andrea.position.x, -gameData.tableSize.width / 2 + gameData.andrea.radius, gameData.tableSize.width / 2 - gameData.andrea.radius);
  gameData.andrea.position.z = utils.clamp(gameData.andrea.position.z, -gameData.tableSize.depth / 2 + gameData.andrea.radius + gameData.goalSize.depth + 0.085, 0 - gameData.andrea.radius);



  /* PUCK */
  objectWorldMatrix[7] = utils.MakeWorld(gameData.puck.position.x,
    gameData.puck.position.y,
    gameData.puck.position.z,
    0.0, 0.0, 0.0, 0.039);

  /* FLOOR */
  objectWorldMatrix[8] = utils.MakeWorld(0.0, 0.0, 0.0, 90.0, 0.0, 0.0, 1.0);



  for (i = 0; i < sceneObjects; i++) {
    projectionMatrix[i] = utils.multiplyMatrices(viewMatrix, objectWorldMatrix[i]);
    projectionMatrix[i] = utils.multiplyMatrices(perspectiveMatrix, projectionMatrix[i]);

    lightDirectionObj[i] = utils.multiplyMatrix3Vector3(utils.transposeMatrix3(utils.sub3x3from4x4(objectWorldMatrix[i])), gameData.lightDirection);

    lightPositionObj[i] = utils.multiplyMatrix3Vector3(utils.invertMatrix3(utils.sub3x3from4x4(objectWorldMatrix[i])), gameData.lightPosition);

    observerPositionObj[i] = utils.multiplyMatrix3Vector3(utils.invertMatrix3(utils.sub3x3from4x4(objectWorldMatrix[i])), eyeTemp);

  }

}


function drawScene() {

  computeNewEvents();
  computeMatrices();

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.useProgram(shaderProgram[gameData.Shader]);

  for (i = 0; i < sceneObjects; i++) {
    gl.uniformMatrix4fv(matrixPositionHandle[gameData.Shader], gl.FALSE, utils.transposeMatrix(projectionMatrix[i]));

    textureInfluence = i == 0 || i == 8 ? 1.0 : 0.0
    gl.uniform1f(textureInfluenceHandle[gameData.Shader], textureInfluence);
    gl.uniform1f(ambientLightInfluenceHandle[gameData.Shader], ambientLightInfluence);

    gl.uniform1i(textureFileHandle[gameData.Shader], 0); //Texture channel 0 used for diff txt
    if (nTexture[i] == true && diffuseTextureObj[i].webglTexture) {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, diffuseTextureObj[i].webglTexture);
    }

    gl.uniform4f(lightColorHandle[gameData.Shader], gameData.lightColor[0], gameData.lightColor[1], gameData.lightColor[2], gameData.lightColor[3]);
    gl.uniform4f(materialDiffColorHandle[gameData.Shader], diffuseColor[i][0], diffuseColor[i][1], diffuseColor[i][2], diffuseColor[i][3]);

    gl.uniform4f(materialSpecColorHandle[gameData.Shader], specularColor[i][0], specularColor[i][1], specularColor[i][2], specularColor[i][3]);
    gl.uniform4f(ambientLightColorHandle[gameData.Shader], ambientLightColor[0], ambientLightColor[1], ambientLightColor[2], ambientLightColor[3]);

    gl.uniform1f(materialSpecPowerHandle[gameData.Shader], objectSpecularPower);


    gl.uniform3f(lightDirectionHandle[gameData.Shader], lightDirectionObj[i][0],
      lightDirectionObj[i][1],
      lightDirectionObj[i][2]);
    gl.uniform3f(lightPositionHandle[gameData.Shader], lightPositionObj[i][0],
      lightPositionObj[i][1],
      lightPositionObj[i][2]);

    gl.uniform1i(lightTypeHandle[gameData.Shader], gameData.lightType);

    gl.uniform3f(eyePositionHandle[gameData.Shader], observerPositionObj[i][0],
      observerPositionObj[i][1],
      observerPositionObj[i][2]);


    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferObjectId[i]);

    gl.enableVertexAttribArray(vertexPositionHandle[gameData.Shader]);
    gl.vertexAttribPointer(vertexPositionHandle[gameData.Shader], 3, gl.FLOAT, gl.FALSE, 4 * 8, 0);

    gl.enableVertexAttribArray(vertexNormalHandle[gameData.Shader]);
    gl.vertexAttribPointer(vertexNormalHandle[gameData.Shader], 3, gl.FLOAT, gl.FALSE, 4 * 8, 4 * 3);

    gl.vertexAttribPointer(vertexUVHandle[gameData.Shader], 2, gl.FLOAT, gl.FALSE, 4 * 8, 4 * 6);
    gl.enableVertexAttribArray(vertexUVHandle[gameData.Shader]);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufferObjectId[i]);
    gl.drawElements(gl.TRIANGLES, facesNumber[i] * 3, gl.UNSIGNED_SHORT, 0);

    gl.disableVertexAttribArray(vertexPositionHandle[gameData.Shader]);
    gl.disableVertexAttribArray(vertexNormalHandle[gameData.Shader]);
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

  if (gameData.state === GameData.STATES.GOALSCORED) {
    gameData.init();
    gameData.setState(GameData.STATES.PLAYING);
    simulation.updatePucks();
    return;
  }

}
