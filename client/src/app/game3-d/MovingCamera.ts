import * as THREE from "three";
import { OrbitControls } from "three-orbitcontrols-ts";
import { Game3DType } from "../../../../common/Game3DType";
import { GeometricBounds, ThematicBounds } from "./Enum";
import { ICameraParams } from "./ICameraParams";
import { IKeys } from "./IKeys";

export class MovingCamera extends THREE.PerspectiveCamera {

    private readonly MAX_SPEED: number = 50;
    private readonly ACCELERATION: number = 200;
    private readonly DECELERATION: number = 200;
    private readonly ORBIT_RADIUS: number = 0.01;
    private readonly SPHERE_RADIUS: number = 2;
    private readonly GEOMETRIC_MIN_BOUNDS: number[] = [GeometricBounds.xMin, GeometricBounds.yMin, GeometricBounds.zMin];
    private readonly GEOMETRIC_MAX_BOUNDS: number[] = [GeometricBounds.xMax, GeometricBounds.yMax, GeometricBounds.zMax];
    private readonly THEMATIC_MIN_BOUNDS: number[] = [ThematicBounds.xMin, ThematicBounds.yMin, ThematicBounds.zMin];
    private readonly THEMATIC_MAX_BOUNDS: number[] = [ThematicBounds.xMax, ThematicBounds.yMax, ThematicBounds.zMax];

    private minBounds: number[];
    private maxBounds: number[];

    private velocity: THREE.Vector3;
    private accelerationVec: THREE.Vector3;

    private sphere: THREE.Sphere;
    private raycaster: THREE.Raycaster;

    private keys: IKeys;
    private controls: OrbitControls;

    public constructor(params: ICameraParams, type: Game3DType) {
        super(params.fov, params.aspect, params.near, params.far);
        this.minBounds = (type === Game3DType.GEOMETRIC) ? this.GEOMETRIC_MIN_BOUNDS : this.THEMATIC_MIN_BOUNDS;
        this.maxBounds = (type === Game3DType.GEOMETRIC) ? this.GEOMETRIC_MAX_BOUNDS : this.THEMATIC_MAX_BOUNDS;
        this.velocity = new THREE.Vector3();
        this.accelerationVec = new THREE.Vector3();

        this.sphere = new THREE.Sphere(this.position.clone(), this.SPHERE_RADIUS);
        this.raycaster = new THREE.Raycaster();

        this.keys = {
            "ArrowUp": false,
            "KeyW": false,
            "ArrowDown": false,
            "KeyS": false,
            "ArrowLeft": false,
            "KeyA": false,
            "ArrowRight": false,
            "KeyD": false,
            "ShiftLeft": false,
            "Space": false,
        };

        this.controls = new OrbitControls(this as THREE.PerspectiveCamera);
        this.controls.target.set(this.position.x, this.position.y, this.position.z + this.ORBIT_RADIUS);
        this.controls.mouseButtons = { ORBIT: THREE.MOUSE.RIGHT, ZOOM: THREE.MOUSE.MIDDLE, PAN: THREE.MOUSE.LEFT };

        document.addEventListener("keydown", this.pressKey.bind(this), false);
        document.addEventListener("keyup", this.releaseKey.bind(this), false);
    }

    public getPosition(): THREE.Vector3 {
        return this.position;
    }

    public setPosition(position: THREE.Vector3): void {
        this.position.set(position.x, position.y, position.z);
        this.recalibrateControlsAndSphere();
    }

    public preventIntersection(object: THREE.Object3D): void {
        if (this.sphere.intersectsBox(object.userData.boundingBox)) {
            const distance: number = (this.SPHERE_RADIUS - object.userData.boundingBox.distanceToPoint(this.position));

            this.raycaster.set(this.position.clone(), (object.position.clone().sub(this.position.clone()).normalize()));

            const collisionResult: THREE.Intersection[] = this.raycaster.intersectObject(object, true);

            if (collisionResult[0] !== undefined) {
                const quaternion: THREE.Quaternion = new THREE.Quaternion();
                (collisionResult[0].object as THREE.Object3D).getWorldQuaternion(quaternion);
                this.moveBy((collisionResult[0].face as THREE.Face3).normal.clone().applyQuaternion(quaternion).multiplyScalar(
                    distance));
            } else {
                this.moveBy(this.velocity.clone().negate().setLength(this.SPHERE_RADIUS));
            }
        }
    }

    public update(deltaTime: number): void {
        const isForward: boolean = this.keys["KeyW"] || this.keys["ArrowUp"];
        const isRearward: boolean = this.keys["KeyS"] || this.keys["ArrowDown"];
        const isLeft: boolean = this.keys["KeyA"] || this.keys["ArrowLeft"];
        const isRight: boolean = this.keys["KeyD"] || this.keys["ArrowRight"];
        const isUp: boolean = this.keys["ShiftLeft"];
        const isDown: boolean = this.keys["Space"];

        if (isForward) {
            this.accelerateForward(this.ACCELERATION);
        }
        if (isRearward) {
            this.accelerateForward(-this.ACCELERATION);
        }
        if (isLeft) {
            this.accelerateRight(-this.ACCELERATION);
        }
        if (isRight) {
            this.accelerateRight(this.ACCELERATION);
        }
        if (isUp) {
            this.accelerateUp(-this.ACCELERATION);
        }
        if (isDown) {
            this.accelerateUp(this.ACCELERATION);
        }
        this.applyMovement(deltaTime);
        this.boundToScene();

    }

    private setSpeed(speed: number): void {
        if (this.velocity.length() === 0) {
            this.getWorldDirection(this.velocity);
        }
        if (speed < 0) {
            speed = 0;
        } else if (speed > this.MAX_SPEED) {
            speed = this.MAX_SPEED;
        }
        this.velocity.setLength(speed);
    }

    private getSpeed(): number {
        return this.velocity.length();
    }

    private moveBy(movement: THREE.Vector3): void {
        this.position.add(movement);
        this.recalibrateControlsAndSphere();
    }

    private recalibrateControlsAndSphere(): void {
        const forward: THREE.Vector3 = this.getForwardVector();
        forward.setLength(this.ORBIT_RADIUS);
        this.controls.target.set(this.position.x + forward.x, this.position.y + forward.y, this.position.z + forward.z);
        this.sphere.center.set(this.position.x, this.position.y, this.position.z);
    }

    private accelerateForward(acceleration: number): void {
        this.accelerationVec.addScaledVector(this.getForwardVector(), acceleration);
    }

    private accelerateRight(acceleration: number): void {
        this.accelerationVec.addScaledVector(this.getRightVector(), acceleration);
    }

    private accelerateUp(acceleration: number): void {
        this.accelerationVec.addScaledVector(this.getUpVector(), acceleration);
    }

    private getForwardVector(): THREE.Vector3 {
        const forward: THREE.Vector3 = new THREE.Vector3();
        this.getWorldDirection(forward);
        forward.normalize();

        return forward;
    }

    private getRightVector(): THREE.Vector3 {
        const forward: THREE.Vector3 = this.getForwardVector();

        return new THREE.Vector3(-forward.z, 0, forward.x).normalize();
    }

    private getUpVector(): THREE.Vector3 {
        const forward: THREE.Vector3 = this.getForwardVector();

        return new THREE.Vector3(-forward.z, 0, forward.x).cross(forward).normalize();
    }

    private applyMovement(deltaTime: number): void {
        this.velocity.addScaledVector(this.accelerationVec, deltaTime);

        let speed: number = this.getSpeed();
        if (this.accelerationVec.lengthSq() === 0) {
            speed -= this.DECELERATION * deltaTime;
        }
        this.setSpeed(speed);
        this.moveBy(this.velocity.clone().multiplyScalar(deltaTime));
        this.accelerationVec.set(0, 0, 0);
    }

    private pressKey(event: KeyboardEvent): void {
        this.keys[event.code] = true;
    }

    private releaseKey(event: KeyboardEvent): void {
        this.keys[event.code] = false;
    }

    private boundToScene(): void {
        const X: number = 0;
        const Y: number = 1;
        const Z: number = 2;
        if (this.position.x < this.minBounds[X]) {
            this.position.x = this.minBounds[X];
            this.velocity.x = 0;
        } else if (this.position.x > this.maxBounds[X]) {
            this.position.x = this.maxBounds[X];
            this.velocity.x = 0;
        }
        if (this.position.y < this.minBounds[Y]) {
            this.position.y = this.minBounds[Y];
            this.velocity.y = 0;
        } else if (this.position.y > this.maxBounds[Y]) {
            this.position.y = this.maxBounds[Y];
            this.velocity.y = 0;
        }
        if (this.position.z < this.minBounds[Z]) {
            this.position.z = this.minBounds[Z];
            this.velocity.z = 0;
        } else if (this.position.z > this.maxBounds[Z]) {
            this.position.z = this.maxBounds[Z];
            this.velocity.z = 0;
        }
        this.recalibrateControlsAndSphere();
    }
}
