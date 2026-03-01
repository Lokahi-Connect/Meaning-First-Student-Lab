# GOLDEN_PATH_V1

## Purpose
The Golden Path is the smallest end-to-end flow that proves the Student Lab works:

1. Load a task
2. Render prompts + collect response
3. Score + classify errors
4. Route to the next task (adaptivity)

This is a systems test, not a full curriculum.

---

## Golden Path v1: <-ing> joins + transfer
We use one stable suffix (<-ing>) and vary join demands to force structural noticing.

### Task sequence
1. **t1_jump_ing_join** (no change)
2. **t2_make_ing_join** (final <e> drop)
3. **t3_transfer_bake_ing** (transfer the join convention)

---

## Files (v1)
### Schema
- `schema/task.schema.json`

### Tasks
- `data/tasks/t1_jump_ing_join.json`
- `data/tasks/t2_make_ing_join.json`
- `data/tasks/t3_transfer_bake_ing.json`

### Routing (v1)
- `data/routing/rules_v1.json`

---

## Success criteria
Golden Path is considered “working” when:

- The app can load a task by id
- The UI renders: stem + questions + supports
- The UI captures responses for each field
- Scoring returns:
  - total points
  - mastery (true/false)
  - error_tags (if any)
- Routing selects the next task id using `rules_v1.json`

---

## Design constraints (Meaning-First)
- Meaning before sound
- Base identification before suffix analysis
- Join conventions are explained with evidence
- Grapheme function language stays non-binding
- No speed rewards
