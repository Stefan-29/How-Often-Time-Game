// Reward System Module
const RewardSystem = {
    rewards: null,
    
    // Initialize the reward system
    init: function(rewardsConfig) {
        this.rewards = rewardsConfig;
    },
    
    // Award a star for completing an activity
    awardStar: function() {
        App.state.rewards.stars += 1;
        
        // Check if we reached a star milestone
        this.checkStarMilestones();
        
        // Update UI
        App.updateUI();
        App.saveState();
    },
    
    // Check for star milestones
    checkStarMilestones: function() {
        if (this.rewards) {
            const { bronze, silver, gold } = this.rewards.stars;
            const currentStars = App.state.rewards.stars;
            
            if (currentStars === bronze) {
                this.showAchievement('Bronze Star Achievement', 'You earned your first bronze star milestone!', '🥉');
            } else if (currentStars === silver) {
                this.showAchievement('Silver Star Achievement', 'You reached the silver star milestone!', '🥈');
            } else if (currentStars === gold) {
                this.showAchievement('Gold Star Achievement', 'Congratulations! You reached the gold star milestone!', '🥇');
            }
        }
    },
    
    // Check for writing badge
    checkWritingBadge: function() {
        // Find all writing activities
        const writingActivities = document.querySelectorAll('#writing-activities .activity-card');
        let allCompleted = true;
        
        writingActivities.forEach(activity => {
            const status = activity.querySelector('.activity-status');
            if (!status.classList.contains('completed')) {
                allCompleted = false;
            }
        });
        
        if (allCompleted && writingActivities.length > 0) {
            // Find the writer badge
            const writerBadge = this.rewards.badges.find(badge => badge.id === 'writer');
            
            // Check if badge already awarded
            const badgeAwarded = App.state.rewards.badges.some(badge => badge.id === 'writer');
            
            if (writerBadge && !badgeAwarded) {
                this.awardBadge(writerBadge);
            }
        }
    },
    
    // Check for game badge
    checkGameBadge: function() {
        // Find all game activities
        const gameActivities = document.querySelectorAll('#game-activities .activity-card');
        let allCompleted = true;
        
        gameActivities.forEach(activity => {
            const status = activity.querySelector('.activity-status');
            if (!status.classList.contains('completed')) {
                allCompleted = false;
            }
        });
        
        if (allCompleted && gameActivities.length > 0) {
            // Find the gamer badge
            const gamerBadge = this.rewards.badges.find(badge => badge.id === 'gamer');
            
            // Check if badge already awarded
            const badgeAwarded = App.state.rewards.badges.some(badge => badge.id === 'gamer');
            
            if (gamerBadge && !badgeAwarded) {
                this.awardBadge(gamerBadge);
            }
        }
    },
    
    // Check for spelling badge
    checkSpellingBadge: function() {
        // Find all spelling activities
        const spellingActivities = document.querySelectorAll('#spelling-activities .activity-card');
        let allCompleted = true;
        
        spellingActivities.forEach(activity => {
            const status = activity.querySelector('.activity-status');
            if (!status.classList.contains('completed')) {
                allCompleted = false;
            }
        });
        
        if (allCompleted && spellingActivities.length > 0) {
            // Find the speller badge
            const spellerBadge = this.rewards.badges.find(badge => badge.id === 'speller');
            
            // Check if badge already awarded
            const badgeAwarded = App.state.rewards.badges.some(badge => badge.id === 'speller');
            
            if (spellerBadge && !badgeAwarded) {
                this.awardBadge(spellerBadge);
            }
        }
    },
    
    // Award a badge
    awardBadge: function(badge) {
        // Add badge to state
        App.state.rewards.badges.push({
            id: badge.id,
            name: badge.name,
            icon: badge.icon
        });
        
        // Show achievement
        this.showAchievement('New Badge Earned!', `You earned the "${badge.name}" badge: ${badge.condition}`, badge.icon);
        
        // Check if all badges are collected
        this.checkAllBadges();
        
        // Update UI
        App.updateUI();
        App.saveState();
    },
    
    // Check if all badges are collected
    checkAllBadges: function() {
        if (this.rewards && this.rewards.badges) {
            const earnedBadges = App.state.rewards.badges;
            
            if (earnedBadges.length === this.rewards.badges.length) {
                // All badges collected
                this.showAchievement('All Badges Collected!', 'Congratulations! You have collected all available badges!', '🏆');
            }   
        }
    },
    
        // Show achievement notification
        showAchievement: function(title, message, icon) {
            App.showFeedback(title, message, icon);
            
            // Play achievement sound if available
            if (App.sounds && App.sounds.achievement) {
                App.playSound('cheeringSound');
            }
        },
        
        // Update the stars display
        updateStarsDisplay: function() {
            const starsContainer = document.getElementById('stars-container');
            if (!starsContainer) return;
            
            starsContainer.innerHTML = '';
            
            const currentStars = App.state.rewards.stars;
            const maxStars = this.rewards.stars.gold;
            
            // Create stars based on current count
            for (let i = 0; i < currentStars; i++) {
                const star = document.createElement('span');
                star.className = 'star';
                star.textContent = '⭐';
                starsContainer.appendChild(star);
            }
            
            // Add empty stars for remaining
            for (let i = currentStars; i < maxStars; i++) {
                const star = document.createElement('span');
                star.className = 'star empty';
                star.textContent = '☆';
                starsContainer.appendChild(star);
            }
        },
        
        // Update the badges display
        updateBadgesDisplay: function() {
            const badgesContainer = document.getElementById('badges-container');
            if (!badgesContainer) return;
            
            badgesContainer.innerHTML = '';
            
            const earnedBadges = App.state.rewards.badges;
            
            // Display earned badges
            earnedBadges.forEach(badge => {
                const badgeElement = document.createElement('span');
                badgeElement.className = 'badge';
                badgeElement.title = `${badge.name}`;
                badgeElement.textContent = badge.icon;
                badgesContainer.appendChild(badgeElement);
            });
            
            // Display locked badges (optional)
            if (this.rewards && this.rewards.badges) {
                this.rewards.badges.forEach(rewardBadge => {
                    if (!earnedBadges.some(b => b.id === rewardBadge.id)) {
                        const badgeElement = document.createElement('span');
                        badgeElement.className = 'badge locked';
                        badgeElement.title = `Locked: ${rewardBadge.condition}`;
                        badgeElement.textContent = '🔒';
                        badgesContainer.appendChild(badgeElement);
                    }
                });
            }
        },
        
        // Reset all rewards (for testing or reset functionality)
        resetRewards: function() {
            App.state.rewards = {
                stars: 0,
                badges: []
            };
            App.saveState();
            this.updateStarsDisplay();
            this.updateBadgesDisplay();
        }
    };

    // Export the RewardSystem if using modules
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = RewardSystem;
    } else {
        // Attach to global window object if not using modules
        window.RewardSystem = RewardSystem;
    }
