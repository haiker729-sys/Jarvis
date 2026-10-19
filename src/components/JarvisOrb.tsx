import React, { useEffect, useRef } from 'react';
import { AppTheme, ConversationState } from '../types';

interface JarvisOrbProps {
  state: ConversationState;
  theme: AppTheme;
  letter?: string;
  audioAmp?: number;
  glowMultiplier?: number;
  speedMultiplier?: number;
  scaleMultiplier?: number;
  onOrbClick?: () => void;
  onOrbLongPress?: () => void;
}

export const JarvisOrb: React.FC<JarvisOrbProps> = ({
  state,
  theme,
  letter = 'J',
  audioAmp = 0,
  glowMultiplier = 1.0,
  speedMultiplier = 1.0,
  scaleMultiplier = 1.0,
  onOrbClick,
  onOrbLongPress,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const phaseRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Determine theme colors
  const getThemePalette = (t: AppTheme) => {
    switch (t) {
      case 'sunset':
        return {
          primary: 'rgb(255, 106, 61)',
          secondary: 'rgb(244, 63, 94)',
          tertiary: 'rgb(139, 92, 246)',
          core: 'rgb(255, 138, 97)',
          halo: 'rgba(255, 106, 61, 0.25)',
        };
      case 'red':
        return {
          primary: 'rgb(255, 70, 90)',
          secondary: 'rgb(220, 38, 38)',
          tertiary: 'rgb(185, 28, 28)',
          core: 'rgb(255, 110, 130)',
          halo: 'rgba(255, 70, 90, 0.25)',
        };
      case 'light':
        return {
          primary: 'rgb(37, 99, 235)',
          secondary: 'rgb(59, 130, 246)',
          tertiary: 'rgb(99, 102, 241)',
          core: 'rgb(147, 197, 253)',
          halo: 'rgba(37, 99, 235, 0.25)',
        };
      case 'dark':
      default:
        return {
          primary: 'rgb(0, 190, 255)',
          secondary: 'rgb(37, 99, 235)',
          tertiary: 'rgb(79, 70, 229)',
          core: 'rgb(125, 211, 252)',
          halo: 'rgba(0, 190, 255, 0.25)',
        };
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let localPhase = phaseRef.current;

    const render = () => {
      const palette = getThemePalette(theme);
      const width = canvas.width;
      const height = canvas.height;
      const cx = width / 2;
      const cy = height / 2;
      const baseRadius = Math.min(width, height) * 0.24 * scaleMultiplier;

      // Base intensity mapped to state
      let intensity = 0.55;
      if (state === 'listening') intensity = 1.0;
      else if (state === 'speaking') intensity = 0.9;
      else if (state === 'thinking') intensity = 0.72;
      else if (state === 'error') intensity = 0.6;

      // Audio amplitude reactivity
      const ampBoost = audioAmp * 0.45;
      const currentRadius = baseRadius * (1 + ampBoost * 0.5);

      // Increment phase
      const speed = 0.015 * speedMultiplier * (state === 'thinking' ? 2.5 : 1.0);
      localPhase = (localPhase + speed) % (Math.PI * 2);
      phaseRef.current = localPhase;

      ctx.clearRect(0, 0, width, height);

      // 1. Ambient outer volumetric glow
      const outerGlowRad = currentRadius * 2.2 * glowMultiplier;
      const radGradOuter = ctx.createRadialGradient(cx, cy, 0, cx, cy, outerGlowRad);
      radGradOuter.addColorStop(0, palette.halo);
      radGradOuter.addColorStop(0.5, palette.halo.replace(/[\d\.]+\)$/, '0.08)'));
      radGradOuter.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = radGradOuter;
      ctx.beginPath();
      ctx.arc(cx, cy, outerGlowRad, 0, Math.PI * 2);
      ctx.fill();

      // 2. High-frequency pulsing energy rings
      ctx.lineWidth = 1.8;
      ctx.strokeStyle = palette.primary.replace('rgb', 'rgba').replace(')', `, ${0.4 * intensity})`);
      ctx.beginPath();
      const waveOffset = Math.sin(localPhase * 4) * 4 * intensity;
      ctx.arc(cx, cy, currentRadius * 1.35 + waveOffset, 0, Math.PI * 2);
      ctx.stroke();

      // 3. Multi-layer counter-rotating orbital arcs (Arc Reactor aesthetic)
      for (let i = 0; i < 3; i++) {
        const ringRad = currentRadius * (0.85 + i * 0.24);
        const arcLength = 0.55 * Math.PI + (i % 2 === 0 ? 0.3 : -0.2);
        const startAngle = (localPhase * (i % 2 === 0 ? 1.5 : -1.8)) + (i * Math.PI * 0.66);

        ctx.lineWidth = 2.4 - i * 0.5;
        ctx.strokeStyle = (i === 1 ? palette.secondary : palette.primary)
          .replace('rgb', 'rgba')
          .replace(')', `, ${Math.max(0.2, (0.75 - i * 0.18) * intensity)})`);

        ctx.beginPath();
        ctx.arc(cx, cy, ringRad, startAngle, startAngle + arcLength);
        ctx.stroke();

        // Little energy particles along arc
        const dotAngle = startAngle + arcLength;
        const dotX = cx + Math.cos(dotAngle) * ringRad;
        const dotY = cy + Math.sin(dotAngle) * ringRad;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(dotX, dotY, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // 4. Center Glowing Sphere
      const sphereRad = currentRadius * (0.82 + 0.04 * Math.sin(localPhase * 3));
      const radGradInner = ctx.createRadialGradient(
        cx - sphereRad * 0.25,
        cy - sphereRad * 0.3,
        sphereRad * 0.1,
        cx,
        cy,
        sphereRad * 1.2
      );
      radGradInner.addColorStop(0, '#ffffff');
      radGradInner.addColorStop(0.25, palette.core);
      radGradInner.addColorStop(0.7, palette.primary);
      radGradInner.addColorStop(1, palette.tertiary);

      ctx.fillStyle = radGradInner;
      ctx.beginPath();
      ctx.arc(cx, cy, sphereRad, 0, Math.PI * 2);
      ctx.fill();

      // 5. Letter Symbol in Center ("J" / "N")
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `bold ${Math.round(sphereRad * 0.55)}px system-ui, -apple-system, sans-serif`;
      ctx.shadowColor = palette.primary;
      ctx.shadowBlur = 12 * intensity;
      ctx.fillText(letter, cx, cy + 2);
      ctx.shadowBlur = 0;

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [state, theme, letter, audioAmp, glowMultiplier, speedMultiplier, scaleMultiplier]);

  const handlePointerDown = () => {
    longPressTimerRef.current = setTimeout(() => {
      onOrbLongPress?.();
    }, 800);
  };

  const handlePointerUp = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  return (
    <div
      className="relative flex items-center justify-center cursor-pointer select-none touch-none"
      onClick={onOrbClick}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      title="Tap to talk / Hold to power off"
    >
      <canvas
        ref={canvasRef}
        width={340}
        height={340}
        className="w-72 h-72 sm:w-80 sm:h-80 transition-transform duration-300 hover:scale-105 active:scale-95"
      />
    </div>
  );
};
