class TravelPlannerApp {
    constructor() {
        this.graph = new Graph();
        this.routesData = null;
        this.init();
    }

    async init() {
        try {
            await this.loadRoutesData();
            this.initializeGraph();
            this.setupUI();
            console.log('Travel Planner App initialized successfully');
        } catch (error) {
            console.error('Error initializing app:', error);
            this.useFallbackData();
        }
    }

    async loadRoutesData() {
        try {
            const response = await fetch('data/routes.json');
            if (!response.ok) {
                throw new Error('Failed to load routes data');
            }
            this.routesData = await response.json();
        } catch (error) {
            console.warn('Failed to load JSON, using fallback data:', error);
            throw error;
        }
    }

    initializeGraph() {
        this.graph = new Graph();
        this.routesData.routes.forEach(route => {
            this.graph.addEdge(route.source, route.destination, route.cost, route.duration);
        });
        console.log('Graph initialized with', this.routesData.routes.length, 'routes');
    }

    setupUI() {
        this.populateCountrySelects();
        this.setupEventListeners();
    }

    populateCountrySelects() {
        const countries = this.graph.getAllCountries();
        const startSelect = document.getElementById('start-country');
        const destSelect = document.getElementById('destination-country');

        startSelect.innerHTML = '<option value="">Select starting country</option>';
        destSelect.innerHTML = '<option value="">Select destination</option>';

        countries.forEach(country => {
            const startOption = document.createElement('option');
            startOption.value = country;
            startOption.textContent = country;
            startSelect.appendChild(startOption);

            const destOption = document.createElement('option');
            destOption.value = country;
            destOption.textContent = country;
            destSelect.appendChild(destOption);
        });
    }

    setupEventListeners() {
        document.getElementById('cheapest-btn').addEventListener('click', () => {
            this.findRoute('cheapest');
        });

        document.getElementById('quickest-btn').addEventListener('click', () => {
            this.findRoute('quickest');
        });

        document.getElementById('best-btn').addEventListener('click', () => {
            this.findRoute('best');
        });

        document.getElementById('clear-result').addEventListener('click', () => {
            this.clearResult();
        });

        document.getElementById('start-country').addEventListener('change', () => {
            this.clearResult();
        });

        document.getElementById('destination-country').addEventListener('change', () => {
            this.clearResult();
        });
    }

    findRoute(type) {
        const startCountry = document.getElementById('start-country').value;
        const destinationCountry = document.getElementById('destination-country').value;

        if (!startCountry || !destinationCountry) {
            this.showError('Please select both starting country and destination.');
            return;
        }

        if (startCountry === destinationCountry) {
            this.showError('Starting country and destination cannot be the same.');
            return;
        }

        let result;
        switch (type) {
            case 'cheapest':
                result = this.graph.findCheapestRoute(startCountry, destinationCountry);
                break;
            case 'quickest':
                result = this.graph.findQuickestRoute(startCountry, destinationCountry);
                break;
            case 'best':
                result = this.graph.findBestRoute(startCountry, destinationCountry);
                break;
            default:
                this.showError('Invalid route type.');
                return;
        }

        if (result.error) {
            this.showError(result.error);
        } else {
            this.showResult(result);

            if (this.visualization && result.path) {
                this.visualization.highlightPath(result.path);
            }
        }
    }

    showResult(result) {
        const resultContainer = document.getElementById('result-container');
        const resultTitle = document.getElementById('result-title');
        const resultBadge = document.getElementById('result-badge');
        const resultContent = document.getElementById('result-content');

        const titles = {
            cheapest: 'Cheapest Route Found',
            quickest: 'Quickest Route Found',
            best: 'Best Route Found'
        };

        const badgeClasses = {
            cheapest: 'badge-cheapest',
            quickest: 'badge-quickest',
            best: 'badge-best'
        };

        const badgeTexts = {
            cheapest: 'Lowest Cost',
            quickest: 'Fastest Time',
            best: 'Most Efficient'
        };

        resultTitle.textContent = titles[result.type] || 'Route Found';
        resultBadge.textContent = badgeTexts[result.type] || 'Route';
        resultBadge.className = `result-badge ${badgeClasses[result.type] || ''}`;

        let contentHTML = `<div class="route-path"><strong>Route:</strong> ${result.path.join(' → ')}</div>`;
        
        if (result.cost !== undefined) {
            contentHTML += `<div class="route-cost"><strong>Total Cost:</strong> $${result.cost}</div>`;
        }
        
        if (result.duration !== undefined) {
            contentHTML += `<div class="route-duration"><strong>Total Duration:</strong> ${result.duration} hours</div>`;
        }

        if (result.path && result.path.length > 1) {
            contentHTML += '<div class="route-breakdown"><strong>Route Breakdown:</strong><ul>';
            for (let i = 0; i < result.path.length - 1; i++) {
                const from = result.path[i];
                const to = result.path[i + 1];
                const routeInfo = this.getRouteInfo(from, to);
                if (routeInfo) {
                    contentHTML += `<li>${from} → ${to}: $${routeInfo.cost}, ${routeInfo.duration}h</li>`;
                }
            }
            contentHTML += '</ul></div>';
        }

        resultContent.innerHTML = contentHTML;
        resultContainer.classList.remove('hidden');
    }

    showError(message) {
        const resultContainer = document.getElementById('result-container');
        const resultTitle = document.getElementById('result-title');
        const resultBadge = document.getElementById('result-badge');
        const resultContent = document.getElementById('result-content');

        resultTitle.textContent = 'No Route Found';
        resultBadge.textContent = 'Error';
        resultBadge.className = 'result-badge badge-error';
        resultContent.innerHTML = `<div class="error-message">${message}</div>`;
        
        resultContainer.classList.remove('hidden');

        if (this.visualization) {
            this.visualization.clearHighlights();
        }
    }

    clearResult() {
        const resultContainer = document.getElementById('result-container');
        resultContainer.classList.add('hidden');
        if (this.visualization) {
            this.visualization.clearHighlights();
        }
    }

    getRouteInfo(from, to) {
        const route = this.routesData.routes.find(r => 
            (r.source === from && r.destination === to) || 
            (r.source === to && r.destination === from)
        );
        return route ? { cost: route.cost, duration: route.duration } : null;
    }

    getGraph() {
        return this.graph;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.travelApp = new TravelPlannerApp();
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = TravelPlannerApp;
}
