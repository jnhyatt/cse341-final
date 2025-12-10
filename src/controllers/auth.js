export async function handleCallback(req, res) {
    res.redirect("/me");
}

export function logout(req, res) {
    req.logout(() => {
        res.redirect("/me");
    });
}
