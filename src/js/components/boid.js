import * as THREE from "three";
import {
  boidParams,
  randomStartPos,
  randomVelocity,
  sphereRays,
} from "./boidHandler";

// inspired by the Sebastian Lague implementation: https://www.youtube.com/watch?v=bqtqltqcQhw
export default class Boid {
  constructor(position, quaternion, color, followTarget, target = null) {
    // console.log(position);

    this.followTarget = followTarget;
    this.target = target;

    [this.mesh, this.geom, this.mat] = this.generateBoid(
      position,
      quaternion,
      color
    );

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

    var geom = new THREE.SphereGeometry(2, 10, 10); // TODO: change geometry to sprite?

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
    return [mesh, geom, mat];
  }

  update(delta, boids, obstacles) {
    this.update_cnt++;
    this.wander_cnt++;

    // console.log(this.mesh.position);

    if (
      isNaN(this.mesh.position.x) ||
      this.mesh.position.distanceTo(boidParams.ORIGIN) >
        boidParams.BOUNDARY_RAD + 100
    ) {
      console.log("IMPROPER POSITION FOR BOID... RESETTING");
      this.mesh.position.copy(randomStartPos());
    }

    if (this.target && this.followTarget) {
      // console.log("tracking to target:");
      // console.log(this.target);
      this.accel.add(this.seek(delta, this.target));
    } else {
      if (
        this.mesh.position.distanceTo(boidParams.ORIGIN) >
        boidParams.BOUNDARY_RAD
      ) {
        //
        this.accel.add(this.wander(delta).multiplyScalar(20));
      } else {
        this.accel.add(
          this.wander(delta).multiplyScalar(boidParams.WANDER_WEIGHT)
        );
        // console.log(
        //   this.wander(delta).multiplyScalar(boidParams.WANDER_WEIGHT)
        // );
      }
    }

    // console.log(Object.getOwnPropertyNames(this));
    // console.log(Object.getOwnPropertySymbols(this));
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
    // console.log(this.geom);
    // console.log(this.geom.isBufferGeometry);
    var vert = new THREE.Vector3().fromBufferAttribute(
      this.geom.attributes.position,
      0
    );
    var global_vert = vert.applyMatrix4(this.mesh.matrix);
    var dir_vect = global_vert.sub(this.mesh.position);
    var raycast = new THREE.Raycaster(origin, dir_vect.clone().normalize());

    var collisions = raycast.intersectObjects(obstacles);
    if (collisions.length > 0) {
      for (let i = 0; i < sphereRays.length; i++) {
        const dir = sphereRays[i];
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
    // console.log(this.mesh.position);
    // console.log(this.accel);
    this.vel.add(this.accel);
    this.accel.set(0, 0, 0); // reset accel
    this.vel.clampLength(boidParams.MIN_VELOCITY, boidParams.MAX_VELOCITY);
    this.mesh.position.add(this.vel);
    // console.log(this.mesh.position);
    // console.log(this.vel);
  }

  seek(delta, target_pos) {
    var steer = target_pos.clone().sub(this.mesh.position);
    steer.normalize();
    steer.multiplyScalar(boidParams.MAX_VELOCITY);
    steer.sub(this.vel);

    steer.clampLength(0, delta * 5);
    return steer;
  }

  alignment(delta, boids) {
    var steer = new THREE.Vector3();
    const avg_dir = new THREE.Vector3();

    var neighbor_cnt = 0;

    boids.forEach((neighbor) => {
      if (neighbor.mesh.id === this.mesh.id) return;

      const dist = neighbor.mesh.position.distanceTo(this.mesh.position);
      if (dist <= boidParams.ALIGNMENT_DIST) {
        avg_dir.add(neighbor.vel.clone());
        neighbor_cnt++;
      }
    });

    if (neighbor_cnt !== 0) {
      avg_dir.divideScalar(neighbor_cnt);
      avg_dir.normalize();
      avg_dir.multiplyScalar(boidParams.MAX_VELOCITY);

      // console.log(this.vel);
      avg_dir.sub(this.vel);
      steer = avg_dir;
      steer.clampLength(0, 5 * delta);
    }
    return steer;
  }

  separation(delta, boids) {
    const steer = new THREE.Vector3();

    var neighbor_cnt = 0;

    boids.forEach((neighbor) => {
      if (neighbor.mesh.id === this.mesh.id) return;

      const dist = neighbor.mesh.position.distanceTo(this.mesh.position);
      if (dist <= boidParams.SEPARATION_DIST) {
        var diff = this.mesh.position.clone().sub(neighbor.mesh.position);
        diff.divideScalar(dist); // weight by distance
        steer.add(diff);
        neighbor_cnt++;
      }
    });

    if (neighbor_cnt !== 0) {
      steer.divideScalar(neighbor_cnt);
      steer.normalize();
      steer.multiplyScalar(boidParams.MAX_VELOCITY);
      steer.clampLength(0, delta * 5);
    }
    return steer;
  }

  cohesion(delta, boids) {
    var steer = new THREE.Vector3();
    const centerOfMass = new THREE.Vector3();

    var neighbor_cnt = 0;

    boids.forEach((neighbor) => {
      if (neighbor.mesh.id === this.mesh.id) return;

      const dist = neighbor.mesh.position.distanceTo(this.mesh.position);
      if (dist <= boidParams.COHESION_DIST) {
        centerOfMass.add(neighbor.mesh.position);
        neighbor_cnt++;
      }
    });

    if (neighbor_cnt !== 0) {
      centerOfMass.divideScalar(neighbor_cnt);
      steer = this.seek(delta, centerOfMass);
    }

    return steer;
  }

  wander(delta) {
    const dist = this.mesh.position.distanceTo(this.wanderTarget);

    // console.log(this.mesh.position);

    if (
      dist < boidParams.WANDER_MIN_DIST ||
      this.wander_cnt > boidParams.WANDER_MAX_CNT
    ) {
      this.wanderTarget = randomStartPos();
      this.wander_cnt = 0;
    }

    return this.seek(delta, this.wanderTarget);
  }

  updateLook() {
    var dir = this.vel.clone();
    if (boidParams.LOOK_SMOOTHING) {
      if (this.prevVelocities.length == boidParams.SMOOTHING_SAMPLES) {
        this.prevVelocities.shift();
      }

      this.prevVelocities.push(this.vel.clone());
      dir.set(0, 0, 0);
      this.prevVelocities.forEach((sample) => {
        dir.add(sample);
      });
      dir.divideScalar(this.prevVelocities.length); // avg velocity sample
    }
    dir.add(this.mesh.position);
    this.mesh.lookAt(dir);
  }
}
