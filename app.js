// Main Sorting Visualizer Application
class SortingVisualizer {
    constructor() {
        this.canvas = document.getElementById('sortingCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Algorithm data from the provided JSON
        this.algorithmData = {
            bubble: {
                name: "Bubble Sort",
                description: "A simple comparison-based algorithm that repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.",
                timeComplexity: { best: "O(n)", average: "O(n²)", worst: "O(n²)" },
                spaceComplexity: "O(1)",
                stable: true,
                inPlace: true,
                pseudocode: `for i = 0 to n-1:
  for j = 0 to n-i-2:
    if array[j] > array[j+1]:
      swap(array[j], array[j+1])`,
                explanation: "Bubble Sort works by repeatedly comparing adjacent elements and swapping them if they're in the wrong order. The largest element 'bubbles' to the end in each pass."
            },
            selection: {
                name: "Selection Sort",
                description: "Finds the minimum element from the unsorted part and places it at the beginning.",
                timeComplexity: { best: "O(n²)", average: "O(n²)", worst: "O(n²)" },
                spaceComplexity: "O(1)",
                stable: false,
                inPlace: true,
                pseudocode: `for i = 0 to n-1:
  min_idx = i
  for j = i+1 to n:
    if array[j] < array[min_idx]:
      min_idx = j
  swap(array[i], array[min_idx])`,
                explanation: "Selection Sort divides the array into sorted and unsorted parts. It repeatedly finds the smallest element from the unsorted part and places it at the beginning."
            },
            insertion: {
                name: "Insertion Sort",
                description: "Builds the sorted array one element at a time by repeatedly inserting the next element into its correct position.",
                timeComplexity: { best: "O(n)", average: "O(n²)", worst: "O(n²)" },
                spaceComplexity: "O(1)",
                stable: true,
                inPlace: true,
                pseudocode: `for i = 1 to n-1:
  key = array[i]
  j = i-1
  while j >= 0 and array[j] > key:
    array[j+1] = array[j]
    j = j-1
  array[j+1] = key`,
                explanation: "Insertion Sort works like sorting playing cards. It takes elements from the unsorted part and inserts them into the correct position in the sorted part."
            },
            merge: {
                name: "Merge Sort",
                description: "A divide-and-conquer algorithm that divides the array into halves, recursively sorts them, and then merges the sorted halves.",
                timeComplexity: { best: "O(n log n)", average: "O(n log n)", worst: "O(n log n)" },
                spaceComplexity: "O(n)",
                stable: true,
                inPlace: false,
                pseudocode: `function mergeSort(array):
  if length <= 1: return array
  mid = length / 2
  left = mergeSort(array[0:mid])
  right = mergeSort(array[mid:length])
  return merge(left, right)`,
                explanation: "Merge Sort uses the divide-and-conquer approach. It divides the array into smaller parts, sorts them recursively, and then merges them back together."
            },
            quick: {
                name: "Quick Sort",
                description: "Picks a pivot element and partitions the array around it, then recursively sorts the partitions.",
                timeComplexity: { best: "O(n log n)", average: "O(n log n)", worst: "O(n²)" },
                spaceComplexity: "O(log n)",
                stable: false,
                inPlace: true,
                pseudocode: `function quickSort(array, low, high):
  if low < high:
    pivot = partition(array, low, high)
    quickSort(array, low, pivot-1)
    quickSort(array, pivot+1, high)`,
                explanation: "Quick Sort selects a 'pivot' element and partitions the array so that elements smaller than the pivot come before it and elements greater come after it."
            },
            heap: {
                name: "Heap Sort",
                description: "Converts the array into a heap data structure and repeatedly extracts the maximum element.",
                timeComplexity: { best: "O(n log n)", average: "O(n log n)", worst: "O(n log n)" },
                spaceComplexity: "O(1)",
                stable: false,
                inPlace: true,
                pseudocode: `buildMaxHeap(array)
for i = n-1 down to 1:
  swap(array[0], array[i])
  heapify(array, 0, i)`,
                explanation: "Heap Sort first builds a max-heap from the array, then repeatedly extracts the maximum element and places it at the end of the sorted portion."
            }
        };

        // Application state
        this.state = {
            array: [],
            originalArray: [],
            arraySize: 50,
            currentAlgorithm: 'bubble',
            isPlaying: false,
            isPaused: false,
            speed: 1,
            volume: 50,
            audioEnabled: true,
            theme: 'light',
            isFullscreen: false,
            comparisons: 0,
            swaps: 0,
            startTime: 0,
            currentTimeout: null
        };

        // Animation state
        this.animationState = {
            comparing: [],
            swapping: [],
            sorted: [],
            pivot: -1
        };

        // Audio context
        this.audioContext = null;
        this.initAudio();

        // Initialize
        this.init();
    }

    init() {
        this.setupCanvas();
        this.setupEventListeners();
        this.loadSettings();
        this.generateArray('random');
        this.updateAlgorithmInfo();
        this.applyTheme();
    }

    initAudio() {
        try {
            // Create audio context on first user interaction
            document.addEventListener('click', () => {
                if (!this.audioContext) {
                    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                }
            }, { once: true });
        } catch (e) {
            console.warn('Web Audio API not supported');
            this.state.audioEnabled = false;
        }
    }

    setupCanvas() {
        const container = this.canvas.parentElement;
        const rect = container.getBoundingClientRect();
        this.canvas.width = Math.min(800, rect.width - 40);
        this.canvas.height = 400;
        
        // High DPI support
        const dpr = window.devicePixelRatio || 1;
        const displayWidth = this.canvas.width;
        const displayHeight = this.canvas.height;
        
        this.canvas.width = displayWidth * dpr;
        this.canvas.height = displayHeight * dpr;
        this.canvas.style.width = displayWidth + 'px';
        this.canvas.style.height = displayHeight + 'px';
        
        this.ctx.scale(dpr, dpr);
    }

    setupEventListeners() {
        // Prevent default behavior on canvas to avoid interference
        this.canvas.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
        });

        // Theme selector
        const themeSelector = document.getElementById('themeSelector');
        if (themeSelector) {
            themeSelector.addEventListener('change', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.state.theme = e.target.value;
                this.applyTheme();
                this.saveSettings();
            });
        }

        // Algorithm selector
        const algorithmSelect = document.getElementById('algorithmSelect');
        if (algorithmSelect) {
            algorithmSelect.addEventListener('change', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.state.currentAlgorithm = e.target.value;
                this.updateAlgorithmInfo();
                this.resetVisualization();
            });
        }

        // Array size
        const arraySize = document.getElementById('arraySize');
        if (arraySize) {
            arraySize.addEventListener('input', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.state.arraySize = parseInt(e.target.value);
                document.getElementById('arraySizeDisplay').textContent = this.state.arraySize;
                this.generateArray();
            });
        }

        // Pattern buttons
        const patternButtons = [
            { id: 'randomBtn', pattern: 'random' },
            { id: 'sortedBtn', pattern: 'sorted' },
            { id: 'reverseBtn', pattern: 'reverse' },
            { id: 'nearlyBtn', pattern: 'nearly' }
        ];

        patternButtons.forEach(({ id, pattern }) => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.generateArray(pattern);
                });
            }
        });

        // Playback controls
        const playBtn = document.getElementById('playBtn');
        if (playBtn) {
            playBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.startSorting();
            });
        }

        const pauseBtn = document.getElementById('pauseBtn');
        if (pauseBtn) {
            pauseBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.pauseSorting();
            });
        }

        const stepBtn = document.getElementById('stepBtn');
        if (stepBtn) {
            stepBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.stepSorting();
            });
        }

        const resetBtn = document.getElementById('resetBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.resetVisualization();
            });
        }

        // Speed control
        const speedControl = document.getElementById('speedControl');
        if (speedControl) {
            speedControl.addEventListener('input', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.state.speed = parseFloat(e.target.value);
                document.getElementById('speedDisplay').textContent = this.state.speed.toFixed(1) + 'x';
            });
        }

        // Volume control
        const volumeControl = document.getElementById('volumeControl');
        if (volumeControl) {
            volumeControl.addEventListener('input', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.state.volume = parseInt(e.target.value);
                document.getElementById('volumeDisplay').textContent = this.state.volume + '%';
            });
        }

        // Audio toggle
        const audioToggle = document.getElementById('audioToggle');
        if (audioToggle) {
            audioToggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleAudio();
            });
        }

        // Fullscreen toggle
        const fullscreenBtn = document.getElementById('fullscreenBtn');
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleFullscreen();
            });
        }

        // Tab navigation
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const tabName = e.target.dataset.tab;
                this.switchTab(tabName);
            });
        });

        // Window resize
        window.addEventListener('resize', () => {
            setTimeout(() => {
                this.setupCanvas();
                this.draw();
            }, 100);
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    
        // Setup custom array input
        this.setupCustomArrayInput();

    }

    // Custom Array Input Methods - Added for enhanced functionality
        setupCustomArrayInput() {
            const customArrayInput = document.getElementById('customArrayInput');
            const applyButton = document.getElementById('applyCustomArray');
            const clearButton = document.getElementById('clearCustomArray');
            const errorDiv = document.getElementById('customArrayError');

            if (customArrayInput) {
                // Apply custom array on Enter key
                customArrayInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        this.applyCustomArray();
                    }
                });

                // Clear error on input
                customArrayInput.addEventListener('input', () => {
                    this.clearCustomArrayError();
                });
            }

            if (applyButton) {
                applyButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.applyCustomArray();
                });
            }

            if (clearButton) {
                clearButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.clearCustomArray();
                });
            }
        }

        applyCustomArray() {
            const customArrayInput = document.getElementById('customArrayInput');
            const errorDiv = document.getElementById('customArrayError');

            if (!customArrayInput) return;

            const inputValue = customArrayInput.value.trim();

            if (!inputValue) {
                this.showCustomArrayError('Please enter some numbers');
                return;
            }

            try {
                // Parse the input and validate
                const inputArray = this.parseCustomArrayInput(inputValue);

                if (inputArray.length === 0) {
                    this.showCustomArrayError('No valid numbers found');
                    return;
                }

                if (inputArray.length > 100) {
                    this.showCustomArrayError('Maximum 100 numbers allowed');
                    return;
                }

                // Apply the custom array
                this.state.array = [...inputArray];
                this.state.originalArray = [...inputArray];
                this.state.arraySize = inputArray.length;

                // Update array size display and slider
                const arraySizeDisplay = document.getElementById('arraySizeDisplay');
                const arraySizeSlider = document.getElementById('arraySize');

                if (arraySizeDisplay) {
                    arraySizeDisplay.textContent = inputArray.length;
                }
                if (arraySizeSlider) {
                    arraySizeSlider.value = Math.min(100, inputArray.length);
                }

                this.resetAnimationState();
                this.resetStats();
                this.draw();
                this.clearCustomArrayError();

                // Success feedback
                customArrayInput.classList.remove('input-error');
                this.updateCurrentOperation(`Custom array applied (${inputArray.length} elements)`);

            } catch (error) {
                this.showCustomArrayError(error.message);
            }
        }

        parseCustomArrayInput(input) {
            // Split by commas and parse each number
            const numbers = input.split(',')
                .map(str => str.trim())
                .filter(str => str.length > 0)
                .map(str => {
                    const num = parseInt(str, 10);
                    if (isNaN(num)) {
                        throw new Error(`"${str}" is not a valid number`);
                    }
                    if (num < 1 || num > 500) {
                        throw new Error(`Numbers must be between 1 and 500 (found: ${num})`);
                    }
                    return num;
                });

            // Remove duplicates and sort for better visualization
            const uniqueNumbers = [...new Set(numbers)];

            return uniqueNumbers;
        }

        showCustomArrayError(message) {
            const customArrayInput = document.getElementById('customArrayInput');
            const errorDiv = document.getElementById('customArrayError');

            if (customArrayInput) {
                customArrayInput.classList.add('input-error');
            }

            if (errorDiv) {
                errorDiv.textContent = message;
                errorDiv.style.display = 'block';
            }
        }

        clearCustomArrayError() {
            const customArrayInput = document.getElementById('customArrayInput');
            const errorDiv = document.getElementById('customArrayError');

            if (customArrayInput) {
                customArrayInput.classList.remove('input-error');
            }

            if (errorDiv) {
                errorDiv.style.display = 'none';
                errorDiv.textContent = '';
            }
        }

        clearCustomArray() {
            const customArrayInput = document.getElementById('customArrayInput');

            if (customArrayInput) {
                customArrayInput.value = '';
            }

            this.clearCustomArrayError();
            this.updateCurrentOperation('Custom array input cleared');
        }

    

    handleKeyboard(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
        
        switch (e.key) {
            case ' ':
                e.preventDefault();
                if (this.state.isPlaying) this.pauseSorting();
                else this.startSorting();
                break;
            case 'r':
            case 'R':
                e.preventDefault();
                this.resetVisualization();
                break;
            case 'f':
            case 'F':
                e.preventDefault();
                this.toggleFullscreen();
                break;
            case 'm':
            case 'M':
                e.preventDefault();
                this.toggleAudio();
                break;
        }
    }

    generateArray(pattern = 'random') {
        const size = this.state.arraySize;
        let array = [];

        switch (pattern) {
            case 'random':
                for (let i = 0; i < size; i++) {
                    array.push(Math.floor(Math.random() * 350) + 10);
                }
                break;
            case 'sorted':
                for (let i = 1; i <= size; i++) {
                    array.push(i * (350 / size) + 10);
                }
                break;
            case 'reverse':
                for (let i = size; i > 0; i--) {
                    array.push(i * (350 / size) + 10);
                }
                break;
            case 'nearly':
                for (let i = 1; i <= size; i++) {
                    array.push(i * (350 / size) + 10);
                }
                // Shuffle 10% of elements
                for (let i = 0; i < Math.max(1, size * 0.1); i++) {
                    const idx1 = Math.floor(Math.random() * size);
                    const idx2 = Math.floor(Math.random() * size);
                    [array[idx1], array[idx2]] = [array[idx2], array[idx1]];
                }
                break;
        }

        this.state.array = array;
        this.state.originalArray = [...array];
        this.resetAnimationState();
        this.resetStats();
        this.draw();
    }

    resetAnimationState() {
        this.animationState = {
            comparing: [],
            swapping: [],
            sorted: [],
            pivot: -1
        };
    }

    resetStats() {
        this.state.comparisons = 0;
        this.state.swaps = 0;
        this.state.startTime = 0;
        this.updateStatsDisplay();
    }

    updateStatsDisplay() {
        const comparisonsEl = document.getElementById('comparisons');
        const swapsEl = document.getElementById('swaps');
        const timeEl = document.getElementById('timeElapsed');
        
        if (comparisonsEl) comparisonsEl.textContent = this.state.comparisons;
        if (swapsEl) swapsEl.textContent = this.state.swaps;
        
        if (timeEl) {
            const elapsed = this.state.startTime ? Date.now() - this.state.startTime : 0;
            timeEl.textContent = elapsed + 'ms';
        }
    }

    updateCurrentOperation(message) {
        const operationEl = document.getElementById('currentOperation');
        if (operationEl) {
            operationEl.textContent = message;
        }
    }

    draw() {
        if (!this.ctx || !this.canvas) return;
        
        const width = this.canvas.width / (window.devicePixelRatio || 1);
        const height = this.canvas.height / (window.devicePixelRatio || 1);
        
        // Clear canvas
        this.ctx.clearRect(0, 0, width, height);

        if (this.state.array.length === 0) return;

        const barWidth = Math.max(1, (width - 40) / this.state.array.length);
        const maxValue = Math.max(...this.state.array);
        const barMaxHeight = height - 60;

        // Draw bars
        this.state.array.forEach((value, index) => {
            const barHeight = Math.max(1, (value / maxValue) * barMaxHeight);
            const x = 20 + index * barWidth;
            const y = height - 30 - barHeight;

            // Determine bar color based on state
            let color = this.getBarColor('default');
            
            if (this.animationState.sorted.includes(index)) {
                color = this.getBarColor('sorted');
            } else if (this.animationState.swapping.includes(index)) {
                color = this.getBarColor('swapping');
            } else if (this.animationState.comparing.includes(index)) {
                color = this.getBarColor('comparing');
            } else if (this.animationState.pivot === index) {
                color = this.getBarColor('pivot');
            }

            // Draw bar
            this.ctx.fillStyle = color;
            this.ctx.fillRect(x, y, Math.max(1, barWidth - 1), barHeight);

            // Draw value text on smaller arrays
            if (this.state.arraySize <= 20) {
                this.ctx.fillStyle = this.getBarColor('text');
                this.ctx.font = '12px monospace';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(Math.round(value), x + barWidth / 2, height - 10);
            }
        });
    }

    getBarColor(type) {
        // Default colors that work across themes
        const colors = {
            default: '#3498db',
            comparing: '#e74c3c',
            swapping: '#f39c12',
            sorted: '#27ae60',
            pivot: '#e67e22',
            text: '#2c3e50'
        };

        // Theme-specific colors
        const themeColors = {
            neon: {
                default: '#00ffff',
                comparing: '#ff0080',
                swapping: '#ffff00',
                sorted: '#00ff00',
                pivot: '#ff6600',
                text: '#ffffff'
            },
            ocean: {
                default: '#006994',
                comparing: '#ff6b35',
                swapping: '#ffe66d',
                sorted: '#4ecdc4',
                pivot: '#ff8c42',
                text: '#2c3e50'
            },
            forest: {
                default: '#2d5016',
                comparing: '#c0392b',
                swapping: '#f39c12',
                sorted: '#27ae60',
                pivot: '#e67e22',
                text: '#2c3e50'
            },
            dark: {
                default: '#32bea6',
                comparing: '#ff5559',
                swapping: '#e6815e',
                sorted: '#32bea6',
                pivot: '#e6815e',
                text: '#f5f5f5'
            }
        };

        return themeColors[this.state.theme]?.[type] || colors[type];
    }

    async startSorting() {
        if (this.state.isPlaying) return;

        this.state.isPlaying = true;
        this.state.isPaused = false;
        this.state.startTime = Date.now();
        this.updateControlButtons();
        this.updateCurrentOperation(`Starting ${this.algorithmData[this.state.currentAlgorithm].name}...`);

        try {
            await this.runSortingAlgorithm();
            
            // Mark all as sorted
            this.animationState.sorted = Array.from({length: this.state.array.length}, (_, i) => i);
            this.animationState.comparing = [];
            this.animationState.swapping = [];
            this.animationState.pivot = -1;
            this.draw();
            
            this.updateCurrentOperation(`${this.algorithmData[this.state.currentAlgorithm].name} completed!`);
            this.playCompletionSound();
        } catch (error) {
            if (error.message !== 'Sorting paused') {
                console.error('Sorting error:', error);
                this.updateCurrentOperation('Error occurred during sorting');
            }
        }

        this.state.isPlaying = false;
        this.updateControlButtons();
    }

    async runSortingAlgorithm() {
        switch (this.state.currentAlgorithm) {
            case 'bubble':
                await this.bubbleSort();
                break;
            case 'selection':
                await this.selectionSort();
                break;
            case 'insertion':
                await this.insertionSort();
                break;
            case 'merge':
                await this.mergeSort(0, this.state.array.length - 1);
                break;
            case 'quick':
                await this.quickSort(0, this.state.array.length - 1);
                break;
            case 'heap':
                await this.heapSort();
                break;
        }
    }

    async bubbleSort() {
        const array = this.state.array;
        const n = array.length;

        for (let i = 0; i < n - 1; i++) {
            let swapped = false;
            
            for (let j = 0; j < n - i - 1; j++) {
                this.checkIfPaused();
                
                // Highlight comparing elements
                this.animationState.comparing = [j, j + 1];
                this.animationState.swapping = [];
                this.draw();
                await this.delay();
                this.playSound(200 + array[j]);

                this.state.comparisons++;
                this.updateStatsDisplay();

                if (array[j] > array[j + 1]) {
                    // Highlight swapping elements
                    this.animationState.swapping = [j, j + 1];
                    this.animationState.comparing = [];
                    this.draw();
                    await this.delay();
                    
                    // Perform swap
                    [array[j], array[j + 1]] = [array[j + 1], array[j]];
                    this.state.swaps++;
                    this.updateStatsDisplay();
                    swapped = true;
                    
                    this.playSound(300 + Math.max(array[j], array[j + 1]));
                }
            }
            
            // Mark the last element as sorted
            this.animationState.sorted.push(n - i - 1);
            this.animationState.comparing = [];
            this.animationState.swapping = [];
            this.draw();
            
            if (!swapped) break;
        }
        
        // Mark first element as sorted
        if (!this.animationState.sorted.includes(0)) {
            this.animationState.sorted.push(0);
        }
    }

    async selectionSort() {
        const array = this.state.array;
        const n = array.length;

        for (let i = 0; i < n - 1; i++) {
            this.checkIfPaused();
            let minIdx = i;

            for (let j = i + 1; j < n; j++) {
                this.checkIfPaused();
                
                this.animationState.comparing = [minIdx, j];
                this.animationState.swapping = [];
                this.draw();
                await this.delay();
                this.playSound(200 + array[j]);

                this.state.comparisons++;
                this.updateStatsDisplay();

                if (array[j] < array[minIdx]) {
                    minIdx = j;
                }
            }

            if (minIdx !== i) {
                this.animationState.swapping = [i, minIdx];
                this.animationState.comparing = [];
                this.draw();
                await this.delay();

                [array[i], array[minIdx]] = [array[minIdx], array[i]];
                this.state.swaps++;
                this.updateStatsDisplay();
                this.playSound(300 + Math.max(array[i], array[minIdx]));
            }

            this.animationState.sorted.push(i);
            this.animationState.comparing = [];
            this.animationState.swapping = [];
            this.draw();
        }

        this.animationState.sorted.push(n - 1);
    }

    async insertionSort() {
        const array = this.state.array;
        const n = array.length;

        this.animationState.sorted.push(0);

        for (let i = 1; i < n; i++) {
            this.checkIfPaused();
            const key = array[i];
            let j = i - 1;

            this.animationState.comparing = [i];
            this.animationState.swapping = [];
            this.draw();
            await this.delay();

            while (j >= 0) {
                this.checkIfPaused();
                
                this.animationState.comparing = [j, j + 1];
                this.draw();
                await this.delay();
                this.playSound(200 + array[j]);

                this.state.comparisons++;
                this.updateStatsDisplay();

                if (array[j] <= key) break;

                this.animationState.swapping = [j, j + 1];
                this.animationState.comparing = [];
                this.draw();
                await this.delay();

                array[j + 1] = array[j];
                this.state.swaps++;
                this.updateStatsDisplay();
                this.playSound(300 + array[j]);
                j--;
            }

            array[j + 1] = key;
            this.animationState.sorted.push(i);
            this.animationState.comparing = [];
            this.animationState.swapping = [];
            this.draw();
        }
    }

    async mergeSort(left, right) {
        if (left >= right) return;

        this.checkIfPaused();
        const mid = Math.floor((left + right) / 2);

        await this.mergeSort(left, mid);
        await this.mergeSort(mid + 1, right);
        await this.merge(left, mid, right);
    }

    async merge(left, mid, right) {
        const leftArr = this.state.array.slice(left, mid + 1);
        const rightArr = this.state.array.slice(mid + 1, right + 1);
        let i = 0, j = 0, k = left;

        while (i < leftArr.length && j < rightArr.length) {
            this.checkIfPaused();
            
            this.animationState.comparing = [k];
            this.animationState.swapping = [];
            this.draw();
            await this.delay();
            
            this.state.comparisons++;
            this.updateStatsDisplay();
            this.playSound(200 + Math.min(leftArr[i], rightArr[j]));

            if (leftArr[i] <= rightArr[j]) {
                this.state.array[k] = leftArr[i];
                i++;
            } else {
                this.state.array[k] = rightArr[j];
                j++;
            }

            this.state.swaps++;
            this.updateStatsDisplay();
            k++;
        }

        while (i < leftArr.length) {
            this.state.array[k] = leftArr[i];
            i++;
            k++;
        }

        while (j < rightArr.length) {
            this.state.array[k] = rightArr[j];
            j++;
            k++;
        }

        this.animationState.comparing = [];
        this.draw();
    }

    async quickSort(low, high) {
        if (low < high) {
            this.checkIfPaused();
            const pi = await this.partition(low, high);
            await this.quickSort(low, pi - 1);
            await this.quickSort(pi + 1, high);
        }
    }

    async partition(low, high) {
        const pivot = this.state.array[high];
        this.animationState.pivot = high;
        let i = low - 1;

        for (let j = low; j < high; j++) {
            this.checkIfPaused();
            
            this.animationState.comparing = [j, high];
            this.animationState.swapping = [];
            this.draw();
            await this.delay();
            this.playSound(200 + this.state.array[j]);

            this.state.comparisons++;
            this.updateStatsDisplay();

            if (this.state.array[j] < pivot) {
                i++;
                if (i !== j) {
                    this.animationState.swapping = [i, j];
                    this.draw();
                    await this.delay();

                    [this.state.array[i], this.state.array[j]] = [this.state.array[j], this.state.array[i]];
                    this.state.swaps++;
                    this.updateStatsDisplay();
                    this.playSound(300 + Math.max(this.state.array[i], this.state.array[j]));
                }
            }
        }

        this.animationState.swapping = [i + 1, high];
        this.draw();
        await this.delay();

        [this.state.array[i + 1], this.state.array[high]] = [this.state.array[high], this.state.array[i + 1]];
        this.state.swaps++;
        this.updateStatsDisplay();

        this.animationState.pivot = -1;
        this.animationState.comparing = [];
        this.animationState.swapping = [];
        
        return i + 1;
    }

    async heapSort() {
        const n = this.state.array.length;

        // Build max heap
        for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
            await this.heapify(n, i);
        }

        // Extract elements from heap
        for (let i = n - 1; i > 0; i--) {
            this.checkIfPaused();
            
            this.animationState.swapping = [0, i];
            this.animationState.comparing = [];
            this.draw();
            await this.delay();

            [this.state.array[0], this.state.array[i]] = [this.state.array[i], this.state.array[0]];
            this.state.swaps++;
            this.updateStatsDisplay();
            this.playSound(300 + Math.max(this.state.array[0], this.state.array[i]));

            this.animationState.sorted.push(i);
            this.animationState.swapping = [];
            
            await this.heapify(i, 0);
        }

        this.animationState.sorted.push(0);
    }

    async heapify(n, i) {
        let largest = i;
        const left = 2 * i + 1;
        const right = 2 * i + 2;

        if (left < n) {
            this.animationState.comparing = [left, largest];
            this.animationState.swapping = [];
            this.draw();
            await this.delay();
            this.state.comparisons++;
            this.updateStatsDisplay();
            
            if (this.state.array[left] > this.state.array[largest]) {
                largest = left;
            }
        }

        if (right < n) {
            this.animationState.comparing = [right, largest];
            this.draw();
            await this.delay();
            this.state.comparisons++;
            this.updateStatsDisplay();
            
            if (this.state.array[right] > this.state.array[largest]) {
                largest = right;
            }
        }

        if (largest !== i) {
            this.animationState.swapping = [i, largest];
            this.animationState.comparing = [];
            this.draw();
            await this.delay();

            [this.state.array[i], this.state.array[largest]] = [this.state.array[largest], this.state.array[i]];
            this.state.swaps++;
            this.updateStatsDisplay();
            this.playSound(300 + Math.max(this.state.array[i], this.state.array[largest]));

            this.animationState.comparing = [];
            this.animationState.swapping = [];
            
            await this.heapify(n, largest);
        } else {
            this.animationState.comparing = [];
        }
    }

    checkIfPaused() {
        if (!this.state.isPlaying) {
            throw new Error('Sorting paused');
        }
    }

    async delay() {
        const baseDelay = 50;
        const actualDelay = baseDelay / this.state.speed;
        return new Promise(resolve => {
            this.state.currentTimeout = setTimeout(resolve, actualDelay);
        });
    }

    pauseSorting() {
        this.state.isPlaying = false;
        this.state.isPaused = true;
        if (this.state.currentTimeout) {
            clearTimeout(this.state.currentTimeout);
        }
        this.updateControlButtons();
        this.updateCurrentOperation('Sorting paused');
    }

    stepSorting() {
        this.updateCurrentOperation('Step mode not implemented - use play/pause for control');
    }

    resetVisualization() {
        this.state.isPlaying = false;
        this.state.isPaused = false;
        if (this.state.currentTimeout) {
            clearTimeout(this.state.currentTimeout);
        }
        this.state.array = [...this.state.originalArray];
        this.resetAnimationState();
        this.resetStats();
        this.draw();
        this.updateControlButtons();
        this.updateCurrentOperation('Ready to start sorting...');
    }

    updateControlButtons() {
        const playBtn = document.getElementById('playBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        const stepBtn = document.getElementById('stepBtn');
        const resetBtn = document.getElementById('resetBtn');

        if (this.state.isPlaying) {
            if (playBtn) playBtn.disabled = true;
            if (pauseBtn) pauseBtn.disabled = false;
            if (stepBtn) stepBtn.disabled = true;
            if (resetBtn) resetBtn.disabled = false;
        } else {
            if (playBtn) playBtn.disabled = false;
            if (pauseBtn) pauseBtn.disabled = true;
            if (stepBtn) stepBtn.disabled = false;
            if (resetBtn) resetBtn.disabled = false;
        }
    }

    playSound(frequency) {
        if (!this.state.audioEnabled || !this.audioContext || this.state.volume === 0) return;

        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.frequency.value = Math.min(1000, Math.max(100, frequency));
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(this.state.volume / 200, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);

            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.1);
        } catch (e) {
            // Silently fail if audio doesn't work
        }
    }

    playCompletionSound() {
        if (!this.state.audioEnabled || !this.audioContext || this.state.volume === 0) return;

        // Play a pleasant completion chord
        const frequencies = [261.63, 329.63, 392.00]; // C, E, G
        frequencies.forEach((freq, index) => {
            setTimeout(() => this.playSound(freq), index * 100);
        });
    }

    toggleAudio() {
        this.state.audioEnabled = !this.state.audioEnabled;
        const icon = document.getElementById('audioIcon');
        if (icon) {
            icon.textContent = this.state.audioEnabled ? '🔊' : '🔇';
        }
        
        if (this.state.audioEnabled && !this.audioContext) {
            this.initAudio();
        }
        
        this.saveSettings();
    }

    toggleFullscreen() {
        this.state.isFullscreen = !this.state.isFullscreen;
        const container = document.querySelector('.app-container');
        
        if (this.state.isFullscreen) {
            container.classList.add('fullscreen');
        } else {
            container.classList.remove('fullscreen');
        }
        
        // Redraw canvas after fullscreen toggle
        setTimeout(() => {
            this.setupCanvas();
            this.draw();
        }, 100);
    }

    switchTab(tabName) {
        // Hide all tab contents
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Remove active class from all nav tabs
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Show selected tab content
        const targetTab = document.getElementById(tabName + '-tab');
        if (targetTab) {
            targetTab.classList.add('active');
        }
        
        // Add active class to selected nav tab
        const navTab = document.querySelector(`[data-tab="${tabName}"]`);
        if (navTab) {
            navTab.classList.add('active');
        }
    }

    updateAlgorithmInfo() {
        const algo = this.algorithmData[this.state.currentAlgorithm];
        if (!algo) return;

        // Update algorithm info tab
        const elements = {
            algoTitle: algo.name,
            algoDescription: algo.description,
            algoStable: algo.stable ? 'Yes' : 'No',
            algoInPlace: algo.inPlace ? 'Yes' : 'No',
            algoMethod: 'Comparison',
            algoExplanation: algo.explanation,
            algorithmPseudocode: algo.pseudocode,
            bestCase: algo.timeComplexity.best,
            avgCase: algo.timeComplexity.average,
            worstCase: algo.timeComplexity.worst,
            spaceComplexity: algo.spaceComplexity
        };

        Object.entries(elements).forEach(([id, content]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = content;
            }
        });
    }

    applyTheme() {
        document.body.setAttribute('data-theme', this.state.theme);
        // Redraw to apply new colors
        setTimeout(() => this.draw(), 50);
    }

    saveSettings() {
        const settings = {
            theme: this.state.theme,
            arraySize: this.state.arraySize,
            speed: this.state.speed,
            volume: this.state.volume,
            audioEnabled: this.state.audioEnabled,
            currentAlgorithm: this.state.currentAlgorithm
        };
        
        try {
            localStorage.setItem('sortingVisualizerSettings', JSON.stringify(settings));
        } catch (e) {
            console.warn('Could not save settings');
        }
    }

    loadSettings() {
        try {
            const settings = JSON.parse(localStorage.getItem('sortingVisualizerSettings') || '{}');
            
            if (settings.theme) {
                this.state.theme = settings.theme;
                const themeSelector = document.getElementById('themeSelector');
                if (themeSelector) themeSelector.value = settings.theme;
            }
            
            if (settings.arraySize) {
                this.state.arraySize = settings.arraySize;
                const arraySize = document.getElementById('arraySize');
                const arraySizeDisplay = document.getElementById('arraySizeDisplay');
                if (arraySize) arraySize.value = settings.arraySize;
                if (arraySizeDisplay) arraySizeDisplay.textContent = settings.arraySize;
            }
            
            if (settings.speed) {
                this.state.speed = settings.speed;
                const speedControl = document.getElementById('speedControl');
                const speedDisplay = document.getElementById('speedDisplay');
                if (speedControl) speedControl.value = settings.speed;
                if (speedDisplay) speedDisplay.textContent = settings.speed.toFixed(1) + 'x';
            }
            
            if (settings.volume !== undefined) {
                this.state.volume = settings.volume;
                const volumeControl = document.getElementById('volumeControl');
                const volumeDisplay = document.getElementById('volumeDisplay');
                if (volumeControl) volumeControl.value = settings.volume;
                if (volumeDisplay) volumeDisplay.textContent = settings.volume + '%';
            }
            
            if (settings.audioEnabled !== undefined) {
                this.state.audioEnabled = settings.audioEnabled;
                const icon = document.getElementById('audioIcon');
                if (icon) icon.textContent = this.state.audioEnabled ? '🔊' : '🔇';
            }
            
            if (settings.currentAlgorithm) {
                this.state.currentAlgorithm = settings.currentAlgorithm;
                const algorithmSelect = document.getElementById('algorithmSelect');
                if (algorithmSelect) algorithmSelect.value = settings.currentAlgorithm;
            }
        } catch (e) {
            console.warn('Could not load settings');
        }
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.sortingVisualizer = new SortingVisualizer();
});
