// ============ COUNTRY INFO MODULE ============
(function() {
  'use strict';
  
  const CountryExplorer = {
    countries: [],
    currentCountry: null,
    isLoading: false,

    init() {
      console.log('Country Explorer initializing...');
      this.bindEvents();
      this.loadCountries();
    },

    bindEvents() {
      console.log('Binding events...');
      
      const searchInput = document.getElementById('countrySearch');
      const checkVisaBtn = document.getElementById('checkVisaBtn');

      console.log('Search input found:', !!searchInput);
      console.log('Visa button found:', !!checkVisaBtn);

      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          console.log('Search input event triggered:', e.target.value);
          this.handleSearch(e.target.value);
        });
        
        // Close suggestions when clicking outside
        document.addEventListener('click', (e) => {
          if (!searchInput.contains(e.target)) {
            const dropdown = document.getElementById('countrySuggestions');
            if (dropdown) {
              dropdown.classList.add('hidden');
            }
          }
        });
        
        console.log('Search input event listener attached');
      } else {
        console.error('Search input element not found! ID: countrySearch');
      }

      if (checkVisaBtn) {
        checkVisaBtn.addEventListener('click', () => {
          this.checkVisa();
        });
      } else {
        console.warn('Visa check button not found! ID: checkVisaBtn');
      }
    },

    async loadCountries() {
      if (this.isLoading) return;
      
      try {
        this.isLoading = true;
        console.log('Fetching countries from REST Countries API...');
        
        // Show toast only if available
        if (typeof showToast === 'function') {
          showToast('Loading countries data...', 'info');
        }
        
        const response = await fetch('https://restcountries.com/v3.1/all');
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        this.countries = await response.json();
        console.log(`✓ Loaded ${this.countries.length} countries successfully`);
        
        this.populatePassportDropdown();
        
        if (typeof showToast === 'function') {
          showToast('Countries loaded successfully!', 'success');
        }
        
      } catch (error) {
        console.error('Error loading countries:', error);
        
        if (typeof showToast === 'function') {
          showToast('Failed to load countries. Using cached data.', 'error');
        }
        
        // Fallback: Use a small subset of countries
        this.countries = this.getFallbackCountries();
        this.populatePassportDropdown();
        console.log('Using fallback countries:', this.countries.length);
      } finally {
        this.isLoading = false;
      }
    },
    
    getFallbackCountries() {
      // Fallback data in case API fails
      return [
        { name: { common: 'United States', official: 'United States of America' }, cca3: 'USA', flags: { svg: 'https://flagcdn.com/us.svg' } },
        { name: { common: 'United Kingdom', official: 'United Kingdom of Great Britain' }, cca3: 'GBR', flags: { svg: 'https://flagcdn.com/gb.svg' } },
        { name: { common: 'Canada', official: 'Canada' }, cca3: 'CAN', flags: { svg: 'https://flagcdn.com/ca.svg' } },
        { name: { common: 'Australia', official: 'Australia' }, cca3: 'AUS', flags: { svg: 'https://flagcdn.com/au.svg' } },
        { name: { common: 'Japan', official: 'Japan' }, cca3: 'JPN', flags: { svg: 'https://flagcdn.com/jp.svg' } },
        { name: { common: 'Germany', official: 'Germany' }, cca3: 'DEU', flags: { svg: 'https://flagcdn.com/de.svg' } },
        { name: { common: 'France', official: 'France' }, cca3: 'FRA', flags: { svg: 'https://flagcdn.com/fr.svg' } }
      ];
    },

    handleSearch(query) {
      const dropdown = document.getElementById('countrySuggestions');
      
      if (!dropdown) {
        console.error('Suggestions dropdown not found!');
        return;
      }
      
      if (query.length < 2) {
        dropdown.classList.add('hidden');
        return;
      }

      console.log(`Searching for: "${query}", Total countries: ${this.countries.length}`);

      if (this.countries.length === 0) {
        dropdown.innerHTML = '<div class="suggestion-item"><span>Loading countries, please wait...</span></div>';
        dropdown.classList.remove('hidden');
        return;
      }

      const matches = this.countries.filter(country => 
        country.name.common.toLowerCase().includes(query.toLowerCase()) ||
        country.name.official.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8);

      console.log(`Found ${matches.length} matches for "${query}"`);
      this.showSuggestions(matches, query);
    },

    showSuggestions(countries, query) {
      const dropdown = document.getElementById('countrySuggestions');
      if (!dropdown) return;

      if (countries.length === 0) {
        dropdown.innerHTML = `
          <div class="suggestion-item">
            <i class="fas fa-search"></i>
            <span>No countries found for "${query}"</span>
          </div>
        `;
        dropdown.classList.remove('hidden');
        return;
      }

      // Display matching countries with flags
      dropdown.innerHTML = countries.map(country => `
        <div class="suggestion-item" data-country="${country.cca3}">
          <img src="${country.flags.svg}" alt="${country.name.common}">
          <div>
            <strong>${country.name.common}</strong>
            <small>${country.name.official}</small>
          </div>
        </div>
      `).join('');

      // Add click handlers for suggestions
      dropdown.querySelectorAll('.suggestion-item').forEach(item => {
        item.addEventListener('click', () => {
          const countryCode = item.dataset.country;
          this.selectCountry(countryCode);
        });
      });

      dropdown.classList.remove('hidden');
    },

    selectCountry(code) {
      const country = this.countries.find(c => c.cca3 === code);
      if (!country) {
        console.error(`Country not found: ${code}`);
        return;
      }

      console.log('Selected country:', country.name.common);
      
      this.currentCountry = country;
      this.displayCountryInfo(country);
      document.getElementById('countrySuggestions')?.classList.add('hidden');
      document.getElementById('countrySearch').value = country.name.common;
      
      // Clear visa result when selecting new country
      const visaResult = document.getElementById('visaResult');
      if (visaResult) {
        visaResult.innerHTML = '';
        visaResult.classList.add('hidden');
      }
    },

    displayCountryInfo(country) {
      console.log('Displaying info for:', country.name.common);
      
      try {
        // Update flag and name
        const flagImg = document.getElementById('countryFlag');
        const nameEl = document.getElementById('countryName');
        const officialNameEl = document.getElementById('countryOfficialName');
        
        if (flagImg) flagImg.src = country.flags.svg;
        if (nameEl) nameEl.textContent = country.name.common;
        if (officialNameEl) officialNameEl.textContent = country.name.official;

        // Update info cards
        this.setTextContent('countryCapital', country.capital?.[0] || 'N/A');
        
        const regio{
        console.warn('Passport dropdown not found');
        return;
      }

      if (this.countries.length === 0) {
        console.warn('No countries loaded yet');
        return;
      }

      const sortedCountries = [...this.countries].sort((a, b) => 
        a.name.common.localeCompare(b.name.common)
      );

      select.innerHTML = '<option value="">Select your passport country</option>' +
        sortedCountries.map(country => `
          <option value="${country.cca3}">${country.name.common}</option>
        `).join('');
        
      console.log('Passport dropdown populated with', sortedCountries.length, 'countries;
        this.setTextContent('countryLanguages', languages);
        
        const currency = country.currencies ? Object.values(country.currencies)[0] : null;
        const currencyText = currency 
          ? `${currency.name}${currency.symbol ? ` (${currency.symbol})` : ''}`
          : 'N/A';
        this.setTextContent('countryCurrency', currencyText);
        
        this.setTextContentCode = document.getElementById('passportCountry')?.value;
      const resultDiv = document.getElementById('visaResult');
      
      if (!passportCountryCode) {
        showToast('Please select your passport country', 'warning');
        return;
      }
      
      if (!this.currentCountry) {
        showToast('Please search and select a destination country first', 'warning');
        return;
      }

      const passportCountry = this.countries.find(c => c.cca3 === passportCountryCode);
      
      console.log(`Checking visa: ${passportCountry?.name.common} → ${this.currentCountry.name.common}`);

      // Get visa information
      const visaInfo = this.getVisaInfo(passportCountryCode, this.currentCountry.cca3);
      
      if (resultDiv) {
        resultDiv.innerHTML = `
          <div class="visa-status visa-${visaInfo.status}">
            <i class="fas fa-${visaInfo.icon}"></i>
            <h4>${visaInfo.title}</h4>
            <p>${visaInfo.message}</p>
            <small class="visa-note">
              <i class="fas fa-info-circle"></i> 
              Traveling from ${passportCountry?.name.common} to ${this.currentCountry.name.common}
            </small>
          </div>
        `;
        
        resultDiv.classList.remove('hidden');
      }
        console.error('Error displaying country info:', error);
        showToast('Error displaying country information', 'error');
      }
    },
    
    setTextContent(elementId, text) {
      const element = document.getElementById(elementId);
      if (element) {
        element.textContent = text;
      }gion}, ${country.subregion || ''}`;
      document.getElementById('countryPopulation').textContent = country.population.toLocaleString();
      document.getElementById('countryLanguages').textContent = 
        Object.values(country.languages || {}).join(', ') || 'N/A';
      
      const currency = Object.values(country.currencies || {})[0];
      document.getElementById('countryCurrency').textContent = 
        currency ? `${currency.name} (${currency.symbol})` : 'N/A';
      
      document.getElementById('countryTimezone').textContent = country.timezones?.[0] || 'N/A';
      document.getElementById('countryCallingCode').textContent = 
        country.idd?.root ? `${country.idd.root}${country.idd.suffixes?.[0] || ''}` : 'N/A';
      document.getElementById('countryDriving').textContent = country.car?.side || 'N/A';

      // Show result container
      document.getElementById('countryResult').classList.remove('hidden');
    },

    populatePassportDropdown() {
      const select = document.getElementById('passportCountry');
      if (!select) return;

      const sortedCountries = [...this.countries].sort((a, b) => 
        a.name.common.localeCompare(b.name.common)
      );

      select.innerHTML = '<option value="">Select your passport country</option>' +
        sortedCountries.map(country => `
          <option value="${country.cca3}">${country.name.common}</option>
        `).join('');
    },

    checkVisa() {
      const passportCountry = document.getElementById('passportCountry').value;
      const resultDiv = document.getElementById('visaResult');
      
      if (!passportCountry || !this.currentCountry) {
        alert('Please select a passport country');
        return;
      }

      // Mock visa information (in real app, use visa API)
      const visaInfo = this.getVisaInfo(passportCountry, this.currentCountry.cca3);
      
      resultDiv.innerHTML = `
        <div class="visa-status visa-${visaInfo.status}">
          <i class="fas fa-${visaInfo.icon}"></i>
          <h4>${visaInfo.title}</h4>
          <p>${visaInfo.message}</p>
        </div>
      `;
      
      resultDiv.classList.remove('hidden');
    },

    getVisaInfo(fromCountry, toCountry) {
      // Mock data - in production, integrate with visa API
      const random = Math.random();
      
      if (random < 0.3) {
        return {
          status: 'free',
          icon: 'check-circle',
          title: 'Visa Not Required',
          message: 'You can enter visa-free for tourism purposes.'
        };
      } else if (random < 0.6) {
        return {
          status: 'on-arrival',
          icon: 'plane-arrival',
          title: 'Visa on Arrival',
          message: 'You can obtain a visa upon arrival at the airport.'
        };
      } else {
        return {
          status: 'required',
          icon: 'exclamation-triangle',
          title: 'Visa Required',
          message: 'You need to apply for a visa before travelling.'
        };
      }
    },

    cleanup() {
      this.currentCountry = null;
    },
  };

  // Expose to global scope
  window.CountryExplorer = CountryExplorer;

  // Register with PageLoader
  if (typeof PageLoader !== 'undefined') {
    console.log('Registering CountryExplorer with PageLoader');
    PageLoader.registerModule('country-info', CountryExplorer);
  } else {
    console.log('PageLoader not found, initializing directly');
    // Auto-initialize if PageLoader not available
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        console.log('DOM loaded, initializing CountryExplorer');
        CountryExplorer.init();
      });
    } else {
      console.log('DOM already loaded, initializing CountryExplorer immediately');
      CountryExplorer.init();
    }
  }
  
  console.log('CountryExplorer module loaded');
})();
