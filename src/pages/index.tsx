import type { NextPage } from "next";
import Head from "next/head";
import { trpc } from "../utils/trpc";
import React from "react";
import { useSession, signIn } from "next-auth/react";

const QuestionsView = () => {
    const { data, isLoading, error } = trpc.useQuery([
        "questions.get-my-questions",
    ]);

    const { mutate: pinQuestion } = trpc.useMutation("questions.pin-question");

    return (
        <div className="flex flex-col">
            {data?.map((q) => (
                <div key={q.id}>
                    {q.body}
                    <button onClick={() => pinQuestion({ questionId: q.id })}>
                        Pin
                    </button>
                </div>
            ))}
        </div>
    );
};

const HomeContents = () => {
    const { data: session, status } = useSession();

    if (status === "loading") {
        return <div>Loading...</div>;
    }

    if (!session)
        return (
            <div>
                <div>Please log in</div>
                <button onClick={() => signIn("twitch")}>
                    Sign in with Twitch
                </button>
            </div>
        );

    return (
        <div className="flex flex-col">
            <div>
                Hello {session.user?.name} {session.user?.id}!
            </div>
            <QuestionsView />
        </div>
    );
};

const Home: NextPage = () => {
    return (
        <>
            <Head>
                <title>Stream Q&A Tool</title>
                <meta name="description" content="Generated by create-t3-app" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <HomeContents />
        </>
    );
};

export default Home;
