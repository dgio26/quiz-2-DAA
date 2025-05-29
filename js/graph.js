class Graph {
    constructor() {
        this.nodes = new Set();
        this.costEdges = new Map();
        this.timeEdges = new Map();
        this.routes = [];
    }

    addEdge(source, destination, cost, duration) {
        if (source !== destination) {
            this.nodes.add(source);
            this.nodes.add(destination);

            if (!this.costEdges.has(source)) this.costEdges.set(source, new Map());
            if (!this.costEdges.has(destination)) this.costEdges.set(destination, new Map());
            if (!this.timeEdges.has(source)) this.timeEdges.set(source, new Map());
            if (!this.timeEdges.has(destination)) this.timeEdges.set(destination, new Map());

            this.costEdges.get(source).set(destination, cost);
            this.costEdges.get(destination).set(source, cost);
            this.timeEdges.get(source).set(destination, duration);
            this.timeEdges.get(destination).set(source, duration);

            this.routes.push({source, destination, cost, duration});
        }
    }

    dijkstra(graph, start, end) {
        const distances = new Map();
        const previous = new Map();
        const unvisited = new Set();

        for (let node of this.nodes) {
            distances.set(node, node === start ? 0 : Infinity);
            unvisited.add(node);
        }

        while (unvisited.size > 0) {
            let current = null;
            let minDistance = Infinity;
            for (let node of unvisited) {
                if (distances.get(node) < minDistance) {
                    minDistance = distances.get(node);
                    current = node;
                }
            }

            if (current === null || distances.get(current) === Infinity) break;
            if (current === end) break;

            unvisited.delete(current);

            if (graph.has(current)) {
                for (let [neighbor, weight] of graph.get(current)) {
                    if (unvisited.has(neighbor)) {
                        const newDistance = distances.get(current) + weight;
                        if (newDistance < distances.get(neighbor)) {
                            distances.set(neighbor, newDistance);
                            previous.set(neighbor, current);
                        }
                    }
                }
            }
        }

        const path = [];
        let current = end;
        while (current !== undefined) {
            path.unshift(current);
            current = previous.get(current);
        }

        return {
            distance: distances.get(end),
            path: distances.get(end) === Infinity ? [] : path
        };
    }

    findCheapestRoute(start, destination) {
        const result = this.dijkstra(this.costEdges, start, destination);
        if (result.path.length === 0) {
            return { error: `No route from ${start} to ${destination}` };
        }
        return {
            type: 'cheapest',
            cost: result.distance,
            path: result.path,
            message: `Cheapest route from ${start} to ${destination} costs $${result.distance} with the route being:\n${result.path.join(' → ')}`
        };
    }

    findQuickestRoute(start, destination) {
        const result = this.dijkstra(this.timeEdges, start, destination);
        if (result.path.length === 0) {
            return { error: `No route from ${start} to ${destination}` };
        }
        return {
            type: 'quickest',
            duration: result.distance,
            path: result.path,
            message: `Quickest route from ${start} to ${destination} is ${result.distance} hour(s) with the route being:\n${result.path.join(' → ')}`
        };
    }

    findBestRoute(start, destination) {
        const combinedGraph = new Map();
        
        for (let [node, neighbors] of this.costEdges) {
            combinedGraph.set(node, new Map());
            for (let [neighbor, cost] of neighbors) {
                const duration = this.timeEdges.get(node).get(neighbor);
                const combinedWeight = cost + (100 * duration);
                combinedGraph.get(node).set(neighbor, combinedWeight);
            }
        }

        const result = this.dijkstra(combinedGraph, start, destination);
        if (result.path.length === 0) {
            return { error: `No route from ${start} to ${destination}` };
        }

        let totalCost = 0;
        let totalDuration = 0;
        for (let i = 0; i < result.path.length - 1; i++) {
            const from = result.path[i];
            const to = result.path[i + 1];
            totalCost += this.costEdges.get(from).get(to);
            totalDuration += this.timeEdges.get(from).get(to);
        }

        return {
            type: 'best',
            cost: totalCost,
            duration: totalDuration,
            path: result.path,
            message: `Most efficient route from ${start} to ${destination} is:\n${result.path.join(' → ')}\nCost: $${totalCost}, Duration: ${totalDuration} hours`
        };
    }

    getAllCountries() {
        return Array.from(this.nodes).sort();
    }
}
