/**
 * 图片上传 API
 * POST /api/upload - 上传图片到 R2 存储
 */

import { verifyToken } from "./auth/login.js";

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    // 验证管理员权限
    const token = request.headers.get("Authorization")?.replace("Bearer ", "");
    const isAdmin = await verifyToken(env, token);

    if (!isAdmin) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "未授权",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const formData = await request.formData();
    const image = formData.get("image");

    if (!image) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "没有上传文件",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 生成文件名
    const ext = image.name.split(".").pop();
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    const filename = `${timestamp}-${random}.${ext}`;

    // 上传到 R2 的 images 目录
    const r2Key = `images/${filename}`;

    if (env.BLOG_R2) {
      // 使用 R2 存储
      await env.BLOG_R2.put(r2Key, image.stream(), {
        httpMetadata: {
          contentType: image.type,
        },
      });

      // 返回可访问的 URL
      // 假设您配置了 R2 公开访问或自定义域名
      const imageUrl = `/r2/images/${filename}`;

      return new Response(
        JSON.stringify({
          success: true,
          url: imageUrl,
        }),
        {
          headers: { "Content-Type": "application/json" },
        }
      );
    } else {
      // 降级到 KV 存储 (不推荐用于大文件)
      const arrayBuffer = await image.arrayBuffer();
      await env.BLOG_KV.put(`image:${filename}`, arrayBuffer, {
        metadata: { contentType: image.type },
      });

      return new Response(
        JSON.stringify({
          success: true,
          url: `/img/${filename}`,
        }),
        {
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    console.error("Upload error:", error);
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
