import React, { useMemo, useState } from "react";
import { getTask } from "./data/taskIndex";
import { scoreTaskV1, type ResponseMap } from "./scoring/scoreV1";
import { nextTaskId } from "./data/routing";
import { TaskRunner } from "./components/TaskRunner";

export default function App() {
  const [taskId, setTaskId] = useState<string>("t1_jump_ing_join");
  const [responses, setResponses] = useState<ResponseMap>({});
  const [statusText, setStatusText] = useState<string>("");

  const task = useMemo(() => getTask(taskId), [taskId]);

  function handleSubmit() {
    const score = scoreTaskV1(task, responses);
    const next = nextTaskId(task, score);

    const summary = `Mastered: ${score.mastered ? "yes" : "no"} | Errors: ${
      score.error_tags.length ? score.error_tags.join(", ") : "none"
    }`;

    if (next) {
      setStatusText(`${summary} → Next: ${next}`);
      setTaskId(next);
      setResponses({});
    } else {
      setStatusText(`${summary} → End of routes (v1)`);
    }
  }

  return (
    <TaskRunner
      task={task}
      responses={responses}
      setResponses={setResponses}
      onSubmit={handleSubmit}
      statusText={statusText}
    />
  );
}
