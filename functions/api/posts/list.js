/**
 * 文章列表 API - 从 R2 读取并解析 Front Matter
 * GET /api/posts/list
 */

export async function onRequestGet(context) {
  const { env, request } = context;

  try {
    // 检查管理员权限
    const authHeader = request.headers.get("Authorization");
    let isAdmin = false;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const role = await env.BLOG_KV.get(`auth:${token}`);
      isAdmin = role === "admin";
    }

    // 列出 R2 中的所有文章
    const list = await env.BLOG_R2.list({ prefix: "posts/" });

    const posts = [];
    for (const item of list.objects) {
      if (!item.key.endsWith(".md")) {
        continue;
      }

      try {
        // 读取文件内容以解析 Front Matter
        const obj = await env.BLOG_R2.get(item.key);
        if (!obj) continue;

        const content = await obj.text();
        const metadata = parseFrontMatter(content);

        // 从文件名提取 ID (去掉 posts/ 前缀和 .md 后缀)
        const id = item.key.replace("posts/", "").replace(".md", "");

        posts.push({
          id,
          filename: item.key,
          title: metadata.title || "Untitled",
          category: metadata.category || metadata.categories?.[0] || "",
          tags: metadata.tags || [],
          cover: metadata.cover || "",
          status: metadata.status || "published",
          createdAt: metadata.date || item.uploaded.toISOString(),
          size: item.size,
        });
      } catch (err) {
        console.error(`Error parsing ${item.key}:`, err);
        continue;
      }
    }

    // 按创建时间倒序排序
    posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // 非管理员只能看到已发布的文章
    const filteredPosts = isAdmin
      ? posts
      : posts.filter((p) => p.status === "published");

    return new Response(
      JSON.stringify({
        success: true,
        data: filteredPosts,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error listing posts:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

/**
 * 解析 Markdown Front Matter
 */
function parseFrontMatter(content) {
  const frontMatterRegex = /^---\s*\n([\s\S]*?)\n---/;
  const match = content.match(frontMatterRegex);

  if (!match) {
    return {};
  }

  const frontMatter = match[1];
  const metadata = {};

  // 解析 YAML 格式的 Front Matter
  const lines = frontMatter.split("\n");
  let currentKey = null;
  let arrayValues = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // 数组项 (以 - 开头)
    if (trimmed.startsWith("-")) {
      const value = trimmed.substring(1).trim();
      arrayValues.push(value);
      continue;
    }

    // 如果之前在收集数组,保存它
    if (currentKey && arrayValues.length > 0) {
      metadata[currentKey] = arrayValues;
      arrayValues = [];
      currentKey = null;
    }

    // 键值对
    const colonIndex = trimmed.indexOf(":");
    if (colonIndex > 0) {
      const key = trimmed.substring(0, colonIndex).trim();
      let value = trimmed.substring(colonIndex + 1).trim();

      // 处理数组格式 [item1, item2]
      if (value.startsWith("[") && value.endsWith("]")) {
        value = value
          .substring(1, value.length - 1)
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean);
        metadata[key] = value;
      } else if (value) {
        // 普通值
        metadata[key] = value;
      } else {
        // 可能是数组的开始
        currentKey = key;
      }
    }
  }

  // 保存最后的数组
  if (currentKey && arrayValues.length > 0) {
    metadata[currentKey] = arrayValues;
  }

  return metadata;
}
