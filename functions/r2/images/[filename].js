/**
 * R2 图片访问 API
 * GET /r2/images/[filename]
 */

export async function onRequestGet(context) {
  const { params, env } = context;
  const { filename } = params;

  try {
    // 从 R2 获取图片
    const object = await env.BLOG_R2.get(`images/${filename}`);

    if (!object) {
      return new Response("Image not found", { status: 404 });
    }

    // 返回图片
    return new Response(object.body, {
      headers: {
        "Content-Type": object.httpMetadata.contentType || "image/jpeg",
        "Cache-Control": "public, max-age=31536000",
      },
    });
  } catch (error) {
    console.error("Error serving image:", error);
    return new Response("Error serving image", { status: 500 });
  }
}
