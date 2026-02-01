import confetti from 'canvas-confetti';
import type { Options as ConfettiOptions } from 'canvas-confetti';

let lastFire = 0;

const colors = ['#1e3a5f', '#2c4a6e', '#d4af37', '#f4d03f', '#ffffff'];

export function fire(options?: ConfettiOptions) {
	if (typeof window === 'undefined') return;
	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

	// Debounce rapid fires (minimum 500ms between)
	const now = Date.now();
	if (now - lastFire < 500) return;
	lastFire = now;

	const defaults: ConfettiOptions = {
		particleCount: 50,
		spread: 60,
		origin: { y: 0.6 },
		colors,
		disableForReducedMotion: true
	};

	confetti({ ...defaults, ...options });
}

export function burst(x = 0.5, y = 0.5) {
	fire({
		particleCount: 80,
		spread: 100,
		origin: { x, y }
	});
}

export function shower() {
	if (typeof window === 'undefined') return;
	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

	const duration = 2000;
	const animationEnd = Date.now() + duration;

	const frame = () => {
		confetti({
			particleCount: 3,
			angle: 60,
			spread: 55,
			origin: { x: 0 },
			colors,
			disableForReducedMotion: true
		});
		confetti({
			particleCount: 3,
			angle: 120,
			spread: 55,
			origin: { x: 1 },
			colors,
			disableForReducedMotion: true
		});

		if (Date.now() < animationEnd) {
			requestAnimationFrame(frame);
		}
	};

	frame();
}

export function celebration() {
	if (typeof window === 'undefined') return;
	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

	const count = 200;
	const defaults: ConfettiOptions = {
		origin: { y: 0.7 },
		disableForReducedMotion: true
	};

	function fireConfetti(particleRatio: number, opts: ConfettiOptions) {
		confetti({
			...defaults,
			...opts,
			particleCount: Math.floor(count * particleRatio),
			colors
		});
	}

	fireConfetti(0.25, { spread: 26, startVelocity: 55 });
	fireConfetti(0.2, { spread: 60 });
	fireConfetti(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
	fireConfetti(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
	fireConfetti(0.1, { spread: 120, startVelocity: 45 });
}
