// API Service module using IIFE pattern
const apiService = (function() {
  // Private variables or helper functions can go here if needed

  // Helper function to add importance ranking to vocabulary items
  function processVocabularyItems(vocabulary) {
    if (!vocabulary || !Array.isArray(vocabulary) || vocabulary.length === 0) {
      return vocabulary;
    }
    
    // Process each vocabulary item to add an importance ranking
    return vocabulary.map((item, index) => {
      // Calculate importance based on:
      // 1. Position in the array (earlier items often more important)
      // 2. Length of the term (longer terms often more complex or specific)
      // 3. Length of definition (more detailed definitions often for more important terms)
      const positionScore = Math.max(10 - index, 1); // Earlier items get higher scores
      const termLength = item.term ? item.term.length : 0;
      const definitionLength = item.definition ? item.definition.length : 0;
      
      // Weighted scoring formula - adjust weights as needed
      let importanceScore = (
        (positionScore * 0.5) + 
        (Math.min(termLength / 5, 2) * 0.25) + 
        (Math.min(definitionLength / 50, 2) * 0.25)
      );
      
      // Normalize to 1-10 range and round
      importanceScore = Math.max(1, Math.min(10, Math.round(importanceScore)));
      
      // Return the item with the new importance property
      return {
        ...item,
        importance: importanceScore
      };
    });
  }

  async function generateStory(formData) {
    // Initialize with the configured base URL from env.js
    // An empty string means use the current origin
    const apiUrl = window.ENV_API_URL;
    
    console.log(`Generating story... API Base URL (from env): '${apiUrl}'`);
    
    // Use POST /stories/generate as defined in the FastAPI backend
    const endpoint = '/stories/generate';
    // If apiUrl is "", fullUrl will correctly start with "/"
    const fullUrl = `${apiUrl}${endpoint}`;
    
    try {
      console.log(`Attempting POST request to ${fullUrl}`);
      
      const headers = {
        'Content-Type': 'application/json',
        'Origin': window.location.origin,
        'Accept': 'application/json'
      };
      
      console.log('Request Details:', {
        url: fullUrl,
        method: 'POST',
        headers: headers,
        body: JSON.stringify(formData).substring(0, 200) + '...'
      });
      
      const postResponse = await fetch(fullUrl, {
        method: 'POST',
        headers: headers,
        mode: 'cors',
        credentials: 'omit',
        body: JSON.stringify(formData)
      });
      
      console.log('POST response status:', postResponse.status);
      
      if (postResponse.ok) {
        try {
          const data = await postResponse.json();
          console.log('Story generated successfully via POST');
          
          // Process vocabulary items to add importance ranking
          if (data.vocabulary && Array.isArray(data.vocabulary)) {
            data.vocabulary = processVocabularyItems(data.vocabulary);
            console.log('Added importance ranking to vocabulary items');
          }
          
          return data;
        } catch (parseError) {
          console.error('Error parsing JSON response:', parseError);
          const responseClone = postResponse.clone();
          const rawText = await responseClone.text();
          console.log('Raw response text:', rawText.substring(0, 200) + (rawText.length > 200 ? '...' : ''));
          throw new Error(`Failed to parse response: ${parseError.message}`);
        }
      } else {
        console.error(`POST request failed with status ${postResponse.status}`);
        let errorText = 'Could not read error response';
        try {
          errorText = await postResponse.text();
          console.error('Error response:', errorText.substring(0, 200));
        } catch (e) { /* Ignore */ }
        throw new Error(`API request failed: ${postResponse.status} - ${errorText.substring(0, 50)}`);
      }
    } catch (error) {
      console.error('Error generating story (direct API):', error);
      throw error; // Re-throw for app.js to handle fallback
    }
  }

  async function continueStory(storyId, options) {
    // Initialize with the configured base URL from env.js
    // An empty string means use the current origin
    const apiUrl = window.ENV_API_URL;
    
    console.log(`Continuing story... API Base URL (from env): '${apiUrl}'`);
    
    // Use POST /stories/{storyId}/continue for story continuation
    const endpoint = `/stories/${storyId}/continue`;
    const fullUrl = `${apiUrl}${endpoint}`;
    
    try {
      console.log(`Attempting POST request to ${fullUrl}`);
      
      const headers = {
        'Content-Type': 'application/json',
        'Origin': window.location.origin,
        'Accept': 'application/json'
      };
      
      // Process focus to add more emphasis
      let focusData = {
        term: options.focus || 'general',
        emphasis: 'normal'
      };
      
      // If focus is not general, give it strong emphasis
      if (options.focus && options.focus !== 'general') {
        focusData = {
          term: options.focus,
          emphasis: 'strong',
          instructions: `Pay special attention to incorporating and explaining "${options.focus}" throughout the continuation. Make it a central theme.`
        };
        console.log(`Adding strong emphasis on focus term: ${options.focus}`);
      }
      
      // Make sure to include the original story content and optional flags in the request
      const requestBody = {
        length: options.length || 300,
        difficulty: options.difficulty || 'same',
        original_story_content: options.original_story_content || '',
        generate_summary: options.generate_summary || false,
        generate_quiz: options.generate_quiz || false,
        focus: focusData
      };
      
      // Log request details but limit content length in logs for readability
      const logBody = {...requestBody};
      if (logBody.original_story_content) {
        logBody.original_story_content = logBody.original_story_content.substring(0, 100) + '...';
      }
      
      console.log('Request Details:', {
        url: fullUrl,
        method: 'POST',
        headers: headers,
        body: JSON.stringify(logBody)
      });
      
      // Validate the original story content is included
      if (!requestBody.original_story_content) {
        console.warn('Original story content is missing or empty in continuation request!');
      }
      
      const postResponse = await fetch(fullUrl, {
        method: 'POST',
        headers: headers,
        mode: 'cors',
        credentials: 'omit',
        body: JSON.stringify(requestBody)
      });
      
      console.log('POST response status:', postResponse.status);
      
      if (postResponse.ok) {
        try {
          const data = await postResponse.json();
          console.log('Story continued successfully via POST');
          
          // Log if summary and quiz were included in the response
          if (data.summary) {
            console.log('Response includes summary');
          }
          
          if (data.quiz && Array.isArray(data.quiz)) {
            console.log('Response includes quiz with', data.quiz.length, 'questions');
          }
          
          // Process vocabulary items to add importance ranking
          if (data.vocabulary && Array.isArray(data.vocabulary)) {
            data.vocabulary = processVocabularyItems(data.vocabulary);
            console.log('Added importance ranking to vocabulary items:', 
              data.vocabulary.map(v => `${v.term} (${v.importance})`).join(', '));
          }
          
          return data;
        } catch (parseError) {
          console.error('Error parsing JSON response:', parseError);
          const responseClone = postResponse.clone();
          const rawText = await responseClone.text();
          console.log('Raw response text:', rawText.substring(0, 200) + (rawText.length > 200 ? '...' : ''));
          throw new Error(`Failed to parse response: ${parseError.message}`);
        }
      } else {
        console.error(`POST request failed with status ${postResponse.status}`);
        let errorText = 'Could not read error response';
        try {
          errorText = await postResponse.text();
          console.error('Error response:', errorText.substring(0, 200));
        } catch (e) { /* Ignore */ }
        throw new Error(`API request failed: ${postResponse.status} - ${errorText.substring(0, 50)}`);
      }
    } catch (error) {
      console.error('Error continuing story (direct API):', error);
      throw error;
    }
  }

  // Helper for inspecting problematic responses
  async function _inspectResponseContent(response, originalError) {
    console.log('Inspecting problematic response...');
    console.log('Response headers:', {
      'content-type': response.headers.get('content-type'),
      'content-length': response.headers.get('content-length')
    });
    
    // Get the raw text to analyze
    try {
      const rawText = await response.text();
      
      // Print a short preview for debug logs
      console.log('Raw response preview:', rawText.substring(0, 200) + (rawText.length > 200 ? '...' : ''));
      
      // Check for common content types
      if (rawText.includes('<!DOCTYPE html>') || rawText.includes('<html')) {
        console.error('Response contains HTML instead of JSON');
        throw new Error('Server returned HTML instead of JSON. The API endpoint might be returning an error page.');
      } 
      
      // Try to detect if it's XML
      if (rawText.includes('<?xml') || (rawText.startsWith('<') && rawText.includes('</'))) {
        console.error('Response appears to be XML instead of JSON');
        throw new Error('Server returned XML instead of JSON. Check API endpoint configuration.');
      }
      
      // Try manual parsing for insight
      try {
        // Check if the string starts with a common JSON character
        if (rawText.trim().startsWith('{') || rawText.trim().startsWith('[')) {
          console.log('Response appears to be JSON-like but failed to parse');
          
          // Additional debugging - show the first and last 50 chars
          const start = rawText.substring(0, 50);
          const end = rawText.substring(rawText.length - 50);
          console.log(`JSON starts with: "${start}"... and ends with: "${end}"`);
          
          // Check for common JSON errors
          const missingQuotes = (rawText.match(/:\s*([a-zA-Z]+)/g) || []).length > 0;
          const trailingCommas = rawText.includes(',}') || rawText.includes(',]');
          
          if (missingQuotes) {
            console.error('JSON appears to have unquoted strings');
          }
          
          if (trailingCommas) {
            console.error('JSON appears to have trailing commas');
          }
        } else {
          console.log('Response does not appear to be JSON');
        }
      } catch (parseAttemptError) {
        console.error('Error during manual parsing analysis:', parseAttemptError);
      }
      
      throw new Error(`Failed to parse server response: ${originalError.message}. Content type may be incompatible.`);
    } catch (textError) {
      console.error('Failed to get response text for inspection:', textError);
      throw new Error(`Cannot inspect response: ${textError.message}`);
    }
  }
  
  // Create fallback story data for development/debugging
  function _createFallbackStory(formData) {
    console.log('Creating fallback story based on form data:', formData);
    
    const subject = formData.subject || 'general knowledge';
    const grade = formData.academic_grade || '5';
    
    // Create mock data with importance ranking already added
    return {
      title: `${subject.charAt(0).toUpperCase() + subject.slice(1)} Exploration (Fallback)`,
      content: `This is a fallback story generated due to API issues. It would normally contain an educational story about ${subject} for grade ${grade} students.`,
      summary: 'API response could not be parsed correctly. This is fallback content.',
      vocabulary: [
        { term: 'fallback', definition: 'An alternative plan that may be used in an emergency', importance: 9 },
        { term: 'parse', definition: 'To analyze (a string or text) into logical syntactic components', importance: 7 }
      ],
      metadata: {
        grade: grade,
        subject: subject,
        generated_at: new Date().toISOString(),
        is_fallback: true
      }
    };
  }

  // Public API: expose functions needed externally
  return {
    generateStory,
    continueStory
    // You could expose _createFallbackStory here too if needed elsewhere
  };

})(); // End of IIFE

// Assign the returned public API to the window object
window.apiService = apiService;
console.log("API Service module loaded and assigned to window.apiService.");