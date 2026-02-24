import { NextRequest } from "next/server";

// Store active SSE clients
const clients = new Set<ReadableStreamDefaultController>();

// GET /api/code?id=<ID> — sends the ID to all connected SSE listeners
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    // If an ID was provided, broadcast it to all connected clients
    if (id) {
        const message = `data: ${JSON.stringify({ id })}\n\n`;
        for (const controller of Array.from(clients)) {
            try {
                controller.enqueue(new TextEncoder().encode(message));
            } catch {
                clients.delete(controller);
            }
        }

        return new Response(JSON.stringify({ ok: true, id }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    }

    // No ID → open an SSE stream for this client
    let controller: ReadableStreamDefaultController;

    const stream = new ReadableStream({
        start(c) {
            controller = c;
            clients.add(controller);
            // Keep-alive comment
            controller.enqueue(new TextEncoder().encode(": connected\n\n"));
        },
        cancel() {
            clients.delete(controller);
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
        },
    });
}
