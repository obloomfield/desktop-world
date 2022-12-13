import * as THREE from "three";
import { boidParams, randomVelocity } from "./boidHandler";

export default class Boid {
  constructor(position, quaternion, color, followTarget) {
    // console.log(position);

    this.followTarget = followTarget;

    [this.mesh, this.geom] = this.generateBoid(position, quaternion, color);

    this.accel = new THREE.Vector3();
    this.vel = randomVelocity();

    this.prevVelocities = [];
    this.wanderTarget = new THREE.Vector3(
      this.mesh.position.x,
      this.mesh.position.y,
      300
    );

    this.update_cnt = 0;
    this.wander_cnt = 0;
  }

  generateBoid(pos, quat, color) {
    if (color == null) {
      color = 0xff0000;
    }

    // pos = new THREE.Vector3(0, 100, 0);

    var geom = new THREE.ConeGeometry(5, 10, 10); // TODO: change geometry to sprite?

    geom.rotateX(THREE.MathUtils.degToRad(90));

    var mat = new THREE.MeshToonMaterial({
      color,
      emissive: 0xffffff,
      side: THREE.DoubleSide,
      flatShading: true,
    });

    var mesh = new THREE.Mesh(geom, mat);

    mesh.position.copy(pos);
    if (quat) {
      mesh.quaternion.copy(quat);
    }
    return [mesh, geom];
  }

  // update(delta, boids, obstacles, target) {
  //   this.update_cnt++;
  //   this.wander_cnt++;

  //   if (target && this.followTarget) {
  //     this.accel.add(this.seek(delta, target.position));
  //   } else {
  //     if (this.mesh.distanceTo(boidParams.ORIGIN))
  //   }
  // }
}
