<script lang="ts">
	import { indentWithTab } from '@codemirror/commands';
	import { python } from '@codemirror/lang-python';
	import { oneDark } from '@codemirror/theme-one-dark';
	import { EditorState } from '@codemirror/state';
	import { EditorView, keymap } from '@codemirror/view';
	import {
		Handle,
		NodeResizer,
		Position,
		type NodeProps,
		useNodeConnections
	} from '@xyflow/svelte';
	import { basicSetup } from 'codemirror';

	type $$Props = NodeProps;

	let { id, data, isConnectable, selected } = $props();
	let editorView: EditorView;
	let outputView: EditorView;
	let output = $state('');
	let label = $state('');

	const connections = useNodeConnections({ handleType: 'target' });
	let sourceIds = $derived($connections.map((connection) => connection.source));

	function initializeEditor(element: HTMLDivElement) {
		if (!element) return;

		const editorElement = element.children[0];
		const outputElement = element.children[1];

		const initEditorState = EditorState.create({
			doc: '# Start coding here\n',
			extensions: [
				basicSetup,
				python(),
				EditorState.tabSize.of(4),
				keymap.of([indentWithTab]),
				oneDark
			]
		});

		const initOutputState = EditorState.create({
			doc: '',
			extensions: [basicSetup, python(), EditorState.readOnly.of(true), oneDark]
		});

		editorView = new EditorView({
			state: initEditorState,
			parent: editorElement
		});

		outputView = new EditorView({
			state: initOutputState,
			parent: outputElement
		});
	}

	function initializeOutputView(element: HTMLDivElement) {
		if (!element) return;

		const initState = EditorState.create({
			doc: '',
			extensions: [basicSetup, oneDark, python(), EditorState.readOnly.of(true)]
		});

		outputView = new EditorView({
			state: initState,
			parent: element
		});
	}

	async function handleSubmit() {
		// try {
		// 	const code = editorView.state.doc.toString();
		// 	const response = await fetch('http://localhost:8080/run-job', {
		// 		method: 'POST',
		// 		headers: {
		// 			'Content-Type': 'application/json'
		// 		},
		// 		body: JSON.stringify({ id, code, sourceIds })
		// 	});
		// 	const data = await response.json();
		// 	console.log({ data });
		// 	output = data.stdout;
		// } catch (error) {
		// 	console.error('Error:', error);
		// }
		outputView.dispatch({ changes: { from: 0, to: outputView.state.doc.length, insert: editorView.state.doc.toString() } });
	}
</script>

<NodeResizer isVisible={selected} minWidth={400} maxWidth={720} minHeight={128} maxHeight={320} />
<Handle type="target" position={Position.Left} style="z-index: 10" {isConnectable} />
<div
	class="flex w-full select-none items-center justify-between rounded-t-2xl bg-neutral-900 px-2 py-1 text-sm transition-colors"
>
	<div class="nodrag flex items-center">
		<span class="icon-[proicons--python] bg-white text-lg"></span>
		<input
			type="text"
			bind:value={label}
			placeholder="Untitled"
			class="ml-2 rounded bg-neutral-900 px-2 text-white hover:bg-gray-700"
		/>
	</div>
	<button type="submit" class="flex" onclick={handleSubmit}>
		<span class="icon-[line-md--play-twotone] bg-green-500 text-xl hover:bg-green-700"></span>
	</button>
</div>
<div class="flex h-[calc(100%-2rem)]" use:initializeEditor>
	<div
		class="nodrag w-1/2 cursor-text overflow-hidden rounded-bl-2xl [&_.cm-editor]:h-full [&_.cm-editor]:min-h-32 [&_.cm-editor]:min-w-[400px] [&_.cm-scroller]:h-full [&_.cm-scroller]:min-h-32 [&_.cm-scroller]:w-full [&_.cm-scroller]:min-w-[400px]"
	></div>
	<div
		class="w-1/2 rounded-br-2xl [&_.cm-editor]:h-full [&_.cm-scroller]:h-full [&_.cm-scroller]:w-full"
	></div>
</div>
{#if sourceIds.length > 0}
	{#each sourceIds as sourceId}
		<div class="bg-red-100">{sourceId}</div>
	{/each}
{/if}
<Handle
	type="source"
	position={Position.Right}
	style="background: #555; z-index: 10"
	{isConnectable}
/>
