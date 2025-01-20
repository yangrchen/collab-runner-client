<script lang="ts">
	import { indentWithTab } from '@codemirror/commands';
	import { python } from '@codemirror/lang-python';
	import { oneDarkTheme } from '@codemirror/theme-one-dark';
	import { EditorState } from '@codemirror/state';
	import { EditorView, keymap } from '@codemirror/view';
	import { Handle, NodeResizer, Position, type NodeProps } from '@xyflow/svelte';
	import { basicSetup } from 'codemirror';

	type $$Props = NodeProps;

	let { data, isConnectable, selected } = $props();
	let { header } = data;
	let editorView: EditorView;
	let output = $state('');

	function initializeEditor(element: HTMLDivElement) {
		if (!element) return;

		const initState = EditorState.create({
			doc: '# Start coding here\n',
			extensions: [
				basicSetup,
				python(),
				EditorState.tabSize.of(4),
				keymap.of([indentWithTab]),
				oneDarkTheme
			]
		});

		editorView = new EditorView({
			state: initState,
			parent: element
		});
	}

	async function handleSubmit() {
		try {
			const code = editorView.state.doc.toString();
			const id = Date.now().toString();
			const response = await fetch('http://localhost:8080/run-job', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ id, code })
			});
			const data = await response.json();
			output = data.stdout;
		} catch (error) {
			console.error('Error:', error);
		}
	}
</script>

<!-- <NodeResizer
	isVisible={selected}
	onResize={() => {
		console.log('request measure');
		editorView.requestMeasure();
	}}
/> -->
<Handle
	type="target"
	position={Position.Left}
	style="background: #555; z-index: 10"
	{isConnectable}
/>
<div class="overflow-auto rounded-lg bg-white shadow-lg">
	<div role="textbox" class="select-none bg-neutral-900 p-2 text-white transition-colors">
		Editor {header}
	</div>
	<div class="flex flex-grow">
		<div
			class="nodrag h-full w-[600px] flex-grow cursor-text overflow-hidden"
			use:initializeEditor
		></div>
		<div class="w-1/3 bg-gray-400">{output}</div>
	</div>
	<button type="submit" class="bg-green-400 hover:bg-green-600" onclick={handleSubmit}
		>Submit</button
	>
</div>
<Handle type="source" position={Position.Right} style="background: #555;" {isConnectable} />

<style>
	/* :global(.svelte-flow__node-editorNode) {
    min-height: 300px;
    font-size: 12px;
    background: #eee;
   border-radius: 5px;
    } */
	.svelte-flow__handle {
		min-height: 300px;
	}
</style>
