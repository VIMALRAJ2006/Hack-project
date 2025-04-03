// Global variables
let map;
let markers = [];
let infoWindows = [];
let userLocationMarker = null;
let watchId = null;
const coimbatoreCenter = { lat: 11.0168, lng: 76.9558 };
let stores = JSON.parse(localStorage.getItem('stores')) || [
    {
        id: 1,
        name: "Super Mart",
        location: { lat: 11.0188, lng: 76.9558 },
        inventory: { "Rice": 50, "Wheat": 30, "Sugar": 20 }
    },
    {
        id: 2,
        name: "Daily Needs",
        location: { lat: 11.0148, lng: 76.9658 },
        inventory: { "Oil": 40, "Flour": 25, "Salt": 15 }
    }
];
let recognition;
let isListening = false;
let currentUserLocation = null;

// Initialize the application
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: coimbatoreCenter,
        zoom: 13,
        mapTypeControl: false,
        streetViewControl: false
    });

    // Add stores to map
    addStoresToMap();

    // Setup search functionality
    document.getElementById('search').addEventListener('input', function(e) {
        filterStores(e.target.value.toLowerCase());
    });

    // Setup track location button
    document.getElementById('track-location').addEventListener('click', trackUserLocation);

    // Initialize voice recognition
    initVoiceRecognition();

    // Setup chat input to respond to Enter key
    document.getElementById('user-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // Add sample stores if none exist
    if (stores.length === 0) {
        localStorage.setItem('stores', JSON.stringify(stores));
    }
}

// Track user's live location
function trackUserLocation() {
    const statusElement = document.getElementById('location-status');
    
    if (watchId) {
        // Stop tracking
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
        statusElement.textContent = 'Location tracking stopped';
        document.getElementById('track-location').textContent = 'Track My Location';
        if (userLocationMarker) {
            userLocationMarker.setMap(null);
        }
        return;
    }

    statusElement.textContent = 'Getting your location...';
    
    if (navigator.geolocation) {
        watchId = navigator.geolocation.watchPosition(
            (position) => {
                const pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                currentUserLocation = pos;
                
                // Update or create marker
                if (!userLocationMarker) {
                    userLocationMarker = new google.maps.Marker({
                        position: pos,
                        map: map,
                        icon: {
                            url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                            scaledSize: new google.maps.Size(40, 40)
                        },
                        title: 'Your Location'
                    });
                } else {
                    userLocationMarker.setPosition(pos);
                }
                
                // Center map on user location
                map.panTo(pos);
                statusElement.textContent = `Tracking your location: ${pos.lat.toFixed(4)}, ${pos.lng.toFixed(4)}`;
                document.getElementById('track-location').textContent = 'Stop Tracking';
                
                // Update chat with nearby stores
                findNearbyStores(pos);
            },
            (error) => {
                console.error('Geolocation error:', error);
                statusElement.textContent = 'Error getting location: ' + error.message;
            },
            {
                enableHighAccuracy: true,
                maximumAge: 10000,
                timeout: 5000
            }
        );
    } else {
        statusElement.textContent = 'Geolocation is not supported by your browser';
    }
}

// Find stores near a given location
function findNearbyStores(location, radius = 2000) {
    const nearbyStores = stores.filter(store => {
        const distance = getDistance(location, store.location);
        return distance <= radius;
    });
    
    if (nearbyStores.length > 0) {
        const storeNames = nearbyStores.map(store => store.name).join(', ');
        addBotMessage(`I found ${nearbyStores.length} stores near you: ${storeNames}`);
    } else {
        addBotMessage("I couldn't find any stores near your current location.");
    }
}

// Calculate distance between two coordinates in meters
function getDistance(pos1, pos2) {
    const R = 6371e3; // Earth radius in meters
    const φ1 = pos1.lat * Math.PI/180;
    const φ2 = pos2.lat * Math.PI/180;
    const Δφ = (pos2.lat-pos1.lat) * Math.PI/180;
    const Δλ = (pos2.lng-pos1.lng) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
}

// Initialize voice recognition
function initVoiceRecognition() {
    try {
        recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            document.getElementById('user-input').value = transcript;
            processUserInput(transcript);
        };
        
        recognition.onerror = (event) => {
            console.error('Voice recognition error:', event.error);
            addBotMessage("Sorry, I didn't catch that. Could you try again?");
            document.getElementById('voice-btn').classList.remove('mic-active');
            isListening = false;
        };
        
        recognition.onend = () => {
            if (isListening) {
                recognition.start();
            } else {
                document.getElementById('voice-btn').classList.remove('mic-active');
            }
        };
    } catch (e) {
        console.error('Voice recognition not supported:', e);
        document.getElementById('voice-btn').style.display = 'none';
    }
}

// Toggle voice recognition
function toggleVoiceRecognition() {
    if (!recognition) return;
    
    if (isListening) {
        recognition.stop();
        isListening = false;
    } else {
        try {
            recognition.start();
            isListening = true;
            document.getElementById('voice-btn').classList.add('mic-active');
            addBotMessage("I'm listening... What would you like to find?");
        } catch (e) {
            console.error('Error starting recognition:', e);
            addBotMessage("Sorry, I couldn't start listening. Please try again.");
        }
    }
}

// Toggle chat visibility
function toggleChat() {
    const messages = document.getElementById('chat-messages');
    const input = document.getElementById('chat-input');
    const toggle = document.getElementById('chat-toggle');
    
    if (messages.style.display === 'none') {
        messages.style.display = 'block';
        input.style.display = 'flex';
        toggle.textContent = '−';
    } else {
        messages.style.display = 'none';
        input.style.display = 'none';
        toggle.textContent = '+';
    }
}

// Send message from user
function sendMessage() {
    const input = document.getElementById('user-input');
    const message = input.value.trim();
    
    if (message) {
        addUserMessage(message);
        input.value = '';
        processUserInput(message);
    }
}

// Add user message to chat
function addUserMessage(text) {
    const messages = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user-message';
    messageDiv.textContent = text;
    messages.appendChild(messageDiv);
    messages.scrollTop = messages.scrollHeight;
}

// Add bot message to chat
function addBotMessage(text) {
    const messages = document.getElementById('chat-messages');
    
    // Remove any existing typing indicator
    const typingIndicator = document.querySelector('.typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot-message';
    messageDiv.textContent = text;
    messages.appendChild(messageDiv);
    messages.scrollTop = messages.scrollHeight;
}

// Show typing indicator
function showTypingIndicator() {
    const messages = document.getElementById('chat-messages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot-message typing-indicator';
    typingDiv.textContent = 'AI is typing';
    messages.appendChild(typingDiv);
    messages.scrollTop = messages.scrollHeight;
}

// Process user input and generate response
function processUserInput(input) {
    const lowerInput = input.toLowerCase();
    showTypingIndicator();
    
    // Simulate AI processing delay
    setTimeout(() => {
        if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
            addBotMessage("Hello! I can help you find stores in Coimbatore. Try asking about specific items or stores.");
        } 
        else if (lowerInput.includes('near me') || lowerInput.includes('nearby') || lowerInput.includes('close to me')) {
            if (currentUserLocation) {
                findNearbyStores(currentUserLocation);
            } else {
                addBotMessage("I need your location to find nearby stores. Please click 'Track My Location' first.");
            }
        }
        else if (lowerInput.includes('find') || lowerInput.includes('search') || lowerInput.includes('where')) {
            const searchTerm = extractSearchTerm(input);
            if (searchTerm) {
                document.getElementById('search').value = searchTerm;
                filterStores(searchTerm.toLowerCase());
                addBotMessage(`Showing results for "${searchTerm}". You can also click on stores in the list to see them on the map.`);
            } else {
                addBotMessage("What would you like me to search for? For example, 'Find rice' or 'Where can I buy oil?'");
            }
        }
        else if (lowerInput.includes('list') || lowerInput.includes('show all') || lowerInput.includes('all stores')) {
            document.getElementById('search').value = '';
            filterStores('');
            addBotMessage("Showing all stores in Coimbatore.");
        }
        else if (lowerInput.includes('help')) {
            addBotMessage("I can help you:\n- Find stores by name or items\n- Show stores near your location\n- List all stores\n\nTry saying:\n'Find rice'\n'Stores near me'\n'Show all stores with oil'");
        }
        else {
            // Default search
            document.getElementById('search').value = input;
            filterStores(input.toLowerCase());
            addBotMessage(`Showing results for "${input}".`);
        }
    }, 1000);
}

// Extract search term from user input
function extractSearchTerm(input) {
    const phrases = ['find', 'search', 'where', 'show', 'look for', 'locate'];
    for (const phrase of phrases) {
        if (input.toLowerCase().includes(phrase)) {
            return input.substring(input.toLowerCase().indexOf(phrase) + phrase.length).trim();
        }
    }
    return input;
}

// Add stores to map
function addStoresToMap() {
    stores.forEach(store => {
        addStoreToMap(store);
    });
}

// Add single store to map
function addStoreToMap(store) {
    // Create marker
    const marker = new google.maps.Marker({
        position: store.location,
        map: map,
        title: store.name,
        icon: {
            url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
            scaledSize: new google.maps.Size(32, 32)
        }
    });
    
    // Create info window
    const infoWindow = new google.maps.InfoWindow({
        content: `
            <div style="min-width:200px">
                <h3 style="margin:5px 0">${store.name}</h3>
                <h4 style="margin:5px 0">Inventory:</h4>
                <div style="max-height:200px;overflow-y:auto">
                    ${Object.entries(store.inventory).map(([item, quantity]) => `
                        <div style="display:flex;justify-content:space-between;padding:3px 0;border-bottom:1px solid #eee">
                            <span>${item}</span>
                            <span style="font-weight:bold">${quantity}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `
    });
    
    // Add click listener
    marker.addListener('click', () => {
        infoWindows.forEach(iw => iw.close());
        infoWindow.open(map, marker);
    });
    
    // Add to store list
    const storeItem = document.createElement('div');
    storeItem.className = 'store-item';
    storeItem.innerHTML = `
        <div class="store-name">${store.name}</div>
        <div>
            ${Object.entries(store.inventory).map(([item, quantity]) => `
                <div class="inventory-item">
                    <span>${item}</span>
                    <span>${quantity}</span>
                </div>
            `).join('')}
        </div>
    `;
    
    storeItem.addEventListener('click', () => {
        map.panTo(store.location);
        map.setZoom(16);
        infoWindows.forEach(iw => iw.close());
        infoWindow.open(map, marker);
    });
    
    document.getElementById('store-list').appendChild(storeItem);
    
    // Store references
    markers.push(marker);
    infoWindows.push(infoWindow);
}

// Filter stores based on search term
function filterStores(searchTerm) {
    const storeList = document.getElementById('store-list');
    storeList.innerHTML = '';
    
    markers.forEach((marker, index) => {
        const store = stores[index];
        const matches = store.name.toLowerCase().includes(searchTerm) || 
                       Object.keys(store.inventory).some(item => 
                           item.toLowerCase().includes(searchTerm));
        
        marker.setVisible(matches);
        
        if (matches || !searchTerm) {
            const storeItem = document.createElement('div');
            storeItem.className = 'store-item';
            storeItem.innerHTML = `
                <div class="store-name">${store.name}</div>
                <div>
                    ${Object.entries(store.inventory)
                      .filter(([item, quantity]) => 
                        !searchTerm || item.toLowerCase().includes(searchTerm))
                      .map(([item, quantity]) => `
                        <div class="inventory-item">
                            <span>${item}</span>
                            <span>${quantity}</span>
                        </div>
                      `).join('')}
                </div>
            `;
            
            storeItem.addEventListener('click', () => {
                map.panTo(store.location);
                map.setZoom(16);
                infoWindows.forEach(iw => iw.close());
                infoWindows[index].open(map, marker);
            });
            
            storeList.appendChild(storeItem);
        }
    });
}

// Initialize the app when Google Maps API is loaded
window.initMap = initMap;