const colors = {
	gray: '#555555',
	light: '#AAAAAA',
	road: '#666', // >:D
	energy: '#FFE87B',
	power: '#F53547',
	dark: '#181818',
	outline: '#8FBB93',
	speechText: '#000000',
	speechBackground: '#2ccf3b'
}

const dirs = [
	[],
	[0, -1],
	[1, -1],
	[1, 0],
	[1, 1],
	[0, 1],
	[-1, 1],
	[-1, 0],
	[-1, -1]
]
function rotate(x: number, y: number, s: number, c: number, px: number, py: number) {
	let xDelta = x * c - y * s;
	let yDelta = x * s + y * c;
	return { x: px + xDelta, y: py + yDelta };
}


function relPoly(x: number, y: number, poly: number[][]): number[][] {
	return poly.map(p => {
		p[0] += x;
		p[1] += y;
		return p;
	});
}
export default class extends RoomVisual {
	roads?: [number, number][];

	public connRoads(opts: any = {}) {

		let color = opts.color || colors.road || 'white'
		if (!this.roads) return
		this.roads.forEach(r => {
			for (let i = 1; i <= 4; i++) {
				let d = dirs[i]
				let c = [r[0] + d[0], r[1] + d[1]]
				let rd = _.some(this.roads!, r => r[0] == c[0] && r[1] == c[1])
				if (rd) {
					this.line(r[0], r[1], c[0], c[1], {
						color: color,
						width: 0.35,
						opacity: opts.opacity || 1
					})
				}
			}
		})

		return this;

	}
	public structure(x: number, y: number, type: string, opts?: { opacity: number }) {
		opts = Object.assign({
			opacity: 0.2
		}, opts)
		switch (type) {
			case STRUCTURE_RAMPART:
				this.rect(x - 0.5, y - 0.5, 1, 1, {
					fill: '#434C43',
					stroke: '#5D735F',
					strokeWidth: 0.10,
					opacity: opts.opacity
				})
				break;
			case STRUCTURE_LINK:
				let osize = 0.3
				let isize = 0.2
				let outer = [
					[0.0, -0.5],
					[0.4, 0.0],
					[0.0, 0.5],
					[-0.4, 0.0]
				];
				let inner = [
					[0.0, -0.3],
					[0.25, 0.0],
					[0.0, 0.3],
					[-0.25, 0.0]
				];
				outer = relPoly(x, y, outer)
				inner = relPoly(x, y, inner)
				outer.push(outer[0])
				inner.push(inner[0])
				this.poly(outer as Array<[number, number] | RoomPosition>, {
					fill: colors.dark,
					stroke: colors.outline,
					strokeWidth: 0.05,
					opacity: opts.opacity
				})
				this.poly(inner as any, {
					fill: colors.gray,
					opacity: opts.opacity
				})
				break;
			case STRUCTURE_EXTENSION:
				this.circle(x, y, {
					radius: 0.5,
					fill: colors.dark,
					stroke: colors.outline,
					strokeWidth: 0.05,
					opacity: opts.opacity
				})
				this.circle(x, y, {
					radius: 0.35,
					fill: colors.gray,
					opacity: opts.opacity
				})
				break;
			case STRUCTURE_TOWER:
				this.circle(x, y, {
					radius: 0.6,
					fill: colors.dark,
					stroke: colors.outline,
					strokeWidth: 0.05,
					opacity: opts.opacity
				})
				this.rect(x - 0.4, y - 0.3, 0.8, 0.6, {
					fill: colors.gray,
					opacity: opts.opacity
				})
				this.rect(x - 0.2, y - 0.9, 0.4, 0.5, {
					fill: colors.light,
					stroke: colors.dark,
					strokeWidth: 0.07,
					opacity: opts.opacity
				})
				break;
			case STRUCTURE_ROAD:
				this.circle(x, y, {
					radius: 0.175,
					fill: colors.road,
					opacity: opts.opacity
				})
				if (!this.roads) this.roads = []
				this.roads.push([x, y])
				break;
			case STRUCTURE_STORAGE:
				let outline1 = relPoly(x, y, [
					[-0.45, -0.55],
					[0, -0.65],
					[0.45, -0.55],
					[0.55, 0],
					[0.45, 0.55],
					[0, 0.65],
					[-0.45, 0.55],
					[-0.55, 0],
					[-0.45, -0.55],
				])
				this.poly(outline1 as Array<[number, number] | RoomPosition>, {
					stroke: colors.outline,
					strokeWidth: 0.05,
					fill: colors.dark,
					opacity: opts.opacity
				})
				this.rect(x - 0.35, y - 0.45, 0.7, 0.9, {
					fill: colors.energy,
					opacity: opts.opacity,
				})
				break;
			case STRUCTURE_SPAWN:
				this.circle(x, y, {
					radius: 0.65,
					fill: colors.dark,
					stroke: '#CCCCCC',
					strokeWidth: 0.10,
					opacity: opts.opacity
				})
				this.circle(x, y, {
					radius: 0.40,
					fill: colors.energy,
					opacity: opts.opacity
				})

				break;
			case STRUCTURE_TERMINAL:
				{
					let outer = [
						[0.0, -0.8],
						[0.55, -0.55],
						[0.8, 0.0],
						[0.55, 0.55],
						[0.0, 0.8],
						[-0.55, 0.55],
						[-0.8, 0.0],
						[-0.55, -0.55],
					];
					let inner = [
						[0.0, -0.65],
						[0.45, -0.45],
						[0.65, 0.0],
						[0.45, 0.45],
						[0.0, 0.65],
						[-0.45, 0.45],
						[-0.65, 0.0],
						[-0.45, -0.45],
					];
					outer = relPoly(x, y, outer)
					inner = relPoly(x, y, inner)
					outer.push(outer[0])
					inner.push(inner[0])
					this.poly(outer as Array<[number, number] | RoomPosition>, {
						fill: colors.dark,
						stroke: colors.outline,
						strokeWidth: 0.05,
						opacity: opts.opacity
					})
					this.poly(inner as Array<[number, number] | RoomPosition>, {
						fill: colors.light,
						opacity: opts.opacity
					})
					this.rect(x - 0.45, y - 0.45, 0.9, 0.9, {
						fill: colors.gray,
						stroke: colors.dark,
						strokeWidth: 0.1,
						opacity: opts.opacity
					})
					break;
				}
			case STRUCTURE_LAB:
				this.circle(x, y - 0.025, {
					radius: 0.55,
					fill: colors.dark,
					stroke: colors.outline,
					strokeWidth: 0.05,
					opacity: opts.opacity
				})
				this.circle(x, y - 0.025, {
					radius: 0.40,
					fill: colors.gray,
					opacity: opts.opacity
				})
				this.rect(x - 0.45, y + 0.3, 0.9, 0.25, {
					fill: colors.dark,
					opacity: opts.opacity
				})
				{
					let box= [
						[-0.45, 0.3],
						[-0.45, 0.55],
						[0.45, 0.55],
						[0.45, 0.3],
					]
					box = relPoly(x, y, box)
					this.poly(box as Array<[number, number] | RoomPosition>, {
						stroke: colors.outline,
						strokeWidth: 0.05,
						opacity: opts.opacity
					})
				}
				break
			case STRUCTURE_POWER_SPAWN:
				this.circle(x, y, {
					radius: 0.65,
					fill: colors.dark,
					stroke: colors.power,
					strokeWidth: 0.10,
					opacity: opts.opacity
				})
				this.circle(x, y, {
					radius: 0.40,
					fill: colors.energy,
					opacity: opts.opacity
				})
				break;
			case STRUCTURE_OBSERVER:
				this.circle(x, y, {
					fill: colors.dark,
					radius: 0.45,
					stroke: colors.outline,
					strokeWidth: 0.05,
					opacity: opts.opacity
				});
				this.circle(x + 0.225, y, {
					fill: colors.outline,
					radius: 0.20,
					opacity: opts.opacity
				});
				break;
			case STRUCTURE_NUKER:
				let outline = [
					[0, -1],
					[-0.47, 0.2],
					[-0.5, 0.5],
					[0.5, 0.5],
					[0.47, 0.2],
					[0, -1],
				];
				outline = relPoly(x, y, outline);
				this.poly(outline as Array<[number, number] | RoomPosition>, {
					stroke: colors.outline,
					strokeWidth: 0.05,
					fill: colors.dark,
					opacity: opts.opacity
				});
				let inline = [
					[0, -.80],
					[-0.40, 0.2],
					[0.40, 0.2],
					[0, -.80],
				];
				inline = relPoly(x, y, inline);
				this.poly(inline as Array<[number, number] | RoomPosition>, {
					stroke: colors.outline,
					strokeWidth: 0.01,
					fill: colors.gray,
					opacity: opts.opacity
				});
				break;
			default:
				this.circle(x, y, {
					fill: 'red'
				})
				break;
		}

	}
}

