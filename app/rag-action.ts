'use server'

import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import fs from "fs";
import path from "path";

let vectorStore: MemoryVectorStore | null = null;

async function getStore() {
  if (vectorStore) return vectorStore;
  const filePath = path.join(process.cwd(), "data/knowledge.txt");
  const text = fs.readFileSync(filePath, "utf-8");

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });
  const docs = await splitter.createDocuments([text]);

  vectorStore = await MemoryVectorStore.fromDocuments(
    docs,
    new GoogleGenerativeAIEmbeddings({ model: "text-embedding-004" })
  );
  return vectorStore;
}

export async function askRAG(question: string) {
  try {
    const store = await getStore();
    const relevantDocs = await store.similaritySearch(question, 3);
    const context = relevantDocs.map(d => d.pageContent).join("\n\n");

    const model = new ChatGoogleGenerativeAI({
      model: "gemini-2.0-flash",
      temperature: 0,
    });
    const res = await model.invoke([
      ["system", `Sirf diye gaye context se jawab do. Context me jawab na ho to saaf kaho ke mujhe maloom nahi, khud se jawab mat banao.\n\nContext:\n${context}`],
      ["human", question],
    ]);
    return res.content as string;
  } catch (e) {
    return "Abhi free limit ya connection ka masla hai — thori dair baad dobara try karein.";
  }
}
