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