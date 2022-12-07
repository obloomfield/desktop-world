import * as THREE from "three";

var particles = [];
var pLights = [];
var initialpos = [];
var randz= [];
var numParticles = 5;


export var fireflyParams = new (function () {
  this.SPREAD = 10;
  this.NUMCLUSTERS = 4;
})();

export function updateParticles(elapsed, scene){
  for (let i = 0; i < particles.length ;i ++){
      let particle = particles[i];
      let plight = pLights[i];
      var initpos = initialpos[i];
      particle.position.x = initpos.x +  (randz[i] * 10 * Math.sin( elapsed/2 + randz[i])) ;
      particle.position.z =  initpos.z +  (randz[i] * 10 * Math.cos( elapsed/2 + randz[i]));
      particle.position.y =  initpos.y +  (randz[i] * Math.cos(5 * elapsed + randz[i])) ;
      plight.position.x = particle.position.x;
      plight.position.y = particle.position.y;
      plight.position.z = particle.position.z;
      var alpha =  (Math.sin(elapsed * 10) + 1.0)/2.0;
      plight.intensity = alpha;
  }
}

export function createFireFly(scene, x, y, z){
  let particle = new THREE.Sprite( );
  particle.scale.set( 2, 2,2 );
  particle.position.set((Math.random() * fireflyParams.SPREAD)+ x,(Math.random() * fireflyParams.SPREAD)+ y,(Math.random() * fireflyParams.SPREAD) + z);

  let plight = new THREE.PointLight("#a833ff", 1, 100, 5);
  plight.position.set(particle.position.x, particle.position.y, particle.position.z);

  particles.push(particle);
  pLights.push(plight);
  let initialpospart = new THREE.Vector3(particle.position.x, particle.position.y, particle.position.z);
  initialpos.push(initialpospart);
  randz.push(Math.random() * 10 - 5)
  scene.add( plight );
  scene.add( particle );
}
export function manageParticles(scene, x, y, z){
  for (let i = 0; i < numParticles ;i ++){
      createFireFly(scene, x, y, z);
  }
}

export function createClusters(scene){
  for (let i = 0; i < fireflyParams.NUMCLUSTERS; i++){
      manageParticles(scene, Math.random() * 800 - 400, Math.random() * 50 + 100,  Math.random() * 800 - 400)
  }
}
