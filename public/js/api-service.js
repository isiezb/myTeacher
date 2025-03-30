// ... existing code ...
  async function generateStory(formData) {
    // Initialize with the configured base URL
    const apiUrl = window.ENV_API_URL || "https://easystory.onrender.com";
    console.log(`Generating story... API URL: ${apiUrl}`);
    
    // Define the endpoint - based on the URL seen in the browser screenshot
    const endpoint = '/stories/generate';
    const fullUrl = `${apiUrl}${endpoint}`;
    
    try {
      console.log(`Attempting POST request to ${fullUrl}`);
      
      // Set up proper headers to allow CORS
      const headers = {
        'Content-Type': 'application/json',
        'Origin': window.location.origin,
        'Accept': 'application/json'
      };
      
      // Make the POST request
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
          
          // Try to get the raw text
          const responseClone = postResponse.clone();
          const rawText = await responseClone.text();
          console.log('Raw response text:', rawText.substring(0, 200) + (rawText.length > 200 ? '...' : ''));
          
          // This might be a CORS issue - try falling back to proxy
          throw new Error(`Failed to parse response: ${parseError.message}`);
        }
      } else {
        // Log the error details
        console.error(`POST request failed with status ${postResponse.status}`);
        try {
          const errorText = await postResponse.text();
          console.error('Error response:', errorText.substring(0, 200));
        } catch (e) {
          console.error('Could not read error response');
        }
        
        // If POST failed with 404, the endpoint might be wrong - try a GET request
        if (postResponse.status === 404) {
          console.log('Endpoint not found, trying GET request as fallback');
          
          // Build query string
          const params = new URLSearchParams();
          Object.entries(formData).forEach(([key, value]) => {
            params.append(key, typeof value === 'object' ? JSON.stringify(value) : value);
          });
          
          const getUrl = `${fullUrl}?${params.toString()}`;
          console.log('Attempting GET request:', getUrl.substring(0, 100) + '...');
          
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
              console.error('Error parsing GET response:', parseError);
              throw new Error(`Failed to parse GET response: ${parseError.message}`);
            }
          }
          
          throw new Error(`API request failed: ${getResponse.status}`);
        }
        
        throw new Error(`API request failed: ${postResponse.status}`);
      }
    } catch (error) {
      console.error('Error generating story:', error);
      
      // If this might be a CORS error, suggest using the proxy service
      if (error.message.includes('Failed to fetch') || 
          error.message.includes('NetworkError') ||
          error.message.includes('CORS')) {
        throw new Error('Network or CORS error detected. This could be fixed using a proxy service.');
      }
      
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