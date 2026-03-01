import React, { useMemo, useState } from "react";
import { getTask } from "./data/taskIndex";
import { nextTaskId } from "./data/routing";
import { TaskRunner } from "./components/TaskRunner";
import type { ResponseMap } from "./scoring/scoreV1";
import { guideV1 } from "./guidance/guideV1";

export default function App() {
  const [taskId, setTaskId] = useState<string>("t4_matrix_jump");
  const [responses, setResponses] = useState<ResponseMap>({});
  const [statusText, setStatusText] = useState<string>("");

  const [mediatorTitle, setMediatorTitle] = useState<string>("Mediator");
  const [mediatorPrompts, setMediatorPrompts] = useState<string[]>([]);
  const [canContinue, setCanContinue] = useState<boolean>(false);

  const task = useMemo(() => getTask(taskId), [taskId]);

  function handleCheckEvidence() {
    const g = guideV1(task, responses);

    if (g.supported) {
      setMediatorTitle("Supported ✅");
      setMediatorPrompts(g.prompts);
      setStatusText("Your explanation is supported by evidence. You can continue.");
      setCanContinue(true);
    } else {
      setMediatorTitle("Not yet supported");
      setMediatorPrompts(g.prompts);
      setStatusText("Revise using the prompts above, then check again.");
      setCanContinue(false);
    }
  }

  function handleContinue() {
    const g = guideV1(task, responses);
    if (!g.supported) {
      // guardrail: don’t route unless supported
      setMediatorTitle("Not yet supported");
      setMediatorPrompts(g.prompts);
      setStatusText("Before continuing: revise until your explanation is supported.");
      setCanContinue(false);
      return;
    }

    const next = nextTaskId(task, { mastered: true, error_tags: [] }); // routing on supported only (v1)
    if (next) {
      setTaskId(next);
      setResponses({});
      setMediatorTitle("Mediator");
      setMediatorPrompts([]);
      setStatusText("");
      setCanContinue(false);
    } else {
      setStatusText("End of routes (v1).");
    }
  }

  return (
    <TaskRunner
      task={task}
      responses={responses}
      setResponses={setResponses}
      onCheck={handleCheckEvidence}
      onContinue={handleContinue}
      statusText={statusText}
      mediatorTitle={mediatorTitle}
      mediatorPrompts={mediatorPrompts}
      canContinue={canContinue}
    />
  );
}
