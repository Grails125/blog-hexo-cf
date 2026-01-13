/**
 * 文章编辑器 - 集成 doocs/md
 * GET /admin/editor - 使用 doocs/md 在线编辑器
 */

const editorHTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>文章编辑器 - 博客后台</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: #f5f7fa;
            height: 100vh;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            z-index: 100;
        }
        
        .header h1 {
            font-size: 20px;
        }
        
        .header-actions {
            display: flex;
            gap: 10px;
        }
        
        .btn {
            padding: 8px 16px;
            border: none;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
        }
        
        .btn-save {
            background: white;
            color: #667eea;
        }
        
        .btn-publish {
            background: #4caf50;
            color: white;
        }
        
        .btn-back {
            background: rgba(255,255,255,0.2);
            color: white;
            border: 1px solid rgba(255,255,255,0.3);
        }
        
        .btn-get {
            background: #ff9800;
            color: white;
        }
        
        .meta-panel {
            background: white;
            padding: 15px 30px;
            border-bottom: 1px solid #e0e0e0;
        }
        
        .meta-row {
            display: flex;
            gap: 15px;
            align-items: flex-end;
        }
        
        .input-group {
            flex: 1;
        }
        
        .input-group label {
            display: block;
            margin-bottom: 5px;
            font-size: 13px;
            font-weight: 500;
            color: #555;
        }
        
        .input-group input {
            width: 100%;
            padding: 8px 12px;
            border: 1px solid #ddd;
            border-radius: 6px;
            font-size: 14px;
        }
        
        .input-group input:focus {
            outline: none;
            border-color: #667eea;
        }
        
        #title {
            font-size: 16px;
            font-weight: 600;
        }
        
        .editor-container {
            flex: 1;
            position: relative;
            overflow: hidden;
            background: white;
        }
        
        #doocs-md-iframe {
            width: 100%;
            height: 100%;
            border: none;
        }
        
        .loading {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            display: none;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 18px;
            z-index: 1000;
        }
        
        .loading.show {
            display: flex;
        }
        
        .tip {
            background: #fff3cd;
            color: #856404;
            padding: 10px 15px;
            font-size: 13px;
            border-left: 4px solid #ffc107;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>✏️ 文章编辑器 (doocs/md)</h1>
        <div class="header-actions">
            <button class="btn btn-back" onclick="goBack()">← 返回</button>
            <button class="btn btn-get" onclick="getContent()">📥 获取内容</button>
            <button class="btn btn-save" onclick="saveDraft()">💾 保存草稿</button>
            <button class="btn btn-publish" onclick="publish()">🚀 发布</button>
        </div>
    </div>
    
    <div class="meta-panel">
        <div class="tip">
            💡 提示：在下方编辑器中编写完成后，点击"获取内容"按钮将内容同步到本系统，然后再保存或发布。
        </div>
        <div class="meta-row" style="margin-top: 15px;">
            <div class="input-group" style="flex: 2;">
                <label for="title">标题</label>
                <input type="text" id="title" placeholder="输入文章标题">
            </div>
            <div class="input-group">
                <label for="category">分类</label>
                <input type="text" id="category" placeholder="例如：技术">
            </div>
            <div class="input-group">
                <label for="tags">标签（逗号分隔）</label>
                <input type="text" id="tags" placeholder="例如：JavaScript, React">
            </div>
        </div>
    </div>
    
    <div class="editor-container">
        <iframe id="doocs-md-iframe" src="https://md.doocs.org" allow="clipboard-write"></iframe>
    </div>
    
    <div class="loading" id="loading">
        <div>保存中...</div>
    </div>

    <script>
        const token = localStorage.getItem('admin_token');
        if (!token) {
            window.location.href = '/admin';
        }
        
        let currentPostId = null;
        let cachedContent = '';
        
        // 获取 URL 参数
        const urlParams = new URLSearchParams(window.location.search);
        const editId = urlParams.get('id');
        
        // 如果是编辑模式，加载文章
        if (editId) {
            loadPost(editId);
        }
        
        // 加载文章
        async function loadPost(id) {
            try {
                const response = await fetch(\`/api/posts/\${id}\`);
                const data = await response.json();
                
                if (data.success) {
                    const post = data.data;
                    currentPostId = post.id;
                    document.getElementById('title').value = post.title;
                    document.getElementById('category').value = post.category || '';
                    document.getElementById('tags').value = (post.tags || []).join(', ');
                    cachedContent = post.content;
                    
                    alert('文章元数据已加载！\\n\\n请在编辑器中手动粘贴以下内容：\\n\\n' + post.content.substring(0, 100) + '...');
                }
            } catch (error) {
                alert('加载文章失败');
            }
        }
        
        // 获取编辑器内容
        function getContent() {
            const content = prompt('请从 doocs/md 编辑器中复制 Markdown 内容，然后粘贴到这里：', cachedContent);
            if (content !== null) {
                cachedContent = content;
                alert('内容已获取！现在可以保存或发布了。');
            }
        }
        
        // 保存草稿
        async function saveDraft() {
            await savePost('draft');
        }
        
        // 发布
        async function publish() {
            if (!confirm('确定要发布这篇文章吗？')) return;
            await savePost('published');
        }
        
        // 保存文章
        async function savePost(status) {
            const title = document.getElementById('title').value.trim();
            const category = document.getElementById('category').value.trim();
            const tagsInput = document.getElementById('tags').value.trim();
            const tags = tagsInput ? tagsInput.split(',').map(t => t.trim()) : [];
            const content = cachedContent.trim();
            
            if (!title) {
                alert('请输入标题');
                return;
            }
            
            if (!content) {
                alert('请先点击"获取内容"按钮获取编辑器中的内容');
                return;
            }
            
            document.getElementById('loading').classList.add('show');
            
            try {
                const url = currentPostId 
                    ? \`/api/posts/\${currentPostId}\`
                    : '/api/posts/create';
                    
                const method = currentPostId ? 'PUT' : 'POST';
                
                const response = await fetch(url, {
                    method,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': \`Bearer \${token}\`
                    },
                    body: JSON.stringify({
                        title,
                        content,
                        category,
                        tags,
                        status
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    alert(status === 'draft' ? '草稿保存成功！' : '发布成功！');
                    if (!currentPostId) {
                        currentPostId = data.data.id;
                    }
                    window.location.href = '/admin/dashboard';
                } else {
                    alert('保存失败：' + data.error);
                }
            } catch (error) {
                alert('保存失败：' + error.message);
            } finally {
                document.getElementById('loading').classList.remove('show');
            }
        }
        
        // 返回
        function goBack() {
            if (confirm('确定要返回吗？未保存的内容将丢失。')) {
                window.location.href = '/admin/dashboard';
            }
        }
        
        // 快捷键
        document.addEventListener('keydown', function(e) {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                saveDraft();
            }
        });
    </script>
</body>
</html>`;

export async function onRequestGet() {
  return new Response(editorHTML, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}
