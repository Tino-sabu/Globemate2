/* ========================================
   GlobeMate — Document Storage Module
   ======================================== */

const DocumentStore = (() => {
  let documents = loadFromLocal('documents') || [];
  let reminders = loadFromLocal('reminders') || [];

  function init() {
    try {
      const docForm = $('#docForm');
      const reminderForm = $('#reminderForm');
      const docFile = $('#docFile');
      
      if (docForm) docForm.addEventListener('submit', saveDocument);
      if (reminderForm) reminderForm.addEventListener('submit', saveReminder);
      if (docFile) docFile.addEventListener('change', handleFileSelect);
      
      renderDocuments();
      renderReminders();
      checkReminders();
    } catch (error) {
      console.error('DocumentStore initialization error:', error);
    }
  }

  function handleFileSelect(e) {
    const file = e.target.files[0];
    const fileNameEl = $('#fileName');
    if (fileNameEl) fileNameEl.textContent = file ? file.name : '';
  }

  function saveDocument(e) {
    e.preventDefault();
    const doc = {
      id: Date.now(),
      name: $('#docName').value,
      type: $('#docType').value,
      expiry: $('#docExpiry').value,
      notes: $('#docNotes').value,
      fileName: $('#docFile').files[0]?.name || '',
      createdAt: new Date().toISOString()
    };

    documents.push(doc);
    saveToLocal('documents', documents);
    $('#docForm').reset();
    const fileNameEl = $('#fileName');
    if (fileNameEl) fileNameEl.textContent = '';
    renderDocuments();
    showToast('Document saved securely!');
  }

  function deleteDocument(id) {
    documents = documents.filter(d => d.id !== id);
    saveToLocal('documents', documents);
    renderDocuments();
    showToast('Document removed', 'warning');
  }

  function renderDocuments() {
    const container = $('#documentsList');
    if (!container) return;
    
    if (documents.length === 0) {
      container.innerHTML = `<div class="empty-state"><i class="fas fa-folder-plus"></i><p>No documents stored yet</p></div>`;
      return;
    }

    const icons = { 
      passport: 'passport', 
      visa: 'stamp', 
      ticket: 'ticket-alt', 
      hotel: 'hotel', 
      insurance: 'file-shield', 
      id: 'id-card', 
      other: 'file-alt' 
    };

    container.innerHTML = documents.map(doc => `
      <div class="doc-item">
        <div class="doc-icon ${doc.type}">
          <i class="fas fa-${icons[doc.type] || 'file'}"></i>
        </div>
        <div class="doc-info">
          <h4>${doc.name}</h4>
          <p>${doc.expiry ? `Expires: ${formatDate(doc.expiry)}` : doc.notes || doc.type}</p>
          ${doc.fileName ? `<p><i class="fas fa-paperclip"></i> ${doc.fileName}</p>` : ''}
        </div>
        <button class="btn-delete" onclick="DocumentStore.deleteDocument(${doc.id})" title="Delete">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `).join('');
  }

  function saveReminder(e) {
    e.preventDefault();
    const reminder = {
      id: Date.now(),
      title: $('#reminderTitle').value,
      date: $('#reminderDate').value,
      priority: $('#reminderPriority').value,
      completed: false
    };

    reminders.push(reminder);
    saveToLocal('reminders', reminders);
    $('#reminderForm').reset();
    renderReminders();
    showToast('Reminder set!');
  }

  function deleteReminder(id) {
    reminders = reminders.filter(r => r.id !== id);
    saveToLocal('reminders', reminders);
    renderReminders();
  }

  function renderReminders() {
    const container = $('#remindersList');
    if (!container) return;
    
    if (reminders.length === 0) {
      container.innerHTML = `<div class="empty-state"><i class="fas fa-bell-slash"></i><p>No reminders set yet</p></div>`;
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const sorted = [...reminders].sort((a, b) => new Date(a.date) - new Date(b.date));

    container.innerHTML = sorted.map(r => {
      const isOverdue = r.date < today;
      const isToday = r.date === today;
      const badge = isToday ? 'today' : isOverdue ? 'overdue' : 'upcoming';
      const badgeText = isToday ? 'Today' : isOverdue ? 'Overdue' : 'Upcoming';

      return `
        <div class="reminder-item">
          <div class="reminder-priority ${r.priority}"></div>
          <div class="reminder-info">
            <h4>${r.title}</h4>
            <p><i class="fas fa-calendar"></i> ${formatDate(r.date)}</p>
          </div>
          <span class="reminder-badge ${badge}">${badgeText}</span>
          <button class="btn-delete" onclick="DocumentStore.deleteReminder(${r.id})" title="Delete">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      `;
    }).join('');
  }

  function checkReminders() {
    const today = new Date().toISOString().split('T')[0];
    const todayReminders = reminders.filter(r => r.date === today);
    const overdueReminders = reminders.filter(r => r.date < today);

    if (todayReminders.length > 0) {
      setTimeout(() => showToast(`You have ${todayReminders.length} reminder(s) for today!`, 'warning'), 1500);
    }
    if (overdueReminders.length > 0) {
      setTimeout(() => showToast(`You have ${overdueReminders.length} overdue reminder(s)!`, 'error'), 3000);
    }
  }

  function cleanup() {
    // Clean up if needed
  }

  return { init, deleteDocument, deleteReminder, cleanup };
})();

// Expose to global scope
if (typeof window !== 'undefined') {
  window.DocumentStore = DocumentStore;
}

// Register with PageLoader
if (typeof PageLoader !== 'undefined') {
  PageLoader.registerModule('documents', DocumentStore);
} else {
  // Auto-initialize if PageLoader not available
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => DocumentStore.init());
  } else {
    DocumentStore.init();
  }
}
