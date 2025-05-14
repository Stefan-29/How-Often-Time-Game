// ConfigManager.js - Module for managing configuration data
const ConfigManager = {
    // Default configuration that will be used if config.json cannot be loaded
    defaultConfig: {
        "siteSettings": {
            "title": "English Adventures",
            "favicon": "favicon.ico"
        },
        "lesson": {
            "title": "How Often?",
            "modules": [
                {
                    "id": "lesson-module",
                    "name": "Learn",
                    "title": "How Often?",
                    "instructions": "Learn about adverbs of frequency and how to use them correctly."
                },
                {
                    "id": "writing-module",
                    "name": "Write",
                    "title": "Writing Practice",
                    "instructions": "Answer questions using adverbs of frequency and time."
                },
                {
                    "id": "game-module", 
                    "name": "Play",
                    "title": "Word Games",
                    "instructions": "Drag and drop the correct words to complete sentences."
                },
                {
                    "id": "spelling-module",
                    "name": "Spell",
                    "title": "Spelling Challenge",
                    "instructions": "Practice spelling frequency adverbs correctly."
                }
            ]
        },
        "wordBank": {
            "categories": [
                {
                    "title": "Frequency Adverbs",
                    "words": ["always", "usually", "often", "sometimes", "rarely", "never"]
                },
                {
                    "title": "Time Expressions",
                    "words": ["every day", "once a week", "twice a month", "on weekends", "in the morning", "at night"]
                }
            ]
        },
        "audio": {
            "backgroundMusic": "sounds/background-music.mp3",
            "soundEffects": {
                "correct": "sounds/correct-answer.mp3",
                "wrong": "sounds/wrong-answer.mp3",
                "cheering": "sounds/cheering.mp3"
            }
        }
    },
    
    // Get default configuration
    getDefaultConfig: function() {
        return JSON.parse(JSON.stringify(this.defaultConfig)); // Return a copy to prevent modification
    },
    
    // Load configuration from file or use default
    loadConfig: function() {
        return new Promise((resolve, reject) => {
            fetch('config.json')
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Config file not found');
                    }
                    return response.json();
                })
                .then(config => {
                    resolve(config);
                })
                .catch(error => {
                    console.warn('Error loading config file:', error);
                    console.info('Using default configuration');
                    resolve(this.getDefaultConfig());
                });
        });
    },
    
    // Validate configuration data
    validateConfig: function(config) {
        // Check for required top-level properties
        const requiredProps = ['siteSettings', 'lesson', 'wordBank', 'audio'];
        for (const prop of requiredProps) {
            if (!config.hasOwnProperty(prop)) {
                console.error(`Missing required property: ${prop}`);
                return false;
            }
        }
        
        // Check for required site settings
        if (!config.siteSettings.title) {
            console.error('Missing site title');
            return false;
        }
        
        // Check for required lesson properties
        if (!config.lesson.title || !Array.isArray(config.lesson.modules) || config.lesson.modules.length === 0) {
            console.error('Invalid lesson configuration');
            return false;
        }
        
        // Check module structure
        for (const module of config.lesson.modules) {
            if (!module.id || !module.name || !module.title || !module.instructions) {
                console.error('Invalid module configuration:', module);
                return false;
            }
        }
        
        // Check word bank structure
        if (!Array.isArray(config.wordBank.categories) || config.wordBank.categories.length === 0) {
            console.error('Invalid word bank configuration');
            return false;
        }
        
        // Check audio configuration
        if (!config.audio.backgroundMusic || !config.audio.soundEffects) {
            console.error('Invalid audio configuration');
            return false;
        }
        
        return true;
    },
    
    // Create config.json template file
    createConfigTemplate: function() {
        const configJson = JSON.stringify(this.defaultConfig, null, 2);
        const blob = new Blob([configJson], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'config.json';
        a.click();
        
        URL.revokeObjectURL(url);
    },
    
    // Update configuration with new values
    updateConfig: function(newConfig) {
        // Validate new config
        if (!this.validateConfig(newConfig)) {
            console.error('Invalid configuration provided');
            return false;
        }
        
        // In a real application, you might save the updated config to the server
        // For this example, we'll just return success
        return true;
    }
};