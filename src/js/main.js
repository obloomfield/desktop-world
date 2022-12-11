import { SCENEDATA } from "./setup";

// const islandBase = generateBase(0,0,50,100,100);
const islandGenerator = new FloatingIsland();

const islands = [];

const islandLocs = [[200,150,150]]; //, [-200,140,100], [75, 76, 85], [-150, -190, 125], [-145, 160, 104]];
const islandSize = [[100,150],[30,50],[60,90],[100,70],[45,36]];
for (var i = 0; i < islandLocs.length; i++) {
  var islandLoc = islandLocs[i];
  var islandDim = islandSize[i];
  var islandBase = await islandGenerator.generateIslandBase(islandLoc[0], islandLoc[1], islandLoc[2], islandDim[0], islandDim[1]);
  islands.push(islandBase);
  scene.add(islandBase.islandTerrain);
  // console.log("")
  for (var j=0; j < islandBase.islandTrees.length; j++) {
    // console.log(islandBase.islandTrees[j]);
    scene.add(islandBase.islandTrees[j]);
  } 
}

SCENEDATA.setup();
