// ============ CURRENCY CONVERTER MODULE ============
(function() {
  'use strict';
  
  const CurrencyConverter = {
    rates: {},
    popularCurrencies: ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'INR', 'MXN'],
    lastUpdated: null,

    init() {
      console.log('Currency Converter initializing...');
      
      // Debug: Check if elements exist
      console.log('currencyFrom element:', document.getElementById('currencyFrom'));
      console.log('currencyTo element:', document.getElementById('currencyTo'));
      console.log('amountFrom element:', document.getElementById('amountFrom'));
      console.log('amountTo element:', document.getElementById('amountTo'));
      console.log('swapCurrency button:', document.getElementById('swapCurrency'));
      
      this.populateCurrencySelects();
      this.bindEvents();
      this.fetchRates();
    },

    bindEvents() {
      const swapBtn = document.getElementById('swapCurrency');
      const amountInput = document.getElementById('amountFrom');

      if (swapBtn) {
        swapBtn.addEventListener('click', () => {
          this.swap();
        });
      }

      if (amountInput) {
        amountInput.addEventListener('input', () => {
          this.convert();
        });
      }

      // Update on currency change
      const fromCurrency = document.getElementById('currencyFrom');
      const toCurrency = document.getElementById('currencyTo');
      
      if (fromCurrency) {
        fromCurrency.addEventListener('change', () => {
          this.convert();
        });
      }
      
      if (toCurrency) {
        toCurrency.addEventListener('change', () => {
          this.convert();
        });
      }
    },

    async fetchRates() {
      try {
        showToast('Fetching exchange rates...', 'success');
        
        // Using exchangerate-api.com (free tier)
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        
        if (!response.ok) {
          throw new Error('Failed to fetch rates');
        }
        
        const data = await response.json();
        this.rates = data.rates;
        this.lastUpdated = new Date(data.time_last_updated || Date.now());
        
        console.log('Exchange rates loaded:', Object.keys(this.rates).length, 'currencies');
        
        // Initial conversion
        this.convert();
        
        showToast('Exchange rates updated!', 'success');
      } catch (error) {
        console.error('Error fetching rates:', error);
        showToast('Using cached exchange rates', 'warning');
        
        // Use fallback rates
        this.rates = {
          USD: 1,
          EUR: 0.92,
          GBP: 0.79,
          JPY: 149.50,
          AUD: 1.52,
          CAD: 1.36,
          CHF: 0.88,
          CNY: 7.24,
          INR: 83.12,
          MXN: 17.08,
          BRL: 4.97,
          ZAR: 18.85,
          SGD: 1.34,
          HKD: 7.83,
          SEK: 10.48,
          NOK: 10.63,
          KRW: 1320.50,
          TRY: 30.15,
          RUB: 92.50,
          THB: 35.20
        };
        this.lastUpdated = new Date();
        this.convert();
      }
    },

    populateCurrencySelects() {
      console.log('Populating currency selects...');
      
      const currencies = [
        { code: 'USD', name: 'US Dollar', symbol: '$' },
        { code: 'EUR', name: 'Euro', symbol: '€' },
        { code: 'GBP', name: 'British Pound', symbol: '£' },
        { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
        { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
        { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
        { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr' },
        { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
        { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
        { code: 'MXN', name: 'Mexican Peso', symbol: '$' },
        { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
        { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
        { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
        { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
        { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
        { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
        { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
        { code: 'TRY', name: 'Turkish Lira', symbol: '₺' },
        { code: 'RUB', name: 'Russian Ruble', symbol: '₽' },
        { code: 'THB', name: 'Thai Baht', symbol: '฿' },
        { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },
        { code: 'PLN', name: 'Polish Zloty', symbol: 'zł' },
        { code: 'DKK', name: 'Danish Krone', symbol: 'kr' },
        { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
        { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼' }
      ];

      const fromSelect = document.getElementById('currencyFrom');
      const toSelect = document.getElementById('currencyTo');

      console.log('fromSelect found:', !!fromSelect);
      console.log('toSelect found:', !!toSelect);

      if (fromSelect && toSelect) {
        const options = currencies.map(c => 
          `<option value="${c.code}">${c.code} - ${c.name}</option>`
        ).join('');

        fromSelect.innerHTML = options;
        toSelect.innerHTML = options;

        fromSelect.value = 'USD';
        toSelect.value = 'EUR';
        
        console.log('Currency dropdowns populated with', currencies.length, 'currencies');
        console.log('fromSelect has', fromSelect.options.length, 'options');
        console.log('toSelect has', toSelect.options.length, 'options');
      } else {
        console.error('Currency select elements not found!');
      }
    },

    convert() {
      const amount = parseFloat(document.getElementById('amountFrom')?.value || 0);
      const from = document.getElementById('currencyFrom')?.value || 'USD';
      const to = document.getElementById('currencyTo')?.value || 'EUR';
      const resultField = document.getElementById('amountTo');
      const rateField = document.getElementById('exchangeRate');
      const dateField = document.getElementById('exchangeDate');

      if (!amount || amount <= 0) {
        if (resultField) resultField.value = '0.00';
        return;
      }

      if (!this.rates[from] || !this.rates[to]) {
        console.log('Rates not available yet');
        return;
      }

      // Convert through USD as base
      const inUSD = amount / this.rates[from];
      const result = inUSD * this.rates[to];

      if (resultField) {
        resultField.value = result.toFixed(2);
      }
      
      // Update exchange rate display
      const rate = this.rates[to] / this.rates[from];
      if (rateField) {
        rateField.textContent = `1 ${from} = ${rate.toFixed(4)} ${to}`;
      }
      
      // Update last updated time
      if (dateField && this.lastUpdated) {
        const timeAgo = this.getTimeAgo(this.lastUpdated);
        dateField.textContent = `Last updated: ${timeAgo}`;
      }
      
      // Update quick convert chips
      this.updateQuickConvert();
    },

    swap() {
      const fromSelect = document.getElementById('currencyFrom');
      const toSelect = document.getElementById('currencyTo');

      if (fromSelect && toSelect) {
        const temp = fromSelect.value;
        fromSelect.value = toSelect.value;
        toSelect.value = temp;

        this.convert();
      }
    },

    updateQuickConvert() {
      const container = document.getElementById('currencyChips');
      if (!container) return;

      const amounts = [10, 50, 100, 500, 1000];
      const fromCurrency = document.getElementById('currencyFrom')?.value || 'USD';
      const toCurrency = document.getElementById('currencyTo')?.value || 'EUR';

      if (!this.rates[fromCurrency] || !this.rates[toCurrency]) {
        return;
      }

      container.innerHTML = amounts.map(amount => {
        const inUSD = amount / this.rates[fromCurrency];
        const result = inUSD * this.rates[toCurrency];
        
        return `
          <div class="quick-convert-chip" onclick="CurrencyConverter.setAmount(${amount})">
            <span class="chip-from">${amount} ${fromCurrency}</span>
            <i class="fas fa-arrow-right"></i>
            <span class="chip-to">${result.toFixed(2)} ${toCurrency}</span>
          </div>
        `;
      }).join('');
    },

    setAmount(amount) {
      const amountField = document.getElementById('amountFrom');
      if (amountField) {
        amountField.value = amount;
        this.convert();
      }
    },

    getTimeAgo(date) {
      const seconds = Math.floor((new Date() - date) / 1000);
      
      if (seconds < 60) return 'just now';
      if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
      if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
      return date.toLocaleDateString();
    },

    cleanup() {
      console.log('Currency Converter cleanup');
    }
  };

  // Expose to global scope
  window.CurrencyConverter = CurrencyConverter;

  // Register with PageLoader
  if (typeof PageLoader !== 'undefined') {
    PageLoader.registerModule('currency', CurrencyConverter);
  } else {
    // Auto-initialize if PageLoader not available
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => CurrencyConverter.init());
    } else {
      CurrencyConverter.init();
    }
  }
})();
        const data = await response.json();
        this.rates = data.rates;
        this.displayRates();
        this.createQuickConvert();
      } catch (error) {
        console.error('Error fetching rates:', error);
        // Use fallback rates
        this.rates = {
          USD: 1,
          EUR: 0.92,
          GBP: 0.79,
          JPY: 149.50,
          AUD: 1.52,
          CAD: 1.36,
          CHF: 0.88,
          CNY: 7.24,
          INR: 83.12,
          MXN: 17.08
        };
        this.displayRates();
        this.createQuickConvert();
      }
    },

    populateCurrencySelects() {
      const currencies = [
        { code: 'USD', name: 'US Dollar', symbol: '$' },
        { code: 'EUR', name: 'Euro', symbol: '€' },
        { code: 'GBP', name: 'British Pound', symbol: '£' },
        { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
        { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
        { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
        { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr' },
        { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
        { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
        { code: 'MXN', name: 'Mexican Peso', symbol: '$' },
        { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
        { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
        { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
        { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
        { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
        { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
        { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
        { code: 'TRY', name: 'Turkish Lira', symbol: '₺' },
        { code: 'RUB', name: 'Russian Ruble', symbol: '₽' },
        { code: 'THB', name: 'Thai Baht', symbol: '฿' }
      ];

      const fromSelect = document.getElementById('fromCurrency');
      const toSelect = document.getElementById('toCurrency');

      if (fromSelect && toSelect) {
        const options = currencies.map(c => 
          `<option value="${c.code}">${c.code} - ${c.name}</option>`
        ).join('');

        fromSelect.innerHTML = options;
        toSelect.innerHTML = options;

        fromSelect.value = 'USD';
        toSelect.value = 'EUR';
      }
    },

    convert() {
      const amount = parseFloat(document.getElementById('amount').value);
      const from = document.getElementById('fromCurrency').value;
      const to = document.getElementById('toCurrency').value;

      if (!amount || amount <= 0) {
        document.getElementById('result').textContent = '0.00';
        return;
      }

      // Convert through USD as base
      const inUSD = amount / this.rates[from];
      const result = inUSD * this.rates[to];

      document.getElementById('result').textContent = result.toFixed(2);
      
      // Update exchange rate display
      const rate = this.rates[to] / this.rates[from];
      const rateInfo = document.getElementById('exchangeRateInfo');
      if (rateInfo) {
        rateInfo.textContent = `1 ${from} = ${rate.toFixed(4)} ${to}`;
      }
    },

    swap() {
      const fromSelect = document.getElementById('fromCurrency');
      const toSelect = document.getElementById('toCurrency');

      const temp = fromSelect.value;
      fromSelect.value = toSelect.value;
      toSelect.value = temp;

      this.convert();
      this.displayRates();
    },

    displayRates() {
      const container = document.getElementById('exchangeRates');
      if (!container) return;

      const baseCurrency = document.getElementById('fromCurrency')?.value || 'USD';
      
      const ratesHTML = this.popularCurrencies
        .filter(currency => currency !== baseCurrency)
        .slice(0, 6)
        .map(currency => {
          const rate = (this.rates[currency] / this.rates[baseCurrency]).toFixed(4);
          return `
            <div class="rate-item">
              <span class="rate-currency">${currency}</span>
              <span class="rate-value">${rate}</span>
            </div>
          `;
        }).join('');

      container.innerHTML = ratesHTML || '<p>Loading rates...</p>';
    },

    createQuickConvert() {
      const container = document.getElementById('quickConvert');
      if (!container) return;

      const amounts = [10, 50, 100, 500, 1000];
      const fromCurrency = document.getElementById('fromCurrency')?.value || 'USD';
      const toCurrency = document.getElementById('toCurrency')?.value || 'EUR';

      container.innerHTML = amounts.map(amount => {
        const inUSD = amount / this.rates[fromCurrency];
        const result = inUSD * this.rates[toCurrency];
        
        return `
          <div class="quick-convert-chip" onclick="CurrencyConverter.setAmount(${amount})">
            <span class="chip-from">${amount} ${fromCurrency}</span>
            <i class="fas fa-arrow-right"></i>
            <span class="chip-to">${result.toFixed(2)} ${toCurrency}</span>
          </div>
        `;
      }).join('');
    },

    setAmount(amount) {
      document.getElementById('amount').value = amount;
      this.convert();
    },

    cleanup() {
      // Clean up if needed
    }
  };

  // Expose to global scope
  window.CurrencyConverter = CurrencyConverter;

  // Auto-initialize
  if (typeof PageLoader !== 'undefined') {
    PageLoader.registerModule('currency', CurrencyConverter);
  } else {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => CurrencyConverter.init());
    } else {
      CurrencyConverter.init();
    }
  }
})();
