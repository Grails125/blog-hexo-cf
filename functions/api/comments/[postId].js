/**
 * 评论系统 API
 * GET  /api/comments/:postId - 获取文章评论
 * POST /api/comments/:postId - 提交新评论
 */

export async function onRequestGet(context) {
  const { params, env } = context;
  const { postId } = params;

  try {
    const key = `comments:${postId}`;
    const comments = await env.BLOG_KV.get(key, { type: "json" });

    return new Response(
      JSON.stringify({
        success: true,
        data: comments || [],
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

export async function onRequestPost(context) {
  const { request, params, env } = context;
  const { postId } = params;

  try {
    const body = await request.json();
    const { author, email, content } = body;

    // 验证必填字段
    if (!author || !content) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "作者和内容不能为空",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 获取现有评论
    const key = `comments:${postId}`;
    const comments = (await env.BLOG_KV.get(key, { type: "json" })) || [];

    // 添加新评论
    const newComment = {
      id: Date.now().toString(),
      author,
      email,
      content,
      timestamp: new Date().toISOString(),
    };

    comments.push(newComment);

    // 保存到 KV
    await env.BLOG_KV.put(key, JSON.stringify(comments));

    return new Response(
      JSON.stringify({
        success: true,
        data: newComment,
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
