// Main application JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    App.init();
});

// Global App object
const App = {
    // Store the current state of the application
    state: {
        activeModule: 'writing-module',
        overallProgress: 0,
        completedActivities: {},
        rewards: {
            stars: 0,
            badges: []
        }
    },

 // Config data will be stored here once loaded
    config: null,

    // Initialize the application
    init: function() {
        this.loadConfig()
            .then(() => {
                this.initializePage();
                this.loadModules();
                this.updateUI();
                this.loadState();
                this.setupEventListeners();
            })
            .catch(error => {
                console.error('Error during initialization:', error);
            });
    },
    
    // Load configuration data
    loadConfig: function() {
        return new Promise((resolve, reject) => {
            // First try to fetch from the config.json file
            fetch('config/config.json')
                .then(response => response.json())
                .then(data => {
                    this.config = data;
                    resolve();
                })
                .catch(error => {
                    console.warn('Could not load config.json, falling back to ConfigManager:', error);
                    // Fallback to the pre-defined config in ConfigManager
                    this.config = ConfigManager.getDefaultConfig();
                    resolve();
                });
        });
    },
    
    // Initialize the page structure based on config
    initializePage: function() {
        if (!this.config) {
            console.error('Config data is not loaded!');
            return;
        }
        
        // Set page title and favicon
        document.title = this.config.siteSettings.title;
        const favicon = document.getElementById('favicon');
        if (favicon) {
            favicon.href = this.config.siteSettings.favicon;
        }
        
        // Set site title and lesson title
        document.getElementById('site-title').textContent = this.config.siteSettings.title;
        document.getElementById('lesson-title').textContent = this.config.lesson.title;
        
        // Create module navigation buttons
        this.createModuleNavigation();
        
        // Create module sections
        this.createModuleSections();
        
        // Create word bank
        this.createWordBank();
        
        // Create audio elements
        this.createAudioElements();
    },
    
    // Create module navigation buttons
    createModuleNavigation: function() {
        const navigationContainer = document.getElementById('module-navigation');
        navigationContainer.innerHTML = '';
        
        this.config.lesson.modules.forEach((module, index) => {
            const navButton = document.createElement('button');
            navButton.className = 'nav-btn' + (index === 0 ? ' active' : '');
            navButton.dataset.section = module.id;
            navButton.textContent = module.name;
            navigationContainer.appendChild(navButton);
        });
    },
    
    // Create module sections
    createModuleSections: function() {
        const modulesContainer = document.getElementById('modules-container');
        modulesContainer.innerHTML = '';
        
        this.config.lesson.modules.forEach((module, index) => {
            const moduleSection = document.createElement('section');
            moduleSection.id = module.id;
            moduleSection.className = 'module' + (index === 0 ? ' active' : '');
            
            moduleSection.innerHTML = `
                <h3>${module.title}</h3>
                <div class="${module.id.split('-')[0]}-instructions">
                    ${module.instructions}
                </div>
                <div class="activities-container" id="${module.id}-activities">
                    <!-- Activities will be loaded here -->
                </div>
            `;
            
            modulesContainer.appendChild(moduleSection);
        });
    },
    
    // Create word bank
    createWordBank: function() {
        const wordBank = document.getElementById('word-bank');
        wordBank.innerHTML = '';
        
        this.config.wordBank.categories.forEach(category => {
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'word-category';
            
            const categoryTitle = document.createElement('h5');
            categoryTitle.textContent = category.title;
            categoryDiv.appendChild(categoryTitle);
            
            const wordsDiv = document.createElement('div');
            wordsDiv.className = 'words';
            
            category.words.forEach(word => {
                const wordSpan = document.createElement('span');
                wordSpan.className = 'word';
                wordSpan.textContent = word;
                wordsDiv.appendChild(wordSpan);
            });
            
            categoryDiv.appendChild(wordsDiv);
            wordBank.appendChild(categoryDiv);
        });
    },
    
    // Create audio elements
    createAudioElements: function() {
        const audioContainer = document.getElementById('audio-container');
        if (!audioContainer) {
            const newAudioContainer = document.createElement('div');
            newAudioContainer.id = 'audio-container';
            document.body.appendChild(newAudioContainer);
            audioContainer = newAudioContainer;
        }
        
        audioContainer.innerHTML = '';
        
        // Background music
        const backgroundMusic = document.createElement('audio');
        backgroundMusic.id = 'backgroundMusic';
        backgroundMusic.loop = true;
        const backgroundMusicSource = document.createElement('source');
        backgroundMusicSource.src = this.config.audio.backgroundMusic;
        backgroundMusicSource.type = 'audio/mp3';
        backgroundMusic.appendChild(backgroundMusicSource);
        audioContainer.appendChild(backgroundMusic);
        
        // Sound effects
        for (const [key, value] of Object.entries(this.config.audio.soundEffects)) {
            const soundEffect = document.createElement('audio');
            soundEffect.id = `${key}Sound`;
            const soundEffectSource = document.createElement('source');
            soundEffectSource.src = value;
            soundEffectSource.type = 'audio/mp3';
            soundEffect.appendChild(soundEffectSource);
            audioContainer.appendChild(soundEffect);
        }
    },

    // Load modules dynamically
    loadModules: function() {
        // Load content from data.json
        fetch('reproducibility/data.json')
            .then(response => response.json())
            .then(data => {
                // Initialize each module with its data
                WritingModule.init(data.writingActivities);
                GameModule.init(data.gameActivities);
                SpellingHelper.init(data.spellingActivities);
                RewardSystem.init(data.rewards);
                LessonModule.init(data.lessonActivities);

            })
            .catch(error => {
                console.error('Error loading data:', error);
                // Fallback to sample data if fetch fails
                // this.loadSampleData();
            });
    },

    // Fallback sample data if fetching fails
    loadSampleData: function() {
const sampleData = {
    writingActivities: [
        {
            id: 'writing-1',
            question: 'How often do you read books?',
            image: 'assets/book.jpg',
            hint: 'Think about how many times in a week or month you read books.',
            expectedKeywords: ['always', 'usually', 'sometimes', 'never', 'rarely', 'often', 'every day', 'once a week', 'twice a month']
        },
        {
            id: 'writing-2',
            question: 'How often does your family eat dinner together?',
            image: 'assets/family_dinner.jpg',
            hint: 'Think about your family dinners. Do you eat together every day or only on special occasions?',
            expectedKeywords: ['always', 'usually', 'sometimes', 'never', 'rarely', 'often', 'every day', 'on weekends']
        },
        {
            id: 'writing-3',
            question: 'How often do you play sports?',
            image: 'assets/sports.jpg',
            hint: 'Do you play sports regularly or only occasionally?',
            expectedKeywords: ['always', 'usually', 'sometimes', 'never', 'rarely', 'often', 'every day', 'once a week', 'twice a week', 'on weekends']
        },
        {
            id: 'writing-4',
            question: 'How often do you brush your teeth?',
            image: 'assets/brushing_teeth.jpg',
            hint: 'Think about your morning and night routine.',
            expectedKeywords: ['always', 'usually', 'twice a day', 'every morning', 'every night']
        },
        {
            id: 'writing-5',
            question: 'How often do you visit your grandparents?',
            image: 'assets/grandparents.jpg',
            hint: 'Think about special visits or regular meetings.',
            expectedKeywords: ['every weekend', 'once a month', 'twice a year', 'often', 'rarely']
        }
    ],
    gameActivities: [
        {
            id: 'game-1',
            question: 'Complete the sentence:',
            sentence: 'I ____ brush my teeth ____ before going to bed.',
            options: ['always', 'never', 'every night', 'sometimes', 'rarely'],
            correctAnswer: ['always', 'every night']
        },
        {
            id: 'game-2',
            question: 'Complete the sentence:',
            sentence: 'My brother ____ plays video games ____, but he ____ reads books.',
            options: ['often', 'every day', 'never', 'sometimes', 'rarely', 'usually'],
            correctAnswer: ['often', 'every day', 'rarely']
        },
        {
            id: 'game-3',
            question: 'Match the frequency words with their meanings:',
            pairs: [
                ['always', '100% of the time'],
                ['usually', 'about 80% of the time'],
                ['sometimes', 'about 50% of the time'],
                ['rarely', 'about 20% of the time'],
                ['never', '0% of the time']
            ]
        },
        {
            id: 'game-4',
            question: 'Put these frequency words in order from most often to least often:',
            items: ['never', 'always', 'sometimes', 'usually', 'rarely'],
            correctOrder: ['always', 'usually', 'sometimes', 'rarely', 'never']
        }
    ],
    spellingActivities: [
        {
            id: 'spelling-1',
            word: 'always',
            hint: 'This word means "every time" or "at all times".',
            clue: 'a_w_y_'
        },
        {
            id: 'spelling-2',
            word: 'sometimes',
            hint: 'This word means "occasionally" or "now and then".',
            clue: 's_m_t_m_s'
        },
        {
            id: 'spelling-3',
            word: 'usually',
            hint: 'This word means "most of the time" or "commonly".',
            clue: 'u_u_l_y'
        },
        {
            id: 'spelling-4',
            word: 'breakfast',
            hint: 'The first meal of the day.',
            clue: 'b_e_k_a_t'
        },
        {
            id: 'spelling-5',
            word: 'exercise',
            hint: 'Physical activity to stay healthy.',
            clue: 'e_e_c_s_'
        }
    ],
    rewards: {
        stars: {
            bronze: 5,
            silver: 15,
            gold: 30
        },
        badges: [
            {
                id: 'writer',
                name: 'Writing Star',
                condition: 'Complete all writing activities',
                icon: '✍️'
            },
            {
                id: 'gamer',
                name: 'Game Master',
                condition: 'Complete all word games',
                icon: '🎮'
            },
            {
                id: 'speller',
                name: 'Spelling Champion',
                condition: 'Complete all spelling challenges',
                icon: '🏆'
            }
        ]
    }
};

WritingModule.init(sampleData.writingActivities);
GameModule.init(sampleData.gameActivities);
SpellingHelper.init(sampleData.spellingActivities);
RewardSystem.init(sampleData.rewards);

    },

    // Set up event listeners
    setupEventListeners: function() {
        // Module navigation
        const navButtons = document.querySelectorAll('.nav-btn');
        navButtons.forEach(button => {
            button.addEventListener('click', function() {
                const targetSection = this.getAttribute('data-section');
                App.switchModule(targetSection);
            });
        });

        // Word Bank Toggle
        const toggleWordBank = document.getElementById('toggle-word-bank');
        const wordBank = document.getElementById('word-bank');
        toggleWordBank.addEventListener('click', function() {
            wordBank.style.display = wordBank.style.display === 'none' ? 'flex' : 'none';
        });

        // Hint Toggle
        const hintToggle = document.getElementById('hint-toggle');
        const hintText = document.getElementById('hint-text');
        hintToggle.addEventListener('click', function() {
            hintText.style.display = hintText.style.display === 'block' ? 'none' : 'block';
        });

        // Word click event (to copy to clipboard or textarea)
        const words = document.querySelectorAll('.word');
        words.forEach(word => {
            word.addEventListener('click', function() {
                const activeTextarea = document.querySelector('.module.active textarea');
                if (activeTextarea) {
                    const startPos = activeTextarea.selectionStart;
                    const endPos = activeTextarea.selectionEnd;
                    const textBefore = activeTextarea.value.substring(0, startPos);
                    const textAfter = activeTextarea.value.substring(endPos);
                    
                    activeTextarea.value = textBefore + this.textContent + ' ' + textAfter;
                    activeTextarea.focus();
                    activeTextarea.selectionStart = activeTextarea.selectionEnd = startPos + this.textContent.length + 1;
                }
            });
        });

        // Modal close button
        const closeModal = document.querySelector('.close-modal');
        const feedbackModal = document.getElementById('feedback-modal');
        closeModal.addEventListener('click', function() {
            feedbackModal.style.display = 'none';
        });

        // Continue button in feedback modal
        const feedbackContinue = document.getElementById('feedback-continue');
        feedbackContinue.addEventListener('click', function() {
            feedbackModal.style.display = 'none';
        });
        // Reset progress button
        const resetBtn = document.getElementById('reset-progress');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetProgress());
        }
    },

    // Switch between modules
    switchModule: function(moduleId) {
        // Update active state in UI
        document.querySelectorAll('.module').forEach(module => {
            module.classList.remove('active');
        });
        document.getElementById(moduleId).classList.add('active');

        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-section="${moduleId}"]`).classList.add('active');

        // Update state
        this.state.activeModule = moduleId;
        this.saveState();

        // Reset hint text
        document.getElementById('hint-text').style.display = 'none';
        document.getElementById('hint-text').textContent = '';
    },

    // Show feedback modal
    showFeedback: function(isCorrect, message, reward = null) {
        const feedbackModal = document.getElementById('feedback-modal');
        const feedbackTitle = document.getElementById('feedback-title');
        const feedbackMessage = document.getElementById('feedback-message');
        const feedbackReward = document.getElementById('feedback-reward');

        feedbackTitle.textContent = isCorrect ? 'Great job!' : 'Try again!';
        const soundId = isCorrect ? 'correctSound' : 'wrongSound';
        this.playSound(soundId);
        feedbackMessage.textContent = message;
        
        if (reward) {
            feedbackReward.textContent = reward;
            feedbackReward.style.display = 'block';
        } else {
            feedbackReward.style.display = 'none';
        }

        feedbackModal.style.display = 'flex';


    },

    // Update UI based on state
    updateUI: function() {
        // Update Sound Control
        this.initSoundControl();
        // Update progress bar
        const progressBar = document.getElementById('overall-progress');
        const progressPercent = document.getElementById('progress-percent');
        progressBar.style.width = `${this.state.overallProgress}%`;
        progressPercent.textContent = `${this.state.overallProgress}%`;

        // Update stars
        const starsContainer = document.getElementById('stars-container');
        starsContainer.innerHTML = ''; // Clear existing stars
        for (let i = 0; i < this.state.rewards.stars; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            star.textContent = '⭐';
            starsContainer.appendChild(star);
        }

        // Update badges
        const badgesContainer = document.getElementById('badges-container');
        badgesContainer.innerHTML = ''; // Clear existing badges
        this.state.rewards.badges.forEach(badge => {
            const badgeElement = document.createElement('div');
            badgeElement.className = 'badge';
            badgeElement.textContent = badge.icon;
            badgeElement.title = badge.name;
            badgesContainer.appendChild(badgeElement);
        });
    },

    // Initialize sound control
    initSoundControl: function() {
    const toggleAudioBtn = document.getElementById('toggleAudio');
    const audioIcon = document.getElementById('audioIcon');
    const backgroundMusic = document.getElementById('backgroundMusic');
    
    let audioEnabled = false;
    
    if (toggleAudioBtn && backgroundMusic) {
        toggleAudioBtn.addEventListener('click', function() {
            audioEnabled = !audioEnabled;
            
            if (audioEnabled) {
                backgroundMusic.volume = 0.3; // Set volume to 30%
                backgroundMusic.play().catch(e => {
                    console.warn('Audio playback was prevented:', e);
                    audioEnabled = false;
                });
                audioIcon.className = 'fas fa-volume-up';
            } else {
                backgroundMusic.pause();
                audioIcon.className = 'fas fa-volume-mute';
            }
        });
    }
    },
    // Play sound for activities
    playSound: function(soundId) {
    const sound = document.getElementById(soundId);
    if (sound) {
        sound.currentTime = 0;
        sound.play().catch(e => {
            console.warn('Sound playback was prevented:', e);
        });
    }
    },

    // Update hint text
    updateHint: function(hintText) {
        const hintElement = document.getElementById('hint-text');
        hintElement.textContent = hintText;
    },

    // Calculate overall progress
    calculateProgress: function() {
        // Get total activities count
        const totalActivities = 
            document.querySelectorAll('#writing-activities .activity-card').length +
            document.querySelectorAll('#game-activities .activity-card').length +
            document.querySelectorAll('#spelling-activities .activity-card').length;
        
        if (totalActivities === 0) return 0;

        // Get completed activities count
        const completedCount = Object.keys(this.state.completedActivities).length;
        
        // Calculate percentage
        const progress = Math.floor((completedCount / totalActivities) * 100);
        
        this.state.overallProgress = progress;
        this.saveState();
        
        return progress;
    },

    // Mark activity as completed
    markActivityCompleted: function(activityId) {
        this.state.completedActivities[activityId] = true;
        this.calculateProgress();
        this.updateUI();
        this.saveState();
    },

    // Save state to localStorage
    saveState: function() {
        try {
            localStorage.setItem('englishAdventuresState', JSON.stringify(this.state));
        } catch (e) {
            console.error('Error saving state to localStorage:', e);
        }
    },

    // Load state from localStorage
    loadState: function() {
        try {
            const savedState = localStorage.getItem('englishAdventuresState');
            if (savedState) {
                this.state = JSON.parse(savedState);
                
                // Restore active module
                this.switchModule(this.state.activeModule);
            }
        } catch (e) {
            console.error('Error loading state from localStorage:', e);
        }
    },

    // Reset progress
    resetProgress: function() {
        if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
            // Reset the main application state
            this.state = {
                activeModule: 'writing-module',
                overallProgress: 0,
                completedActivities: {},
                rewards: {
                    stars: 0,
                    badges: []
                }
            };
            
            // Save the reset state
            this.saveState();
            
            // Notify all modules about the reset
            if (typeof WritingModule.reset === 'function') WritingModule.reset();
            if (typeof GameModule.reset === 'function') GameModule.reset();
            if (typeof SpellingHelper.reset === 'function') SpellingHelper.reset();
            if (typeof RewardSystem.reset === 'function') RewardSystem.reset();
            
            // Update the UI
            this.updateUI();
            
            // Reload the modules to get fresh activities
            this.loadModules();
            
            // Show confirmation
            this.showFeedback(true, 'All progress has been reset successfully.');
        }
    }
};