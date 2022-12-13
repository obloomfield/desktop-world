import * as THREE from "three";
import { boidParams, randomVelocity, sphereRays } from "./boidHandler";

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

  update(delta, boids, obstacles, target) {
    this.update_cnt++;
    this.wander_cnt++;

    if (target && this.followTarget) {
      this.accel.add(this.seek(delta, target.position));
    } else {
      if (this.mesh.distanceTo(boidParams.ORIGIN) > boidParams.BOUNDARY_RAD) {
        this.accel.add(this.wander(delta).multiplyScalar(20));
      } else {
        this.accel.add(
          this.wander(delta).multiplyScalar(boidParams.WANDER_WEIGHT)
        );
      }
    }

    this.accel.add(
      this.alignment(delta, boids).multiplyScalar(boidParams.ALIGNMENT_WEIGHT)
    );
    this.accel.add(
      this.cohesion(delta, boids).multiplyScalar(boidParams.COHESION_WEIGHT)
    );
    this.accel.add(
      this.separation(delta, boids).multiplyScalar(boidParams.SEPARATION_WEIGHT)
    );

    var origin = this.mesh.position.clone();
    var vert = this.geom.vertices[0].clone();
    var global_vert = vert.applyMatrix4(this.mesh.matrix);
    var dir_vect = global_vert.sub(this.mesh.position);
    var raycast = new THREE.Raycaster(origin, dir_vect.clone().normalize());

    var collisions = raycast.intersectObjects(obstacles.map((o) => o.mesh));
    if (collisions.length > 0) {
      for (const dir in sphereRays) {
        raycast = new THREE.Raycaster(origin, dir, 0, boidParams.VISION_MAX);
        var cur_collision = raycast.intersectObject(collisions[0].object);
        if (cur_collision.length === 0) {
          this.accel.add(dir.clone().multiplyScalar(100));
          break;
        }
      }
    }
    this.applyAcceleration(delta);

    this.updateLook();
  }

  applyAcceleration(delta) {
    this.vel.add(this.accel);
    this.accel.set(0, 0, 0); // reset accel
    this.vel.clampLength(boidParams.MIN_VELOCITY, boidParams.MAX_VELOCITY);
    this.mesh.position.add(this.vel);
  }

  seek(delta, target) {
    var steer = target.clone().sub(this.mesh.position);
    steer.normalize();
    steer.multiplyScalar(boidParams.MAX_VELOCITY);
    steer.sub(this.vel);

    steer.clampLength(0, delta * 5);
    return steer;
  }

  separation(delta, boids, range = 30) {
    const steer = new THREE.Vector3();

    var neighbor_cnt = 0;

    boids.forEach((neighbor) => {});
  }
}
