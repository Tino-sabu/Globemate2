// ============ SAFETY MODULE ============
(function() {
  'use strict';
  
  const SafetyCenter = {
    init() {
      this.bindEvents();
    },

    bindEvents() {
      const searchBtn = document.getElementById('safetySearchBtn');
      const searchInput = document.getElementById('safetySearch');

      if (searchBtn) {
        searchBtn.addEventListener('click', () => {
          this.checkSafety();
        });
      }

      if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
            this.checkSafety();
          }
        });
      }
    },

    async checkSafety() {
      const country = document.getElementById('safetySearch').value.trim();
      
      if (!country) {
        alert('Please enter a country name');
        return;
      }

      // Mock safety data (in production, integrate with safety index API)
      const safetyData = this.getSafetyData(country);
      this.displaySafetyInfo(safetyData);
    },

    getSafetyData(country) {
      // Mock data - in production, use real safety API
      const score = Math.floor(Math.random() * 40) + 60; // 60-100
      
      return {
        country: country,
        score: score,
        level: this.getSafetyLevel(score),
        emergency: {
          ambulance: this.getRandomEmergencyNumber(),
          fire: this.getRandomEmergencyNumber(),
          police: this.getRandomEmergencyNumber()
        },
        tips: this.getSafetyTips(country)
      };
    },

    getSafetyLevel(score) {
      if (score >= 80) return { text: 'Very Safe', color: '#10b981' };
      if (score >= 70) return { text: 'Safe', color: '#3b82f6' };
      if (score >= 60) return { text: 'Moderate', color: '#f59e0b' };
      return { text: 'Exercise Caution', color: '#ef4444' };
    },

    getRandomEmergencyNumber() {
      const numbers = ['112', '911', '999', '100', '101', '102', '108'];
      return numbers[Math.floor(Math.random() * numbers.length)];
    },

    getSafetyTips(country) {
      return [
        'Keep copies of important documents in a secure location',
        'Register with your embassy upon arrival',
        'Avoid displaying expensive jewelry or electronics',
        'Be aware of your surroundings, especially in crowded areas',
        'Use official taxis or ride-sharing services',
        'Keep emergency numbers saved in your phone',
        'Inform someone of your travel itinerary',
        'Purchase comprehensive travel insurance'
      ];
    },

    displaySafetyInfo(data) {
      // Update safety score
      const scoreElement = document.getElementById('safetyScore');
      const gaugeElement = document.getElementById('safetyGauge');
      const levelElement = document.getElementById('safetyLevel');

      if (scoreElement) {
        scoreElement.textContent = data.score;
      }

      if (gaugeElement) {
        gaugeElement.style.setProperty('--score', `${data.score}%`);
        gaugeElement.style.setProperty('--score-color', data.level.color);
      }

      if (levelElement) {
        levelElement.textContent = data.level.text;
        levelElement.style.color = data.level.color;
      }

      // Update emergency numbers
      document.getElementById('emergencyAmbulance').textContent = data.emergency.ambulance;
      document.getElementById('emergencyFire').textContent = data.emergency.fire;
      document.getElementById('emergencyPolice').textContent = data.emergency.police;

      // Update safety tips
      const tipsList = document.getElementById('safetyTips');
      if (tipsList) {
        tipsList.innerHTML = data.tips.map(tip => `
          <li><i class="fas fa-check-circle"></i> ${tip}</li>
        `).join('');
      }

      // Show results
      document.getElementById('safetyResult').classList.remove('hidden');
    },

    cleanup() {
      // Clean up if needed
    }
  };

  // Expose to global scope
  window.SafetyCenter = SafetyCenter;

  // Auto-initialize
  if (typeof PageLoader !== 'undefined') {
    PageLoader.registerModule('safety', SafetyCenter);
  } else {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => SafetyCenter.init());
    } else {
      SafetyCenter.init();
    }
  }
})();
