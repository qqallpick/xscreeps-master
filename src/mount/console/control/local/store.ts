/* 房间统计  轮子-非自己开发! */
/* 与room.memory相关的和getRooms()需要根据自己情况更改 */
type Colors = 'red'|'blue'| 'green' | 'yellow'
const colors: { [name in Colors]: string } = {
	red: '#ef9a9a',
	green: '#6b9955',
	yellow: '#c5c599',
	blue: '#8dc5e3'
}

export function getColor(val: number) {
	if (val > 100) val = 100;
	//let 百分之一 = (单色值范围) / 50;  单颜色的变化范围只在50%之内
	let per = (255 + 255) / 100;
	let r = 0;
	let g = 0;
	let b = 0;

	if (val < 50) {
		// 比例小于50的时候红色是越来越多的,直到红色为255时(红+绿)变为黄色.
		r = per * val;
		g = 255;
	}
	if (val >= 50) {
		// 比例大于50的时候绿色是越来越少的,直到0 变为纯红
		g = 255 - ((val - 50) * per);
		r = 255;
	}
	r = Math.ceil(r);// 取整
	g = Math.ceil(g);// 取整
	b = Math.ceil(b);// 取整
	return "rgb(" + r + "," + g + "," + b + ")";
}

export function colorHex(color: string) {
	let reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
	if (/^(rgb|RGB)/.test(color)) {
		let aColor = color.replace(/(?:\(|\)|rgb|RGB)*/g, "").split(",");
		let strHex = "#";
		for (let i = 0; i < aColor.length; i++) {
			let hex = Number(aColor[i]).toString(16);
			if (hex === "0") {
				hex += hex;
			}
			strHex += hex;
		}
		if (strHex.length !== 7) {
			strHex = color;
		}
		return strHex;
	} else if (reg.test(color)) {
		let aNum = color.replace(/#/, "").split("");
		if (aNum.length === 6) {
			return color;
		} else if (aNum.length === 3) {
			let numHex = "#";
			for (let i = 0; i < aNum.length; i++) {
				numHex += (aNum[i] + aNum[i]);
			}
			return numHex;
		}
	} else {
		return color;
	}
};

export function Colorful(content: string, colorName: Colors | string = null, bolder: boolean = false): string {
	const colorStyle = colorName ? `color: ${colors[colorName] ? colors[colorName] : colorName};` : ''
	const bolderStyle = bolder ? 'font-weight: bolder;' : ''

	return `<text style="${[colorStyle, bolderStyle].join(' ')}">${content}</text>`
}

function getRooms(): string[] {
	let rooms = [];
	for (let name in Memory.RoomControlData) {
        if (Game.rooms[name])
		rooms.push(name)
	}
	return rooms;
}

export function getStore(roomName?: string) {
	if (roomName) {
		let storage = Game.rooms[roomName].storage;
		let terminal = Game.rooms[roomName].terminal;
		let factory = Game.getObjectById(Game.rooms[roomName].memory.StructureIdData?Game.rooms[roomName].memory.StructureIdData.FactoryId:'') as StructureFactory;
		let storageUsed = storage?.store.getUsedCapacity() || 0;
		let storeCapacity = storage?.store.getCapacity() || 1;
		let storageProportion = (storageUsed / storeCapacity * 100).toFixed(2) + '%';
		let storageColor = colorHex(getColor(Math.ceil(storageUsed / storeCapacity * 100)));
		let terminalUsed = terminal?.store.getUsedCapacity() || 0;
		let terminalCapacity = terminal?.store.getCapacity() || 1;
		let terminalProportion = (terminalUsed / terminalCapacity * 100).toFixed(2) + '%';
		let terminalColor = colorHex(getColor(Math.ceil(terminalUsed / terminalCapacity * 100)));
		let factoryUsed = factory?.store.getUsedCapacity() || 0;
		let factoryCapacity = factory?.store.getCapacity() || 1;
		let factoryProportion = (factoryUsed / factoryCapacity * 100).toFixed(2) + '%';
		let factoryColor = colorHex(getColor(Math.ceil(factoryUsed / factoryCapacity * 100)));
		console.log(Colorful(roomName, 'blue'),
			'Storage:', Colorful(storageProportion, storageColor), ' ',
			'Terminal', Colorful(terminalProportion, terminalColor), ' ',
			'Factory', Colorful(factoryProportion, factoryColor));
	} else {
		let rooms = getRooms();
		for (let i = 0; i < rooms.length; i++) {
			let storage = Game.rooms[rooms[i]].storage;
			let terminal = Game.rooms[rooms[i]].terminal;
			let factory = Game.getObjectById(Game.rooms[rooms[i]].memory.StructureIdData?Game.rooms[rooms[i]].memory.StructureIdData.FactoryId:'') as StructureFactory;
			let storageUsed = storage?.store.getUsedCapacity() || 0;
			let storeCapacity = storage?.store.getCapacity() || 1;
			let storageProportion = (storageUsed / storeCapacity * 100).toFixed(2) + '%';
			let storageColor = colorHex(getColor(Math.ceil(storageUsed / storeCapacity * 100)));
			let terminalUsed = terminal?.store.getUsedCapacity() || 0;
			let terminalCapacity = terminal?.store.getCapacity() || 1;
			let terminalProportion = (terminalUsed / terminalCapacity * 100).toFixed(2) + '%';
			let terminalColor = colorHex(getColor(Math.ceil(terminalUsed / terminalCapacity * 100)));
			let factoryUsed = factory?.store.getUsedCapacity() || 0;
			let factoryCapacity = factory?.store.getCapacity() || 1;
			let factoryProportion = (factoryUsed / factoryCapacity * 100).toFixed(2) + '%';
			let factoryColor = colorHex(getColor(Math.ceil(factoryUsed / factoryCapacity * 100)));
			console.log(Colorful(rooms[i], 'blue'),
				'Storage:', Colorful(storageProportion, storageColor), ' ',
				'Terminal', Colorful(terminalProportion, terminalColor), ' ',
				'Factory', Colorful(factoryProportion, factoryColor));
				// Colorful(string, colorHex(getColor(Math.ceil(storageUsed / storeCapacity * 100))))
		}
	}
}