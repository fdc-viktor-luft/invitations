const HALF_PI = Math.PI * 0.5;

const Ease = {
	outCubic: (t: number, b: number, c: number, d: number) => {
		t /= d;
		t--;
		return c * (t * t * t + 1) + b;
	}
};

export const drawIntoCanvas = () => {
	// canvas settings
	const viewWidth = 512,
		viewHeight = 350,
		drawingCanvas = document.querySelector('canvas'),
		nullableCtx = drawingCanvas?.getContext('2d'),
		timeStep = 1 / 60;

	if (!drawingCanvas || !nullableCtx) return;

	drawingCanvas.width = viewWidth;
	drawingCanvas.height = viewHeight;
	const ctx = nullableCtx;

	class Point {
		x: number;
		y: number;

		constructor(x = 0, y = 0) {
			this.x = x;
			this.y = y;
		}
	}

	class Particle {
		p0: Point;
		p1: Point;
		p2: Point;
		p3: Point;

		time: number;
		duration: number;
		color: string;
		w: number;
		h: number;

		// from update
		r: number;
		sy: number;
		x: number;
		y: number;

		complete: boolean;

		constructor(p0: Point, p1: Point, p2: Point, p3: Point) {
			this.p0 = p0;
			this.p1 = p1;
			this.p2 = p2;
			this.p3 = p3;
			this.time = 0;
			this.duration = 3 + Math.random() * 2;
			this.color = '#' + Math.floor(Math.random() * 0xffffff).toString(16);

			this.w = 8;
			this.h = 6;

			this.complete = false;

			this.r = 0;
			this.sy = 0;
			this.x = 0;
			this.y = 0;
		}

		update() {
			this.time = Math.min(this.duration, this.time + timeStep);

			const f = Ease.outCubic(this.time, 0, 1, this.duration);
			const p = cubeBezier(this.p0, this.p1, this.p2, this.p3, f);

			const dx = p.x - this.x;
			const dy = p.y - this.y;

			this.r = Math.atan2(dy, dx) + HALF_PI;
			this.sy = Math.sin(Math.PI * f * 10);
			this.x = p.x;
			this.y = p.y;

			this.complete = this.time === this.duration;
		}
		draw() {
			ctx.save();
			ctx.translate(this.x, this.y);
			ctx.rotate(this.r);
			ctx.scale(1, this.sy);

			ctx.fillStyle = this.color;
			ctx.fillRect(-this.w * 0.5, -this.h * 0.5, this.w, this.h);

			ctx.restore();
		}
	}

	const particles: Particle[] = [];
	for (let i = 0; i < 128; i++) {
		const p0 = new Point(viewWidth * 0.5, viewHeight * 0.5);
		const p1 = new Point(Math.random() * viewWidth, Math.random() * viewHeight);
		const p2 = new Point(Math.random() * viewWidth, Math.random() * viewHeight);
		const p3 = new Point(Math.random() * viewWidth, viewHeight + 64);

		particles.push(new Particle(p0, p1, p2, p3));
	}

	const loop = () => {
		particles.forEach((p) => p.update());
		ctx.clearRect(0, 0, viewWidth, viewHeight);
		particles.forEach((p) => p.draw());

		if (particles.every((p) => p.complete)) {
			return;
		}

		requestAnimationFrame(loop);
	};

	requestAnimationFrame(loop);

	function cubeBezier(p0: Point, c0: Point, c1: Point, p1: Point, t: number) {
		const p = new Point();
		const nt = 1 - t;

		p.x = nt * nt * nt * p0.x + 3 * nt * nt * t * c0.x + 3 * nt * t * t * c1.x + t * t * t * p1.x;
		p.y = nt * nt * nt * p0.y + 3 * nt * nt * t * c0.y + 3 * nt * t * t * c1.y + t * t * t * p1.y;

		return p;
	}
};
