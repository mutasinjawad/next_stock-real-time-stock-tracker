import { inngest } from "@/lib/inngest/client";
import { NEWS_SUMMARY_EMAIL_PROMPT, PERSONALIZED_WELCOME_EMAIL_PROMPT } from "./prompt";
import { sendWelcomeEmail, sendNewSummaryEmail } from "../nodemailer";
import { getAllUsersForNewsEmail } from "../actions/user.actions";
import { getWatchlistSymbolsByEmail } from "../actions/watchlist.actions";
import { getNews } from "../actions/finnhub.actions";
import { getFormattedTodayDate } from "../utils";

export const sendSignUpEmail = inngest.createFunction(
    { id: 'sign-up-email', name: 'Send Sign Up Email', triggers: [{ event: 'app/user.created' }] },
    async ({ event, step }: { event: any; step: any }) => {
        const userProfile = `
            - Country: ${event.data.country}
            - Investment Goals: ${event.data.investmentGoals}
            - Risk Tolerance: ${event.data.riskTolerance}
            - Preferred Industry: ${event.data.preferredIndustry}
        `

        const prompt = PERSONALIZED_WELCOME_EMAIL_PROMPT.replace("{{userProfile}}", userProfile);

        const response = await step.ai.infer('generate-welcome-intro', {
            model: step.ai.models.gemini({model: 'gemini-3.1-flash-lite'}),
            body: {
                contents: [
                    {
                        role: 'user',
                        parts: [
                            { text: prompt }
                        ]
                    }
                ]
            }
        })

        await step.run('send-welcome-email', async () => {
            const part = response.candidates?.[0]?.content?.parts?.[0];
            const introText = (part && 'text' in part ? part.text: null) || "Welcome to our investment platform! We're excited to have you on board and look forward to helping you achieve your financial goals."
        
            const { data: { email, name } } = event;

            return await sendWelcomeEmail({ email, name, intro: introText });
        })

        return {
            success: true,
            message: 'Welcome email sent successfully'
        }
    }
)

export const sendDailyNewsSummary = inngest.createFunction(
    { 
        id: 'daily-news-summary', 
        name: 'Send Daily News Summary', 
        triggers: [
            { cron: '0 12 * * *' },
            { event: 'app/send.daily.news' }
        ] 
    },
    async ({ step }: { step: any }) => {
        // Step 1: Get all users for news email
        const users = await step.run('get-all-users', getAllUsersForNewsEmail);

        if (!users || users.length === 0) {
            return { success: false, message: 'No users found to send news summary' };
        }

        // Step 2: For each user, get their watchlist symbols → fetch news
        const userNewsData = await step.run('fetch-user-news', async () => {
            const newsMap: { [key: string]: { email: string; name: string; news: MarketNewsArticle[] } } = {};

            for (const user of users) {
                try {
                    const symbols = await getWatchlistSymbolsByEmail(user.email);
                    const news = symbols.length > 0 
                        ? await getNews(symbols)
                        : await getNews(); // General news if no watchlist

                    newsMap[user.id] = {
                        email: user.email,
                        name: user.name,
                        news: news.slice(0, 6), // Max 6 articles per user
                    };
                } catch (error) {
                    console.error(`Error fetching news for user ${user.email}:`, error);
                    newsMap[user.id] = {
                        email: user.email,
                        name: user.name,
                        news: [],
                    };
                }
            }

            return newsMap;
        });

        // Step 3: Summarize news via AI
        const summarizedNews: { [key: string]: string } = {};

        for (const [userId, data] of Object.entries(userNewsData) as Array<[string, { email: string; name: string; news: MarketNewsArticle[] }]>) {
            try {
                if (data.news.length === 0) {
                    summarizedNews[userId] = 'No news available today.';
                    continue;
                }

                const prompt = NEWS_SUMMARY_EMAIL_PROMPT.replace("{{newsData}}", JSON.stringify(data.news, null, 2));

                const response = await step.ai.infer(`summarize-news-${data.email}`, {
                    model: step.ai.models.gemini({ model: 'gemini-3.1-flash-lite' }),
                    body: {
                        contents: [
                            {
                                role: 'user',
                                parts: [
                                    {
                                        text: prompt,
                                    },
                                ],
                            },
                        ],
                    },
                });

                const part = response.candidates?.[0]?.content?.parts?.[0];
                summarizedNews[userId] = (part && 'text' in part ? part.text : null) || 'No market news.';
            } catch (error) {
                console.error(`Error summarizing news for user ${userId}:`, error);
                summarizedNews[userId] = 'Unable to summarize news.';
            }
        }

        // Step 4: Send the emails
        await step.run('send-news-emails', async () => {
            for (const [userId, summary] of Object.entries(summarizedNews) as [string, string][]) {
                try {
                    if (!summary) continue;

                    const user = userNewsData[userId];
                    if (!user) continue;

                    await sendNewSummaryEmail({
                        email: user.email,
                        date: getFormattedTodayDate(),
                        newsContent: summary,
                    });

                    console.log(`News email sent to ${user.email}`);
                } catch (error) {
                    console.error(`Error sending news email:`, error);
                }
            }
        });

        return { success: true, message: 'Daily news summary sent to all users' };
    }
);