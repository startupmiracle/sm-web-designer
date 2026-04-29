export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    endpoint?: string;
    model?: string;
  };

  const endpoint = body.endpoint || "http://localhost:11434";
  const model = body.model || "qwen3.5:4b";

  try {
    const response = await fetch(`${endpoint.replace(/\/$/, "")}/api/tags`, {
      signal: AbortSignal.timeout(3500),
    });

    if (!response.ok) {
      return Response.json(
        { ok: false, message: `Ollama returned ${response.status}` },
        { status: 502 }
      );
    }

    const data = (await response.json()) as { models?: { name: string }[] };
    const hasModel = data.models?.some((item) => item.name === model) ?? false;

    return Response.json({
      ok: hasModel,
      message: hasModel
        ? `${model} is available`
        : `${model} was not found in Ollama`,
      models: data.models?.map((item) => item.name) || [],
    });
  } catch {
    return Response.json(
      { ok: false, message: "Could not reach Ollama at the configured endpoint" },
      { status: 502 }
    );
  }
}
