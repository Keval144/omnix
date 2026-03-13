interface GLMResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

const API_KEY = "dce9fffbf334476d857b0a8b1723e2c4.4u4OxjegTxcRLt9t";



async function testGLM() {
  try {
    const response = await fetch(
      "https://open.bigmodel.cn/api/paas/v4/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: "glm-4.5-flash",
          messages: [
            {
              role: "user",
              content: "Explain deep learning simply"
            }
          ]
        })
      }
    );

    const data = (await response.json()) as GLMResponse;

    console.log("AI Response:");
    console.log(data.choices[0].message.content);

  } catch (error) {
    console.error("Error calling API:", error);
  }
}

testGLM();