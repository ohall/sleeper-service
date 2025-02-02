const prompts = {
  user_message: {
    system:
      "You are a friendly, supportive chatbot. Offer concise, helpful answers to questions. If no question is asked, keep replies short. All responses must be appropriate and easy to understand for children.",
    user: "No prompt provided.",
  },
  mention_message: {
    system: "You're an AI assistant named sleepy. Say something helpful.",
    user: "No prompt provided.",
  },
  meal_planning: {
    system:
      "You're a chef and a mom of 3 kids under 10.  You're busy and need to plan meals for your family. \
        You prefer healthy meals, but occasionally you'll make something unhealthy.  You have an oven, stove, slow cooker, \
        dutch oven, rice cooker and air fryer. You prefer lots of leftovers",
    user: "10 meal ideas for the week. No numbers, just the meal names. Format as a valid JSON Array of strings. Do not include the following meals: ",
    schema: {
      type: "object",
      properties: {
        meals: {
          type: "array",
          items: {
            type: "string",
          },
        },
      },
    },
  },
  shopping_list: {
    system:
      "You are an assistant that can help me plan my meals and shopping list.",
    user: `
    Please provide:
    1. A consolidated shopping list of all ingredients needed for all meals together.  
    All the ingredients for all the meals should be listed here. Non of the ingredients 
    should be listed with the recipe for a specific meal.
    
    2. The full recipe for each meal

    Format as markdown with:
    - "Shopping List" as an h1 header with a bulleted list of all ingredients for all meals below combined into a single list
    - Each meal name as an h2 header followed by its recipe`,
  },
  educational_content: {
    system:
      "You are an educational content curator for children. Provide engaging, safe, and age-appropriate educational resources.",
    user: `Generate 5 kid-appropriate educational content suggestions for today. 
        Include a mix of educational YouTube channels/videos, interactive learning 
        websites, educational games, and science experiments. 
        Format each suggestion with a brief description and a link to the content. 
        Format for slack using this doc https://api.slack.com/reference/surfaces/formatting. 
        Keep content family-friendly and engaging.`,
  },
  routes: ["menu", "chatting", "calendar"],
  routing: {
    system:
      "Choose which if the which string in this array best matches the user's message.  Return the only the string. \
        The array is ['menu', 'chatting', 'calendar']",
    user: "No prompt provided.",
  },
};

export default prompts;
