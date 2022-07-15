import { useRouter } from "next/router";
import { useMemo, useState, useEffect } from "react";

import Pusher from "pusher-js";
import { env } from "../../server/env";

const pusherKey = process.env.NEXT_PUBLIC_PUSHER_APP_KEY;

const useLatestPusherMessage = (userId: string) => {
    const pusherClient = useMemo(
        () =>
            new Pusher("190610246f7fe0623def", {
                cluster: "us2",
            }),
        []
    );

    const [latestMessage, setLatestMessage] = useState<string | null>(null);

    useEffect(() => {
        const channel = pusherClient.subscribe(`user-${userId}`);
        channel.bind("question-pinned", (data: { question: string }) => {
            setLatestMessage(data.question);
        });

        channel.bind("question-unpinned", () => {
            setLatestMessage(null);
        });

        return () => {
            pusherClient.unsubscribe(`user-${userId}`);
        };
    }, [pusherClient, userId]);

    return latestMessage;
};

const BrowserEmbedView: React.FC<{ userId: string }> = ({ userId }) => {
    const latestMessage = useLatestPusherMessage(userId);

    if (!latestMessage) return null;

    return (
        <div className="w-screen h-screen flex justify-center items-center">
            <div className="p-8 bg-gray-800 text-white rounded shadow">
                {latestMessage}
            </div>
        </div>
    );
};

const BrowserEmbedQuestionView = () => {
    const { query } = useRouter();

    if (!query.uid || typeof query.uid !== "string") {
        return null;
    }

    return <BrowserEmbedView userId={query.uid} />;
};

export default BrowserEmbedQuestionView;
