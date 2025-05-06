const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const https = require('https');

// Check if IBKR_ACCOUNT_ID is set
if (!process.env.IBKR_ACCOUNT_ID) {
  console.log('\x1b[33m%s\x1b[0m', 'UYARI: IBKR_ACCOUNT_ID ortam değişkeni ayarlanmamış!');
  console.log('\x1b[33m%s\x1b[0m', 'PowerShell: $env:IBKR_ACCOUNT_ID="hesap_numaranız"');
  console.log('\x1b[33m%s\x1b[0m', 'Command Prompt: set IBKR_ACCOUNT_ID=hesap_numaranız');
  console.log('\x1b[33m%s\x1b[0m', 'Mock veri kullanılacak.');
}

console.log('\x1b[36m%s\x1b[0m', 'Interactive Brokers API başlatılıyor...');
console.log('Hesap ID:', process.env.IBKR_ACCOUNT_ID ? process.env.IBKR_ACCOUNT_ID : 'Ayarlanmamış (mock veri kullanılacak)');

// Path to the API backend
const apiBackendPath = path.join(__dirname, 'api-backend', 'interactive-brokers-web-api-main');

// Test if the API is already running
const testApiConnection = () => {
  return new Promise((resolve) => {
    console.log('API bağlantısı test ediliyor: https://localhost:5055/v1/api');
    
    const req = https.request(
      {
        hostname: 'localhost',
        port: 5055,
        path: '/v1/api/portfolio/accounts',
        method: 'GET',
        rejectUnauthorized: false,
        timeout: 3000
      },
      (res) => {
        console.log('API yanıt kodu:', res.statusCode);
        resolve(res.statusCode === 200);
      }
    );
    
    req.on('error', (err) => {
      console.log('API henüz çalışmıyor:', err.message);
      resolve(false);
    });
    
    req.on('timeout', () => {
      console.log('API bağlantı zaman aşımı');
      req.destroy();
      resolve(false);
    });
    
    req.end();
  });
};

// Check if Docker is needed or if we can run directly with Python
const runWithDocker = () => {
  console.log('\x1b[36m%s\x1b[0m', 'Docker ile çalıştırılıyor...');
  
  // Check if docker-compose.yml exists
  const dockerComposeFile = path.join(apiBackendPath, 'docker-compose.yml');
  if (!fs.existsSync(dockerComposeFile)) {
    console.error('\x1b[31m%s\x1b[0m', 'HATA: docker-compose.yml dosyası bulunamadı:', dockerComposeFile);
    console.error('\x1b[31m%s\x1b[0m', 'API çalıştırılamadı!');
    return;
  }
  
  const dockerProcess = spawn('docker-compose', ['up'], { 
    cwd: apiBackendPath,
    stdio: 'inherit',
    shell: true,
    env: { ...process.env }
  });

  dockerProcess.on('error', (error) => {
    console.error('\x1b[31m%s\x1b[0m', 'Docker başlatma hatası:', error.message);
  });
};

// Try to run directly with Python if available
const runWithPython = () => {
  console.log('\x1b[36m%s\x1b[0m', 'Python ile çalıştırılıyor...');
  
  // Check if app.py exists
  const appFile = path.join(apiBackendPath, 'webapp', 'app.py');
  if (!fs.existsSync(appFile)) {
    console.error('\x1b[31m%s\x1b[0m', 'HATA: app.py dosyası bulunamadı:', appFile);
    console.error('\x1b[31m%s\x1b[0m', 'Docker ile çalıştırmayı deniyorum...');
    runWithDocker();
    return;
  }
  
  // Make sure Flask is installed
  const installProcess = spawn('pip', ['install', 'flask', 'requests'], {
    stdio: 'inherit',
    shell: true
  });

  installProcess.on('close', (code) => {
    if (code === 0) {
      // Run the Flask app
      const flaskProcess = spawn('python', ['app.py'], {
        cwd: path.join(apiBackendPath, 'webapp'),
        stdio: 'inherit',
        env: { 
          ...process.env, 
          FLASK_APP: 'app.py', 
          FLASK_ENV: 'development',
          PYTHONUNBUFFERED: '1' // Anlık çıktı için
        },
        shell: true
      });

      flaskProcess.on('error', (error) => {
        console.error('\x1b[31m%s\x1b[0m', 'Flask uygulaması başlatılamadı:', error.message);
        console.log('Docker ile çalıştırmayı deniyorum...');
        runWithDocker();
      });
    } else {
      console.error('\x1b[31m%s\x1b[0m', 'Flask bağımlılıkları yüklenemedi');
      console.log('Docker ile çalıştırmayı deniyorum...');
      runWithDocker();
    }
  });
};

const main = async () => {
  // First check if API is already running
  const isApiRunning = await testApiConnection();
  
  if (isApiRunning) {
    console.log('\x1b[32m%s\x1b[0m', 'API zaten çalışıyor! Yeni bir örnek başlatılmayacak.');
    console.log('\x1b[32m%s\x1b[0m', 'Interactive Brokers arayüzüne şu adresten giriş yapın: https://localhost:5055');
    return;
  }

  // Check if Python is available
  const pythonProcess = spawn('python', ['--version'], { shell: true });
  let pythonOutput = '';
  
  pythonProcess.stdout.on('data', (data) => {
    pythonOutput += data.toString();
  });
  
  pythonProcess.on('close', (code) => {
    if (code === 0 && pythonOutput.toLowerCase().includes('python')) {
      console.log('Python bulundu:', pythonOutput.trim());
      runWithPython();
    } else {
      console.log('Python bulunamadı, Docker ile çalıştırılacak');
      runWithDocker();
    }
  });
};

main();

console.log('\x1b[32m%s\x1b[0m', 'Interactive Brokers API\'ye erişmek için: https://localhost:5055');
console.log('\x1b[32m%s\x1b[0m', 'API kullanmadan önce bu URL\'den kimlik doğrulaması yapmanız gerekiyor!'); 