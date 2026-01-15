/**
 * 触发 Cloudflare Pages 重新构建
 * POST /api/rebuild
 */

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    // 验证管理员权限
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ success: false, error: "未授权" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const token = authHeader.substring(7);
    const role = await env.BLOG_KV.get(`auth:${token}`);
    if (role !== "admin") {
      return new Response(
        JSON.stringify({ success: false, error: "权限不足" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    // 调用 Cloudflare Pages Deploy Hook
    // Deploy Hook URL 需要在环境变量中配置
    const deployHookUrl = env.DEPLOY_HOOK_URL;

    if (!deployHookUrl) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Deploy Hook 未配置,请在环境变量中设置 DEPLOY_HOOK_URL",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // 触发构建
    const response = await fetch(deployHookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Deploy Hook 返回错误: ${response.status}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "构建已触发,预计 2-5 分钟后生效",
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error triggering rebuild:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
