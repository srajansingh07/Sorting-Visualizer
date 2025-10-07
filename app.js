class SortingVisualizer {
    constructor() {
        this.array = [];
        this.arraySize = 50;
        this.speed = 2; // Index for speed labels (starts at Normal)
        this.isRunning = false;
        this.isPaused = false;
        this.currentAlgorithm = 'bubble';
        this.currentAlgorithmIndex = 0;
        this.visualMode = 'bars';
        this.currentVisualIndex = 0;
        this.soundEnabled = true;
        this.theme = 'dark'; // Start with dark theme
        
        // Algorithm and visualization mode arrays for sliders
        this.algorithms = [
            { key: 'bubble', name: 'Bubble Sort' },
            { key: 'selection', name: 'Selection Sort' },
            { key: 'insertion', name: 'Insertion Sort' },
            { key: 'merge', name: 'Merge Sort' },
            { key: 'quick', name: 'Quick Sort' },
            { key: 'heap', name: 'Heap Sort' },
            { key: 'radix', name: 'Radix Sort' },
            { key: 'counting', name: 'Counting Sort' }
        ];
        
        this.visualModes = [
            { key: 'bars', name: 'Bars' },
            { key: 'dots', name: 'Dots' },
            { key: 'blocks', name: '3D Blocks' },
            { key: 'particles', name: 'Particles' }
        ];
        
        this.speedLabels = ['Slow', 'Normal', 'Fast', 'Very Fast', 'Lightning'];
        this.speedValues = [200, 100, 50, 25, 10];
        
        // Cancellation token for proper reset functionality
        this.runToken = 0;
        
        // Performance metrics
        this.comparisons = 0;
        this.swaps = 0;
        this.startTime = 0;
        this.animationId = null;
        
        // Canvas and context
        this.canvas = null;
        this.ctx = null;
        
        // Audio context for sound effects
        this.audioContext = null;
        
        // Algorithm information
        this.algorithmInfo = {
            bubble: {
                title: 'Bubble Sort',
                description: 'Bubble Sort repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.',
                timeComplexity: 'O(n²)',
                spaceComplexity: 'O(1)',
                steps: [
                    'Compare adjacent elements',
                    'Swap if they are in wrong order',
                    'Repeat until no more swaps needed'
                ],
                code: `function bubbleSort(arr) {
    for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < arr.length - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
            }
        }
    }
    return arr;
}`
            },
            selection: {
                title: 'Selection Sort',
                description: 'Selection sort finds the minimum element and places it at the beginning of the unsorted portion.',
                timeComplexity: 'O(n²)',
                spaceComplexity: 'O(1)',
                steps: [
                    'Find minimum element in unsorted portion',
                    'Swap it with first element',
                    'Move boundary of sorted portion'
                ],
                code: `function selectionSort(arr) {
    for (let i = 0; i < arr.length; i++) {
        let minIdx = i;
        for (let j = i + 1; j < arr.length; j++) {
            if (arr[j] < arr[minIdx]) {
                minIdx = j;
            }
        }
        [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
    }
    return arr;
}`
            },
            insertion: {
                title: 'Insertion Sort',
                description: 'Builds the sorted array one element at a time by inserting elements into their correct position.',
                timeComplexity: 'O(n²)',
                spaceComplexity: 'O(1)',
                steps: [
                    'Take element from unsorted portion',
                    'Find correct position in sorted portion',
                    'Shift elements and insert at correct position'
                ],
                code: `function insertionSort(arr) {
    for (let i = 1; i < arr.length; i++) {
        let key = arr[i];
        let j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j]; // Shift elements
            j--;
        }
        arr[j + 1] = key;
    }
    return arr;
}`
            },
            merge: {
                title: 'Merge Sort',
                description: 'Divide-and-conquer algorithm that divides the array and merges sorted subarrays.',
                timeComplexity: 'O(n log n)',
                spaceComplexity: 'O(n)',
                steps: [
                    'Divide array into two halves',
                    'Recursively sort both halves',
                    'Merge sorted halves by copying elements'
                ],
                code: `function mergeSort(arr) {
    if (arr.length <= 1) return arr;
    
    const mid = Math.floor(arr.length / 2);
    const left = mergeSort(arr.slice(0, mid));
    const right = mergeSort(arr.slice(mid));
    
    return merge(left, right);
}`
            },
            quick: {
                title: 'Quick Sort',
                description: 'Selects a pivot element and partitions the array around it recursively.',
                timeComplexity: 'O(n log n)',
                spaceComplexity: 'O(log n)',
                steps: [
                    'Choose pivot element',
                    'Partition array around pivot',
                    'Recursively sort subarrays'
                ],
                code: `function quickSort(arr, low = 0, high = arr.length - 1) {
    if (low < high) {
        const pi = partition(arr, low, high);
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
    return arr;
}`
            },
            heap: {
                title: 'Heap Sort',
                description: 'Uses a binary heap data structure to sort elements efficiently.',
                timeComplexity: 'O(n log n)',
                spaceComplexity: 'O(1)',
                steps: [
                    'Build max heap from array',
                    'Extract maximum element',
                    'Rebuild heap and repeat'
                ],
                code: `function heapSort(arr) {
    buildMaxHeap(arr);
    for (let i = arr.length - 1; i > 0; i--) {
        [arr[0], arr[i]] = [arr[i], arr[0]];
        heapify(arr, 0, i);
    }
    return arr;
}`
            },
            radix: {
                title: 'Radix Sort',
                description: 'Non-comparative sorting algorithm that sorts by individual digits or characters.',
                timeComplexity: 'O(nk)',
                spaceComplexity: 'O(n+k)',
                steps: [
                    'Sort by least significant digit',
                    'Move to next digit position',
                    'Repeat until all digits processed'
                ],
                code: `function radixSort(arr) {
    const max = Math.max(...arr);
    for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
        countingSort(arr, exp);
    }
    return arr;
}`
            },
            counting: {
                title: 'Counting Sort',
                description: 'Counts occurrences of each element to determine sorted positions.',
                timeComplexity: 'O(n+k)',
                spaceComplexity: 'O(k)',
                steps: [
                    'Count occurrences of each element',
                    'Calculate cumulative counts',
                    'Place elements in sorted positions'
                ],
                code: `function countingSort(arr) {
    const max = Math.max(...arr);
    const count = new Array(max + 1).fill(0);
    
    for (let num of arr) {
        count[num]++;
    }
    
    let index = 0;
    for (let i = 0; i <= max; i++) {
        while (count[i]-- > 0) {
            arr[index++] = i;
        }
    }
    return arr;
}`
            }
        };
        
        this.init();
    }
    
    init() {
        this.setupElements();
        this.setupEventListeners();
        this.setupCanvas();
        this.setupAudio();
        this.generateArray();
        this.updateSliderDisplays();
        
        // Set initial dark theme properly
        this.applyTheme('dark');
        
        // Setup scroll animations after DOM is ready
        setTimeout(() => {
            this.setupScrollAnimations();
        }, 100);
    }
    
    setupElements() {
        // Get DOM elements
        this.elements = {
            // Horizontal slider controls
            algorithmDisplay: document.getElementById('algorithmDisplay'),
            algorithmPrev: document.getElementById('algorithmPrev'),
            algorithmNext: document.getElementById('algorithmNext'),
            visualDisplay: document.getElementById('visualDisplay'),
            visualPrev: document.getElementById('visualPrev'),
            visualNext: document.getElementById('visualNext'),
            
            // Regular controls
            arraySize: document.getElementById('arraySize'),
            arraySizeValue: document.getElementById('arraySizeValue'),
            speed: document.getElementById('speed'),
            speedValue: document.getElementById('speedValue'),
            customArray: document.getElementById('customArray'),
            
            // Buttons
            generateBtn: document.getElementById('generateBtn'),
            startBtn: document.getElementById('startBtn'),
            pauseBtn: document.getElementById('pauseBtn'),
            resetBtn: document.getElementById('resetBtn'),
            soundToggle: document.getElementById('soundToggle'),
            themeToggle: document.getElementById('themeToggle'),
            
            // Navigation
            visualizerTab: document.getElementById('visualizerTab'),
            learningTab: document.getElementById('learningTab'),
            visualizerSection: document.getElementById('visualizerSection'),
            learningSection: document.getElementById('learningSection'),
            
            // Analytics
            comparisons: document.getElementById('comparisons'),
            swaps: document.getElementById('swaps'),
            swapsLabel: document.getElementById('swapsLabel'),
            elapsedTime: document.getElementById('elapsedTime'),
            complexity: document.getElementById('complexity'),
            spaceComplexity: document.getElementById('spaceComplexity'),
            progress: document.getElementById('progress'),
            
            // Visualization
            canvas: document.getElementById('visualizationCanvas'),
            
            // Modal
            tutorialModal: document.getElementById('tutorialModal'),
            modalTitle: document.getElementById('modalTitle'),
            modalContent: document.getElementById('modalContent'),
            algorithmSteps: document.getElementById('algorithmSteps'),
            algorithmCode: document.getElementById('algorithmCode'),
            complexityAnalysis: document.getElementById('complexityAnalysis'),
            closeModal: document.getElementById('closeModal')
        };
    }
    
    setupEventListeners() {
        // Horizontal slider listeners
        this.elements.algorithmPrev.addEventListener('click', () => this.changeAlgorithm(-1));
        this.elements.algorithmNext.addEventListener('click', () => this.changeAlgorithm(1));
        this.elements.visualPrev.addEventListener('click', () => this.changeVisualization(-1));
        this.elements.visualNext.addEventListener('click', () => this.changeVisualization(1));
        
        this.elements.arraySize.addEventListener('input', (e) => {
            this.arraySize = parseInt(e.target.value);
            this.elements.arraySizeValue.textContent = this.arraySize;
            if (!this.isRunning) {
                this.generateArray();
            }
        });
        
        this.elements.speed.addEventListener('input', (e) => {
            this.speed = parseInt(e.target.value);
            this.elements.speedValue.textContent = this.speedLabels[this.speed];
        });
        
        this.elements.customArray.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.setCustomArray();
            }
        });
        
        // Button listeners
        this.elements.generateBtn.addEventListener('click', () => this.generateArray());
        this.elements.startBtn.addEventListener('click', () => this.startSorting());
        this.elements.pauseBtn.addEventListener('click', () => this.pauseSorting());
        this.elements.resetBtn.addEventListener('click', () => this.resetVisualization());
        this.elements.soundToggle.addEventListener('click', () => this.toggleSound());
        this.elements.themeToggle.addEventListener('click', () => this.toggleTheme());
        
        // Navigation listeners
        this.elements.visualizerTab.addEventListener('click', () => this.switchTab('visualizer'));
        this.elements.learningTab.addEventListener('click', () => this.switchTab('learning'));
        
        // Premium Learning hub listeners
        const premiumAlgorithmCards = document.querySelectorAll('.premium-learning-card');
        premiumAlgorithmCards.forEach(card => {
            card.addEventListener('click', () => {
                const algorithm = card.dataset.algorithm;
                this.openTutorial(algorithm);
            });
        });
        
        const premiumLearnButtons = document.querySelectorAll('.premium-learn-btn');
        premiumLearnButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const algorithm = btn.closest('.premium-learning-card').dataset.algorithm;
                this.openTutorial(algorithm);
            });
        });
        
        // Modal listeners
        this.elements.closeModal.addEventListener('click', () => this.closeTutorial());
        this.elements.tutorialModal.addEventListener('click', (e) => {
            if (e.target === this.elements.tutorialModal) {
                this.closeTutorial();
            }
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT') return;
            
            switch(e.key.toLowerCase()) {
                case ' ':
                    e.preventDefault();
                    this.isRunning ? this.pauseSorting() : this.startSorting();
                    break;
                case 'r':
                    this.resetVisualization();
                    break;
                case 'g':
                    this.generateArray();
                    break;
                case 'escape':
                    this.closeTutorial();
                    break;
                case 'arrowleft':
                    if (e.shiftKey) {
                        this.changeVisualization(-1);
                    } else {
                        this.changeAlgorithm(-1);
                    }
                    break;
                case 'arrowright':
                    if (e.shiftKey) {
                        this.changeVisualization(1);
                    } else {
                        this.changeAlgorithm(1);
                    }
                    break;
            }
        });
        
        // Window resize
        window.addEventListener('resize', () => this.setupCanvas());
    }
    
    // Fixed Premium Scroll Animations Setup
    setupScrollAnimations() {
        // Reset any existing animations first
        const premiumCards = document.querySelectorAll('.premium-learning-card');
        premiumCards.forEach(card => {
            card.classList.remove('animate-in');
            card.classList.add('fade-out');
        });
        
        // Intersection Observer for scroll animations with better settings
        const observerOptions = {
            threshold: 0.2,
            rootMargin: '0px 0px -100px 0px'
        };
        
        const cardObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const cards = Array.from(document.querySelectorAll('.premium-learning-card'));
                    const cardIndex = cards.indexOf(entry.target);
                    
                    // Add staggered animation with more noticeable delay
                    setTimeout(() => {
                        entry.target.classList.remove('fade-out');
                        entry.target.classList.add('animate-in');
                    }, cardIndex * 150); // 150ms stagger delay between cards
                }
            });
        }, observerOptions);
        
        // Observe all premium learning cards
        premiumCards.forEach(card => {
            cardObserver.observe(card);
        });
        
        // Also animate the learning header
        const learningHeader = document.querySelector('.learning-header');
        if (learningHeader) {
            const headerObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = '0';
                        entry.target.style.transform = 'translateY(30px)';
                        entry.target.style.transition = 'all 1s ease';
                        
                        setTimeout(() => {
                            entry.target.style.opacity = '1';
                            entry.target.style.transform = 'translateY(0)';
                        }, 100);
                    }
                });
            }, { threshold: 0.3 });
            
            headerObserver.observe(learningHeader);
        }
    }
    
    // Methods for horizontal sliders
    changeAlgorithm(direction) {
        if (this.isRunning) return;
        
        this.currentAlgorithmIndex = (this.currentAlgorithmIndex + direction + this.algorithms.length) % this.algorithms.length;
        this.currentAlgorithm = this.algorithms[this.currentAlgorithmIndex].key;
        this.updateSliderDisplays();
        this.updateMetrics();
        this.resetVisualization();
    }
    
    changeVisualization(direction) {
        this.currentVisualIndex = (this.currentVisualIndex + direction + this.visualModes.length) % this.visualModes.length;
        this.visualMode = this.visualModes[this.currentVisualIndex].key;
        this.updateSliderDisplays();
        this.render();
    }
    
    updateSliderDisplays() {
        this.elements.algorithmDisplay.textContent = this.algorithms[this.currentAlgorithmIndex].name;
        this.elements.visualDisplay.textContent = this.visualModes[this.currentVisualIndex].name;
        this.elements.speedValue.textContent = this.speedLabels[this.speed];
    }
    
    setupCanvas() {
        this.canvas = this.elements.canvas;
        this.ctx = this.canvas.getContext('2d');
        
        // Enhanced canvas setup with higher DPI for HD quality
        const dpr = window.devicePixelRatio || 1;
        const container = this.canvas.parentElement;
        const containerWidth = container.clientWidth - 64; // Account for padding
        
        // Set display size (CSS pixels)
        this.canvas.style.width = Math.max(containerWidth, 400) + 'px';
        this.canvas.style.height = '500px';
        
        // Set actual canvas size (device pixels)
        this.canvas.width = Math.max(containerWidth, 400) * dpr;
        this.canvas.height = 500 * dpr;
        
        // Scale context to match device pixel ratio
        this.ctx.scale(dpr, dpr);
        
        // Update canvas CSS to prevent extra spacing
        this.canvas.style.display = 'block';
        this.canvas.style.margin = '0 auto';
        
        this.render();
    }
    
    setupAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio API not supported');
            this.soundEnabled = false;
        }
    }
    
    generateArray() {
        this.array = [];
        const maxValue = 300;
        
        for (let i = 0; i < this.arraySize; i++) {
            this.array.push({
                value: Math.floor(Math.random() * maxValue) + 10,
                state: 'default',
                index: i
            });
        }
        
        this.resetMetrics();
        this.render();
    }
    
    setCustomArray() {
        const input = this.elements.customArray.value.trim();
        if (!input) return;
        
        try {
            const values = input.split(',').map(val => parseInt(val.trim())).filter(val => !isNaN(val) && val > 0);
            if (values.length === 0) throw new Error('No valid numbers found');
            
            this.array = values.map((value, index) => ({
                value: Math.min(value, 300),
                state: 'default',
                index
            }));
            
            this.arraySize = this.array.length;
            this.elements.arraySize.value = this.arraySize;
            this.elements.arraySizeValue.textContent = this.arraySize;
            
            this.resetMetrics();
            this.render();
        } catch (error) {
            console.warn('Invalid array format');
        }
    }
    
    resetMetrics() {
        this.comparisons = 0;
        this.swaps = 0;
        this.startTime = 0;
        this.updateMetrics();
        this.elements.progress.style.width = '0%';
    }
    
    updateMetrics() {
        this.elements.comparisons.textContent = this.comparisons;
        this.elements.swaps.textContent = this.swaps;
        this.elements.elapsedTime.textContent = this.startTime ? Date.now() - this.startTime : 0;
        
        // Update swaps label based on algorithm
        if (this.currentAlgorithm === 'insertion' || this.currentAlgorithm === 'merge') {
            this.elements.swapsLabel.textContent = 'Shifts';
        } else {
            this.elements.swapsLabel.textContent = 'Swaps';
        }
        
        const info = this.algorithmInfo[this.currentAlgorithm];
        this.elements.complexity.textContent = info.timeComplexity;
        this.elements.spaceComplexity.textContent = info.spaceComplexity;
    }
    
    async startSorting() {
        if (this.isRunning) return;
        
        // Increment runToken to create unique identifier for this sorting run
        this.runToken++;
        const myRunToken = this.runToken;
        
        this.isRunning = true;
        this.isPaused = false;
        this.startTime = Date.now();
        
        this.elements.startBtn.disabled = true;
        this.elements.pauseBtn.disabled = false;
        this.elements.generateBtn.disabled = true;
        
        try {
            await this.runAlgorithm(this.currentAlgorithm, myRunToken);
        } catch (error) {
            // Silently handle interruptions
        }
        
        // Only update UI if this is still the current run
        if (this.runToken === myRunToken) {
            this.isRunning = false;
            this.elements.startBtn.disabled = false;
            this.elements.pauseBtn.disabled = true;
            this.elements.generateBtn.disabled = false;
        }
    }
    
    pauseSorting() {
        if (!this.isRunning) return;
        
        this.isPaused = true;
        this.isRunning = false;
        
        this.elements.startBtn.disabled = false;
        this.elements.pauseBtn.disabled = true;
        this.elements.generateBtn.disabled = false;
    }
    
    resetVisualization() {
        // Stop any running sorting by incrementing the run token
        this.runToken++;
        
        this.isPaused = false;
        this.isRunning = false;
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        // Generate a new unsorted array
        this.generateArray();
        
        // Reset button states
        this.elements.startBtn.disabled = false;
        this.elements.pauseBtn.disabled = true;
        this.elements.generateBtn.disabled = false;
    }
    
    async runAlgorithm(algorithm, myRunToken) {
        const sortingMethods = {
            bubble: () => this.bubbleSort(myRunToken),
            selection: () => this.selectionSort(myRunToken),
            insertion: () => this.insertionSort(myRunToken),
            merge: () => this.mergeSort(0, this.array.length - 1, myRunToken),
            quick: () => this.quickSort(0, this.array.length - 1, myRunToken),
            heap: () => this.heapSort(myRunToken),
            radix: () => this.radixSort(myRunToken),
            counting: () => this.countingSort(myRunToken)
        };
        
        const sortMethod = sortingMethods[algorithm];
        if (sortMethod) {
            await sortMethod();
            if (this.runToken === myRunToken) {
                await this.markAllSorted(myRunToken);
            }
        }
    }
    
    // Sorting algorithm implementations (keeping all existing methods but shortened for space)
    async bubbleSort(myRunToken) {
        const n = this.array.length;
        
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n - i - 1; j++) {
                if (this.isPaused || this.runToken !== myRunToken) throw new Error('Paused');
                
                this.array[j].state = 'comparing';
                this.array[j + 1].state = 'comparing';
                this.comparisons++;
                this.updateProgress(i / n);
                
                await this.animateAndRender();
                
                if (this.array[j].value > this.array[j + 1].value) {
                    this.array[j].state = 'swapping';
                    this.array[j + 1].state = 'swapping';
                    await this.animateAndRender();
                    
                    [this.array[j], this.array[j + 1]] = [this.array[j + 1], this.array[j]];
                    this.swaps++;
                    this.playSound(200 + this.array[j].value);
                }
                
                this.array[j].state = 'default';
                this.array[j + 1].state = 'default';
                this.updateMetrics();
            }
            this.array[n - i - 1].state = 'sorted';
        }
    }
    
    async selectionSort(myRunToken) {
        const n = this.array.length;
        
        for (let i = 0; i < n; i++) {
            if (this.isPaused || this.runToken !== myRunToken) throw new Error('Paused');
            
            let minIdx = i;
            this.array[minIdx].state = 'comparing';
            
            for (let j = i + 1; j < n; j++) {
                if (this.isPaused || this.runToken !== myRunToken) throw new Error('Paused');
                
                this.array[j].state = 'comparing';
                this.comparisons++;
                
                await this.animateAndRender();
                
                if (this.array[j].value < this.array[minIdx].value) {
                    this.array[minIdx].state = 'default';
                    minIdx = j;
                    this.array[minIdx].state = 'comparing';
                } else {
                    this.array[j].state = 'default';
                }
                
                this.updateMetrics();
            }
            
            if (minIdx !== i) {
                this.array[i].state = 'swapping';
                this.array[minIdx].state = 'swapping';
                
                await this.animateAndRender();
                
                [this.array[i], this.array[minIdx]] = [this.array[minIdx], this.array[i]];
                this.swaps++;
                
                this.playSound(200 + this.array[i].value);
            }
            
            this.array[i].state = 'sorted';
            if (minIdx !== i) this.array[minIdx].state = 'default';
            
            this.updateProgress(i / n);
        }
    }
    
    async insertionSort(myRunToken) {
        const n = this.array.length;
        
        for (let i = 1; i < n; i++) {
            if (this.isPaused || this.runToken !== myRunToken) throw new Error('Paused');
            
            let key = { ...this.array[i] };
            key.state = 'comparing';
            let j = i - 1;
            
            this.array[i].state = 'comparing';
            await this.animateAndRender();
            
            while (j >= 0 && this.array[j].value > key.value) {
                if (this.isPaused || this.runToken !== myRunToken) throw new Error('Paused');
                
                this.array[j].state = 'swapping';
                this.comparisons++;
                
                await this.animateAndRender();
                
                this.array[j + 1] = { ...this.array[j] };
                this.array[j + 1].state = 'swapping';
                this.swaps++;
                
                this.playSound(200 + this.array[j].value);
                
                j--;
                this.updateMetrics();
                
                await this.animateAndRender();
                
                if (j >= 0) this.array[j].state = 'default';
                this.array[j + 2].state = 'default';
            }
            
            this.array[j + 1] = key;
            this.array[j + 1].state = 'default';
            
            this.updateProgress(i / n);
        }
    }
    
    async mergeSort(left, right, myRunToken) {
        if (left < right) {
            const mid = Math.floor((left + right) / 2);
            
            await this.mergeSort(left, mid, myRunToken);
            await this.mergeSort(mid + 1, right, myRunToken);
            await this.merge(left, mid, right, myRunToken);
        }
    }
    
    async merge(left, mid, right, myRunToken) {
        if (this.isPaused || this.runToken !== myRunToken) throw new Error('Paused');
        
        const leftArray = this.array.slice(left, mid + 1);
        const rightArray = this.array.slice(mid + 1, right + 1);
        
        let i = 0, j = 0, k = left;
        
        for (let idx = left; idx <= right; idx++) {
            this.array[idx].state = 'comparing';
        }
        await this.animateAndRender();
        
        while (i < leftArray.length && j < rightArray.length) {
            if (this.isPaused || this.runToken !== myRunToken) throw new Error('Paused');
            
            this.comparisons++;
            
            if (leftArray[i].value <= rightArray[j].value) {
                this.array[k] = { ...leftArray[i], state: 'swapping' };
                i++;
            } else {
                this.array[k] = { ...rightArray[j], state: 'swapping' };
                j++;
            }
            
            this.swaps++;
            this.playSound(200 + this.array[k].value);
            k++;
            
            this.updateMetrics();
            await this.animateAndRender();
        }
        
        while (i < leftArray.length) {
            if (this.runToken !== myRunToken) throw new Error('Paused');
            this.array[k] = { ...leftArray[i], state: 'swapping' };
            i++;
            k++;
            this.swaps++;
            await this.animateAndRender();
        }
        
        while (j < rightArray.length) {
            if (this.runToken !== myRunToken) throw new Error('Paused');
            this.array[k] = { ...rightArray[j], state: 'swapping' };
            j++;
            k++;
            this.swaps++;
            await this.animateAndRender();
        }
        
        for (let idx = left; idx <= right; idx++) {
            this.array[idx].state = 'default';
        }
        
        this.updateProgress((right - left + 1) / this.array.length);
    }
    
    async quickSort(low, high, myRunToken) {
        if (low < high) {
            const pi = await this.partition(low, high, myRunToken);
            await this.quickSort(low, pi - 1, myRunToken);
            await this.quickSort(pi + 1, high, myRunToken);
        }
    }
    
    async partition(low, high, myRunToken) {
        if (this.isPaused || this.runToken !== myRunToken) throw new Error('Paused');
        
        const pivot = this.array[high];
        pivot.state = 'pivot';
        
        let i = low - 1;
        
        for (let j = low; j < high; j++) {
            if (this.isPaused || this.runToken !== myRunToken) throw new Error('Paused');
            
            this.array[j].state = 'comparing';
            this.comparisons++;
            
            await this.animateAndRender();
            
            if (this.array[j].value < pivot.value) {
                i++;
                if (i !== j) {
                    this.array[i].state = 'swapping';
                    this.array[j].state = 'swapping';
                    
                    await this.animateAndRender();
                    
                    [this.array[i], this.array[j]] = [this.array[j], this.array[i]];
                    this.swaps++;
                    
                    this.playSound(200 + this.array[i].value);
                }
            }
            
            if (j !== i) this.array[j].state = 'default';
            if (i >= 0 && this.array[i].state === 'swapping') this.array[i].state = 'default';
            
            this.updateMetrics();
        }
        
        if (i + 1 !== high) {
            this.array[i + 1].state = 'swapping';
            await this.animateAndRender();
            
            [this.array[i + 1], this.array[high]] = [this.array[high], this.array[i + 1]];
            this.swaps++;
            
            this.playSound(200 + this.array[i + 1].value);
        }
        
        this.array[i + 1].state = 'sorted';
        
        this.updateProgress((high - low + 1) / this.array.length);
        
        return i + 1;
    }
    
    async heapSort(myRunToken) {
        const n = this.array.length;
        
        for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
            await this.heapify(n, i, myRunToken);
        }
        
        for (let i = n - 1; i > 0; i--) {
            if (this.isPaused || this.runToken !== myRunToken) throw new Error('Paused');
            
            this.array[0].state = 'swapping';
            this.array[i].state = 'swapping';
            
            await this.animateAndRender();
            
            [this.array[0], this.array[i]] = [this.array[i], this.array[0]];
            this.swaps++;
            
            this.playSound(200 + this.array[i].value);
            
            this.array[i].state = 'sorted';
            this.array[0].state = 'default';
            
            await this.heapify(i, 0, myRunToken);
            
            this.updateProgress((n - i) / n);
            this.updateMetrics();
        }
        
        this.array[0].state = 'sorted';
    }
    
    async heapify(n, i, myRunToken) {
        if (this.isPaused || this.runToken !== myRunToken) throw new Error('Paused');
        
        let largest = i;
        let left = 2 * i + 1;
        let right = 2 * i + 2;
        
        this.array[i].state = 'comparing';
        
        if (left < n) {
            this.array[left].state = 'comparing';
            this.comparisons++;
            
            if (this.array[left].value > this.array[largest].value) {
                largest = left;
            }
        }
        
        if (right < n) {
            this.array[right].state = 'comparing';
            this.comparisons++;
            
            if (this.array[right].value > this.array[largest].value) {
                largest = right;
            }
        }
        
        await this.animateAndRender();
        
        if (largest !== i) {
            this.array[i].state = 'swapping';
            this.array[largest].state = 'swapping';
            
            await this.animateAndRender();
            
            [this.array[i], this.array[largest]] = [this.array[largest], this.array[i]];
            this.swaps++;
            
            this.playSound(200 + this.array[i].value);
            
            this.array[i].state = 'default';
            this.array[largest].state = 'default';
            if (left < n) this.array[left].state = 'default';
            if (right < n) this.array[right].state = 'default';
            
            await this.heapify(n, largest, myRunToken);
        } else {
            this.array[i].state = 'default';
            if (left < n) this.array[left].state = 'default';
            if (right < n) this.array[right].state = 'default';
        }
    }
    
    async radixSort(myRunToken) {
        const max = Math.max(...this.array.map(el => el.value));
        
        for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
            await this.countingSortForRadix(exp, myRunToken);
            this.updateProgress(Math.log10(exp) / Math.log10(max));
        }
    }
    
    async countingSortForRadix(exp, myRunToken) {
        if (this.isPaused || this.runToken !== myRunToken) throw new Error('Paused');
        
        const n = this.array.length;
        const output = new Array(n);
        const count = new Array(10).fill(0);
        
        for (let i = 0; i < n; i++) {
            this.array[i].state = 'comparing';
            const digit = Math.floor(this.array[i].value / exp) % 10;
            count[digit]++;
            this.comparisons++;
        }
        
        await this.animateAndRender();
        
        for (let i = 1; i < 10; i++) {
            count[i] += count[i - 1];
        }
        
        for (let i = n - 1; i >= 0; i--) {
            if (this.isPaused || this.runToken !== myRunToken) throw new Error('Paused');
            
            const digit = Math.floor(this.array[i].value / exp) % 10;
            output[count[digit] - 1] = { ...this.array[i], state: 'swapping' };
            count[digit]--;
            this.swaps++;
            
            this.playSound(200 + this.array[i].value);
            this.updateMetrics();
        }
        
        for (let i = 0; i < n; i++) {
            this.array[i] = output[i];
            this.array[i].state = 'default';
        }
        
        await this.animateAndRender();
    }
    
    async countingSort(myRunToken) {
        if (this.isPaused || this.runToken !== myRunToken) throw new Error('Paused');
        
        const max = Math.max(...this.array.map(el => el.value));
        const min = Math.min(...this.array.map(el => el.value));
        const range = max - min + 1;
        
        const count = new Array(range).fill(0);
        const output = new Array(this.array.length);
        
        for (let i = 0; i < this.array.length; i++) {
            this.array[i].state = 'comparing';
            count[this.array[i].value - min]++;
            this.comparisons++;
            
            await this.animateAndRender();
            this.updateMetrics();
        }
        
        for (let i = 1; i < range; i++) {
            count[i] += count[i - 1];
        }
        
        for (let i = this.array.length - 1; i >= 0; i--) {
            if (this.isPaused || this.runToken !== myRunToken) throw new Error('Paused');
            
            const val = this.array[i].value;
            output[count[val - min] - 1] = { ...this.array[i], state: 'swapping' };
            count[val - min]--;
            this.swaps++;
            
            this.playSound(200 + val);
            this.updateMetrics();
            
            await this.animateAndRender();
        }
        
        for (let i = 0; i < this.array.length; i++) {
            this.array[i] = output[i];
            this.array[i].state = 'default';
        }
        
        await this.animateAndRender();
    }
    
    async markAllSorted(myRunToken) {
        for (let i = 0; i < this.array.length; i++) {
            if (this.runToken !== myRunToken) return;
            
            this.array[i].state = 'sorted';
            this.playSound(400 + this.array[i].value * 2);
            
            if (i % 3 === 0) {
                await this.animateAndRender(30);
            }
        }
        
        this.render();
        this.elements.progress.style.width = '100%';
    }
    
    async animateAndRender(customDelay) {
        this.render();
        await this.delay(customDelay || this.speedValues[this.speed]);
    }
    
    // Helper functions for color manipulation
    lightenColor(color, amount) {
        const usePound = color[0] === "#";
        const col = usePound ? color.slice(1) : color;
        const num = parseInt(col, 16);
        let r = (num >> 16) + amount;
        let g = (num >> 8 & 0x00FF) + amount;
        let b = (num & 0x0000FF) + amount;
        r = r > 255 ? 255 : r < 0 ? 0 : r;
        g = g > 255 ? 255 : g < 0 ? 0 : g;
        b = b > 255 ? 255 : b < 0 ? 0 : b;
        return (usePound ? "#" : "") + (r << 16 | g << 8 | b).toString(16).padStart(6, '0');
    }
    
    darkenColor(color, amount) {
        return this.lightenColor(color, -amount);
    }
    
    render() {
        if (!this.ctx) return;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.array.length === 0) return;
        
        // Performance optimization: Use requestAnimationFrame for smooth rendering
        switch (this.visualMode) {
            case 'bars':
                this.renderEnhancedBars();
                break;
            case 'dots':
                this.renderEnhancedDots();
                break;
            case 'blocks':
                this.renderEnhanced3DBlocks();
                break;
            case 'particles':
                this.renderEnhancedParticles();
                break;
        }
    }
    
    // ENHANCED HD VISUALIZATION METHODS
    
    renderEnhancedBars() {
        const containerWidth = parseInt(this.canvas.style.width);
        const containerHeight = parseInt(this.canvas.style.height);
        const barWidth = Math.max(2, (containerWidth - 40) / this.array.length);
        const maxHeight = containerHeight - 40;
        const maxValue = Math.max(...this.array.map(el => el.value));
        
        this.array.forEach((element, index) => {
            const height = (element.value / maxValue) * maxHeight;
            const x = 20 + index * barWidth;
            const y = containerHeight - 20 - height;
            
            const baseColor = this.getElementColor(element.state);
            const lighterColor = this.lightenColor(baseColor, 40);
            const darkerColor = this.darkenColor(baseColor, 30);
            
            // Enhanced gradient with multiple color stops
            const gradient = this.ctx.createLinearGradient(x, y, x, y + height);
            gradient.addColorStop(0, lighterColor);
            gradient.addColorStop(0.3, baseColor);
            gradient.addColorStop(0.7, baseColor);
            gradient.addColorStop(1, darkerColor);
            
            // Enhanced shadows and outlines for HD quality
            if (element.state !== 'default') {
                this.ctx.shadowColor = baseColor;
                this.ctx.shadowBlur = 12;
                this.ctx.shadowOffsetX = 0;
                this.ctx.shadowOffsetY = 0;
            }
            
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(x, y, barWidth - 1, height);
            
            // Add subtle outline for clarity
            this.ctx.strokeStyle = 'rgba(255,255,255,0.3)';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(x, y, barWidth - 1, height);
            
            // Reset shadow
            this.ctx.shadowBlur = 0;
            
            // Enhanced text rendering for smaller arrays
            if (this.array.length <= 30 && barWidth > 20) {
                this.ctx.fillStyle = '#ffffff';
                this.ctx.font = `bold ${Math.min(12, barWidth/3)}px Inter`;
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'bottom';
                this.ctx.fillText(element.value, x + barWidth / 2, y - 5);
            }
        });
    }
    
    renderEnhancedDots() {
        const containerWidth = parseInt(this.canvas.style.width);
        const containerHeight = parseInt(this.canvas.style.height);
        const spacing = Math.max(6, containerWidth / this.array.length);
        const maxHeight = containerHeight - 40;
        const maxValue = Math.max(...this.array.map(el => el.value));
        
        this.array.forEach((element, index) => {
            const height = (element.value / maxValue) * maxHeight;
            const x = 20 + index * spacing;
            const y = containerHeight - 20 - height;
            const radius = Math.min(15, Math.max(6, spacing / 3));
            
            const baseColor = this.getElementColor(element.state);
            
            // Multi-layer dot rendering for HD quality
            const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, radius);
            gradient.addColorStop(0, this.lightenColor(baseColor, 60));
            gradient.addColorStop(0.7, baseColor);
            gradient.addColorStop(1, this.darkenColor(baseColor, 40));
            
            // Outer glow for special states
            if (element.state !== 'default') {
                this.ctx.shadowColor = baseColor;
                this.ctx.shadowBlur = radius * 2;
            }
            
            // Main dot
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
            this.ctx.fill();
            
            // Inner highlight for 3D effect
            this.ctx.shadowBlur = 0;
            this.ctx.fillStyle = 'rgba(255,255,255,0.4)';
            this.ctx.beginPath();
            this.ctx.arc(x - radius * 0.3, y - radius * 0.3, radius * 0.3, 0, 2 * Math.PI);
            this.ctx.fill();
            
            // Value text for smaller arrays
            if (this.array.length <= 50 && radius > 8) {
                this.ctx.fillStyle = '#ffffff';
                this.ctx.font = `bold ${Math.min(10, radius)}px Inter`;
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText(element.value, x, y + radius + 15);
            }
        });
    }
    
    renderEnhanced3DBlocks() {
        const containerWidth = parseInt(this.canvas.style.width);
        const containerHeight = parseInt(this.canvas.style.height);
        const blockWidth = Math.max(4, containerWidth / this.array.length);
        const maxHeight = containerHeight - 40;
        const maxValue = Math.max(...this.array.map(el => el.value));
        
        // Enhanced perspective and depth
        const perspective = 0.4;
        const shadowOffset = 3;
        
        this.array.forEach((element, index) => {
            const blockHeight = (element.value / maxValue) * maxHeight;
            const x = 10 + index * blockWidth;
            const y = containerHeight - 20 - blockHeight;
            
            const baseColor = this.getElementColor(element.state);
            const topColor = this.lightenColor(baseColor, 30);
            const sideColor = this.darkenColor(baseColor, 20);
            
            // Floor shadow for depth
            this.ctx.fillStyle = 'rgba(0,0,0,0.1)';
            this.ctx.fillRect(x + shadowOffset, y + blockHeight + shadowOffset, blockWidth, 4);
            
            // Front face
            this.ctx.fillStyle = baseColor;
            this.ctx.fillRect(x, y, blockWidth - 1, blockHeight);
            
            // Top face (3D effect)
            this.ctx.fillStyle = topColor;
            this.ctx.beginPath();
            this.ctx.moveTo(x, y);
            this.ctx.lineTo(x + blockWidth * perspective, y - blockWidth * perspective);
            this.ctx.lineTo(x + blockWidth + blockWidth * perspective, y - blockWidth * perspective);
            this.ctx.lineTo(x + blockWidth, y);
            this.ctx.closePath();
            this.ctx.fill();
            
            // Right side face
            this.ctx.fillStyle = sideColor;
            this.ctx.beginPath();
            this.ctx.moveTo(x + blockWidth, y);
            this.ctx.lineTo(x + blockWidth + blockWidth * perspective, y - blockWidth * perspective);
            this.ctx.lineTo(x + blockWidth + blockWidth * perspective, y + blockHeight - blockWidth * perspective);
            this.ctx.lineTo(x + blockWidth, y + blockHeight);
            this.ctx.closePath();
            this.ctx.fill();
            
            // Enhanced outline
            this.ctx.strokeStyle = 'rgba(255,255,255,0.2)';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(x, y, blockWidth - 1, blockHeight);
        });
    }
    
    renderEnhancedParticles() {
        const containerWidth = parseInt(this.canvas.style.width);
        const containerHeight = parseInt(this.canvas.style.height);
        const maxValue = Math.max(...this.array.map(el => el.value));
        
        // Enhanced particle distribution
        const cols = Math.ceil(Math.sqrt(this.array.length));
        const rows = Math.ceil(this.array.length / cols);
        const spacingX = (containerWidth - 40) / cols;
        const spacingY = (containerHeight - 40) / rows;
        
        this.array.forEach((element, index) => {
            const col = index % cols;
            const row = Math.floor(index / cols);
            const centerX = 20 + col * spacingX + spacingX / 2;
            const centerY = 20 + row * spacingY + spacingY / 2;
            
            const baseColor = this.getElementColor(element.state);
            
            // Multiple particle layers based on value
            const particleCount = Math.floor((element.value / maxValue) * 30) + 8;
            const layers = 3;
            
            for (let layer = 0; layer < layers; layer++) {
                const layerParticles = Math.floor(particleCount / layers);
                const layerRadius = (layer + 1) * 15;
                const particleSize = Math.max(1, 4 - layer);
                const opacity = 1 - (layer * 0.3);
                
                for (let p = 0; p < layerParticles; p++) {
                    const angle = (p / layerParticles) * Math.PI * 2;
                    const distance = layerRadius * (0.3 + Math.random() * 0.7);
                    const x = centerX + Math.cos(angle) * distance;
                    const y = centerY + Math.sin(angle) * distance;
                    
                    // Enhanced particle rendering with glow
                    if (element.state !== 'default') {
                        this.ctx.shadowColor = baseColor;
                        this.ctx.shadowBlur = particleSize * 2;
                    }
                    
                    this.ctx.globalAlpha = opacity;
                    this.ctx.fillStyle = baseColor;
                    this.ctx.beginPath();
                    this.ctx.arc(x, y, particleSize, 0, Math.PI * 2);
                    this.ctx.fill();
                }
            }
            
            // Reset rendering state
            this.ctx.shadowBlur = 0;
            this.ctx.globalAlpha = 1;
            
            // Central value display
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 12px Inter';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(element.value, centerX, centerY);
        });
    }
    
    getElementColor(state) {
        const colors = {
            default: '#1FB8CD',
            comparing: '#FFC185',
            swapping: '#B4413C',
            sorted: '#5D878F',
            pivot: '#DB4545'
        };
        
        return colors[state] || colors.default;
    }
    
    updateProgress(progress) {
        this.elements.progress.style.width = `${Math.min(progress * 100, 100)}%`;
    }
    
    playSound(frequency) {
        if (!this.soundEnabled || !this.audioContext) return;
        
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.value = frequency;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.1);
        } catch (error) {
            // Silently fail if audio context issues
        }
    }
    
    delay(ms) {
        return new Promise(resolve => {
            this.animationId = requestAnimationFrame(() => {
                setTimeout(resolve, ms);
            });
        });
    }
    
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        const icon = this.elements.soundToggle.querySelector('i');
        
        if (this.soundEnabled) {
            icon.className = 'fas fa-volume-up';
        } else {
            icon.className = 'fas fa-volume-mute';
        }
    }
    
    // Fixed theme toggle functionality
    applyTheme(theme) {
        this.theme = theme;
        document.documentElement.setAttribute('data-color-scheme', theme);
        
        const icon = this.elements.themeToggle.querySelector('i');
        if (theme === 'light') {
            icon.className = 'fas fa-sun';
        } else {
            icon.className = 'fas fa-moon';
        }
        
        // Re-render canvas with new theme
        if (this.canvas && this.ctx) {
            this.render();
        }
    }
    
    toggleTheme() {
        const newTheme = this.theme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
        
        // Reset scroll animations to trigger with new theme
        setTimeout(() => {
            this.setupScrollAnimations();
        }, 100);
    }
    
    switchTab(tab) {
        const tabs = ['visualizer', 'learning'];
        
        tabs.forEach(t => {
            const tabElement = document.getElementById(`${t}Tab`);
            const sectionElement = document.getElementById(`${t}Section`);
            
            if (t === tab) {
                tabElement.classList.add('active');
                sectionElement.classList.add('active');
            } else {
                tabElement.classList.remove('active');
                sectionElement.classList.remove('active');
            }
        });
        
        if (tab === 'visualizer') {
            setTimeout(() => this.setupCanvas(), 100);
        } else if (tab === 'learning') {
            // Trigger scroll animations when switching to learning tab
            setTimeout(() => {
                this.setupScrollAnimations();
            }, 200);
        }
    }
    
    openTutorial(algorithm) {
        const info = this.algorithmInfo[algorithm];
        if (!info) return;
        
        this.elements.modalTitle.textContent = info.title;
        
        this.elements.algorithmSteps.innerHTML = info.steps
            .map(step => `<li>${step}</li>`)
            .join('');
        this.elements.algorithmSteps.style.paddingLeft = '1.5rem';
        
        this.elements.algorithmCode.textContent = info.code;
        
        this.elements.complexityAnalysis.innerHTML = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                <div>
                    <strong>Time Complexity:</strong> ${info.timeComplexity}
                </div>
                <div>
                    <strong>Space Complexity:</strong> ${info.spaceComplexity}
                </div>
            </div>
            <p>${info.description}</p>
        `;
        
        this.elements.tutorialModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
    
    closeTutorial() {
        this.elements.tutorialModal.classList.add('hidden');
        document.body.style.overflow = '';
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const visualizer = new SortingVisualizer();
    
    // Make visualizer globally accessible for debugging
    window.visualizer = visualizer;
    
    console.log('Enhanced Premium Sorting Visualizer initialized successfully!');
    console.log('- Description card removed ✓');
    console.log('- Visualization area enlarged to 500px ✓');
    console.log('- Lines visualization mode removed ✓');
    console.log('- HD enhanced visualizations implemented ✓');
    console.log('- Mobile responsive design improved ✓');
    console.log('- Floating particle effects added ✓');
});
