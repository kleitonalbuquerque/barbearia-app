export async function GET() {
	return new Response(JSON.stringify({ message: 'API de barbeiros funcionando.' }), {
		status: 200,
		headers: { 'Content-Type': 'application/json' },
	});
}
