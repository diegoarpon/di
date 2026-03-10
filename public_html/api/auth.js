export default function handler(req, res) {
    const params = new URLSearchParams({
        client_id: process.env.GITHUB_CLIENT_ID,
        scope: "repo,user",
        redirect_uri: `https://di-livid-eight.vercel.app/api/callback`
    });
    const url = `https://github.com/login/oauth/authorize?${params}`;
    res.setHeader("Content-Type", "text/html");
    res.send(`<!DOCTYPE html><html><body><script>window.location.replace("${url}");<\/script></body></html>`);
}
