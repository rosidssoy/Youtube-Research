import { Client } from '@notionhq/client';

/**
 * Get or create Notion client instance
 * Lazy initialization to ensure environment variables are loaded
 */
function getNotionClient() {
    if (!process.env.NOTION_API_KEY) {
        throw new Error("NOTION_API_KEY is not configured");
    }
    return new Client({ auth: process.env.NOTION_API_KEY });
}

/**
 * Fetch all active prompts from Notion database
 * @returns {Promise<Array>} Array of prompt objects
 */
export async function getPrompts() {
    // Check if Notion is configured
    if (!process.env.NOTION_API_KEY || !process.env.NOTION_DATABASE_ID) {
        throw new Error("Notion is not configured. Please set NOTION_API_KEY and NOTION_DATABASE_ID in your .env file.");
    }

    try {
        const notion = getNotionClient();

        const response = await notion.databases.query({
            database_id: process.env.NOTION_DATABASE_ID,
            filter: {
                property: 'Active',
                checkbox: { equals: true }
            },
            sorts: [{
                property: 'Order',
                direction: 'ascending'
            }],
        });

        return response.results.map(page => ({
            id: page.id,
            title: page.properties.Title?.title[0]?.plain_text || '',
            category: page.properties.Category?.select?.name || 'Uncategorized',
            order: page.properties.Order?.number || 0,
            prompt: page.properties.Prompt?.rich_text?.map(t => t.plain_text).join('') || '',
        }));
    } catch (error) {
        console.error('Notion API error:', error);
        throw new Error(`Failed to fetch prompts: ${error.message}`);
    }
}

/**
 * Fetch prompts grouped by category
 * @returns {Promise<Object>} Object with categories as keys and arrays of prompts as values
 */
export async function getPromptsByCategory() {
    const prompts = await getPrompts();

    return prompts.reduce((acc, prompt) => {
        if (!acc[prompt.category]) {
            acc[prompt.category] = [];
        }
        acc[prompt.category].push(prompt);
        return acc;
    }, {});
}
