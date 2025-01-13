<script lang="ts">
	import { basicSetup, EditorView } from 'codemirror';
	import { python } from '@codemirror/lang-python';
	import { onMount } from 'svelte';
	import { EditorState } from '@codemirror/state';
	import { indentWithTab } from '@codemirror/commands';
	import { keymap } from '@codemirror/view';

	interface EditorBox {
		id: string;
		view: EditorView | null;
		position: { x: number; y: number; z: number };
		output: string | null;
	}

	let editors: EditorBox[] = $state([]);
	let draggedEditor: EditorBox | null = $state(null);
	let dragOffset = $state({ x: 0, y: 0 });
	let maxZ = $state(0);
	let output = $state('');

	function addNewEditor() {
		const newEditor: EditorBox = {
			id: `editor-${editors.length + 1}`,
			view: null,
			position: {
				x: editors.length * 30,
				y: editors.length * 30,
				z: maxZ
			},
			output: null
		};

		editors = [...editors, newEditor];
	}

	function initializeEditor(element: HTMLDivElement, editor: EditorBox) {
		if (!element) return;

		const initState = EditorState.create({
			doc: '# Start coding here\n',
			extensions: [basicSetup, python(), EditorState.tabSize.of(4), keymap.of([indentWithTab])]
		});

		editor.view = new EditorView({
			state: initState,
			parent: element
		});
	}

	function bringToFront(editor: EditorBox) {
		editor.position.z = ++maxZ;
	}

	function handleDragStart(e: MouseEvent, editor: EditorBox, headerElement: HTMLElement) {
		draggedEditor = editor;
		const rect = headerElement.parentElement?.getBoundingClientRect();
		if (rect) {
			dragOffset = {
				x: e.clientX - rect.left,
				y: e.clientY - rect.top
			};
		}

		const index = editors.findIndex((ed) => ed.id === draggedEditor!.id);
		if (index === -1) return;

		bringToFront(editor);

		headerElement.classList.add('bg-neutral-800');
		headerElement.classList.remove('bg-neutral-900');
	}

	function handleDrag(e: MouseEvent) {
		if (!draggedEditor) return;

		const index = editors.findIndex((ed) => ed.id === draggedEditor!.id);
		if (index === -1) return;

		const newPosition = {
			x: e.clientX - dragOffset.x,
			y: e.clientY - dragOffset.y,
			z: maxZ
		};

		editors[index] = {
			...editors[index],
			position: newPosition
		};
	}

	function handleDragEnd(headerElement: HTMLElement) {
		if (headerElement) {
			headerElement.classList.remove('bg-neutral-800');
			headerElement.classList.add('bg-neutral-900');
		}
		draggedEditor = null;
	}

	async function handleSubmit(editor: EditorBox) {
		try {
			const code = editor.view?.state.doc.toString();
			// Temp ID to use for code request
			const id = Date.now().toString();
			console.log(JSON.stringify({ id, code }));
			const response = await fetch('http://localhost:8080/run-job', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ id, code })
			});
			const data = await response.json();
			editor.output = data.stdout;
		} catch (error) {
			console.error('Error:', error);
		}
	}

	onMount(() => {
		return () => {
			editors.forEach((ed) => {
				ed.view?.destroy();
			});
		};
	});
</script>

<div class="relative h-screen w-full overflow-hidden bg-gray-100">
	<button
		class="fixed right-4 top-4 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-none bg-blue-500 text-2xl text-white shadow-md transition-colors hover:bg-blue-600"
		onclick={addNewEditor}
	>
		+
	</button>

	{#each editors as editor (editor.id)}
		<div
			class="absolute flex h-[300px] w-[400px] flex-col overflow-hidden rounded-lg bg-white shadow-lg"
			style="transform: translate({editor.position.x}px, {editor.position.y}px); z-index: {editor
				.position.z}"
			onmousedown={() => bringToFront(editor)}
		>
			<div
				role="textbox"
				class="cursor-move select-none bg-neutral-900 p-2 text-white transition-colors"
				onmousedown={(e) => handleDragStart(e, editor, e.currentTarget)}
				onmouseup={(e) => handleDragEnd(e.currentTarget)}
			>
				Editor {editor.id}
			</div>
			<div class="flex flex-grow">
				<div class="flex-grow overflow-hidden" use:initializeEditor={editor}></div>
				<div class="w-1/3 bg-gray-400">{editor?.output}</div>
			</div>
			<button
				type="submit"
				class="bg-green-400 hover:bg-green-600"
				onclick={() => handleSubmit(editor)}>Submit</button
			>
		</div>
	{/each}
</div>

<svelte:window onmousemove={(e) => handleDrag(e)} />
