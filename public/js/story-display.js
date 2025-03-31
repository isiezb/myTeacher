// Search for a good location to add the event listener, such as in the init() function
// or in a setupEventListeners() function if one exists

// Add an event listener for the story-continued event
document.addEventListener('story-continued', (event) => {
    // Get the continuation data from the event
    const { continuation, difficulty, wordCount, vocabulary, summary, quiz } = event.detail;
    
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
        
        // Add summary section if available
        if (summary) {
            const summarySection = document.createElement('section');
            summarySection.className = 'story-summary continuation-summary';
            summarySection.innerHTML = `
                <h3>Summary</h3>
                <div class="summary-content">${summary}</div>
            `;
            storyContent.appendChild(summarySection);
        }
        
        // Add vocabulary section if available
        if (vocabulary && vocabulary.length > 0) {
            const vocabSection = document.createElement('section');
            vocabSection.className = 'story-vocabulary continuation-vocabulary';
            
            // Limit to 4 vocabulary items
            const limitedVocabulary = vocabulary.slice(0, 4);
            
            let vocabHtml = '<h3>Vocabulary</h3><div class="vocabulary-list">';
            for (const item of limitedVocabulary) {
                vocabHtml += `
                    <div class="vocabulary-item">
                        <div class="vocabulary-term">${item.term}</div>
                        <div class="vocabulary-definition">${item.definition}</div>
                    </div>
                `;
            }
            vocabHtml += '</div>';
            
            vocabSection.innerHTML = vocabHtml;
            storyContent.appendChild(vocabSection);
        }
        
        // Add quiz section if available
        if (quiz && quiz.length > 0) {
            const quizSection = document.createElement('section');
            quizSection.className = 'story-quiz continuation-quiz';
            quizSection.innerHTML = '<h3>Quiz</h3>';
            
            // Create a story-quiz web component
            const quizElement = document.createElement('story-quiz');
            quizElement.quiz = quiz;
            quizSection.appendChild(quizElement);
            
            storyContent.appendChild(quizSection);
        }
        
        // Add a "Continue Story" button to allow further continuation
        const continueButtonDiv = document.createElement('div');
        continueButtonDiv.className = 'continue-story-wrapper';
        continueButtonDiv.innerHTML = `
            <button class="continue-story-btn" id="continue-story-btn">
                Continue Story
            </button>
        `;
        storyContent.appendChild(continueButtonDiv);
        
        // Add event listener to the continue button
        const continueBtn = continueButtonDiv.querySelector('#continue-story-btn');
        if (continueBtn) {
            continueBtn.addEventListener('click', () => {
                // Get the current story data from the window object
                const currentStory = window.currentStory || {};
                
                // Dispatch an event to show the continuation form
                const continueEvent = new CustomEvent('show-continuation-form', {
                    detail: {
                        originalStory: {
                            id: `continued-${Date.now()}`,
                            content: storyContent.textContent.trim(),
                            difficulty: difficulty,
                            // Include vocabulary, summary and quiz from the original story if available
                            vocabulary: vocabulary || currentStory.vocabulary || [],
                            summary: summary || currentStory.summary || '',
                            quiz: quiz || currentStory.quiz || []
                        }
                    },
                    bubbles: true
                });
                document.dispatchEvent(continueEvent);
                
                // Log the details being passed
                console.log('Sending continuation form request with vocabulary items:', 
                    vocabulary || currentStory.vocabulary || []);
                
                // Hide the continue button after clicking
                continueButtonDiv.style.display = 'none';
            });
        }
        
        // Scroll directly to the first paragraph of the continued story
        const firstParagraph = continuationDiv.querySelector('p');
        if (firstParagraph) {
            // Calculate the position to scroll to with proper header clearance
            const headerHeight = 80; // Adjust if needed based on your actual header height
            const rect = firstParagraph.getBoundingClientRect();
            const offsetTop = window.pageYOffset + rect.top - headerHeight;
            
            // Smooth scroll to the beginning of the new content
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
            
            // Add a temporary highlight effect to help identify where the continuation begins
            firstParagraph.classList.add('highlight-new-content');
            setTimeout(() => {
                firstParagraph.classList.remove('highlight-new-content');
            }, 2000);
        }
        
        // Show a success message
        if (window.showToast) {
            window.showToast('Story continuation added!', 'success');
        }
    }
}); 