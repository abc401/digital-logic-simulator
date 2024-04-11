import { CustomCircuit } from './objects/circuits/custom-circuit.js';
import { CustomCircuitOutputs } from './objects/circuits/custom-circuit-outputs.js';
import { CustomCircuitInputs } from './objects/circuits/custom-circuit-inputs.js';
import { Wire } from './objects/wire.js';
import { StackList } from '@ts/data-structures/stacklist.js';
import { circuitColor, ornamentColor, sceneManager, viewManager } from '@routes/+page.svelte';
import { integratedCircuits } from '@src/lib/stores/integrated-circuits.js';
import {
	HOME_SCENE_NAME,
	PIN_EXTRUSION_WRL,
	PIN_TO_PIN_DISTANCE_WRL,
	SELECTED_COLOR
} from '@ts/config.js';
import { Rect, Vec2 } from '@ts/math.js';
import { type Circuit, dummyCircuit } from './objects/circuits/circuit.js';
import { ConcreteObjectKind } from './scene-manager.js';
import { writable } from 'svelte/store';

export class Scene {
	name: string = '';
	customCircuitInputs: CustomCircuitInputs | undefined;
	customCircuitOutputs: CustomCircuitOutputs | undefined;

	circuits: StackList<CircuitSceneObject> = new StackList();
	wires: StackList<Wire> = new StackList();

	tmpCircuits = new Set<CircuitSceneObject>();
	tmpWires = new Set<Wire>();

	lastUpdateIdx = 0;

	customCircuitInstances = new Map<
		string,
		{ lastUpdateIdx: number; instances: Set<CustomCircuit> }
	>();

	commitTmpObjects() {
		if (this.tmpCircuits.size > 0 || this.tmpWires.size > 0) {
			this.lastUpdateIdx += 1;
			console.log(`${this.name} updated with index ${this.lastUpdateIdx}`);
		} else {
			console.log(`${this.name} wasnt updated`);
		}
		this.tmpCircuits = new Set();
		this.tmpWires = new Set();
		console.log(`${this.name} Commited`);
	}

	registerCircuit(circuit: CircuitSceneObject) {
		this.circuits.push(circuit);
		if (this.name != HOME_SCENE_NAME) {
			this.tmpCircuits.add(circuit);
		}
	}

	registerWire(wire: Wire) {
		this.wires.push(wire);
		if (this.name != HOME_SCENE_NAME) {
			this.tmpWires.add(wire);
		}
	}

	unregisterWire(wire: Wire) {
		this.wires.remove(wire);
		this.tmpWires.delete(wire);
	}

	reEvaluateCustomCircuits() {
		console.log(`${this.name} customCircuitInstances: `, this.customCircuitInstances);
		for (let [sceneName, entries] of this.customCircuitInstances) {
			let id = integratedCircuits.getSceneIdFor(sceneName);
			console.log('ID: ', id);
			if (id == null) {
				throw Error();
			}
			let scene = sceneManager.scenes.get(id);
			console.log('Scene: ', scene);
			if (scene == null) {
				throw Error();
			}
			if (entries.lastUpdateIdx === scene.lastUpdateIdx) {
				continue;
			}
			console.log('entries.lastUpdateIdx != scene.lastUpdateIdx');
			console.log(`${this.name} reevaluated`);
			for (let instance of entries.instances) {
				instance.updateCircuitGraph();
			}
			entries.lastUpdateIdx = scene.lastUpdateIdx;
		}
	}
}

export class CircuitSceneObject {
	// id: number;
	parentScene: Scene;

	tightRectWrl: Rect;
	looseRectWrl: Rect;
	headRectWrl: Rect;
	bodyRectWrl: Rect;

	static minWidthWrl = 100;
	static headPaddingYWrl = 10;
	static paddingXWrl = 10;
	static bodyPaddingYWrl = 15;
	static pinRadiusWrl = PIN_EXTRUSION_WRL;
	static labelTextSizeWrl = 10;

	isSelected = false;
	label: string;

	onClicked: ((self: Circuit) => void) | undefined = undefined;

	private constructor(
		public parentCircuit: Circuit,
		public posWrl: Vec2,
		public ctx: CanvasRenderingContext2D | undefined = undefined
	) {
		this.label = parentCircuit.props.label;
		if (ctx != null) {
			this.headRectWrl = this.getHeadRectWrl();
		} else {
			this.headRectWrl = new Rect(0, 0, 0, 0);
		}

		this.bodyRectWrl = this.getBodyRectWrl();

		this.tightRectWrl = this.calcTightRect();
		this.looseRectWrl = this.calcLooseRect();
		this.parentScene = new Scene();
	}

	static new(
		parentCircuit: Circuit,
		posWrl: Vec2,
		parentScene: Scene | undefined = undefined,
		ctx: CanvasRenderingContext2D
	) {
		let sceneObject = new CircuitSceneObject(parentCircuit, posWrl, ctx);

		if (parentScene == null) {
			sceneObject.parentScene = sceneManager.getCurrentScene();
		} else {
			sceneObject.parentScene = parentScene;
		}
		// sceneObject.id = sceneManager.currentScene.registerCircuit(this);
		sceneObject.parentScene.registerCircuit(sceneObject);
		return sceneObject;
	}

	static dummy() {
		return new CircuitSceneObject(dummyCircuit(), new Vec2(0, 0));
	}

	private calcTightRect() {
		return new Rect(
			this.posWrl.x,
			this.posWrl.y,
			this.headRectWrl.w,
			this.headRectWrl.h + this.bodyRectWrl.h
		);
	}

	private getHeadRectWrl() {
		if (this.ctx == null) {
			return new Rect(0, 0, 0, 0);
		}

		this.ctx.font = `bold ${CircuitSceneObject.labelTextSizeWrl}px "Advent Pro"`;
		const metrics = this.ctx.measureText(this.label);

		const labelHeight =
			Math.abs(metrics.actualBoundingBoxAscent) + Math.abs(metrics.actualBoundingBoxDescent);
		const headHeight = labelHeight + 2 * CircuitSceneObject.headPaddingYWrl;

		const labelWidth =
			Math.abs(metrics.actualBoundingBoxLeft) + Math.abs(metrics.actualBoundingBoxRight);
		const headWidth = Math.max(
			labelWidth + 2 * CircuitSceneObject.paddingXWrl,
			CircuitSceneObject.minWidthWrl
		);

		return new Rect(this.posWrl.x, this.posWrl.y, headWidth, headHeight);
	}

	private getBodyRectWrl() {
		const maxPinNumber = Math.max(
			this.parentCircuit.consumerPins.length,
			this.parentCircuit.producerPins.length
		);

		return new Rect(
			this.posWrl.x,
			this.posWrl.y + this.headRectWrl.h,
			this.headRectWrl.w,

			CircuitSceneObject.bodyPaddingYWrl * 2 +
			maxPinNumber * 2 * CircuitSceneObject.pinRadiusWrl +
			(maxPinNumber - 1) * PIN_TO_PIN_DISTANCE_WRL
		);
	}

	private calcLooseRect() {
		const pPinExtrusion = this.parentCircuit.producerPins.length === 0 ? 0 : PIN_EXTRUSION_WRL;
		const cPinExtrusion = this.parentCircuit.consumerPins.length === 0 ? 0 : PIN_EXTRUSION_WRL;
		return new Rect(
			this.tightRectWrl.x - cPinExtrusion - 3,
			this.tightRectWrl.y - 3,
			this.tightRectWrl.w + cPinExtrusion + pPinExtrusion + 6,
			this.tightRectWrl.h + 6
		);
	}

	looseCollisionCheck(pointWrl: Vec2) {
		const res = this.looseRectWrl.pointIntersection(pointWrl);
		if (res) {
			console.log('Loose Collision Passed');
		}
		return res;
	}

	tightCollisionCheck(pointWrl: Vec2):
		| {
			kind: ConcreteObjectKind;
			object: any;
		}
		| undefined {
		for (let pin of this.parentCircuit.consumerPins) {
			if (pin.pointCollision(pointWrl)) {
				console.log('Tight Collision Passed');
				return { kind: ConcreteObjectKind.ConsumerPin, object: pin };
			}
		}

		for (let pin of this.parentCircuit.producerPins) {
			if (pin.pointCollision(pointWrl)) {
				console.log('Tight Collision Passed');
				return { kind: ConcreteObjectKind.ProducerPin, object: pin };
			}
		}

		if (this.tightRectWrl.pointIntersection(pointWrl)) {
			console.log('Tight Collision Passed');
			return { kind: ConcreteObjectKind.Circuit, object: this.parentCircuit };
		}

		return undefined;
	}

	calcRects() {
		this.headRectWrl = this.getHeadRectWrl();

		this.bodyRectWrl = this.getBodyRectWrl();
		// this.bodyRectWrl.y = this.headRectWrl.y + this.headRectWrl.h + 1;
		this.tightRectWrl = this.calcTightRect();
		this.looseRectWrl = this.calcLooseRect();
	}

	setPos(posWrl: Vec2) {
		this.posWrl = posWrl;
		this.calcRects();
	}

	setLabel(label: string) {
		this.label = label;
		this.calcRects();
	}

	draw(ctx: CanvasRenderingContext2D) {
		const headRectScr = viewManager.worldToScreenRect(this.headRectWrl);
		const bodyRectScr = viewManager.worldToScreenRect(this.bodyRectWrl);
		const looseRectScr = viewManager.worldToScreenRect(this.looseRectWrl);
		const tightRectScr = viewManager.worldToScreenRect(this.tightRectWrl);

		// Head background
		ctx.fillStyle = circuitColor;
		ctx.beginPath();
		ctx.roundRect(headRectScr.x, headRectScr.y, headRectScr.w, headRectScr.h, [4, 4, 0, 0]);
		ctx.fill();

		// Label
		const labelSizeScr = CircuitSceneObject.labelTextSizeWrl * viewManager.zoomLevel;
		ctx.font = `bold ${labelSizeScr}px "Advent Pro"`;
		ctx.fillStyle = '#fff';
		ctx.textBaseline = 'bottom';
		ctx.fillText(
			this.label,
			headRectScr.x + CircuitSceneObject.paddingXWrl * viewManager.zoomLevel,
			headRectScr.y + headRectScr.h - CircuitSceneObject.headPaddingYWrl * viewManager.zoomLevel
		);

		//render Body

		// Head and Body separator
		const separatorWidth = 1 * viewManager.zoomLevel;
		ctx.lineWidth = separatorWidth;
		ctx.strokeStyle = '#1e1e1e';
		ctx.beginPath();
		ctx.moveTo(bodyRectScr.x, bodyRectScr.y);
		ctx.lineTo(bodyRectScr.x + bodyRectScr.w, bodyRectScr.y);
		ctx.stroke();

		ctx.fillStyle = circuitColor;
		ctx.beginPath();
		ctx.roundRect(bodyRectScr.x, bodyRectScr.y, bodyRectScr.w, bodyRectScr.h, [0, 0, 4, 4]);
		ctx.fill();

		if (this.isSelected) {
			ctx.lineWidth = 1;
			ctx.strokeStyle = ornamentColor;

			ctx.strokeRect(looseRectScr.x, looseRectScr.y, looseRectScr.w, looseRectScr.h);
		}

		// ConsumerPins
		// console.log(metrics);
		for (let pin of this.parentCircuit.consumerPins) {
			pin.draw(ctx);
		}
		for (let pin of this.parentCircuit.producerPins) {
			pin.draw(ctx);
		}
		// ctx.strokeRect(tightRectScr.x, tightRectScr.y, tightRectScr.w, tightRectScr.h);
		// ctx.strokeRect(headRectScr.x, headRectScr.y, headRectScr.w, headRectScr.h);
		// ctx.strokeRect(bodyRectScr.x, bodyRectScr.y, bodyRectScr.w, bodyRectScr.h);

		// // ctx.fillStyle = tailwindTheme.theme.colors;
		// const style = getComputedStyle(document.body);
		// ctx.fillStyle = style.getPropertyValue('--clr-circuit');
		// ctx.strokeStyle = 'black';
		// ctx.lineWidth = 1;
		// ctx.fillRect(tightRectScr.x, tightRectScr.y, tightRectScr.w, tightRectScr.h);
		// ctx.strokeRect(tightRectScr.x, tightRectScr.y, tightRectScr.w, tightRectScr.h);
		// for (let i = 0; i < this.parentCircuit.consumerPins.length; i++) {
		// 	this.parentCircuit.consumerPins[i].draw(ctx);
		// }
		// for (let i = 0; i < this.parentCircuit.producerPins.length; i++) {
		// 	this.parentCircuit.producerPins[i].draw(ctx);
		// }
		// if (this.isSelected) {
		// 	const looseRectScr = viewManager.worldToScreenRect(this.looseRectWrl);
		// 	ctx.strokeStyle = 'green';
		// 	ctx.strokeRect(looseRectScr.x, looseRectScr.y, looseRectScr.w, looseRectScr.h);
		// }
	}
}

let { subscribe, set, update } = writable(new Scene());

export let currentScene = {
	subscribe,
	set
};
