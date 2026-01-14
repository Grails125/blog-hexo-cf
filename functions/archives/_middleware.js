/**
 * Archives 页面中间件
 * 拦截 /archives/ 请求，注入 KV 中的动态文章
 */

export async function onRequest(context) {
  const { request, env, next } = context;
  const url = new URL(request.url);

  // 只处理 /archives/ 主页面
  if (url.pathname !== "/archives" && url.pathname !== "/archives/") {
    return next();
  }

  try {
    // 获取原始 Hexo 生成的页面
    const response = await next();

    // 如果不是 HTML 页面，直接返回
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("text/html")) {
      return response;
    }

    // 获取 KV 中的文章列表
    const kvPosts =
      (await env.BLOG_KV.get("posts:list", { type: "json" })) || [];
    const publishedPosts = kvPosts.filter(
      (post) => post.status === "published"
    );

    if (publishedPosts.length === 0) {
      return response;
    }

    // 读取原始 HTML
    let html = await response.text();

    // 生成动态文章的 HTML（完全匹配 Solitude 主题样式）
    const dynamicPostsHTML = generateDynamicPostsHTML(publishedPosts);

    // 找到文章列表容器并在其前面插入动态文章
    // Solitude 主题的文章列表在 <div class="article-sort"> 中
    const insertMarker = '<div class="article-sort">';
    const insertIndex = html.indexOf(insertMarker);

    if (insertIndex !== -1) {
      const before = html.substring(0, insertIndex);
      const after = html.substring(insertIndex);

      html = before + dynamicPostsHTML + after;

      // 更新文章总数
      const totalCount = publishedPosts.length + 2; // 2 是 Hexo 生成的文章数
      html = html.replace(
        /<div class="article-sort-title">文章<sup>\d+<\/sup><\/div>/,
        `<div class="article-sort-title">文章<sup>${totalCount}</sup></div>`
      );
    }

    return new Response(html, {
      headers: response.headers,
    });
  } catch (error) {
    console.error("Error injecting dynamic posts:", error);
    return next();
  }
}

function generateDynamicPostsHTML(posts) {
  // 按年份分组
  const postsByYear = {};
  posts.forEach((post) => {
    const year = new Date(post.createdAt).getFullYear();
    if (!postsByYear[year]) {
      postsByYear[year] = [];
    }
    postsByYear[year].push(post);
  });

  // 生成 HTML，完全匹配 Solitude 主题结构
  let html = '<div class="article-sort dynamic-posts-section">';

  // 按年份倒序
  const years = Object.keys(postsByYear).sort((a, b) => b - a);

  years.forEach((year) => {
    html += `<div class="article-sort-item year">${year}</div>`;

    postsByYear[year].forEach((post) => {
      const date = new Date(post.createdAt);
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");

      // 生成标签 HTML
      const tagsHTML = (post.tags || [])
        .map((tag) => {
          const encodedTag = encodeURIComponent(tag);
          return `<a class="article-meta__tags" href="/tags/${encodedTag}/" onclick="window.event.cancelBubble=true;">
          <span class="tags-punctuation">
            <i class="solitude fas fa-hashtag"></i>${tag}
          </span>
        </a>`;
        })
        .join("");

      html += `
        <div class="article-sort-item">
          <a class="article-sort-item-img" href="/posts/${post.id}" title="${post.title}">
            <div style="width: 100%; height: 100%; background: #ffc848; display: flex; align-items: center; justify-content: center; font-size: 48px;">
              📝
            </div>
          </a>
          <div class="article-sort-item-info">
            <a class="article-sort-item-title" href="/posts/${post.id}" title="${post.title}" onclick="window.event.cancelBubble=true;">
              ${post.title}
            </a>
            <div class="article-sort-item-tags">
              ${tagsHTML}
            </div>
          </div>
        </div>
      `;
    });
  });

  html += "</div>";

  return html;
}
