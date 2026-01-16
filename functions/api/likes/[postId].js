/**
 * 点赞功能 API
 * GET  /api/likes/:postId - 获取点赞数
 * POST /api/likes/:postId - 点赞
 */

export async function onRequestGet(context) {
  const { params, env } = context;
  const { postId } = params;

  try {
    const key = `likes:${postId}`;
    const likes = await env.BLOG_KV.get(key);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          postId,
          likes: parseInt(likes || "0"),
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
    const key = `likes:${postId}`;
    const currentLikes = await env.BLOG_KV.get(key);
    const newLikes = parseInt(currentLikes || "0") + 1;

    await env.BLOG_KV.put(key, newLikes.toString());

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          postId,
          likes: newLikes,
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
