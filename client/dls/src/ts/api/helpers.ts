import path from 'path-browserify';
import { View } from '../view-manager';
import { Vec2 } from '../math';
import type { ID } from '../scene/scene';

export function apiURL(targetPath: string) {
	return new URL(path.join('/api/', targetPath), import.meta.env.VITE_API_SERVER);
}
export function actionURL(targetPath: string) {
	return new URL(path.join('/api/action', targetPath), import.meta.env.VITE_API_SERVER);
}

export type ApiWire = {
	id: number;
	fromCircuit: number;
	fromPin: number;
	toCircuit: number;
	toPin: number;
};

export type ApiCircuit = {
	id: number;
	circuitType: string;
	posWrl: Vec2;
	nConsumerPins: number;
	nProducerPins: number;
	consumerWires: Array<ApiWire | undefined>;
	producerWires: Array<ApiWire | undefined>;
	props: Map<string, any>;
};

export type ApiScene = {
	id: number;
	name: string;
	icInputs: number | undefined;
	icOutputs: number | undefined;
	circuits: Map<number, ApiCircuit>;
	wires: Map<number, ApiWire>;
};

export type ApiProject = {
	scenes: Map<number, ApiScene>;
	currentSceneID: number;
	view: View;
	ics: Map<number, string>;
	selectedCircuits: Map<ID, boolean>;
	selectedWires: Map<ID, boolean>;
};

export async function fetchProject(fetch: (url: URL) => Promise<any>) {
	const res = await fetch(apiURL('/project'));
	return convertProject(await res.json());
}

function convertProject(project: any) {
	const resScenes = project['Scenes'];
	const convertedScenes = new Map<number, ApiScene>();
	for (const [key, resScene] of Object.entries(resScenes)) {
		convertedScenes.set(+key, convertScene(resScene));
	}

	const resView = project['View'];
	const zoom: number = resView['ZoomLevel'];
	const panOffsetX: number = resView['PanOffset']['X'];
	const panOffsetY: number = resView['PanOffset']['Y'];

	const converted: ApiProject = {
		scenes: convertedScenes,
		currentSceneID: project['CurrentSceneID'],
		ics: new Map(Object.entries(project['ICs']).map(([key, value]) => [+key, String(value)])),
		view: new View().setViewFromMembers(zoom, new Vec2(panOffsetX, panOffsetY)),
		selectedCircuits: new Map(
			Object.entries(project['SelectedCircuits']).map(([key, value]) => [+key, value as boolean])
		),
		selectedWires: new Map(
			Object.entries(project['SelectedWires']).map(([key, value]) => [+key, value as boolean])
		)
	};

	return converted;
}

function convertWire(wire: any) {
	if (wire == null) {
		return undefined;
	}
	const converted: ApiWire = {
		id: wire['ID'],
		fromCircuit: wire['FromCircuit'],
		fromPin: wire['FromPin'],
		toCircuit: wire['ToCircuit'],
		toPin: wire['ToPin']
	};
	return converted;
}

function convertScene(scene: any) {
	if (scene['ID']['Valid'] !== true) {
		throw Error();
	}
	const id: number = scene['ID']['ID'];

	const resCircuits = scene['Circuits'];
	const convertedCircuits = new Map<number, ApiCircuit>();
	for (const [id, apiCircuit] of Object.entries(resCircuits)) {
		convertedCircuits.set(+id, convertCircuit(apiCircuit));
	}

	const resWires = scene['Wires'];
	const convertedWires = new Map<number, ApiWire>();
	for (const [id, apiWire] of Object.entries(resWires)) {
		convertedWires.set(+id, convertWire(apiWire) as ApiWire);
	}

	const convertedScene: ApiScene = {
		id,
		name: scene['Name'],
		icInputs: scene['ICInputs']['Valid'] === true ? scene['ICInputs']['ID'] : undefined,
		icOutputs: scene['ICOutputs']['Valid'] === true ? scene['ICOutputs']['ID'] : undefined,
		circuits: convertedCircuits,
		wires: convertedWires
	};

	return convertedScene;
}

function convertCircuit(circuit: any) {
	const convertedConsumerWires = new Array<ApiWire | undefined>();
	const apiInputWires: Array<any> = circuit['InputWires'];
	for (let i = 0; i < apiInputWires.length; i++) {
		convertedConsumerWires[i] = convertWire(apiInputWires[i]);
	}

	const convertedProducerWires = new Array<ApiWire | undefined>();
	const apiOutputWires: Array<any> = circuit['OutputWires'];
	for (let i = 0; i < apiOutputWires.length; i++) {
		convertedProducerWires[i] = convertWire(apiOutputWires[i]);
	}

	const converted: ApiCircuit = {
		id: circuit['ID'],
		circuitType: circuit['CircuitType'],
		posWrl: new Vec2(circuit['PosWrl']['X'], circuit['PosWrl']['Y']),
		nConsumerPins: circuit['NInputPins'],
		nProducerPins: circuit['NOutputPins'],
		consumerWires: convertedConsumerWires,
		producerWires: convertedProducerWires,
		props: new Map(Object.entries(circuit['Props']))
	};
	return converted;
}
