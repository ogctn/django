import { Quaternion, Vector3 } from 'three';
import { FlyControls } from 'three/addons/controls/FlyControls.js';

const _EPS = 0.00001;
const _tmpQuaternion = new Quaternion();

export class CustomFlyControls extends FlyControls {

  constructor( object, domElement = null ) {
    super( object, domElement );

    this.movementSpeed = 1.0;
    this.rollSpeed = Math.PI / 6;

    this.dragToLook = false;
    this.autoForward = false;

    this._forwardVelocity = 0;
    this._forwardAcceleration = 2.0;
    this._forwardDeceleration = 0.6;
    this._maxForwardSpeed = 10.0;

    this._backwardAcceleration = 1.0;
    this._backwardDeceleration = 0.8;
    this._maxBackwardSpeed = 5.0;

    this._rightVelocity = 0;
    this._rightAcceleration = 1.1;
    this._rightDeceleration = 0.8;
    this._maxRightSpeed = 3.0;

    this._pitchVelocity = 0; // Up/Down
    this._yawVelocity = 0;   // Left/Right
    this._rollVelocity = 0;  // Clockwise/Counter-Clockwise

    this._pitchAcceleration = 0.6;
    this._pitchDeceleration = 0.4;
    this._maxPitchSpeed = 1.5;

    this._yawAcceleration = 0.6;
    this._yawDeceleration = 0.4;
    this._maxYawSpeed = 2.0;

    this._rollAcceleration = 0.4;
    this._rollDeceleration = 0.4;
    this._maxRollSpeed = 4.0;

    this._moveState = {
      up: 0, down: 0, left: 0, right: 0,
      forward: 0, back: 0,
      pitchUp: 0, pitchDown: 0,
      yawLeft: 0, yawRight: 0,
      rollLeft: 0, rollRight: 0
    };
    this._moveVector = new Vector3( 0, 0, 0 );
    this._rotationVector = new Vector3( 0, 0, 0 );
    this._lastQuaternion = new Quaternion();
    this._lastPosition = new Vector3();
    this._deltaQuaternion = new Quaternion();
    this._status = 0;

    this.proxyHandlers = {
      keydown: this._customOnKeyDown.bind( this ),
      keyup: this._customOnKeyUp.bind( this ),
      pointermove: this._customOnPointerMove.bind( this ),
      pointerup: this._customOnPointerUp.bind( this ),
      pointercancel: this._customOnPointerCancel.bind( this ),
      contextmenu: this._customOnContextMenu.bind( this )
    };

  }

  control( object ) {
    this.object = object;
  }

  getCurrentSpeed() {
    return {
      forwardSpeed: Math.abs( this._forwardVelocity ),
      rightSpeed: Math.abs( this._rightVelocity ),
      pitchSpeed: Math.abs( this._pitchVelocity ),
      yawSpeed: Math.abs( this._yawVelocity ),
      rollSpeed: Math.abs( this._rollVelocity )
    };
  }

  update( delta ) {

    if ( this.enabled === false ) return;

    const object = this.object;

    const moveMult = delta * this.movementSpeed;
    const rotMult = delta * this.rollSpeed;

    // -----------------------------------------------------
    // 1) FORWARD/BACK VELOCITY (linear on Z)
    // -----------------------------------------------------
    if ( this._moveState.forward === 1 ) {
      this._forwardVelocity -= this._forwardAcceleration * delta;
      if ( this._forwardVelocity < -this._maxForwardSpeed ) {
        this._forwardVelocity = -this._maxForwardSpeed;
      }
    } else if ( this._moveState.back === 1 ) {
      this._forwardVelocity += this._backwardAcceleration * delta;
      if ( this._forwardVelocity > this._maxBackwardSpeed ) {
        this._forwardVelocity = this._maxBackwardSpeed;
      }
    } else {
      if ( this._forwardVelocity < 0 ) {
        this._forwardVelocity = Math.min(
          0,
          this._forwardVelocity + this._backwardDeceleration * delta
        );
      } else if ( this._forwardVelocity > 0 ) {
        this._forwardVelocity = Math.max(
          0,
          this._forwardVelocity - this._forwardDeceleration * delta
        );
      }
    }

    // -----------------------------------------------------
    // 2) LEFT/RIGHT VELOCITY (linear on X)
    // -----------------------------------------------------
    if ( this._moveState.left === 1 ) {
      this._rightVelocity -= this._rightAcceleration * delta;
      if ( this._rightVelocity < -this._maxRightSpeed ) {
        this._rightVelocity = -this._maxRightSpeed;
      }
    } else if ( this._moveState.right === 1 ) {
      this._rightVelocity += this._rightAcceleration * delta;
      if ( this._rightVelocity > this._maxRightSpeed ) {
        this._rightVelocity = this._maxRightSpeed;
      }
    } else {
      if ( this._rightVelocity < 0 ) {
        this._rightVelocity = Math.min(
          0,
          this._rightVelocity + this._rightDeceleration * delta
        );
      } else if ( this._rightVelocity > 0 ) {
        this._rightVelocity = Math.max(
          0,
          this._rightVelocity - this._rightDeceleration * delta
        );
      }
    }

    // -----------------------------------------------------
    // 3) PITCH/YAW/ROLL VELOCITY (angular)
    // -----------------------------------------------------
    if ( this._moveState.pitchUp === 1 ) {
      this._pitchVelocity -= this._pitchAcceleration * delta;
      if ( this._pitchVelocity < -this._maxPitchSpeed ) {
        this._pitchVelocity = -this._maxPitchSpeed;
      }
    } else if ( this._moveState.pitchDown === 1 ) {
      this._pitchVelocity += this._pitchAcceleration * delta;
      if ( this._pitchVelocity > this._maxPitchSpeed ) {
        this._pitchVelocity = this._maxPitchSpeed;
      }
    } else {
      // Decelerate
      if ( this._pitchVelocity < 0 ) {
        this._pitchVelocity = Math.min(
          0,
          this._pitchVelocity + this._pitchDeceleration * delta
        );
      } else if ( this._pitchVelocity > 0 ) {
        this._pitchVelocity = Math.max(
          0,
          this._pitchVelocity - this._pitchDeceleration * delta
        );
      }
    }

    // Yaw (Y-axis)
    if ( this._moveState.yawLeft === 1 ) {
      this._yawVelocity += this._yawAcceleration * delta;
      if ( this._yawVelocity > this._maxYawSpeed ) {
        this._yawVelocity = this._maxYawSpeed;
      }
    } else if ( this._moveState.yawRight === 1 ) {
      this._yawVelocity -= this._yawAcceleration * delta;
      if ( this._yawVelocity < -this._maxYawSpeed ) {
        this._yawVelocity = -this._maxYawSpeed;
      }
    } else {
      if ( this._yawVelocity < 0 ) {
        this._yawVelocity = Math.min(
          0,
          this._yawVelocity + this._yawDeceleration * delta
        );
      } else if ( this._yawVelocity > 0 ) {
        this._yawVelocity = Math.max(
          0,
          this._yawVelocity - this._yawDeceleration * delta
        );
      }
    }

    // Roll (Z-axis)
    if ( this._moveState.rollLeft === 1 ) {
      this._rollVelocity -= this._rollAcceleration * delta;
      if ( this._rollVelocity < -this._maxRollSpeed ) {
        this._rollVelocity = -this._maxRollSpeed;
      }
    } else if ( this._moveState.rollRight === 1 ) {
      this._rollVelocity += this._rollAcceleration * delta;
      if ( this._rollVelocity > this._maxRollSpeed ) {
        this._rollVelocity = this._maxRollSpeed;
      }
    } else {
      if ( this._rollVelocity < 0 ) {
        this._rollVelocity = Math.min(
          0,
          this._rollVelocity + this._rollDeceleration * delta
        );
      } else if ( this._rollVelocity > 0 ) {
        this._rollVelocity = Math.max(
          0,
          this._rollVelocity - this._rollDeceleration * delta
        );
      }
    }

    // -----------------------------------------------------
    // 4) APPLY VELOCITY: TRANSLATION
    // -----------------------------------------------------
    const tempX = this._moveVector.x;
    const tempZ = this._moveVector.z;

    // Zero out the standard movement in X/Z so we rely on velocity-based approach:
    this._moveVector.x = 0;
    this._moveVector.z = 0;

    // Y movement (up/down) remains immediate:
    object.translateX( 0 );
    object.translateY( this._moveVector.y * moveMult );
    object.translateZ( 0 );

    // Apply velocity-based movement on X/Z:
    object.translateX( this._rightVelocity * delta );
    object.translateZ( this._forwardVelocity * delta );

    // Restore so we don't lose original _moveVector logic for other parts of code
    this._moveVector.x = tempX;
    this._moveVector.z = tempZ;

    // -----------------------------------------------------
    // 5) APPLY VELOCITY: ROTATION
    // -----------------------------------------------------
    // We'll feed our pitch/yaw/roll velocities into _rotationVector.
    // Then multiply them by 'rotMult' so final rotation = velocity * delta * rollSpeed.
    this._rotationVector.x = this._pitchVelocity;
    this._rotationVector.y = this._yawVelocity;
    this._rotationVector.z = this._rollVelocity;

    _tmpQuaternion.set(
      this._rotationVector.x * rotMult,
      this._rotationVector.y * rotMult,
      this._rotationVector.z * rotMult,
      1
    ).normalize();

    object.quaternion.multiply( _tmpQuaternion );

    if (
      this._lastPosition.distanceToSquared( object.position ) > _EPS ||
      8 * ( 1 - this._lastQuaternion.dot( object.quaternion ) ) > _EPS
    ) {
      this.dispatchEvent( { type: 'change' } );
      this._deltaQuaternion.setFromUnitVectors( this._lastQuaternion, object.quaternion );
      this._lastQuaternion.copy( object.quaternion );
      this._lastPosition.copy( object.position );

    }

  }

  connect() {
    window.addEventListener( 'keydown', this._customOnKeyDown.bind( this ) );
    window.addEventListener( 'keyup', this._customOnKeyUp.bind( this ) );

    this.domElement.addEventListener( 'pointermove', this._customOnPointerMove.bind( this ) );
    this.domElement.addEventListener( 'pointerdown', this._customOnPointerDown.bind( this ) );
    this.domElement.addEventListener( 'pointerup', this._customOnPointerUp.bind( this ) );
    this.domElement.addEventListener( 'pointercancel', this._customOnPointerCancel.bind( this ) );
    this.domElement.addEventListener( 'contextmenu', this._customOnContextMenu.bind( this ) );
  }

  _customOnKeyDown( event ) {
    this._onKeyDown( event );
   }
  _customOnKeyUp( event ) {
    this._onKeyUp( event );
  }
  _customOnPointerMove( event ) {
    this._onPointerMove( event );
  }
  _customOnPointerDown( event ) {
    this._onPointerDown( event );
  }
  _customOnPointerUp( event ) {
    this._onPointerUp( event );
  }
  _customOnPointerCancel( event ) {
    this._onPointerCancel( event );
  }
  _customOnContextMenu( event ) {
    this._onContextMenu( event );
  }

}
