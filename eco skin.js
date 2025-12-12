/**
 * VocalPilot Utilities Module
 * Contains reusable functions for speech synthesis, recognition, and DOM manipulation
 */

// Configure and get a female voice for speech synthesis
export function configureFemaleVoice(utterance, lang = "en-US") {
  utterance.lang = lang;
  
  // Get all available voices
  const voices = speechSynthesis.getVoices();
  
  // Try to find a female voice
  const femaleVoice = voices.find(voice => 
    voice.name.toLowerCase().includes('female') || 
    voice.name.toLowerCase().includes('woman') ||
    voice.name.toLowerCase().includes('zira') ||
    voice.name.toLowerCase().includes('hazel') ||
    voice.name.toLowerCase().includes('susan') ||
    voice.gender === 'female'
  ) || voices.find(voice => voice.lang.startsWith(lang.split('-')[0]) && voice.name.includes('Google'));
  
  if (femaleVoice) {
    utterance.voice = femaleVoice;
  }
  
  utterance.pitch = 1.1; // Slightly higher pitch for more feminine sound
  utterance.rate = 0.9; // Slightly slower for clarity
  
  return utterance;
}

// Speak text with the configured female voice
export function speak(text, lang = "en-US") {
  return new Promise((resolve) => {
    const utterance = new SpeechSynthesisUtterance(text);
    configureFemaleVoice(utterance, lang);
    
    utterance.onend = () => {
      resolve();
    };
    
    utterance.onerror = (error) => {
      console.error("Speech synthesis error:", error);
      resolve(); // Resolve anyway to prevent hanging
    };
    
    speechSynthesis.speak(utterance);
  });
}

// Initialize speech recognition with options
export function listenForSpeech(options = {}) {
  return new Promise((resolve, reject) => {
    try {
      const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      recognition.lang = options.lang || "en-US";
      recognition.interimResults = options.interimResults || false;
      recognition.maxAlternatives = options.maxAlternatives || 1;
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        resolve(transcript);
      };
      
      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        reject(event.error);
      };
      
      recognition.onend = () => {
        // If no result was received and no error occurred, assume it timed out
        reject("No speech detected");
      };
      
      recognition.start();
      
      // Update UI if callback provided
      if (options.onListeningStart) {
        options.onListeningStart();
      }
    } catch (error) {
      console.error("Failed to initialize speech recognition:", error);
      reject(error);
    }
  });
}

// Find form fields based on type
export function findFormField(fieldType) {
  const inputs = document.querySelectorAll("input:not([type='hidden']):not([type='submit']):not([type='button']), textarea, select");
  const fieldPatterns = {
    name: ['name', 'fullname', 'full-name', 'full_name', 'firstname', 'lastname'],
    email: ['email', 'e-mail', 'mail'],
    phone: ['phone', 'telephone', 'mobile', 'cell', 'contact'],
    address: ['address', 'street', 'location'],
    city: ['city', 'town'],
    state: ['state', 'province', 'region'],
    zip: ['zip', 'zipcode', 'postal', 'postcode'],
    country: ['country', 'nation'],
    company: ['company', 'organization', 'employer'],
    title: ['title', 'job title', 'position'],
    experience: ['experience', 'years', 'work experience'],
    education: ['education', 'degree', 'qualification'],
    skills: ['skills', 'abilities', 'expertise'],
    resume: ['resume', 'cv', 'curriculum']
  };
  
  const patterns = fieldPatterns[fieldType] || [];
  
  for (let input of inputs) {
    const inputId = (input.id || '').toLowerCase();
    const inputName = (input.name || '').toLowerCase();
    const inputType = (input.type || '').toLowerCase();
    
    // Get associated label text if available
    let labelText = '';
    const labels = input.labels;
    if (labels && labels.length > 0) {
      labelText = labels[0].textContent.toLowerCase();
    } else {
      // Try to find label by for attribute
      const labelFor = document.querySelector(`label[for="${input.id}"]`);
      if (labelFor) {
        labelText = labelFor.textContent.toLowerCase();
      }
    }
    
    const placeholder = (input.placeholder || '').toLowerCase();
    const ariaLabel = (input.getAttribute('aria-label') || '').toLowerCase();
    
    // Special case for email type
    if (fieldType === 'email' && inputType === 'email') {
      return input;
    }
    
    // Special case for phone type
    if (fieldType === 'phone' && inputType === 'tel') {
      return input;
    }
    
    // Check all possible identifiers
    if (patterns.some(pattern => 
        inputId.includes(pattern) || 
        inputName.includes(pattern) || 
        labelText.includes(pattern) ||
        placeholder.includes(pattern) ||
        ariaLabel.includes(pattern))) {
      return input;
    }
  }
  
  return null;
}

// Find and click a button based on text content
export function findAndClickButton(textContent) {
  const elements = document.querySelectorAll('button, input[type="submit"], input[type="button"], a.btn, a.button, .btn, .button, [role="button"]');
  const lowerTextContent = textContent.toLowerCase();
  
  for (let element of elements) {
    const elementText = element.innerText || element.value || element.textContent || '';
    if (elementText.toLowerCase().includes(lowerTextContent)) {
      element.click();
      return true;
    }
  }
  
  return false;
}

// Scroll the page
export function scrollPage(direction) {
  const scrollAmount = window.innerHeight * 0.8;
  
  if (direction === 'up') {
    window.scrollBy(0, -scrollAmount);
    return true;
  } else if (direction === 'down') {
    window.scrollBy(0, scrollAmount);
    return true;
  } else if (direction === 'top') {
    window.scrollTo(0, 0);
    return true;
  } else if (direction === 'bottom') {
    window.scrollTo(0, document.body.scrollHeight);
    return true;
  }
  
  return false;
}

// Detect the current website
export function detectWebsite() {
  const hostname = window.location.hostname;
  
  if (hostname.includes('linkedin')) {
    return 'linkedin';
  } else if (hostname.includes('indeed')) {
    return 'indeed';
  } else if (hostname.includes('monster')) {
    return 'monster';
  } else if (hostname.includes('glassdoor')) {
    return 'glassdoor';
  } else if (hostname.includes('ziprecruiter')) {
    return 'ziprecruiter';
  } else if (hostname.includes('google')) {
    return 'google';
  } else if (hostname.includes('facebook') || hostname.includes('meta')) {
    return 'facebook';
  } else if (hostname.includes('twitter') || hostname.includes('x.com')) {
    return 'twitter';
  } else if (hostname.includes('instagram')) {
    return 'instagram';
  } else if (hostname.includes('amazon')) {
    return 'amazon';
  } else if (hostname.includes('youtube')) {
    return 'youtube';
  } else {
    return 'unknown';
  }
}

// Sanitize user input to prevent XSS
export function sanitizeInput(input) {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}

// Validate email format
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate phone number format (basic validation)
export function isValidPhone(phone) {
  const phoneRegex = /^[\d\s\+\-\(\)]{7,20}$/;
  return phoneRegex.test(phone);
}

// Highlight an element on the page
export function highlightElement(element) {
  if (!element) return;
  
  // Save original styles
  const originalOutline = element.style.outline;
  const originalBoxShadow = element.style.boxShadow;
  const originalBackground = element.style.backgroundColor;
  
  // Apply highlight
  element.style.outline = '2px solid #4285f4';
  element.style.boxShadow = '0 0 8px rgba(66, 133, 244, 0.8)';
  element.style.backgroundColor = 'rgba(66, 133, 244, 0.1)';
  
  // Scroll element into view if needed
  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  
  // Remove highlight after 3 seconds
  setTimeout(() => {
    element.style.outline = originalOutline;
    element.style.boxShadow = originalBoxShadow;
    element.style.backgroundColor = originalBackground;
  }, 3000);
}

// Extract main content from page for summarization
export function extractPageContent() {
  // Try to find main content
  const mainContent = document.querySelector('main') || 
                     document.querySelector('article') || 
                     document.querySelector('.content') || 
                     document.querySelector('#content');
  
  if (mainContent) {
    return mainContent.innerText;
  }
  
  // Fallback to body text, excluding common navigation and footer elements
  const body = document.body;
  const navElements = document.querySelectorAll('nav, header, footer, aside, .navigation, .menu, .sidebar');
  
  let bodyText = body.innerText;
  
  // Remove text from navigation elements
  navElements.forEach(nav => {
    if (nav.innerText) {
      bodyText = bodyText.replace(nav.innerText, '');
    }
  });
  
  // Limit to reasonable size
  return bodyText.slice(0, 8000);
}