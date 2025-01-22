<script lang="ts">
	import { indentWithTab } from '@codemirror/commands';
	import { python } from '@codemirror/lang-python';
	import { oneDark } from '@codemirror/theme-one-dark';
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
				oneDark
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

<NodeResizer
	isVisible={selected}
	onResize={() => {
		editorView.requestMeasure();
	}}
	minWidth={384}
	maxWidth={480}
	minHeight={128}
	maxHeight={320}
/>
<Handle type="target" position={Position.Left} style="z-index: 10" {isConnectable} />
<div class="select-none rounded-t-2xl bg-neutral-900 px-2 text-sm text-white transition-colors">
	Editor {header}
</div>
<div class="flex h-[calc(100%-1.25rem)]">
	<div
		class="nodrag w-2/3 cursor-text overflow-hidden rounded-bl-2xl [&_.cm-editor]:h-full [&_.cm-editor]:min-h-32 [&_.cm-editor]:min-w-96 [&_.cm-scroller]:h-full [&_.cm-scroller]:min-h-32 [&_.cm-scroller]:min-w-96"
		use:initializeEditor
	></div>
	<div class="w-1/3 rounded-br-2xl bg-red-50">{output}</div>
	<button type="submit" class="absolute right-1 top-0" onclick={handleSubmit}>
		<span class="icon-[line-md--play-twotone] bg-green-500 text-lg hover:bg-green-700"></span>
	</button>
</div>
<Handle
	type="source"
	position={Position.Right}
	style="background: #555; z-index: 10"
	{isConnectable}
/>
