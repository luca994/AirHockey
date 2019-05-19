// these global variables are used to contain the current angles of the world
var worldAngle = 0;
var worldElevation = 0;
var worldRoll = 0;

//now with quaternions to overcome the gimble lock issue
var currentQ = new Quaternion();

// this function returns the world matrix with the updated rotations.
// parameters rvx, rvy and rvz contains a value in the -1 .. +1 range that tells the angular velocity of the world.
function updateWorld(rvx, rvy, rvz) {
    // updates the angles
    worldAngle += rvy;
    worldElevation += rvx;
    worldRoll += rvz;

    //update the quaternion
    let qX = Quaternion.fromAxisAngle([1, 0, 0], rvx * Math.PI / 180);
    let qY = Quaternion.fromAxisAngle([0, 1, 0], rvy * Math.PI / 180);
    let qZ = Quaternion.fromAxisAngle([1, 0, 1], rvz * Math.PI / 180);

    currentQ = qY.mul(qX.mul(qZ.mul(currentQ)));

    // compute the rotation matrix
    var out = currentQ.toMatrix4();
    // var out =  utils.multiplyMatrices(utils.multiplyMatrices(
    // 				utils.MakeRotateYMatrix(worldAngle),
    // 				utils.MakeRotateXMatrix(worldElevation)),
    // 				utils.MakeRotateZMatrix(worldRoll));			   

    return out;
}