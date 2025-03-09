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
	import { onMount, onDestroy } from 'svelte';
	import { registerNode, unregisterNode } from '$lib/stores/nodeStore';

	type $$Props = NodeProps;

	let { id, isConnectable, selected } = $props();
	let editorView: EditorView;
	let outputView: EditorView;
	let label = $state('');

	const connections = useNodeConnections({ handleType: 'target' });
	let sourceIds = $derived($connections.map((connection) => connection.source));

	const minWidth = 400;
	const minHeight = 200;

	const adjustedMinHeight = `calc(${minHeight}px - 1.8rem)`;
	const adjustedMinWidth = `${minWidth / 2}px`;

	function initializeEditor(element: HTMLDivElement) {
		if (!element) return;

		const editorElement = element.children[0];
		const outputElement = element.children[1];

		let initEditorState = EditorState.create({
			doc: '# Start coding here\n',
			extensions: [
				basicSetup,
				python(),
				EditorState.tabSize.of(4),
				keymap.of([indentWithTab]),
				oneDark,
				EditorView.theme({
					'&': {
						height: '100%',
						width: '100%',
						minHeight: adjustedMinHeight,
						minWidth: adjustedMinWidth
					},
					'.cm-scroller': {
						height: '100%',
						width: '100%',
						minHeight: adjustedMinHeight,
						minWidth: adjustedMinWidth
					}
				})
			]
		});

		let initOutputState = EditorState.create({
			doc: '',
			extensions: [
				basicSetup,
				python(),
				EditorState.readOnly.of(true),
				oneDark,
				EditorView.theme({
					'&': {
						height: '100%',
						width: '100%',
						minHeight: adjustedMinHeight,
						minWidth: adjustedMinWidth
					},
					'.cm-scroller': {
						height: '100%',
						width: '100%',
						minHeight: adjustedMinHeight,
						minWidth: adjustedMinWidth
					},
					'.cm-gutters': { display: 'none' },
					'cm-content': { display: 'none' }
				})
			]
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

	async function handleSubmit() {
		try {
			const code = editorView.state.doc.toString();
			const response = await fetch('http://localhost:8080/run-job', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ id, code, sourceIds })
			});
			const data = await response.json();
			console.log({ data });
			outputView.dispatch({
				changes: { from: 0, to: outputView.state.doc.length, insert: data.stdout }
			});
		} catch (error) {
			console.error('Error:', error);
		}
	}

	onMount(() => {
		registerNode(id, { handleSubmit });
	});

	onDestroy(() => {
		unregisterNode(id);
	});
</script>

<NodeResizer isVisible={selected} {minWidth} {minHeight} />
<Handle type="target" position={Position.Left} style="z-index: 10" {isConnectable} />
<div
	class="h-full min-h-[var(--min-height)] w-full min-w-[var(--min-width)]"
	style:--min-height="{minHeight}px"
	style:--min-width="{minWidth}px"
>
	<div
		class="flex select-none items-center justify-between rounded-t-2xl bg-neutral-900 px-2 py-1 text-sm transition-colors"
	>
		<div class="flex w-full items-center">
			<span class="icon-[proicons--python] bg-white text-lg"></span>
			<input
				type="text"
				bind:value={label}
				placeholder="Untitled"
				class="nodrag ml-2 rounded bg-neutral-900 px-2 text-white hover:bg-gray-700"
			/>
		</div>
		<button type="submit" aria-label="Run node" class="flex" onclick={handleSubmit}>
			<span class="icon-[line-md--play-twotone] bg-green-500 text-xl hover:bg-green-700"></span>
		</button>
	</div>
	<div
		class="flex h-[var(--adjusted-height)] w-full"
		style:--adjusted-height={adjustedMinHeight}
		use:initializeEditor
	>
		<div class="nodrag w-1/2 cursor-text"></div>
		<div class="w-1/2"></div>
	</div>
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
