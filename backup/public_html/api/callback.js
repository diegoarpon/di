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
        return res.send(`<script>
  const msg = 'authorization:github:error:${error}';
  if (window.opener) { window.opener.postMessage(msg, '*'); window.close(); }
  else { window.location = '/test/admin/'; }
</script>`);
    }
    res.send(`<script>
  const msg = 'authorization:github:success:{"token":"${access_token}","provider":"github"}';
  if (window.opener) { window.opener.postMessage(msg, '*'); window.close(); }
  else { localStorage.setItem('decap-cms-auth', msg); window.location = '/test/admin/'; }
</script>`);
}
