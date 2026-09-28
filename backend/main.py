import os
from dotenv import load_dotenv
from fastapi import FastAPI
import inngest
import inngest.fast_api

load_dotenv()

app = FastAPI()

inngest_client = inngest.Inngest(
    app_id="ai-decision-flow",
    is_production=False,
)

@inngest_client.create_function(
    fn_id="run-workflow",
    trigger=inngest.TriggerEvent(event="workflow/run"),
)
async def run_workflow(ctx: inngest.Context) -> dict:
    # workflow execution logic goes here — next step
    return {"status": "not implemented yet"}

inngest.fast_api.serve(app, inngest_client, [run_workflow])