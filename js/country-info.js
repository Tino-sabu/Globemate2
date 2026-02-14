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
        
        if (typeof showToast === 'function') {
          showToast('Loading countries data...', 'info');
        }
        
        // API limit: max 10 fields
        const fields = 'name,capital,region,population,languages,currencies,flags,cca3,idd,car';
        const response = await fetch(`https://restcountries.com/v3.1/all?fields=${fields}`);
        
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
      return [
        { name: { common: 'United States', official: 'United States of America' }, cca3: 'USA', flags: { svg: 'https://flagcdn.com/us.svg' }, capital: ['Washington, D.C.'], region: 'Americas', population: 331002651 },
        { name: { common: 'United Kingdom', official: 'United Kingdom of Great Britain and Northern Ireland' }, cca3: 'GBR', flags: { svg: 'https://flagcdn.com/gb.svg' }, capital: ['London'], region: 'Europe', population: 67886011 },
        { name: { common: 'Canada', official: 'Canada' }, cca3: 'CAN', flags: { svg: 'https://flagcdn.com/ca.svg' }, capital: ['Ottawa'], region: 'Americas', population: 38005238 },
        { name: { common: 'Australia', official: 'Commonwealth of Australia' }, cca3: 'AUS', flags: { svg: 'https://flagcdn.com/au.svg' }, capital: ['Canberra'], region: 'Oceania', population: 25687041 },
        { name: { common: 'Japan', official: 'Japan' }, cca3: 'JPN', flags: { svg: 'https://flagcdn.com/jp.svg' }, capital: ['Tokyo'], region: 'Asia', population: 125836021 },
        { name: { common: 'Germany', official: 'Federal Republic of Germany' }, cca3: 'DEU', flags: { svg: 'https://flagcdn.com/de.svg' }, capital: ['Berlin'], region: 'Europe', population: 83240525 },
        { name: { common: 'France', official: 'French Republic' }, cca3: 'FRA', flags: { svg: 'https://flagcdn.com/fr.svg' }, capital: ['Paris'], region: 'Europe', population: 67391582 }
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
        
        const regionText = country.region || 'N/A';
        this.setTextContent('countryRegion', regionText);
        
        const population = country.population 
          ? country.population.toLocaleString() 
          : 'N/A';
        this.setTextContent('countryPopulation', population);
        
        const languages = country.languages 
          ? Object.values(country.languages).join(', ') 
          : 'N/A';
        this.setTextContent('countryLanguages', languages);
        
        const currency = country.currencies ? Object.values(country.currencies)[0] : null;
        const currencyText = currency 
          ? `${currency.name}${currency.symbol ? ` (${currency.symbol})` : ''}`
          : 'N/A';
        this.setTextContent('countryCurrency', currencyText);
        
        this.setTextContent('countryTimezone', 'N/A');
        
        const callingCode = country.idd?.root 
          ? `${country.idd.root}${country.idd.suffixes?.[0] || ''}` 
          : 'N/A';
        this.setTextContent('countryCallingCode', callingCode);
        
        const drivingSide = country.car?.side === 'left' ? 'Left' : 'Right';
        this.setTextContent('countryDriving', drivingSide);
        
        // Show country info section
        const countryResultDiv = document.getElementById('countryResult');
        if (countryResultDiv) {
          countryResultDiv.classList.remove('hidden');
        }
        
      } catch (error) {
        console.error('Error displaying country info:', error);
        if (typeof showToast === 'function') {
          showToast('Error displaying country information', 'error');
        }
      }
    },

    setTextContent(elementId, text) {
      const element = document.getElementById(elementId);
      if (element) {
        element.textContent = text;
      }
    },

    populatePassportDropdown() {
      const select = document.getElementById('passportCountry');
      
      if (!select) {
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
        
      console.log('Passport dropdown populated with', sortedCountries.length, 'countries');
    },

    checkVisa() {
      const passportCode = document.getElementById('passportCountry')?.value;
      const resultDiv = document.getElementById('visaResult');
      
      if (!passportCode) {
        if (typeof showToast === 'function') {
          showToast('Please select your passport country', 'warning');
        }
        return;
      }
      
      if (!this.currentCountry) {
        if (typeof showToast === 'function') {
          showToast('Please select a destination country first', 'warning');
        }
        return;
      }
      
      // Simplified visa logic (in reality, would need a comprehensive database)
      const visaInfo = this.getVisaRequirement(passportCode, this.currentCountry.cca3);
      
      if (resultDiv) {
        resultDiv.innerHTML = `
          <div class="visa-status visa-${visaInfo.status}">
            <i class="fas fa-${visaInfo.icon}"></i>
            <h4>${visaInfo.title}</h4>
            <p>${visaInfo.message}</p>
          </div>
        `;
        resultDiv.classList.remove('hidden');
      }
    },

    getVisaRequirement(passportCode, destinationCode) {
      // Same passport = no visa
      if (passportCode === destinationCode) {
        return {
          status: 'free',
          icon: 'check-circle',
          title: 'No Visa Required',
          message: 'You are a citizen of this country.'
        };
      }

      // Simplified logic - powerful passports
      const strongPassports = ['USA', 'GBR', 'CAN', 'AUS', 'DEU', 'FRA', 'JPN', 'ITA', 'ESP'];
      const easyDestinations = ['USA', 'GBR', 'CAN', 'AUS', 'DEU', 'FRA', 'JPN', 'ITA', 'ESP', 'NLD', 'BEL', 'CHE'];
      
      if (strongPassports.includes(passportCode) && easyDestinations.includes(destinationCode)) {
        return {
          status: 'free',
          icon: 'check-circle',
          title: 'Visa-Free Entry',
          message: 'You can enter without a visa for tourism (typically 90 days).'
        };
      }
      
      // Default: visa required
      return {
        status: 'required',
        icon: 'passport',
        title: 'Visa Required',
        message: 'You need to apply for a visa before traveling. Check with the embassy for requirements.'
      };
    },

    cleanup() {
      console.log('Country Explorer cleanup');
      this.currentCountry = null;
      // Note: We keep countries data for reuse
    }
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
