'use client';

import React, { useEffect, useRef, useState, ReactNode } from 'react';

export interface DepthImageProps {
  image: string;
  depthMap?: string;
  fit?: 'cover' | 'contain';
  depthFromLight?: number; // 0 (vertical only) to 1 (brightness only), default 0.5
  depthSmoothing?: number; // default 7
  depthContrast?: number; // default 1.2
  invertDepth?: boolean; // default false
  displacement?: number; // default 1.5
  normalStrength?: number; // default 1.5
  detail?: number; // default 0.8
  shadowIntensity?: number; // default 0.7
  shadowSoftness?: number; // default 0.1
  lightColor?: string; // default "#ffffff"
  lightIntensity?: number; // default 6
  falloff?: number; // default 2.5
  elevation?: number; // default 1.2
  ambient?: number; // default 0.02
  ambientColor?: string; // default "#ffffff"
  colorPreserve?: number; // default 0
  follow?: number; // default 0.12
  autoOrbit?: boolean; // default true
  orbitRadius?: number; // default 0.6
  orbitDuration?: number; // default 10 (seconds)
  view?: 'lit' | 'depth' | 'normal'; // default "lit"
  backgroundColor?: string; // default "#000000"
  fallbackColor?: string; // default "#171717"
  paused?: boolean; // default false
  dpr?: number; // default 1.5
  className?: string;
  children?: ReactNode;
}

function hexToRgb(hex: string): [number, number, number] {
  let cleaned = hex.replace('#', '');
  if (cleaned.length === 3) {
    cleaned = cleaned.split('').map((c) => c + c).join('');
  }
  const num = parseInt(cleaned, 16);
  return [
    ((num >> 16) & 255) / 255,
    ((num >> 8) & 255) / 255,
    (num & 255) / 255,
  ];
}

const VERTEX_SHADER = `
attribute vec2 a_position;
varying vec2 v_uv;

void main() {
  v_uv = (a_position + 1.0) * 0.5;
  v_uv.y = 1.0 - v_uv.y;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision highp float;

varying vec2 v_uv;

uniform sampler2D u_image;
uniform sampler2D u_depthMap;
uniform bool u_hasDepthMap;
uniform vec2 u_resolution;
uniform vec2 u_imageResolution;
uniform int u_fit; // 0: cover, 1: contain

uniform float u_depthFromLight;
uniform float u_depthContrast;
uniform bool u_invertDepth;
uniform float u_displacement;
uniform float u_normalStrength;
uniform float u_detail;
uniform float u_shadowIntensity;
uniform float u_shadowSoftness;

uniform vec2 u_lightPos; // 0 to 1
uniform float u_elevation;
uniform float u_lightIntensity;
uniform vec3 u_lightColor;
uniform float u_falloff;

uniform float u_ambient;
uniform vec3 u_ambientColor;
uniform float u_colorPreserve;
uniform vec3 u_backgroundColor;

uniform int u_view; // 0: lit, 1: depth, 2: normal

float getLuminance(vec4 color) {
  return dot(color.rgb, vec3(0.299, 0.587, 0.114));
}

vec2 getProjectedUV(vec2 uv) {
  if (u_imageResolution.x <= 0.0 || u_imageResolution.y <= 0.0 || u_resolution.x <= 0.0 || u_resolution.y <= 0.0) {
    return uv;
  }
  float canvasAspect = u_resolution.x / u_resolution.y;
  float imageAspect = u_imageResolution.x / u_imageResolution.y;
  vec2 outUv = uv;

  if (u_fit == 0) { // Cover: zoom in so the whole canvas is filled
    if (canvasAspect > imageAspect) {
      // Canvas is wider than image: scale Y down relative to center
      float s = imageAspect / canvasAspect;
      outUv.y = (uv.y - 0.5) * s + 0.5;
    } else {
      // Canvas is taller than image: scale X down relative to center
      float s = canvasAspect / imageAspect;
      outUv.x = (uv.x - 0.5) * s + 0.5;
    }
  } else { // Contain
    if (canvasAspect > imageAspect) {
      float s = canvasAspect / imageAspect;
      outUv.x = (uv.x - 0.5) * s + 0.5;
    } else {
      float s = imageAspect / canvasAspect;
      outUv.y = (uv.y - 0.5) * s + 0.5;
    }
  }
  return clamp(outUv, 0.0, 1.0);
}

float sampleRawDepth(vec2 uv) {
  vec2 cUv = clamp(uv, 0.0, 1.0);
  if (u_hasDepthMap) {
    return texture2D(u_depthMap, cUv).r;
  }
  // Depth estimation blending vertical gradient and brightness
  float verticalDepth = 1.0 - cUv.y;
  float lumaDepth = getLuminance(texture2D(u_image, cUv));
  float raw = mix(verticalDepth, lumaDepth, u_depthFromLight);
  
  // Contrast curve
  float centered = raw - 0.5;
  float contrasted = clamp(centered * u_depthContrast + 0.5, 0.0, 1.0);
  return u_invertDepth ? (1.0 - contrasted) : contrasted;
}

void main() {
  vec2 projUv = getProjectedUV(v_uv);

  if (projUv.x < 0.0 || projUv.x > 1.0 || projUv.y < 0.0 || projUv.y > 1.0) {
    gl_FragColor = vec4(u_backgroundColor, 1.0);
    return;
  }

  vec2 texel = 1.0 / u_imageResolution;
  float depthVal = sampleRawDepth(projUv);

  // Parallax displacement relief
  vec2 lightDir2D = u_lightPos - v_uv;
  vec2 parallaxOffset = lightDir2D * depthVal * u_displacement * 0.02;
  vec2 sampleUv = clamp(projUv + parallaxOffset, 0.0, 1.0);

  vec4 baseColor = texture2D(u_image, sampleUv);

  // Surface normals via Sobel height field filtering
  float hL = sampleRawDepth(sampleUv - vec2(texel.x * 2.0, 0.0));
  float hR = sampleRawDepth(sampleUv + vec2(texel.x * 2.0, 0.0));
  float hD = sampleRawDepth(sampleUv - vec2(0.0, texel.y * 2.0));
  float hU = sampleRawDepth(sampleUv + vec2(0.0, texel.y * 2.0));

  float dx = (hR - hL) * u_normalStrength * 3.0;
  float dy = (hU - hD) * u_normalStrength * 3.0;
  vec3 normal = normalize(vec3(-dx, -dy, 1.0));

  // Add fine surface detail from photo luminance using texel gradient
  float lumaL = getLuminance(texture2D(u_image, sampleUv - vec2(texel.x, 0.0)));
  float lumaR = getLuminance(texture2D(u_image, sampleUv + vec2(texel.x, 0.0)));
  float lumaD = getLuminance(texture2D(u_image, sampleUv - vec2(0.0, texel.y)));
  float lumaU = getLuminance(texture2D(u_image, sampleUv + vec2(0.0, texel.y)));
  vec3 detailNormal = normalize(vec3(-(lumaR - lumaL) * 8.0, -(lumaU - lumaD) * 8.0, 1.0));
  normal = normalize(normal + detailNormal * u_detail);

  if (u_view == 1) { // Depth debug view
    gl_FragColor = vec4(vec3(depthVal), 1.0);
    return;
  }
  if (u_view == 2) { // Normal debug view
    gl_FragColor = vec4(normal * 0.5 + 0.5, 1.0);
    return;
  }

  // 3D Lighting Calculations
  vec3 lightPos3D = vec3(u_lightPos, u_elevation);
  vec3 pixelPos3D = vec3(v_uv, depthVal * u_displacement);
  vec3 lightVec = lightPos3D - pixelPos3D;
  float dist = length(lightVec);
  vec3 lightDir = normalize(lightVec);

  // Self-shadowing raymarch
  float shadow = 1.0;
  if (u_shadowIntensity > 0.0) {
    vec2 rayStep = normalize(lightDir2D) * texel * (3.0 + u_shadowSoftness * 5.0);
    float currentH = depthVal;
    for (float i = 1.0; i <= 6.0; i += 1.0) {
      vec2 testUv = sampleUv + rayStep * i;
      if (testUv.x >= 0.0 && testUv.x <= 1.0 && testUv.y >= 0.0 && testUv.y <= 1.0) {
        float testH = sampleRawDepth(testUv);
        if (testH > currentH + (i * 0.03)) {
          shadow -= (u_shadowIntensity / 6.0);
        }
      }
    }
    shadow = clamp(shadow, 0.0, 1.0);
  }

  // Diffuse & distance falloff
  float NdotL = max(dot(normal, lightDir), 0.0);
  float atten = 1.0 / pow(1.0 + dist, u_falloff);
  vec3 diffuse = u_lightColor * NdotL * u_lightIntensity * atten * shadow;

  // Ambient & Color preserve
  vec3 ambientLight = u_ambientColor * u_ambient;
  vec3 unlitTone = mix(u_backgroundColor, baseColor.rgb, u_colorPreserve);

  vec3 finalColor = unlitTone + baseColor.rgb * (ambientLight + diffuse);

  gl_FragColor = vec4(clamp(finalColor, 0.0, 1.0), baseColor.a);
}
`;

export function DepthImage({
  image,
  depthMap,
  fit = 'cover',
  depthFromLight = 0.5,
  depthSmoothing = 7,
  depthContrast = 1.2,
  invertDepth = false,
  displacement = 1.5,
  normalStrength = 1.5,
  detail = 0.8,
  shadowIntensity = 0.7,
  shadowSoftness = 0.1,
  lightColor = '#ffffff',
  lightIntensity = 6,
  falloff = 2.5,
  elevation = 1.2,
  ambient = 0.02,
  ambientColor = '#ffffff',
  colorPreserve = 0,
  follow = 0.12,
  autoOrbit = true,
  orbitRadius = 0.6,
  orbitDuration = 10,
  view = 'lit',
  backgroundColor = '#000000',
  fallbackColor = '#171717',
  paused = false,
  dpr = 1.5,
  className = '',
  children,
}: DepthImageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerPos = useRef({ x: 0.5, y: 0.5 });
  const currentPos = useRef({ x: 0.5, y: 0.5 });
  const hasUserMoved = useRef(false);
  const idleTimer = useRef<NodeJS.Timeout | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const animFrameRef = useRef<number | null>(null);
  const startTime = useRef(Date.now());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', {
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: false,
    });

    if (!gl) return;

    const createShader = (type: number, src: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('DepthImage shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertShader = createShader(gl.VERTEX_SHADER, VERTEX_SHADER);
    const fragShader = createShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!vertShader || !fragShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    // Quad geometry
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1, -1,
         1, -1,
        -1,  1,
        -1,  1,
         1, -1,
         1,  1,
      ]),
      gl.STATIC_DRAW
    );

    const aPos = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    // Uniform lookups
    const uImage = gl.getUniformLocation(program, 'u_image');
    const uDepthMap = gl.getUniformLocation(program, 'u_depthMap');
    const uHasDepthMap = gl.getUniformLocation(program, 'u_hasDepthMap');
    const uResolution = gl.getUniformLocation(program, 'u_resolution');
    const uImageResolution = gl.getUniformLocation(program, 'u_imageResolution');
    const uFit = gl.getUniformLocation(program, 'u_fit');
    const uDepthFromLight = gl.getUniformLocation(program, 'u_depthFromLight');
    const uDepthContrast = gl.getUniformLocation(program, 'u_depthContrast');
    const uInvertDepth = gl.getUniformLocation(program, 'u_invertDepth');
    const uDisplacement = gl.getUniformLocation(program, 'u_displacement');
    const uNormalStrength = gl.getUniformLocation(program, 'u_normalStrength');
    const uDetail = gl.getUniformLocation(program, 'u_detail');
    const uShadowIntensity = gl.getUniformLocation(program, 'u_shadowIntensity');
    const uShadowSoftness = gl.getUniformLocation(program, 'u_shadowSoftness');
    const uLightPos = gl.getUniformLocation(program, 'u_lightPos');
    const uElevation = gl.getUniformLocation(program, 'u_elevation');
    const uLightIntensity = gl.getUniformLocation(program, 'u_lightIntensity');
    const uLightColor = gl.getUniformLocation(program, 'u_lightColor');
    const uFalloff = gl.getUniformLocation(program, 'u_falloff');
    const uAmbient = gl.getUniformLocation(program, 'u_ambient');
    const uAmbientColor = gl.getUniformLocation(program, 'u_ambientColor');
    const uColorPreserve = gl.getUniformLocation(program, 'u_colorPreserve');
    const uBackgroundColor = gl.getUniformLocation(program, 'u_backgroundColor');
    const uView = gl.getUniformLocation(program, 'u_view');

    // Load photo texture
    const mainTex = gl.createTexture();
    const imgElement = new window.Image();
    imgElement.crossOrigin = 'anonymous';

    let imgW = 1024;
    let imgH = 418;

    imgElement.onload = () => {
      if (!canvas) return;
      imgW = imgElement.naturalWidth || 1024;
      imgH = imgElement.naturalHeight || 418;
      gl.uniform2f(uImageResolution, imgW, imgH);

      gl.bindTexture(gl.TEXTURE_2D, mainTex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imgElement);

      gl.uniform1i(uImage, 0);
      gl.uniform1i(uHasDepthMap, 0);
      setIsLoaded(true);
    };
    imgElement.src = image;

    // Optional depth map texture
    if (depthMap) {
      const depthTex = gl.createTexture();
      const depthImg = new window.Image();
      depthImg.crossOrigin = 'anonymous';
      depthImg.onload = () => {
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, depthTex);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, depthImg);
        gl.uniform1i(uDepthMap, 1);
        gl.uniform1i(uHasDepthMap, 1);
      };
      depthImg.src = depthMap;
    }

    const handleResize = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const renderScale = Math.min(window.devicePixelRatio || 1, dpr);
      canvas.width = rect.width * renderScale;
      canvas.height = rect.height * renderScale;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uResolution, canvas.width, canvas.height);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const lColor = hexToRgb(lightColor);
    const aColor = hexToRgb(ambientColor);
    const bColor = hexToRgb(backgroundColor);

    // Static uniform assignments
    gl.uniform1i(uFit, fit === 'cover' ? 0 : 1);
    gl.uniform1f(uDepthFromLight, depthFromLight);
    gl.uniform1f(uDepthContrast, depthContrast);
    gl.uniform1i(uInvertDepth, invertDepth ? 1 : 0);
    gl.uniform1f(uDisplacement, displacement);
    gl.uniform1f(uNormalStrength, normalStrength);
    gl.uniform1f(uDetail, detail);
    gl.uniform1f(uShadowIntensity, shadowIntensity);
    gl.uniform1f(uShadowSoftness, shadowSoftness);
    gl.uniform1f(uElevation, elevation);
    gl.uniform1f(uLightIntensity, lightIntensity);
    gl.uniform3fv(uLightColor, lColor);
    gl.uniform1f(uFalloff, falloff);
    gl.uniform1f(uAmbient, ambient);
    gl.uniform3fv(uAmbientColor, aColor);
    gl.uniform1f(uColorPreserve, colorPreserve);
    gl.uniform3fv(uBackgroundColor, bColor);
    gl.uniform1i(uView, view === 'depth' ? 1 : view === 'normal' ? 2 : 0);

    // Render loop
    const render = () => {
      if (!paused) {
        let targetX = pointerPos.current.x;
        let targetY = pointerPos.current.y;

        // Auto Orbit if user is idle and autoOrbit is enabled
        if (autoOrbit && !hasUserMoved.current) {
          const elapsed = (Date.now() - startTime.current) / 1000;
          const angle = (elapsed / orbitDuration) * Math.PI * 2;
          targetX = 0.5 + Math.cos(angle) * (orbitRadius * 0.4);
          targetY = 0.5 + Math.sin(angle) * (orbitRadius * 0.4);
        }

        currentPos.current.x += (targetX - currentPos.current.x) * follow;
        currentPos.current.y += (targetY - currentPos.current.y) * follow;
      }

      gl.uniform2f(uLightPos, currentPos.current.x, currentPos.current.y);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    // Pointer events
    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      hasUserMoved.current = true;
      if (idleTimer.current) clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => {
        hasUserMoved.current = false;
      }, 3500);

      const rect = canvas.getBoundingClientRect();
      let clientX = 0;
      let clientY = 0;

      if ('touches' in e && e.touches.length > 0) {
        const t = e.touches[0];
        if (t) {
          clientX = t.clientX;
          clientY = t.clientY;
        }
      } else if ('clientX' in e) {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      const x = (clientX - rect.left) / rect.width;
      const y = (clientY - rect.top) / rect.height;

      pointerPos.current = {
        x: Math.max(0.0, Math.min(1.0, x)),
        y: Math.max(0.0, Math.min(1.0, y)),
      };
    };

    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('touchmove', handlePointerMove, { passive: true });

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (idleTimer.current) clearTimeout(idleTimer.current);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('touchmove', handlePointerMove);
      gl.deleteProgram(program);
      gl.deleteShader(vertShader);
      gl.deleteShader(fragShader);
      gl.deleteBuffer(buffer);
    };
  }, [
    image,
    depthMap,
    fit,
    depthFromLight,
    depthSmoothing,
    depthContrast,
    invertDepth,
    displacement,
    normalStrength,
    detail,
    shadowIntensity,
    shadowSoftness,
    lightColor,
    lightIntensity,
    falloff,
    elevation,
    ambient,
    ambientColor,
    colorPreserve,
    follow,
    autoOrbit,
    orbitRadius,
    orbitDuration,
    view,
    backgroundColor,
    fallbackColor,
    paused,
    dpr,
  ]);

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ backgroundColor: isLoaded ? backgroundColor : fallbackColor }}
    >
      <canvas
        ref={canvasRef}
        className={`w-full h-full object-cover transition-opacity duration-700 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
      {children && <div className="absolute inset-0 z-10">{children}</div>}
    </div>
  );
}
export default DepthImage;
