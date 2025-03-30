// ... existing code ...
  async function generateStory(formData) {
    // Initialize with the configured base URL
    const apiUrl = window.ENV_API_URL || "https://easystory.onrender.com";
    console.log(`Generating story... API URL: ${apiUrl}`);
    
    // Target /stories/generate, but prioritize GET based on previous logs
    const endpoint = '/stories/generate';
    const fullUrlBase = `${apiUrl}${endpoint}`;
    
    try {
      // Convert form data to query string for GET request
      const params = new URLSearchParams();
      Object.entries(formData).forEach(([key, value]) => {
        params.append(key, typeof value === 'object' ? JSON.stringify(value) : value);
      });
      const getUrl = `${fullUrlBase}?${params.toString()}`;
      
      console.log(`Attempting GET request first to ${getUrl.substring(0, 150)}...`);
      
      // Set up proper headers
      const headers = {
        'Origin': window.location.origin, // Still needed for CORS
        'Accept': 'application/json'
      };
      
      // Log the request details
      console.log('Request Details (GET):', { url: getUrl, method: 'GET', headers });
      
      // Make the GET request
      const getResponse = await fetch(getUrl, {
        method: 'GET',
        headers: headers,
        mode: 'cors',
        credentials: 'omit'
      });
      
      console.log('GET response status:', getResponse.status);
      
      if (getResponse.ok) {
        try {
          const data = await getResponse.json();
          console.log('Story generated successfully via GET');
          return data;
        } catch (parseError) {
          console.error('Error parsing JSON response from GET:', parseError);
          const responseClone = getResponse.clone();
          const rawText = await responseClone.text();
          console.log('Raw GET response text:', rawText.substring(0, 200) + (rawText.length > 200 ? '...' : ''));
          throw new Error(`Failed to parse GET response: ${parseError.message}`);
        }
      } else {
        // Log the error details from GET
        console.error(`GET request failed with status ${getResponse.status}`);
        let errorText = 'Could not read error response';
        try {
          errorText = await getResponse.text();
          console.error('GET Error response:', errorText.substring(0, 200));
        } catch (e) { /* Ignore */ }
        
        // If GET failed, throw an error (app.js will handle fallback)
        throw new Error(`API GET request failed: ${getResponse.status} - ${errorText.substring(0, 50)}`);
      }
    } catch (error) {
      console.error('Error generating story (direct API - GET attempt):', error);
      // Re-throw the error so app.js can handle fallback to proxy
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
// ... existing code ...