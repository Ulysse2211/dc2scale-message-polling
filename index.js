let lastMessageTimestamp = null;
let lastMessageContent = "";

async function updateMessages() {
    const url = localStorage.getItem('tUrl');
    const response = await fetch('http://89.168.41.219:8000/' + url);
    const doc = new DOMParser().parseFromString(await response.text(), "text/html");
    const comments = doc.querySelectorAll('.comment');

    if (comments.length) {
        const comment = comments[comments.length - 1];
        const container = comment.querySelector('.comment-body .flex-column');
        const [d, m, y] = container.querySelector('.date').innerText.split('/');
        const time = container.querySelector('.time').innerText;
        lastMessageTimestamp = new Date(`${y}-${m}-${d} ${time}`);

        const innerContainer = container.querySelector('.flex-column');
        const icon = innerContainer.querySelector('.material-icons');
        if (icon) icon.remove();

        innerContainer.querySelectorAll('a').forEach(a => {
            const href = a.getAttribute('href');
            if (!href.startsWith("http")) a.setAttribute('href', "https://panel.dc2s.fr" + href);
        });

        const html = innerContainer.innerHTML;
        const ntfy = localStorage.getItem('ntfy') === 'true';
        if (lastMessageContent !== html && ntfy) {

            document.getElementById("message").innerHTML = html;
            lastMessageContent = html;
            await fetch(localStorage.getItem('ntfyUrl'), {
                method: 'POST',
                body: innerContainer.querySelector('.text-break').innerText,
                headers: {
                    'Title': 'Nouveau message !',
                    'Priority': 'urgent',
                    'Tags': 'tada,rotating_light'
                }
            });
        }
    } else {
        document.getElementById("message").innerHTML = "Aucun message pour l'instant 😭.";
        lastMessageTimestamp = null;
        lastMessageContent = "";
    }
}

function updateTime() {
    if (!lastMessageTimestamp) return document.getElementById("timeSinceLastMessage").innerHTML = "";

    const totalSeconds = Math.floor((new Date() - lastMessageTimestamp) / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const parts = [];
    if (days) parts.push(days + " jour" + (days > 1 ? "s" : ""));
    if (hours) parts.push(hours + " heure" + (hours > 1 ? "s" : ""));
    if (minutes) parts.push(minutes + " minute" + (minutes > 1 ? "s" : ""));
    if (seconds) parts.push(seconds + " seconde" + (seconds > 1 ? "s" : ""));

    document.getElementById("timeSinceLastMessage").innerHTML = parts.join(", ").replace(/,([^,]*)$/, " et$1");
}
