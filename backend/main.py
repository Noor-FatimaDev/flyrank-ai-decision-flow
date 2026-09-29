import os
from dotenv import load_dotenv
from fastapi import FastAPI
from openai import OpenAI
from fastapi.middleware.cors import CORSMiddleware
import inngest
import inngest.fast_api
import requests as http

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

inngest_client = inngest.Inngest(
    app_id="ai-decision-flow",
    is_production=False,
)

groq_client = OpenAI(
    api_key=os.environ["GROQ_API_KEY"],
    base_url="https://api.groq.com/openai/v1",
)


def find_start_node(nodes, edges):
    target_ids = {edge["target"] for edge in edges}
    for node in nodes:
        if node["id"] not in target_ids:
            return node
    return None


def find_next_node(nodes, edges, current_id, answer):
    for edge in edges:
        if edge["source"] == current_id and edge.get("sourceHandle") == answer:
            next_id = edge["target"]
            return next((n for n in nodes if n["id"] == next_id), None)
    return None


def ask_llm(prompt: str) -> str:
    response = groq_client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[
            {
                "role": "system",
                "content": "You must answer with exactly one word: YES or NO. Nothing else.",
            },
            {"role": "user", "content": prompt},
        ],
    )
    answer = response.choices[0].message.content.strip().upper()
    return "yes" if "YES" in answer else "no"


@inngest_client.create_function(
    fn_id="run-workflow",
    trigger=inngest.TriggerEvent(event="workflow/run"),
)
async def run_workflow(ctx: inngest.Context) -> dict:
    nodes = ctx.event.data["nodes"]
    edges = ctx.event.data["edges"]

    execution_order = []
    current = find_start_node(nodes, edges)

    if current is None:
        return {
            "execution_order": [],
            "status": "error",
            "message": "No start node found — every node has something pointing into it, or the graph is empty.",
        }

    while current is not None:
        node_id = current["id"]
        prompt = current["data"].get("label", "")

        if not prompt or not prompt.strip():
            execution_order.append(
                {"node_id": node_id, "prompt": prompt, "answer": None, "error": "Empty prompt"}
            )
            return {
                "execution_order": execution_order,
                "status": "error",
                "message": f"Node {node_id} has an empty prompt — the workflow stopped there.",
            }

        answer = await ctx.step.run(
            f"ask-{node_id}",
            lambda: ask_llm(prompt),
        )

        execution_order.append({"node_id": node_id, "prompt": prompt, "answer": answer})
        current = find_next_node(nodes, edges, node_id, answer)

    return {"execution_order": execution_order, "status": "completed"}


@app.post("/api/run")
async def trigger_run(payload: dict):
    result = await inngest_client.send(
        inngest.Event(name="workflow/run", data=payload)
    )
    return {"status": "started", "event_id": result[0]}

@app.get("/api/run/{event_id}")
async def get_run_status(event_id: str):
    response = http.get(f"http://localhost:8288/v1/events/{event_id}/runs")
    return response.json()

inngest.fast_api.serve(app, inngest_client, [run_workflow])