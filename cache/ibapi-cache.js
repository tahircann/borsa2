const fs = require('fs');
const path = require('path');
const https = require('https');

class IBAPICache {
    constructor() {
        this.cacheDir = path.join(__dirname);
        this.cacheFile = path.join(this.cacheDir, 'ibapi-data.json');
        this.lastUpdate = null;
        this.cacheData = {};
        this.loadCache();
    }

    loadCache() {
        try {
            if (fs.existsSync(this.cacheFile)) {
                const data = fs.readFileSync(this.cacheFile, 'utf8');
                const parsed = JSON.parse(data);
                this.cacheData = parsed.data || {};
                this.lastUpdate = new Date(parsed.lastUpdate);
                console.log('Cache loaded. Last update:', this.lastUpdate);
            }
        } catch (error) {
            console.error('Error loading cache:', error);
            this.cacheData = {};
        }
    }

    saveCache() {
        try {
            const data = {
                data: this.cacheData,
                lastUpdate: new Date().toISOString()
            };
            fs.writeFileSync(this.cacheFile, JSON.stringify(data, null, 2));
            console.log('Cache saved at:', new Date());
        } catch (error) {
            console.error('Error saving cache:', error);
        }
    }

    async fetchData() {
        try {
            console.log('Fetching fresh data from IBAPI...');
            
            // Portfolio data
            const portfolioResponse = await this.makeAPICall('/v1/api/portfolio/accounts');
            if (portfolioResponse) this.cacheData.portfolio = portfolioResponse;

            // Positions data
            const positionsResponse = await this.makeAPICall('/v1/api/portfolio/positions');
            if (positionsResponse) this.cacheData.positions = positionsResponse;

            // Trades data  
            const tradesResponse = await this.makeAPICall('/v1/api/iserver/account/orders');
            if (tradesResponse) this.cacheData.trades = tradesResponse;

            this.lastUpdate = new Date();
            this.saveCache();
            
            console.log('Data fetched and cached successfully');
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    makeAPICall(endpoint) {
        return new Promise((resolve, reject) => {
            const options = {
                hostname: 'localhost',
                port: 5055,
                path: endpoint,
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            };

            const req = https.request(options, (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        resolve(data);
                    }
                });
            });

            req.on('error', (error) => {
                console.error('API call error:', error);
                resolve(null);
            });

            req.setTimeout(30000, () => {
                req.destroy();
                console.error('API call timeout');
                resolve(null);
            });

            req.end();
        });
    }

    getData(type) {
        return this.cacheData[type] || null;
    }

    getLastUpdate() {
        return this.lastUpdate;
    }

    shouldUpdate() {
        if (!this.lastUpdate) return true;
        const now = new Date();
        const diffHours = (now - this.lastUpdate) / (1000 * 60 * 60);
        return diffHours >= 4; // 4 saatte bir güncelle
    }
}

const cache = new IBAPICache();

// 4 saatte bir otomatik güncelleme
setInterval(() => {
    if (cache.shouldUpdate()) {
        cache.fetchData();
    }
}, 1000 * 60 * 60); // Her saat kontrol et

// İlk başta eğer cache eski ise güncelle
if (cache.shouldUpdate()) {
    setTimeout(() => cache.fetchData(), 5000); // 5 saniye sonra başlat
}

module.exports = cache; 