/**
 * 密码哈希生成工具
 * GET /admin/hash-tool - 生成密码哈希
 */

const hashToolHTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>密码哈希生成工具</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        .container {
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            padding: 48px;
            width: 100%;
            max-width: 600px;
        }
        
        h1 {
            color: #333;
            font-size: 24px;
            margin-bottom: 24px;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        label {
            display: block;
            color: #333;
            font-weight: 500;
            margin-bottom: 8px;
            font-size: 14px;
        }
        
        input[type="text"] {
            width: 100%;
            padding: 12px 16px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            font-size: 16px;
            font-family: monospace;
        }
        
        .btn {
            padding: 12px 24px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            margin-right: 10px;
        }
        
        .btn:hover {
            opacity: 0.9;
        }
        
        .result {
            background: #f5f5f5;
            padding: 16px;
            border-radius: 8px;
            margin-top: 20px;
            display: none;
        }
        
        .result.show {
            display: block;
        }
        
        .result pre {
            margin: 0;
            word-break: break-all;
            white-space: pre-wrap;
            font-family: monospace;
            font-size: 12px;
        }
        
        .info {
            background: #e3f2fd;
            padding: 16px;
            border-radius: 8px;
            margin-top: 20px;
            font-size: 14px;
            color: #1976d2;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔐 密码哈希生成工具</h1>
        
        <div class="form-group">
            <label for="password">输入密码</label>
            <input 
                type="text" 
                id="password" 
                placeholder="输入你想设置的管理员密码"
            >
        </div>
        
        <button class="btn" onclick="generateHash()">生成哈希</button>
        <button class="btn" onclick="testLogin()">测试登录</button>
        
        <div class="result" id="result"></div>
        
        <div class="info">
            <strong>使用说明：</strong><br>
            1. 输入你想设置的密码<br>
            2. 点击"生成哈希"获取哈希值<br>
            3. 将哈希值设置到 Cloudflare Pages 环境变量 ADMIN_PASSWORD_HASH<br>
            4. 点击"测试登录"验证密码是否正确
        </div>
    </div>

    <script>
        async function hashPassword(password) {
            const encoder = new TextEncoder();
            const data = encoder.encode(password);
            const hash = await crypto.subtle.digest('SHA-256', data);
            return Array.from(new Uint8Array(hash))
                .map(b => b.toString(16).padStart(2, '0'))
                .join('');
        }
        
        async function generateHash() {
            const password = document.getElementById('password').value;
            if (!password) {
                alert('请输入密码');
                return;
            }
            
            const hash = await hashPassword(password);
            const resultDiv = document.getElementById('result');
            resultDiv.innerHTML = \`
                <strong>密码：</strong><pre>\${password}</pre>
                <strong>SHA-256 哈希：</strong><pre>\${hash}</pre>
                <p style="margin-top: 10px; color: #666;">
                    请将上面的哈希值复制到 Cloudflare Pages 环境变量 <code>ADMIN_PASSWORD_HASH</code>
                </p>
            \`;
            resultDiv.classList.add('show');
        }
        
        async function testLogin() {
            const password = document.getElementById('password').value;
            if (!password) {
                alert('请输入密码');
                return;
            }
            
            const resultDiv = document.getElementById('result');
            resultDiv.innerHTML = '<p>测试登录中...</p>';
            resultDiv.classList.add('show');
            
            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ password }),
                });
                
                const data = await response.json();
                
                if (data.success) {
                    resultDiv.innerHTML = \`
                        <p style="color: green;">✅ <strong>登录成功！</strong></p>
                        <p>Token: <pre>\${data.token}</pre></p>
                    \`;
                } else {
                    resultDiv.innerHTML = \`
                        <p style="color: red;">❌ <strong>登录失败</strong></p>
                        <p>错误信息: \${data.error}</p>
                        <p style="margin-top: 10px;">请检查：</p>
                        <ol style="margin-left: 20px;">
                            <li>密码是否正确</li>
                            <li>环境变量 ADMIN_PASSWORD_HASH 是否已设置</li>
                            <li>环境变量的哈希值是否与当前密码匹配</li>
                        </ol>
                    \`;
                }
            } catch (error) {
                resultDiv.innerHTML = \`
                    <p style="color: red;">❌ <strong>请求失败</strong></p>
                    <p>错误: \${error.message}</p>
                \`;
            }
        }
    </script>
</body>
</html>`;

export async function onRequestGet() {
  return new Response(hashToolHTML, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}
