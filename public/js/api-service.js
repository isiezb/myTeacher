// ... existing code ...
  async function generateStory(formData) {
    console.log(`Generating story... API URL: ${_baseUrl}/stories/generate`);
    
    // Define multiple possible endpoints to try
    const endpoints = [
      '/stories/generate',  // Current endpoint that's getting 404
      '/api/stories/generate',
      '/generate-story',
      '/story/generate',
      '/api/v1/stories/generate'
    ];
    
    // Store errors for diagnostics
    const endpointErrors = {};
    
    // Try each endpoint
    for (const endpoint of endpoints) {
      try {
        console.log(`Attempting POST request to ${endpoint} with fetch`);
        const postResponse = await fetch(`${_baseUrl}${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Origin': window.location.origin
          },
          mode: 'cors',
          credentials: 'omit',
          body: JSON.stringify(formData)
        });
        
        console.log(`POST response status for ${endpoint}:`, postResponse.status);
        
        if (postResponse.ok) {
          try {
            const data = await postResponse.json();
            console.log(`Story generated successfully via POST to ${endpoint}`);
            return data;
          } catch (parseError) {
            console.error(`Error parsing JSON from ${endpoint}:`, parseError);
            endpointErrors[endpoint] = { error: 'JSON parse error', message: parseError.message };
            continue; // Try next endpoint
          }
        }
        
        // If POST failed, we'll try an alternative method (GET with params)
        console.log(`POST to ${endpoint} failed, trying GET...`);
        
        // Convert form data to query string for GET request
        const params = new URLSearchParams();
        Object.entries(formData).forEach(([key, value]) => {
          params.append(key, typeof value === 'object' ? JSON.stringify(value) : value);
        });
        
        const getUrl = `${_baseUrl}${endpoint}?${params.toString()}`;
        console.log(`Attempting GET request to ${endpoint}:`, getUrl.substring(0, 100) + '...');
        
        const getResponse = await fetch(getUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Origin': window.location.origin
          },
          mode: 'cors',
          credentials: 'omit'
        });
        
        console.log(`GET response status for ${endpoint}:`, getResponse.status);
        
        if (getResponse.ok) {
          try {
            const data = await getResponse.json();
            console.log(`Story generated successfully via GET to ${endpoint}`);
            return data;
          } catch (parseError) {
            console.error(`Error parsing JSON from GET to ${endpoint}:`, parseError);
            
            // Attempt to get the raw text to see what was returned
            const responseClone = getResponse.clone();
            
            try {
              const rawText = await responseClone.text();
              console.log(`Raw response text from ${endpoint}:`, rawText.substring(0, 200) + (rawText.length > 200 ? '...' : ''));
              
              // Store the error for diagnostics
              endpointErrors[endpoint] = { 
                error: 'JSON parse error (GET)', 
                message: parseError.message,
                rawText: rawText.substring(0, 200)
              };
            } catch (textError) {
              endpointErrors[endpoint] = { 
                error: 'Failed to get response text',
                message: textError.message
              };
            }
            
            // Continue to next endpoint
            continue;
          }
        }
        
        // Store the error for this endpoint
        endpointErrors[endpoint] = { 
          error: 'HTTP error',
          postStatus: postResponse.status,
          getStatus: getResponse.status
        };
      } catch (error) {
        console.error(`Error trying endpoint ${endpoint}:`, error);
        endpointErrors[endpoint] = { error: 'Request error', message: error.message };
      }
    }
    
    // If we get here, all endpoints failed
    console.error('All API endpoints failed. Errors:', endpointErrors);
    
    // Log helpful debugging info
    console.error('Request details:', {
      baseUrl: _baseUrl,
      formData,
      headers: _headers,
      endpointErrors
    });
    
    // Use fallback story instead of throwing error
    console.log('Falling back to mock story generation');
    return _createFallbackStory(formData);
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