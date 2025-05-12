// Spelling Helper Module
const SpellingHelper = {
    activities: [],
    
    // Initialize the spelling module
    init: function(activities) {
        this.activities = activities;
        this.renderActivities();
    },
    
    // Render spelling activities
    renderActivities: function() {
        const container = document.getElementById('spelling-activities');
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
            questionElement.textContent = activity.hint;
            
            // Create spelling word container
            const spellingContainer = document.createElement('div');
            spellingContainer.className = 'spelling-word-container';
            
            // Create the clue with input fields
            const clueLetters = activity.clue.split('');
            
            clueLetters.forEach((letter, i) => {
                if (letter === '_') {
                    // Create input field for missing letter
                    const input = document.createElement('input');
                    input.className = 'spelling-input';
                    input.type = 'text';
                    input.maxLength = 1;
                    input.setAttribute('data-index', i);
                    
                    if (isCompleted) {
                        input.value = activity.word[i];
                        input.disabled = true;
                    }
                    
                    spellingContainer.appendChild(input);
                } else {
                    // Create span for visible letter
                    const span = document.createElement('div');
                    span.className = 'spelling-letter';
                    span.textContent = letter;
                    spellingContainer.appendChild(span);
                }
            });
            
            // Create buttons container
            const buttonsContainer = document.createElement('div');
            buttonsContainer.className = 'activity-buttons';
            
            const checkButton = document.createElement('button');
            checkButton.className = 'btn submit-btn';
            checkButton.textContent = 'Check Spelling';
            checkButton.disabled = isCompleted;
            
            const revealButton = document.createElement('button');
            revealButton.className = 'btn skip-btn';
            revealButton.textContent = 'Reveal Answer';
            revealButton.disabled = isCompleted;
            
            buttonsContainer.appendChild(checkButton);
            buttonsContainer.appendChild(revealButton);
            
            // Add event listeners
            checkButton.addEventListener('click', () => {
                this.checkSpelling(activity);
            });
            
            revealButton.addEventListener('click', () => {
                this.revealAnswer(activity);
            });
            
            // Connect inputs for better UX (moving to next input when filled)
            const inputs = spellingContainer.querySelectorAll('input');
            inputs.forEach((input, i) => {
                input.addEventListener('input', function() {
                    if (this.value && i < inputs.length - 1) {
                        inputs[i + 1].focus();
                    }
                });
                
                input.addEventListener('keydown', function(e) {
                    // Move to previous input on backspace if current is empty
                    if (e.key === 'Backspace' && !this.value && i > 0) {
                        inputs[i - 1].focus();
                    }
                });
            });
            
            // Append all elements to the activity card
            activityCard.appendChild(header);
            activityCard.appendChild(questionElement);
            activityCard.appendChild(spellingContainer);
            activityCard.appendChild(buttonsContainer);
            
            // Append the activity card to the container
            container.appendChild(activityCard);
        });
    },
    
    // Check if the spelling is correct
    checkSpelling: function(activity) {
        const activityCard = document.getElementById(activity.id);
        const inputs = activityCard.querySelectorAll('.spelling-input');
        
        // Check if all inputs have values
        let allFilled = true;
        inputs.forEach(input => {
            if (!input.value.trim()) {
                allFilled = false;
            }
        });
        
        if (!allFilled) {
            App.showFeedback(false, 'Please fill in all the missing letters.');
            return;
        }
        
        // Construct the user's answer
        let userAnswer = '';
        let correctAnswer = activity.word;
        let letterIndex = 0;
        
        for (let i = 0; i < activity.clue.length; i++) {
            if (activity.clue[i] === '_') {
                userAnswer += inputs[letterIndex].value.toLowerCase();
                letterIndex++;
            } else {
                userAnswer += activity.clue[i].toLowerCase();
            }
        }
        
        if (userAnswer === correctAnswer.toLowerCase()) {
            // Mark activity as completed
            App.markActivityCompleted(activity.id);
            
            // Update UI
            const statusElement = activityCard.querySelector('.activity-status');
            statusElement.textContent = 'Completed';
            statusElement.classList.add('completed');
            
            inputs.forEach(input => {
                input.disabled = true;
                input.style.color = 'green';
            });
            
            const buttons = activityCard.querySelectorAll('.btn');
            buttons.forEach(button => {
                button.disabled = true;
            });
            
            // Show feedback
            App.showFeedback(true, `Correct! The word is "${activity.word}".`, '⭐');
            
            // Award star
            RewardSystem.awardStar();
            
            // Check for spelling badge
            RewardSystem.checkSpellingBadge();
        } else {
            // Show incorrect letters in red
            let hasError = false;
            letterIndex = 0;
            
            for (let i = 0; i < correctAnswer.length; i++) {
                if (activity.clue[i] === '_') {
                    if (inputs[letterIndex].value.toLowerCase() !== correctAnswer[i].toLowerCase()) {
                        inputs[letterIndex].style.color = 'red';
                        hasError = true;
                    } else {
                        inputs[letterIndex].style.color = 'green';
                    }
                    letterIndex++;
                }
            }
            
            // Show feedback
            App.showFeedback(false, 'Some letters are incorrect. Try again!');
        }
    },
    
    // Reveal the correct answer
    revealAnswer: function(activity) {
        const activityCard = document.getElementById(activity.id);
        const inputs = activityCard.querySelectorAll('.spelling-input');
        
        let letterIndex = 0;
        
        for (let i = 0; i < activity.clue.length; i++) {
            if (activity.clue[i] === '_') {
                inputs[letterIndex].value = activity.word[i];
                inputs[letterIndex].disabled = true;
                inputs[letterIndex].style.color = '#999';
                letterIndex++;
            }
        }
        
        // Show feedback
        App.showFeedback(false, `The correct word is "${activity.word}". Try to remember the spelling!`);
    }
};