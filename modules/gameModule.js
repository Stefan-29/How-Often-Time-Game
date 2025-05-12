// Game Module
const GameModule = {
    activities: [],
    
    // Initialize the game module
    init: function(activities) {
        this.activities = activities;
        this.renderActivities();
    },
    
    // Render game activities
    renderActivities: function() {
        const container = document.getElementById('game-activities');
        container.innerHTML = ''; // Clear existing content
        
        this.activities.forEach((activity, index) => {
            const isCompleted = App.state.completedActivities[activity.id] || false;
            
            const activityCard = document.createElement('div');
            activityCard.className = 'activity-card';
            activityCard.id = activity.id;
            
            // Create activity header
            const header = document.createElement('div');
            header.className = 'activity-header';
            
            const activityNumber = document.createElement('div');
            activityNumber.className = 'activity-number';
            activityNumber.textContent = `Activity ${index + 1}`;
            
            const activityStatus = document.createElement('div');
            activityStatus.className = 'activity-status';
            activityStatus.textContent = isCompleted ? 'Completed' : 'Not completed';
            if (isCompleted) activityStatus.classList.add('completed');
            
            header.appendChild(activityNumber);
            header.appendChild(activityStatus);
            
            // Create activity content
            const questionElement = document.createElement('div');
            questionElement.className = 'activity-question';
            questionElement.textContent = activity.question;
            
            // Create sentence with drop zones
            const sentenceContainer = document.createElement('div');
            sentenceContainer.className = 'sentence-container';
            
            // Split the sentence by the placeholders
            const sentenceParts = activity.sentence.split('____');
            const sentenceElement = document.createElement('div');
            sentenceElement.className = 'sentence';
            
            // Add sentence parts and drop zones
            for (let i = 0; i < sentenceParts.length; i++) {
                // Add text part
                const textPart = document.createElement('span');
                textPart.textContent = sentenceParts[i];
                sentenceElement.appendChild(textPart);
                
                // Add drop zone (except after the last text part)
                if (i < sentenceParts.length - 1) {
                    const dropZone = document.createElement('div');
                    dropZone.className = 'drop-zone';
                    dropZone.setAttribute('data-index', i);
                    dropZone.addEventListener('dragover', this.handleDragOver);
                    dropZone.addEventListener('drop', (e) => this.handleDrop(e, activity));
                    dropZone.addEventListener('dragenter', this.handleDragEnter);
                    dropZone.addEventListener('dragleave', this.handleDragLeave);
                    
                    if (isCompleted) {
                        dropZone.textContent = activity.correctAnswer[i];
                        dropZone.classList.add('correct');
                    }
                    
                    sentenceElement.appendChild(dropZone);
                }
            }
            
            sentenceContainer.appendChild(sentenceElement);
            
            // Create drag options
            const dragContainer = document.createElement('div');
            dragContainer.className = 'drag-container';
            
            // Shuffle options
            const shuffledOptions = [...activity.options];
            this.shuffleArray(shuffledOptions);
            
            // Add draggable words
            shuffledOptions.forEach(option => {
                const draggable = document.createElement('div');
                draggable.className = 'draggable';
                draggable.textContent = option;
                draggable.setAttribute('draggable', !isCompleted);
                draggable.addEventListener('dragstart', this.handleDragStart);
                
                if (isCompleted) {
                    draggable.style.opacity = '0.5';
                }
                
                dragContainer.appendChild(draggable);
            });
            
            // Create buttons container
            const buttonsContainer = document.createElement('div');
            buttonsContainer.className = 'activity-buttons';
            
            const checkButton = document.createElement('button');
            checkButton.className = 'btn submit-btn';
            checkButton.textContent = 'Check Answer';
            checkButton.disabled = isCompleted;
            
            const resetButton = document.createElement('button');
            resetButton.className = 'btn skip-btn';
            resetButton.textContent = 'Reset';
            resetButton.disabled = isCompleted;
            
            buttonsContainer.appendChild(checkButton);
            buttonsContainer.appendChild(resetButton);
            
            // Add event listeners
            checkButton.addEventListener('click', () => {
                this.checkAnswer(activity);
            });
            
            resetButton.addEventListener('click', () => {
                this.resetActivity(activity);
            });
            
            // Append all elements to the activity card
            activityCard.appendChild(header);
            activityCard.appendChild(questionElement);
            activityCard.appendChild(sentenceContainer);
            activityCard.appendChild(dragContainer);
            activityCard.appendChild(buttonsContainer);
            
            // Append the activity card to the container
            container.appendChild(activityCard);
        });
    },
    
    // Handle drag start
    handleDragStart: function(e) {
        e.dataTransfer.setData('text/plain', e.target.textContent);
        e.dataTransfer.effectAllowed = 'move';
        e.target.style.opacity = '0.4';
    },
    
    // Handle drag over
    handleDragOver: function(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    },
    
    // Handle drag enter
    handleDragEnter: function(e) {
        e.preventDefault();
        this.classList.add('active');
    },
    
    // Handle drag leave
    handleDragLeave: function(e) {
        this.classList.remove('active');
    },
    
    // Handle drop
    handleDrop: function(e, activity) {
        e.preventDefault();
        const dropZone = e.target;
        dropZone.classList.remove('active');
        
        const word = e.dataTransfer.getData('text/plain');
        dropZone.textContent = word;
        
        // Remove the drag effect from the original draggable
        document.querySelectorAll('.draggable').forEach(draggable => {
            draggable.style.opacity = '1';
        });
    },
    
    // Check if the answer is correct
    checkAnswer: function(activity) {
        const activityCard = document.getElementById(activity.id);
        const dropZones = activityCard.querySelectorAll('.drop-zone');
        
        // Check if all drop zones have words
        let allFilled = true;
        dropZones.forEach(zone => {
            if (!zone.textContent.trim()) {
                allFilled = false;
            }
        });
        
        if (!allFilled) {
            App.showFeedback(false, 'Please fill in all blank spaces before checking.');
            return;
        }
        
        // Check if answers are correct
        let allCorrect = true;
        dropZones.forEach((zone, index) => {
            const userAnswer = zone.textContent.trim();
            const correctAnswer = activity.correctAnswer[index];
            
            if (userAnswer.toLowerCase() === correctAnswer.toLowerCase()) {
                zone.classList.add('correct');
            } else {
                zone.classList.add('incorrect');
                allCorrect = false;
            }
        });
        
        if (allCorrect) {
            // Mark activity as completed
            App.markActivityCompleted(activity.id);
            
            // Update UI
            const statusElement = activityCard.querySelector('.activity-status');
            statusElement.textContent = 'Completed';
            statusElement.classList.add('completed');
            
            const buttons = activityCard.querySelectorAll('.btn');
            buttons.forEach(button => {
                button.disabled = true;
            });
            
            const draggables = activityCard.querySelectorAll('.draggable');
            draggables.forEach(draggable => {
                draggable.setAttribute('draggable', false);
                draggable.style.opacity = '0.5';
            });
            
            // Show feedback
            App.showFeedback(true, 'Great job! All answers are correct!', '⭐');
            
            // Award star
            RewardSystem.awardStar();
            
            // Check for game badge
            RewardSystem.checkGameBadge();
        } else {
            // Show feedback
            App.showFeedback(false, 'Some answers are incorrect. Try again!');
        }
    },
    
    // Reset the activity
    resetActivity: function(activity) {
        const activityCard = document.getElementById(activity.id);
        const dropZones = activityCard.querySelectorAll('.drop-zone');
        
        // Clear and reset drop zones
        dropZones.forEach(zone => {
            zone.textContent = '';
            zone.classList.remove('correct', 'incorrect');
        });
    },
    
    // Shuffle array (Fisher-Yates algorithm)
    shuffleArray: function(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
};