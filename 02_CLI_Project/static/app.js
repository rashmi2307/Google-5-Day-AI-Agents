// App State
let state = {
    updates: [],
    filteredUpdates: [],
    selectedNote: null,
    activeFilter: 'all',
    searchQuery: '',
    originalTweetText: ''
};

// DOM Elements
const notesFeed = document.getElementById('notes-feed');
const refreshBtn = document.getElementById('refresh-btn');
const spinnerIcon = refreshBtn.querySelector('.spinner-icon');
const searchInput = document.getElementById('search-input');
const filterBtns = document.querySelectorAll('.filter-btn');

// Stats Counters
const statTotal = document.getElementById('stat-total');
const statFeatures = document.getElementById('stat-features');
const statChanges = document.getElementById('stat-changes');
const statBreaking = document.getElementById('stat-breaking');

// Composer Elements
const composerPlaceholder = document.getElementById('composer-placeholder');
const composerBody = document.getElementById('composer-body');
const previewTypeBadge = document.getElementById('preview-type-badge');
const previewDate = document.getElementById('preview-date');
const previewText = document.getElementById('preview-text');
const tweetTextarea = document.getElementById('tweet-textarea');
const charCounter = document.getElementById('char-counter');
const btnShorten = document.getElementById('btn-shorten');
const btnReset = document.getElementById('btn-reset');
const copyTweetBtn = document.getElementById('copy-tweet-btn');
const tweetBtn = document.getElementById('tweet-btn');

// Toast Element
const toast = document.getElementById('toast');

// Emoji mapping for tweet templates
const emojiMap = {
    'Feature': '🚀',
    'Change': '🔄',
    'Breaking': '⚠️',
    'Announcement': '📢',
    'Issue': '🐛',
    'Update': '⚡'
};

/* --------------------------------------------------
   INITIALIZATION & API FETCH
-------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
    fetchReleaseNotes();
    setupEventListeners();
});

// Fetch Release Notes from backend API
async function fetchReleaseNotes() {
    toggleLoading(true);
    try {
        const response = await fetch('/api/release-notes');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        
        state.updates = data.updates || [];
        state.filteredUpdates = [...state.updates];
        
        renderStats();
        applyFiltersAndSearch();
        showToast('Release notes successfully updated.');
    } catch (error) {
        console.error('Error fetching release notes:', error);
        notesFeed.innerHTML = `
            <div class="no-results">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <h3>Failed to load release notes</h3>
                <p>Could not reach the server or parse the XML feed. Please check your internet connection and try again.</p>
                <button class="btn btn-secondary" onclick="fetchReleaseNotes()">Try Again</button>
            </div>
        `;
        showToast('Error: Failed to fetch updates.', 'danger');
    } finally {
        toggleLoading(false);
    }
}

// Toggle refresh spin and loading skeletons
function toggleLoading(isLoading) {
    if (isLoading) {
        spinnerIcon.classList.add('spinning');
        refreshBtn.disabled = true;
        // Render Skeletons
        notesFeed.innerHTML = Array(3).fill(0).map(() => `
            <div class="skeleton-card">
                <div class="skeleton-line short"></div>
                <div class="skeleton-line title"></div>
                <div class="skeleton-line"></div>
                <div class="skeleton-line"></div>
            </div>
        `).join('');
    } else {
        spinnerIcon.classList.remove('spinning');
        refreshBtn.disabled = false;
    }
}

/* --------------------------------------------------
   STATS & FILTER LOGIC
-------------------------------------------------- */
function renderStats() {
    statTotal.textContent = state.updates.length;
    statFeatures.textContent = state.updates.filter(n => n.type === 'Feature').length;
    statChanges.textContent = state.updates.filter(n => n.type === 'Change').length;
    statBreaking.textContent = state.updates.filter(n => ['Breaking', 'Issue'].includes(n.type)).length;
}

function applyFiltersAndSearch() {
    const query = state.searchQuery.toLowerCase();
    
    state.filteredUpdates = state.updates.filter(note => {
        // Category Filter Match
        let typeMatches = true;
        if (state.activeFilter !== 'all') {
            if (state.activeFilter === 'breaking') {
                typeMatches = ['breaking', 'issue'].includes(note.type.toLowerCase());
            } else {
                typeMatches = note.type.toLowerCase() === state.activeFilter;
            }
        }
        
        // Search Query Match (checks date, type, content text)
        const textMatches = 
            note.date.toLowerCase().includes(query) ||
            note.type.toLowerCase().includes(query) ||
            note.content_text.toLowerCase().includes(query);
            
        return typeMatches && textMatches;
    });
    
    renderFeed();
}

/* --------------------------------------------------
   FEED RENDER LOGIC
-------------------------------------------------- */
function renderFeed() {
    if (state.filteredUpdates.length === 0) {
        notesFeed.innerHTML = `
            <div class="no-results">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <h3>No updates found</h3>
                <p>Try modifying your search keywords or checking a different category.</p>
            </div>
        `;
        return;
    }
    
    notesFeed.innerHTML = state.filteredUpdates.map(note => {
        const isSelected = state.selectedNote && state.selectedNote.id === note.id;
        const typeClass = note.type.toLowerCase();
        
        return `
            <div class="note-card ${isSelected ? 'selected' : ''}" data-id="${note.id}">
                <div class="note-header">
                    <span class="badge ${typeClass}">${note.type}</span>
                    <span class="note-date">${note.date}</span>
                </div>
                <div class="note-body">
                    ${note.content_html}
                </div>
                <div class="note-footer">
                    <a href="${note.link}" class="original-link-btn" target="_blank" rel="noopener noreferrer">
                        Original Release Notes
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                            <polyline points="15 3 21 3 21 9"></polyline>
                            <line x1="10" y1="14" x2="21" y2="3"></line>
                        </svg>
                    </a>
                    
                    <div class="select-indicator">
                        <span>Select for Tweet</span>
                        <div class="checkbox-visual">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    // Add Click listeners to new cards
    document.querySelectorAll('.note-card').forEach(card => {
        card.addEventListener('click', (e) => {
            // If user clicked inside a link, don't trigger selection
            if (e.target.tagName === 'A' || e.target.closest('a')) {
                return;
            }
            const noteId = card.getAttribute('data-id');
            selectNote(noteId);
        });
    });
}

/* --------------------------------------------------
   SELECTION & COMPOSER LOGIC
-------------------------------------------------- */
function selectNote(noteId) {
    const targetNote = state.updates.find(n => n.id === noteId);
    
    // If clicking already selected note, deselect it
    if (state.selectedNote && state.selectedNote.id === noteId) {
        state.selectedNote = null;
        state.originalTweetText = '';
        composerPlaceholder.classList.remove('hidden');
        composerBody.classList.add('hidden');
    } else {
        state.selectedNote = targetNote;
        
        // Generate Default Tweet Text
        const emoji = emojiMap[targetNote.type] || '⚡';
        const rawContent = targetNote.content_text;
        
        // Format: Emoji + Type: Date - Content text - Link
        state.originalTweetText = `${emoji} BigQuery Release [${targetNote.date}] | ${targetNote.type}\n\n${rawContent}\n\nRead more: ${targetNote.link}`;
        
        // Populate DOM
        previewTypeBadge.className = `badge ${targetNote.type.toLowerCase()}`;
        previewTypeBadge.textContent = targetNote.type;
        previewDate.textContent = targetNote.date;
        previewText.innerHTML = targetNote.content_html;
        
        tweetTextarea.value = state.originalTweetText;
        updateCharCount();
        
        composerPlaceholder.classList.add('hidden');
        composerBody.classList.remove('hidden');
        
        // Focus and select the text area briefly to draw user attention
        tweetTextarea.focus();
    }
    
    // Re-render feed to show active selected visual borders
    renderFeed();
}

function updateCharCount() {
    const len = tweetTextarea.value.length;
    charCounter.textContent = `${len} / 280`;
    
    // Manage character limits
    charCounter.className = 'char-counter';
    if (len > 280) {
        charCounter.classList.add('danger');
        tweetBtn.disabled = true;
    } else if (len > 240) {
        charCounter.classList.add('warning');
        tweetBtn.disabled = false;
    } else {
        tweetBtn.disabled = false;
    }
}

// Automatically shorten text if it overflows the 280 limit
function autoShortenTweet() {
    if (!state.selectedNote) return;
    
    const emoji = emojiMap[state.selectedNote.type] || '⚡';
    const dateStr = state.selectedNote.date;
    const typeStr = state.selectedNote.type;
    const linkStr = `Read more: ${state.selectedNote.link}`;
    
    // Fixed parts length
    const templatePrefix = `${emoji} BigQuery Release [${dateStr}] | ${typeStr}\n\n`;
    const templateSuffix = `\n\n${linkStr}`;
    
    const overhead = templatePrefix.length + templateSuffix.length;
    const maxBodyLen = 280 - overhead - 3; // 3 characters for "..."
    
    if (maxBodyLen <= 0) {
        showToast("Link and metadata are too long to fit a tweet!", "danger");
        return;
    }
    
    const bodyText = state.selectedNote.content_text;
    if (bodyText.length > maxBodyLen) {
        const shortenedBody = bodyText.substring(0, maxBodyLen) + '...';
        tweetTextarea.value = `${templatePrefix}${shortenedBody}${templateSuffix}`;
        updateCharCount();
        showToast('Tweet content successfully condensed!');
    } else {
        showToast('Tweet is already within character limit.');
    }
}

// Reset Composer Text
function resetTweetText() {
    if (!state.selectedNote) return;
    tweetTextarea.value = state.originalTweetText;
    updateCharCount();
    showToast('Reset to default template.');
}

// Copy Tweet text to clipboard
async function copyTweetToClipboard() {
    const text = tweetTextarea.value;
    try {
        await navigator.clipboard.writeText(text);
        showToast('Copied to clipboard!');
        
        // Visual button confirmation animation
        const originalText = copyTweetBtn.querySelector('span').textContent;
        copyTweetBtn.querySelector('span').textContent = 'Copied!';
        copyTweetBtn.classList.add('btn-primary');
        copyTweetBtn.classList.remove('btn-secondary');
        
        setTimeout(() => {
            copyTweetBtn.querySelector('span').textContent = originalText;
            copyTweetBtn.classList.remove('btn-primary');
            copyTweetBtn.classList.add('btn-secondary');
        }, 1500);
        
    } catch (err) {
        console.error('Clipboard copy failed:', err);
        showToast('Clipboard copy failed.', 'danger');
    }
}

// Tweet on X / Twitter Web Intent opening
function postToTwitter() {
    const text = tweetTextarea.value;
    const len = text.length;
    
    if (len > 280) {
        showToast('Tweet is too long! Please shorten it before posting.', 'danger');
        return;
    }
    
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'width=550,height=420,menubar=no,toolbar=no,scrollbars=yes');
}

/* --------------------------------------------------
   EVENT LISTENERS & UTILS
-------------------------------------------------- */
function setupEventListeners() {
    // Refresh action
    refreshBtn.addEventListener('click', fetchReleaseNotes);
    
    // Search filter
    searchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value;
        applyFiltersAndSearch();
    });
    
    // Category tabs filter
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.activeFilter = btn.getAttribute('data-filter');
            applyFiltersAndSearch();
        });
    });
    
    // Composer elements
    tweetTextarea.addEventListener('input', updateCharCount);
    btnShorten.addEventListener('click', autoShortenTweet);
    btnReset.addEventListener('click', resetTweetText);
    copyTweetBtn.addEventListener('click', copyTweetToClipboard);
    tweetBtn.addEventListener('click', postToTwitter);
}

// Global Toast message showing
function showToast(message, type = 'success') {
    toast.textContent = message;
    toast.className = 'toast'; // clear classes
    
    if (type === 'danger') {
        toast.style.borderColor = 'rgba(244, 63, 94, 0.4)';
        toast.style.background = '#271921';
    } else {
        toast.style.borderColor = 'rgba(16, 185, 129, 0.4)';
        toast.style.background = '#13251e';
    }
    
    toast.classList.remove('hidden');
    
    // Clear old timer if any
    if (window.toastTimer) clearTimeout(window.toastTimer);
    
    window.toastTimer = setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}
