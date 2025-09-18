export async function GET(request: Request) {
	return new Response(JSON.stringify({ message: 'API de barbeiro [id] funcionando.' }), {
		status: 200,
		headers: { 'Content-Type': 'application/json' },
	});
}
