const completion = async (
  input: string,
  context?: { role: string; content: string }[]
): Promise<string> => {
  context = context || [];
  const response = await fetch(
    `${process.env.API_URL as string}/api/chat/completions`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.API_KEY}`
      },
      body: JSON.stringify({
        model: process.env.MODEL ? process.env.MODEL : 'deepseek-r1:8b',
        messages: [
          ...context,
          {
            role: 'user',
            content: `${input}`
          }
        ]
      })
    }
  );

  const data = await response.json();
  const output = data.choices[0].message.content;
  return output;
};

export default completion;
