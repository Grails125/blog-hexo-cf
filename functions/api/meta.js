/**
 * 文章元数据 API
 * GET /api/meta - 获取分类和标签列表
 */

export async function onRequestGet(context) {
  const { env } = context;

  try {
    // 从 R2 列出所有文章
    const list = await env.BLOG_R2.list({ prefix: "posts/" });

    // 提取所有分类和标签
    const categoriesSet = new Set();
    const tagsSet = new Set();

    // 读取每个文章的 Front Matter
    for (const item of list.objects) {
      try {
        const obj = await env.BLOG_R2.get(item.key);
        if (!obj) continue;

        const content = await obj.text();
        const metadata = parseFrontMatter(content);

        // 添加分类
        if (metadata.category) {
          categoriesSet.add(metadata.category);
        } else if (metadata.categories && Array.isArray(metadata.categories)) {
          metadata.categories.forEach((cat) => categoriesSet.add(cat));
        }

        // 添加标签
        if (metadata.tags && Array.isArray(metadata.tags)) {
          metadata.tags.forEach((tag) => tagsSet.add(tag));
        }
      } catch (e) {
        console.error(`Error parsing ${item.key}:`, e);
      }
    }

    const categories = Array.from(categoriesSet).sort();
    const tags = Array.from(tagsSet).sort();

    return new Response(
      JSON.stringify({
        success: true,
        categories,
        tags,
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
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
  const lines = frontMatter.split("\n");
  let currentKey = null;
  let arrayValues = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith("-")) {
      const value = trimmed.substring(1).trim();
      arrayValues.push(value);
      continue;
    }

    if (currentKey && arrayValues.length > 0) {
      metadata[currentKey] = arrayValues;
      arrayValues = [];
      currentKey = null;
    }

    const colonIndex = trimmed.indexOf(":");
    if (colonIndex > 0) {
      const key = trimmed.substring(0, colonIndex).trim();
      let value = trimmed.substring(colonIndex + 1).trim();

      if (value.startsWith("[") && value.endsWith("]")) {
        value = value
          .substring(1, value.length - 1)
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean);
        metadata[key] = value;
      } else if (value) {
        metadata[key] = value;
      } else {
        currentKey = key;
      }
    }
  }

  if (currentKey && arrayValues.length > 0) {
    metadata[currentKey] = arrayValues;
  }

  return metadata;
}
