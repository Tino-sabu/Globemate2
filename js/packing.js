// ============ PACKING MODULE ============
(function() {
  'use strict';
  
  const PackingList = {
    items: [],
    packingData: {
      beach: {
        essentials: ['Swimsuit', 'Sunscreen SPF 50+', 'Beach towel', 'Sunglasses', 'Sun hat', 'Flip flops', 'After-sun lotion'],
        clothing: ['Light dresses', 'Shorts', 'Tank tops', 'Light pants', 'Evening outfit'],
        accessories: ['Beach bag', 'Waterproof phone case', 'Snorkel gear']
      },
      city: {
        essentials: ['Comfortable walking shoes', 'Day backpack', 'Portable charger', 'City map/guide'],
        clothing: ['Casual outfits', 'Smart casual outfit', 'Comfortable jeans', 'Light jacket'],
        accessories: ['Camera', 'Reusable water bottle', 'Umbrella']
      },
      mountain: {
        essentials: ['Hiking boots', 'Backpack', 'Water bottles', 'First aid kit', 'Headlamp', 'Map/GPS'],
        clothing: ['Moisture-wicking shirts', 'Hiking pants', 'Warm jacket', 'Rain jacket', 'Thermal layers'],
        accessories: ['Trekking poles', 'Sunglasses', 'Hat', 'Gloves']
      },
      winter: {
        essentials: ['Winter coat', 'Thermal underwear', 'Warm boots', 'Gloves', 'Scarf', 'Winter hat'],
        clothing: ['Sweaters', 'Wool socks', 'Warm pants', 'Layers'],
        accessories: ['Hand warmers', 'Lip balm', 'Moisturizer']
      },
      business: {
        essentials: ['Laptop', 'Chargers', 'Business cards', 'Portfolio/briefcase'],
        clothing: ['Business suits', 'Dress shoes', 'Dress shirts', 'Ties/accessories'],
        accessories: ['Travel steamer', 'Shoe polish', 'Formal accessories']
      },
      adventure: {
        essentials: ['Durable backpack', 'Multi-tool', 'First aid kit', 'Insect repellent', 'Sunscreen'],
        clothing: ['Quick-dry clothing', 'Convertible pants', 'Long sleeve shirts', 'Bandana'],
        accessories: ['Binoculars', 'Head net', 'Compass', 'Whistle']
      }
    },

    init() {
      this.bindEvents();
      this.loadSavedList();
    },

    bindEvents() {
      const form = document.getElementById('packingForm');
      if (form) {
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          this.generateList();
        });
      }
    },

    loadSavedList() {
      const saved = localStorage.getItem('globeatePackingList');
      if (saved) {
        this.items = JSON.parse(saved);
        this.renderList();
      }
    },

    generateList() {
      const destType = document.getElementById('packDest').value;
      const duration = parseInt(document.getElementById('packDuration').value);
      const travelers = parseInt(document.getElementById('packTravelers').value);
      
      const laptop = document.getElementById('packLaptop').checked;
      const camera = document.getElementById('packCamera').checked;
      const fitness = document.getElementById('packFitness').checked;
      const kids = document.getElementById('packKids').checked;

      // Generate items based on destination
      const destItems = this.packingData[destType];
      this.items = [];

      // Add general items
      this.addCategory('📄 Documents', [
        'Passport',
        'Travel insurance',
        'Tickets/boarding passes',
        'Hotel confirmations',
        'Emergency contacts',
        'Visa (if required)'
      ]);

      // Add toiletries
      this.addCategory('🧴 Toiletries', [
        'Toothbrush & toothpaste',
        'Shampoo & conditioner',
        'Soap/body wash',
        'Deodorant',
        'Medications',
        'Contact lenses/glasses',
        'Razor',
        'Feminine hygiene products'
      ]);

      // Add destination-specific items
      if (destItems) {
        this.addCategory('✨ Essentials', destItems.essentials);
        this.addCategory('👔 Clothing', this.adjustForDuration(destItems.clothing, duration));
        this.addCategory('🎒 Accessories', destItems.accessories);
      }

      // Add electronics
      const electronics = ['Phone charger', 'Power adapter', 'Headphones'];
      if (laptop) electronics.push('Laptop', 'Laptop charger', 'Mouse');
      if (camera) electronics.push('Camera', 'Camera charger', 'Memory cards', 'Tripod');
      this.addCategory('🔌 Electronics', electronics);

      // Add fitness gear if selected
      if (fitness) {
        this.addCategory('💪 Fitness', [
          'Workout clothes',
          'Running shoes',
          'Fitness tracker',
          'Water bottle',
          'Resistance bands'
        ]);
      }

      // Add kids items if selected
      if (kids) {
        this.addCategory('👶 Kids Items', [
          'Diapers/wipes',
          'Baby food/formula',
          'Toys/entertainment',
          'Stroller',
          'Baby carrier',
          'Changing pad'
        ]);
      }

      // Add miscellaneous
      this.addCategory('🎯 Miscellaneous', [
        'Reusable bags',
        'Snacks',
        'Book/entertainment',
        'Travel pillow',
        'Eye mask',
        'Ear plugs'
      ]);

      this.saveList();
      this.renderList();
    },

    adjustForDuration(items, duration) {
      // Suggest quantities based on duration
      return items.map(item => {
        if (duration > 7) {
          return `${item} (${Math.ceil(duration / 3)}x)`;
        }
        return item;
      });
    },

    addCategory(category, items) {
      items.forEach(item => {
        this.items.push({
          id: Date.now() + Math.random(),
          category,
          name: item,
          checked: false
        });
      });
    },

    renderList() {
      const container = document.getElementById('packingList');
      if (!container) return;

      if (this.items.length === 0) {
        container.innerHTML = `
          <div class="empty-state">
            <i class="fas fa-box-open"></i>
            <p>Configure your trip and generate a packing list</p>
          </div>
        `;
        return;
      }

      // Group by category
      const categories = {};
      this.items.forEach(item => {
        if (!categories[item.category]) {
          categories[item.category] = [];
        }
        categories[item.category].push(item);
      });

      container.innerHTML = Object.entries(categories).map(([category, items]) => `
        <div class="packing-category">
          <h4 class="category-title">${category}</h4>
          <div class="packing-items">
            ${items.map(item => `
              <label class="packing-item ${item.checked ? 'checked' : ''}">
                <input type="checkbox" 
                  ${item.checked ? 'checked' : ''} 
                  onchange="PackingList.toggleItem(${item.id})">
                <span>${item.name}</span>
              </label>
            `).join('')}
          </div>
        </div>
      `).join('');

      this.updateProgress();
    },

    toggleItem(id) {
      const item = this.items.find(i => i.id === id);
      if (item) {
        item.checked = !item.checked;
        this.saveList();
        this.updateProgress();
      }
    },

    updateProgress() {
      const total = this.items.length;
      const checked = this.items.filter(i => i.checked).length;
      const percentage = total > 0 ? Math.round((checked / total) * 100) : 0;

      const progressText = document.getElementById('packProgress');
      const progressBar = document.getElementById('packProgressBar');

      if (progressText) {
        progressText.textContent = `${checked} / ${total}`;
      }

      if (progressBar) {
        progressBar.style.width = `${percentage}%`;
      }
    },

    saveList() {
      localStorage.setItem('globematePackingList', JSON.stringify(this.items));
    },

    cleanup() {
      // Clean up if needed
    }
  };

  // Expose to global scope
  window.PackingList = PackingList;

  // Auto-initialize
  if (typeof PageLoader !== 'undefined') {
    PageLoader.registerModule('packing', PackingList);
  } else {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => PackingList.init());
    } else {
      PackingList.init();
    }
  }
})();
