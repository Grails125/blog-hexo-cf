/**
 * 访问统计 API
 * GET  /api/stats/:postId - 获取文章访问量
 * POST /api/stats/:postId - 增加访问计数
 */

export async function onRequestGet(context) {
  const { params, env } = context;
  const { postId } = params;

  try {
    const key = `stats:${postId}`;
    const views = await env.BLOG_KV.get(key);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          postId,
          views: parseInt(views || "0"),
        },
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
  const { params, env } = context;
  const { postId } = params;

  try {
    const key = `stats:${postId}`;
    const currentViews = await env.BLOG_KV.get(key);
    const newViews = parseInt(currentViews || "0") + 1;

    await env.BLOG_KV.put(key, newViews.toString());

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          postId,
          views: newViews,
        },
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
