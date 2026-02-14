// ============ TRIP PLANNER MODULE ============
(function() {
  'use strict';
  
  const TripPlanner = {
    trips: [],
    currentTrip: null,

    init() {
      this.loadTrips();
      this.bindEvents();
      this.renderTrips();
    },

    bindEvents() {
      const form = document.getElementById('tripForm');
      if (form) {
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          this.saveTrip();
        });
      }

      const activityForm = document.getElementById('activityForm');
      if (activityForm) {
        activityForm.addEventListener('submit', (e) => {
          e.preventDefault();
          this.addActivity();
        });
      }
    },

    loadTrips() {
      const saved = localStorage.getItem('globemateTrips');
      if (saved) {
        this.trips = JSON.parse(saved);
      }
    },

    saveTrip() {
      const destination = document.getElementById('destination').value;
      const startDate = document.getElementById('startDate').value;
      const endDate = document.getElementById('endDate').value;
      const budget = document.getElementById('budget').value;

      const trip = {
        id: Date.now(),
        destination,
        startDate,
        endDate,
        budget,
        activities: [],
        createdAt: new Date().toISOString()
      };

      this.trips.push(trip);
      localStorage.setItem('globemateTrips', JSON.stringify(this.trips));
      this.renderTrips();
      document.getElementById('tripForm').reset();
    },

    addActivity() {
      if (!this.currentTrip) return;

      const title = document.getElementById('activityTitle').value;
      const date = document.getElementById('activityDate').value;
      const time = document.getElementById('activityTime').value;
      const location = document.getElementById('activityLocation').value;
      const notes = document.getElementById('activityNotes').value;

      const activity = {
        id: Date.now(),
        title,
        date,
        time,
        location,
        notes
      };

      const trip = this.trips.find(t => t.id === this.currentTrip);
      if (trip) {
        trip.activities.push(activity);
        localStorage.setItem('globemateTrips', JSON.stringify(this.trips));
        this.renderActivities();
        document.getElementById('activityForm').reset();
      }
    },

    renderTrips() {
      const container = document.getElementById('savedTrips');
      if (!container) return;

      if (this.trips.length === 0) {
        container.innerHTML = `
          <div class="empty-state">
            <i class="fas fa-route"></i>
            <p>No trips planned yet. Create your first trip above!</p>
          </div>
        `;
        return;
      }

      container.innerHTML = this.trips.map(trip => `
        <div class="trip-card">
          <div class="trip-header">
            <h4>${trip.destination}</h4>
            <button class="btn-icon" onclick="TripPlanner.deleteTrip(${trip.id})">
              <i class="fas fa-trash"></i>
            </button>
          </div>
          <div class="trip-details">
            <p><i class="fas fa-calendar"></i> ${trip.startDate} to ${trip.endDate}</p>
            <p><i class="fas fa-dollar-sign"></i> Budget: $${trip.budget}</p>
            <p><i class="fas fa-list"></i> ${trip.activities.length} activities</p>
          </div>
          <button class="btn btn-secondary btn-sm" onclick="TripPlanner.viewTrip(${trip.id})">
            View Details
          </button>
        </div>
      `).join('');
    },

    renderActivities() {
      const container = document.getElementById('itineraryList');
      if (!container || !this.currentTrip) return;

      const trip = this.trips.find(t => t.id === this.currentTrip);
      if (!trip || trip.activities.length === 0) {
        container.innerHTML = `
          <div class="empty-state">
            <i class="fas fa-clipboard-list"></i>
            <p>No activities planned yet</p>
          </div>
        `;
        return;
      }

      container.innerHTML = trip.activities.map(activity => `
        <div class="activity-item">
          <div class="activity-time">
            <div class="activity-date">${activity.date}</div>
            <div class="activity-time-text">${activity.time}</div>
          </div>
          <div class="activity-content">
            <h4>${activity.title}</h4>
            <p><i class="fas fa-map-marker-alt"></i> ${activity.location}</p>
            ${activity.notes ? `<p class="activity-notes">${activity.notes}</p>` : ''}
          </div>
          <button class="btn-icon" onclick="TripPlanner.deleteActivity(${activity.id})">
            <i class="fas fa-times"></i>
          </button>
        </div>
      `).join('');
    },

    viewTrip(id) {
      this.currentTrip = id;
      this.renderActivities();
      // Scroll to itinerary builder
      document.getElementById('itineraryBuilder')?.scrollIntoView({ behavior: 'smooth' });
    },

    deleteTrip(id) {
      if (!confirm('Are you sure you want to delete this trip?')) return;
      this.trips = this.trips.filter(t => t.id !== id);
      localStorage.setItem('globemateTrips', JSON.stringify(this.trips));
      this.renderTrips();
    },

    deleteActivity(id) {
      if (!this.currentTrip) return;
      const trip = this.trips.find(t => t.id === this.currentTrip);
      if (trip) {
        trip.activities = trip.activities.filter(a => a.id !== id);
        localStorage.setItem('globemateTrips', JSON.stringify(this.trips));
        this.renderActivities();
      }
    },

    cleanup() {
      // Clean up event listeners and state
      this.currentTrip = null;
    }
  };

  // Expose to global scope for onclick handlers
  window.TripPlanner = TripPlanner;

  // Auto-initialize if PageLoader is available
  if (typeof PageLoader !== 'undefined') {
    PageLoader.registerModule('trip-planner', TripPlanner);
  } else {
    // Initialize on DOM ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => TripPlanner.init());
    } else {
      TripPlanner.init();
    }
  }
})();
