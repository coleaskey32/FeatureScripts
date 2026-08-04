# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repository is

A collection of Onshape FeatureScript custom features. Despite the `.js` extension, files here are **FeatureScript**, not JavaScript — Onshape's parametric CAD language. There is no build system, package manager, linter, or test suite: code is developed and validated by pasting it into an Onshape **Feature Studio**, where the editor compiles it and reports errors, and the feature is exercised by inserting it into a Part Studio and regenerating with various inputs.

Current contents:

- `Pegboard-Accessories.js` — a "Pegboard holder" feature that generates tool holders (upswept hook, double prong, shelf, ring rack, can rack, slot rack, or bare backplate) for US-standard pegboard (1/4" holes on 1" centers). An optional "Slick styling" mode rounds the backplate corners and applies a best-effort edge fillet (`try silent`) over the finished body.

## FeatureScript conventions used here

- Files start with a `FeatureScript <version>;` declaration and `import` the Onshape standard library at a matching version (currently 686). Keep imports pinned to the same version as the declaration.
- Each feature is an exported `defineFeature` with two blocks:
  - **`precondition`** — declares the UI: every parameter gets an `annotation { "Name" : ... }` plus a type check (`isLength`, `isInteger`, `is <Enum>`). Parameters are shown conditionally by wrapping them in `if` on earlier parameter values (e.g. hook dimensions only appear when `style == HolderStyle.HOOK`).
  - **body** — builds geometry in the `context`.
- Numeric parameters use named `*BoundSpec` constants (`{ (meter) : [min, default, max], (millimeter) : ..., (inch) : ... }`) declared at the top of the file — the `(meter)` triple is min/default/max in SI, the other unit entries are the default expressed in that unit. Add new parameters the same way rather than inlining bounds.
- Enums drive mode selection (`HolderStyle`, `PegStyle`) with `annotation { "Name" : ... }` on each value for display labels.
- All quantities carry units (`* meter`, `1 * millimeter`); never use bare numbers for lengths.
- Invalid parameter combinations are rejected with `throw regenError("message")` containing a user-actionable message (e.g. rings overlapping).

## Geometry-building pattern (Pegboard-Accessories.js)

The feature builds in a fixed local frame, documented in the file's header comment: +X right, +Y up, +Z out of the board face, with Z = 0 at the pegboard's front surface. Pegs extend into −Z, the holder extends into +Z.

Construction proceeds in phases, and new holder styles should follow the same flow:

1. Create all solid bodies (`fCuboid`, `fCylinder`, `fSphere`; the hook rod is a circle profile swept along a sketched path with `opSweep`, and the helper sketches are deleted with `opDeleteBodies` immediately after the sweep) with unique ids derived from the feature id (`id + "plate"`, `id + ("peg" ~ i ~ "_" ~ j)`).
2. Union everything created so far into one body (`opBoolean` over `qCreatedBy(id, EntityType.BODY)`).
3. Create cutter bodies (ring holes, slots), collect their queries in a list, and subtract them in a single boolean (targets are `qSubtraction(qCreatedBy(...), cutterQ)` so cutters don't cut each other). Cutters are oversized by a small `eps` (1 mm) to avoid coincident-face booleans.
4. Optionally transform all created bodies onto a user-picked mate connector (`evMateConnector` + `opTransform`); until then geometry lives in the local frame above.

## Adding a new feature script

Put each independent feature in its own top-level `.js` file, following the structure above: version/import header, block comment describing the local coordinate frame and target hardware dimensions, bound-spec constants, enums, then the `defineFeature`.
