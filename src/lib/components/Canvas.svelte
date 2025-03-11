<script lang="ts">
	import { writable } from 'svelte/store';
	import { v4 as uuidv4 } from 'uuid';
	import {
		SvelteFlow,
		Background,
		Controls,
		type Node,
		Panel,
		type Connection,
		getOutgoers,
		type Edge
	} from '@xyflow/svelte';
	import '@xyflow/svelte/dist/style.css';
	import EditorNode from './EditorNode.svelte';
	import { runAllNodes, updateConnections } from '$lib/stores/nodeStore';

	const nodeTypes = {
		editorNode: EditorNode
	};

	const nodes = writable<Node[]>([]);
	const edges = writable([]);

	$effect(() => {
		updateConnections($edges);
	});

	const addEditorNode = () => {
		const nodeId = uuidv4();
		const newEditor: Node = {
			id: nodeId,
			type: 'editorNode',
			position: { x: (window.innerWidth - 400) / 2, y: (window.innerHeight - 128) / 2 },
			data: {}
		};
		$nodes = [...$nodes, newEditor];
	};

	const isValidConnection = (connection: Connection | Edge) => {
		const target = $nodes.find((node) => node.id === connection.target);
		const hasCycle = (node: Node, visited = new Set()) => {
			if (visited.has(node.id)) {
				return false;
			}

			visited.add(node.id);

			for (const outgoer of getOutgoers(node, $nodes, $edges)) {
				if (outgoer.id === connection.source) {
					return true;
				}
				if (hasCycle(outgoer, visited)) return true;
			}
		};

		if (target?.id === connection.source) {
			return false;
		}

		return !hasCycle(target as Node);
	};
</script>

<div class="h-screen">
	<SvelteFlow
		{nodes}
		{edges}
		{nodeTypes}
		{isValidConnection}
		minZoom={0.1}
		proOptions={{ hideAttribution: true }}
	>
		<Panel position="top-right" class="h-full content-center">
			<div class="flex h-1/3 flex-col justify-between rounded bg-gray-800 p-4">
				<button
					onclick={addEditorNode}
					aria-label="Add Python editor node"
					class="icon-[proicons--python] bg-white text-5xl hover:bg-gray-400"
				></button>
				<button
					onclick={runAllNodes}
					aria-label="Run all nodes"
					class="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
				></button>
			</div>
			<div></div>
		</Panel>
		<Background bgColor="#121230" />
		<Controls />
	</SvelteFlow>
</div>
