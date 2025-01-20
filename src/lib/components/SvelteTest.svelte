<script lang="ts">
	import { writable } from 'svelte/store';
	import { SvelteFlow, Background, Controls, type Node } from '@xyflow/svelte';
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
	<button onclick={addEditorNode}>Press</button>
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
		<Background bgColor="#121230" />
		<Controls />
	</SvelteFlow>
</div>
