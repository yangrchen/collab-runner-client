import { writable, get } from "svelte/store";
import type { Connection } from '@xyflow/svelte';

type NodeInstance = {
    handleSubmit: () => Promise<void>;
};

const nodeRegistry = writable<Map<string, NodeInstance>>(new Map());
const nodeConnections = writable<Connection[]>([])

export function registerNode(id: string, instance: NodeInstance) {
    nodeRegistry.update(map => {
        map.set(id, instance);
        return map;
    });
}

export function unregisterNode(id: string) {
    nodeRegistry.update(map => {
        map.delete(id);
        return map;
    })
}

export function updateConnections(connections: Connection[]) {
    nodeConnections.set(connections);
}

/**
* Builds a dependency graph from a list of connections.
* 
* @param connections - Array of `Connection` objects
* @returns A graph where each key is a node ID and its value is an array of node IDs that depend on it
* 
* @remarks
* The function first initializes the graph with all nodes from the nodeRegistry, giving each node an empty dependency array.
* Then it populates the graph by iterating through the connections, where each connection indicates the target node depends on the source node.
* In the resulting graph, `graph[A]` contains all nodes that are directly dependent on `A`.
*/
function buildDependencyGraph(connections: Connection[]) {
    const graph: Record<string, string[]> = {};

    const nodes = get(nodeRegistry);
    nodes.keys().forEach(id => {
        graph[id] = []
    });

    connections.forEach(conn => {
        graph[conn.source].push(conn.target)
    });

    return graph
}

/**
* Performs a topological sort on a dependency graph.
* 
* @param graph - A directed graph represented as an adjacency list where each key is a node ID and its value is an array of its dependencies
* @returns An array of node IDs in topological order (dependency-first ordering)
* 
* @remarks
* This function implements a depth-first search algorithm to perform topological sorting.
* The implementation assumes the graph is acyclic, as cycles are expected to be validated 
* elsewhere through connection validation.
*/
function topoSort(graph: Record<string, string[]>): string[] {
    const result: string[] = [];
    const visited = new Set<string>();

    function visit(node: string) {
        visited.add(node);

        for (const dep of graph[node]) {
            if (!visited.has(dep)) {
                visit(dep);
            }
        }

        result.push(node);
    }

    // Don't have to check for cycles here as we check for
    // them through connection validation
    Object.keys(graph).forEach(node => {
        if (!visited.has(node)) {
            visit(node);
        }
    })

    return result.reverse();
}

/**
 * Executes all registered nodes in topological order based on their dependencies.
 * 
 * @returns A Promise that resolves when all nodes have been executed successfully
 * @throws Error if any node's execution fails, halting the entire execution pipeline
 * 
 * @remarks
 * This function:
 * 1. Retrieves all registered nodes and their connections
 * 2. Builds a dependency graph using the connections
 * 3. Determines the execution order using topological sort
 * 4. Executes each node in the determined order by calling its handleSubmit method
 * 
 * If any node fails, the entire execution is halted immediately.
 */
export async function runAllNodes() {
    const nodes = get(nodeRegistry);
    const connections = get(nodeConnections);

    console.log('Running all nodes');
    console.log('Registered nodes:', Object.keys(nodes));
    console.log('Connections:', connections)

    const graph = buildDependencyGraph(connections);
    const executionOrder = topoSort(graph);

    for (const id of executionOrder) {
        console.log(`Running node ${id}`);
        await nodes.get(id)!.handleSubmit();
    }
}

export { nodeRegistry };
