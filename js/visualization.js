class GraphVisualization {
    constructor(svgId, graph, routesData) {
        this.svg = document.getElementById(svgId);
        this.graph = graph;
        this.routesData = routesData;
        this.highlightedPath = [];
        this.activeLine = null;
        this.init();
    }

    init() {
        this.drawGraph();
    }

    drawGraph() {
        this.svg.innerHTML = '';
        this.drawEdges();
        this.drawNodes();
        this.drawLabels();
    }

    drawEdges() {
        const edgeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        edgeGroup.setAttribute('class', 'edges');

        this.routesData.routes.forEach(route => {
            const sourcePos = this.routesData.positions[route.source];
            const destPos = this.routesData.positions[route.destination];

            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', sourcePos.x);
            line.setAttribute('y1', sourcePos.y);
            line.setAttribute('x2', destPos.x);
            line.setAttribute('y2', destPos.y);
            line.setAttribute('class', 'route-line');
            line.setAttribute('data-source', route.source);
            line.setAttribute('data-destination', route.destination);
            line.style.cursor = 'pointer';

            line.addEventListener('click', (e) => {
                this.toggleEdgeLabels(route, sourcePos, destPos, line);
                e.stopPropagation();
            });

            edgeGroup.appendChild(line);
        });

        this.svg.appendChild(edgeGroup);

        this.svg.addEventListener('click', (e) => {
            if (e.target === this.svg || e.target.classList.contains('country-node') || e.target.classList.contains('country-label')) {
                this.hideAllEdgeLabels();
            }
        });
    }

    toggleEdgeLabels(route, sourcePos, destPos, lineElement) {
        if (this.activeLine === lineElement) {
            this.hideAllEdgeLabels();
            return;
        }

        this.hideAllEdgeLabels();

        this.activeLine = lineElement;

        const midX = (sourcePos.x + destPos.x) / 2;
        const midY = (sourcePos.y + destPos.y) / 2;

        const labelGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        labelGroup.setAttribute('class', 'edge-labels-group');

        const costLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        costLabel.setAttribute('x', midX);
        costLabel.setAttribute('y', midY - 6);
        costLabel.setAttribute('class', 'edge-label cost-label');
        costLabel.setAttribute('text-anchor', 'middle');
        costLabel.textContent = `${route.cost}`;
        labelGroup.appendChild(costLabel);

        const durationLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        durationLabel.setAttribute('x', midX);
        durationLabel.setAttribute('y', midY + 8);
        durationLabel.setAttribute('class', 'edge-label duration-label');
        durationLabel.setAttribute('text-anchor', 'middle');
        durationLabel.textContent = `${route.duration}`;
        labelGroup.appendChild(durationLabel);

        this.svg.appendChild(labelGroup);

        lineElement.classList.add('selected');
    }

    hideAllEdgeLabels() {
        const labelGroups = this.svg.querySelectorAll('.edge-labels-group');
        labelGroups.forEach(group => group.remove());

        const lines = this.svg.querySelectorAll('.route-line');
        lines.forEach(line => line.classList.remove('selected'));

        this.activeLine = null;
    }

    drawNodes() {
        const nodeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        nodeGroup.setAttribute('class', 'nodes');

        Object.entries(this.routesData.positions).forEach(([country, pos]) => {
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', pos.x);
            circle.setAttribute('cy', pos.y);
            circle.setAttribute('r', 12); // Slightly larger nodes
            circle.setAttribute('class', 'country-node');
            circle.setAttribute('data-country', country);
            nodeGroup.appendChild(circle);
        });

        this.svg.appendChild(nodeGroup);
    }

    drawLabels() {
        const labelGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        labelGroup.setAttribute('class', 'labels');

        Object.entries(this.routesData.positions).forEach(([country, pos]) => {
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', pos.x);
            text.setAttribute('y', pos.y - 20); // More space above nodes
            text.setAttribute('class', 'country-label');
            text.setAttribute('text-anchor', 'middle');
            text.textContent = country;
            labelGroup.appendChild(text);
        });

        this.svg.appendChild(labelGroup);
    }

    highlightPath(path) {
        this.clearHighlights();
        
        if (!path || path.length < 2) return;

        this.highlightedPath = path;

        path.forEach(country => {
            const node = this.svg.querySelector(`[data-country="${country}"]`);
            if (node) {
                node.classList.add('highlighted');
            }
        });

        for (let i = 0; i < path.length - 1; i++) {
            const source = path[i];
            const destination = path[i + 1];

            let edge = this.svg.querySelector(`[data-source="${source}"][data-destination="${destination}"]`);
            if (!edge) {
                edge = this.svg.querySelector(`[data-source="${destination}"][data-destination="${source}"]`);
            }
            
            if (edge) {
                edge.classList.add('highlighted');
            }
        }
    }

    clearHighlights() {
        const highlightedElements = this.svg.querySelectorAll('.highlighted');
        highlightedElements.forEach(element => {
            element.classList.remove('highlighted');
        });
        
        this.highlightedPath = [];
    }

    getNodePosition(country) {
        return this.routesData.positions[country];
    }

    updateGraph(newRoutesData) {
        this.routesData = newRoutesData;
        this.activeLine = null;
        this.drawGraph();
    }
}