// Node.js script to generate nginx-local.conf from docker-compose.yml
// Only includes services that are enabled (not commented out) in docker-compose.yml

const fs = require('fs');
const path = require('path');

// Mapping of service names to their configuration
const serviceConfig = {
    "shell": {
        port: 4700,
        path: "/",
        upstream: "shell",
        location: "/",
        alternateLocation: "/all-apps",
        websocket: false
    },
    "dtf_hat": {
        port: 4701,
        path: "/dtf-hat/",
        upstream: "dtf_hat",
        location: "/dtf-hat/",
        websocket: true
    },
    "embroidery": {
        port: 4702,
        path: "/embroidery/",
        upstream: "embroidery",
        location: "/embroidery/",
        websocket: true
    },
    "hangtag": {
        port: 4703,
        path: "/hangtag/",
        upstream: "hangtag",
        location: "/hangtag/",
        websocket: true
    },
    "jit_receive": {
        port: 4704,
        path: "/jit-receive/",
        upstream: "jit_receive",
        location: "/jit-receive/",
        websocket: true
    },
    "mug_transfer": {
        port: 4705,
        path: "/mug-transfer/",
        upstream: "mug_transfer",
        location: "/mug-transfer/",
        websocket: true
    },
    "neck_label": {
        port: 4706,
        path: "/neck-label/",
        upstream: "neck_label",
        location: "/neck-label/",
        websocket: true
    },
    "print_lead": {
        port: 4707,
        path: "/print-lead/",
        upstream: "print_lead",
        location: "/print-lead/",
        websocket: true
    },
    "qa": {
        port: 4708,
        path: "/qa/",
        upstream: "qa",
        location: "/qa/",
        websocket: true
    },
    "qa_lead": {
        port: 4709,
        path: "/qa-lead/",
        upstream: "qa_lead",
        location: "/qa-lead/",
        websocket: true
    },
    "qa_pod": {
        port: 4710,
        path: "/qa-pod/",
        upstream: "qa_pod",
        location: "/qa-pod/",
        websocket: true
    },
    "shipping": {
        port: 4711,
        path: "/shipping/",
        upstream: "shipping",
        location: "/shipping/",
        websocket: true
    },
    "trim": {
        port: 4712,
        path: "/trim/",
        upstream: "trim",
        location: "/trim/",
        websocket: true
    },
    "washing": {
        port: 4713,
        path: "/washing/",
        upstream: "washing",
        location: "/washing/",
        websocket: true
    }
};

// Read docker-compose.yml
// Use environment variables when running in container, otherwise use current directory
const composeFile = process.env.COMPOSE_FILE || path.join(process.cwd(), 'docker-compose.yml');
const outputFile = process.env.OUTPUT_FILE || path.join(process.cwd(), 'nginx-local.conf');

if (!fs.existsSync(composeFile)) {
    console.error(`Error: ${composeFile} not found!`);
    process.exit(1);
}

const composeContent = fs.readFileSync(composeFile, 'utf8');

// Find all enabled services (not commented out, excluding proxy)
const enabledServices = [];
const lines = composeContent.split(/\r?\n/);

for (const line of lines) {
    const trimmed = line.trimStart();
    
    // Skip if line is commented out (starts with #)
    if (trimmed.startsWith('#')) {
        continue;
    }
    
    // Check if line starts a service definition (pattern: service_name:)
    const match = trimmed.match(/^([a-zA-Z0-9_]+):\s*$/);
    if (match) {
        const serviceName = match[1];
        
        // Skip proxy service
        if (serviceName !== 'proxy' && serviceConfig.hasOwnProperty(serviceName)) {
            if (!enabledServices.includes(serviceName)) {
                enabledServices.push(serviceName);
            }
        }
    }
}

console.log(`Found enabled services: ${enabledServices.join(', ')}`);

// Generate nginx configuration
let nginxConfig = `events {
    worker_connections 1024;
}

http {
`;

// Generate upstream blocks for enabled services
for (const serviceName of enabledServices) {
    const config = serviceConfig[serviceName];
    nginxConfig += `
    upstream ${config.upstream} {
        server ${serviceName}:${config.port};
    }
`;
}

// Generate server block
nginxConfig += `
    server {
        listen 80;
        server_name localhost;
`;

// Shell app always gets special handling
if (enabledServices.includes('shell')) {
    nginxConfig += `
        # Shell app - root and all-apps
        location / {
            proxy_pass http://shell;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
        
        location /all-apps {
            proxy_pass http://shell;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
`;
}

// Generate location blocks for other services
for (const serviceName of enabledServices) {
    if (serviceName === 'shell') {
        continue; // Already handled above
    }
    
    const config = serviceConfig[serviceName];
    nginxConfig += `
        location ${config.location} {
            proxy_pass http://${config.upstream};
`;
    
    // Add WebSocket support for Angular dev servers
    if (config.websocket) {
        nginxConfig += `
            # Enable WebSocket upgrades for Angular dev server live reload/HMR
            # - HTTP/1.1 is required for Upgrade semantics
            # - Forward Upgrade and Connection headers to upstream
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
`;
    }
    
    nginxConfig += `
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
`;
}

nginxConfig += `
    }
}
`;

// Write the generated config
fs.writeFileSync(outputFile, nginxConfig, 'utf8');

console.log(`\nGenerated ${outputFile} successfully!`);
console.log(`Enabled services configured: ${enabledServices.length}`);

