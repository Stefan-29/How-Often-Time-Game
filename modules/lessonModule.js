// LessonModule - handles the interactive lesson content
const LessonModule = {
    // Store the module data
    data: [],
    currentLessonIndex: 0,
    
    // Initialize the module
    init: function(lessonData) {
        this.data = lessonData;
        this.loadLessons();
        this.setupEventListeners();
    },
    
    // Load lessons into the DOM
    loadLessons: function() {
        const container = document.getElementById('lesson-module-activities');
        if (!container) return;
        
        container.innerHTML = '';
        
        // Create lesson navigation
        const lessonNav = document.createElement('div');
        lessonNav.className = 'lesson-navigation';
        
        const prevBtn = document.createElement('button');
        prevBtn.id = 'prev-lesson';
        prevBtn.className = 'lesson-nav-btn';
        prevBtn.innerHTML = '&laquo; Previous';
        prevBtn.disabled = this.currentLessonIndex === 0;
        
        const nextBtn = document.createElement('button');
        nextBtn.id = 'next-lesson';
        nextBtn.className = 'lesson-nav-btn';
        nextBtn.innerHTML = 'Next &raquo;';
        nextBtn.disabled = this.currentLessonIndex === this.data.length - 1;
        
        const progressInfo = document.createElement('div');
        progressInfo.id = 'lesson-progress';
        progressInfo.className = 'lesson-progress';
        progressInfo.textContent = `Lesson ${this.currentLessonIndex + 1} of ${this.data.length}`;
        
        lessonNav.appendChild(prevBtn);
        lessonNav.appendChild(progressInfo);
        lessonNav.appendChild(nextBtn);
        container.appendChild(lessonNav);
        
        // Create lesson content container
        const lessonContent = document.createElement('div');
        lessonContent.className = 'lesson-content';
        container.appendChild(lessonContent);
        
        // Load the current lesson
        this.loadCurrentLesson();
    },
    
    // Load the current lesson content
    loadCurrentLesson: function() {
        const lessonContent = document.querySelector('#lesson-module-activities .lesson-content');
        if (!lessonContent || !this.data || this.data.length === 0) return;
        
        const lesson = this.data[this.currentLessonIndex];
        
        // Update progress info
        const progressInfo = document.getElementById('lesson-progress');
        if (progressInfo) {
            progressInfo.textContent = `Lesson ${this.currentLessonIndex + 1} of ${this.data.length}`;
        }
        
        // Update nav buttons
        const prevBtn = document.getElementById('prev-lesson');
        const nextBtn = document.getElementById('next-lesson');
        
        if (prevBtn) prevBtn.disabled = this.currentLessonIndex === 0;
        if (nextBtn) nextBtn.disabled = this.currentLessonIndex === this.data.length - 1;
        
        // Build the lesson content
        lessonContent.innerHTML = '';
        
        // Lesson title
        const title = document.createElement('h3');
        title.className = 'lesson-title';
        title.textContent = lesson.title;
        lessonContent.appendChild(title);
        
        // Audio control if available
        // if (lesson.audio) {
        //     const audioControl = document.createElement('div');
        //     audioControl.className = 'audio-control';
            
        //     const playButton = document.createElement('button');
        //     playButton.className = 'play-audio';
        //     playButton.innerHTML = '<i class="fas fa-play"></i> Listen';
        //     playButton.setAttribute('data-audio', lesson.audio);
            
        //     audioControl.appendChild(playButton);
        //     lessonContent.appendChild(audioControl);
        // }
        
        // Lesson content
        const content = document.createElement('div');
        content.className = 'lesson-main-content';
        content.innerHTML = lesson.content;
        lessonContent.appendChild(content);
        
        // Examples section
        if (lesson.examples && lesson.examples.length > 0) {
            const examplesSection = document.createElement('div');
            examplesSection.className = 'examples-section';
            
            const examplesTitle = document.createElement('h4');
            examplesTitle.textContent = 'Examples:';
            examplesSection.appendChild(examplesTitle);
            
            const examplesList = document.createElement('ul');
            examplesList.className = 'examples-list';
            
            lesson.examples.forEach(example => {
                const li = document.createElement('li');
                li.innerHTML = example;
                examplesList.appendChild(li);
            });
            
            examplesSection.appendChild(examplesList);
            lessonContent.appendChild(examplesSection);
        }
        
        // Check understanding section
        const checkSection = document.createElement('div');
        checkSection.className = 'check-understanding';
        
        const checkTitle = document.createElement('h4');
        checkTitle.textContent = 'Check Your Understanding';
        checkSection.appendChild(checkTitle);
        
        const checkButton = document.createElement('button');
        checkButton.className = 'btn check-btn';
        checkButton.textContent = 'Practice Now';
        checkButton.setAttribute('data-lesson-id', lesson.id);
        checkSection.appendChild(checkButton);
        
        lessonContent.appendChild(checkSection);
        
        // Mark as seen - to help track progress
        this.markLessonSeen(lesson.id);
    },
    
    // Set up event listeners for the lesson module
    setupEventListeners: function() {
        // Use event delegation for dynamic elements
        document.addEventListener('click', event => {
            // Previous lesson button
            if (event.target.id === 'prev-lesson' || event.target.closest('#prev-lesson')) {
                this.prevLesson();
            }
            
            // Next lesson button
            if (event.target.id === 'next-lesson' || event.target.closest('#next-lesson')) {
                this.nextLesson();
            }
            
            // Play audio button
            if (event.target.classList.contains('play-audio') || event.target.closest('.play-audio')) {
                const button = event.target.classList.contains('play-audio') ? 
                               event.target : event.target.closest('.play-audio');
                const audioFile = button.getAttribute('data-audio');
                this.playLessonAudio(audioFile);
            }
            
            // Check understanding button
            if (event.target.classList.contains('check-btn') || event.target.closest('.check-btn')) {
                const button = event.target.classList.contains('check-btn') ? 
                               event.target : event.target.closest('.check-btn');
                const lessonId = button.getAttribute('data-lesson-id');
                this.goToPractice(lessonId);
            }
        });
    },
    
    // Navigation methods
    prevLesson: function() {
        if (this.currentLessonIndex > 0) {
            this.currentLessonIndex--;
            this.loadCurrentLesson();
            App.playSound('clickSound');
        }
    },
    
    nextLesson: function() {
        if (this.currentLessonIndex < this.data.length - 1) {
            this.currentLessonIndex++;
            this.loadCurrentLesson();
            App.playSound('clickSound');
        }
    },
    
    // Play lesson audio
    playLessonAudio: function(audioFile) {
        if (!audioFile) return;
        
        // Create an audio element if it doesn't exist
        let audioElement = document.getElementById('lesson-audio-player');
        if (!audioElement) {
            audioElement = document.createElement('audio');
            audioElement.id = 'lesson-audio-player';
            document.body.appendChild(audioElement);
        }
        
        // Set the source and play
        audioElement.src = `assets/audio/${audioFile}`;
        audioElement.play().catch(error => {
            console.warn('Audio playback failed:', error);
        });
    },
    
    // Go to practice for this lesson
    goToPractice: function(lessonId) {
        // Find a related practice activity
        let moduleToSwitch = '';
        let activityToHighlight = '';
        
        // Map lesson IDs to related practice activities
        // This is a simple mapping - you can make it more sophisticated
        switch (lessonId) {
            case 'lesson-1':
            case 'lesson-2':
                moduleToSwitch = 'writing-module';
                // Find a matching writing activity
                activityToHighlight = 'writing-1'; 
                break;
            case 'lesson-3':
                moduleToSwitch = 'game-module';
                activityToHighlight = 'game-3';
                break;
            case 'lesson-4':
                moduleToSwitch = 'game-module';
                activityToHighlight = 'game-4';
                break;
            case 'lesson-5':
                moduleToSwitch = 'spelling-module';
                activityToHighlight = 'spelling-1';
                break;
            default:
                moduleToSwitch = 'writing-module';
        }
        
        // Switch to the appropriate module
        App.switchModule(moduleToSwitch);
        
        // Highlight the related activity if found
        if (activityToHighlight) {
            setTimeout(() => {
                const activityElement = document.getElementById(activityToHighlight);
                if (activityElement) {
                    activityElement.classList.add('highlight-activity');
                    activityElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    
                    // Remove highlight after a few seconds
                    setTimeout(() => {
                        activityElement.classList.remove('highlight-activity');
                    }, 3000);
                }
            }, 300);
        }
    },
    
    // Mark lesson as seen in app state
    markLessonSeen: function(lessonId) {
        if (!App.state.completedActivities) {
            App.state.completedActivities = {};
        }
        
        // Only mark as "seen" not completed
        if (!App.state.seenLessons) {
            App.state.seenLessons = {};
        }
        
        App.state.seenLessons[lessonId] = true;
        App.saveState();
    },
    
    // Reset the module
    reset: function() {
        this.currentLessonIndex = 0;
        
        // Clear seen lessons from app state
        if (App.state.seenLessons) {
            App.state.seenLessons = {};
            App.saveState();
        }
        
        // Reload lessons
        this.loadLessons();
    }
};