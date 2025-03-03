<script lang="ts">
	import { writable } from 'svelte/store';
	import { v4 as uuidv4 } from 'uuid';
	import { SvelteFlow, Background, Controls, type Node, Panel } from '@xyflow/svelte';
	import '@xyflow/svelte/dist/style.css';
	import EditorNode from './EditorNode.svelte';

	const nodeTypes = {
		editorNode: EditorNode
	};

	const nodes = writable<Node[]>([]);
	const edges = writable([]);

	function addEditorNode() {
		const nodeId = uuidv4();
		const newEditor: Node = {
			id: nodeId,
			type: 'editorNode',
			position: { x: (window.innerWidth - 400) / 2, y: (window.innerHeight - 128) / 2 },
			data: {}
		};
		$nodes = [...$nodes, newEditor];
	}
</script>

<div class="h-screen">
	<SvelteFlow {nodes} {edges} {nodeTypes} minZoom={0.1} proOptions={{ hideAttribution: true }}>
		<Panel position="top-right" class="h-full content-center">
			<div class="h-1/3 rounded bg-gray-800 p-4">
				<button
					onclick={addEditorNode}
					class="icon-[proicons--python] bg-white text-5xl hover:bg-gray-400"
				></button>
			</div>
		</Panel>
		<Background bgColor="#121230" />
		<Controls />
	</SvelteFlow>
</div>
