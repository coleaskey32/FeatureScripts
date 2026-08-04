FeatureScript 686;
import(path : "onshape/std/geometry.fs", version : "686.0");

/* ============================================================
   Pegboard Tool Holder
   For US-standard pegboard: 1/4" holes on 1" centers.

   Local build frame (before optional mate connector placement):
     +X = right across the board
     +Y = up
     +Z = out of the board face (toward you)
     Z = 0 is the FRONT SURFACE of the pegboard.

   Hooks follow the standard commercial shape: one continuous
   round rod swept out at a slight upward angle, curving gently
   up at the tip so tools can't slide off.
   ============================================================ */

export enum HolderStyle
{
    annotation { "Name" : "Backplate only" }
    NONE,
    annotation { "Name" : "Hook (upswept)" }
    HOOK,
    annotation { "Name" : "Double prong (pliers, cutters)" }
    DOUBLE,
    annotation { "Name" : "Shelf" }
    SHELF,
    annotation { "Name" : "Ring rack" }
    RINGS,
    annotation { "Name" : "Can rack (spray paint, bottles)" }
    CANS,
    annotation { "Name" : "Slot rack" }
    SLOTS
}

export enum PegStyle
{
    annotation { "Name" : "Straight (friction fit)" }
    STRAIGHT,
    annotation { "Name" : "Hooked (top row locks in)" }
    HOOKED
}

const GRID_BOUNDS = { (unitless) : [1, 2, 40] } as IntegerBoundSpec;
const RING_BOUNDS = { (unitless) : [1, 3, 40] } as IntegerBoundSpec;

const PITCH_BOUNDS =
{
    (meter)      : [0.005, 0.0254, 0.5],
    (millimeter) : 25.4,
    (inch)       : 1.0
} as LengthBoundSpec;

const PEG_BOUNDS =
{
    (meter)      : [0.0005, 0.005969, 0.05],
    (millimeter) : 5.969,
    (inch)       : 0.235
} as LengthBoundSpec;

const BOARD_BOUNDS =
{
    (meter)      : [0.0005, 0.00635, 0.05],
    (millimeter) : 6.35,
    (inch)       : 0.25
} as LengthBoundSpec;

const PLATE_BOUNDS =
{
    (meter)      : [0.0005, 0.004, 0.05],
    (millimeter) : 4.0,
    (inch)       : 0.16
} as LengthBoundSpec;

const MARGIN_BOUNDS =
{
    (meter)      : [0.0, 0.008, 0.2],
    (millimeter) : 8.0,
    (inch)       : 0.3
} as LengthBoundSpec;

const LIP_T_BOUNDS =
{
    (meter)      : [0.0005, 0.002, 0.02],
    (millimeter) : 2.0,
    (inch)       : 0.08
} as LengthBoundSpec;

const LIP_D_BOUNDS =
{
    (meter)      : [0.0005, 0.003, 0.03],
    (millimeter) : 3.0,
    (inch)       : 0.12
} as LengthBoundSpec;

const OUT_BOUNDS =
{
    (meter)      : [0.001, 0.03, 0.5],
    (millimeter) : 30.0,
    (inch)       : 1.2
} as LengthBoundSpec;

const ROD_BOUNDS =
{
    (meter)      : [0.0005, 0.005, 0.05],
    (millimeter) : 5.0,
    (inch)       : 0.2
} as LengthBoundSpec;

const ANGLE_BOUNDS =
{
    (degree) : [0, 10, 45]
} as AngleBoundSpec;

const PRONG_BOUNDS =
{
    (meter)      : [0.002, 0.018, 0.3],
    (millimeter) : 18.0,
    (inch)       : 0.7
} as LengthBoundSpec;

const RING_R_BOUNDS =
{
    (meter)      : [0.0005, 0.01, 0.2],
    (millimeter) : 10.0,
    (inch)       : 0.4
} as LengthBoundSpec;

const CAN_DIA_BOUNDS =
{
    (meter)      : [0.005, 0.07, 0.2],
    (millimeter) : 70.0,
    (inch)       : 2.75
} as LengthBoundSpec;

const CAN_DEPTH_BOUNDS =
{
    (meter)      : [0.01, 0.1, 0.3],
    (millimeter) : 100.0,
    (inch)       : 4.0
} as LengthBoundSpec;

const SLOT_W_BOUNDS =
{
    (meter)      : [0.0005, 0.008, 0.2],
    (millimeter) : 8.0,
    (inch)       : 0.3
} as LengthBoundSpec;

const EDGE_R_BOUNDS =
{
    (meter)      : [0.0001, 0.0008, 0.005],
    (millimeter) : 0.8,
    (inch)       : 0.03
} as LengthBoundSpec;

annotation { "Feature Type Name" : "Pegboard holder" }
export const pegboardHolder = defineFeature(function(context is Context, id is Id, definition is map)
    precondition
    {
        // ---- peg grid ----
        annotation { "Name" : "Holes across" }
        isInteger(definition.cols, GRID_BOUNDS);

        annotation { "Name" : "Holes down" }
        isInteger(definition.rows, GRID_BOUNDS);

        annotation { "Name" : "Hole spacing" }
        isLength(definition.pitch, PITCH_BOUNDS);

        annotation { "Name" : "Peg diameter" }
        isLength(definition.pegDia, PEG_BOUNDS);

        annotation { "Name" : "Board thickness" }
        isLength(definition.boardT, BOARD_BOUNDS);

        annotation { "Name" : "Peg style" }
        definition.pegStyle is PegStyle;

        if (definition.pegStyle == PegStyle.HOOKED)
        {
            annotation { "Name" : "Hook clearance behind board" }
            isLength(definition.lipT, LIP_T_BOUNDS);

            annotation { "Name" : "Hook tip rise" }
            isLength(definition.lipDrop, LIP_D_BOUNDS);
        }

        // ---- backplate ----
        annotation { "Name" : "Backplate thickness" }
        isLength(definition.plateT, PLATE_BOUNDS);

        annotation { "Name" : "Backplate margin" }
        isLength(definition.margin, MARGIN_BOUNDS);

        // ---- holder ----
        annotation { "Name" : "Holder style" }
        definition.style is HolderStyle;

        if (definition.style == HolderStyle.HOOK ||
            definition.style == HolderStyle.DOUBLE)
        {
            annotation { "Name" : "Hook length out" }
            isLength(definition.hookOut, OUT_BOUNDS);

            annotation { "Name" : "Tip rise" }
            isLength(definition.hookUp, ROD_BOUNDS);

            annotation { "Name" : "Rod diameter" }
            isLength(definition.rodDia, ROD_BOUNDS);

            annotation { "Name" : "Shaft upsweep angle" }
            isAngle(definition.upAngle, ANGLE_BOUNDS);
        }

        if (definition.style == HolderStyle.DOUBLE)
        {
            annotation { "Name" : "Prong spacing" }
            isLength(definition.prongGap, PRONG_BOUNDS);
        }

        if (definition.style == HolderStyle.SHELF ||
            definition.style == HolderStyle.RINGS ||
            definition.style == HolderStyle.SLOTS)
        {
            annotation { "Name" : "Shelf depth" }
            isLength(definition.shelfDepth, OUT_BOUNDS);
        }

        if (definition.style == HolderStyle.SHELF ||
            definition.style == HolderStyle.RINGS ||
            definition.style == HolderStyle.SLOTS ||
            definition.style == HolderStyle.CANS)
        {
            annotation { "Name" : "Shelf thickness" }
            isLength(definition.shelfT, PLATE_BOUNDS);
        }

        if (definition.style == HolderStyle.SHELF)
        {
            annotation { "Name" : "Front lip height" }
            isLength(definition.shelfLip, ROD_BOUNDS);
        }

        if (definition.style == HolderStyle.RINGS)
        {
            annotation { "Name" : "Number of rings" }
            isInteger(definition.ringCount, RING_BOUNDS);

            annotation { "Name" : "Ring radius" }
            isLength(definition.ringR, RING_R_BOUNDS);
        }

        if (definition.style == HolderStyle.CANS)
        {
            annotation { "Name" : "Number of cans" }
            isInteger(definition.canCount, RING_BOUNDS);

            annotation { "Name" : "Can diameter" }
            isLength(definition.canDia, CAN_DIA_BOUNDS);

            annotation { "Name" : "Can rack depth" }
            isLength(definition.canDepth, CAN_DEPTH_BOUNDS);
        }

        if (definition.style == HolderStyle.SLOTS)
        {
            annotation { "Name" : "Number of slots" }
            isInteger(definition.slotCount, RING_BOUNDS);

            annotation { "Name" : "Slot width" }
            isLength(definition.slotW, SLOT_W_BOUNDS);

            annotation { "Name" : "Slot depth" }
            isLength(definition.slotDepth, RING_R_BOUNDS);
        }

        // ---- styling ----
        annotation { "Name" : "Slick styling", "Default" : true }
        definition.slick is boolean;

        if (definition.slick)
        {
            annotation { "Name" : "Edge fillet radius" }
            isLength(definition.edgeR, EDGE_R_BOUNDS);
        }

        // ---- placement ----
        annotation { "Name" : "Place on mate connector" }
        definition.usePlacement is boolean;

        if (definition.usePlacement)
        {
            annotation { "Name" : "Mate connector (Z out of board)",
                         "Filter" : BodyType.MATE_CONNECTOR,
                         "MaxNumberOfPicks" : 1 }
            definition.origin is Query;
        }
    }
    {
        const pitch  = definition.pitch;
        const cols   = definition.cols;
        const rows   = definition.rows;
        const pegR   = definition.pegDia / 2;
        const boardT = definition.boardT;
        const plateT = definition.plateT;

        const gridW = (cols - 1) * pitch;
        const gridH = (rows - 1) * pitch;
        const width  = gridW + 2 * definition.margin;
        const height = gridH + 2 * definition.margin;

        const xL = -width / 2;
        const xR =  width / 2;
        const yB = -height / 2;
        const yT =  height / 2;
        const z0 = 0 * meter;

        const slick = definition.slick;

        // ---------- backplate ----------
        // Slick styling: rounded corners, built as two overlapping
        // cuboids plus four corner cylinders (radius = margin, capped
        // so the cuboids keep positive size on 1-hole grids).
        const cornerR = slick ?
            min(definition.margin, min(0.45 * width, 0.45 * height)) : 0 * meter;

        if (cornerR > 0.2 * millimeter)
        {
            fCuboid(context, id + "plateX", {
                        "corner1" : vector(xL + cornerR, yB, z0),
                        "corner2" : vector(xR - cornerR, yT, plateT)
                    });
            fCuboid(context, id + "plateY", {
                        "corner1" : vector(xL, yB + cornerR, z0),
                        "corner2" : vector(xR, yT - cornerR, plateT)
                    });
            const cornerXs = [xL + cornerR, xR - cornerR];
            const cornerYs = [yB + cornerR, yT - cornerR];
            for (var ci = 0; ci < 2; ci += 1)
            {
                for (var cj = 0; cj < 2; cj += 1)
                {
                    fCylinder(context, id + ("corner" ~ ci ~ "_" ~ cj), {
                                "topCenter"    : vector(cornerXs[ci], cornerYs[cj], plateT),
                                "bottomCenter" : vector(cornerXs[ci], cornerYs[cj], z0),
                                "radius"       : cornerR
                            });
                }
            }
        }
        else
        {
            fCuboid(context, id + "plate", {
                        "corner1" : vector(xL, yB, z0),
                        "corner2" : vector(xR, yT, plateT)
                    });
        }

        // ---------- pegs ----------
        // Hooked style: each top-row peg is one continuous round rod
        // (swept circle profile) that passes through the board and
        // curls smoothly upward behind it, locking the holder in like
        // a commercial pegboard hook. All other pegs are straight
        // friction pins.
        const hooked = definition.pegStyle == PegStyle.HOOKED;

        for (var j = 0; j < rows; j += 1)
        {
            const y = -gridH / 2 + j * pitch;
            const useHook = hooked && (j == rows - 1);

            for (var i = 0; i < cols; i += 1)
            {
                const x = -gridW / 2 + i * pitch;

                if (!useHook)
                {
                    fCylinder(context, id + ("peg" ~ i ~ "_" ~ j), {
                                "topCenter"    : vector(x, y, z0),
                                "bottomCenter" : vector(x, y, -boardT),
                                "radius"       : pegR
                            });
                    continue;
                }

                // Path sketch on the plane x = x of this peg, oriented
                // so sketch x = world Z, sketch y = world Y. The rod
                // starts inside the backplate, runs straight through
                // the board plus a clearance gap, then a quarter-circle
                // arc turns it upward, ending in a short vertical tip.
                const bendR = 1.5 * pegR;
                const bendStart = vector(-boardT - definition.lipT, y);
                const bendCenter = bendStart + vector(0 * meter, bendR);
                const bendEnd = bendCenter + vector(-bendR, 0 * meter);
                const bendMid = bendCenter + bendR * vector(-sqrt(0.5), -sqrt(0.5));
                const tipEnd = bendEnd + vector(0 * meter, definition.lipDrop);

                const pathId = id + ("pegPath" ~ i);
                var pathSk = newSketchOnPlane(context, pathId, {
                            "sketchPlane" : plane(vector(x, 0 * meter, 0 * meter),
                                                  vector(-1, 0, 0), vector(0, 0, 1))
                        });
                skLineSegment(pathSk, "shank", { "start" : vector(plateT / 2, y), "end" : bendStart });
                skArc(pathSk, "bend", { "start" : bendStart, "mid" : bendMid, "end" : bendEnd });
                skLineSegment(pathSk, "tip", { "start" : bendEnd, "end" : tipEnd });
                skSolve(pathSk);

                const profileId = id + ("pegProfile" ~ i);
                var profileSk = newSketchOnPlane(context, profileId, {
                            "sketchPlane" : plane(vector(x, y, plateT / 2),
                                                  vector(0, 0, 1), vector(1, 0, 0))
                        });
                skCircle(profileSk, "disk", { "center" : vector(0 * meter, 0 * meter), "radius" : pegR });
                skSolve(profileSk);

                opSweep(context, id + ("pegHook" ~ i), {
                            "profiles" : qSketchRegion(profileId, false),
                            "path"     : qCreatedBy(pathId, EntityType.EDGE)
                        });
                opDeleteBodies(context, id + ("pegSketches" ~ i), {
                            "entities" : qUnion([qCreatedBy(pathId, EntityType.BODY),
                                                 qCreatedBy(profileId, EntityType.BODY)])
                        });
            }
        }

        // ---------- holder front end ----------
        // Hook: one continuous round rod, a constant circular
        // cross-section swept end to end. The shaft runs straight out
        // at the upsweep angle, then the tip curves gently upward
        // along a circular arc. "Tip rise" sets how high the curved
        // tip climbs; the bend radius follows from that rise.
        if (definition.style == HolderStyle.HOOK ||
            definition.style == HolderStyle.DOUBLE)
        {
            const rodR = definition.rodDia / 2;
            const upA = definition.upAngle;
            const yRoot = yB + 2 * rodR;
            const outZ = plateT + definition.hookOut;  // z reach of the hook tip
            const tipTurn = 60 * degree;               // how far the tip curves up past the shaft
            const bendR = definition.hookUp / (cos(upA) - cos(upA + tipTurn));
            const arcSpanZ = bendR * (sin(upA + tipTurn) - sin(upA));

            if (bendR <= rodR)
            {
                throw regenError("Tip rise is too small for the rod diameter. Increase tip rise or reduce rod diameter.");
            }
            if (arcSpanZ >= outZ)
            {
                throw regenError("Hook is too short for the curved tip. Increase hook length out or reduce tip rise.");
            }
            if (definition.style == HolderStyle.DOUBLE &&
                definition.prongGap <= definition.rodDia)
            {
                throw regenError("Prong spacing must be larger than the rod diameter.");
            }

            var prongXs = [0 * meter];
            if (definition.style == HolderStyle.DOUBLE)
            {
                prongXs = [-definition.prongGap / 2, definition.prongGap / 2];
            }

            for (var p = 0; p < size(prongXs); p += 1)
            {
                const px = prongXs[p];

                // Path sketch lives on the plane x = px, oriented so
                // sketch x = world Z (out of board), sketch y = world Y (up).
                const start = vector(0 * meter, yRoot);
                const shaftLen = (outZ - arcSpanZ) / cos(upA);
                const shaftDir = vector(cos(upA), sin(upA));
                const arcStart = start + shaftLen * shaftDir;
                const arcCenter = arcStart + bendR * vector(-sin(upA), cos(upA));
                const midA = upA + tipTurn / 2;
                const endA = upA + tipTurn;
                const arcMid = arcCenter + bendR * vector(sin(midA), -cos(midA));
                const arcEnd = arcCenter + bendR * vector(sin(endA), -cos(endA));

                const pathId = id + ("hookPath" ~ p);
                var pathSk = newSketchOnPlane(context, pathId, {
                            "sketchPlane" : plane(vector(px, 0 * meter, 0 * meter),
                                                  vector(-1, 0, 0), vector(0, 0, 1))
                        });
                skLineSegment(pathSk, "shaft", { "start" : start, "end" : arcStart });
                skArc(pathSk, "bend", { "start" : arcStart, "mid" : arcMid, "end" : arcEnd });
                skSolve(pathSk);

                const profileId = id + ("hookProfile" ~ p);
                var profileSk = newSketchOnPlane(context, profileId, {
                            "sketchPlane" : plane(vector(px, yRoot, 0 * meter),
                                                  vector(0, sin(upA), cos(upA)),
                                                  vector(1, 0, 0))
                        });
                skCircle(profileSk, "disk", { "center" : vector(0 * meter, 0 * meter), "radius" : rodR });
                skSolve(profileSk);

                opSweep(context, id + ("hook" ~ p), {
                            "profiles" : qSketchRegion(profileId, false),
                            "path"     : qCreatedBy(pathId, EntityType.EDGE)
                        });
                opDeleteBodies(context, id + ("hookSketches" ~ p), {
                            "entities" : qUnion([qCreatedBy(pathId, EntityType.BODY),
                                                 qCreatedBy(profileId, EntityType.BODY)])
                        });
            }
        }

        // Racks size themselves to their contents: if the requested
        // rings/cans/slots don't fit across the backplate, the rack
        // grows symmetrically past it (like commercial can racks)
        // instead of failing to regenerate.
        const rackGap = 6 * millimeter;
        var rackW = width;
        if (definition.style == HolderStyle.RINGS)
        {
            rackW = max(width, definition.ringCount * (2 * definition.ringR + rackGap));
        }
        if (definition.style == HolderStyle.CANS)
        {
            rackW = max(width, definition.canCount * (definition.canDia + rackGap));
        }
        if (definition.style == HolderStyle.SLOTS)
        {
            rackW = max(width, definition.slotCount * (definition.slotW + rackGap));
        }
        const xRL = -rackW / 2;
        const xRR = rackW / 2;

        var shelfBuilt = false;
        if (definition.style == HolderStyle.SHELF ||
            definition.style == HolderStyle.RINGS ||
            definition.style == HolderStyle.SLOTS)
        {
            shelfBuilt = true;
            fCuboid(context, id + "shelf", {
                        "corner1" : vector(xRL, yB, z0),
                        "corner2" : vector(xRR, yB + definition.shelfT, plateT + definition.shelfDepth)
                    });

            if (definition.style == HolderStyle.SHELF)
            {
                fCuboid(context, id + "shelfLip", {
                            "corner1" : vector(xRL, yB, plateT + definition.shelfDepth - definition.shelfT),
                            "corner2" : vector(xRR, yB + definition.shelfLip, plateT + definition.shelfDepth)
                        });
            }
        }

        // Can rack: solid floor at the bottom, ring band at the top.
        // Cans drop through the band holes and stand on the floor
        // (Wall Control style aerosol holder).
        var canBandBuilt = false;
        if (definition.style == HolderStyle.CANS)
        {
            canBandBuilt = true;
            fCuboid(context, id + "canFloor", {
                        "corner1" : vector(xRL, yB, z0),
                        "corner2" : vector(xRR, yB + definition.shelfT, plateT + definition.canDepth)
                    });
            fCuboid(context, id + "canBand", {
                        "corner1" : vector(xRL, yT - definition.shelfT, z0),
                        "corner2" : vector(xRR, yT, plateT + definition.canDepth)
                    });
        }

        // ---------- merge everything solid so far ----------
        opBoolean(context, id + "union", {
                    "tools" : qBodyType(qCreatedBy(id, EntityType.BODY), BodyType.SOLID),
                    "operationType" : BooleanOperationType.UNION
                });

        // ---------- cutters ----------
        var cutters = [];
        const eps = 1 * millimeter;

        if (shelfBuilt && definition.style == HolderStyle.RINGS)
        {
            const n = definition.ringCount;
            const step = rackW / n;
            const zc = plateT + definition.shelfDepth / 2;

            if (definition.ringR * 2 + 2 * millimeter > definition.shelfDepth)
            {
                throw regenError("Ring diameter must fit within the shelf depth. Increase shelf depth or reduce ring radius.");
            }

            for (var i = 0; i < n; i += 1)
            {
                const xc = xRL + step * (i + 0.5);
                const cid = id + ("ring" ~ i);
                fCylinder(context, cid, {
                            "topCenter"    : vector(xc, yB + definition.shelfT + eps, zc),
                            "bottomCenter" : vector(xc, yB - eps, zc),
                            "radius"       : definition.ringR
                        });
                cutters = append(cutters, qCreatedBy(cid, EntityType.BODY));
            }
        }

        if (canBandBuilt)
        {
            const n = definition.canCount;
            const step = rackW / n;
            const canR = definition.canDia / 2;
            const zc = plateT + definition.canDepth / 2;

            if (definition.canDia + 4 * millimeter > definition.canDepth)
            {
                throw regenError("Can diameter must fit within the can rack depth. Increase can rack depth.");
            }

            for (var i = 0; i < n; i += 1)
            {
                const xc = xRL + step * (i + 0.5);
                const cid = id + ("can" ~ i);
                fCylinder(context, cid, {
                            "topCenter"    : vector(xc, yT + eps, zc),
                            "bottomCenter" : vector(xc, yT - definition.shelfT - eps, zc),
                            "radius"       : canR
                        });
                cutters = append(cutters, qCreatedBy(cid, EntityType.BODY));
            }
        }

        if (shelfBuilt && definition.style == HolderStyle.SLOTS)
        {
            const n = definition.slotCount;
            const step = rackW / n;

            if (definition.slotDepth >= definition.shelfDepth)
            {
                throw regenError("Slot depth must be less than shelf depth.");
            }

            for (var i = 0; i < n; i += 1)
            {
                const xc = xRL + step * (i + 0.5);
                const cid = id + ("slot" ~ i);
                fCuboid(context, cid, {
                            "corner1" : vector(xc - definition.slotW / 2, yB - eps,
                                               plateT + definition.shelfDepth - definition.slotDepth),
                            "corner2" : vector(xc + definition.slotW / 2, yB + definition.shelfT + eps,
                                               plateT + definition.shelfDepth + eps)
                        });
                cutters = append(cutters, qCreatedBy(cid, EntityType.BODY));
            }
        }

        if (size(cutters) > 0)
        {
            const cutterQ = qUnion(cutters);
            opBoolean(context, id + "cut", {
                        "tools"   : cutterQ,
                        "targets" : qSubtraction(qCreatedBy(id, EntityType.BODY), cutterQ),
                        "operationType" : BooleanOperationType.SUBTRACTION
                    });
        }

        // ---------- slick edge break ----------
        // Best-effort: a small fillet on every edge softens the whole
        // part. try silent so an unfilletable configuration still
        // regenerates cleanly, just without the rounding.
        if (slick)
        {
            try silent
            {
                opFillet(context, id + "smooth", {
                            "entities" : qCreatedBy(id, EntityType.EDGE),
                            "radius"   : definition.edgeR
                        });
            }
        }

        // ---------- placement ----------
        if (definition.usePlacement)
        {
            const cSys = evMateConnector(context, { "mateConnector" : definition.origin });
            opTransform(context, id + "xform", {
                        "bodies" : qCreatedBy(id, EntityType.BODY),
                        "transform" : transform(cSys)
                    });
        }
    });
