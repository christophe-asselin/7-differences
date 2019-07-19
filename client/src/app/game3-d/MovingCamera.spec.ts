import * as THREE from "three";
import { Game3DType } from "../../../../common/Game3DType";
import { ConstCamera } from "./Enum";
import { ICameraParams } from "./ICameraParams";
import { MovingCamera } from "./MovingCamera";

describe("MovingCamera", () => {
    const DECIMAL_POSITION: number = 6;
    const WIDTH: number = 640;
    const HEIGHT: number = 480;

    const x: number = 4;
    const y: number = 2;
    const z: number = 3;

    let movingCamera: MovingCamera;

    beforeEach(() => {
        const cameraParams: ICameraParams = {
            fov: ConstCamera.fieldOfView,
            aspect: WIDTH / HEIGHT,
            near: ConstCamera.nearClippingPane,
            far: ConstCamera.farClippingPane,
        };
        movingCamera = new MovingCamera(cameraParams, Game3DType.GEOMETRIC);
    });

    it("should be created", () => {
        expect(movingCamera).toBeTruthy();
    });

    describe("getPosition", () => {
        let position: THREE.Vector3;

        it("should return the position (0, 0, 0) after the initialization", () => {
            position = movingCamera.getPosition();

            expect(position.x).toBe(0);
            expect(position.y).toBe(0);
            expect(position.z).toBe(0);
        });

        it("should return the position (4, 2, 3) after the camera's position is set to (1, 2, 3)", () => {
            movingCamera.position.set(x, y, z);
            position = movingCamera.getPosition();

            expect(position.x).toBe(x);
            expect(position.y).toBe(y);
            expect(position.z).toBe(z);
        });
    });
    describe("setPosition", () => {
        it("should set the position of the camera to (4, 2, 3)", () => {
            movingCamera.setPosition(new THREE.Vector3(x, y, z));

            expect(movingCamera.position.x).toBe(x);
            expect(movingCamera.position.y).toBe(y);
            expect(movingCamera.position.z).toBe(z);
        });
    });

    describe("preventIntersection", () => {
        const INITIAL_Z_COORDINATE: number = 5;
        const MESH_SIZE: number = 10;
        const CAMERA_SPHERE_RADIUS: number = 2;

        let object: THREE.Object3D;

        beforeEach(() => {
            object = new THREE.Mesh(new THREE.BoxGeometry(MESH_SIZE, MESH_SIZE, MESH_SIZE), new THREE.MeshStandardMaterial());
            const boundingBox: THREE.Box3 = new THREE.Box3().setFromObject(object);
            object.userData.boundingBox = boundingBox;

            movingCamera.setPosition(new THREE.Vector3(0, 0, INITIAL_Z_COORDINATE));
        });

        it("should move the camera until its distance to the mesh's bounding box is equal to the radius of its own sphere", () => {
            const initialDistance: number = object.userData.boundingBox.distanceToPoint(movingCamera.position);
            movingCamera.preventIntersection(object);
            const finalDistance: number = object.userData.boundingBox.distanceToPoint(movingCamera.position);

            expect(initialDistance).toBeCloseTo(0, DECIMAL_POSITION);
            expect(finalDistance).toBeCloseTo(CAMERA_SPHERE_RADIUS, DECIMAL_POSITION);
        });

        it("should move the camera perpendicularly to the surface of the mesh", () => {
            const initialPosition: THREE.Vector3 = movingCamera.position.clone();

            const normalVector: THREE.Vector3 = new THREE.Vector3();
            normalVector.subVectors(movingCamera.position.clone(), object.position.clone()).normalize();
            movingCamera.preventIntersection(object);
            const displacement: THREE.Vector3 = new THREE.Vector3();
            displacement.subVectors(movingCamera.position.clone(), initialPosition).normalize();

            expect(normalVector.x).toBeCloseTo(displacement.x, DECIMAL_POSITION);
            expect(normalVector.y).toBeCloseTo(displacement.y, DECIMAL_POSITION);
            expect(normalVector.z).toBeCloseTo(displacement.z, DECIMAL_POSITION);
        });
    });

    describe("updateCamera", () => {
        const DELTA_TIME: number = 0.25;

        let initialPosition: THREE.Vector3;
        let finalPosition: THREE.Vector3;

        describe("camera's movement using the keyboard", () => {
            const EXPECTED_DISPLACEMENT: number = 12.5;
            const arbitraryDirection: THREE.Vector3 = new THREE.Vector3(x, y, z);

            let intermediatePosition: THREE.Vector3;
            let displacement: THREE.Vector3;
            let keyDown: KeyboardEvent;
            let keyUp: KeyboardEvent;
            let forward: THREE.Vector3;
            let right: THREE.Vector3;
            let up: THREE.Vector3;

            beforeEach(() => {
                initialPosition = new THREE.Vector3(0, 0, 0);
                finalPosition = new THREE.Vector3();
                intermediatePosition = new THREE.Vector3();
                displacement = new THREE.Vector3();

                movingCamera.setPosition(initialPosition);
                movingCamera.lookAt(arbitraryDirection);

                forward = new THREE.Vector3();
                movingCamera.getWorldDirection(forward);
                forward.normalize();
                right = new THREE.Vector3(-forward.z, 0, forward.x).normalize();
                up = new THREE.Vector3(-forward.z, 0, forward.x).cross(forward).normalize();
            });

            it("should move the camera forward when w is pressed, and stop when it is released", () => {
                keyDown = new KeyboardEvent("keydown", {code: "KeyW"});
                document.dispatchEvent(keyDown);

                movingCamera.update(DELTA_TIME);
                intermediatePosition.set(movingCamera.position.x, movingCamera.position.y, movingCamera.position.z);
                displacement.subVectors(intermediatePosition, initialPosition);
                forward.multiplyScalar(EXPECTED_DISPLACEMENT);

                expect(displacement.x).toBeCloseTo(forward.x, DECIMAL_POSITION);
                expect(displacement.y).toBeCloseTo(forward.y, DECIMAL_POSITION);
                expect(displacement.z).toBeCloseTo(forward.z, DECIMAL_POSITION);

                keyUp = new KeyboardEvent("keyup", {code: "KeyW"});
                document.dispatchEvent(keyUp);

                movingCamera.update(DELTA_TIME);
                finalPosition.set(movingCamera.position.x, movingCamera.position.y, movingCamera.position.z);

                expect(finalPosition).toEqual(intermediatePosition);
            });

            it("should move the camera backward when s is pressed, and stop when it is released", () => {
                keyDown = new KeyboardEvent("keydown", {code: "KeyS"});
                document.dispatchEvent(keyDown);

                movingCamera.update(DELTA_TIME);
                intermediatePosition.set(movingCamera.position.x, movingCamera.position.y, movingCamera.position.z);
                displacement.subVectors(intermediatePosition, initialPosition);
                forward.multiplyScalar(-EXPECTED_DISPLACEMENT);

                expect(displacement.x).toBeCloseTo(forward.x, DECIMAL_POSITION);
                expect(displacement.y).toBeCloseTo(forward.y, DECIMAL_POSITION);
                expect(displacement.z).toBeCloseTo(forward.z, DECIMAL_POSITION);

                keyUp = new KeyboardEvent("keyup", {code: "KeyS"});
                document.dispatchEvent(keyUp);

                movingCamera.update(DELTA_TIME);
                finalPosition.set(movingCamera.position.x, movingCamera.position.y, movingCamera.position.z);

                expect(finalPosition).toEqual(intermediatePosition);
            });

            it("should move the camera to the right when d is pressed, and stop when it is released", () => {
                keyDown = new KeyboardEvent("keydown", {code: "KeyD"});
                document.dispatchEvent(keyDown);

                movingCamera.update(DELTA_TIME);
                intermediatePosition.set(movingCamera.position.x, movingCamera.position.y, movingCamera.position.z);
                displacement.subVectors(intermediatePosition, initialPosition);
                right.multiplyScalar(EXPECTED_DISPLACEMENT);

                expect(displacement.x).toBeCloseTo(right.x, DECIMAL_POSITION);
                expect(displacement.y).toBeCloseTo(right.y, DECIMAL_POSITION);
                expect(displacement.z).toBeCloseTo(right.z, DECIMAL_POSITION);

                keyUp = new KeyboardEvent("keyup", {code: "KeyD"});
                document.dispatchEvent(keyUp);

                movingCamera.update(DELTA_TIME);
                finalPosition.set(movingCamera.position.x, movingCamera.position.y, movingCamera.position.z);

                expect(finalPosition).toEqual(intermediatePosition);
            });

            it("should move the camera to the left when a is pressed, and stop when it is released", () => {
                keyDown = new KeyboardEvent("keydown", {code: "KeyA"});
                document.dispatchEvent(keyDown);

                movingCamera.update(DELTA_TIME);
                intermediatePosition.set(movingCamera.position.x, movingCamera.position.y, movingCamera.position.z);
                displacement.subVectors(intermediatePosition, initialPosition);
                right.multiplyScalar(-EXPECTED_DISPLACEMENT);

                expect(displacement.x).toBeCloseTo(right.x, DECIMAL_POSITION);
                expect(displacement.y).toBeCloseTo(right.y, DECIMAL_POSITION);
                expect(displacement.z).toBeCloseTo(right.z, DECIMAL_POSITION);

                keyUp = new KeyboardEvent("keyup", {code: "KeyA"});
                document.dispatchEvent(keyUp);

                movingCamera.update(DELTA_TIME);
                finalPosition.set(movingCamera.position.x, movingCamera.position.y, movingCamera.position.z);

                expect(finalPosition).toEqual(intermediatePosition);
            });

            it("should move the camera upward when space is pressed, and stop when it is released", () => {
                keyDown = new KeyboardEvent("keydown", {code: "Space"});
                document.dispatchEvent(keyDown);

                movingCamera.update(DELTA_TIME);
                intermediatePosition.set(movingCamera.position.x, movingCamera.position.y, movingCamera.position.z);
                displacement.subVectors(intermediatePosition, initialPosition);
                up.multiplyScalar(EXPECTED_DISPLACEMENT);

                expect(displacement.x).toBeCloseTo(up.x, DECIMAL_POSITION);
                expect(displacement.y).toBeCloseTo(up.y, DECIMAL_POSITION);
                expect(displacement.z).toBeCloseTo(up.z, DECIMAL_POSITION);

                keyUp = new KeyboardEvent("keyup", {code: "Space"});
                document.dispatchEvent(keyUp);

                movingCamera.update(DELTA_TIME);
                finalPosition.set(movingCamera.position.x, movingCamera.position.y, movingCamera.position.z);

                expect(finalPosition).toEqual(intermediatePosition);
            });

            it("should move the camera downward when shift is pressed, and stop when it is released", () => {
                keyDown = new KeyboardEvent("keydown", {code: "ShiftLeft"});
                document.dispatchEvent(keyDown);

                movingCamera.update(DELTA_TIME);
                intermediatePosition.set(movingCamera.position.x, movingCamera.position.y, movingCamera.position.z);
                displacement.subVectors(intermediatePosition, initialPosition);
                up.multiplyScalar(-EXPECTED_DISPLACEMENT);

                expect(displacement.x).toBeCloseTo(up.x, DECIMAL_POSITION);
                expect(displacement.y).toBeCloseTo(up.y, DECIMAL_POSITION);
                expect(displacement.z).toBeCloseTo(up.z, DECIMAL_POSITION);

                keyUp = new KeyboardEvent("keyup", {code: "ShiftLeft"});
                document.dispatchEvent(keyUp);

                movingCamera.update(DELTA_TIME);
                finalPosition.set(movingCamera.position.x, movingCamera.position.y, movingCamera.position.z);

                expect(finalPosition).toEqual(intermediatePosition);
            });
        });

        describe("camera's movement limitation by the scene's bounds", () => {
            const BOUND: number = 50;
            const INVALID_POSITION: number = 60;

            beforeEach(() => {
                initialPosition = new THREE.Vector3;
                finalPosition = new THREE.Vector3;

            });

            it("should set the camera's position to (50, 50, 50) if it is superior to the scene's bounds", () => {
                initialPosition.set(INVALID_POSITION, INVALID_POSITION, INVALID_POSITION);
                movingCamera.setPosition(initialPosition);
                movingCamera.update(DELTA_TIME);
                finalPosition.set(BOUND, BOUND, BOUND);

                expect(movingCamera.position).toEqual(finalPosition);
            });

            it("should set the camera's position to (-50, -50, -50) if it is inferior to the scene's bounds", () => {
                initialPosition.set(-INVALID_POSITION, -INVALID_POSITION, -INVALID_POSITION);
                movingCamera.setPosition(initialPosition);
                movingCamera.update(DELTA_TIME);
                finalPosition.set(-BOUND, -BOUND, -BOUND);

                expect(movingCamera.position).toEqual(finalPosition);
            });
        });
    });
});
