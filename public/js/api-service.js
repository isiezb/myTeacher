// API Service module using IIFE pattern
const apiService = (function() {
  // Private variables or helper functions can go here if needed

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
    
    return {
      title: `${subject.charAt(0).toUpperCase() + subject.slice(1)} Exploration (Fallback)`,
      content: `This is a fallback story generated due to API issues. It would normally contain an educational story about ${subject} for grade ${grade} students.`,
      summary: 'API response could not be parsed correctly. This is fallback content.',
      vocabulary: [
        { word: 'fallback', definition: 'An alternative plan that may be used in an emergency' },
        { word: 'parse', definition: 'To analyze (a string or text) into logical syntactic components' }
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
    generateStory
    // You could expose _createFallbackStory here too if needed elsewhere
  };

})(); // End of IIFE

// Assign the returned public API to the window object
window.apiService = apiService;
console.log("API Service module loaded and assigned to window.apiService.");