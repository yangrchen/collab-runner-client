<script lang="ts">
	import { basicSetup, EditorView } from 'codemirror';
	import { python } from '@codemirror/lang-python';
	import { onMount } from 'svelte';
	import { EditorState } from '@codemirror/state';

	interface EditorBox {
		id: string;
		view: EditorView | null;
		position: { x: number; y: number; z: number };
	}

	let editors: EditorBox[] = $state([]);
	let draggedEditor: EditorBox | null = $state(null);
	let dragOffset = $state({ x: 0, y: 0 });
	let maxZ = $state(0);

	function addNewEditor() {
		const newEditor: EditorBox = {
			id: `editor-${editors.length + 1}`,
			view: null,
			position: {
				x: editors.length * 30,
				y: editors.length * 30,
				z: maxZ
			}
		};

		editors = [...editors, newEditor];
	}

	function initializeEditor(element: HTMLDivElement, editor: EditorBox) {
		if (!element) return;

		const initState = EditorState.create({
			doc: '// Start coding here\n',
			extensions: [basicSetup, python()]
		});

		editor.view = new EditorView({
			state: initState,
			parent: element
		});
	}

    function bringToFront(editorIndex: number) {
        editors[editorIndex].position.z = ++maxZ;
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

        bringToFront(index);

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
			style="transform: translate({editor.position.x}px, {editor.position.y}px); z-index: {editor.position.z}" 
		>
			<div
				class="cursor-move select-none bg-neutral-900 p-2 text-white transition-colors"
				onmousedown={(e) => handleDragStart(e, editor, e.currentTarget)}
				onmouseup={(e) => handleDragEnd(e.target as HTMLElement)}
			>
				Editor {editor.id}
			</div>
			<div class="flex-grow overflow-hidden" use:initializeEditor={editor}></div>
		</div>
	{/each}
</div>

<svelte:window onmousemove={(e) => handleDrag(e)} />
