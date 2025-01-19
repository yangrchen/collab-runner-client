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
</script>

<NodeResizer
	isVisible={selected}
	onResize={() => {
		console.log("request measure");
		editorView.requestMeasure();
	}}
/>
<Handle type="target" position={Position.Left} style="background: #555;" {isConnectable} />
<div class="flex flex-col overflow-auto resize-y rounded-lg bg-white shadow-lg">
	<div role="textbox" class="select-none bg-neutral-900 p-2 text-white transition-colors">
		Editor {header}
	</div>
	<div class="flex flex-grow">
		<div class="nodrag flex-grow cursor-text overflow-hidden" use:initializeEditor></div>
		<!-- <div class="w-1/3 bg-gray-400">{editor?.output}</div> -->
	</div>
	<!-- <button type="submit" class="bg-green-400 hover:bg-green-600" onclick={() => handleSubmit(editor)}
		>Submit</button
	> -->
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
