<script lang="ts">
	import { writable } from 'svelte/store';
	import { SvelteFlow, Background, Controls, type Node, Panel } from '@xyflow/svelte';
	import '@xyflow/svelte/dist/style.css';
	import EditorNode from './EditorNode.svelte';

	const nodeTypes = {
		editorNode: EditorNode
	};

	const nodes = writable<Node[]>([]);
	const edges = writable([]);
	let nodeId = $state(0);

	function addEditorNode() {
		const newEditor: Node = {
			id: (nodeId++).toString(),
			type: 'editorNode',
			position: { x: 0, y: 100 },
			data: { header: nodeId }
		};
		$nodes = [...$nodes, newEditor];
	}
</script>

<div class="h-screen">
	<SvelteFlow
		{nodes}
		{edges}
		{nodeTypes}
		ondelete={({ nodes, edges }) => {
			if (nodes.length != 0) {
				nodeId--;
			}
		}}
	>
		<Panel position="top-right" class="h-full content-center">
			<div class="h-1/3 rounded bg-gray-800 p-2">
				<button
					onclick={addEditorNode}
					class="icon-[proicons--python] bg-white text-2xl hover:bg-gray-400"
				></button>
			</div>
		</Panel>
		<Background bgColor="#121230" />
		<Controls />
	</SvelteFlow>
</div>
