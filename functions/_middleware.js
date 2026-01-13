/**
 * 全局中间件 - 处理 CORS 和错误
 */
async function onRequest(context) {
  const { request, next, env } = context;

  // CORS 预检请求
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": env.ALLOWED_ORIGINS || "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  try {
    // 继续处理请求
    const response = await next();

    // 添加 CORS 头
    const newResponse = new Response(response.body, response);
    newResponse.headers.set(
      "Access-Control-Allow-Origin",
      env.ALLOWED_ORIGINS || "*"
    );
    newResponse.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    newResponse.headers.set("Access-Control-Allow-Headers", "Content-Type");

    return newResponse;
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": env.ALLOWED_ORIGINS || "*",
      },
    });
  }
}

export { onRequest };
