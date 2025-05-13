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
            
            // Create game content based on type
            const gameContent = document.createElement('div');
            gameContent.className = 'game-content';
            
            // Render appropriate game type
            switch(activity.type) {
                case 'drag-drop':
                    this.renderDragDropActivity(gameContent, activity, isCompleted);
                    break;
                case 'matching':
                    this.renderMatchingActivity(gameContent, activity, isCompleted);
                    break;
                case 'ordering':
                    this.renderOrderingActivity(gameContent, activity, isCompleted);
                    break;
                default:
                    gameContent.textContent = 'Unsupported activity type';
            }
            
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
            activityCard.appendChild(gameContent);
            activityCard.appendChild(buttonsContainer);
            
            // Append the activity card to the container
            container.appendChild(activityCard);
        });
    },
    
    // Render drag-drop type activity
    renderDragDropActivity: function(container, activity, isCompleted) {
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
                dropZone.setAttribute('data-type', 'drag-drop');
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
        
        container.appendChild(sentenceContainer);
        container.appendChild(dragContainer);
    },
    
    // Render matching type activity
    renderMatchingActivity: function(container, activity, isCompleted) {
        const matchingContainer = document.createElement('div');
        matchingContainer.className = 'matching-container';
        
        // Create two columns for matching
        const leftColumn = document.createElement('div');
        leftColumn.className = 'matching-column left-column';
        
        const rightColumn = document.createElement('div');
        rightColumn.className = 'matching-column right-column';
        
        // Shuffle options for left column
        const leftOptions = activity.options.map(pair => pair[0]);
        const shuffledLeftOptions = [...leftOptions];
        this.shuffleArray(shuffledLeftOptions);
        
        // Shuffle options for right column
        const rightOptions = activity.options.map(pair => pair[1]);
        const shuffledRightOptions = [...rightOptions];
        this.shuffleArray(shuffledRightOptions);
        
        // Create the connection lines container
        const linesContainer = document.createElement('div');
        linesContainer.className = 'connection-lines';
        matchingContainer.appendChild(linesContainer);
        
        // Track the items by unique ids for matching
        const itemIds = new Map();
        let idCounter = 0;
        
        // Add items to left column
        shuffledLeftOptions.forEach((item, index) => {
            const itemElement = document.createElement('div');
            itemElement.className = 'matching-item left-item';
            itemElement.textContent = item;
            itemElement.setAttribute('data-value', item);
            const itemId = `left-${idCounter++}`;
            itemElement.id = itemId;
            itemIds.set(item, itemId);
            
            if (!isCompleted) {
                itemElement.addEventListener('click', (e) => this.handleMatchingItemClick(e.target, 'left'));
            } else {
                // If completed, show correct matches
                const correctPair = activity.correctAnswer.find(pair => pair[0] === item);
                if (correctPair) {
                    itemElement.classList.add('matched');
                }
            }
            
            leftColumn.appendChild(itemElement);
        });
        
        // Add items to right column
        shuffledRightOptions.forEach((item, index) => {
            const itemElement = document.createElement('div');
            itemElement.className = 'matching-item right-item';
            itemElement.textContent = item;
            itemElement.setAttribute('data-value', item);
            const itemId = `right-${idCounter++}`;
            itemElement.id = itemId;
            
            if (!isCompleted) {
                itemElement.addEventListener('click', (e) => this.handleMatchingItemClick(e.target, 'right'));
            } else {
                // If completed, show correct matches
                const correctPair = activity.correctAnswer.find(pair => pair[1] === item);
                if (correctPair) {
                    itemElement.classList.add('matched');
                }
            }
            
            rightColumn.appendChild(itemElement);
        });
        
        // If the activity is completed, draw lines between matched pairs
        if (isCompleted) {
            activity.correctAnswer.forEach(pair => {
                const leftItem = leftColumn.querySelector(`[data-value="${pair[0]}"]`);
                const rightItem = rightColumn.querySelector(`[data-value="${pair[1]}"]`);
                
                if (leftItem && rightItem) {
                    this.drawConnectionLine(leftItem, rightItem, linesContainer, true);
                }
            });
        }
        
        // Add columns to container
        matchingContainer.appendChild(leftColumn);
        matchingContainer.appendChild(rightColumn);
        
        container.appendChild(matchingContainer);
        
        // Add data to track matches
        matchingContainer.dataset.matches = JSON.stringify([]);
    },
    
    // Render ordering type activity
    renderOrderingActivity: function(container, activity, isCompleted) {
        const orderingContainer = document.createElement('div');
        orderingContainer.className = 'ordering-container';
        orderingContainer.setAttribute('data-type', 'ordering');
        
        // Create drop zone for ordered items
        const orderZone = document.createElement('div');
        orderZone.className = 'order-zone';
        
        // Create options container
        const optionsContainer = document.createElement('div');
        optionsContainer.className = 'ordering-options';
        
        // If completed, show correct order
        if (isCompleted) {
            activity.correctAnswer.forEach(item => {
                const orderItem = document.createElement('div');
                orderItem.className = 'order-item correct';
                orderItem.textContent = item;
                orderZone.appendChild(orderItem);
            });
        } else {
            // Shuffle options
            const shuffledOptions = [...activity.options];
            this.shuffleArray(shuffledOptions);
            
            // Add draggable options
            shuffledOptions.forEach(option => {
                const draggable = document.createElement('div');
                draggable.className = 'draggable order-item';
                draggable.textContent = option;
                draggable.setAttribute('draggable', true);
                draggable.addEventListener('dragstart', (e) => this.handleOrderDragStart(e));
                
                optionsContainer.appendChild(draggable);
            });
            
            // Setup drop zone events
            orderZone.addEventListener('dragover', this.handleDragOver);
            orderZone.addEventListener('drop', (e) => this.handleOrderDrop(e, orderZone));
            orderZone.addEventListener('dragenter', this.handleDragEnter);
            orderZone.addEventListener('dragleave', this.handleDragLeave);
        }
        
        orderingContainer.appendChild(orderZone);
        if (!isCompleted) {
            orderingContainer.appendChild(optionsContainer);
        }
        
        container.appendChild(orderingContainer);
    },
    
    // Handle drag start for drag-drop
    handleDragStart: function(e) {
        e.dataTransfer.setData('text/plain', e.target.textContent);
        e.dataTransfer.effectAllowed = 'move';
        e.target.style.opacity = '0.4';
    },
    
    // Handle drag start for ordering
    handleOrderDragStart: function(e) {
        e.dataTransfer.setData('text/plain', e.target.textContent);
        e.dataTransfer.effectAllowed = 'move';
        e.target.style.opacity = '0.4';
        e.target.classList.add('being-dragged');
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
    
    // Handle drop for drag-drop
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
    
    // Handle drop for ordering
    handleOrderDrop: function(e, orderZone) {
        e.preventDefault();
        orderZone.classList.remove('active');
        
        const word = e.dataTransfer.getData('text/plain');
        
        // Create a new order item
        const orderItem = document.createElement('div');
        orderItem.className = 'order-item';
        orderItem.textContent = word;
        orderItem.setAttribute('draggable', true);
        orderItem.addEventListener('dragstart', (e) => this.handleOrderDragStart(e));
        
        // Add the new order item to order zone
        orderZone.appendChild(orderItem);
        
        // Find and remove the original dragged item
        const draggedItem = document.querySelector('.being-dragged');
        if (draggedItem) {
            draggedItem.remove();
        }
        
        // Reset draggable items
        document.querySelectorAll('.draggable').forEach(draggable => {
            draggable.style.opacity = '1';
            draggable.classList.remove('being-dragged');
        });
    },
    
    // Handle matching item click
    handleMatchingItemClick: function(item, column) {
        const activityCard = item.closest('.activity-card');
        const matchingContainer = item.closest('.matching-container');
        const linesContainer = matchingContainer.querySelector('.connection-lines');
        
        // If no item is selected yet in this column
        if (!matchingContainer.querySelector(`.${column}-item.selected`)) {
            // Remove selection from other column if already has selected item
            const otherColumn = column === 'left' ? 'right' : 'left';
            const otherSelected = matchingContainer.querySelector(`.${otherColumn}-item.selected`);
            
            item.classList.add('selected');
            
            // If there's a selected item in the other column, create a match
            if (otherSelected) {
                const leftItem = column === 'left' ? item : otherSelected;
                const rightItem = column === 'right' ? item : otherSelected;
                
                // Clear both selections
                leftItem.classList.remove('selected');
                rightItem.classList.remove('selected');
                
                // Mark as matched
                leftItem.classList.add('matched');
                rightItem.classList.add('matched');
                
                // Draw connection line
                this.drawConnectionLine(leftItem, rightItem, linesContainer);
                
                // Store the match
                const matchesData = JSON.parse(matchingContainer.dataset.matches || '[]');
                matchesData.push({
                    left: leftItem.getAttribute('data-value'),
                    right: rightItem.getAttribute('data-value')
                });
                matchingContainer.dataset.matches = JSON.stringify(matchesData);
            }
        } else {
            // If already selected in this column, deselect
            item.classList.remove('selected');
        }
    },
    
    // Draw a connection line between two matching items
    drawConnectionLine: function(leftItem, rightItem, linesContainer, isCorrect = false) {
        const line = document.createElement('div');
        line.className = 'connection-line';
        if (isCorrect) line.classList.add('correct');
        
        // Calculate positions
        const leftRect = leftItem.getBoundingClientRect();
        const rightRect = rightItem.getBoundingClientRect();
        const containerRect = linesContainer.getBoundingClientRect();
        
        // Start and end points relative to the lines container
        const startX = leftRect.right - containerRect.left;
        const startY = leftRect.top + leftRect.height / 2 - containerRect.top;
        const endX = rightRect.left - containerRect.left;
        const endY = rightRect.top + rightRect.height / 2 - containerRect.top;
        
        // Set line position and angle
        const length = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
        const angle = Math.atan2(endY - startY, endX - startX) * 180 / Math.PI;
        
        line.style.width = `${length}px`;
        line.style.left = `${startX}px`;
        line.style.top = `${startY}px`;
        line.style.transform = `rotate(${angle}deg)`;
        line.style.transformOrigin = '0 0';
        
        linesContainer.appendChild(line);
        
        return line;
    },
    
    // Check if the answer is correct
    checkAnswer: function(activity) {
        const activityCard = document.getElementById(activity.id);
        
        switch(activity.type) {
            case 'drag-drop':
                this.checkDragDropAnswer(activity, activityCard);
                break;
            case 'matching':
                this.checkMatchingAnswer(activity, activityCard);
                break;
            case 'ordering':
                this.checkOrderingAnswer(activity, activityCard);
                break;
            default:
                App.showFeedback(false, 'Unsupported activity type');
        }
    },
    
    // Check drag-drop answer
    checkDragDropAnswer: function(activity, activityCard) {
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
        
        this.handleActivityCompletion(activity, activityCard, allCorrect);
    },
    
    // Check matching answer
    checkMatchingAnswer: function(activity, activityCard) {
        const matchingContainer = activityCard.querySelector('.matching-container');
        const matches = JSON.parse(matchingContainer.dataset.matches || '[]');
        
        // Check if all items are matched
        if (matches.length !== activity.options.length) {
            App.showFeedback(false, 'Please match all items before checking.');
            return;
        }
        
        // Check if matches are correct
        let allCorrect = true;
        
        // Convert correctAnswer to a format that's easier to check against
        const correctMatches = activity.correctAnswer.map(pair => ({
            left: pair[0],
            right: pair[1]
        }));
        
        // Check each user match against correct matches
        matches.forEach(match => {
            const isCorrectMatch = correctMatches.some(
                correctMatch => 
                    correctMatch.left.toLowerCase() === match.left.toLowerCase() && 
                    correctMatch.right.toLowerCase() === match.right.toLowerCase()
            );
            
            if (!isCorrectMatch) {
                allCorrect = false;
                
                // Mark incorrect matches
                const leftItem = matchingContainer.querySelector(`.left-item[data-value="${match.left}"]`);
                const rightItem = matchingContainer.querySelector(`.right-item[data-value="${match.right}"]`);
                
                if (leftItem && rightItem) {
                    leftItem.classList.add('incorrect');
                    rightItem.classList.add('incorrect');
                }
            }
        });
        
        this.handleActivityCompletion(activity, activityCard, allCorrect);
    },
    
    // Check ordering answer
    checkOrderingAnswer: function(activity, activityCard) {
        const orderZone = activityCard.querySelector('.order-zone');
        const orderItems = orderZone.querySelectorAll('.order-item');
        
        // Check if all items are placed in order
        if (orderItems.length !== activity.options.length) {
            App.showFeedback(false, 'Please place all items in order before checking.');
            return;
        }
        
        // Check if the order is correct
        let allCorrect = true;
        const userOrder = Array.from(orderItems).map(item => item.textContent);
        
        userOrder.forEach((item, index) => {
            const correctItem = activity.correctAnswer[index];
            const orderItem = orderItems[index];
            
            if (item.toLowerCase() === correctItem.toLowerCase()) {
                orderItem.classList.add('correct');
            } else {
                orderItem.classList.add('incorrect');
                allCorrect = false;
            }
        });
        
        this.handleActivityCompletion(activity, activityCard, allCorrect);
    },
    
    // Handle activity completion
    handleActivityCompletion: function(activity, activityCard, isCorrect) {
        if (isCorrect) {
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
            
            // Disable dragging
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
        
        switch(activity.type) {
            case 'drag-drop':
                this.resetDragDropActivity(activity, activityCard);
                break;
            case 'matching':
                this.resetMatchingActivity(activity, activityCard);
                break;
            case 'ordering':
                this.resetOrderingActivity(activity, activityCard);
                break;
        }
    },
    
    // Reset drag-drop activity
    resetDragDropActivity: function(activity, activityCard) {
        const dropZones = activityCard.querySelectorAll('.drop-zone');
        
        // Clear and reset drop zones
        dropZones.forEach(zone => {
            zone.textContent = '';
            zone.classList.remove('correct', 'incorrect');
        });
    },
    
    // Reset matching activity
    resetMatchingActivity: function(activity, activityCard) {
        const matchingContainer = activityCard.querySelector('.matching-container');
        const linesContainer = matchingContainer.querySelector('.connection-lines');
        const leftItems = matchingContainer.querySelectorAll('.left-item');
        const rightItems = matchingContainer.querySelectorAll('.right-item');
        
        // Clear all lines
        linesContainer.innerHTML = '';
        
        // Reset all items
        leftItems.forEach(item => {
            item.classList.remove('selected', 'matched', 'incorrect');
        });
        
        rightItems.forEach(item => {
            item.classList.remove('selected', 'matched', 'incorrect');
        });
        
        // Clear matches data
        matchingContainer.dataset.matches = JSON.stringify([]);
    },
    
    // Reset ordering activity
    resetOrderingActivity: function(activity, activityCard) {
        const orderingContainer = activityCard.querySelector('.ordering-container');
        const orderZone = orderingContainer.querySelector('.order-zone');
        const optionsContainer = orderingContainer.querySelector('.ordering-options');
        
        // Get all ordered items
        const orderedItems = Array.from(orderZone.querySelectorAll('.order-item'));
        
        // Clear order zone
        orderZone.innerHTML = '';
        
        // Move items back to options
        orderedItems.forEach(item => {
            const draggable = document.createElement('div');
            draggable.className = 'draggable order-item';
            draggable.textContent = item.textContent;
            draggable.setAttribute('draggable', true);
            draggable.addEventListener('dragstart', (e) => this.handleOrderDragStart(e));
            draggable.classList.remove('correct', 'incorrect');
            
            optionsContainer.appendChild(draggable);
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