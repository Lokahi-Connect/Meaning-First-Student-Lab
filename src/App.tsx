import React, { useMemo, useState } from "react";
import { getTask } from "./data/taskIndex";
import { nextTaskId } from "./data/routing";
import { TaskRunner } from "./components/TaskRunner";
import type { ResponseMap } from "./scoring/scoreV1";
import { guideV1 } from "./guidance/guideV1";

export default function App() {
  const [taskId, setTaskId] = useState<string>("t7_matrix_run");
  const [responses, setResponses] = useState<ResponseMap>({});
  const [statusText, setStatusText] = useState<string>("");

  const [mediatorTitle, setMediatorTitle] = useState<string>("Mediator");
  const [mediatorPrompts, setMediatorPrompts] = useState<string[]>([]);
  const [canContinue, setCanContinue] = useState<boolean>(false);

  const task = useMemo(() => getTask(taskId), [taskId]);

  function handleCheckEvidence() {
    const guidance = guideV1(task, responses);

    if (guidance.supported) {
      setMediatorTitle("Supported ✅");
      setMediatorPrompts(guidance.prompts);
      setStatusText("Your explanation is supported by evidence.");
      setCanContinue(true);
    } else {
      setMediatorTitle("Not yet supported");
      setMediatorPrompts(guidance.prompts);
      setStatusText("Revise using the prompts above.");
      setCanContinue(false);
    }
  }

  function handleContinue() {
    // 🔒 HARD ENFORCEMENT: re-check before routing
    const guidance = guideV1(task, responses);

    if (!guidance.supported) {
      setMediatorTitle("Not yet supported");
      setMediatorPrompts(guidance.prompts);
      setStatusText("You must complete the required proof before continuing.");
      setCanContinue(false);
      return;
    }

    const next = nextTaskId(task, { mastered: true, error_tags: [] });

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
