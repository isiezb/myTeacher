// Search for a good location to add the event listener, such as in the init() function
// or in a setupEventListeners() function if one exists

// Add an event listener for the story-continued event
document.addEventListener('story-continued', (event) => {
    // Get the continuation data from the event
    const { continuation, difficulty, wordCount, vocabulary } = event.detail;
    
    // Find the story content element to append the continuation
    const storyContent = document.querySelector('.story-content');
    if (storyContent) {
        // Create a new div for the continuation
        const continuationDiv = document.createElement('div');
        continuationDiv.className = 'story-continuation';
        
        // Add a divider between original and continuation
        const divider = document.createElement('div');
        divider.className = 'continuation-divider';
        divider.innerHTML = '<span>Story Continuation</span>';
        
        // Format the continuation text
        const formattedText = continuation.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>');
        continuationDiv.innerHTML = `<p>${formattedText}</p>`;
        
        // Add a class based on the difficulty level
        continuationDiv.classList.add(`difficulty-${difficulty.replace('_', '-')}`);
        
        // Insert the divider and continuation
        storyContent.appendChild(divider);
        storyContent.appendChild(continuationDiv);
        
        // If there's a word counter, update it to include the continuation
        const wordCounter = document.querySelector('.word-counter');
        if (wordCounter) {
            const originalWords = parseInt(wordCounter.textContent.match(/\d+/) || 0, 10);
            wordCounter.textContent = `Total Words: ${originalWords + wordCount}`;
        }
        
        // Scroll to the continuation
        divider.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        // Show a success message
        if (window.showToast) {
            window.showToast('Story continuation added!', 'success');
        }
    }
}); 