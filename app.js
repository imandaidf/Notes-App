// DOM elements
const noteTitle = document.getElementById('note-title');
const noteContent = document.getElementById('note-content');
const saveNoteBtn = document.getElementById('save-note-btn');
const cancelEditBtn = document.getElementById('cancel-edit-btn');
const notesList = document.getElementById('notes-list');
const noNotesMessage = document.getElementById('no-notes-message');

let notes = [];
let editId = null;

// Utilities
function formatDate(ts) {
    const d = new Date(ts);
    return d.toLocaleString();
}

function generateId() {
    return 'note-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
}

// Storage
function saveNotesToStorage() {
    localStorage.setItem('notes-app-v2', JSON.stringify(notes));
}

function loadNotesFromStorage() {
    const raw = localStorage.getItem('notes-app-v2');
    notes = raw ? JSON.parse(raw) : [];
}

// UI
function clearInputs() {
    noteTitle.value = '';
    noteContent.value = '';
}

function renderNotes() {
    notesList.innerHTML = '';
    if (!notes.length) {
        noNotesMessage.style.display = 'block';
        return;
    }
    noNotesMessage.style.display = 'none';
    notes.forEach(note => {
        const card = document.createElement('div');
        card.className = 'note-card';

        const titleEl = document.createElement('div');
        titleEl.className = 'note-title';
        titleEl.textContent = note.title;

        const contentEl = document.createElement('div');
        contentEl.className = 'note-content';
        contentEl.textContent = note.content;

        const metaEl = document.createElement('div');
        metaEl.className = 'note-meta';
        metaEl.textContent = formatDate(note.timestamp);

        const actions = document.createElement('div');
        actions.className = 'note-actions';

        const editBtn = document.createElement('button');
        editBtn.className = 'edit-btn';
        editBtn.textContent = 'Edit';
        editBtn.onclick = () => startEditNote(note.id);

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = 'Delete';
        deleteBtn.onclick = () => handleDeleteNote(note.id);

        actions.appendChild(editBtn);
        actions.appendChild(deleteBtn);

        card.appendChild(titleEl);
        card.appendChild(contentEl);
        card.appendChild(metaEl);
        card.appendChild(actions);

        notesList.appendChild(card);
    });
}

// Note Actions
function handleSaveNote() {
    const title = noteTitle.value.trim();
    const content = noteContent.value.trim();
    if (!title && !content) {
        alert('Please enter a title or content for your note.');
        return;
    }
    const now = Date.now();

    if (editId) {
        // Editing mode
        const idx = notes.findIndex(n => n.id === editId);
        if (idx !== -1) {
            notes[idx].title = title;
            notes[idx].content = content;
            notes[idx].timestamp = now;
        }
        editId = null;
        saveNoteBtn.textContent = 'Save Note';
        cancelEditBtn.style.display = 'none';
    } else {
        // New note
        const note = {
            id: generateId(),
            title,
            content,
            timestamp: now
        };
        notes.unshift(note); // newest first
    }
    clearInputs();
    saveNotesToStorage();
    renderNotes();
}

function handleDeleteNote(id) {
    const idx = notes.findIndex(n => n.id === id);
    if (idx === -1) return;
    const confirmDelete = confirm('Are you sure you want to delete this note?');
    if (!confirmDelete) return;
    notes.splice(idx, 1);
    saveNotesToStorage();
    renderNotes();
}

function startEditNote(id) {
    const note = notes.find(n => n.id === id);
    if (!note) return;
    noteTitle.value = note.title;
    noteContent.value = note.content;
    editId = id;
    saveNoteBtn.textContent = 'Update Note';
    cancelEditBtn.style.display = 'inline-block';
    noteTitle.focus();
}

function handleCancelEdit() {
    clearInputs();
    editId = null;
    saveNoteBtn.textContent = 'Save Note';
    cancelEditBtn.style.display = 'none';
}

// Event Listeners
saveNoteBtn.addEventListener('click', handleSaveNote);
cancelEditBtn.addEventListener('click', handleCancelEdit);

noteTitle.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        noteContent.focus();
    }
});

noteContent.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        handleSaveNote();
    }
});

// Initialize
loadNotesFromStorage();
renderNotes();
