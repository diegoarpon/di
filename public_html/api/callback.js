export default async function handler(req, res) {
    const { code } = req.query;
    const response = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,
            code
        })
    });
    const { access_token, error } = await response.json();
    if (error || !access_token) {
        return res.status(400).send(`<script>window.opener.postMessage('authorization:github:error:${error}','*');window.close();</script>`);
    }
    res.send(`<script>window.opener.postMessage('authorization:github:success:{"token":"${access_token}","provider":"github"}','*');window.close();</script>`);
}
