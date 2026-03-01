import t1 from "../../data/tasks/t1_jump_ing_join.json";
import t2 from "../../data/tasks/t2_make_ing_join.json";
import t3 from "../../data/tasks/t3_transfer_bake_ing.json";
import t4 from "../../data/tasks/t4_matrix_jump.json";
import t5 from "../../data/tasks/t5_matrix_make.json";
import t6 from "../../data/tasks/t6_matrix_try.json";
import t7 from "../../data/tasks/t7_matrix_run.json";

export type Task = typeof t1;

export const TASKS_BY_ID: Record<string, Task> = {
  [t1.id]: t1,
  [t2.id]: t2,
  [t3.id]: t3,
  [t4.id]: t4,
  [t5.id]: t5,
  [t6.id]: t6,
  [t7.id]: t7
};

export function getTask(id: string): Task {
  const task = TASKS_BY_ID[id];
  if (!task) throw new Error(`Task not found: ${id}`);
  return task;
}
