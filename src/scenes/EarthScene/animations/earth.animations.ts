import {
  Animation,
  CubicEase,
  EasingFunction,
  Quaternion,
  type Animatable,
  type TransformNode,
} from "@babylonjs/core";

type AnimateRotationQuaternionOptions = {
  name?: string;
  fps?: number;
  durationFrames?: number;
  speedRatio?: number;
  easing?: EasingFunction;
  onEnd?: () => void;
};

const createDefaultEase = () => {
  const ease = new CubicEase();
  ease.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);
  return ease;
};

export const animateRotationQuaternion = (
  target: TransformNode,
  fromRotation: Quaternion,
  toRotation: Quaternion,
  options: AnimateRotationQuaternionOptions = {},
): Animatable => {
  const {
    name = "earth-rotation",
    fps = 60,
    durationFrames = 45,
    speedRatio = 1,
    easing = createDefaultEase(),
    onEnd,
  } = options;

  const animation = new Animation(
    name,
    "rotationQuaternion",
    fps,
    Animation.ANIMATIONTYPE_QUATERNION,
    Animation.ANIMATIONLOOPMODE_CONSTANT,
  );

  animation.setKeys([
    { frame: 0, value: fromRotation },
    { frame: durationFrames, value: toRotation },
  ]);

  animation.setEasingFunction(easing);

  target.rotationQuaternion = fromRotation.clone();
  target.animations = target.animations.filter((anim) => anim.name !== name);
  target.animations.push(animation);

  return target
    .getScene()
    .beginAnimation(target, 0, durationFrames, false, speedRatio, onEnd);
};
