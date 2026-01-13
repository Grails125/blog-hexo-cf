/**
 * 文章编辑器 - 使用简洁的 Markdown 编辑器
 * GET /admin/editor - Markdown 编辑器
 */

const editorHTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>文章编辑器 - 博客后台</title>
    <!-- EasyMDE - 简洁强大的 Markdown 编辑器 -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/easymde/dist/easymde.min.css">
    <script src="https://cdn.jsdelivr.net/npm/easymde/dist/easymde.min.js"></script>
    <!-- Marked.js for preview -->
    <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
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
        
        .meta-panel {
            background: white;
            padding: 20px 30px;
            border-bottom: 1px solid #e0e0e0;
        }
        
        .meta-row {
            display: flex;
            gap: 20px;
            margin-bottom: 15px;
        }
        
        .meta-row:last-child {
            margin-bottom: 0;
        }
        
        .input-group {
            flex: 1;
        }
        
        .input-group label {
            display: block;
            margin-bottom: 5px;
            font-size: 14px;
            font-weight: 500;
            color: #555;
        }
        
        .input-group input {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 6px;
            font-size: 14px;
        }
        
        .input-group input:focus {
            outline: none;
            border-color: #667eea;
        }
        
        #title {
            font-size: 18px;
            font-weight: 600;
        }
        
        .editor-container {
            flex: 1;
            padding: 20px 30px;
            overflow: auto;
            background: white;
        }
        
        /* EasyMDE 自定义样式 */
        .EasyMDEContainer {
            height: 100%;
        }
        
        .EasyMDEContainer .CodeMirror {
            height: calc(100vh - 280px);
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            font-size: 15px;
            line-height: 1.6;
        }
        
        .editor-toolbar {
            border: 1px solid #e0e0e0;
            border-bottom: none;
            border-radius: 8px 8px 0 0;
            background: #fafafa;
        }
        
        .editor-toolbar button {
            color: #555 !important;
        }
        
        .editor-toolbar button:hover {
            background: #e0e0e0 !important;
            border-color: #e0e0e0 !important;
        }
        
        .editor-toolbar.fullscreen {
            background: #fafafa;
        }
        
        .CodeMirror-fullscreen {
            z-index: 999;
        }
        
        .editor-preview-side {
            border: 1px solid #e0e0e0;
            border-left: none;
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
    </style>
</head>
<body>
    <div class="header">
        <h1>✏️ 文章编辑器</h1>
        <div class="header-actions">
            <button class="btn btn-back" onclick="goBack()">← 返回</button>
            <button class="btn btn-save" onclick="saveDraft()">💾 保存草稿</button>
            <button class="btn btn-publish" onclick="publish()">🚀 发布</button>
        </div>
    </div>
    
    <div class="meta-panel">
        <div class="meta-row">
            <div class="input-group" style="flex: 2;">
                <label for="title">标题</label>
                <input type="text" id="title" placeholder="输入文章标题">
            </div>
            <div class="input-group">
                <label for="category">分类</label>
                <input type="text" id="category" placeholder="例如：技术、生活">
            </div>
            <div class="input-group">
                <label for="tags">标签（用逗号分隔）</label>
                <input type="text" id="tags" placeholder="例如：JavaScript, React">
            </div>
        </div>
    </div>
    
    <div class="editor-container">
        <textarea id="markdown-editor"></textarea>
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
        let easyMDE = null;
        
        // 获取 URL 参数
        const urlParams = new URLSearchParams(window.location.search);
        const editId = urlParams.get('id');
        
        // 初始化 EasyMDE 编辑器
        easyMDE = new EasyMDE({
            element: document.getElementById('markdown-editor'),
            autofocus: true,
            autosave: {
                enabled: true,
                uniqueId: 'blog-editor-autosave',
                delay: 10000,
            },
            spellChecker: false,
            placeholder: '在这里使用 Markdown 编写文章内容...',
            toolbar: [
                'bold', 'italic', 'heading', '|',
                'quote', 'unordered-list', 'ordered-list', '|',
                'link', 'image', 'code', 'table', '|',
                'preview', 'side-by-side', 'fullscreen', '|',
                'guide'
            ],
            previewRender: function(plainText) {
                return marked.parse(plainText);
            },
            renderingConfig: {
                codeSyntaxHighlighting: true,
            },
        });
        
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
                    easyMDE.value(post.content);
                }
            } catch (error) {
                alert('加载文章失败');
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
            const content = easyMDE.value().trim();
            
            if (!title) {
                alert('请输入标题');
                return;
            }
            
            if (!content) {
                alert('请输入内容');
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
                    // 清除自动保存
                    easyMDE.clearAutosavedValue();
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
                easyMDE.clearAutosavedValue();
                window.location.href = '/admin/dashboard';
            }
        }
        
        // 快捷键保存
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
