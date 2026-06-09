export const sendMessage = async (message: string): Promise<Record<string, unknown>> => {
    const res = await fetch("http://localhost:3000/api/chat", {
        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            messages: [
                {
                    role: "assistant",
                    content: "Tu es un assistant utile"
                },
                {
                    role: "user",
                    content: message
                }
            ]
        })
    });

    return res.json();
};