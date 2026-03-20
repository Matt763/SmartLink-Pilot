"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseVx: number;
  baseVy: number;
}

export function SpiderWeb() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerRef = useRef({ x: -1000, y: -1000, active: false });
  const prevPointerRef = useRef({ x: 0, y: 0 });
  const velocityRef = useRef(0);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0, h = 0;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      w = parent.offsetWidth;
      h = parent.offsetHeight;
      canvas.width = w;
      canvas.height = h;
    };

    const PARTICLE_COUNT = 70;
    const CONNECTION_DIST = 130;
    const POINTER_DIST = 200;
    const MAGNETIC_DIST = 250;
    const MAGNETIC_STRENGTH = 0.015;
    const MAX_VELOCITY_FOR_INTERACTION = 25;

    const init = () => {
      resize();
      particlesRef.current = [];
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const vx = (Math.random() - 0.5) * 0.5;
        const vy = (Math.random() - 0.5) * 0.5;
        particlesRef.current.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx, vy,
          baseVx: vx,
          baseVy: vy,
        });
      }
    };

    const animate = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, w, h);

      const particles = particlesRef.current;
      const pointer = pointerRef.current;
      const vel = velocityRef.current;
      const canInteract = vel < MAX_VELOCITY_FOR_INTERACTION && pointer.active;

      const isDark = document.documentElement.classList.contains("dark");
      const lineColor = isDark ? "147, 197, 253" : "99, 102, 241";
      const dotColor = isDark ? "rgba(147, 197, 253, 0.35)" : "rgba(99, 102, 241, 0.25)";
      const pointerLineColor = isDark ? "147, 197, 253" : "99, 102, 241";

      for (const p of particles) {
        // Magnetic pull toward pointer
        if (canInteract) {
          const dx = pointer.x - p.x;
          const dy = pointer.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MAGNETIC_DIST && dist > 0) {
            const force = (1 - dist / MAGNETIC_DIST) * MAGNETIC_STRENGTH;
            p.vx += dx * force;
            p.vy += dy * force;
          }
        }

        // Dampen back to base velocity
        p.vx += (p.baseVx - p.vx) * 0.02;
        p.vy += (p.baseVy - p.vy) * 0.02;

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) { p.x = 0; p.vx *= -1; p.baseVx *= -1; }
        if (p.x > w) { p.x = w; p.vx *= -1; p.baseVx *= -1; }
        if (p.y < 0) { p.y = 0; p.vy *= -1; p.baseVy *= -1; }
        if (p.y > h) { p.y = h; p.vy *= -1; p.baseVy *= -1; }
      }

      // Draw particle connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DIST) {
            const opacity = (1 - dist / CONNECTION_DIST) * 0.12;
            ctx.strokeStyle = `rgba(${lineColor}, ${opacity})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }

        // Pointer connection lines
        if (canInteract) {
          const mdx = particles[i].x - pointer.x;
          const mdy = particles[i].y - pointer.y;
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
          if (mdist < POINTER_DIST) {
            const opacity = (1 - mdist / POINTER_DIST) * 0.5;
            ctx.strokeStyle = `rgba(${pointerLineColor}, ${opacity})`;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(pointer.x, pointer.y);
            ctx.stroke();
          }
        }

        // Draw dot
        ctx.fillStyle = dotColor;
        ctx.beginPath();
        ctx.arc(particles[i].x, particles[i].y, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    // Pointer tracking (mouse + touch)
    const updatePointer = (x: number, y: number) => {
      const rect = canvas.getBoundingClientRect();
      const nx = x - rect.left;
      const ny = y - rect.top;

      const dx = nx - prevPointerRef.current.x;
      const dy = ny - prevPointerRef.current.y;
      velocityRef.current = Math.sqrt(dx * dx + dy * dy);

      prevPointerRef.current = { x: nx, y: ny };
      pointerRef.current = { x: nx, y: ny, active: true };
    };

    const handleMouseMove = (e: MouseEvent) => updatePointer(e.clientX, e.clientY);
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        updatePointer(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const rect = canvas.getBoundingClientRect();
        prevPointerRef.current = { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
        updatePointer(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const handlePointerLeave = () => {
      pointerRef.current = { x: -1000, y: -1000, active: false };
      velocityRef.current = 0;
    };

    init();
    animate();

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handlePointerLeave);
    canvas.addEventListener("touchmove", handleTouchMove, { passive: true });
    canvas.addEventListener("touchstart", handleTouchStart, { passive: true });
    canvas.addEventListener("touchend", handlePointerLeave);
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handlePointerLeave);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchend", handlePointerLeave);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-auto touch-none"
      style={{ width: "100%", height: "100%" }}
    />
  );
}
