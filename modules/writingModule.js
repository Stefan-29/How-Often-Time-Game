// Writing Module
const WritingModule = {
    activities: [],
    
    // Initialize the writing module
    init: function(activities) {
        this.activities = activities;
        this.renderActivities();
    },
    
    // Render writing activities
    renderActivities: function() {
        const container = document.getElementById('writing-activities');
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
            
            // Add image if available
            let imageElement = null;
            if (activity.image) {
                imageElement = document.createElement('img');
                imageElement.className = 'activity-image';
                imageElement.src = activity.image;
                imageElement.alt = 'Activity image';
            }
            
            // Create textarea for answer
            const textarea = document.createElement('textarea');
            textarea.className = 'activity-input';
            textarea.placeholder = 'Type your answer here...';
            textarea.rows = 4;
            if (isCompleted) {
                textarea.disabled = true;
                textarea.placeholder = 'You have completed this activity!';
            }
            
            // Create buttons container
            const buttonsContainer = document.createElement('div');
            buttonsContainer.className = 'activity-buttons';
            
            const submitButton = document.createElement('button');
            submitButton.className = 'btn submit-btn';
            submitButton.textContent = 'Submit';
            submitButton.disabled = isCompleted;
            
            const skipButton = document.createElement('button');
            skipButton.className = 'btn skip-btn';
            skipButton.textContent = 'Skip';
            skipButton.disabled = isCompleted;
            
            buttonsContainer.appendChild(submitButton);
            buttonsContainer.appendChild(skipButton);
            
            // Add event listeners
            submitButton.addEventListener('click', () => {
                this.checkAnswer(activity, textarea.value);
            });
            
            skipButton.addEventListener('click', () => {
                this.skipActivity(activity);
                App.showFeedback(false, 'You skipped this activity. Try it later!');
            });
            
            textarea.addEventListener('focus', () => {
                if (activity.hint) {
                    App.updateHint(activity.hint);
                }
            });
            
            // Append all elements to the activity card
            activityCard.appendChild(header);
            activityCard.appendChild(questionElement);
            if (imageElement) activityCard.appendChild(imageElement);
            activityCard.appendChild(textarea);
            activityCard.appendChild(buttonsContainer);
            
            // Append the activity card to the container
            container.appendChild(activityCard);
        });
    },
    
    // Check if the answer is correct
    checkAnswer: function(activity, answer) {
        if (!answer.trim()) {
            App.showFeedback(false, 'Please write something before submitting.');
            return;
        }
        
        // Check if answer contains expected keywords
        const lowerAnswer = answer.toLowerCase();
        const containsKeyword = activity.expectedKeywords.some(keyword => 
            lowerAnswer.includes(keyword.toLowerCase())
        );
        
        // Check if answer starts with "I" or contains "I"
        const startsWithI = lowerAnswer.startsWith('i ');
        const containsI = lowerAnswer.includes(' i ');
        
        // Check if answer contains "How often"
        const containsHowOften = lowerAnswer.includes('how often');
        
        // Simple check for sentence structure - must have at least 5 words
        const wordCount = answer.trim().split(/\s+/).length;
        const hasSentenceStructure = wordCount >= 5;
        
        if (containsKeyword && hasSentenceStructure) {
            // Mark activity as completed
            App.markActivityCompleted(activity.id);
            
            // Update UI
            const activityCard = document.getElementById(activity.id);
            const statusElement = activityCard.querySelector('.activity-status');
            statusElement.textContent = 'Completed';
            statusElement.classList.add('completed');
            
            const textarea = activityCard.querySelector('.activity-input');
            textarea.disabled = true;
            
            const buttons = activityCard.querySelectorAll('.btn');
            buttons.forEach(button => {
                button.disabled = true;
            });
            
            // Show feedback
            App.showFeedback(true, 'Great job! You used adverbs of frequency correctly!', '⭐');
            
            // Award star
            RewardSystem.awardStar();
            
            // Check for writing badge
            RewardSystem.checkWritingBadge();
        } else {
            // Show feedback with hints
            let feedbackMessage = 'Try again! ';
            
            if (!containsKeyword) {
                feedbackMessage += 'Remember to use adverbs of frequency like "always", "sometimes", "never", etc. ';
            }
            
            if (!hasSentenceStructure) {
                feedbackMessage += 'Write a complete sentence with at least 5 words. ';
            }
            
            App.showFeedback(false, feedbackMessage);
        }
    },
    
    // Skip the activity
    skipActivity: function(activity) {
        // Update UI to show skipped
        const activityCard = document.getElementById(activity.id);
        const statusElement = activityCard.querySelector('.activity-status');
        statusElement.textContent = 'Skipped';
        
        const textarea = activityCard.querySelector('.activity-input');
        textarea.placeholder = 'You skipped this activity. Try it later!';
    }
};