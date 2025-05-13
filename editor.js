// Initialize CodeMirror
const editor = CodeMirror.fromTextArea(document.getElementById('code-editor'), {
    mode: 'javascript',
    theme: 'monokai',
    lineNumbers: true,
    autoCloseBrackets: true,
    matchBrackets: true,
    indentUnit: 4,
    tabSize: 4,
    lineWrapping: true,
    extraKeys: {
        "Ctrl-Space": "autocomplete"
    }
});

// Set initial content
editor.setValue(`// Welcome to the JavaScript editor!
// Start coding here...

function greet(name) {
    return \`Hello, \${name}!\`;
}

console.log(greet('World'));`);

// Focus the editor
editor.focus();

// Function to run the code
function runCode() {
    const output = document.getElementById('output');
    output.innerHTML = ''; // Clear previous output
    
    // Override console.log to display in our output container
    const originalConsoleLog = console.log;
    console.log = function() {
        const args = Array.from(arguments);
        const message = args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' ');
        output.innerHTML += `<div>${message}</div>`;
        originalConsoleLog.apply(console, arguments);
    };

    try {
        // Get the code from the editor
        const code = editor.getValue();
        
        // Create a new function from the code and execute it
        const result = new Function(code)();
        
        // If the code returns a value, display it
        if (result !== undefined) {
            output.innerHTML += `<div>${result}</div>`;
        }
    } catch (error) {
        output.innerHTML += `<div class="error">Error: ${error.message}</div>`;
    }

    // Restore original console.log
    console.log = originalConsoleLog;
}

// Notification system
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type} show`;
    
    setTimeout(() => {
        notification.className = 'notification';
    }, 3000);
}

// Git functions
async function gitPull() {
    try {
        const response = await fetch('http://localhost:3000/api/git/pull', {
            method: 'POST'
        });
        const data = await response.json();
        
        if (data.success) {
            showNotification('Pull successful');
            // Reload the editor content
            editor.setValue(data.data.files['index.js'] || editor.getValue());
        } else {
            showNotification(data.message, 'error');
        }
    } catch (error) {
        showNotification('Error pulling changes: ' + error.message, 'error');
    }
}

async function gitCommit() {
    try {
        const response = await fetch('http://localhost:3000/api/git/commit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                files: ['index.js']
            })
        });
        const data = await response.json();
        
        if (data.success) {
            showNotification('Commit successful');
        } else {
            showNotification(data.message, 'error');
        }
    } catch (error) {
        showNotification('Error committing changes: ' + error.message, 'error');
    }
}

async function gitPush() {
    try {
        const response = await fetch('http://localhost:3000/api/git/push', {
            method: 'POST'
        });
        const data = await response.json();
        
        if (data.success) {
            showNotification('Push successful');
        } else {
            showNotification(data.message, 'error');
        }
    } catch (error) {
        showNotification('Error pushing changes: ' + error.message, 'error');
    }
}
