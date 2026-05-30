/**
 * Pharmacquest — WebGL availability check
 *
 * Runs a lightweight test to see if the current browser can render WebGL
 * before we attempt to mount a Three.js scene. Falls back gracefully if not.
 */

export function isWebGLAvailable(): boolean {
  if (typeof window === "undefined") return false;

  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl");
    return gl instanceof WebGLRenderingContext || gl !== null;
  } catch {
    return false;
  }
}