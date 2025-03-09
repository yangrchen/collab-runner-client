<script lang="ts">
	import Canvas from '$lib/components/Canvas.svelte';
	import { SvelteFlowProvider } from '@xyflow/svelte';
</script>

<!-- <DraggableEditors /> -->
<SvelteFlowProvider>
	<Canvas />
</SvelteFlowProvider>
