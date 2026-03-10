export default function handler(req, res) {
    const params = new URLSearchParams({
        client_id: process.env.GITHUB_CLIENT_ID,
        scope: "repo,user",
        redirect_uri: `https://di-livid-eight.vercel.app/api/callback`
    });
    res.redirect(`https://github.com/login/oauth/authorize?${params}`);
}
